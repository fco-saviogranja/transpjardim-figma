// Heartbeat mechanism to detect app freezes

import { getHeartbeatConfig, shouldEnableHeartbeat } from './heartbeatConfig';
import { isDevelopment } from './environment';

class AppHeartbeat {
  private lastHeartbeat: number = Date.now();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private beatTimer: NodeJS.Timeout | null = null;
  private isActive: boolean = false;
  private freezeDetectionCount: number = 0;
  private maxFreezeDetections: number = 8; // Ainda mais tolerante
  private startTime: number = 0;
  private totalBeats: number = 0;
  private errorCount: number = 0;
  private lastBeatFromTimer: number = Date.now();
  
  start() {
    // Verificar se deve estar habilitado
    const shouldEnable = shouldEnableHeartbeat();
    const config = getHeartbeatConfig();
    
    console.log('💓 Heartbeat start() chamado:', {
      shouldEnable,
      configEnabled: config.enabled,
      isDev: isDevelopment()
    });
    
    if (!shouldEnable) {
      console.log('💤 Heartbeat mantido desabilitado por configuração');
      return;
    }
    
    if (this.isActive) {
      console.log('💓 Heartbeat já está ativo, ignorando start()');
      return;
    }
    
    try {
      const config = getHeartbeatConfig();
      
      this.isActive = true;
      this.lastHeartbeat = Date.now();
      this.startTime = Date.now();
      this.freezeDetectionCount = 0;
      this.totalBeats = 0;
      this.errorCount = 0;
      
      // Timer automático que envia beats independente do React
      this.beatTimer = setInterval(() => {
        try {
          this.lastBeatFromTimer = Date.now();
          this.beat();
        } catch (timerError) {
          console.error('❌ Erro no timer de beat:', timerError);
        }
      }, config.beatInterval);

      this.heartbeatInterval = setInterval(() => {
        try {
          const now = Date.now();
          const timeSinceLastBeat = now - this.lastHeartbeat;
          
          if (timeSinceLastBeat > config.freezeThreshold) {
            this.freezeDetectionCount++;
            
            if (config.debugMode) {
              console.error('🚨 App parece congelado - sem heartbeat por', timeSinceLastBeat, 'ms', `(${this.freezeDetectionCount}/${config.maxFreezeDetections})`);
            }
            
            // Só agir se passar do limite configurado
            if (this.freezeDetectionCount <= config.maxFreezeDetections) {
              this.handleFrozenApp();
            }
          } else {
            // Reset contador se heartbeat voltou ao normal
            if (this.freezeDetectionCount > 0) {
              if (config.debugMode) {
                console.log('✅ App recuperado do congelamento');
              }
              this.freezeDetectionCount = 0;
            }
          }
        } catch (intervalError) {
          console.error('❌ Erro no interval do heartbeat:', intervalError);
        }
      }, config.checkInterval);
      
      console.log('💓 Heartbeat iniciado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao iniciar heartbeat:', error);
      this.isActive = false;
    }
  }
  
  stop() {
    try {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
      if (this.beatTimer) {
        clearInterval(this.beatTimer);
        this.beatTimer = null;
      }
      this.isActive = false;
      this.freezeDetectionCount = 0;
      console.log('💔 Heartbeat parado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao parar heartbeat:', error);
      // Forçar reset do estado mesmo com erro
      this.isActive = false;
      this.heartbeatInterval = null;
      this.beatTimer = null;
      this.freezeDetectionCount = 0;
    }
  }
  
  restart() {
    console.log('🔄 Reiniciando heartbeat...');
    try {
      this.stop();
      setTimeout(() => {
        try {
          this.start();
          console.log('✅ Heartbeat reiniciado com sucesso');
        } catch (startError) {
          console.error('❌ Erro ao reiniciar heartbeat:', startError);
        }
      }, 1000); // Aguardar 1 segundo para garantir que parou completamente
    } catch (error) {
      console.error('❌ Erro durante restart do heartbeat:', error);
      // Forçar reset em caso de erro
      this.isActive = false;
      this.heartbeatInterval = null;
      setTimeout(() => {
        try {
          this.start();
        } catch (fallbackError) {
          console.error('❌ Erro no fallback restart:', fallbackError);
        }
      }, 2000);
    }
  }
  
