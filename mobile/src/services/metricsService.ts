import { GameSession, Metrics } from '../models';

/**
 * MetricsService — Calcule les métriques comportementales à partir des données de session.
 * 
 * IMPORTANT : Ces métriques sont des indicateurs éducatifs uniquement.
 * Elles ne constituent pas un diagnostic médical.
 */

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

/**
 * Calcule le score d'attention soutenue.
 * Mesure la capacité à rester focalisé et à identifier les bonnes cibles.
 * attentionScore = correctAnswers / (correctAnswers + missedTargets) * 100
 */
export function computeAttentionScore(session: GameSession): number {
  const total = session.correctAnswers + session.missedTargets;
  if (total === 0) return 0;
  return clamp((session.correctAnswers / total) * 100, 0, 100);
}

/**
 * Calcule le score d'impulsivité.
 * Un score ÉLEVÉ indique plus d'impulsivité (clics impulsifs nombreux).
 * Note UI : afficher ce score inversé (100 - impulsivityScore) pour le positif.
 * impulsivityScore = impulsiveClicks / (correctAnswers + numberOfErrors + impulsiveClicks) * 100
 */
export function computeImpulsivityScore(session: GameSession): number {
  const totalAttempts = session.correctAnswers + session.numberOfErrors + session.impulsiveClicks;
  if (totalAttempts === 0) return 0;
  return clamp((session.impulsiveClicks / totalAttempts) * 100, 0, 100);
}

/**
 * Calcule le taux d'erreur.
 * errorRate = numberOfErrors / (correctAnswers + numberOfErrors) * 100
 */
export function computeErrorRate(session: GameSession): number {
  const totalAttempts = session.correctAnswers + session.numberOfErrors;
  if (totalAttempts === 0) return 0;
  return clamp((session.numberOfErrors / totalAttempts) * 100, 0, 100);
}

/**
 * Calcule un score de vitesse de réaction normalisé.
 * reactionTime en secondes : 0.5s (excellent) → 3.0s (lent)
 * Score 100 = très rapide, Score 0 = très lent
 */
export function computeReactionScore(reactionTime: number): number {
  // Normalize: 0.5s → 100, 3.0s → 0
  const score = normalize(reactionTime, 3.0, 0.5);
  return clamp(score, 0, 100);
}

/**
 * Calcule la consistance de la concentration.
 * Mesure si l'enfant est resté engagé pendant toute la session.
 * focusConsistency = focusDuration / expectedDuration * 100
 */
export function computeFocusConsistency(session: GameSession): number {
  // On estime une durée de jeu attendue de 3 minutes (180s) pour niveau 1-2
  // qui augmente avec la difficulté
  const expectedDuration = 120 + session.difficultyLevel * 30;
  return clamp((session.focusDuration / expectedDuration) * 100, 0, 100);
}

/**
 * Calcule un score de mémoire de travail basé sur le jeu mémoire.
 * Pour les autres jeux, estimation à partir des correctAnswers et missedTargets.
 */
export function computeMemoryScore(session: GameSession): number {
  // Base: score normalisé + bonus si pas d'erreurs
  const baseScore = normalize(session.score, 0, 100);
  const errorPenalty = Math.min(session.numberOfErrors * 3, 20);
  return clamp(baseScore - errorPenalty, 0, 100);
}

/**
 * Calcule la tendance par rapport aux sessions précédentes.
 */
export function computeTrend(
  currentScore: number,
  previousSessions: GameSession[]
): { trend: Metrics['trend']; progressionVsPreviousSession: number | null } {
  if (previousSessions.length < 2) {
    return { trend: 'insufficient_data', progressionVsPreviousSession: null };
  }

  const recentScores = previousSessions
    .slice(0, 5)
    .map(s => s.score);

  if (recentScores.length < 2) {
    return { trend: 'insufficient_data', progressionVsPreviousSession: null };
  }

  const previousAvg = recentScores.slice(1).reduce((a, b) => a + b, 0) / (recentScores.length - 1);
  const progressionVsPreviousSession = ((currentScore - recentScores[1]) / Math.max(recentScores[1], 1)) * 100;

  let trend: Metrics['trend'];
  const avgWithCurrent = (currentScore + previousAvg) / 2;
  if (avgWithCurrent > previousAvg + 5) trend = 'improving';
  else if (avgWithCurrent < previousAvg - 5) trend = 'declining';
  else trend = 'stable';

  return { trend, progressionVsPreviousSession };
}

/**
 * Fonction principale : calcule toutes les métriques pour une session.
 */
export function computeMetrics(
  session: GameSession,
  previousSessions: GameSession[] = []
): Metrics {
  const attentionScore = computeAttentionScore(session);
  const impulsivityScore = computeImpulsivityScore(session);
  const errorRate = computeErrorRate(session);
  const reactionScore = computeReactionScore(session.reactionTime);
  const focusConsistency = computeFocusConsistency(session);
  const memoryScore = computeMemoryScore(session);
  const { trend, progressionVsPreviousSession } = computeTrend(session.score, [session, ...previousSessions]);

  return {
    sessionId: session.sessionId,
    childId: session.childId,
    computedAt: new Date().toISOString(),
    attentionScore: Math.round(attentionScore),
    impulsivityScore: Math.round(impulsivityScore),
    memoryScore: Math.round(memoryScore),
    reactionScore: Math.round(reactionScore),
    errorRate: Math.round(errorRate),
    focusConsistency: Math.round(focusConsistency),
    progressionVsPreviousSession: progressionVsPreviousSession
      ? Math.round(progressionVsPreviousSession)
      : null,
    trend,
  };
}

export const metricsService = {
  computeMetrics,
  computeAttentionScore,
  computeImpulsivityScore,
  computeErrorRate,
  computeReactionScore,
  computeFocusConsistency,
  computeMemoryScore,
  computeTrend,
};
