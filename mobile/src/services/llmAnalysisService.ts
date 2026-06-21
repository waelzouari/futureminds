import axios from 'axios';
import { BACKEND_URL } from '../app/config';
import { LlmReport, LlmAnalysisRequest } from '../models';

const BACKEND_TIMEOUT = 30000; // 30s

/**
 * LLM Analysis Service — Envoie les données au backend pour analyse IA.
 * 
 * IMPORTANT SAFETY RULES:
 * - Aucune clé API n'est exposée côté mobile
 * - Les données enfant sont anonymisées avant envoi
 * - Le LLM ne pose JAMAIS de diagnostic médical
 */

/**
 * Anonymise les données enfant avant envoi au LLM.
 * Retire toute information personnellement identifiable.
 */
function anonymizeChildProfile(profile: LlmAnalysisRequest['childProfile']) {
  return {
    // Remplace le prénom par "l'enfant" ou initiale + âge
    firstName: `Enfant (${profile.age} ans)`,
    age: profile.age,
    schoolLevel: profile.schoolLevel,
    observedDifficulties: profile.observedDifficulties,
    totalSessions: profile.totalSessions,
  };
}

/**
 * Génère un rapport LLM mock pour le mode démo (sans backend).
 */
function generateMockReport(request: LlmAnalysisRequest): LlmReport {
  const { sessionData, computedMetrics } = request;
  const isGoodSession = sessionData.score >= 65;
  const hasProgress = (computedMetrics.trend === 'improving');

  return {
    id: `report_mock_${Date.now()}`,
    sessionId: `session_${Date.now()}`,
    childId: 'mock',
    generatedAt: new Date().toISOString(),
    model_used: 'mock_demo',

    session_summary: isGoodSession
      ? `Cette session montre de bons résultats dans l'ensemble. On observe une attention soutenue avec ${sessionData.correctAnswers} réponses correctes. Le taux de concentration de ${Math.round(computedMetrics.focusConsistency)}% peut indiquer une bonne capacité de maintien de l'attention.`
      : `Cette session présente quelques difficultés qui peuvent indiquer une attention variable. Avec ${sessionData.numberOfErrors} erreurs observées, des séances régulières pourraient aider à renforcer la concentration.`,

    strengths: [
      sessionData.score >= 70 ? 'Bonne précision dans les réponses' : 'Effort et persévérance observés',
      sessionData.reactionTime < 1.5 ? 'Vitesse de réaction satisfaisante' : 'Participation active tout au long de la session',
      sessionData.levelCompleted ? 'Niveau complété avec succès' : 'Bonne gestion des difficultés rencontrées',
    ],

    observed_difficulties: [
      ...(sessionData.impulsiveClicks > 5 ? ["On observe une tendance à l'impulsivité dans les réponses — des exercices de pause avant action pourraient être utiles."] : []),
      ...(sessionData.missedTargets > 5 ? ["Certaines cibles ont été manquées, ce qui peut indiquer une attention sélective à renforcer."] : []),
      ...(sessionData.numberOfErrors > 8 ? ["Le taux d'erreurs peut indiquer une difficulté à maintenir la concentration sur la durée."] : []),
    ].filter(Boolean),

    motivation_message_for_child: isGoodSession
      ? hasProgress
        ? "Tu progresses vraiment bien ! Chaque session t'aide à renforcer ta concentration. Continue comme ça, tu es sur la bonne voie ! 🌟"
        : "Très bon effort aujourd'hui ! Ta concentration et ton attention sont remarquables. Bravo pour ton travail ! ⭐"
      : "Bravo pour ton effort et ta persévérance ! Chaque session est une opportunité d'apprendre. Tu t'améliores à chaque fois, continue calmement ! 💪",

    recommendations_for_parent: [
      "Ces observations doivent être discutées avec un professionnel de santé ou un éducateur spécialisé pour une évaluation complète.",
      sessionData.score < 60
        ? "Il peut être utile de proposer des sessions plus courtes et fréquentes pour maintenir l'engagement."
        : "Continuer avec des sessions régulières pour consolider les progrès observés.",
      "Encourager l'enfant verbalement après chaque session, indépendamment des résultats.",
      "Les résultats peuvent indiquer que des moments de pause entre les sessions seraient bénéfiques.",
    ],

    recommended_next_games: sessionData.score < 60
      ? ['attention_visual_01', 'focus_timer_01']
      : ['memory_01', 'inhibition_01'],

    recommended_difficulty_level: sessionData.score >= 80 && sessionData.levelCompleted
      ? `Niveau ${Math.min(sessionData.difficultyLevel + 1, 5)} recommandé`
      : sessionData.score < 50
        ? `Niveau ${Math.max(sessionData.difficultyLevel - 1, 1)} recommandé pour consolider les bases`
        : `Niveau ${sessionData.difficultyLevel} actuel adapté — continuer à ce niveau`,
  };
}

async function analyzSession(
  request: LlmAnalysisRequest,
  childId: string,
  sessionId: string
): Promise<LlmReport> {
  // Anonymiser avant envoi
  const anonymizedRequest = {
    ...request,
    childProfile: anonymizeChildProfile(request.childProfile),
  };

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/llm/analyze`,
      { ...anonymizedRequest, sessionId },
      {
        timeout: BACKEND_TIMEOUT,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return {
      ...response.data,
      id: `report_${Date.now()}`,
      sessionId,
      childId,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    // En cas d'erreur réseau ou backend indisponible → rapport mock
    console.warn('[LLM] Backend indisponible, génération du rapport en mode démo:', error);
    const mockReport = generateMockReport(request);
    return { ...mockReport, sessionId, childId };
  }
}

export const llmAnalysisService = {
  analyzSession,
};
