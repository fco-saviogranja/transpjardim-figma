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
  console.log(`🔐 Validando login mock: ${username}`);
  console.log(`👥 Usuários disponíveis:`, mockUsers.map(u => u.username));
  
  // Buscar usuário no mock
  const user = mockUsers.find(u => u.username === username);
  
  if (!user) {
    console.log(`❌ Usuário ${username} não encontrado no mock`);
    return null;
  }
  
  // Validar senhas aceitas para cada usuário
  const validPasswords = {
    'admin': ['admin', 'admin123', '123'],
    'educacao': ['123', 'user123', 'educacao'],
    'saude': ['123', 'user123', 'saude'], 
    'obras': ['123', 'user123', 'obras'],
    'ambiente': ['123', 'user123', 'ambiente'],
    'habitacao': ['123', 'user123', 'habitacao'],
    'agricultura': ['123', 'user123', 'agricultura'],
    'cultura': ['123', 'user123', 'cultura'],
    'assistencia': ['123', 'user123', 'assistencia'],
    'turismo': ['123', 'user123', 'turismo'],
    'usuario': ['usuario', 'user123', '123']
  };
  
  const userValidPasswords = validPasswords[username as keyof typeof validPasswords] || ['123'];
  
  if (userValidPasswords.includes(password)) {
    console.log(`✅ Login mock bem-sucedido para: ${username}`);
    return user;
  }
  
  console.log(`❌ Senha inválida para usuário: ${username}. Senhas aceitas:`, userValidPasswords);
  return null;
};

export const generateMockToken = (user: User): string => {
  // Em produção, viria da API
  return `mock_token_${user.id}_${Date.now()}`;
};