  isHeartbeatActive(): boolean {
    return this.isActive;
  }
  
  getLastHeartbeat(): number {
    return this.lastHeartbeat;
  }
  
  getTimeSinceLastBeat(): number {
    return Date.now() - this.lastHeartbeat;
  }
  
  beat() {
    try {
      this.lastHeartbeat = Date.now();
      this.totalBeats++;
      
      // Reset contador quando recebemos um beat manual
      if (this.freezeDetectionCount > 0) {
        console.log('✅ Heartbeat recuperado');
        this.freezeDetectionCount = 0;
      }
    } catch (error) {
      this.errorCount++;
      console.error('❌ Erro no método beat:', error);
    }
  }
  
  getStats() {
    const uptime = this.startTime > 0 ? Date.now() - this.startTime : 0;
    return {
      isActive: this.isActive,
      uptime,
      totalBeats: this.totalBeats,
      errorCount: this.errorCount,
      freezeDetectionCount: this.freezeDetectionCount,
      averageBeatsPerMinute: uptime > 0 ? Math.round((this.totalBeats / uptime) * 60000) : 0,
      lastHeartbeat: this.lastHeartbeat,
      timeSinceLastBeat: Date.now() - this.lastHeartbeat
    };
  }
  
  private handleFrozenApp() {
    console.warn(`Tentando recuperar app congelado... (tentativa ${this.freezeDetectionCount}/${this.maxFreezeDetections})`);
    
    // Estratégia progressiva de recovery baseada no número de detecções
    if (this.freezeDetectionCount === 1) {
      // Primeira tentativa: limpar caches e localStorage problemático
      console.log('🧹 Limpando storage problemático...');
      this.clearProblematicStorage();
      this.forceGarbageCollection();
      
      // Reset heartbeat
      this.lastHeartbeat = Date.now();
      
    } else if (this.freezeDetectionCount === 2) {
      // Segunda tentativa: reset mais agressivo
      console.log('🔄 Reset mais agressivo...');
      this.clearAllTranspJardimStorage();
      this.resetPerformanceObservers();
      this.lastHeartbeat = Date.now();
      
    } else if (this.freezeDetectionCount >= this.maxFreezeDetections) {
      // Último recurso: reload da página
      console.error('🔴 App irrecuperável, recarregando página...');
      this.forceReload();
    }
    
    // Dar uma chance ao app para se recuperar
    setTimeout(() => {
      if (this.freezeDetectionCount > 0) {
        this.lastHeartbeat = Date.now();
        console.log('⏱️ Reset temporal do heartbeat para dar chance de recovery');
      }
    }, 2000);
  }
  
