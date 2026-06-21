import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/types';
import { useChildAuthStore } from '../../store';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius, Shadows } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'ChildDashboard'>;
  route: RouteProp<AppStackParamList, 'ChildDashboard'>;
};

const TIPS = [
  'Fais des petites pauses quand tu te sens fatigué. C\'est en restant calme qu\'on obtient le meilleur score !',
  'Respire profondément avant de commencer un jeu. Tu seras plus concentré !',
  'N\'oublie pas : chaque partie t\'aide à progresser, même si tu ne gagnes pas !',
  'Boire de l\'eau avant de jouer aide ton cerveau à être plus alerte 🧠',
];

const BADGES = [
  { emoji: '🎖️', name: 'Super Joueur', unlocked: true },
  { emoji: '🔥', name: 'En Feu', unlocked: true },
  { emoji: '⭐', name: 'Champion', unlocked: true },
  { emoji: '🏆', name: 'Légendaire', unlocked: false },
  { emoji: '💎', name: 'Diamant', unlocked: false },
  { emoji: '🚀', name: 'Explorateur', unlocked: false },
];

export const ChildDashboardScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childSession, signOutChild } = useChildAuthStore();
  const child = childSession;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const avatarPulse = useRef(new Animated.Value(1)).current;

  const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    // Pulsing avatar
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(avatarPulse, { toValue: 1.06, duration: 1200, useNativeDriver: true }),
        Animated.timing(avatarPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  if (!child) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Session expirée. Reconnecte-toi !</Text>
      </View>
    );
  }

  const handleSignOut = () => {
    Alert.alert(
      'Se déconnecter ?',
      'Tu vas quitter ton espace. À bientôt !',
      [
        { text: 'Rester', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: () => signOutChild(),
        },
      ]
    );
  };

  const totalSessions = child.totalSessions || 0;
  const avgScore = child.averageScore || 0;
  const level = Math.max(1, Math.floor(totalSessions / 3) + 1);
  const xpProgress = (totalSessions % 3) / 3;

  return (
    <LinearGradient
      colors={['#1A1F3A', '#2D1B69', '#1A1F3A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {/* Background decoration */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar with sign out */}
        <Animated.View style={[styles.topBar, { opacity: fadeAnim }]}>
          <View style={styles.codeTag}>
            <Text style={styles.codeTagText}>🔑 Code : {child.childCode}</Text>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Quitter</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Hero section */}
        <Animated.View
          style={[
            styles.heroSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Animated.View
            style={[
              styles.avatarContainer,
              { backgroundColor: child.avatarColor + '30' },
              { transform: [{ scale: avatarPulse }] },
            ]}
          >
            <Text style={styles.avatarEmoji}>{child.avatarEmoji}</Text>
          </Animated.View>
          <Text style={styles.welcomeText}>Salut, {child.firstName} ! 👋</Text>
          <Text style={styles.welcomeSubtext}>Prêt pour une nouvelle aventure ?</Text>

          {/* Level badge */}
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>⚡ Niveau {level}</Text>
          </View>
        </Animated.View>

        {/* XP Progress bar */}
        <Animated.View style={[styles.xpCard, { opacity: fadeAnim }]}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpTitle}>Progression vers le niveau {level + 1}</Text>
            <Text style={styles.xpCount}>{totalSessions % 3}/3 parties</Text>
          </View>
          <View style={styles.xpBarBg}>
            <Animated.View
              style={[
                styles.xpBarFill,
                { width: `${Math.round(xpProgress * 100)}%` as any },
              ]}
            />
          </View>
        </Animated.View>

        {/* Play button — main CTA */}
        <TouchableOpacity
          style={styles.playCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('GameSelection', { childId: child.id })}
        >
          <LinearGradient
            colors={['#FF6B9D', '#FF8E53']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.playCardGradient}
          >
            <Text style={styles.playEmoji}>🎮</Text>
            <View>
              <Text style={styles.playTitle}>Jouer maintenant !</Text>
              <Text style={styles.playSubtitle}>Choisis ton jeu et bats ton record</Text>
            </View>
            <Text style={styles.playArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statValue}>{totalSessions}</Text>
            <Text style={styles.statLabel}>Parties jouées</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>
              {avgScore > 0 ? Math.round(avgScore) : '—'}
            </Text>
            <Text style={styles.statLabel}>Meilleur score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🏅</Text>
            <Text style={styles.statValue}>{level}</Text>
            <Text style={styles.statLabel}>Niveau actuel</Text>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Mes Récompenses</Text>
          <View style={styles.badgesGrid}>
            {BADGES.map((badge, i) => (
              <View
                key={i}
                style={[styles.badgeCard, !badge.unlocked && styles.badgeCardLocked]}
              >
                <Text style={[styles.badgeEmoji, !badge.unlocked && styles.badgeEmojiLocked]}>
                  {badge.unlocked ? badge.emoji : '🔒'}
                </Text>
                <Text style={[styles.badgeName, !badge.unlocked && styles.badgeNameLocked]}>
                  {badge.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Daily tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>{randomTip}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1, overflow: 'hidden' },
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 107, 157, 0.08)',
    top: -80,
    right: -80,
  },
  decorCircle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(74, 124, 247, 0.07)',
    bottom: 60,
    left: -60,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1F3A',
  },
  errorText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: '#FF8080',
    textAlign: 'center',
  },
  scroll: {
    paddingTop: 54,
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[12],
    gap: Spacing[5],
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeTag: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  codeTagText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 80, 80, 0.15)',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,80,80,0.3)',
  },
  signOutText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: '#FF8080',
  },
  heroSection: {
    alignItems: 'center',
    gap: Spacing[2],
    paddingTop: Spacing[3],
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
    ...Shadows.lg,
  },
  avatarEmoji: { fontSize: 56 },
  welcomeText: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['2xl'],
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  welcomeSubtext: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.6)',
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 200, 50, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 50, 0.5)',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[1.5],
    borderRadius: BorderRadius.full,
    marginTop: Spacing[1],
  },
  levelText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: '#FFD700',
  },
  xpCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    gap: Spacing[2],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  xpCount: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: '#FF6B9D',
  },
  xpBarBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#FF6B9D',
  },
  playCard: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.lg,
  },
  playCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[5],
    gap: Spacing[4],
  },
  playEmoji: { fontSize: 44 },
  playTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.xl,
    color: '#FFFFFF',
  },
  playSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  playArrow: {
    marginLeft: 'auto',
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    alignItems: 'center',
    gap: Spacing[1],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  statEmoji: { fontSize: 28 },
  statValue: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.xl,
    color: '#FFFFFF',
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  section: { gap: Spacing[3] },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#FFFFFF',
    paddingLeft: 4,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  badgeCard: {
    width: '30%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BorderRadius.xl,
    padding: Spacing[3],
    alignItems: 'center',
    gap: Spacing[1],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  badgeCardLocked: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  badgeEmoji: { fontSize: 30 },
  badgeEmojiLocked: { opacity: 0.3 },
  badgeName: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  badgeNameLocked: { color: 'rgba(255,255,255,0.3)' },
  tipCard: {
    backgroundColor: 'rgba(74, 124, 247, 0.15)',
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(74, 124, 247, 0.3)',
  },
  tipIcon: { fontSize: 28 },
  tipText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
  },
});
