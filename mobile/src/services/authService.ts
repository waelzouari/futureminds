// Mock Firebase Auth Service
// This service provides full auth functionality using in-memory storage
// Replace with real Firebase Auth when credentials are configured

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserProfile } from '../models';

const MOCK_USERS_KEY = '@futureminds_mock_users';
const CURRENT_USER_KEY = '@futureminds_current_user';

interface MockUser extends UserProfile {
  passwordHash: string;
}

// Simulate async delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class AuthService {
  private currentUser: UserProfile | null = null;
  private listeners: Array<(user: UserProfile | null) => void> = [];

  private async getMockUsers(): Promise<MockUser[]> {
    try {
      const stored = await AsyncStorage.getItem(MOCK_USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async saveMockUsers(users: MockUser[]): Promise<void> {
    await AsyncStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  }

  private notifyListeners(user: UserProfile | null): void {
    this.listeners.forEach(listener => listener(user));
  }

  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
        this.notifyListeners(this.currentUser);
      }
    } catch {
      this.currentUser = null;
    }
  }

  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    this.listeners.push(callback);
    // Immediately call with current state
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async signIn(email: string, password: string): Promise<UserProfile> {
    await delay(800);
    const users = await this.getMockUsers();
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password
    );
    if (!user) {
      throw new Error('Email ou mot de passe incorrect.');
    }
    const { passwordHash, ...profile } = user;
    this.currentUser = profile;
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
    this.notifyListeners(this.currentUser);
    return profile;
  }

  async signUp(
    email: string,
    password: string,
    displayName: string,
    role: 'parent' | 'therapist'
  ): Promise<UserProfile> {
    await delay(1000);
    const users = await this.getMockUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('Un compte existe déjà avec cet email.');
    }

    const newUser: MockUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      displayName,
      role,
      createdAt: new Date(),
      childrenIds: [],
      notificationsEnabled: true,
      language: 'fr',
      passwordHash: password,
    };

    await this.saveMockUsers([...users, newUser]);
    const { passwordHash, ...profile } = newUser;
    this.currentUser = profile;
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
    this.notifyListeners(this.currentUser);
    return profile;
  }

  async signOut(): Promise<void> {
    await delay(300);
    this.currentUser = null;
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    this.notifyListeners(null);
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.currentUser) throw new Error('Aucun utilisateur connecté.');
    const updated = { ...this.currentUser, ...updates };
    const users = await this.getMockUsers();
    const idx = users.findIndex(u => u.id === this.currentUser!.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updates };
      await this.saveMockUsers(users);
    }
    this.currentUser = updated;
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    return updated;
  }

  async addChildToUser(childId: string): Promise<void> {
    if (!this.currentUser) throw new Error('Aucun utilisateur connecté.');
    const updatedChildrenIds = [...(this.currentUser.childrenIds || []), childId];
    await this.updateProfile({ childrenIds: updatedChildrenIds });
  }

  async removeChildFromUser(childId: string): Promise<void> {
    if (!this.currentUser) throw new Error('Aucun utilisateur connecté.');
    const updatedChildrenIds = (this.currentUser.childrenIds || []).filter(id => id !== childId);
    await this.updateProfile({ childrenIds: updatedChildrenIds });
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}

export const authService = new AuthService();
