import { TextStyle } from 'react-native';

export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 38,
  '6xl': 48,
} as const;

export const LineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.65,
  loose: 2,
} as const;

export const LetterSpacing = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.5,
} as const;

// Pre-built text styles
export const TextStyles = {
  h1: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['4xl'],
    letterSpacing: LetterSpacing.tighter,
    lineHeight: FontSize['4xl'] * LineHeight.tight,
  } as TextStyle,

  h2: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['3xl'],
    letterSpacing: LetterSpacing.tight,
    lineHeight: FontSize['3xl'] * LineHeight.tight,
  } as TextStyle,

  h3: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    letterSpacing: LetterSpacing.tight,
    lineHeight: FontSize['2xl'] * LineHeight.snug,
  } as TextStyle,

  h4: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xl,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.xl * LineHeight.snug,
  } as TextStyle,

  h5: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.lg,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.lg * LineHeight.normal,
  } as TextStyle,

  bodyLarge: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.md * LineHeight.relaxed,
  } as TextStyle,

  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.base * LineHeight.normal,
  } as TextStyle,

  bodyMedium: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.base * LineHeight.normal,
  } as TextStyle,

  caption: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    letterSpacing: LetterSpacing.wide,
    lineHeight: FontSize.sm * LineHeight.normal,
  } as TextStyle,

  captionMedium: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    letterSpacing: LetterSpacing.wide,
  } as TextStyle,

  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    letterSpacing: LetterSpacing.wider,
    textTransform: 'uppercase' as const,
  } as TextStyle,

  button: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    letterSpacing: LetterSpacing.wide,
  } as TextStyle,

  buttonSmall: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    letterSpacing: LetterSpacing.wide,
  } as TextStyle,
} as const;
