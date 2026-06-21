export interface Metrics {
  sessionId: string;
  childId: string;
  computedAt: string;

  // Core metrics (0-100)
  attentionScore: number;
  impulsivityScore: number;
  memoryScore: number;
  reactionScore: number;
  errorRate: number;
  focusConsistency: number;

  // Progression
  progressionVsPreviousSession: number | null; // % change
  trend: 'improving' | 'stable' | 'declining' | 'insufficient_data';

  // Aggregates for dashboard
  weeklyAvgAttention?: number;
  weeklyAvgReaction?: number;
  weeklyTotalSessions?: number;
}

export interface ChildAggregateMetrics {
  childId: string;
  totalSessions: number;
  averageScore: number;
  averageAttentionScore: number;
  averageImpulsivityScore: number;
  averageMemoryScore: number;
  averageReactionScore: number;
  averageFocusDuration: number;
  bestScore: number;
  recentTrend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
  lastUpdated: string;
}
