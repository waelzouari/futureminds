import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useChildAuthStore } from '../../store';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius, Shadows } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ChildLogin'>;
};

const AVATARS = ['🦁', '🐬', '🦋', '🐉', '🦊', '🐧', '🦄', '🌟'];

export const ChildLoginScreen: React.FC<Props> = ({ navigation }) => {
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { signInAsChild, isLoading, error, clearError } = useChildAuthStore();

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const avatarBounce = useRef(new Animated.Value(1)).current;

  // Random avatar shown while typing
  const [currentAvatar] = useState(AVATARS[Math.floor(Math.random() * AVATARS.length)]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (code.length > 0) {
      Animated.sequence([
        Animated.timing(avatarBounce, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.timing(avatarBounce, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  }, [code]);

  const shakeError = () => {
    Vibration.vibrate(200);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleDigit = (digit: string) => {
    if (code.length >= 4) return;
    clearError();
    setLocalError(null);
    setCode(prev => prev + digit);
  };

  const handleDelete = () => {
    clearError();
    setLocalError(null);
    setCode(prev => prev.slice(0, -1));
  };

  const handleLogin = async () => {
    if (code.length !== 4) return;
    try {
      await signInAsChild(code);
      // Navigation is handled by RootNavigator reacting to childSession change
    } catch {
      shakeError();
    }
  };

  const displayError = localError || error;

  const KEYS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', '⌫'],
  ];

  return (
    <LinearGradient
      colors={['#1A1F3A', '#2D1B69', '#1A1F3A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {/* Decorative shapes */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar & Title */}
        <View style={styles.heroSection}>
          <Animated.View
            style={[styles.avatarContainer, { transform: [{ scale: avatarBounce }] }]}
          >
            <Text style={styles.avatarEmoji}>{currentAvatar}</Text>
          </Animated.View>
          <Text style={styles.title}>Espace Enfant</Text>
          <Text style={styles.subtitle}>Entrez votre code secret à 4 chiffres</Text>
        </View>

        {/* Code dots */}
        <Animated.View
          style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}
        >
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < code.length ? styles.dotFilled : styles.dotEmpty,
              ]}
            >
              {i < code.length && (
                <View style={styles.dotInner} />
              )}
            </View>
          ))}
        </Animated.View>

        {/* Error message */}
        {displayError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>😟 {displayError}</Text>
          </View>
        )}

        {/* Numeric keypad */}
        <View style={styles.keypad}>
          {KEYS.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.keyRow}>
              {row.map((key, colIdx) => {
                if (key === '') {
                  return <View key={colIdx} style={styles.keyPlaceholder} />;
                }
                const isDelete = key === '⌫';
                return (
                  <TouchableOpacity
                    key={colIdx}
                    style={[styles.key, isDelete && styles.keyDelete]}
                    onPress={() => isDelete ? handleDelete() : handleDigit(key)}
                    activeOpacity={0.7}
                  >
                    {isDelete ? (
                      <Text style={styles.keyDeleteText}>⌫</Text>
                    ) : (
                      <Text style={styles.keyText}>{key}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Validate button */}
        <TouchableOpacity
          style={[styles.validateButton, code.length < 4 && styles.validateButtonDisabled]}
          onPress={handleLogin}
          disabled={code.length < 4 || isLoading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={code.length === 4 ? ['#FF6B9D', '#FF8E53'] : ['#555', '#444']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.validateGradient}
          >
            <Text style={styles.validateText}>
              {isLoading ? 'Vérification...' : '🚀  Entrer dans mon espace'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1, overflow: 'hidden' },
  decorCircle1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 107, 157, 0.10)',
    top: -80,
    right: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(74, 124, 247, 0.08)',
    bottom: 40,
    left: -60,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[8],
  },
  header: {
    paddingTop: 54,
    paddingBottom: Spacing[2],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: Spacing[4],
    paddingBottom: Spacing[6],
    gap: Spacing[2],
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarEmoji: { fontSize: 52 },
  title: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['2xl'],
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[4],
    marginBottom: Spacing[3],
  },
  dot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotEmpty: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dotFilled: {
    backgroundColor: 'rgba(255, 107, 157, 0.4)',
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  dotInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B9D',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 80, 80, 0.15)',
    borderRadius: BorderRadius.lg,
    padding: Spacing[3],
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(255,80,80,0.3)',
  },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: '#FF8080',
    textAlign: 'center',
  },
  keypad: {
    gap: Spacing[3],
    marginTop: Spacing[2],
    paddingHorizontal: Spacing[4],
    flex: 1,
    justifyContent: 'center',
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[3],
  },
  key: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    ...Shadows.sm,
  },
  keyDelete: {
    backgroundColor: 'rgba(255, 107, 157, 0.15)',
    borderColor: 'rgba(255, 107, 157, 0.3)',
  },
  keyText: {
    fontFamily: FontFamily.bold,
    fontSize: 26,
    color: '#FFFFFF',
  },
  keyDeleteText: {
    fontSize: 22,
    color: '#FF8080',
  },
  keyPlaceholder: {
    width: 76,
    height: 76,
  },
  validateButton: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    marginTop: Spacing[5],
    ...Shadows.md,
  },
  validateButtonDisabled: {
    opacity: 0.5,
  },
  validateGradient: {
    paddingVertical: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  validateText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: '#FFFFFF',
  },
});
