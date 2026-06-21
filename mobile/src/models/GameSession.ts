export type GameId =
  | 'attention_visual_01'
  | 'memory_01'
  | 'reaction_01'
  | 'inhibition_01'
  | 'spatial_3d_01'
  | 'focus_timer_01';

export interface GameSession {
  id: string;
  gameId: GameId | string;
  childId: string;
  sessionId: string;
  score: number;               // 0-100
  reactionTime: number;        // secondes (avg)
  numberOfErrors: number;
  correctAnswers: number;
  missedTargets: number;
  impulsiveClicks: number;
  focusDuration: number;       // secondes
  levelCompleted: boolean;
  difficultyLevel: number;     // 1-5
  timestamp: string;           // ISO 8601
  durationSeconds: number;
  llmReportId?: string;
}

export interface UnityGameResult {
  gameId: string;
  childId: string;
  sessionId: string;
  score: number;
  reactionTime: number;
  numberOfErrors: number;
  correctAnswers: number;
  missedTargets: number;
  impulsiveClicks: number;
  focusDuration: number;
  levelCompleted: boolean;
  difficultyLevel: number;
  timestamp: string;
}

export const GAME_INFO: Record<string, {
  id: string;
  title: string;
  description: string;
  category: string;
  targetSkill: string;
  minAge: number;
  maxAge: number;
  icon: string;
  color: string;
  gradientColors: [string, string];
}> = {
  attention_visual_01: {
    id: 'attention_visual_01',
    title: 'Attention Visuelle',
    description: 'Suis les objets qui bougent et identifie les bonnes cibles.',
    category: 'Attention',
    targetSkill: 'Attention soutenue',
    minAge: 5,
    maxAge: 16,
    icon: '👁',
    color: '#4A7CF7',
    gradientColors: ['#4A7CF7', '#7C6FCD'],
  },
  memory_01: {
    id: 'memory_01',
    title: 'Mémoire des Formes',
    description: 'Mémorise et reproduis les séquences de formes et couleurs.',
    category: 'Mémoire',
    targetSkill: 'Mémoire de travail',
    minAge: 5,
    maxAge: 16,
    icon: '🧩',
    color: '#7C6FCD',
    gradientColors: ['#7C6FCD', '#A78BFA'],
  },
  reaction_01: {
    id: 'reaction_01',
    title: 'Réaction Rapide',
    description: 'Appuie au bon moment, au bon endroit.',
    category: 'Réaction',
    targetSkill: 'Vitesse de traitement',
    minAge: 6,
    maxAge: 16,
    icon: '⚡',
    color: '#F59E0B',
    gradientColors: ['#F59E0B', '#EF4444'],
  },
  inhibition_01: {
    id: 'inhibition_01',
    title: 'Stop & Go',
    description: 'Appuie sur GO, mais retiens-toi sur STOP.',
    category: 'Inhibition',
    targetSkill: 'Contrôle inhibiteur',
    minAge: 6,
    maxAge: 16,
    icon: '🚦',
    color: '#34C78A',
    gradientColors: ['#34C78A', '#4ECDC4'],
  },
  spatial_3d_01: {
    id: 'spatial_3d_01',
    title: 'Parcours 3D',
    description: 'Navigue dans un espace 3D avec des distractions.',
    category: 'Spatial',
    targetSkill: 'Attention sélective',
    minAge: 7,
    maxAge: 16,
    icon: '🌐',
    color: '#4ECDC4',
    gradientColors: ['#4ECDC4', '#4A7CF7'],
  },
  focus_timer_01: {
    id: 'focus_timer_01',
    title: 'Concentration Zen',
    description: 'Reste concentré et calme le plus longtemps possible.',
    category: 'Concentration',
    targetSkill: 'Attention soutenue',
    minAge: 5,
    maxAge: 16,
    icon: '🎯',
    color: '#A78BFA',
    gradientColors: ['#A78BFA', '#7C6FCD'],
  },
};
