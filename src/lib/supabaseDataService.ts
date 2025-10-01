import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Criterio, Alerta, User } from '../types';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-225e1157`;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

class SupabaseDataService {
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`Erro na requisição ${endpoint}:`, error);
      throw error;
    }
  }

  // ============================================
  // CRITÉRIOS
  // ============================================

  async getCriterios(): Promise<Criterio[]> {
    try {
      const response = await this.makeRequest<Criterio[]>('/criterios');
      return response.data || [];
    } catch (error) {
      console.warn('Erro ao buscar critérios do servidor, usando fallback local');
      throw error;
    }
  }

  async createCriterio(criterio: Omit<Criterio, 'id'>): Promise<Criterio> {
    const response = await this.makeRequest<Criterio>('/criterios', {
      method: 'POST',
      body: JSON.stringify(criterio),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erro ao criar critério');
    }
    
    return response.data;
  }

  async updateCriterio(id: string, criterio: Partial<Criterio>): Promise<Criterio> {
    const response = await this.makeRequest<Criterio>(`/criterios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(criterio),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erro ao atualizar critério');
    }
    
    return response.data;
  }

  async deleteCriterio(id: string): Promise<void> {
    const response = await this.makeRequest(`/criterios/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar critério');
    }
  }

  // ============================================
  // COMPLETIONS
  // ============================================

  async toggleCriterioCompletion(criterioId: string, userId: string, completed: boolean): Promise<void> {
    const response = await this.makeRequest(`/criterios/${criterioId}/completion`, {
      method: 'POST',
      body: JSON.stringify({ userId, completed }),
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar completion');
    }
  }

  async getUserCompletions(userId: string): Promise<any[]> {
    try {
      const response = await this.makeRequest<any[]>(`/users/${userId}/completions`);
      return response.data || [];
    } catch (error) {
      console.warn('Erro ao buscar completions do servidor');
      return [];
    }
  }

  // ============================================
  // ALERTAS
  // ============================================

  async getAlertas(): Promise<Alerta[]> {
    try {
      const response = await this.makeRequest<Alerta[]>('/alertas');
      return response.data || [];
    } catch (error) {
      console.warn('Erro ao buscar alertas do servidor, usando fallback local');
      throw error;
    }
  }

  async createAlerta(alerta: Omit<Alerta, 'id'>): Promise<Alerta> {
    const response = await this.makeRequest<Alerta>('/alertas', {
      method: 'POST',
      body: JSON.stringify(alerta),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erro ao criar alerta');
    }
    
    return response.data;
  }

  async markAlertAsRead(id: string): Promise<Alerta> {
    const response = await this.makeRequest<Alerta>(`/alertas/${id}/read`, {
      method: 'PUT',
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erro ao marcar alerta como lido');
    }
    
    return response.data;
  }

  // ============================================
  // INICIALIZAÇÃO E MIGRAÇÃO
  // ============================================

  async initializeData(): Promise<void> {
    const response = await this.makeRequest('/init-data', {
      method: 'POST',
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao inicializar dados');
    }
  }

  async migrateInitialData(): Promise<void> {
    const response = await this.makeRequest('/migrate-initial-data', {
      method: 'POST',
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao migrar dados iniciais');
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/health');
      return response.success;
    } catch (error) {
      return false;
    }
  }

  // ============================================
  // USUÁRIOS (já implementado)
  // ============================================

  async getUsers(): Promise<User[]> {
    try {
      const response = await this.makeRequest<User[]>('/users');
      return response.data || [];
    } catch (error) {
      console.warn('Erro ao buscar usuários do servidor');
      throw error;
    }
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const response = await this.makeRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erro ao criar usuário');
    }
    
    return response.data;
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const response = await this.makeRequest<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erro ao atualizar usuário');
    }
    
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    const response = await this.makeRequest(`/users/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar usuário');
    }
  }

  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.makeRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erro no login');
    }
    
    return response.data;
  }
}

export const supabaseDataService = new SupabaseDataService();