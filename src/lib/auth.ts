import { User } from '../types';
import { mockUsers } from './mockData';

export const AUTH_STORAGE_KEY = 'transpjardim_auth';

export interface AuthContext {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const getStoredAuth = (): { user: User | null; token: string | null } => {
  if (typeof window === 'undefined') return { user: null, token: null };
  
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return { user: null, token: null };
  
  try {
    return JSON.parse(stored);
  } catch {
    return { user: null, token: null };
  }
};

export const setStoredAuth = (user: User, token: string) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
};

export const clearStoredAuth = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const validateLogin = (username: string, password: string): User | null => {
  // Simulação de validação - em produção viria da API
  const user = mockUsers.find(u => u.username === username);
  
  // Para demo, qualquer senha serve
  if (user && password.length > 0) {
    return user;
  }
  
  return null;
};

export const generateMockToken = (user: User): string => {
  // Em produção, viria da API
  return `mock_token_${user.id}_${Date.now()}`;
};