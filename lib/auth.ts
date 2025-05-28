import { User, Role } from '@/types';

// Mock authentication for demo purposes
// In a real app, you would use a proper auth provider

const STORAGE_KEY = 'delivertrack_auth';

export const login = (email: string, password: string, role: Role): User | null => {
  // In a real app, this would validate credentials against a backend
  // For demo, we'll create a mock user based on the email and role
  const user: User = {
    id: Math.random().toString(36).substring(2, 9),
    name: email.split('@')[0],
    email,
    role,
  };
  
  // Store in localStorage for persistence
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
};

export const register = (name: string, email: string, password: string, role: Role): User | null => {
  // In a real app, this would create a user in the backend
  // For demo, we'll create a mock user
  const user: User = {
    id: Math.random().toString(36).substring(2, 9),
    name,
    email,
    role,
  };
  
  // Store in localStorage for persistence
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userJson = localStorage.getItem(STORAGE_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Failed to parse user from localStorage', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const hasRole = (role: Role): boolean => {
  const user = getCurrentUser();
  return user !== null && user.role === role;
};