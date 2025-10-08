import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Activity, Cpu, HardDrive, Mail, RefreshCw } from 'lucide-react';

interface PerformanceStats {
  memoryUsage: number;
  totalMemory: number;
  heartbeatActive: boolean;
  timeSinceLastBeat: number;
  errorCount: number;
  freezeCount: number;
}

export const SystemPerformanceInfo = () => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      try {
        let memoryUsage = 0;
        let totalMemory = 0;
        
        // Obter informações de memória
        if ('memory' in performance) {
          const memInfo = (performance as any).memory;
          memoryUsage = Math.round(memInfo.usedJSHeapSize / 1048576);
          totalMemory = Math.round(memInfo.totalJSHeapSize / 1048576);
        }

        // Obter informações do heartbeat
        let heartbeatStats = {
          heartbeatActive: false,
          timeSinceLastBeat: 0,
          errorCount: 0,
          freezeCount: 0
        };

        if (typeof window !== 'undefined' && (window as any).transpjardimHeartbeat) {
          try {
            const heartbeatAPI = (window as any).transpjardimHeartbeat;
            const status = heartbeatAPI.status();
            const apiStats = heartbeatAPI.stats();
            
            if (status && apiStats) {
              heartbeatStats = {
                heartbeatActive: status.active,
                timeSinceLastBeat: status.timeSince,
                errorCount: apiStats.errorCount,
                freezeCount: apiStats.freezeDetectionCount
              };
            }
          } catch (error) {
            console.warn('Erro ao obter stats do heartbeat:', error);
          }
        }

        const newStats: PerformanceStats = {
          memoryUsage,
          totalMemory,
          ...heartbeatStats
        };

        setStats(newStats);
        
        // Mostrar apenas se houver problemas reais ou uso muito alto de memória
        const shouldShow = 
          memoryUsage > 300 || 
          (!heartbeatStats.heartbeatActive && heartbeatStats.timeSinceLastBeat > 300000) || // 5 minutos
          heartbeatStats.errorCount > 15 ||
          heartbeatStats.freezeCount > 3;
          
        setVisible(shouldShow);
        
      } catch (error) {
        console.warn('Erro ao coletar stats de performance:', error);
      }
    };

    // Atualizar a cada minuto
    const interval = setInterval(updateStats, 60000);
    updateStats(); // Inicial

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleOptimize = () => {
    try {
      // Limpar localStorage antigo
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('transpjardim-') && localStorage.getItem(key)?.length > 50000) {
          localStorage.removeItem(key);
          console.log('🗑️ Removido item grande do localStorage:', key);
        }
      });

      // Forçar garbage collection se disponível
      if ('gc' in window) {
        (window as any).gc();
        console.log('🗑️ Garbage collection executado');
      }

      // Reiniciar heartbeat
      if (typeof window !== 'undefined' && (window as any).transpjardimHeartbeat) {
        (window as any).transpjardimHeartbeat.restart();
        console.log('💓 Heartbeat reiniciado');
      }

      setTimeout(() => setVisible(false), 3000);
    } catch (error) {
      console.error('Erro na otimização:', error);
    }
  };

  if (!visible || !stats) {
    return null;
  }

  const getMemoryStatus = () => {
    if (stats.memoryUsage > 300) return { color: 'destructive', text: 'Alto' };
    if (stats.memoryUsage > 200) return { color: 'secondary', text: 'Moderado' };
    return { color: 'default', text: 'Normal' };
  };

  const memoryStatus = getMemoryStatus();

  return (
    <Card className="fixed bottom-4 left-4 z-40 w-80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance TranspJardim
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVisible(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Memória */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-3 w-3" />
            <span className="text-sm">Memória JS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">{stats.memoryUsage}MB</span>
            <Badge variant={memoryStatus.color} className="text-xs">
              {memoryStatus.text}
            </Badge>
          </div>
        </div>

        {/* Heartbeat */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-3 w-3" />
            <span className="text-sm">Monitoramento</span>
          </div>
          <Badge variant={stats.heartbeatActive ? "default" : "destructive"} className="text-xs">
            {stats.heartbeatActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>

        {/* Erros */}
        {stats.errorCount > 5 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Erros</span>
            <Badge variant="secondary" className="text-xs">
              {stats.errorCount}
            </Badge>
          </div>
        )}

        {/* Congelamentos */}
        {stats.freezeCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Congelamentos</span>
            <Badge variant="secondary" className="text-xs">
              {stats.freezeCount}
            </Badge>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleOptimize}
            className="text-xs h-7 flex-1"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Otimizar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            className="text-xs h-7"
          >
            Recarregar
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Sistema otimizado para melhor performance
        </p>
      </CardContent>
    </Card>
  );
};