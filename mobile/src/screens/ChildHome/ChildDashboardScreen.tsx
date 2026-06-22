import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/types';
import { useChildAuthStore } from '../../store';
import { FontFamily, FontSize, Spacing, BorderRadius, Shadows } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'ChildDashboard'>;
  route: RouteProp<AppStackParamList, 'ChildDashboard'>;
};

// Palette TDAH-friendly : lumineuse, contrastée, chaque section distincte
const C = {
  bg: '#F0F6FF',           // bleu pastel très doux — fond principal
  card: '#FFFFFF',         // cartes blanches nettes
  text: '#1A2340',         // texte principal très lisible
  textSoft: '#6B7A99',     // texte secondaire

  // Sections — couleur différente par zone
  blue:   '#4A90E2',       // jeu principal
  blueBg: '#E8F2FF',
  green:  '#27AE60',       // stats "bonnes réponses"
  greenBg:'#E8F8EF',
  orange: '#F5A623',       // score / niveau
  orangeBg:'#FFF5E0',
  purple: '#9B59B6',       // badges (mais doux)
  purpleBg:'#F5EEF8',
  coral:  '#E84393',       // CTA principal (attrayant)
  coralBg:'#FEE8F4',

  border: '#DDE8FF',
};

const BADGES = [
  { emoji: '🎖️', name: 'Super Joueur', unlocked: true,  color: C.orange },
  { emoji: '🔥', name: 'En Feu',       unlocked: true,  color: C.coral  },
  { emoji: '⭐', name: 'Champion',     unlocked: true,  color: C.blue   },
  { emoji: '🏆', name: 'Légendaire',   unlocked: false, color: '#CCC'   },
  { emoji: '💎', name: 'Diamant',      unlocked: false, color: '#CCC'   },
  { emoji: '🚀', name: 'Explorateur',  unlocked: false, color: '#CCC'   },
];

const TIPS = [
  'Fais une petite pause si tu te sens fatigué. Ton cerveau sera plus alerte ! 🧠',
  'Bois de l\'eau avant de jouer — ça aide à se concentrer ! 💧',
  'Respire profondément avant de commencer. Tu seras plus focus ! 🌬️',
  'Chaque partie te rend plus fort(e), même si tu ne gagnes pas ! 💪',
];

