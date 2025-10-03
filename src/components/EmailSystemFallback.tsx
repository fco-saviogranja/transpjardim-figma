import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertTriangle, Mail, Clock, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface EmailSystemFallbackProps {
  error?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function EmailSystemFallback({ error, onRetry, showRetry = true }: EmailSystemFallbackProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => {
        setIsRetrying(false);
      }, 2000);
    }
  };

  return (
    <Alert className="border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800 flex items-center space-x-2">
        <span>Sistema de E-mail Indisponível</span>
        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
          Modo Offline
        </Badge>
      </AlertTitle>
      <AlertDescription className="text-amber-700 space-y-3">
        <p>
          <strong>O sistema está funcionando normalmente</strong>, mas os alertas por e-mail estão temporariamente indisponíveis.
        </p>

        {error && (
          <div className="bg-white p-3 rounded border border-amber-200">
            <p className="text-sm">
              <strong>Motivo:</strong> {error}
            </p>
          </div>
        )}

        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">📋 O que continua funcionando:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
            <li>Todos os critérios e funcionalidades principais</li>
            <li>Alertas no painel e notificações visuais</li>
            <li>Conclusão de tarefas e histórico</li>
            <li>Relatórios e administração</li>
          </ul>
        </div>

        <div className="bg-green-50 p-3 rounded border border-green-200">
          <p className="text-sm text-green-800">
            <strong>💡 Para receber alertas automáticos por e-mail:</strong> Configure a API Key do Resend quando possível.
          </p>
        </div>

        {showRetry && (
          <div className="flex items-center space-x-2 pt-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleRetry}
              disabled={isRetrying}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              {isRetrying ? (
                <>
                  <Clock className="h-3 w-3 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Tentar Novamente
                </>
              )}
            </Button>
            
            <span className="text-xs text-amber-600">
              O sistema continua funcionando normalmente
            </span>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}