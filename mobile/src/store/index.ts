import { create } from 'zustand';
import { UserProfile, ChildProfile } from '../models';
import { authService } from '../services/authService';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role: 'parent' | 'therapist') => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  setUser: (user: UserProfile | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  setUser: (user) => set({ user, isInitialized: true }),

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.signIn(email, password);
      set({ user, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  signUp: async (email, password, displayName, role) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.signUp(email, password, displayName, role);
      set({ user, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await authService.signOut();
      set({ user: null, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

interface ChildrenState {
  children: ChildProfile[];
  selectedChild: ChildProfile | null;
  isLoading: boolean;
  setChildren: (children: ChildProfile[]) => void;
  selectChild: (child: ChildProfile | null) => void;
  addChild: (child: ChildProfile) => void;
  updateChild: (child: ChildProfile) => void;
  removeChild: (childId: string) => void;
}

export const useChildrenStore = create<ChildrenState>((set) => ({
  children: [],
  selectedChild: null,
  isLoading: false,

  setChildren: (children) => set({ children }),
  selectChild: (child) => set({ selectedChild: child }),
  addChild: (child) => set(state => ({ children: [...state.children, child] })),
  updateChild: (child) => set(state => ({
    children: state.children.map(c => c.id === child.id ? child : c),
    selectedChild: state.selectedChild?.id === child.id ? child : state.selectedChild,
  })),
  removeChild: (childId) => set(state => ({
    children: state.children.filter(c => c.id !== childId),
    selectedChild: state.selectedChild?.id === childId ? null : state.selectedChild,
  })),
}));