export const ChildDashboardScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childSession, signOutChild } = useChildAuthStore();
  const child = childSession;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const avatarPulse = useRef(new Animated.Value(1)).current;

  const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(avatarPulse, { toValue: 1.05, duration: 1400, useNativeDriver: true }),
        Animated.timing(avatarPulse, { toValue: 1,    duration: 1400, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  if (!child) {
    return (
      <View style={styles.errorWrap}>
        <Text style={styles.errorTxt}>Session expirée. Reconnecte-toi !</Text>
      </View>
    );
  }

  const handleSignOut = () => {
    Alert.alert('Se déconnecter ?', 'À bientôt ! 👋', [
      { text: 'Rester', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: () => signOutChild() },
    ]);
  };

  const totalSessions = child.totalSessions || 0;
  const avgScore      = child.averageScore || 0;
  const level         = Math.max(1, Math.floor(totalSessions / 3) + 1);
  const xpProgress    = (totalSessions % 3) / 3;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── TOP BAR ───────────────────────────────────────────────── */}
        <Animated.View style={[styles.topBar, { opacity: fadeAnim }]}>
          <View style={styles.codeTag}>
            <Text style={styles.codeTagText}>🔑 {child.childCode}</Text>
          </View>
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <Text style={styles.signOutTxt}>Quitter</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <Animated.View
          style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <Animated.View
            style={[styles.avatarWrap, { transform: [{ scale: avatarPulse }] }]}
          >
            <Text style={styles.avatarEmoji}>{child.avatarEmoji}</Text>
          </Animated.View>
          <Text style={styles.welcome}>Salut, {child.firstName} ! 👋</Text>
          <Text style={styles.welcomeSub}>Prêt(e) pour une nouvelle aventure ?</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelTxt}>⚡ Niveau {level}</Text>
          </View>
        </Animated.View>

        {/* ── XP BAR ────────────────────────────────────────────────── */}
        <View style={styles.xpCard}>
          <View style={styles.xpRow}>
            <Text style={styles.xpTitle}>Progression → Niveau {level + 1}</Text>
            <Text style={styles.xpCount}>{totalSessions % 3}/3</Text>
          </View>
          <View style={styles.xpBg}>
            <View style={[styles.xpFill, { width: `${Math.round(xpProgress * 100)}%` as any }]} />
          </View>
        </View>

        {/* ── JOUER ─────────────────────────────────────────────────── */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('GameSelection', { childId: child.id })}
        >
          <LinearGradient
            colors={['#E84393', '#FF6B35']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.playCard}
          >
            <Text style={styles.playEmoji}>🎮</Text>
            <View style={styles.playText}>
              <Text style={styles.playTitle}>Jouer maintenant !</Text>
              <Text style={styles.playSub}>Choisis ton jeu et bats ton record</Text>
            </View>
            <Text style={styles.playArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── STATS ─────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderTopColor: C.blue }]}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={[styles.statVal, { color: C.blue }]}>{totalSessions}</Text>
            <Text style={styles.statLbl}>Parties jouées</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: C.green }]}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={[styles.statVal, { color: C.green }]}>
              {avgScore > 0 ? Math.round(avgScore) : '—'}
            </Text>
            <Text style={styles.statLbl}>Meilleur score</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: C.orange }]}>
            <Text style={styles.statEmoji}>🏅</Text>
            <Text style={[styles.statVal, { color: C.orange }]}>{level}</Text>
            <Text style={styles.statLbl}>Niveau actuel</Text>
          </View>
        </View>

        {/* ── BADGES ────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Mes Récompenses</Text>
          <View style={styles.badgesGrid}>
            {BADGES.map((badge, i) => (
              <View
                key={i}
                style={[
                  styles.badgeCard,
                  badge.unlocked
                    ? { borderColor: badge.color + '55', backgroundColor: badge.color + '12' }
                    : styles.badgeLocked,
                ]}
              >
                <Text style={[styles.badgeEmoji, !badge.unlocked && { opacity: 0.25 }]}>
                  {badge.unlocked ? badge.emoji : '🔒'}
                </Text>
                <Text style={[styles.badgeName, !badge.unlocked && { color: '#BBB' }]}>
                  {badge.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── CONSEIL DU JOUR ───────────────────────────────────────── */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipTxt}>{randomTip}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  errorTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: '#E84393' },

  scroll: {
    paddingTop: 54,
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[12],
    gap: Spacing[4],
  },

  // TOP BAR
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeTag: {
    backgroundColor: C.blueBg,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: C.border,
  },
  codeTagText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: C.blue,
  },
  signOutBtn: {
    backgroundColor: '#FEE8EE',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#F5C0CB',
  },
  signOutTxt: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: '#E84393',
  },

  // HERO
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing[4],
    gap: Spacing[2],
  },
  avatarWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: C.border,
    marginBottom: Spacing[2],
    ...Shadows.base,
  },
  avatarEmoji: { fontSize: 52 },
  welcome: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['2xl'],
    color: C.text,
    letterSpacing: -0.3,
  },
  welcomeSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: C.textSoft,
  },
  levelBadge: {
    backgroundColor: C.orangeBg,
    borderWidth: 1,
    borderColor: C.orange + '55',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[1.5],
    borderRadius: BorderRadius.full,
    marginTop: Spacing[1],
  },
  levelTxt: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: C.orange,
  },

  // XP BAR
  xpCard: {
    backgroundColor: C.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    gap: Spacing[2],
    borderWidth: 1,
    borderColor: C.border,
    ...Shadows.sm,
  },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpTitle: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: C.textSoft },
  xpCount:  { fontFamily: FontFamily.bold,    fontSize: FontSize.sm, color: C.blue },
  xpBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: C.blueBg,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: C.blue,
  },

  // PLAY CARD
  playCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    ...Shadows.md,
  },
  playEmoji: { fontSize: 42 },
  playText: { flex: 1 },
  playTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.xl,
    color: '#FFFFFF',
  },
  playSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  playArrow: {
    fontSize: 26,
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
  },

  // STATS
  statsRow: { flexDirection: 'row', gap: Spacing[3] },
  statCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    alignItems: 'center',
    gap: Spacing[1],
    borderWidth: 1,
    borderColor: C.border,
    borderTopWidth: 3,
    ...Shadows.sm,
  },
  statEmoji: { fontSize: 26 },
  statVal: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.xl,
  },
  statLbl: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: C.textSoft,
    textAlign: 'center',
  },

  // BADGES
  section: { gap: Spacing[3] },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: C.text,
    paddingLeft: 2,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  badgeCard: {
    width: '30%',
    backgroundColor: C.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing[3],
    alignItems: 'center',
    gap: Spacing[1],
    borderWidth: 1.5,
  },
  badgeLocked: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  badgeEmoji: { fontSize: 28 },
  badgeName: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10,
    color: C.text,
    textAlign: 'center',
  },

  // TIP
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.greenBg,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: C.green + '44',
  },
  tipIcon: { fontSize: 26 },
  tipTxt: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: '#1B5E35',
    lineHeight: 20,
  },
});
