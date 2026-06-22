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
  const { sessionData, computedMetrics, childProfile } = request;
  const score = sessionData.score ?? 0;
  const errors = sessionData.numberOfErrors ?? 0;
  const correct = sessionData.correctAnswers ?? 0;
  const impulsive = sessionData.impulsiveClicks ?? 0;
  const missed = sessionData.missedTargets ?? 0;
  const rt = sessionData.reactionTime ?? 2;
  const gameId = sessionData.gameId ?? '';
  const difficulty = sessionData.difficultyLevel ?? 1;
  const age = childProfile.age ?? 7;
  const focus = Math.round(computedMetrics.focusConsistency ?? 50);
  const trend = computedMetrics.trend ?? 'stable';

  // ── Catégories de performance ──────────────────────────────────────────
  const isExcellent = score >= 85;
  const isGood      = score >= 65 && score < 85;
  const isAverage   = score >= 45 && score < 65;
  // isWeak          = score < 45

  // ── Textes spécifiques au jeu ──────────────────────────────────────────
  const gameLabel: Record<string, string> = {
    reaction_01:         'de réaction rapide',
    attention_visual_01: 'd\'attention visuelle',
    memory_01:           'de mémoire de travail',
    inhibition_01:       'de contrôle inhibitoire',
    spatial_3d_01:       'de raisonnement spatial',
    focus_timer_01:      'de concentration soutenue',
  };
  const gLabel = gameLabel[gameId] ?? 'cognitif';

  // ── Résumé personnalisé ────────────────────────────────────────────────
  let session_summary: string;
  if (isExcellent) {
    session_summary = `Excellente session ${gLabel} pour cet enfant de ${age} ans ! `
      + `Avec ${correct} bonnes réponses et un score de ${score}%, `
      + `la session démontre une capacité de ${gLabel.replace('de ', '')} bien au-dessus de la moyenne pour ce groupe d'âge. `
      + `Le taux de cohérence de focus à ${focus}% confirme une attention stable tout au long de l'exercice.`
      + (trend === 'improving' ? ' Une progression notable est observée par rapport aux sessions précédentes.' : '');
  } else if (isGood) {
    session_summary = `Bonne performance lors de ce jeu ${gLabel}. `
      + `L'enfant a obtenu ${correct} bonnes réponses pour un score de ${score}% au niveau ${difficulty}. `
      + (errors > 3 ? `On note ${errors} erreurs qui suggèrent quelques moments d'inattention ponctuels. ` : '')
      + `Avec de la régularité, les compétences ${gLabel.replace('de ', '')} peuvent encore progresser.`;
  } else if (isAverage) {
    session_summary = `Session ${gLabel} dans la moyenne. `
      + `Le score de ${score}% avec ${errors} erreurs indique que certaines composantes `
      + `${gLabel === 'de réaction rapide' ? 'de vitesse et précision' : 'de concentration et mémorisation'} `
      + `peuvent bénéficier d'un entraînement régulier. `
      + `Des sessions plus courtes et répétées pourraient améliorer la constance.`;
  } else {
    session_summary = `Cette session ${gLabel} révèle des difficultés notables. `
      + `Avec ${errors} erreurs et ${missed} cibles manquées, `
      + `il semble que la tâche représente un défi important à ce niveau de difficulté. `
      + `Il est recommandé d'abaisser le niveau et de travailler par petites étapes progressives.`;
  }

  // ── Forces ────────────────────────────────────────────────────────────
  const strengths: string[] = [];
  if (correct >= 10) strengths.push(`Nombre de bonnes réponses élevé (${correct}) — bonne maîtrise de la tâche`);
  else if (correct >= 5) strengths.push(`Réponses correctes régulières (${correct}) malgré la difficulté`);
  if (rt < 1.2) strengths.push('Temps de réaction très rapide — traitement de l\'information efficace');
  else if (rt < 2.0) strengths.push('Temps de réaction dans la norme pour l\'âge');
  if (impulsive <= 2) strengths.push('Contrôle inhibitoire bien développé — peu de réponses impulsives');
  if (focus >= 70) strengths.push(`Concentration soutenue à ${focus}% — attention focalisée remarquable`);
  if (trend === 'improving') strengths.push('Progression visible par rapport aux sessions précédentes');
  if (strengths.length === 0) strengths.push('Engagement continu dans la tâche malgré les difficultés rencontrées');

  // ── Difficultés ───────────────────────────────────────────────────────
  const observed_difficulties: string[] = [];
  if (impulsive > 5) observed_difficulties.push(`Tendance à l'impulsivité détectée (${impulsive} clics prématurés) — exercices de pause-action recommandés`);
  if (missed > 5) observed_difficulties.push(`${missed} cibles manquées — peut indiquer une attention sélective à renforcer`);
  if (errors > 8) observed_difficulties.push(`Taux d'erreurs élevé (${errors}) — la durée de concentration sur le long terme mérite attention`);
  if (rt > 2.5) observed_difficulties.push('Temps de réaction lent — des exercices de traitement rapide de l\'information pourraient aider');
  if (focus < 40) observed_difficulties.push(`Faible cohérence de focus (${focus}%) — des pauses régulières entre les sessions sont conseillées`);

  // ── Message enfant ────────────────────────────────────────────────────
  const childMessages = isExcellent
    ? ['Super travail ! Tu as tout donné et ça se voit ! Continue comme ça, tu es formidable ! 🌟', 'Tu es une vraie star ! Ton cerveau a travaillé à toute vitesse aujourd\'hui ! 🏆']
    : isGood
    ? ['Très bien joué ! Chaque session te rend encore plus fort(e). Tu progresses vraiment ! ⭐', 'Beau travail ! Tu as fait de ton mieux et c\'est ce qui compte ! Continue 💪']
    : isAverage
    ? ['Tu t\'en sors bien ! Avec un peu plus de pratique, tu vas devenir champion(ne) ! 😊', 'Bravo d\'avoir essayé ! Chaque essai t\'aide à progresser. Tu y arriveras ! 🎯']
    : ['Bien essayé ! Ce n\'est pas facile mais tu n\'as pas abandonné. C\'est déjà super ! 💫', 'Le plus important c\'est de continuer ! Chaque partie te rend plus fort(e) ! 🌈'];
  const motivation_message_for_child = childMessages[Math.floor(Math.random() * childMessages.length)];

  // ── Recommandations parent ────────────────────────────────────────────
  const recommendations_for_parent: string[] = [
    'Ces observations sont à caractère éducatif — consulter un professionnel de santé pour toute interprétation clinique.',
  ];
  if (!isExcellent && !isGood) {
    recommendations_for_parent.push(`Proposer des sessions plus courtes (5-10 min) au niveau ${Math.max(difficulty - 1, 1)} pour construire la confiance progressivement.`);
  } else {
    recommendations_for_parent.push(`Maintenir des sessions régulières au niveau ${difficulty} — la régularité est la clé des progrès observés.`);
  }
  if (impulsive > 3) recommendations_for_parent.push('Travailler avec l\'enfant sur la technique "stop-and-think" avant de répondre.');
  if (score >= 80) recommendations_for_parent.push(`Envisager d\'augmenter progressivement le niveau de difficulté (niveau ${Math.min(difficulty + 1, 5)}) pour maintenir l\'engagement.`);
  recommendations_for_parent.push('Féliciter l\'enfant verbalement pour ses efforts, indépendamment du score obtenu.');

  // ── Prochains jeux recommandés ────────────────────────────────────────
  const nextGames = score < 60
    ? ['attention_visual_01', 'focus_timer_01']
    : score >= 80
    ? ['memory_01', 'inhibition_01', 'spatial_3d_01']
    : ['reaction_01', 'memory_01'];

  // ── Niveau recommandé ─────────────────────────────────────────────────
  const recommended_difficulty_level = score >= 80 && correct >= 10
    ? `Niveau ${Math.min(difficulty + 1, 5)} recommandé — l'enfant est prêt pour plus de challenge`
    : score < 50
    ? `Niveau ${Math.max(difficulty - 1, 1)} recommandé — consolider les bases avant de progresser`
    : `Niveau ${difficulty} actuel adapté — continuer à ce niveau pour renforcer les acquis`;

  return {
    id: `report_mock_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    sessionId: sessionData.sessionId ?? `session_${Date.now()}`,
    childId: 'mock',
    generatedAt: new Date().toISOString(),
    model_used: 'futureminds_demo_v2',
    session_summary,
    strengths,
    observed_difficulties,
    motivation_message_for_child,
    recommendations_for_parent,
    recommended_next_games: nextGames,
    recommended_difficulty_level,
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
