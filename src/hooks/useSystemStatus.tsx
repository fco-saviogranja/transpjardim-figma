import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useSupabase } from './useSupabase';

interface SystemStatus {
  backendOnline: boolean;
  lastChecked: string | null;
  checking: boolean;
  error: string | null;
  initialized: boolean;
}

interface SystemStatusContextType {
  status: SystemStatus;
  checkStatus: () => Promise<void>;
  isOnline: boolean;
  isOfflineMode: boolean;
}

const SystemStatusContext = createContext<SystemStatusContextType | null>(null);

export const useSystemStatus = () => {
  const context = useContext(SystemStatusContext);
  if (!context) {
    throw new Error('useSystemStatus must be used within a SystemStatusProvider');
  }
  return context;
};

export const SystemStatusProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<SystemStatus>({
    backendOnline: false,
    lastChecked: null,
    checking: false,
    error: null,
    initialized: false
  });
  
  const supabase = useSupabase();
  
  const checkStatus = async () => {
    // Evitar múltiplas verificações simultâneas
    if (status.checking) {
      console.log('⏳ Verificação já em andamento, pulando...');
      return;
    }

    // Verificar se já foi verificado recentemente (menos de 1 minuto)
    if (status.lastChecked) {
      const lastCheck = new Date(status.lastChecked);
      const now = new Date();
      if ((now.getTime() - lastCheck.getTime()) < 60000) {
        console.log('⏳ Verificação recente, pulando...');
        return;
      }
    }

    console.log('🔍 Iniciando verificação de status do sistema...');
    setStatus(prev => ({ ...prev, checking: true, error: null }));
    
    try {
      // Verificar conexão de rede primeiro
      if (!navigator.onLine) {
        setStatus({
          backendOnline: false,
          lastChecked: new Date().toISOString(),
          checking: false,
          error: 'Sem conexão com a internet',
          initialized: true
        });
        return;
      }

      const response = await supabase.healthCheck();
      
      const newStatus: SystemStatus = {
        backendOnline: !!response.success,
        lastChecked: new Date().toISOString(),
        checking: false,
        error: response.success ? null : (response.error || 'Backend indisponível'),
        initialized: true
      };
      
      console.log('📊 Status verificado:', {
        online: newStatus.backendOnline,
        error: newStatus.error,
        timestamp: newStatus.lastChecked
      });
      
      setStatus(newStatus);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro de conexão desconhecido';
      console.error('💥 Erro na verificação de status:', errorMessage);
      
      setStatus({
        backendOnline: false,
        lastChecked: new Date().toISOString(),
        checking: false,
        error: 'Sistema funcionando offline',
        initialized: true
      });
    }
  };
  
  // Verificação inicial (apenas uma vez, otimizada)
  useEffect(() => {
    if (!status.initialized && !status.checking) {
      const timer = setTimeout(() => {
        console.log('🚀 Iniciando verificação inicial do sistema...');
        checkStatus();
      }, 3000); // Aguardar 3s para evitar conflitos
      
      return () => clearTimeout(timer);
    }
  }, []); // Remove dependências para evitar loops
  
  const contextValue = {
    status,
    checkStatus,
    isOnline: status.backendOnline,
    isOfflineMode: !status.backendOnline && status.initialized
  };
  
  return (
    <SystemStatusContext.Provider value={contextValue}>
      {children}
    </SystemStatusContext.Provider>
  );
};