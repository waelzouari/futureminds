import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { FontFamily, FontSize, Spacing, BorderRadius, Shadows } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'RoleSelection'>;
};

// Palette TDAH — claire, aérée, contrastes forts, chaque rôle distinct
const C = {
  bg:         '#F0F6FF',   // fond bleu pastel doux
  card:       '#FFFFFF',   // cartes blanches
  text:       '#1A2340',   // texte principal
  textSoft:   '#6B7A99',   // texte secondaire

  // Parent — bleu calme et professionnel
  parentBg:   '#4A90E2',
  parentLight:'#E8F2FF',
  parentBorder:'#BDD5F7',

  // Enfant — coral/orange chaud et ludique
  childBg:    '#E84393',
  childLight: '#FEE8F4',
  childBorder:'#F5BCDA',

  // Logo
  logoBg:     '#EAF1FF',
  logoBorder: '#C4D9F8',
};

export const RoleSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(30)).current;
  const parentScale = useRef(new Animated.Value(1)).current;
  const childScale  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const animatePress = (anim: Animated.Value, callback: () => void) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start(() => callback());
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Décoration douce — cercles pastel en fond */}
      <View style={styles.decoTop} />
      <View style={styles.decoBottom} />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          {/* ── BRAND ────────────────────────────────────────────── */}
          <View style={styles.brandSection}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoEmoji}>🧠</Text>
            </View>
            <Text style={styles.brandTitle}>FutureMinds</Text>
            <Text style={styles.brandSubtitle}>Qui es-tu aujourd'hui ?</Text>
          </View>

          {/* ── CARD PARENT ──────────────────────────────────────── */}
          <Animated.View style={{ transform: [{ scale: parentScale }] }}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.parentCard}
              onPress={() => animatePress(parentScale, () => navigation.navigate('Login'))}
            >
              <View style={styles.iconWrapParent}>
                <Text style={styles.roleIcon}>👨‍👩‍👧</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.roleTitle, { color: C.parentBg }]}>Parent</Text>
                <Text style={styles.roleDesc}>Gérez les profils et consultez les progrès</Text>
              </View>
              <View style={[styles.arrowWrap, { backgroundColor: C.parentLight }]}>
                <Text style={[styles.arrow, { color: C.parentBg }]}>›</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* ── CARD ENFANT ──────────────────────────────────────── */}
          <Animated.View style={{ transform: [{ scale: childScale }] }}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.childCard}
              onPress={() => animatePress(childScale, () => navigation.navigate('ChildLogin'))}
            >
              <View style={styles.iconWrapChild}>
                <Text style={styles.roleIcon}>🧒</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.roleTitle, { color: C.childBg }]}>Enfant</Text>
                <Text style={styles.roleDesc}>Accède à tes jeux avec ton code secret</Text>
              </View>
              <View style={[styles.arrowWrap, { backgroundColor: C.childLight }]}>
                <Text style={[styles.arrow, { color: C.childBg }]}>›</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* ── FOOTER ───────────────────────────────────────────── */}
          <Text style={styles.footer}>Application éducative pour enfants</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Décoration pastel subtile
  decoTop: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#D6E8FF',   // bleu très pâle
    top: -120,
    right: -100,
    opacity: 0.7,
  },
  decoBottom: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#FFE0F0',   // rose très pâle
    bottom: 20,
    left: -80,
    opacity: 0.6,
  },

  safeArea: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    justifyContent: 'center',
    gap: Spacing[4],
  },

  // BRAND
  brandSection: {
    alignItems: 'center',
    marginBottom: Spacing[6],
    gap: Spacing[2],
  },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.logoBg,
    borderWidth: 2,
    borderColor: C.logoBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
    ...Shadows.sm,
  },
  logoEmoji: { fontSize: 44 },
  brandTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['3xl'],
    color: C.text,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: C.textSoft,
  },

  // CARTES
  parentCard: {
    backgroundColor: C.card,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    borderWidth: 2,
    borderColor: C.parentBorder,
    ...Shadows.base,
  },
  childCard: {
    backgroundColor: C.card,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    borderWidth: 2,
    borderColor: C.childBorder,
    ...Shadows.base,
  },
  iconWrapParent: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.parentLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: C.parentBorder,
  },
  iconWrapChild: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.childLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: C.childBorder,
  },
  roleIcon: { fontSize: 30 },
  cardText: { flex: 1 },
  roleTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.xl,
    marginBottom: 3,
  },
  roleDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: C.textSoft,
    lineHeight: 18,
  },
  arrowWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
    lineHeight: 28,
  },

  // FOOTER
  footer: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: C.textSoft,
    textAlign: 'center',
    marginTop: Spacing[4],
  },
});
