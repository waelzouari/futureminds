export const Colors = {
  // Primary — Bleu doux health-tech
  primary: '#4A7CF7',
  primaryLight: '#EEF3FF',
  primaryDark: '#2E5FD9',

  // Secondary — Violet calme
  secondary: '#7C6FCD',
  secondaryLight: '#F0EEFB',
  secondaryDark: '#5B50A8',

  // Accent — Vert aqua apaisant
  accent: '#4ECDC4',
  accentLight: '#EDFAF9',
  accentDark: '#35A89F',

  // Neutrals
  background: '#F6F8FE',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E8ECF4',
  borderLight: '#F0F3FA',

  // Text
  textPrimary: '#1A1D3B',
  textSecondary: '#5C6079',
  textTertiary: '#9CA3B8',
  textInverse: '#FFFFFF',

  // Semantic
  success: '#34C78A',
  successLight: '#EDFAF3',
  warning: '#F59E0B',
  warningLight: '#FEF9EC',
  error: '#EF4444',
  errorLight: '#FEF0F0',
  info: '#3B82F6',
  infoLight: '#EFF6FF',

  // Gradients
  gradientPrimary: ['#4A7CF7', '#7C6FCD'] as [string, string],
  gradientSecondary: ['#7C6FCD', '#4ECDC4'] as [string, string],
  gradientAccent: ['#4ECDC4', '#4A7CF7'] as [string, string],
  gradientWarm: ['#F59E0B', '#EF4444'] as [string, string],
  gradientSuccess: ['#34C78A', '#4ECDC4'] as [string, string],

  // Child-specific — Interface enfant plus chaleureuse
  childPrimary: '#5B8DEF',
  childAccent: '#FF9F7C',
  childGreen: '#6DD5A0',
  childPurple: '#A78BFA',
  childYellow: '#FCD34D',

  // Transparent
  overlay: 'rgba(26, 29, 59, 0.5)',
  overlayLight: 'rgba(26, 29, 59, 0.1)',
  shimmer: 'rgba(255,255,255,0.6)',
} as const;

export type ColorKey = keyof typeof Colors;
