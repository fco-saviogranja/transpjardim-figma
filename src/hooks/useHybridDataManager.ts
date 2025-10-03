import { useState, useEffect, useCallback } from 'react';
import { supabaseDataService } from '../lib/supabaseDataService';
import { mockCriterios, mockAlertas } from '../lib/mockData';
import { Criterio, Alerta, User } from '../types';
import { toast } from '../utils/toast';

interface HybridDataState {
  criterios: Criterio[];
  alertas: Alerta[];
  isOnline: boolean;
  isLoading: boolean;
  lastSync: Date | null;
}

export function useHybridDataManager(user: User | null) {
  const [state, setState] = useState<HybridDataState>({
    criterios: [],
    alertas: [],
    isOnline: false,
    isLoading: true,
    lastSync: null,
  });

  // Chaves para localStorage baseadas no usuário
  const getStorageKey = (type: string) => 
    user ? `transpjardim-${type}-${user.id}` : `transpjardim-${type}-guest`;

  // Carregar dados do localStorage
  const loadLocalData = useCallback(() => {
    try {
      const criteriosKey = getStorageKey('criterios');
      const alertasKey = getStorageKey('alertas');
      
      const savedCriterios = localStorage.getItem(criteriosKey);
      const savedAlertas = localStorage.getItem(alertasKey);
      
      const criterios = savedCriterios 
        ? JSON.parse(savedCriterios) 
        : mockCriterios.map(c => ({ ...c, meta: 100 })); // Garantir meta 100
      
      const alertas = savedAlertas 
        ? JSON.parse(savedAlertas) 
        : mockAlertas;

      setState(prev => ({
        ...prev,
        criterios,
        alertas,
        isLoading: false,
      }));

      console.log('📱 Dados carregados do localStorage:', {
        criterios: criterios.length,
        alertas: alertas.length
      });
    } catch (error) {
      console.error('Erro ao carregar dados locais:', error);
      // Usar dados mock como fallback final
      setState(prev => ({
        ...prev,
        criterios: mockCriterios.map(c => ({ ...c, meta: 100 })),
        alertas: mockAlertas,
        isLoading: false,
      }));
    }
  }, [user]);

  // Salvar dados no localStorage
  const saveLocalData = useCallback((criterios: Criterio[], alertas: Alerta[]) => {
    if (!user) return;
    
    try {
      const criteriosKey = getStorageKey('criterios');
      const alertasKey = getStorageKey('alertas');
      
      localStorage.setItem(criteriosKey, JSON.stringify(criterios));
      localStorage.setItem(alertasKey, JSON.stringify(alertas));
      
      console.log('💾 Dados salvos localmente');
    } catch (error) {
      console.error('Erro ao salvar dados locais:', error);
    }
  }, [user]);

  // Sincronizar com Supabase
  const syncWithSupabase = useCallback(async () => {
    if (!user) return false;

    try {
      console.log('🔄 Iniciando sincronização com Supabase...');
      
      // Verificar conectividade
      const isHealthy = await supabaseDataService.checkHealth();
      if (!isHealthy) {
        throw new Error('Servidor não disponível');
      }

      // Buscar dados do servidor
      const [criterios, alertas] = await Promise.all([
        supabaseDataService.getCriterios(),
        supabaseDataService.getAlertas(),
      ]);

      console.log('✅ Dados sincronizados do Supabase:', {
        criterios: criterios.length,
        alertas: alertas.length
      });

      // Atualizar estado
      setState(prev => ({
        ...prev,
        criterios,
        alertas,
        isOnline: true,
        lastSync: new Date(),
        isLoading: false,
      }));

      // Salvar localmente como backup
      saveLocalData(criterios, alertas);

      return true;
    } catch (error) {
      console.warn('❌ Falha na sincronização com Supabase:', error);
      
      setState(prev => ({
        ...prev,
        isOnline: false,
        isLoading: false,
      }));

      return false;
    }
  }, [user, saveLocalData]);

  // Inicializar dados na montagem do componente
  useEffect(() => {
    const initializeData = async () => {
      // Sempre carregar dados locais primeiro (boot rápido)
      loadLocalData();
      
      // Tentar sincronizar com Supabase se possível
      if (user) {
        const synced = await syncWithSupabase();
        if (synced) {
          toast('🔄 Dados sincronizados com sucesso');
        } else {
          toast('📱 Modo offline - usando dados locais', 'warning');
        }
      }
    };

    initializeData();
  }, [user, loadLocalData, syncWithSupabase]);

  // ============================================
  // OPERAÇÕES CRUD
  // ============================================

  const addCriterio = useCallback(async (criterioData: Omit<Criterio, 'id'>) => {
    const newCriterio: Criterio = {
      ...criterioData,
      meta: 100, // Garantir meta fixa
      id: `criterio_${Date.now()}`,
      valor: 0,
      status: 'ativo',
      conclusoesPorUsuario: {},
    };

    try {
      if (state.isOnline) {
        // Tentar criar no servidor
        const serverCriterio = await supabaseDataService.createCriterio(criterioData);
        
        setState(prev => ({
          ...prev,
          criterios: [...prev.criterios, serverCriterio],
        }));
        
        saveLocalData([...state.criterios, serverCriterio], state.alertas);
        toast('✅ Critério criado com sucesso');
      } else {
        throw new Error('Servidor offline');
      }
    } catch (error) {
      console.warn('Criando critério localmente (servidor offline)');
      
      setState(prev => ({
        ...prev,
        criterios: [...prev.criterios, newCriterio],
      }));
      
      saveLocalData([...state.criterios, newCriterio], state.alertas);
      toast('📱 Critério criado localmente (será sincronizado quando online)', 'warning');
    }
  }, [state.criterios, state.alertas, state.isOnline, saveLocalData]);

  const updateCriterio = useCallback(async (id: string, criterioData: Partial<Criterio>) => {
    try {
      if (state.isOnline) {
        const updatedCriterio = await supabaseDataService.updateCriterio(id, criterioData);
        
        setState(prev => ({
          ...prev,
          criterios: prev.criterios.map(c => c.id === id ? updatedCriterio : c),
        }));
        
        const newCriterios = state.criterios.map(c => c.id === id ? updatedCriterio : c);
        saveLocalData(newCriterios, state.alertas);
        toast('✅ Critério atualizado');
      } else {
        throw new Error('Servidor offline');
      }
    } catch (error) {
      console.warn('Atualizando critério localmente (servidor offline)');
      
      setState(prev => ({
        ...prev,
        criterios: prev.criterios.map(c => 
          c.id === id ? { ...c, ...criterioData, meta: 100 } : c
        ),
      }));
      
      const newCriterios = state.criterios.map(c => 
        c.id === id ? { ...c, ...criterioData, meta: 100 } : c
      );
      saveLocalData(newCriterios, state.alertas);
      toast('📱 Critério atualizado localmente', 'warning');
    }
  }, [state.criterios, state.alertas, state.isOnline, saveLocalData]);

  const deleteCriterio = useCallback(async (id: string) => {
    try {
      if (state.isOnline) {
        await supabaseDataService.deleteCriterio(id);
      }
      
      setState(prev => ({
        ...prev,
        criterios: prev.criterios.filter(c => c.id !== id),
      }));
      
      const newCriterios = state.criterios.filter(c => c.id !== id);
      saveLocalData(newCriterios, state.alertas);
      
      // Limpar completions locais
      if (user) {
        const storageKey = `transpjardim-user-completions-${user.id}`;
        const existingCompletions = JSON.parse(localStorage.getItem(storageKey) || '{}');
        delete existingCompletions[id];
        localStorage.setItem(storageKey, JSON.stringify(existingCompletions));
      }
      
      toast('🗑️ Critério removido');
    } catch (error) {
      console.error('Erro ao deletar critério:', error);
      toast('❌ Erro ao remover critério', 'destructive');
    }
  }, [state.criterios, state.alertas, state.isOnline, saveLocalData, user]);

  const toggleCriterioCompletion = useCallback(async (criterioId: string, completed: boolean) => {
    if (!user) return;

    try {
      if (state.isOnline) {
        await supabaseDataService.toggleCriterioCompletion(criterioId, user.id, completed);
      }
      
      // Atualizar estado local
      setState(prev => ({
        ...prev,
        criterios: prev.criterios.map(criterio => {
          if (criterio.id === criterioId) {
            return {
              ...criterio,
              conclusoesPorUsuario: {
                ...criterio.conclusoesPorUsuario,
                [user.id]: {
                  concluido: completed,
                  dataConclusao: completed ? new Date().toISOString() : undefined
                }
              }
            };
          }
          return criterio;
        }),
      }));
      
      // Salvar no localStorage
      const storageKey = `transpjardim-user-completions-${user.id}`;
      const existingCompletions = JSON.parse(localStorage.getItem(storageKey) || '{}');
      existingCompletions[criterioId] = {
        concluido: completed,
        dataConclusao: completed ? new Date().toISOString() : undefined
      };
      localStorage.setItem(storageKey, JSON.stringify(existingCompletions));
      
    } catch (error) {
      console.error('Erro ao atualizar completion:', error);
    }
  }, [user, state.isOnline]);

  const markAlertAsRead = useCallback(async (alertaId: string) => {
    try {
      if (state.isOnline) {
        await supabaseDataService.markAlertAsRead(alertaId);
      }
      
      setState(prev => ({
        ...prev,
        alertas: prev.alertas.map(alerta => 
          alerta.id === alertaId ? { ...alerta, lido: true } : alerta
        ),
      }));
      
      const newAlertas = state.alertas.map(alerta => 
        alerta.id === alertaId ? { ...alerta, lido: true } : alerta
      );
      saveLocalData(state.criterios, newAlertas);
      
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
    }
  }, [state.criterios, state.alertas, state.isOnline, saveLocalData]);

  // Tentar reconectar periodicamente
  useEffect(() => {
    if (!state.isOnline && user) {
      const interval = setInterval(async () => {
        console.log('🔄 Tentando reconectar...');
        const synced = await syncWithSupabase();
        if (synced) {
          toast('🔄 Reconectado - dados sincronizados');
          clearInterval(interval);
        }
      }, 30000); // Tentar a cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [state.isOnline, user, syncWithSupabase]);

  return {
    ...state,
    addCriterio,
    updateCriterio,
    deleteCriterio,
    toggleCriterioCompletion,
    markAlertAsRead,
    syncWithSupabase,
  };
}