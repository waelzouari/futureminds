// Child Auth Service
// Handles child login by numeric code only (no email/password)
// Persists child session independently from parent session

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildProfile } from '../models';
import { firestoreService } from './firestoreService';

const CURRENT_CHILD_KEY = '@futureminds_current_child';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ChildAuthService {
  private currentChild: ChildProfile | null = null;
  private listeners: Array<(child: ChildProfile | null) => void> = [];

  private notifyListeners(child: ChildProfile | null): void {
    this.listeners.forEach(listener => listener(child));
  }

  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(CURRENT_CHILD_KEY);
      if (stored) {
        this.currentChild = JSON.parse(stored);
        this.notifyListeners(this.currentChild);
      }
    } catch {
      this.currentChild = null;
    }
  }

  onChildAuthStateChanged(callback: (child: ChildProfile | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentChild);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async signInWithCode(code: string): Promise<ChildProfile> {
    await delay(600);
    const trimmedCode = code.trim();
    if (!/^\d{4}$/.test(trimmedCode)) {
      throw new Error('Le code doit être composé de 4 chiffres.');
    }
    const child = await firestoreService.getChildByCode(trimmedCode);
    if (!child) {
      throw new Error('Code incorrect. Demande à ton parent de vérifier ton code.');
    }
    this.currentChild = child;
    await AsyncStorage.setItem(CURRENT_CHILD_KEY, JSON.stringify(child));
    this.notifyListeners(this.currentChild);
    return child;
  }

  async signOut(): Promise<void> {
    this.currentChild = null;
    await AsyncStorage.removeItem(CURRENT_CHILD_KEY);
    this.notifyListeners(null);
  }

  getCurrentChild(): ChildProfile | null {
    return this.currentChild;
  }

  isAuthenticated(): boolean {
    return this.currentChild !== null;
  }
}

export const childAuthService = new ChildAuthService();
