import { UnityGameResult, GAME_INFO } from '../models/GameSession';

/**
 * Unity Bridge Service
 * 
 * Gère la communication entre React Native et les jeux Unity via WebView.
 * Si Unity n'est pas disponible, le simulateur génère des données réalistes.
 */

export type GameMode = 'unity' | 'simulator';

interface UnityMessage {
  type: 'GAME_RESULT' | 'GAME_READY' | 'GAME_ERROR' | 'GAME_PROGRESS';
  payload: any;
}

export type GameResultCallback = (result: UnityGameResult) => void;
export type GameErrorCallback = (error: string) => void;

class UnityBridgeService {
  private resultCallbacks: Map<string, GameResultCallback> = new Map();
  private errorCallbacks: Map<string, GameErrorCallback> = new Map();

  /**
   * Gère les messages reçus de la WebView Unity.
   * À appeler depuis le handler onMessage de la WebView.
   */
  handleWebViewMessage(data: string, sessionId: string): void {
    try {
      const message: UnityMessage = JSON.parse(data);

      if (message.type === 'GAME_RESULT') {
        const result = message.payload as UnityGameResult;
        const callback = this.resultCallbacks.get(sessionId);
        if (callback) {
          callback(result);
          this.resultCallbacks.delete(sessionId);
          this.errorCallbacks.delete(sessionId);
        }
      }

      if (message.type === 'GAME_ERROR') {
        const callback = this.errorCallbacks.get(sessionId);
        if (callback) {
          callback(message.payload.error || 'Erreur du jeu Unity.');
          this.resultCallbacks.delete(sessionId);
          this.errorCallbacks.delete(sessionId);
        }
      }
    } catch (err) {
      console.warn('[UnityBridge] Failed to parse WebView message:', data);
    }
  }

  /**
   * Génère le JavaScript à injecter dans la WebView pour
   * initialiser Unity avec les paramètres de session.
   */
  getInitScript(childId: string, sessionId: string): string {
    return `
      window.FutureMindsSession = {
        childId: "${childId}",
        sessionId: "${sessionId}",
        sendResult: function(result) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'GAME_RESULT',
            payload: result
          }));
        },
        sendError: function(error) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'GAME_ERROR',
            payload: { error }
          }));
        }
      };
      true;
    `;
  }

  /**
   * Enregistre les callbacks pour une session.
   */
  registerCallbacks(
    sessionId: string,
    onResult: GameResultCallback,
    onError: GameErrorCallback
  ): void {
    this.resultCallbacks.set(sessionId, onResult);
    this.errorCallbacks.set(sessionId, onError);
  }

  /**
   * Nettoie les callbacks d'une session.
   */
  cleanup(sessionId: string): void {
    this.resultCallbacks.delete(sessionId);
    this.errorCallbacks.delete(sessionId);
  }
}

/**
 * Générateur de données de session réalistes.
 * Simule un enfant jouant avec une variabilité naturelle.
 */
export function generateSimulatedGameData(
  gameId: string,
  childId: string,
  sessionId: string,
  difficultyLevel: number = 2,
  previousScore?: number
): UnityGameResult {
  // Variabilité naturelle : l'enfant progresse légèrement à chaque session
  const baseLine = previousScore ? Math.min(previousScore + Math.random() * 10 - 3, 95) : 55 + Math.random() * 25;

  // Paramètres selon la difficulté
  const difficultyFactor = 1 + (difficultyLevel - 1) * 0.15;
  const score = Math.round(Math.max(20, Math.min(98, baseLine + (Math.random() * 20 - 10))));

  // Métriques avec variabilité réaliste
  const totalTargets = Math.round(15 + difficultyLevel * 5);
  const correctRate = score / 100;
  const correctAnswers = Math.round(totalTargets * correctRate);
  const missedTargets = Math.round((totalTargets - correctAnswers) * 0.6);
  const numberOfErrors = totalTargets - correctAnswers - missedTargets;
  const impulsiveClicks = Math.round(Math.max(0, (100 - score) / 20 + Math.random() * 3));

  // Temps de réaction : 0.7s (rapide) à 2.5s (lent), amélioré par la pratique
  const reactionTime = Math.round(
    (0.7 + (2.5 - 0.7) * (1 - correctRate * 0.7) + (Math.random() * 0.4 - 0.2)) * 10
  ) / 10;

  // Durée de focus (secondes) : varie selon la difficulté et le score
  const focusDuration = Math.round(90 + difficultyLevel * 30 * correctRate + Math.random() * 30);

  return {
    gameId,
    childId,
    sessionId,
    score,
    reactionTime: Math.max(0.4, Math.min(3.5, reactionTime)),
    numberOfErrors: Math.max(0, numberOfErrors),
    correctAnswers,
    missedTargets: Math.max(0, missedTargets),
    impulsiveClicks,
    focusDuration,
    levelCompleted: score >= 60 && correctAnswers >= totalTargets * 0.5,
    difficultyLevel,
    timestamp: new Date().toISOString(),
  };
}

export const unityBridgeService = new UnityBridgeService();
