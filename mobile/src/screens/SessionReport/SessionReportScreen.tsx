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
import { useChildrenStore } from '../../store';
import { MetricCard } from '../../components/cards/MetricCard';
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
  const child = children.find(c => c.id === childId);
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
        
        // Load computed metrics
        const fetchedMetrics = await firestoreService.getMetrics(childId);
        const matchMetrics = fetchedMetrics.find(m => m.sessionId === sessionId);
        if (matchMetrics) setMetrics(matchMetrics);

        // Load LLM report
        const fetchedReport = await firestoreService.getLlmReport(sessionId, childId);
        if (fetchedReport) setReport(fetchedReport);

      } catch (err) {
        setError('Impossible de charger le rapport de la session.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionData();
  }, [sessionId, childId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Chargement du rapport de performance...</Text>
      </View>
    );
  }

  if (error || !session) {
    return (
      <View style={styles.container}>
        <ErrorBanner message={error || 'Une erreur inconnue est survenue.'} />
        <PrimaryButton title="Retourner à l'accueil" onPress={() => navigation.navigate('ParentTabs')} />
      </View>
    );
  }

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

        {/* Cognitive Metrics (Calculated indicators) */}
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

        {/* AI Recommendations Section */}
        {report ? (
          <View style={styles.aiSection}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiEmoji}>🧠</Text>
              <View>
                <Text style={styles.aiTitle}>Analyse FutureMinds IA</Text>
                <Text style={styles.aiSub}>Modèle : {report.model_used}</Text>
              </View>
            </View>

            {/* Child motivation text */}
            <View style={styles.childMotivationBox}>
              <Text style={styles.motivationTitle}>Pour {child?.firstName || "l'enfant"} 💖</Text>
              <Text style={styles.motivationContent}>"{report.motivation_message_for_child}"</Text>
            </View>

            {/* Summary */}
            <View style={styles.reportBlock}>
              <Text style={styles.reportBlockTitle}>Résumé de l'attention</Text>
              <Text style={styles.reportBlockText}>{report.session_summary}</Text>
            </View>

            {/* Strengths */}
            <View style={styles.reportBlock}>
              <Text style={styles.reportBlockTitle}>Forces observées</Text>
              {report.strengths.map((str, idx) => (
                <Text key={idx} style={styles.listItem}>
                  ✨ {str}
                </Text>
              ))}
            </View>

            {/* Difficulties */}
            {report.observed_difficulties.length > 0 && (
              <View style={styles.reportBlock}>
                <Text style={styles.reportBlockTitle}>Points de vigilance (Éducatif)</Text>
                {report.observed_difficulties.map((diff, idx) => (
                  <Text key={idx} style={styles.listItem}>
                    🔍 {diff}
                  </Text>
                ))}
              </View>
            )}

            {/* Recommendations */}
            <View style={styles.reportBlock}>
              <Text style={styles.reportBlockTitle}>Recommandations pour le Parent</Text>
              {report.recommendations_for_parent.map((rec, idx) => (
                <Text key={idx} style={styles.listItem}>
                  💡 {rec}
                </Text>
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

        {/* CTA Buttons */}
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
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, gap: Spacing[4] },
  loadingText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary },
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
  scroll: { paddingHorizontal: Spacing[4], paddingTop: Spacing[4], paddingBottom: Spacing[12], gap: Spacing[5] },
  heroCard: { borderRadius: BorderRadius.xl, padding: Spacing[6], alignItems: 'center', gap: Spacing[3], ...Shadows.md },
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
  disclaimerWarning: { fontFamily: FontFamily.regular, fontSize: 10, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: Spacing[2] },
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
  metricName: { fontFamily: FontFamily.medium, fontSize: 10, color: Colors.textSecondary, textAlign: 'center', marginTop: 2 },
  aiSection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[4],
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: Spacing[3] },
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
  motivationTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.accentDark, marginBottom: 2 },
  motivationContent: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textPrimary, fontStyle: 'italic', lineHeight: 18 },
  reportBlock: { gap: Spacing[1.5] },
  reportBlockTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textPrimary },
  reportBlockText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  listItem: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18, paddingLeft: 4 },
  aiSectionEmpty: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing[6], alignItems: 'center', gap: Spacing[3], borderWidth: 1, borderColor: Colors.border },
  aiEmptyText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textTertiary, textAlign: 'center' },
  finalDisclaimer: { marginHorizontal: 0 },
  ctaContainer: { gap: Spacing[3], marginTop: Spacing[2] },
});
