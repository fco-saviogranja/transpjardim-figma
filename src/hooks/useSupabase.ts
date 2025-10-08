import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Criterio, Alerta } from '../types';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-225e1157`;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const useSupabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = async <T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout mais rápido

      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      
      if (!response.ok) {
        const errorMsg = data.error || data.message || `Erro HTTP ${response.status}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      let errorMessage = 'Erro de conexão com o servidor';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Timeout na conexão (5s) - servidor muito lento ou indisponível';
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Não foi possível conectar ao servidor';
        } else if (err.message.includes('NetworkError')) {
          errorMessage = 'Erro de rede ou CORS';
        } else if (err.message && err.message.trim()) {
          errorMessage = err.message.trim();
        }
      }
      
      // Garantir que sempre temos uma mensagem válida
      if (!errorMessage || !errorMessage.trim()) {
        errorMessage = 'Erro desconhecido de conexão';
      }
      
      setError(errorMessage);
      
      // Log mais detalhado para debug
      console.error('Erro na API Supabase:', {
        endpoint,
        error: errorMessage,
        originalError: err,
        url: `${API_BASE}${endpoint}`,
        timeout: '5s'
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CRITÉRIOS
  // ============================================

  const getCriterios = async (): Promise<Criterio[]> => {
    const response = await apiCall<Criterio[]>('/criterios');
    return response.data || [];
  };

  const getCriterioById = async (id: string): Promise<Criterio | null> => {
    const response = await apiCall<Criterio>(`/criterios/${id}`);
    return response.data || null;
  };

  const createCriterio = async (criterio: Omit<Criterio, 'id'>): Promise<Criterio | null> => {
    const response = await apiCall<Criterio>('/criterios', {
      method: 'POST',
      body: JSON.stringify(criterio),
    });
    return response.data || null;
  };

  const updateCriterio = async (id: string, criterio: Partial<Criterio>): Promise<Criterio | null> => {
    const response = await apiCall<Criterio>(`/criterios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(criterio),
    });
    return response.data || null;
  };

  const deleteCriterio = async (id: string): Promise<boolean> => {
    const response = await apiCall(`/criterios/${id}`, {
      method: 'DELETE',
    });
    return response.success;
  };

  const toggleCriterioCompletion = async (
    criterioId: string, 
    userId: string, 
    concluido: boolean
  ): Promise<Criterio | null> => {
    const response = await apiCall<Criterio>(`/criterios/${criterioId}/conclusao`, {
      method: 'POST',
      body: JSON.stringify({ userId, concluido }),
    });
    return response.data || null;
  };

  const getCriteriosBySecretaria = async (secretaria: string): Promise<Criterio[]> => {
    const response = await apiCall<Criterio[]>(`/criterios/secretaria/${secretaria}`);
    return response.data || [];
  };

  // ============================================
  // ALERTAS
  // ============================================

  const getAlertas = async (): Promise<Alerta[]> => {
    const response = await apiCall<Alerta[]>('/alertas');
    return response.data || [];
  };

  const markAlertAsRead = async (id: string): Promise<Alerta | null> => {
    const response = await apiCall<Alerta>(`/alertas/${id}/lido`, {
      method: 'PATCH',
    });
    return response.data || null;
  };

  // ============================================
  // AUTENTICAÇÃO
  // ============================================

  const login = async (username: string, password: string) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return response;
  };

  // ============================================
  // GERENCIAMENTO DE USUÁRIOS
  // ============================================

  const getUsers = async () => {
    const response = await apiCall('/users');
    return response;
  };

  const getUserById = async (id: string) => {
    const response = await apiCall(`/users/${id}`);
    return response;
  };

  const createUser = async (userData: {
    name: string;
    username: string;
    password: string;
    role: 'admin' | 'padrão';
    secretaria?: string;
  }) => {
    const response = await apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  };

  const updateUser = async (id: string, userData: {
    name?: string;
    username?: string;
    password?: string;
    role?: 'admin' | 'padrão';
    secretaria?: string;
  }) => {
    const response = await apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response;
  };

  const deleteUser = async (id: string) => {
    const response = await apiCall(`/users/${id}`, {
      method: 'DELETE',
    });
    return response;
  };

  // ============================================
  // INICIALIZAÇÃO
  // ============================================

  const initData = async () => {
    const response = await apiCall('/init-data', {
      method: 'POST',
    });
    return response;
  };

  const healthCheck = async () => {
    try {
      // Verificar se estamos online primeiro
      if (!navigator.onLine) {
        console.log('📡 Sem conexão de rede - pulando health check');
        return { 
          success: false, 
          error: 'Sem conexão com a internet'
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout mais rápido

      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorMsg = `Servidor retornou status ${response.status}`;
        console.log('❌ Health check falhou:', errorMsg);
        return { 
          success: false, 
          error: errorMsg
        };
      }

      const data = await response.json();
      console.log('✅ Health check bem-sucedido');
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      let errorMessage = 'Servidor não disponível';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Timeout na conexão (3s)';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Servidor não disponível';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'Erro de rede';
        }
      }
      
      console.log('❌ Falha na conexão health check:', { errorMsg: errorMessage });
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  return {
    loading,
    error,
    // Critérios
    getCriterios,
    getCriterioById,
    createCriterio,
    updateCriterio,
    deleteCriterio,
    toggleCriterioCompletion,
    getCriteriosBySecretaria,
    // Alertas
    getAlertas,
    markAlertAsRead,
    // Auth
    login,
    // Usuários
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    // Utilitários
    initData,
    healthCheck,
  };
};

export default useSupabase;