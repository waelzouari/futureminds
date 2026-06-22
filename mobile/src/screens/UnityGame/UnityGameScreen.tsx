import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/types';
import { useChildrenStore } from '../../store';
import { unityBridgeService, generateSimulatedGameData } from '../../services/unityBridgeService';
import { firestoreService } from '../../services/firestoreService';
import { metricsService } from '../../services/metricsService';
import { llmAnalysisService } from '../../services/llmAnalysisService';
import { WebView } from 'react-native-webview';
import { getReactionGameHtml } from '../../games/reaction_01';
import { getAttentionGameHtml } from '../../games/attention_visual_01';
import { getMemoryGameHtml } from '../../games/memory_01';
import { getInhibitionGameHtml } from '../../games/inhibition_01';
import { getSpatialGameHtml } from '../../games/spatial_3d_01';
import { getFocusGameHtml } from '../../games/focus_timer_01';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../theme';
import { GAME_INFO } from '../../models/GameSession';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'UnityGame'>;
  route: RouteProp<AppStackParamList, 'UnityGame'>;
};

export const UnityGameScreen: React.FC<Props> = ({ navigation, route }) => {
  const { gameId, childId, sessionId, difficultyLevel = 2 } = route.params;
  const { children, updateChild } = useChildrenStore();
  const child = children.find(c => c.id === childId);
  const game = GAME_INFO[gameId];

  const [isPlaying, setIsPlaying] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const getGameHtml = () => {
    switch(gameId) {
      case 'reaction_01': return getReactionGameHtml(difficultyLevel);
      case 'attention_visual_01': return getAttentionGameHtml(difficultyLevel);
      case 'memory_01': return getMemoryGameHtml(difficultyLevel);
      case 'inhibition_01': return getInhibitionGameHtml(difficultyLevel);
      case 'spatial_3d_01': return getSpatialGameHtml(difficultyLevel);
      case 'focus_timer_01': return getFocusGameHtml(difficultyLevel);
      default: return getReactionGameHtml(difficultyLevel); // Fallback
    }
  };

  const handleGameFinished = async (gameResults: any) => {
    if (!child || !game) return;
    setIsPlaying(false);
    setIsProcessing(true);
    
    try {
      const mockResult = {
        ...gameResults,
        gameId,
        childId,
        sessionId,
        difficultyLevel,
        timestamp: new Date().toISOString(),
      };

      // 2. Save Session Data
      const gameSessionData = {
        ...mockResult,
        id: sessionId,
        durationSeconds: mockResult.focusDuration,
      };
      await firestoreService.saveSession(gameSessionData);

      // 3. Compute Metrics
      const computedMetrics = metricsService.computeMetrics(gameSessionData, []);
      await firestoreService.saveMetrics(computedMetrics);

      // 4. Update Child aggregates
      const updatedTotalSessions = child.totalSessions + 1;
      const updatedAvgScore = child.totalSessions === 0
        ? mockResult.score
        : (child.averageScore * child.totalSessions + mockResult.score) / updatedTotalSessions;

      const childUpdates = {
        totalSessions: updatedTotalSessions,
        averageScore: updatedAvgScore,
        lastSessionDate: new Date(),
        lastSessionGameId: gameId,
      };
      await firestoreService.updateChild(childId, childUpdates, child.parentId);
      updateChild({
        ...child,
        ...childUpdates,
      });

      // 5. Query LLM Recommender backend (fallback to offline mock is inside service)
      const llmReport = await llmAnalysisService.analyzSession(
        {
          childProfile: {
            firstName: child.firstName,
            age: child.age,
            schoolLevel: child.schoolLevel,
            observedDifficulties: child.observedDifficulties,
            totalSessions: updatedTotalSessions,
          },
          sessionData: mockResult,
          computedMetrics,
          recentHistory: [],
        },
        childId,
        sessionId
      );

      // Save LLM report
      await firestoreService.saveLlmReport(llmReport);

      setIsProcessing(false);
      // Navigate to Session Report
      navigation.replace('SessionReport', {
        sessionId,
        childId,
        gameId,
      });

    } catch (err) {
      setIsProcessing(false);
      Alert.alert(
        'Erreur de synchronisation',
        "Le jeu s'est terminé mais une erreur est survenue lors de l'enregistrement des données.",
        [{ text: 'Ok', onPress: () => navigation.replace('ParentTabs') }]
      );
    }
  };

  const handleQuit = () => {
    Alert.alert(
      'Quitter la partie',
      'Es-tu sûr de vouloir quitter le jeu en cours ? Tes progrès ne seront pas enregistrés.',
      [
        { text: 'Rester', style: 'cancel' },
        { text: 'Quitter', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  if (!child || !game) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Jeu ou profil enfant invalide.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Simulation Screen Overlay */}
      <View style={styles.gameView}>
        <View style={styles.gameHeader}>
          <TouchableOpacity style={styles.quitBtn} onPress={handleQuit}>
            <Text style={styles.quitText}>✕ Quitter</Text>
          </TouchableOpacity>
          <Text style={styles.gameNameHeader}>{game.title}</Text>
          <Text style={styles.levelHeader}>Niv. {difficultyLevel}</Text>
        </View>

        {/* Central visual simulator workspace */}
        <View style={styles.simulatorBody}>
          <Text style={styles.gameIconBig}>{game.icon}</Text>
          
          {isPlaying && (
            <View style={styles.webViewContainer}>
              <WebView
                source={{ html: getGameHtml() }}
                style={styles.webView}
                scrollEnabled={false}
                bounces={false}
                onMessage={(event) => {
                  try {
                    const results = JSON.parse(event.nativeEvent.data);
                    handleGameFinished(results);
                  } catch (e) {
                    console.error("Failed to parse game results:", e);
                  }
                }}
              />
            </View>
          )}

          {isProcessing && (
            <View style={styles.processingConsole} />
          )}
        </View>

        {/* Informative Footer */}
        <View style={styles.simFooter}>
          <Text style={styles.footerDisclaimer}>
            Mini-jeu interactif HTML5 intégré. Cette application ne remplace pas l'avis d'un professionnel de santé.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F6FF' },
  gameView: { flex: 1, justifyContent: 'space-between', paddingHorizontal: Spacing[4], paddingTop: Spacing[2] },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[1],
  },
  quitBtn: {
    backgroundColor: '#FFE8EE',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: '#F5BCDA',
  },
  quitText: { color: '#E84393', fontFamily: FontFamily.semiBold, fontSize: FontSize.sm },
  gameNameHeader: { color: '#1A2340', fontFamily: FontFamily.bold, fontSize: FontSize.base },
  levelHeader: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    backgroundColor: '#4A90E2',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
  },
  simulatorBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: Spacing[6],
  },
  gameIconBig: { fontSize: 80, textAlign: 'center' },
  webViewContainer: { flex: 1, borderRadius: BorderRadius.xl, overflow: 'hidden', backgroundColor: '#F0F6FF' },
  webView: { flex: 1, backgroundColor: 'transparent' },
  processingConsole: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing[5], gap: 8 },
  processingText: { color: '#4A90E2', fontFamily: FontFamily.bold, fontSize: FontSize.md },
  processingDesc: { color: '#6B7A99', fontFamily: FontFamily.regular, fontSize: FontSize.xs, textAlign: 'center', lineHeight: 16 },
  simFooter: {
    paddingVertical: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: '#DDE8FF',
  },
  footerDisclaimer: { color: '#6B7A99', fontSize: 10, fontFamily: FontFamily.regular, textAlign: 'center' },
  errorText: { color: '#E84393', fontSize: FontSize.md, fontFamily: FontFamily.bold, textAlign: 'center', marginTop: 100 },
});
