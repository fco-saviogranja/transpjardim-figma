import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';

export interface SystemConfig {
  // Configurações Gerais
  siteName: string;
  siteDescription: string;
  adminEmail: string;
  timezone: string;
  defaultLanguage: string;
  
  // Configurações de Notificações
  emailNotifications: boolean;
  pushNotifications: boolean;
  alertsEmail: string;
  notificationFrequency: string;
  
  // Configurações de Segurança
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordComplexity: string;
  twoFactorRequired: boolean;
  
  // Configurações de Sistema
  maintenanceMode: boolean;
  debugMode: boolean;
  cacheDuration: number;
  maxFileSize: number;
  allowRegistration: boolean;
  
  // Configurações de Backup
  autoBackup: boolean;
  backupFrequency: string;
  backupRetention: number;
  
  // Configurações de Aparência
  primaryColor: string;
  logoUrl: string;
  enableDarkMode: boolean;
  customCSS: string;
}

export const defaultConfig: SystemConfig = {
  siteName: 'TranspJardim',
  siteDescription: 'Plataforma de Transparência Municipal de Jardim/CE',
  adminEmail: 'admin@transparenciajardim.app',
  timezone: 'America/Fortaleza',
  defaultLanguage: 'pt-BR',
  
  emailNotifications: true,
  pushNotifications: true,
  alertsEmail: 'alertas@transparenciajardim.app',
  notificationFrequency: 'daily',
  
  sessionTimeout: 480, // 8 horas em minutos
  maxLoginAttempts: 5,
  passwordComplexity: 'medium',
  twoFactorRequired: false,
  
  maintenanceMode: false,
  debugMode: false,
  cacheDuration: 3600, // 1 hora em segundos
  maxFileSize: 50, // MB
  allowRegistration: false,
  
  autoBackup: true,
  backupFrequency: 'daily',
  backupRetention: 30, // dias
  
  primaryColor: '#4a7c59',
  logoUrl: '',
  enableDarkMode: false,
  customCSS: ''
};

const STORAGE_KEY = 'transpjardim-system-config';

export const useSystemConfig = () => {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Carregar configurações do localStorage/Supabase
  useEffect(() => {
    let isMounted = true;

    const loadConfig = async () => {
      try {
        // Primeiro tentar localStorage
        const savedConfig = localStorage.getItem(STORAGE_KEY);
        if (savedConfig && isMounted) {
          const parsedConfig = JSON.parse(savedConfig);
          setConfig({ ...defaultConfig, ...parsedConfig });
        }

        // Em produção, também carregaria do Supabase
        // const { data } = await supabase.from('system_config').select().single();
        // if (data?.config && isMounted) {
        //   setConfig({ ...defaultConfig, ...data.config });
        // }
      } catch (error) {
        console.warn('Erro ao carregar configurações:', error);
        if (isMounted) {
          toast.error('Erro ao carregar configurações do sistema');
        }
      }
    };

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  // Detectar mudanças não salvas
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEY);
      const currentConfigString = JSON.stringify(config);
      const savedConfigString = savedConfig || JSON.stringify(defaultConfig);
      
      setHasUnsavedChanges(currentConfigString !== savedConfigString);
    } catch (error) {
      console.warn('Erro ao detectar mudanças:', error);
    }
  }, [config]);

  // Atualizar uma configuração específica
  const updateConfig = useCallback((key: keyof SystemConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Atualizar múltiplas configurações
  const updateMultipleConfigs = useCallback((updates: Partial<SystemConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Salvar configurações
  const saveConfig = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Salvar no localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

      // Em produção, também salvaria no Supabase
      // await supabase.from('system_config').upsert({ 
      //   id: 'main',
      //   config,
      //   updated_at: new Date().toISOString() 
      // });

      setHasUnsavedChanges(false);
      toast.success('Configurações salvas com sucesso!');
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  // Restaurar configurações padrão
  const resetConfig = useCallback(() => {
    setConfig(defaultConfig);
    localStorage.removeItem(STORAGE_KEY);
    toast.info('Configurações restauradas para os valores padrão');
  }, []);

  // Exportar configurações
  const exportConfig = useCallback(() => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `transpjardim-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    toast.success('Configurações exportadas com sucesso!');
  }, [config]);

  // Importar configurações
  const importConfig = useCallback((file: File) => {
    return new Promise<boolean>((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          const importedConfig = JSON.parse(result);
          
          // Validar estrutura básica
          if (typeof importedConfig === 'object' && importedConfig.siteName) {
            setConfig({ ...defaultConfig, ...importedConfig });
            toast.success('Configurações importadas com sucesso!');
            resolve(true);
          } else {
            toast.error('Arquivo de configuração inválido');
            resolve(false);
          }
        } catch (error) {
          console.error('Erro ao importar configurações:', error);
          toast.error('Erro ao processar arquivo de configuração');
          resolve(false);
        }
      };
      
      reader.onerror = () => {
        toast.error('Erro ao ler arquivo');
        resolve(false);
      };
      
      reader.readAsText(file);
    });
  }, []);

  // Verificar se está em modo de manutenção
  const isMaintenanceMode = useCallback(() => {
    return config.maintenanceMode;
  }, [config.maintenanceMode]);

  // Obter configuração específica
  const getConfig = useCallback((key: keyof SystemConfig) => {
    return config[key];
  }, [config]);

  // Aplicar tema customizado
  const applyCustomTheme = useCallback(() => {
    if (config.primaryColor) {
      document.documentElement.style.setProperty('--jardim-green', config.primaryColor);
    }
    
    if (config.customCSS) {
      // Remover CSS customizado anterior
      const existingStyle = document.getElementById('transpjardim-custom-css');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      // Adicionar novo CSS customizado
      const style = document.createElement('style');
      style.id = 'transpjardim-custom-css';
      style.textContent = config.customCSS;
      document.head.appendChild(style);
    }
  }, [config.primaryColor, config.customCSS]);

  // Aplicar tema automaticamente quando as configurações mudarem
  useEffect(() => {
    applyCustomTheme();
  }, [applyCustomTheme]);

  return {
    config,
    isLoading,
    hasUnsavedChanges,
    updateConfig,
    updateMultipleConfigs,
    saveConfig,
    resetConfig,
    exportConfig,
    importConfig,
    isMaintenanceMode,
    getConfig,
    applyCustomTheme
  };
};