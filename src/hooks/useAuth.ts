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
    try {
      const { user: storedUser, token: storedToken } = getStoredAuth();
      setUser(storedUser);
      setToken(storedToken);
    } catch (error) {
      console.warn('Erro ao carregar autenticação:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log(`Tentando login para usuário: ${username}`);
      
      // Sempre tentar autenticação mock primeiro (mais confiável e rápida)
      const validatedUser = validateLogin(username, password);
      
      if (validatedUser) {
        console.log(`✅ Login mock bem-sucedido para: ${username}`);
        const newToken = generateMockToken(validatedUser);
        
        setUser(validatedUser);
        setToken(newToken);
        setStoredAuth(validatedUser, newToken);
        
        // Notificar usuário de que está usando sistema local
        setTimeout(async () => {
          const { toast } = await import('sonner@2.0.3');
          toast.success('🎯 Login realizado com sucesso!', {
            description: `Bem-vindo, ${validatedUser.name}! Sistema funcionando em modo local.`,
            duration: 4000
          });
        }, 100);
        
        return true;
      }
      
      // Se mock falhou, tentar Supabase apenas se online
      if (navigator.onLine) {
        console.log(`🔄 Login mock falhou, tentando Supabase para: ${username}`);
        try {
          const supabaseResponse = await supabase.login(username, password);
          
          if (supabaseResponse.success && supabaseResponse.data) {
            console.log(`✅ Login Supabase bem-sucedido para: ${username}`);
            const { user: supabaseUser, token: supabaseToken } = supabaseResponse.data;
            
            setUser(supabaseUser);
            setToken(supabaseToken);
            setStoredAuth(supabaseUser, supabaseToken);
            
            return true;
          }
        } catch (supabaseError) {
          console.warn('⚠️ Erro no Supabase, continuando com mock apenas:', supabaseError);
          // Não retornar erro, apenas continuar
        }
      } else {
        console.log('📱 Sem conexão, usando apenas validação mock');
      }
      
      console.log(`❌ Falha na autenticação para: ${username}`);
      return false;
    } catch (error) {
      console.error('❌ Erro crítico no login:', error);
      
      // Sempre tentar mock como último recurso
      console.log(`🚨 Erro crítico, usando mock de emergência para: ${username}`);
      const validatedUser = validateLogin(username, password);
      
      if (validatedUser) {
        console.log(`✅ Login de emergência bem-sucedido para: ${username}`);
        const newToken = generateMockToken(validatedUser);
        
        setUser(validatedUser);
        setToken(newToken);
        setStoredAuth(validatedUser, newToken);
        
        return true;
      }
      
      console.log(`❌ Falha completa no login para: ${username}`);
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