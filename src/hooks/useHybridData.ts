import { useState, useEffect, useCallback } from 'react';
import { User, Criterio, Alerta } from '../types';
import { mockUsers, mockCriterios, mockAlertas } from '../lib/mockData';
import SupabaseService from '../lib/supabaseService';
import { toast } from '../utils/toast';

// Estado do sistema híbrido
interface HybridState {
  isOnline: boolean;
  dataSource: 'online' | 'offline';
  lastSync: string | null;
  syncInProgress: boolean;
}

// Hook para gerenciar dados de forma híbrida (online/offline)
export function useHybridData() {
  const [state, setState] = useState<HybridState>({
    isOnline: false,
    dataSource: 'offline',
    lastSync: null,
    syncInProgress: false
  });

  const [users, setUsers] = useState<User[]>(mockUsers);
  const [criterios, setCriterios] = useState<Criterio[]>(mockCriterios);
  const [alertas, setAlertas] = useState<Alerta[]>(mockAlertas);

  // Verificar conectividade
  const checkConnectivity = useCallback(async () => {
    try {
      const isConnected = await SupabaseService.Auth.checkConnection();
      
      setState(prev => ({
        ...prev,
        isOnline: isConnected,
        dataSource: isConnected ? 'online' : 'offline'
      }));

      return isConnected;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isOnline: false,
        dataSource: 'offline'
      }));
      return false;
    }
  }, []);

  // Sincronizar dados com o servidor
  const syncData = useCallback(async () => {
    setState(prev => ({ ...prev, syncInProgress: true }));
    
    try {
      console.log('[HybridData] Iniciando sincronização...');
      
      // Verificar conectividade primeiro
      const isConnected = await checkConnectivity();
      if (!isConnected) {
        console.log('[HybridData] Sem conectividade - mantendo dados offline');
        return false;
      }

      // Buscar dados do servidor
      const [usersResult, criteriosResult, alertasResult] = await Promise.allSettled([
        SupabaseService.User.getUsers(),
        SupabaseService.Criterio.getCriterios(),
        SupabaseService.Alerta.getAlertas()
      ]);

      let syncCount = 0;

      // Atualizar usuários
      if (usersResult.status === 'fulfilled' && usersResult.value.success && usersResult.value.users) {
        setUsers(usersResult.value.users);
        syncCount++;
        console.log('[HybridData] Usuários sincronizados');
      }

      // Atualizar critérios
      if (criteriosResult.status === 'fulfilled' && criteriosResult.value.success && criteriosResult.value.criterios) {
        // Garantir que todos os critérios tenham meta 100
        const criteriosComMeta = criteriosResult.value.criterios.map(c => ({ ...c, meta: 100 }));
        setCriterios(criteriosComMeta);
        syncCount++;
        console.log('[HybridData] Critérios sincronizados');
      }

      // Atualizar alertas
      if (alertasResult.status === 'fulfilled' && alertasResult.value.success && alertasResult.value.alertas) {
        setAlertas(alertasResult.value.alertas);
        syncCount++;
        console.log('[HybridData] Alertas sincronizados');
      }

      setState(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        dataSource: 'online'
      }));

      if (syncCount > 0) {
        toast.success(`Dados sincronizados (${syncCount}/3 entidades)`);
      }

      console.log(`[HybridData] Sincronização concluída: ${syncCount}/3 entidades`);
      return true;

    } catch (error) {
      console.error('[HybridData] Erro na sincronização:', error);
      toast.error('Erro na sincronização - usando dados offline');
      return false;
    } finally {
      setState(prev => ({ ...prev, syncInProgress: false }));
    }
  }, [checkConnectivity]);

  // Inicializar dados
  const initializeData = useCallback(async () => {
    try {
      const result = await SupabaseService.Init.initializeData();
      if (result.success) {
        toast.success('Sistema inicializado com sucesso');
        // Sincronizar após inicialização
        setTimeout(() => syncData(), 1000);
        return true;
      } else {
        toast.error(`Erro na inicialização: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('[HybridData] Erro na inicialização:', error);
      toast.error('Erro na inicialização do sistema');
      return false;
    }
  }, [syncData]);

  // Operações de usuários
  const userOperations = {
    create: async (userData: Partial<User> & { password: string }) => {
      if (state.isOnline) {
        const result = await SupabaseService.User.createUser(userData);
        if (result.success && result.user) {
          setUsers(prev => [...prev, result.user!]);
          toast.success('Usuário criado com sucesso');
          return result;
        } else {
          toast.error(`Erro ao criar usuário: ${result.error}`);
          return result;
        }
      } else {
        // Fallback offline
        const newUser: User = {
          id: `offline_${Date.now()}`,
          ...userData,
          dataCriacao: new Date().toISOString()
        };
        delete (newUser as any).password;
        setUsers(prev => [...prev, newUser]);
        toast.info('Usuário criado offline - será sincronizado quando possível');
        return { success: true, user: newUser };
      }
    },

    update: async (id: string, userData: Partial<User>) => {
      if (state.isOnline) {
        const result = await SupabaseService.User.updateUser(id, userData);
        if (result.success && result.user) {
          setUsers(prev => prev.map(u => u.id === id ? result.user! : u));
          toast.success('Usuário atualizado com sucesso');
          return result;
        } else {
          toast.error(`Erro ao atualizar usuário: ${result.error}`);
          return result;
        }
      } else {
        // Fallback offline
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u));
        toast.info('Usuário atualizado offline - será sincronizado quando possível');
        return { success: true };
      }
    },

    delete: async (id: string) => {
      if (state.isOnline) {
        const result = await SupabaseService.User.deleteUser(id);
        if (result.success) {
          setUsers(prev => prev.filter(u => u.id !== id));
          toast.success('Usuário removido com sucesso');
          return result;
        } else {
          toast.error(`Erro ao remover usuário: ${result.error}`);
          return result;
        }
      } else {
        // Fallback offline
        setUsers(prev => prev.filter(u => u.id !== id));
        toast.info('Usuário removido offline - será sincronizado quando possível');
        return { success: true };
      }
    }
  };

  // Operações de critérios
  const criterioOperations = {
    create: async (criterioData: Omit<Criterio, 'id'>) => {
      if (state.isOnline) {
        const result = await SupabaseService.Criterio.createCriterio(criterioData);
        if (result.success && result.criterio) {
          setCriterios(prev => [...prev, result.criterio!]);
          toast.success('Critério criado com sucesso');
          return result;
        } else {
          toast.error(`Erro ao criar critério: ${result.error}`);
          return result;
        }
      } else {
        // Fallback offline
        const newCriterio: Criterio = {
          ...criterioData,
          id: `offline_${Date.now()}`,
          meta: 100, // Garantir meta fixa
          conclusoesPorUsuario: {}
        };
        setCriterios(prev => [...prev, newCriterio]);
        toast.info('Critério criado offline - será sincronizado quando possível');
        return { success: true, criterio: newCriterio };
      }
    },

    update: async (id: string, criterioData: Partial<Criterio>) => {
      if (state.isOnline) {
        const result = await SupabaseService.Criterio.updateCriterio(id, criterioData);
        if (result.success && result.criterio) {
          setCriterios(prev => prev.map(c => c.id === id ? result.criterio! : c));
          toast.success('Critério atualizado com sucesso');
          return result;
        } else {
          toast.error(`Erro ao atualizar critério: ${result.error}`);
          return result;
        }
      } else {
        // Fallback offline
        setCriterios(prev => prev.map(c => c.id === id ? { ...c, ...criterioData, meta: 100 } : c));
        toast.info('Critério atualizado offline - será sincronizado quando possível');
        return { success: true };
      }
    },

    delete: async (id: string) => {
      if (state.isOnline) {
        const result = await SupabaseService.Criterio.deleteCriterio(id);
        if (result.success) {
          setCriterios(prev => prev.filter(c => c.id !== id));
          toast.success('Critério removido com sucesso');
          return result;
        } else {
          toast.error(`Erro ao remover critério: ${result.error}`);
          return result;
        }
      } else {
        // Fallback offline
        setCriterios(prev => prev.filter(c => c.id !== id));
        toast.info('Critério removido offline - será sincronizado quando possível');
        return { success: true };
      }
    },

    toggleCompletion: async (criterioId: string, userId: string, completed: boolean) => {
      if (state.isOnline) {
        const result = await SupabaseService.Criterio.toggleCompletion(criterioId, userId, completed);
        if (result.success) {
          // Atualizar localmente também
          setCriterios(prev => prev.map(criterio => {
            if (criterio.id === criterioId) {
              const updatedConclusoes = { ...criterio.conclusoesPorUsuario };
              if (completed) {
                updatedConclusoes[userId] = {
                  concluido: true,
                  dataConclusao: new Date().toISOString()
                };
              } else {
                updatedConclusoes[userId] = { concluido: false };
              }
              return { ...criterio, conclusoesPorUsuario: updatedConclusoes };
            }
            return criterio;
          }));
          return result;
        } else {
          toast.error(`Erro ao atualizar conclusão: ${result.error}`);
          return result;
        }
      } else {
        // Fallback offline
        setCriterios(prev => prev.map(criterio => {
          if (criterio.id === criterioId) {
            const updatedConclusoes = { ...criterio.conclusoesPorUsuario };
            if (completed) {
              updatedConclusoes[userId] = {
                concluido: true,
                dataConclusao: new Date().toISOString()
              };
            } else {
              updatedConclusoes[userId] = { concluido: false };
            }
            return { ...criterio, conclusoesPorUsuario: updatedConclusoes };
          }
          return criterio;
        }));
        
        // Persistir no localStorage também
        const storageKey = `transpjardim-user-completions-${userId}`;
        const existingCompletions = JSON.parse(localStorage.getItem(storageKey) || '{}');
        existingCompletions[criterioId] = {
          concluido: completed,
          dataConclusao: completed ? new Date().toISOString() : undefined
        };
        localStorage.setItem(storageKey, JSON.stringify(existingCompletions));
        
        toast.info('Conclusão atualizada offline - será sincronizada quando possível');
        return { success: true };
      }
    }
  };

  // Operações de alertas
  const alertaOperations = {
    markAsRead: async (alertaId: string) => {
      if (state.isOnline) {
        const result = await SupabaseService.Alerta.markAsRead(alertaId);
        if (result.success) {
          setAlertas(prev => prev.map(a => a.id === alertaId ? { ...a, lido: true } : a));
          return result;
        } else {
          toast.error(`Erro ao marcar alerta: ${result.error}`);
          return result;
        }
      } else {
        // Fallback offline
        setAlertas(prev => prev.map(a => a.id === alertaId ? { ...a, lido: true } : a));
        toast.info('Alerta marcado offline - será sincronizado quando possível');
        return { success: true };
      }
    }
  };

  // Verificar conectividade no carregamento
  useEffect(() => {
    checkConnectivity();
    
    // Verificar conectividade periodicamente
    const interval = setInterval(checkConnectivity, 30000); // 30 segundos
    
    return () => clearInterval(interval);
  }, [checkConnectivity]);

  return {
    // Estado
    state,
    
    // Dados
    users,
    criterios,
    alertas,
    
    // Operações de sistema
    checkConnectivity,
    syncData,
    initializeData,
    
    // Operações CRUD
    users: userOperations,
    criterios: criterioOperations,
    alertas: alertaOperations
  };
}