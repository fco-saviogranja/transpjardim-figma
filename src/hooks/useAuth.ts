import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '../types';
import { getStoredAuth, setStoredAuth, clearStoredAuth, validateLogin, generateMockToken } from '../lib/auth';
import { useSupabase } from './useSupabase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();

  useEffect(() => {
    const { user: storedUser, token: storedToken } = getStoredAuth();
    setUser(storedUser);
    setToken(storedToken);
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Tentar login via Supabase primeiro
      const supabaseResponse = await supabase.login(username, password);
      
      if (supabaseResponse.success && supabaseResponse.data) {
        const { user: supabaseUser, token: supabaseToken } = supabaseResponse.data;
        
        setUser(supabaseUser);
        setToken(supabaseToken);
        setStoredAuth(supabaseUser, supabaseToken);
        
        return true;
      }
      
      // Fallback para autenticação mock
      const validatedUser = validateLogin(username, password);
      
      if (validatedUser) {
        const newToken = generateMockToken(validatedUser);
        
        setUser(validatedUser);
        setToken(newToken);
        setStoredAuth(validatedUser, newToken);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      
      // Em caso de erro no Supabase, tentar mock
      const validatedUser = validateLogin(username, password);
      
      if (validatedUser) {
        const newToken = generateMockToken(validatedUser);
        
        setUser(validatedUser);
        setToken(newToken);
        setStoredAuth(validatedUser, newToken);
        
        return true;
      }
      
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearStoredAuth();
    
    // Limpar também a view persistida
    if (typeof window !== 'undefined') {
      localStorage.removeItem('transpjardim-current-view');
    }
  };

  return {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    loading
  };
};