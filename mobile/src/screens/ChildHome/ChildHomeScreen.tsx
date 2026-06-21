import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/types';
import { useChildrenStore, useAuthStore } from '../../store';
import { firestoreService } from '../../services/firestoreService';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius, Shadows } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'ChildTabs'>;
  route: RouteProp<AppStackParamList, 'ChildTabs'>;
};

export const ChildHomeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const { children } = useChildrenStore();
  const child = children.find(c => c.id === childId);

  if (!child) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Profil enfant non trouvé.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EEF3FF', '#F0EEFB']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header parent redirect */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.exitButton}
              onPress={() => navigation.navigate('ParentTabs')}
            >
              <Text style={styles.exitIcon}>🏠</Text>
              <Text style={styles.exitText}>Espace Parent</Text>
            </TouchableOpacity>
          </View>

          {/* Child Hero */}
          <View style={styles.welcomeSection}>
            <View style={[styles.avatarCircle, { backgroundColor: child.avatarColor + '30' }]}>
              <Text style={styles.avatarEmoji}>{child.avatarEmoji}</Text>
            </View>
            <Text style={styles.welcomeTitle}>Salut, {child.firstName} !</Text>
            <Text style={styles.welcomeSubtitle}>Prêt pour les jeux d'aujourd'hui ? 🚀</Text>
          </View>

          {/* Hero Action Cards */}
          <TouchableOpacity
            style={styles.mainActionCard}
            activeOpacity={0.95}
            onPress={() => navigation.navigate('GameSelection', { childId: child.id })}
          >
            <LinearGradient
              colors={['#5B8DEF', '#7C6FCD']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mainActionGradient}
            >
              <View style={styles.mainActionLeft}>
                <Text style={styles.mainActionEmoji}>🎮</Text>
                <View>
                  <Text style={styles.mainActionTitle}>Lancer les Jeux</Text>
                  <Text style={styles.mainActionSubtitle}>Choisis ton jeu et bats ton score !</Text>
                </View>
              </View>
              <Text style={styles.mainActionArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Tips Section */}
          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>Astuce du jour 🌟</Text>
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>
                Fais des petites pauses quand tu te sens fatigué. C'est en restant calme qu'on obtient le meilleur score !
              </Text>
            </View>
          </View>
          
          {/* Stats Badge */}
          <View style={styles.badgeSection}>
            <Text style={styles.sectionTitle}>Tes Succès 🏆</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badgeCard}>
                <Text style={styles.badgeEmoji}>🎖️</Text>
                <Text style={styles.badgeName}>Super Joueur</Text>
                <Text style={styles.badgeSub}>{child.totalSessions} parties</Text>
              </View>
              <View style={styles.badgeCard}>
                <Text style={styles.badgeEmoji}>🔥</Text>
                <Text style={styles.badgeName}>Concentré</Text>
                <Text style={styles.badgeSub}>Actif</Text>
              </View>
              <View style={styles.badgeCard}>
                <Text style={styles.badgeEmoji}>⭐</Text>
                <Text style={styles.badgeName}>Champion</Text>
                <Text style={styles.badgeSub}>Score: {child.averageScore > 0 ? Math.round(child.averageScore) : '—'}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: 54,
    paddingBottom: Spacing[10],
    gap: Spacing[6],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[1.5],
  },
  exitIcon: { fontSize: 16 },
  exitText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  welcomeSection: {
    alignItems: 'center',
    marginTop: Spacing[4],
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[4],
    borderWidth: 4,
    borderColor: Colors.surface,
    ...Shadows.md,
  },
  avatarEmoji: { fontSize: 52 },
  welcomeTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['3xl'],
    color: Colors.textPrimary,
  },
  welcomeSubtitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  mainActionCard: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.md,
  },
  mainActionGradient: {
    padding: Spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  mainActionEmoji: { fontSize: 40 },
  mainActionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textInverse,
  },
  mainActionSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  mainActionArrow: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
    color: Colors.textInverse,
  },
  tipsSection: { gap: Spacing[3] },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    paddingLeft: 4,
  },
  tipCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    ...Shadows.sm,
  },
  tipIcon: { fontSize: 24 },
  tipText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  badgeSection: { gap: Spacing[3] },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  badgeCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[3],
    alignItems: 'center',
    ...Shadows.sm,
  },
  badgeEmoji: { fontSize: 28, marginBottom: 4 },
  badgeName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  badgeSub: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 100,
  },
});
