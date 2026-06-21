import { ViewStyle } from 'react-native';

export const Shadows = {
  none: {} as ViewStyle,

  sm: {
    shadowColor: '#4A7CF7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,

  base: {
    shadowColor: '#4A7CF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  } as ViewStyle,

  md: {
    shadowColor: '#1A1D3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  } as ViewStyle,

  lg: {
    shadowColor: '#1A1D3B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  } as ViewStyle,

  xl: {
    shadowColor: '#1A1D3B',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 16,
  } as ViewStyle,

  primary: {
    shadowColor: '#4A7CF7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  } as ViewStyle,

  secondary: {
    shadowColor: '#7C6FCD',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  } as ViewStyle,
} as const;
