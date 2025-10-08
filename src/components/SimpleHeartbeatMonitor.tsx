import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Activity, RefreshCw, X } from 'lucide-react';

/**
 * Monitor simples e robusto do sistema de heartbeat
 * Não depende de hooks complexos para evitar erros
 */
export const SimpleHeartbeatMonitor = () => {
  const [visible, setVisible] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [issues, setIssues] = useState<string[]>([]);

  useEffect(() => {
    const checkSystem = () => {
      try {
        const currentIssues: string[] = [];
        
        // Verificar se existe transpjardimHeartbeat no window
        if (typeof window !== 'undefined' && (window as any).transpjardimHeartbeat) {
          const heartbeatAPI = (window as any).transpjardimHeartbeat;
          
          try {
            const status = heartbeatAPI.status();
            if (status) {
              if (!status.active) {
                currentIssues.push('Sistema de monitoramento inativo');
              }
              
              if (status.timeSince > 45000) { // Mais tolerante: 45 segundos
                currentIssues.push(`Heartbeat atrasado (${Math.round(status.timeSince / 1000)}s)`);
              }
            }
            
            const stats = heartbeatAPI.stats();
            if (stats) {
              if (stats.errorCount > 10) { // Mais tolerante
                currentIssues.push(`Erros detectados: ${stats.errorCount}`);
              }
              
              if (stats.freezeDetectionCount > 2) { // Mais tolerante
                currentIssues.push(`Congelamentos: ${stats.freezeDetectionCount}`);
              }
            }
          } catch (apiError) {
            currentIssues.push('Erro ao acessar API de monitoramento');
          }
        } else {
          currentIssues.push('Sistema de monitoramento não encontrado');
        }
        
        setIssues(currentIssues);
        setVisible(currentIssues.length > 0);
        setLastCheck(new Date());
        
      } catch (error) {
        console.warn('Erro no SimpleHeartbeatMonitor:', error);
        setVisible(false);
        setIssues([]);
      }
    };

    // Verificar a cada 30 segundos (menos agressivo)
    const interval = setInterval(checkSystem, 30000);
    checkSystem(); // Verificação inicial

    return () => clearInterval(interval);
  }, []);

  const handleRestart = () => {
    try {
      if (typeof window !== 'undefined' && (window as any).transpjardimHeartbeat) {
        (window as any).transpjardimHeartbeat.restart();
        setTimeout(() => setVisible(false), 3000);
      } else {
        // Fallback: recarregar página
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao reiniciar:', error);
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  if (!visible || issues.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert variant="destructive">
        <Activity className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Sistema TranspJardim</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleDismiss}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="text-sm space-y-1">
              {issues.map((issue, index) => (
                <div key={index} className="text-red-100">
                  • {issue}
                </div>
              ))}
            </div>
            
            <div className="text-xs text-red-200 mb-2">
              Última verificação: {lastCheck.toLocaleTimeString()}
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRestart}
                className="text-xs h-7 bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reiniciar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-xs h-7 text-red-100 hover:text-red-50 hover:bg-red-800/20"
              >
                OK
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};