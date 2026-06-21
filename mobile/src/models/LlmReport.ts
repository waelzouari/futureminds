export interface LlmReport {
  id: string;
  sessionId: string;
  childId: string;
  generatedAt: string;

  session_summary: string;
  strengths: string[];
  observed_difficulties: string[];
  motivation_message_for_child: string;
  recommendations_for_parent: string[];
  recommended_next_games: string[];
  recommended_difficulty_level: string;

  // Meta
  model_used: string;
  processing_time_ms?: number;
}

export interface LlmAnalysisRequest {
  childProfile: {
    firstName: string;
    age: number;
    schoolLevel: string;
    observedDifficulties: string[];
    totalSessions: number;
  };
  sessionData: {
    gameId: string;
    score: number;
    reactionTime: number;
    numberOfErrors: number;
    correctAnswers: number;
    missedTargets: number;
    impulsiveClicks: number;
    focusDuration: number;
    levelCompleted: boolean;
    difficultyLevel: number;
  };
  computedMetrics: {
    attentionScore: number;
    impulsivityScore: number;
    errorRate: number;
    reactionScore: number;
    focusConsistency: number;
    trend: string;
  };
  recentHistory: Array<{
    gameId: string;
    score: number;
    timestamp: string;
  }>;
}
