export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'parent' | 'therapist';
  createdAt: Date;
  childrenIds: string[];
  photoURL?: string;
}

export interface UserProfile extends User {
  lastLoginAt?: Date;
  notificationsEnabled: boolean;
  language: 'fr' | 'en';
}
