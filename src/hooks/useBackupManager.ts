import { useState, useCallback, useEffect } from 'react';
import { toast } from '../utils/toast';
import { Criterio, Alerta, User } from '../types';

interface BackupData {
  criterios: Criterio[];
  alertas: Alerta[];
  usuarios: User[];
  configuracoes?: Record<string, any>;
  metadata: {
    version: string;
    timestamp: string;
    totalRecords: number;
    checksum: string;
    systemVersion: string;
  };
}

interface BackupEntry {
  id: string;
  fileName: string;
  timestamp: string;
  size: number;
  type: 'manual' | 'automatic' | 'scheduled';
  status: 'success' | 'error' | 'in_progress';
  description?: string;
  records: number;
  tags?: string[];
}

interface BackupSettings {
  autoBackupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupTime: string;
  retentionDays: number;
  includeUserData: boolean;
  compressionEnabled: boolean;
}

const DEFAULT_SETTINGS: BackupSettings = {
  autoBackupEnabled: false,
  backupFrequency: 'daily',
  backupTime: '23:00',
  retentionDays: 30,
  includeUserData: true,
  compressionEnabled: true
};

export function useBackupManager() {
  const [backupHistory, setBackupHistory] = useState<BackupEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<BackupSettings>(DEFAULT_SETTINGS);

  // Carregar dados salvos
  useEffect(() => {
    // Carregar histórico
    const savedHistory = localStorage.getItem('transpjardim-backup-history');
    if (savedHistory) {
      try {
        setBackupHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Erro ao carregar histórico de backups:', error);
      }
    }

    // Carregar configurações
    const savedSettings = localStorage.getItem('transpjardim-backup-settings');
    if (savedSettings) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      } catch (error) {
        console.error('Erro ao carregar configurações de backup:', error);
      }
    }
  }, []);

  // Salvar histórico
  const saveHistory = useCallback((history: BackupEntry[]) => {
    setBackupHistory(history);
    localStorage.setItem('transpjardim-backup-history', JSON.stringify(history));
  }, []);

  // Salvar configurações
  const saveSettings = useCallback((newSettings: BackupSettings) => {
    setSettings(newSettings);
    localStorage.setItem('transpjardim-backup-settings', JSON.stringify(newSettings));
  }, []);

  // Gerar checksum
  const generateChecksum = useCallback((data: any): string => {
    const str = JSON.stringify(data);
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }, []);

  // Simular progresso de backup
  const simulateProgress = useCallback(async () => {
    const steps = [5, 15, 35, 55, 75, 90, 100];
    for (const step of steps) {
      setProgress(step);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }, []);

  // Criar backup
  const createBackup = useCallback(async (
    criterios: Criterio[],
    alertas: Alerta[],
    usuarios: User[] = [],
    description?: string,
    type: 'manual' | 'automatic' | 'scheduled' = 'manual'
  ): Promise<boolean> => {
    setIsCreating(true);
    setProgress(0);

    try {
      // Simular progresso
      await simulateProgress();

      // Preparar dados do backup
      const backupData: BackupData = {
        criterios,
        alertas,
        usuarios: settings.includeUserData ? usuarios : [],
        configuracoes: {
          backupSettings: settings,
          exportDate: new Date().toISOString()
        },
        metadata: {
          version: '2.0.0',
          timestamp: new Date().toISOString(),
          totalRecords: criterios.length + alertas.length + usuarios.length,
          checksum: '',
          systemVersion: '1.0.0'
        }
      };

      // Gerar checksum
      backupData.metadata.checksum = generateChecksum({
        criterios: backupData.criterios,
        alertas: backupData.alertas,
        usuarios: backupData.usuarios
      });

      // Criar arquivo
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `transpjardim_backup_${timestamp}.json`;
      
      let finalData: string;
      if (settings.compressionEnabled) {
        // Simular compressão removendo espaços desnecessários
        finalData = JSON.stringify(backupData);
      } else {
        finalData = JSON.stringify(backupData, null, 2);
      }

      const blob = new Blob([finalData], { type: 'application/json' });
      
      // Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Adicionar ao histórico
      const newEntry: BackupEntry = {
        id: Date.now().toString(),
        fileName,
        timestamp: new Date().toISOString(),
        size: blob.size,
        type,
        status: 'success',
        description: description || `Backup ${type}`,
        records: backupData.metadata.totalRecords,
        tags: [`v${backupData.metadata.version}`, type, settings.compressionEnabled ? 'compressed' : 'uncompressed']
      };

      // Manter apenas os backups mais recentes
      const updatedHistory = [newEntry, ...backupHistory]
        .slice(0, 50)
        .filter(entry => {
          // Limpar backups antigos baseado na configuração de retenção
          const entryDate = new Date(entry.timestamp);
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - settings.retentionDays);
          return entryDate > cutoffDate || entry.id === newEntry.id;
        });

      saveHistory(updatedHistory);

      toast.success('Backup criado com sucesso!', {
        description: `${backupData.metadata.totalRecords} registros salvos em ${fileName}`
      });

      return true;

    } catch (error) {
      console.error('Erro ao criar backup:', error);
      
      // Adicionar entrada de erro
      const errorEntry: BackupEntry = {
        id: Date.now().toString(),
        fileName: 'backup_failed',
        timestamp: new Date().toISOString(),
        size: 0,
        type,
        status: 'error',
        description: `Falha no backup ${type}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        records: 0,
        tags: ['error']
      };

      const updatedHistory = [errorEntry, ...backupHistory].slice(0, 50);
      saveHistory(updatedHistory);

      toast.error('Erro ao criar backup', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });

      return false;

    } finally {
      setIsCreating(false);
      setProgress(0);
    }
  }, [backupHistory, settings, saveHistory, generateChecksum, simulateProgress]);

  // Restaurar backup
  const restoreBackup = useCallback(async (
    file: File,
    onRestore?: (data: BackupData) => void
  ): Promise<boolean> => {
    setIsRestoring(true);

    try {
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);

      // Validações
      if (!backupData.metadata || !backupData.criterios || !backupData.alertas) {
        throw new Error('Arquivo de backup com estrutura inválida');
      }

      // Verificar versão
      const backupVersion = backupData.metadata.version;
      if (!backupVersion || parseFloat(backupVersion) < 1.0) {
        throw new Error('Versão do backup incompatível. Mínimo: v1.0');
      }

      // Validar checksum se disponível
      if (backupData.metadata.checksum) {
        const expectedChecksum = generateChecksum({
          criterios: backupData.criterios,
          alertas: backupData.alertas,
          usuarios: backupData.usuarios
        });

        if (expectedChecksum !== backupData.metadata.checksum) {
          const proceed = window.confirm(
            'ATENÇÃO: A integridade do backup não pode ser verificada (checksum inválido).\n\n' +
            'O arquivo pode estar corrompido. Deseja prosseguir mesmo assim?'
          );
          
          if (!proceed) {
            return false;
          }
        }
      }

      // Confirmar restauração
      const backupDate = new Date(backupData.metadata.timestamp).toLocaleString();
      const confirmMessage = 
        `Confirma a restauração do backup de ${backupDate}?\n\n` +
        `• ${backupData.criterios.length} critérios\n` +
        `• ${backupData.alertas.length} alertas\n` +
        `• ${backupData.usuarios?.length || 0} usuários\n\n` +
        'TODOS OS DADOS ATUAIS SERÃO SUBSTITUÍDOS!';

      if (!window.confirm(confirmMessage)) {
        return false;
      }

      // Executar restauração
      if (onRestore) {
        onRestore(backupData);
      }

      toast.success('Backup restaurado com sucesso!', {
        description: `${backupData.metadata.totalRecords} registros restaurados`
      });

      return true;

    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      toast.error('Erro ao restaurar backup', {
        description: error instanceof Error ? error.message : 'Arquivo inválido ou corrompido'
      });
      return false;

    } finally {
      setIsRestoring(false);
    }
  }, [generateChecksum]);

  // Exportar dados específicos
  const exportData = useCallback(async (
    data: any,
    fileName: string,
    format: 'json' | 'csv' = 'json'
  ) => {
    try {
      let content: string;
      let mimeType: string;
      let fileExtension: string;

      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        fileExtension = '.json';
      } else {
        // Implementar CSV básico
        if (Array.isArray(data) && data.length > 0) {
          const headers = Object.keys(data[0]).join(',');
          const rows = data.map(item => 
            Object.values(item).map(value => 
              typeof value === 'string' && value.includes(',') ? `"${value}"` : value
            ).join(',')
          ).join('\n');
          content = `${headers}\n${rows}`;
        } else {
          content = JSON.stringify(data, null, 2);
        }
        mimeType = 'text/csv';
        fileExtension = '.csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName + fileExtension;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Dados exportados com sucesso!`, {
        description: `Arquivo: ${fileName}${fileExtension}`
      });

    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao exportar dados');
    }
  }, []);

  // Limpar histórico antigo
  const cleanOldBackups = useCallback(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - settings.retentionDays);
    
    const filteredHistory = backupHistory.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate > cutoffDate;
    });

    if (filteredHistory.length < backupHistory.length) {
      saveHistory(filteredHistory);
      const removedCount = backupHistory.length - filteredHistory.length;
      toast.info(`${removedCount} backup(s) antigo(s) removido(s) automaticamente`);
    }
  }, [backupHistory, settings.retentionDays, saveHistory]);

  // Estatísticas
  const getStats = useCallback(() => {
    const successfulBackups = backupHistory.filter(b => b.status === 'success');
    const lastBackup = successfulBackups[0];
    const totalSize = backupHistory.reduce((sum, backup) => sum + backup.size, 0);
    
    return {
      totalBackups: backupHistory.length,
      successfulBackups: successfulBackups.length,
      failedBackups: backupHistory.filter(b => b.status === 'error').length,
      lastBackupDate: lastBackup?.timestamp,
      totalSizeBytes: totalSize,
      averageSize: backupHistory.length > 0 ? totalSize / backupHistory.length : 0,
      oldestBackup: backupHistory[backupHistory.length - 1]?.timestamp
    };
  }, [backupHistory]);

  return {
    // Estados
    backupHistory,
    isCreating,
    isRestoring,
    progress,
    settings,
    
    // Ações
    createBackup,
    restoreBackup,
    exportData,
    saveSettings,
    cleanOldBackups,
    
    // Utilitários
    getStats,
    generateChecksum
  };
}