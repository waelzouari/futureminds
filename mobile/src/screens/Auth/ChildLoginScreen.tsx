import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useChildAuthStore } from '../../store';
import { FontFamily, FontSize, Spacing, BorderRadius, Shadows } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ChildLogin'>;
};

// Palette douce TDAH
const C = {
  bg:         '#F0F6FF',
  card:       '#FFFFFF',
  text:       '#1A2340',
  textSoft:   '#6B7A99',
  blue:       '#4A90E2',
  blueBg:     '#E8F2FF',
  coral:      '#E84393',
  coralLight: '#FEE8F4',
  green:      '#27AE60',
  border:     '#DDE8FF',
  error:      '#E84040',
  errorBg:    '#FFF0F0',
};

const AVATARS = ['🦁', '🐬', '🦋', '🐉', '🦊', '🐧', '🦄', '🌟'];

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['',  '0', '⌫'],
];

export const ChildLoginScreen: React.FC<Props> = ({ navigation }) => {
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { signInAsChild, isLoading, error, clearError } = useChildAuthStore();

  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const scaleBounce = useRef(new Animated.Value(1)).current;
  const [avatar]   = useState(AVATARS[Math.floor(Math.random() * AVATARS.length)]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (code.length > 0) {
      Animated.sequence([
        Animated.timing(scaleBounce, { toValue: 1.15, duration: 80, useNativeDriver: true }),
        Animated.timing(scaleBounce, { toValue: 1,    duration: 80, useNativeDriver: true }),
      ]).start();
    }
  }, [code]);

  const shake = () => {
    Vibration.vibrate(200);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const handleDigit = (d: string) => {
    if (code.length >= 4) return;
    clearError(); setLocalError(null);
    setCode(p => p + d);
  };

  const handleDelete = () => {
    clearError(); setLocalError(null);
    setCode(p => p.slice(0, -1));
  };

  const handleLogin = async () => {
    if (code.length !== 4) return;
    try {
      await signInAsChild(code);
    } catch {
      shake();
    }
  };

  const displayError = localError || error;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* ── BACK ───────────────────────────────────────────── */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backTxt}>← Retour</Text>
        </TouchableOpacity>

        {/* ── HERO ───────────────────────────────────────────── */}
        <View style={styles.hero}>
          <Animated.View style={[styles.avatarWrap, { transform: [{ scale: scaleBounce }] }]}>
            <Text style={styles.avatarEmoji}>{avatar}</Text>
          </Animated.View>
          <Text style={styles.title}>Mon Espace</Text>
          <Text style={styles.subtitle}>Entre ton code secret à 4 chiffres</Text>
        </View>

        {/* ── DOTS ───────────────────────────────────────────── */}
        <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
          {[0, 1, 2, 3].map(i => (
            <View
              key={i}
              style={[
                styles.dot,
                i < code.length ? styles.dotFilled : styles.dotEmpty,
              ]}
            />
          ))}
        </Animated.View>

        {/* ── ERREUR ─────────────────────────────────────────── */}
        {displayError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTxt}>😟 {displayError}</Text>
          </View>
        )}

        {/* ── CLAVIER ────────────────────────────────────────── */}
        <View style={styles.keypad}>
          {KEYS.map((row, ri) => (
            <View key={ri} style={styles.keyRow}>
              {row.map((key, ci) => {
                if (key === '') return <View key={ci} style={styles.keyPlaceholder} />;
                const isDel = key === '⌫';
                return (
                  <TouchableOpacity
                    key={ci}
                    style={[styles.key, isDel ? styles.keyDel : styles.keyNum]}
                    onPress={() => isDel ? handleDelete() : handleDigit(key)}
                    activeOpacity={0.7}
                  >
                    <Text style={isDel ? styles.keyDelTxt : styles.keyNumTxt}>{key}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* ── VALIDER ────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.validateBtn, code.length < 4 && styles.validateDisabled]}
          onPress={handleLogin}
          disabled={code.length < 4 || isLoading}
          activeOpacity={0.85}
        >
          <Text style={styles.validateTxt}>
            {isLoading ? 'Vérification...' : '🚀  Entrer dans mon espace'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  content: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingTop: 54,
    paddingBottom: Spacing[8],
    gap: Spacing[3],
  },

  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[1],
  },
  backTxt: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: C.blue,
  },

  // HERO
  hero: {
    alignItems: 'center',
    paddingTop: Spacing[4],
    paddingBottom: Spacing[2],
    gap: Spacing[2],
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: C.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
    borderWidth: 2.5,
    borderColor: C.border,
    ...Shadows.base,
  },
  avatarEmoji: { fontSize: 48 },
  title: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['2xl'],
    color: C.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: C.textSoft,
    textAlign: 'center',
  },

  // DOTS
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[4],
    marginVertical: Spacing[3],
  },
  dot: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  dotEmpty: {
    backgroundColor: C.card,
    borderWidth: 2.5,
    borderColor: C.border,
  },
  dotFilled: {
    backgroundColor: C.blue,
    borderWidth: 2.5,
    borderColor: C.blue,
    ...Shadows.primary,
  },

  // ERREUR
  errorBox: {
    backgroundColor: C.errorBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing[3],
    borderWidth: 1,
    borderColor: C.error + '44',
  },
  errorTxt: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: C.error,
    textAlign: 'center',
  },

  // KEYPAD
  keypad: {
    gap: Spacing[3],
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing[2],
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[3],
  },
  key: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyNum: {
    backgroundColor: C.card,
    borderWidth: 2,
    borderColor: C.border,
    ...Shadows.sm,
  },
  keyDel: {
    backgroundColor: C.coralLight,
    borderWidth: 2,
    borderColor: C.coral + '44',
  },
  keyNumTxt: {
    fontFamily: FontFamily.bold,
    fontSize: 26,
    color: C.text,
  },
  keyDelTxt: {
    fontSize: 22,
    color: C.coral,
  },
  keyPlaceholder: {
    width: 78,
    height: 78,
  },

  // VALIDATE
  validateBtn: {
    backgroundColor: C.blue,
    borderRadius: BorderRadius['2xl'],
    paddingVertical: Spacing[4],
    alignItems: 'center',
    marginTop: Spacing[2],
    ...Shadows.base,
  },
  validateDisabled: {
    backgroundColor: '#C5D8F5',
  },
  validateTxt: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: '#FFFFFF',
  },
});
