export type SchoolLevel =
  | 'maternelle'
  | 'cp'
  | 'ce1'
  | 'ce2'
  | 'cm1'
  | 'cm2'
  | '6eme'
  | '5eme'
  | '4eme'
  | '3eme'
  | 'lycee';

export type GamePreference =
  | 'attention_visual'
  | 'memory'
  | 'reaction'
  | 'inhibition'
  | 'spatial_3d'
  | 'focus_timer';

export type ObservedDifficulty =
  | 'attention'
  | 'hyperactivite'
  | 'impulsivite'
  | 'memoire_travail'
  | 'planification'
  | 'inhibition_reponse'
  | 'flexibilite_cognitive';

export interface ChildProfile {
  id: string;
  parentId: string;
  firstName: string;
  pseudonym?: string;
  age: number;
  schoolLevel: SchoolLevel;
  gamePreferences: GamePreference[];
  observedDifficulties: ObservedDifficulty[];
  createdAt: Date;
  updatedAt: Date;
  avatarColor: string;
  avatarEmoji: string;
  totalSessions: number;
  averageScore: number;
  lastSessionDate?: Date;
  lastSessionGameId?: string;
  isActive: boolean;
}

export const SCHOOL_LEVEL_LABELS: Record<SchoolLevel, string> = {
  maternelle: 'Maternelle',
  cp: 'CP',
  ce1: 'CE1',
  ce2: 'CE2',
  cm1: 'CM1',
  cm2: 'CM2',
  '6eme': '6ème',
  '5eme': '5ème',
  '4eme': '4ème',
  '3eme': '3ème',
  lycee: 'Lycée',
};

export const DIFFICULTY_LABELS: Record<ObservedDifficulty, string> = {
  attention: 'Attention soutenue',
  hyperactivite: 'Hyperactivité motrice',
  impulsivite: 'Impulsivité',
  memoire_travail: 'Mémoire de travail',
  planification: 'Planification',
  inhibition_reponse: 'Inhibition de réponse',
  flexibilite_cognitive: 'Flexibilité cognitive',
};

export const AVATAR_COLORS = [
  '#4A7CF7', '#7C6FCD', '#4ECDC4', '#FF9F7C',
  '#6DD5A0', '#A78BFA', '#FCD34D', '#F472B6',
];

export const AVATAR_EMOJIS = ['🦁', '🐬', '🦋', '🐉', '🦊', '🐧', '🦄', '🌟'];
