import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/types';
import { firestoreService } from '../../services/firestoreService';
import { useChildrenStore, useChildAuthStore } from '../../store';
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Buttons';
import { ErrorBanner, MedicalDisclaimer } from '../../components/feedback/Feedback';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius, Shadows } from '../../theme';
import { GameSession, LlmReport, Metrics, GAME_INFO } from '../../models';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'SessionReport'>;
  route: RouteProp<AppStackParamList, 'SessionReport'>;
};

export const SessionReportScreen: React.FC<Props> = ({ navigation, route }) => {
  const { sessionId, childId, gameId } = route.params;
  const { children } = useChildrenStore();
  const { childSession } = useChildAuthStore();

  // Détecter si c'est un enfant connecté
  const isChildView = childSession !== null;

  const child = isChildView ? childSession : children.find(c => c.id === childId);
  const game = GAME_INFO[gameId];

  const [session, setSession] = useState<GameSession | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [report, setReport] = useState<LlmReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessionData = async () => {
      try {
        const fetchedSessions = await firestoreService.getSessions(childId);
        const matchSession = fetchedSessions.find(s => s.sessionId === sessionId);

        if (!matchSession) {
          setError('Session introuvable.');
          setIsLoading(false);
          return;
        }

        setSession(matchSession);

        // Charger les métriques (pour les deux vues)
        const fetchedMetrics = await firestoreService.getMetrics(childId);
        const matchMetrics = fetchedMetrics.find(m => m.sessionId === sessionId);
        if (matchMetrics) setMetrics(matchMetrics);

        // Charger le rapport IA — uniquement si vue parent
        if (!isChildView) {
          const fetchedReport = await firestoreService.getLlmReport(sessionId, childId);
          if (fetchedReport) setReport(fetchedReport);
        }
      } catch (err) {
        setError('Impossible de charger les résultats.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionData();
  }, [sessionId, childId, isChildView]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={isChildView ? '#FF6B9D' : Colors.primary} />
        <Text style={styles.loadingText}>
          {isChildView ? 'Calcul de ton score...' : 'Chargement du rapport de performance...'}
        </Text>
      </View>
    );
  }

  if (error || !session) {
    return (
      <View style={styles.container}>
        <ErrorBanner message={error || 'Une erreur inconnue est survenue.'} />
        <PrimaryButton
          title="Retourner à l'accueil"
          onPress={() => isChildView
            ? navigation.navigate('ChildDashboard', { childId })
            : navigation.navigate('ParentTabs')
          }
        />
      </View>
    );
  }

  // ─── VUE ENFANT ─────────────────────────────────────────────────────────────
  if (isChildView) {
    const score = session.score;
    const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1;
    const starRow = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

    const getMessage = () => {
      if (score >= 80) return { emoji: '🏆', text: 'Incroyable ! Tu es un champion !', color: '#FFD700' };
      if (score >= 50) return { emoji: '🎉', text: 'Bien joué ! Continue comme ça !', color: '#FF6B9D' };
      return { emoji: '💪', text: 'Bonne tentative ! Réessaie pour t\'améliorer !', color: '#4A7CF7' };
    };

    const msg = getMessage();

    return (
      <LinearGradient
        colors={['#1A1F3A', '#2D1B69', '#1A1F3A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.childGradient}
      >
        {/* Déco */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        <ScrollView
          contentContainerStyle={styles.childScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header enfant */}
          <View style={styles.childHeader}>
            <Text style={styles.childHeaderTitle}>{game?.title || 'Mini-Jeu'}</Text>
          </View>

          {/* Score hero */}
          <View style={styles.childHero}>
            <Text style={styles.childHeroEmoji}>{msg.emoji}</Text>
            <Text style={[styles.childScoreNumber, { color: msg.color }]}>{score}</Text>
            <Text style={styles.childScoreLabel}>points</Text>
            <Text style={styles.childStars}>{starRow}</Text>
            <Text style={styles.childMessage}>{msg.text}</Text>
          </View>

          {/* Stats simples */}
          <View style={styles.childStatsRow}>
            <View style={styles.childStatCard}>
              <Text style={styles.childStatEmoji}>⏱️</Text>
              <Text style={styles.childStatValue}>{Math.round(session.duration)}s</Text>
              <Text style={styles.childStatLabel}>Durée</Text>
            </View>
            <View style={styles.childStatCard}>
              <Text style={styles.childStatEmoji}>🎯</Text>
              <Text style={styles.childStatValue}>{session.correctAnswers ?? '—'}</Text>
              <Text style={styles.childStatLabel}>Bonnes réponses</Text>
            </View>
            <View style={styles.childStatCard}>
              <Text style={styles.childStatEmoji}>🔥</Text>
              <Text style={styles.childStatValue}>{session.difficultyLevel}</Text>
              <Text style={styles.childStatLabel}>Niveau</Text>
            </View>
          </View>

          {/* Notice rapport parent */}
          <View style={styles.parentNoticeCard}>
            <Text style={styles.parentNoticeIcon}>📋</Text>
            <View style={styles.parentNoticeText}>
              <Text style={styles.parentNoticeTitle}>Rapport envoyé à ton parent</Text>
              <Text style={styles.parentNoticeDesc}>
                Tes parents pourront consulter ton analyse détaillée depuis leur espace.
              </Text>
            </View>
          </View>

          {/* Boutons */}
          <View style={styles.childCtaContainer}>
            <TouchableOpacity
              style={styles.childPlayAgainBtn}
              onPress={() =>
                navigation.replace('UnityGame', {
                  gameId,
                  childId,
                  sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                  difficultyLevel: session.difficultyLevel,
                })
              }
            >
              <LinearGradient
                colors={['#FF6B9D', '#FF8E53']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.childPlayAgainGradient}
              >
                <Text style={styles.childPlayAgainText}>🎮  Rejouer</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.childHomeBtn}
              onPress={() => navigation.navigate('ChildDashboard', { childId })}
            >
              <Text style={styles.childHomeBtnText}>🏠  Mon espace</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ─── VUE PARENT (rapport complet) ──────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rapport de Performance</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.navigate('ParentTabs')}
        >
          <Text style={styles.closeText}>Terminer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Score Hero Card */}
        <LinearGradient
          colors={Colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroGameTitle}>{game?.title || 'Mini-Jeu'}</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{session.score}</Text>
            <Text style={styles.scoreLabel}>Score final</Text>
          </View>
          <Text style={styles.levelLabel}>Niveau de difficulté : {session.difficultyLevel}</Text>
          <Text style={styles.disclaimerWarning}>
            * Résultat indicatif à visée éducative. Pas de diagnostic médical.
          </Text>
        </LinearGradient>

        {/* Cognitive Metrics */}
        {metrics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Indicateurs d'attention & de réaction</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricEmoji}>🎯</Text>
                <Text style={styles.metricVal}>{metrics.attentionScore}%</Text>
                <Text style={styles.metricName}>Attention soutenue</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricEmoji}>⚡</Text>
                <Text style={styles.metricVal}>{metrics.reactionScore}%</Text>
                <Text style={styles.metricName}>Vitesse de réaction</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricEmoji}>🛑</Text>
                <Text style={styles.metricVal}>{100 - metrics.impulsivityScore}%</Text>
                <Text style={styles.metricName}>Contrôle d'inhibition</Text>
              </View>
            </View>
          </View>
        )}

        {/* AI Analysis — parent only */}
        {report ? (
          <View style={styles.aiSection}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiEmoji}>🧠</Text>
              <View>
                <Text style={styles.aiTitle}>Analyse FutureMinds IA</Text>
                <Text style={styles.aiSub}>Modèle : {report.model_used}</Text>
              </View>
            </View>

            {/* Child motivation (visible au parent pour info) */}
            <View style={styles.childMotivationBox}>
              <Text style={styles.motivationTitle}>Message envoyé à {child?.firstName || "l'enfant"} 💖</Text>
              <Text style={styles.motivationContent}>"{report.motivation_message_for_child}"</Text>
            </View>

            <View style={styles.reportBlock}>
              <Text style={styles.reportBlockTitle}>Résumé de l'attention</Text>
              <Text style={styles.reportBlockText}>{report.session_summary}</Text>
            </View>

            <View style={styles.reportBlock}>
              <Text style={styles.reportBlockTitle}>Forces observées</Text>
              {report.strengths.map((str, idx) => (
                <Text key={idx} style={styles.listItem}>✨ {str}</Text>
              ))}
            </View>

            {report.observed_difficulties.length > 0 && (
              <View style={styles.reportBlock}>
                <Text style={styles.reportBlockTitle}>Points de vigilance (Éducatif)</Text>
                {report.observed_difficulties.map((diff, idx) => (
                  <Text key={idx} style={styles.listItem}>🔍 {diff}</Text>
                ))}
              </View>
            )}

            <View style={styles.reportBlock}>
              <Text style={styles.reportBlockTitle}>Recommandations pour le Parent</Text>
              {report.recommendations_for_parent.map((rec, idx) => (
                <Text key={idx} style={styles.listItem}>💡 {rec}</Text>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.aiSectionEmpty}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.aiEmptyText}>Génération des recommandations éducatives par l'IA...</Text>
          </View>
        )}

        <MedicalDisclaimer style={styles.finalDisclaimer} />

        <View style={styles.ctaContainer}>
          <PrimaryButton
            title="Retour au Dashboard"
            onPress={() => navigation.navigate('ParentTabs')}
          />
          <SecondaryButton
            title="Rejouer"
            onPress={() =>
              navigation.replace('UnityGame', {
                gameId,
                childId,
                sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                difficultyLevel: session.difficultyLevel,
              })
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // ── Commun ──────────────────────────────────────────────────────────────────
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    gap: Spacing[4],
  },
  loadingText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
  },

  // ── Vue Enfant ───────────────────────────────────────────────────────────────
  childGradient: { flex: 1, overflow: 'hidden' },
  decorCircle1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,107,157,0.09)',
    top: -60,
    right: -80,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(74,124,247,0.07)',
    bottom: 60,
    left: -60,
  },
  childScroll: {
    paddingTop: 60,
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[12],
    gap: Spacing[5],
  },
  childHeader: { alignItems: 'center' },
  childHeaderTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['2xl'],
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  childHero: {
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[4],
  },
  childHeroEmoji: { fontSize: 60 },
  childScoreNumber: {
    fontFamily: FontFamily.extraBold,
    fontSize: 72,
    letterSpacing: -2,
  },
  childScoreLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.lg,
    color: 'rgba(255,255,255,0.55)',
    marginTop: -Spacing[2],
  },
  childStars: {
    fontSize: 32,
    letterSpacing: 4,
    marginTop: Spacing[1],
  },
  childMessage: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: Spacing[2],
    paddingHorizontal: Spacing[4],
  },
  childStatsRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  childStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    alignItems: 'center',
    gap: Spacing[1],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  childStatEmoji: { fontSize: 26 },
  childStatValue: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.xl,
    color: '#FFFFFF',
  },
  childStatLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  parentNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74,124,247,0.15)',
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(74,124,247,0.3)',
  },
  parentNoticeIcon: { fontSize: 28 },
  parentNoticeText: { flex: 1, gap: Spacing[1] },
  parentNoticeTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: '#FFFFFF',
  },
  parentNoticeDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 16,
  },
  childCtaContainer: { gap: Spacing[3], marginTop: Spacing[2] },
  childPlayAgainBtn: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.lg,
  },
  childPlayAgainGradient: {
    paddingVertical: Spacing[4],
    alignItems: 'center',
  },
  childPlayAgainText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: '#FFFFFF',
  },
  childHomeBtn: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: BorderRadius['2xl'],
    paddingVertical: Spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  childHomeBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.8)',
  },

  // ── Vue Parent ───────────────────────────────────────────────────────────────
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
  headerTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary },
  closeButton: { paddingVertical: Spacing[2], paddingHorizontal: Spacing[3] },
  closeText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.primary },
  scroll: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[12],
    gap: Spacing[5],
  },
  heroCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing[6],
    alignItems: 'center',
    gap: Spacing[3],
    ...Shadows.md,
  },
  heroGameTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textInverse },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.textInverse,
  },
  scoreNumber: { fontFamily: FontFamily.extraBold, fontSize: FontSize['4xl'], color: Colors.textInverse },
  scoreLabel: { fontFamily: FontFamily.regular, fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: -2 },
  levelLabel: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.textInverse },
  disclaimerWarning: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: Spacing[2],
  },
  section: { gap: Spacing[3] },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.textPrimary },
  metricsGrid: { flexDirection: 'row', gap: Spacing[2] },
  metricItem: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[3],
    alignItems: 'center',
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricEmoji: { fontSize: 24, marginBottom: 4 },
  metricVal: { fontFamily: FontFamily.extraBold, fontSize: FontSize.md, color: Colors.primary },
  metricName: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  aiSection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[4],
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing[3],
  },
  aiEmoji: { fontSize: 32 },
  aiTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.textPrimary },
  aiSub: { fontFamily: FontFamily.medium, fontSize: 10, color: Colors.textTertiary },
  childMotivationBox: {
    backgroundColor: Colors.accentLight,
    borderRadius: BorderRadius.base,
    padding: Spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  motivationTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.accentDark,
    marginBottom: 2,
  },
  motivationContent: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  reportBlock: { gap: Spacing[1.5] },
  reportBlockTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textPrimary },
  reportBlockText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  listItem: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    paddingLeft: 4,
  },
  aiSectionEmpty: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[6],
    alignItems: 'center',
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aiEmptyText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  finalDisclaimer: { marginHorizontal: 0 },
  ctaContainer: { gap: Spacing[3], marginTop: Spacing[2] },
});
