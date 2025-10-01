import { useState, useEffect, createContext, useContext } from 'react';
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

export const SystemStatusProvider = ({ children }: { children: React.ReactNode }) => {
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
  
  // Verificação inicial (apenas uma vez)
  useEffect(() => {
    if (!status.initialized && !status.checking) {
      const timer = setTimeout(() => {
        console.log('🚀 Iniciando verificação inicial do sistema...');
        checkStatus();
      }, 1500); // Aguardar 1.5s para evitar conflitos com outros componentes
      
      return () => clearTimeout(timer);
    }
  }, [status.initialized, status.checking]);
  
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