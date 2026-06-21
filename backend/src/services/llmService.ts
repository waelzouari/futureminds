import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// OpenRouter model choice
const MODEL = 'google/gemini-2.5-flash';

// Fallback response in case API key is not defined or request fails
const createFallbackResponse = (childName: string, gameId: string, score: number) => {
  return {
    session_summary: `L'enfant a réalisé une session sur le jeu ${gameId.replace('_', ' ')} avec un score de ${score}%. Son attention globale semble stable.`,
    strengths: [
      "Persévérance démontrée tout au long de l'exercice.",
      score >= 70 ? "Bonne précision générale lors des phases actives." : "Participation active.",
    ],
    observed_difficulties: [
      score < 60 ? "De légères baisses d'attention ont été remarquées par moments." : "Aucune difficulté majeure constatée.",
    ],
    motivation_message_for_child: "Super travail ! Tu t'es bien concentré et tu as fait de ton mieux. Continue comme ça ! 🌟",
    recommendations_for_parent: [
      "Féliciter l'enfant pour sa concentration régulière.",
      "Proposer des sessions de jeu courtes (5 à 10 minutes) espacées de pauses actives.",
      "Cette observation ne remplace pas un diagnostic professionnel de santé.",
    ],
    recommended_next_games: [
      gameId === 'attention_visual_01' ? 'memory_01' : 'attention_visual_01',
    ],
    recommended_difficulty_level: "Conserver le niveau actuel pour stabiliser les compétences.",
    model_used: 'fallback-offline-rule',
  };
};

export const generateLlmReport = async (analysisData: any): Promise<any> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const { childProfile, sessionData, computedMetrics } = analysisData;
  const childName = childProfile?.firstName || "l'enfant";

  if (!apiKey) {
    console.warn('[LLM Service] OpenRouter API key not set, using mock fallback report.');
    return createFallbackResponse(childName, sessionData.gameId, sessionData.score);
  }

  try {
    // Strict System prompt to guide behavior and enforce medical disclaimer
    const systemPrompt = `
      Tu es un expert en psychologie cognitive de l'enfant et en éducation spécialisée pour l'application FutureMinds.
      Ton rôle est d'analyser les statistiques d'un mini-jeu 2D/3D joué par un enfant pour fournir un rapport éducatif constructif aux parents.
      
      CONSIGNES CRITIQUES DE SÉCURITÉ :
      1. Ne pose JAMAIS de diagnostic médical (ex: "Cet enfant est TDAH", "Il a un trouble de l'attention").
      2. Ne prescris aucun traitement ni démarche médicale.
      3. Tes conseils doivent être purement éducatifs, comportementaux, ludiques et bienveillants.
      4. Rappelle ou assume que cette analyse ne remplace pas l'avis d'un professionnel de santé.
      5. Ne mentionne pas de termes médicaux ou cliniques anxiogènes. Parle de "tendances observées" ou "variabilité de l'attention".
      
      Format de sortie : Tu DOIS répondre uniquement par un objet JSON valide contenant exactement les clés suivantes :
      {
        "session_summary": "un résumé textuel de la session en français (3-4 phrases)",
        "strengths": ["liste", "de 2 ou 3", "forces cognitives observées durant le jeu"],
        "observed_difficulties": ["liste", "de points de vigilance ou de légères difficultés éducatives à travailler"],
        "motivation_message_for_child": "un court message chaleureux et encourageant destiné directement à l'enfant (avec emojis)",
        "recommendations_for_parent": ["3 ou 4 conseils pratiques de vie quotidienne, d'exercices d'attention à la maison"],
        "recommended_next_games": ["les IDs de 1 ou 2 jeux recommandés pour la suite parmi : attention_visual_01, memory_01, reaction_01, inhibition_01, spatial_3d_01, focus_timer_01"],
        "recommended_difficulty_level": "Recommandation de niveau de difficulté de 1 à 5 (ex: 'Niveau 3 recommandé pour consolider les bases')"
      }
    `;

    const userPrompt = `
      Voici les données anonymisées de la session de jeu à analyser :
      
      Profil de l'enfant :
      - Prénom anonymisé : ${childName}
      - Âge : ${childProfile.age} ans
      - Niveau scolaire : ${childProfile.schoolLevel}
      - Difficultés préalablement déclarées par le parent : ${childProfile.observedDifficulties?.join(', ') || 'Aucune renseignée'}
      
      Données de la partie :
      - Jeu : ${sessionData.gameId}
      - Score de performance (0-100) : ${sessionData.score}
      - Temps de réaction moyen : ${sessionData.reactionTime}s
      - Nombre d'erreurs : ${sessionData.numberOfErrors}
      - Réponses correctes : ${sessionData.correctAnswers}
      - Cibles manquées : ${sessionData.missedTargets}
      - Clics impulsifs/précipités : ${sessionData.impulsiveClicks}
      - Durée de concentration stable : ${sessionData.focusDuration}s
      - Niveau terminé avec succès : ${sessionData.levelCompleted ? 'Oui' : 'Non'}
      - Niveau de difficulté actuel : ${sessionData.difficultyLevel}/5
      
      Métriques calculées :
      - Attention soutenue : ${computedMetrics.attentionScore}%
      - Taux d'impulsivité : ${computedMetrics.impulsivityScore}%
      - Régularité du focus : ${computedMetrics.focusConsistency}%
      
      Analyse ces données et renvoie le JSON structuré demandé en français.
    `;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const textResponse = response.data?.choices?.[0]?.message?.content;
    if (!textResponse) {
      throw new Error("Réponse vide de l'API OpenRouter");
    }

    const parsedResponse = JSON.parse(textResponse);
    return {
      ...parsedResponse,
      model_used: MODEL,
    };

  } catch (error: any) {
    console.error('[OpenRouter API Error] Falling back to rule-based generation:', error?.response?.data || error.message);
    return createFallbackResponse(childName, sessionData.gameId, sessionData.score);
  }
};

