import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Heart, Activity, AlertTriangle, RefreshCw } from 'lucide-react';
import { appHeartbeat } from '../utils/heartbeat';

export const HeartbeatStatus = () => {
  const [visible, setVisible] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const checkHeartbeat = () => {
      try {
        // Usar métodos diretos do appHeartbeat
        const heartbeatStats = appHeartbeat.getStats();
        const isActive = appHeartbeat.isHeartbeatActive();
        const timeSinceBeat = appHeartbeat.getTimeSinceLastBeat();
      
        // Mostrar se há problemas
        const hasProblems = 
          !isActive || 
          timeSinceBeat > 10000 ||
          heartbeatStats.errorCount > 5 ||
          heartbeatStats.freezeDetectionCount > 0;
      
        setVisible(hasProblems);
        setStats({ ...heartbeatStats, isActive, timeSinceBeat });
      } catch (error) {
        console.warn('Erro ao verificar heartbeat status:', error);
        setVisible(false);
        setStats(null);
      }
    };

    // Verificar a cada 5 segundos
    const interval = setInterval(checkHeartbeat, 5000);
    checkHeartbeat(); // Verificação inicial

    return () => clearInterval(interval);
  }, []);

  const handleRestart = () => {
    appHeartbeat.restart();
    setTimeout(() => {
      setVisible(false);
    }, 2000);
  };

  const handleDiagnose = () => {
    appHeartbeat.logDiagnosis();
  };

  if (!visible || !stats) {
    return null;
  }

  const getStatusColor = () => {
    if (!stats.isActive) return 'destructive';
    if (stats.freezeDetectionCount > 0) return 'destructive';
    if (stats.errorCount > 5) return 'destructive';
    return 'secondary';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert variant={getStatusColor()}>
        <Activity className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Sistema de Monitoramento</span>
              <Badge variant={stats.isActive ? "default" : "destructive"}>
                {stats.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            
            <div className="text-sm space-y-1">
              {stats.freezeDetectionCount > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <span>Congelamentos detectados: {stats.freezeDetectionCount}</span>
                </div>
              )}
              
              {stats.errorCount > 5 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                  <span>Erros: {stats.errorCount}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Heart className="h-3 w-3 text-red-500" />
                <span>Último beat: {Math.round(stats.timeSinceLastBeat / 1000)}s atrás</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRestart}
                className="text-xs h-7"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reiniciar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDiagnose}
                className="text-xs h-7"
              >
                Debug
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setVisible(false)}
                className="text-xs h-7"
              >
                Ocultar
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};