  private clearProblematicStorage() {
    try {
      const problemKeys = [
        'transpjardim-current-view',
        'transpjardim-auth-user',
        'transpjardim-auth-token'
      ];
      
      problemKeys.forEach(key => {
        const item = localStorage.getItem(key);
        if (item && item.length > 10000) { // Se item muito grande
          console.warn(`🗑️ Removendo item localStorage grande: ${key}`);
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('❌ Erro ao limpar localStorage:', error);
    }
  }
  
  private clearAllTranspJardimStorage() {
    try {
      console.warn('🗑️ Limpando todo o storage do TranspJardim...');
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('transpjardim-')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('❌ Erro ao limpar storage completo:', error);
    }
  }
  
  private forceGarbageCollection() {
    // Forçar garbage collection se disponível
    if ('gc' in window) {
      try {
        (window as any).gc();
        console.log('🗑️ Garbage collection forçado');
      } catch (error) {
        // Ignore - gc não disponível em produção
      }
    }
  }
  
  private resetPerformanceObservers() {
    try {
      // Limpar observadores de performance que podem estar causando overhead
      if ('PerformanceObserver' in window) {
        // Reset não disponível diretamente, mas podemos tentar reconectar
        console.log('🔄 Tentando reset de performance observers');
      }
    } catch (error) {
      console.warn('❌ Erro ao reset performance observers:', error);
    }
  }
  
  private forceReload() {
    try {
      // Salvar estado mínimo antes do reload
      const criticalData = {
        timestamp: Date.now(),
        reason: 'heartbeat_failure',
        freezeCount: this.freezeDetectionCount
      };
      sessionStorage.setItem('transpjardim-recovery', JSON.stringify(criticalData));
      
      // Reload forçado
      window.location.reload();
    } catch (error) {
      console.error('❌ Erro no reload forçado:', error);
      // Fallback: redirect para a própria página
      window.location.href = window.location.href;
    }
  }
  
  diagnose(): string {
    const stats = this.getStats();
    const lines = [
      '=== HEARTBEAT DIAGNOSIS ===',
      `Status: ${stats.isActive ? '✅ ATIVO' : '❌ INATIVO'}`,
      `Uptime: ${Math.round(stats.uptime / 1000)}s`,
      `Total Beats: ${stats.totalBeats}`,
      `Errors: ${stats.errorCount}`,
      `Freeze Detections: ${stats.freezeDetectionCount}`,
      `Avg Beats/min: ${stats.averageBeatsPerMinute}`,
      `Last Beat: ${new Date(stats.lastHeartbeat).toISOString()}`,
      `Time Since Last: ${Math.round(stats.timeSinceLastBeat / 1000)}s`,
      '=========================='
    ];
    
    return lines.join('\n');
  }
  
  logDiagnosis(): void {
    console.log(this.diagnose());
  }
}

export const appHeartbeat = new AppHeartbeat();

// Expor no window para debug em desenvolvimento
if (typeof window !== 'undefined') {
  try {
    const { toggleHeartbeat } = require('./heartbeatConfig');
    
    (window as any).transpjardimHeartbeat = {
      stats: () => {
        try {
          return appHeartbeat.getStats();
        } catch (error) {
          console.error('Erro ao obter stats:', error);
          return null;
        }
      },
      diagnose: () => {
        try {
          return appHeartbeat.logDiagnosis();
        } catch (error) {
          console.error('Erro no diagnose:', error);
        }
      },
      restart: () => {
        try {
          return appHeartbeat.restart();
        } catch (error) {
          console.error('Erro no restart:', error);
        }
      },
      status: () => {
        try {
          return {
            active: appHeartbeat.isHeartbeatActive(),
            lastBeat: appHeartbeat.getLastHeartbeat(),
            timeSince: appHeartbeat.getTimeSinceLastBeat()
          };
        } catch (error) {
          console.error('Erro ao obter status:', error);
          return null;
        }
      },
      toggle: () => {
        try {
          return toggleHeartbeat();
        } catch (error) {
          console.error('Erro no toggle:', error);
          return false;
        }
      },
      enable: () => {
        try {
          localStorage.setItem('transpjardim-heartbeat-enabled', 'true');
          console.log('🔧 Heartbeat habilitado. Recarregue a página.');
          return true;
        } catch (error) {
          console.error('Erro ao habilitar:', error);
          return false;
        }
      },
      disable: () => {
        try {
          localStorage.setItem('transpjardim-heartbeat-enabled', 'false');
          appHeartbeat.stop(); // Parar imediatamente
          console.log('🔧 Heartbeat desabilitado e parado.');
          return true;
        } catch (error) {
          console.error('Erro ao desabilitar:', error);
          return false;
        }
      },
      forceStop: () => {
        try {
          appHeartbeat.stop();
          console.log('🛑 Heartbeat forçado a parar');
          return true;
        } catch (error) {
          console.error('Erro ao forçar stop:', error);
          return false;
        }
      }
    };
  } catch (error) {
    console.warn('Erro ao expor transpjardimHeartbeat no window:', error);
  }
}

// Hook para usar o heartbeat em componentes React
export function useHeartbeat() {
  const beat = () => {
    try {
      appHeartbeat.beat();
    } catch (error) {
      console.warn('❌ Erro ao enviar heartbeat beat:', error);
    }
  };
  
  const status = () => {
    try {
      return {
        isActive: appHeartbeat.isHeartbeatActive(),
        lastBeat: appHeartbeat.getLastHeartbeat(),
        timeSinceBeat: appHeartbeat.getTimeSinceLastBeat()
      };
    } catch (error) {
      console.warn('❌ Erro ao obter status do heartbeat:', error);
      return {
        isActive: false,
        lastBeat: 0,
        timeSinceBeat: Infinity
      };
    }
  };
  
  return { beat, status };
}