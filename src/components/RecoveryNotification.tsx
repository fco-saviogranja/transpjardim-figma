import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { X, RefreshCw, AlertTriangle } from 'lucide-react';

interface RecoveryData {
  timestamp: number;
  reason: string;
  freezeCount?: number;
}

export const RecoveryNotification = () => {
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verificar se houve recovery automático de forma otimizada
    try {
      const recoveryInfo = sessionStorage.getItem('transpjardim-recovery');
      if (recoveryInfo) {
        const data: RecoveryData = JSON.parse(recoveryInfo);
        
        // Verificar se foi recente (últimos 2 minutos) - período menor
        const timeSinceRecovery = Date.now() - data.timestamp;
        if (timeSinceRecovery < 2 * 60 * 1000) {
          setRecoveryData(data);
        }
        
        // Limpar dados imediatamente para evitar acúmulo
        sessionStorage.removeItem('transpjardim-recovery');
      }
    } catch {
      // Ignorar erros silenciosamente
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
  };

  const handleReportIssue = () => {
    const issueData = {
      timestamp: new Date().toISOString(),
      recovery: recoveryData,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.log('🐛 Dados do problema para suporte:', issueData);
    
    // Aqui você pode implementar envio para sistema de logging
    // ou copiar para clipboard
    navigator.clipboard?.writeText(JSON.stringify(issueData, null, 2))
      .then(() => {
        console.log('📋 Dados copiados para clipboard');
      })
      .catch(() => {
        console.log('❌ Falha ao copiar dados');
      });
  };

  if (!recoveryData || dismissed) {
    return null;
  }

  const getRecoveryMessage = (reason: string, freezeCount?: number) => {
    switch (reason) {
      case 'heartbeat_failure':
        return `Sistema recuperado automaticamente após detectar congelamento${freezeCount ? ` (${freezeCount} tentativas)` : ''}.`;
      default:
        return 'Sistema recuperado automaticamente após problema técnico.';
    }
  };

  const timeAgo = Math.round((Date.now() - recoveryData.timestamp) / 1000);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="pr-8">
          <div className="space-y-2">
            <p className="font-semibold text-amber-800">
              Sistema Recuperado
            </p>
            <p className="text-sm text-amber-700">
              {getRecoveryMessage(recoveryData.reason, recoveryData.freezeCount)}
            </p>
            <p className="text-xs text-amber-600">
              Há {timeAgo} segundos • TranspJardim funcionando normalmente
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handleReportIssue}
                className="text-xs h-7"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reportar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-xs h-7"
              >
                OK
              </Button>
            </div>
          </div>
        </AlertDescription>
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-6 w-6 p-0"
          onClick={handleDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      </Alert>
    </div>
  );
};