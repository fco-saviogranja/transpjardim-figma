import { supabase } from './supabase';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { User, Criterio, Alerta } from '../types';

// Configurações da API
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-225e1157`;
const API_HEADERS = {
  'Authorization': `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json'
};

// Interface para respostas da API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Serviço de conectividade com timeout e retry
class ConnectivityService {
  private static readonly TIMEOUT = 10000; // 10 segundos
  private static readonly MAX_RETRIES = 2;

  static async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...API_HEADERS,
          ...options.headers
        }
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  static async makeRequest<T = any>(
    endpoint: string, 
    options: RequestInit = {},
    retries = this.MAX_RETRIES
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;
    
    try {
      console.log(`[SupabaseService] Tentativa de requisição: ${endpoint}`);
      
      const response = await this.fetchWithTimeout(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`[SupabaseService] Sucesso: ${endpoint}`, data);
      return data;
      
    } catch (error) {
      console.error(`[SupabaseService] Erro em ${endpoint}:`, error);
      
      // Retry lógica para falhas de rede
      if (retries > 0 && (
        error instanceof TypeError || // Falha de rede
        error.message.includes('AbortError') || // Timeout
        error.message.includes('Failed to fetch') // Conectividade
      )) {
        console.log(`[SupabaseService] Retry ${this.MAX_RETRIES - retries + 1}/${this.MAX_RETRIES} para ${endpoint}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (this.MAX_RETRIES - retries + 1)));
        return this.makeRequest(endpoint, options, retries - 1);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// ============================================
// SERVIÇOS PRINCIPAIS
// ============================================

export class AuthService {
  static async login(username: string, password: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    const response = await ConnectivityService.makeRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (response.success && response.data) {
      return { 
        success: true, 
        user: response.data.user, 
        token: response.data.token 
      };
    }
    
    return { 
      success: false, 
      error: response.error || 'Falha na autenticação' 
    };
  }

  static async checkConnection(): Promise<boolean> {
    try {
      const response = await ConnectivityService.makeRequest('/health');
      return response.success;
    } catch (error) {
      return false;
    }
  }
}

export class UserService {
  static async getUsers(): Promise<{ success: boolean; users?: User[]; error?: string }> {
    const response = await ConnectivityService.makeRequest<User[]>('/users');
    
    if (response.success && response.data) {
      return { success: true, users: response.data };
    }
    
    return { 
      success: false, 
      error: response.error || 'Erro ao buscar usuários' 
    };
  }

  static async createUser(userData: Partial<User> & { password: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    const response = await ConnectivityService.makeRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (response.success && response.data) {
      return { success: true, user: response.data };
    }
    
    return { 
      success: false, 
      error: response.error || 'Erro ao criar usuário' 
    };
  }

  static async updateUser(id: string, userData: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    const response = await ConnectivityService.makeRequest<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
    
    if (response.success && response.data) {
      return { success: true, user: response.data };
    }
    
    return { 
      success: false, 
      error: response.error || 'Erro ao atualizar usuário' 
    };
  }

  static async deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
    const response = await ConnectivityService.makeRequest(`/users/${id}`, {
      method: 'DELETE'
    });
    
    return { 
      success: response.success,
      error: response.error 
    };
  }
}

export class CriterioService {
  static async getCriterios(): Promise<{ success: boolean; criterios?: Criterio[]; error?: string }> {
    const response = await ConnectivityService.makeRequest<Criterio[]>('/criterios');
    
    if (response.success && response.data) {
      return { success: true, criterios: response.data };
    }
    
    return { 
      success: false, 
      error: response.error || 'Erro ao buscar critérios',
      criterios: [] // Fallback para lista vazia
    };
  }

  static async createCriterio(criterioData: Omit<Criterio, 'id'>): Promise<{ success: boolean; criterio?: Criterio; error?: string }> {
    // Garantir meta de 100%
    const criterioComMeta = { ...criterioData, meta: 100 };
    
    const response = await ConnectivityService.makeRequest<Criterio>('/criterios', {
      method: 'POST',
      body: JSON.stringify(criterioComMeta)
    });
    
    if (response.success && response.data) {
      return { success: true, criterio: response.data };
    }
    
    return { 
      success: false, 
      error: response.error || 'Erro ao criar critério' 
    };
  }

  static async updateCriterio(id: string, criterioData: Partial<Criterio>): Promise<{ success: boolean; criterio?: Criterio; error?: string }> {
    // Garantir meta de 100%
    const criterioComMeta = { ...criterioData, meta: 100 };
    
    const response = await ConnectivityService.makeRequest<Criterio>(`/criterios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(criterioComMeta)
    });
    
    if (response.success && response.data) {
      return { success: true, criterio: response.data };
    }
    
    return { 
      success: false, 
      error: response.error || 'Erro ao atualizar critério' 
    };
  }

  static async deleteCriterio(id: string): Promise<{ success: boolean; error?: string }> {
    const response = await ConnectivityService.makeRequest(`/criterios/${id}`, {
      method: 'DELETE'
    });
    
    return { 
      success: response.success,
      error: response.error 
    };
  }

  static async toggleCompletion(criterioId: string, userId: string, completed: boolean): Promise<{ success: boolean; error?: string }> {
    const response = await ConnectivityService.makeRequest(`/criterios/${criterioId}/completion`, {
      method: 'POST',
      body: JSON.stringify({ userId, completed })
    });
    
    return { 
      success: response.success,
      error: response.error 
    };
  }
}

export class AlertaService {
  static async getAlertas(): Promise<{ success: boolean; alertas?: Alerta[]; error?: string }> {
    const response = await ConnectivityService.makeRequest<Alerta[]>('/alertas');
    
    if (response.success && response.data) {
      return { success: true, alertas: response.data };
    }
    
    return { 
      success: false, 
      error: response.error || 'Erro ao buscar alertas',
      alertas: [] // Fallback para lista vazia
    };
  }

  static async markAsRead(alertaId: string): Promise<{ success: boolean; error?: string }> {
    const response = await ConnectivityService.makeRequest(`/alertas/${alertaId}/read`, {
      method: 'POST'
    });
    
    return { 
      success: response.success,
      error: response.error 
    };
  }
}

// Serviço de inicialização de dados
export class InitService {
  static async initializeData(): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await ConnectivityService.makeRequest('/init-data', {
      method: 'POST'
    });
    
    if (response.success) {
      return { 
        success: true, 
        message: response.message || 'Dados inicializados com sucesso' 
      };
    }
    
    return { 
      success: false, 
      error: response.error || 'Erro ao inicializar dados' 
    };
  }

  static async healthCheck(): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await ConnectivityService.makeRequest('/health');
    return {
      success: response.success,
      data: response.data,
      error: response.error
    };
  }
}

// Export padrão com todos os serviços
export default {
  Auth: AuthService,
  User: UserService,
  Criterio: CriterioService,
  Alerta: AlertaService,
  Init: InitService
};