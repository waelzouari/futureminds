// Mock Firestore Service
// Full CRUD with AsyncStorage persistence
// Replace with Firebase Firestore when credentials are configured

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildProfile, GameSession, Metrics, LlmReport } from '../models';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Children ────────────────────────────────────────────────────────────────
async function getChildren(parentId: string): Promise<ChildProfile[]> {
  await delay(300);
  const stored = await AsyncStorage.getItem(`@futureminds_children_${parentId}`);
  return stored ? JSON.parse(stored) : [];
}

async function getChild(childId: string, parentId: string): Promise<ChildProfile | null> {
  const children = await getChildren(parentId);
  return children.find(c => c.id === childId) || null;
}

async function createChild(
  child: Omit<ChildProfile, 'id' | 'createdAt' | 'updatedAt' | 'totalSessions' | 'averageScore'>,
  parentId: string
): Promise<ChildProfile> {
  await delay(500);
  const newChild: ChildProfile = {
    ...child,
    id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    parentId,
    createdAt: new Date(),
    updatedAt: new Date(),
    totalSessions: 0,
    averageScore: 0,
    isActive: true,
  };
  const children = await getChildren(parentId);
  await AsyncStorage.setItem(
    `@futureminds_children_${parentId}`,
    JSON.stringify([...children, newChild])
  );
  return newChild;
}

async function updateChild(
  childId: string,
  updates: Partial<ChildProfile>,
  parentId: string
): Promise<ChildProfile> {
  await delay(400);
  const children = await getChildren(parentId);
  const idx = children.findIndex(c => c.id === childId);
  if (idx < 0) throw new Error('Profil enfant non trouvé.');
  children[idx] = { ...children[idx], ...updates, updatedAt: new Date() };
  await AsyncStorage.setItem(
    `@futureminds_children_${parentId}`,
    JSON.stringify(children)
  );
  return children[idx];
}

async function deleteChild(childId: string, parentId: string): Promise<void> {
  await delay(400);
  const children = await getChildren(parentId);
  const filtered = children.filter(c => c.id !== childId);
  await AsyncStorage.setItem(
    `@futureminds_children_${parentId}`,
    JSON.stringify(filtered)
  );
  // Also remove sessions
  await AsyncStorage.removeItem(`@futureminds_sessions_${childId}`);
  await AsyncStorage.removeItem(`@futureminds_reports_${childId}`);
}

// ─── Sessions ─────────────────────────────────────────────────────────────────
async function getSessions(childId: string, limit?: number): Promise<GameSession[]> {
  await delay(300);
  const stored = await AsyncStorage.getItem(`@futureminds_sessions_${childId}`);
  const sessions: GameSession[] = stored ? JSON.parse(stored) : [];
  const sorted = sessions.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return limit ? sorted.slice(0, limit) : sorted;
}

async function saveSession(session: GameSession): Promise<void> {
  await delay(400);
  const sessions = await getSessions(session.childId);
  const existing = sessions.findIndex(s => s.id === session.id);
  let updated: GameSession[];
  if (existing >= 0) {
    updated = sessions.map(s => (s.id === session.id ? session : s));
  } else {
    updated = [session, ...sessions];
  }
  await AsyncStorage.setItem(
    `@futureminds_sessions_${session.childId}`,
    JSON.stringify(updated)
  );
}

// ─── Metrics ──────────────────────────────────────────────────────────────────
async function saveMetrics(metrics: Metrics): Promise<void> {
  await delay(200);
  const key = `@futureminds_metrics_${metrics.childId}`;
  const stored = await AsyncStorage.getItem(key);
  const all: Metrics[] = stored ? JSON.parse(stored) : [];
  const existing = all.findIndex(m => m.sessionId === metrics.sessionId);
  if (existing >= 0) {
    all[existing] = metrics;
  } else {
    all.unshift(metrics);
  }
  await AsyncStorage.setItem(key, JSON.stringify(all));
}

async function getMetrics(childId: string, limit?: number): Promise<Metrics[]> {
  await delay(200);
  const stored = await AsyncStorage.getItem(`@futureminds_metrics_${childId}`);
  const all: Metrics[] = stored ? JSON.parse(stored) : [];
  return limit ? all.slice(0, limit) : all;
}

// ─── LLM Reports ─────────────────────────────────────────────────────────────
async function saveLlmReport(report: LlmReport): Promise<void> {
  await delay(200);
  const key = `@futureminds_reports_${report.childId}`;
  const stored = await AsyncStorage.getItem(key);
  const all: LlmReport[] = stored ? JSON.parse(stored) : [];
  const existing = all.findIndex(r => r.sessionId === report.sessionId);
  if (existing >= 0) {
    all[existing] = report;
  } else {
    all.unshift(report);
  }
  await AsyncStorage.setItem(key, JSON.stringify(all.slice(0, 50))); // Keep last 50
}

async function getLlmReport(sessionId: string, childId: string): Promise<LlmReport | null> {
  const key = `@futureminds_reports_${childId}`;
  const stored = await AsyncStorage.getItem(key);
  const all: LlmReport[] = stored ? JSON.parse(stored) : [];
  return all.find(r => r.sessionId === sessionId) || null;
}

async function getLlmReports(childId: string, limit?: number): Promise<LlmReport[]> {
  const key = `@futureminds_reports_${childId}`;
  const stored = await AsyncStorage.getItem(key);
  const all: LlmReport[] = stored ? JSON.parse(stored) : [];
  return limit ? all.slice(0, limit) : all;
}

export const firestoreService = {
  // Children
  getChildren,
  getChild,
  createChild,
  updateChild,
  deleteChild,
  // Sessions
  getSessions,
  saveSession,
  // Metrics
  saveMetrics,
  getMetrics,
  // Reports
  saveLlmReport,
  getLlmReport,
  getLlmReports,
};
