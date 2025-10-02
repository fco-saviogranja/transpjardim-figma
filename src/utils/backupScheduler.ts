import { toast } from './toast';

interface BackupSchedulerConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // formato HH:MM
  enabled: boolean;
  onBackupNeeded: () => Promise<boolean>;
  onBackupSuccess: () => void;
  onBackupError: (error: string) => void;
}

class BackupScheduler {
  private config: BackupSchedulerConfig | null = null;
  private scheduledBackupId: number | null = null;
  private nextBackupTime: Date | null = null;

  constructor() {
    // Verificar se há backups pendentes ao inicializar
    this.checkPendingBackups();
  }

  configure(config: BackupSchedulerConfig) {
    this.config = config;
    this.scheduleNextBackup();
  }

  private calculateNextBackupTime(): Date {
    if (!this.config) return new Date();

    const now = new Date();
    const [hours, minutes] = this.config.time.split(':').map(Number);
    
    let nextBackup = new Date();
    nextBackup.setHours(hours, minutes, 0, 0);

    // Se o horário já passou hoje, agendar para o próximo período
    if (nextBackup <= now) {
      switch (this.config.frequency) {
        case 'daily':
          nextBackup.setDate(nextBackup.getDate() + 1);
          break;
        case 'weekly':
          nextBackup.setDate(nextBackup.getDate() + 7);
          break;
        case 'monthly':
          nextBackup.setMonth(nextBackup.getMonth() + 1);
          break;
      }
    }

    return nextBackup;
  }

  private scheduleNextBackup() {
    if (!this.config || !this.config.enabled) {
      this.clearScheduledBackup();
      return;
    }

    this.clearScheduledBackup();
    
    this.nextBackupTime = this.calculateNextBackupTime();
    const timeUntilBackup = this.nextBackupTime.getTime() - Date.now();

    console.log(`📅 Próximo backup agendado para: ${this.nextBackupTime.toLocaleString()}`);

    this.scheduledBackupId = window.setTimeout(async () => {
      await this.executeScheduledBackup();
      this.scheduleNextBackup(); // Agendar o próximo
    }, timeUntilBackup);

    // Salvar informações do agendamento
    localStorage.setItem('transpjardim-backup-schedule', JSON.stringify({
      nextBackup: this.nextBackupTime.toISOString(),
      frequency: this.config.frequency,
      time: this.config.time
    }));
  }

  private clearScheduledBackup() {
    if (this.scheduledBackupId) {
      clearTimeout(this.scheduledBackupId);
      this.scheduledBackupId = null;
    }
    localStorage.removeItem('transpjardim-backup-schedule');
  }

  private async executeScheduledBackup() {
    if (!this.config) return;

    console.log('🔄 Executando backup automático...');
    
    try {
      const success = await this.config.onBackupNeeded();
      
      if (success) {
        console.log('✅ Backup automático concluído com sucesso');
        this.config.onBackupSuccess();
        
        toast.success('Backup automático concluído', {
          description: `Backup ${this.config.frequency} realizado com sucesso`
        });
      } else {
        throw new Error('Falha na execução do backup');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro no backup automático:', errorMessage);
      
      this.config.onBackupError(errorMessage);
      
      toast.error('Falha no backup automático', {
        description: errorMessage
      });
    }
  }

  private checkPendingBackups() {
    const savedSchedule = localStorage.getItem('transpjardim-backup-schedule');
    if (!savedSchedule) return;

    try {
      const schedule = JSON.parse(savedSchedule);
      const nextBackupTime = new Date(schedule.nextBackup);
      const now = new Date();

      // Se passou do horário agendado, alertar sobre backup perdido
      if (nextBackupTime < now) {
        const timeDiff = now.getTime() - nextBackupTime.getTime();
        const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));

        if (hoursDiff < 24) { // Apenas se for dentro das últimas 24 horas
          toast.warning('Backup agendado perdido', {
            description: `Backup de ${nextBackupTime.toLocaleString()} não foi executado`,
            action: {
              label: 'Fazer agora',
              onClick: () => {
                console.log('Executando backup manual devido a backup perdido');
              }
            }
          });
        }

        localStorage.removeItem('transpjardim-backup-schedule');
      }
    } catch (error) {
      console.error('Erro ao verificar backups pendentes:', error);
      localStorage.removeItem('transpjardim-backup-schedule');
    }
  }

  getNextBackupTime(): Date | null {
    return this.nextBackupTime;
  }

  getTimeUntilNextBackup(): string | null {
    if (!this.nextBackupTime) return null;

    const now = new Date();
    const timeDiff = this.nextBackupTime.getTime() - now.getTime();
    
    if (timeDiff <= 0) return 'Em execução';

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }

    return `${hours}h ${minutes}m`;
  }

  stop() {
    this.clearScheduledBackup();
    this.config = null;
    this.nextBackupTime = null;
  }

  // Método para forçar backup imediato
  async executeImmediateBackup(): Promise<boolean> {
    if (!this.config) return false;

    console.log('🔄 Executando backup imediato...');
    return await this.executeScheduledBackup() !== undefined;
  }

  // Verificar se o agendamento está ativo
  isActive(): boolean {
    return this.config?.enabled === true && this.scheduledBackupId !== null;
  }

  // Obter configuração atual
  getConfig(): BackupSchedulerConfig | null {
    return this.config;
  }
}

// Instância singleton
export const backupScheduler = new BackupScheduler();

// Hook React para usar o scheduler
export function useBackupScheduler() {
  return {
    scheduler: backupScheduler,
    configure: (config: BackupSchedulerConfig) => backupScheduler.configure(config),
    stop: () => backupScheduler.stop(),
    executeImmediate: () => backupScheduler.executeImmediateBackup(),
    getNextBackupTime: () => backupScheduler.getNextBackupTime(),
    getTimeUntilNext: () => backupScheduler.getTimeUntilNextBackup(),
    isActive: () => backupScheduler.isActive()
  };
}