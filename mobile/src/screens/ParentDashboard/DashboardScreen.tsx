import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { AppStackParamList, ParentTabParamList } from '../../navigation/types';
import { useAuthStore, useChildrenStore } from '../../store';
import { firestoreService } from '../../services/firestoreService';
import { ChildCard } from '../../components/cards/Cards';
import { MetricCard } from '../../components/cards/MetricCard';
import { EmptyState } from '../../components/feedback/Feedback';
import { MedicalDisclaimer } from '../../components/feedback/Feedback';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius, Shadows } from '../../theme';
import { ChildProfile } from '../../models';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<ParentTabParamList, 'Dashboard'>,
    NativeStackNavigationProp<AppStackParamList>
  >;
};

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { children, setChildren } = useChildrenStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadChildren = async () => {
    if (!user?.id) return;
    try {
      const data = await firestoreService.getChildren(user.id);
      setChildren(data);
    } catch (err) {
      console.error('Error loading children:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, [user?.id]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadChildren();
    setIsRefreshing(false);
  };

  const totalSessions = children.reduce((sum, c) => sum + c.totalSessions, 0);
  const avgScore = children.length > 0
    ? Math.round(children.reduce((sum, c) => sum + c.averageScore, 0) / children.length)
    : 0;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={Colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.userName}>{user?.displayName?.split(' ')[0] || 'Utilisateur'}</Text>
            <Text style={styles.headerSubtitle}>
              {user?.role === 'therapist' ? 'Espace thérapeute' : 'Espace parent'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateChild')}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Stats */}
        {children.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{children.length}</Text>
              <Text style={styles.statLabel}>
                {children.length > 1 ? 'Profils' : 'Profil'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{avgScore > 0 ? `${avgScore}` : '—'}</Text>
              <Text style={styles.statLabel}>Score moy.</Text>
            </View>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Medical Disclaimer */}
        <MedicalDisclaimer compact style={styles.disclaimer} />

        {/* Children Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {children.length > 0 ? 'Profils enfants' : 'Commencer'}
            </Text>
            {children.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('CreateChild')}>
                <Text style={styles.sectionAction}>+ Ajouter</Text>
              </TouchableOpacity>
            )}
          </View>

          {children.length === 0 ? (
            <EmptyState
              emoji="👶"
              title="Aucun profil enfant"
              subtitle="Créez le premier profil pour commencer à accompagner votre enfant."
              action={
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => navigation.navigate('CreateChild')}
                >
                  <LinearGradient
                    colors={Colors.gradientPrimary}
                    style={styles.createButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.createButtonText}>Créer un profil enfant</Text>
                  </LinearGradient>
                </TouchableOpacity>
              }
            />
          ) : (
            children.map(child => (
              <ChildCard
                key={child.id}
                child={child}
                onPress={() => navigation.navigate('ChildProfile', { childId: child.id })}
              />
            ))
          )}
        </View>

        {/* Quick Metrics (if children exist) */}
        {children.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aperçu global</Text>
            <View style={styles.metricsGrid}>
              <MetricCard
                label="Sessions totales"
                value={totalSessions}
                icon="🎮"
                color={Colors.primary}
                style={styles.metricCard}
              />
              <MetricCard
                label="Score moyen"
                value={avgScore > 0 ? `${avgScore}%` : '—'}
                icon="📊"
                color={Colors.secondary}
                style={styles.metricCard}
              />
            </View>
            <View style={styles.metricsGrid}>
              <MetricCard
                label="Actifs ce mois"
                value={children.filter(c => c.totalSessions > 0).length}
                icon="✅"
                color={Colors.success}
                style={styles.metricCard}
              />
              <MetricCard
                label="En progression"
                value={children.filter(c => c.averageScore > 60).length}
                icon="📈"
                color={Colors.accent}
                style={styles.metricCard}
              />
            </View>
          </View>
        )}

        {/* App Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>À propos de FutureMinds</Text>
          <Text style={styles.infoText}>
            FutureMinds propose des mini-jeux éducatifs pour aider les enfants à développer leur attention, 
            leur mémoire et leur concentration. Les recommandations générées sont à titre éducatif uniquement.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: Spacing[6],
    paddingHorizontal: Spacing[5],
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing[5],
  },
  greeting: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['3xl'],
    color: Colors.textInverse,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  addButtonText: {
    fontSize: 24,
    color: Colors.textInverse,
    fontFamily: FontFamily.bold,
    marginTop: -2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    gap: Spacing[4],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textInverse,
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingTop: Spacing[4],
    paddingBottom: Spacing[12],
    paddingHorizontal: Spacing[5],
  },
  disclaimer: {
    marginHorizontal: 0,
    marginBottom: Spacing[5],
  },
  section: {
    marginBottom: Spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  sectionAction: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  metricCard: {
    flex: 1,
  },
  createButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  createButtonGradient: {
    paddingVertical: Spacing[4],
    alignItems: 'center',
  },
  createButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: Colors.textInverse,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    ...Shadows.sm,
  },
  infoTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: Spacing[2],
  },
  infoText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
