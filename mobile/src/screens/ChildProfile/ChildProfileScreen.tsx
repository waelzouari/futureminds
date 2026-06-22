import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/types';
import { useChildrenStore, useAuthStore } from '../../store';
import { firestoreService } from '../../services/firestoreService';
import { MetricCard } from '../../components/cards/MetricCard';
import { PrimaryButton } from '../../components/buttons/Buttons';
import { EmptyState, ErrorBanner } from '../../components/feedback/Feedback';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius, Shadows } from '../../theme';
import { GameSession, LlmReport } from '../../models';
import { DIFFICULTY_LABELS } from '../../models/ChildProfile';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'ChildProfile'>;
  route: RouteProp<AppStackParamList, 'ChildProfile'>;
};

export const ChildProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const { user } = useAuthStore();
  const { children, removeChild, selectChild } = useChildrenStore();
  const child = children.find(c => c.id === childId);

  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [reports, setReports] = useState<LlmReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!child) return;
      setIsLoading(true);
      try {
        const fetchedSessions = await firestoreService.getSessions(child.id);
        const fetchedReports = await firestoreService.getLlmReports(child.id);
        setSessions(fetchedSessions);
        setReports(fetchedReports);
      } catch (err: any) {
        setError('Impossible de charger les données du profil.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [childId]);

  if (!child) {
    return (
      <View style={styles.container}>
        <EmptyState
          emoji="❌"
          title="Profil introuvable"
          subtitle="Ce profil enfant n'existe pas ou a été supprimé."
          action={
            <PrimaryButton title="Retour" onPress={() => navigation.goBack()} />
          }
        />
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le profil',
      `Êtes-vous sûr de vouloir supprimer définitivement le profil de ${child.firstName} ainsi que toutes ses données de jeu ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            if (!user?.id) return;
            try {
              await firestoreService.deleteChild(child.id, user.id);
              removeChild(child.id);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de supprimer le profil.');
            }
          },
        },
      ]
    );
  };


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil de {child.firstName}</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        {/* Child Card Header */}
        <View style={styles.childHeaderCard}>
          <View style={[styles.avatarContainer, { backgroundColor: child.avatarColor + '20' }]}>
            <Text style={styles.avatarEmoji}>{child.avatarEmoji}</Text>
            <View style={[styles.avatarBadge, { backgroundColor: child.avatarColor }]} />
          </View>
          <Text style={styles.childName}>{child.firstName}</Text>
          <Text style={styles.childMeta}>
            {child.age} ans · Niveau {child.schoolLevel.toUpperCase()}
          </Text>

          {/* Code de connexion enfant */}
          {child.childCode && (
            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>Code de connexion enfant</Text>
              <View style={styles.codeRow}>
                {child.childCode.split('').map((digit, i) => (
                  <View key={i} style={styles.codeDigitBox}>
                    <Text style={styles.codeDigit}>{digit}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.codeHint}>L'enfant utilise ce code pour se connecter à son espace</Text>
            </View>
          )}
        </View>

        {/* Observed difficulties */}
        {(child.observedDifficulties || []).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Difficultés observées</Text>
            <View style={styles.chipGrid}>
              {(child.observedDifficulties || []).map(d => (
                <View key={d} style={styles.chip}>
                  <Text style={styles.chipText}>{DIFFICULTY_LABELS[d] || d}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Global Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques globales</Text>
          <View style={styles.grid}>
            <MetricCard
              label="Sessions de jeu"
              value={child.totalSessions}
              icon="🎮"
              color={Colors.primary}
              style={styles.cardItem}
            />
            <MetricCard
              label="Score moyen"
              value={child.totalSessions > 0 ? `${Math.round(child.averageScore)}%` : '—'}
              icon="📈"
              color={Colors.secondary}
              style={styles.cardItem}
            />
          </View>
        </View>

        {/* Recent Sessions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sessions récentes</Text>
          {sessions.length === 0 ? (
            <View style={styles.emptySessionsCard}>
              <Text style={styles.emptySessionsText}>Aucune partie jouée pour l'instant.</Text>
            </View>
          ) : (
            sessions.slice(0, 5).map(session => (
              <TouchableOpacity
                key={session.id}
                style={styles.sessionItem}
                onPress={() =>
                  navigation.navigate('SessionReport', {
                    sessionId: session.sessionId,
                    childId: child.id,
                    gameId: session.gameId,
                  })
                }
              >
                <View style={styles.sessionHeaderRow}>
                  <Text style={styles.sessionGameName}>
                    {session.gameId.replace('_01', '').replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.sessionScore}>{session.score}%</Text>
                </View>
                <View style={styles.sessionFooterRow}>
                  <Text style={styles.sessionDate}>
                    {new Date(session.timestamp).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.sessionDetails}>
                    Niveau {session.difficultyLevel} · {session.correctAnswers} corr.
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* LLM Reports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommandations IA & Analyses</Text>
          {reports.length === 0 ? (
            <View style={styles.emptySessionsCard}>
              <Text style={styles.emptySessionsText}>
                Les recommandations personnalisées apparaîtront après la première session de jeu.
              </Text>
            </View>
          ) : (
            reports.slice(0, 3).map(report => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportTitle}>
                    Rapport IA du {new Date(report.generatedAt).toLocaleDateString('fr-FR')}
                  </Text>
                  <Text style={styles.reportMeta}>Focus: {report.recommended_difficulty_level}</Text>
                </View>
                <Text style={styles.reportSummary} numberOfLines={3}>
                  {report.session_summary}
                </Text>
                <View style={styles.reportSection}>
                  <Text style={styles.reportSectionTitle}>Conseil Clé pour le parent :</Text>
                  <Text style={styles.reportRecommendation}>
                    • {report.recommendations_for_parent[0]}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.readMoreButton}
                  onPress={() =>
                    navigation.navigate('SessionReport', {
                      sessionId: report.sessionId,
                      childId: child.id,
                      gameId: report.sessionId, // Will resolve session correctly inside report
                    })
                  }
                >
                  <Text style={styles.readMoreText}>Consulter l'analyse complète →</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingBottom: Spacing[4],
    paddingHorizontal: Spacing[4],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 24, color: Colors.textPrimary },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: { fontSize: 20 },
  scroll: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[10],
    gap: Spacing[5],
  },
  childHeaderCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[6],
    alignItems: 'center',
    ...Shadows.sm,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: Spacing[4],
  },
  avatarEmoji: { fontSize: 48 },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  childName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  childMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing[4],
  },
  codeCard: {
    width: '100%',
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    alignItems: 'center',
    gap: Spacing[2],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  codeLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  codeDigitBox: {
    width: 44,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.primary,
  },
  codeDigit: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['2xl'],
    color: '#FFFFFF',
  },
  codeHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  section: { gap: Spacing[3] },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  chip: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing[3.5],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  grid: { flexDirection: 'row', gap: Spacing[3] },
  cardItem: { flex: 1 },
  emptySessionsCard: {
    backgroundColor: Colors.surface,
    padding: Spacing[5],
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptySessionsText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  sessionItem: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[2],
    ...Shadows.sm,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionGameName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  sessionScore: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.md,
    color: Colors.primary,
  },
  sessionFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDate: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  sessionDetails: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  reportCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    ...Shadows.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
    gap: Spacing[3],
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  reportMeta: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.secondary,
  },
  reportSummary: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  reportSection: {
    backgroundColor: Colors.secondaryLight,
    padding: Spacing[3],
    borderRadius: BorderRadius.base,
    marginTop: Spacing[1],
  },
  reportSectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.secondaryDark,
    marginBottom: 4,
  },
  reportRecommendation: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing[1],
  },
  readMoreText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
});
