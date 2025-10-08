import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, Mail, AlertTriangle, Settings, ExternalLink, CheckCircle } from 'lucide-react';
import { useEmailStatus } from '../hooks/useEmailStatusOptimized';
import { EmailSystemFallback } from './EmailSystemFallback';
import { ApiKeyErrorHelp } from './ApiKeyErrorHelp';

interface EmailSetupNotificationProps {
  onConfigure?: () => void;
  showDismissible?: boolean;
}

export function EmailSetupNotification({ onConfigure, showDismissible = true }: EmailSetupNotificationProps) {
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('transpjardim-email-notification-dismissed') === 'true';
    }
    return false;
  });

  const { status, isConfigured, isChecking, checkStatus, error } = useEmailStatus();

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('transpjardim-email-notification-dismissed', 'true');
    }
  };

  const handleReshow = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('transpjardim-email-notification-dismissed');
    }
    setIsDismissed(false);
    checkStatus(); // Recheck status when reshowing
  };

  // Se foi dispensado e é dismissible, mostrar apenas botão pequeno
  if (isDismissed && showDismissible && !isConfigured) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReshow}
          className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
        >
          <Mail className="h-4 w-4 mr-2" />
          Configurar E-mail
        </Button>
      </div>
    );
  }

  // Se está configurado, mostrar sucesso brevemente
  if (isConfigured) {
    return (
      <Alert className="border-green-200 bg-green-50 mb-4">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">
          ✅ Sistema de E-mail Configurado
        </AlertTitle>
        <AlertDescription className="text-green-700">
          API Key válida. Sistema pronto para enviar alertas automáticos.
          <span className="block text-sm mt-1">
            📧 Atualmente em modo de teste - e-mails enviados para o proprietário da conta Resend.
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  // Se não está configurado ou tem erro, mostrar alerta
  if (status === 'not_configured' || status === 'invalid' || error) {
    return (
      <Alert className="border-amber-200 bg-amber-50 mb-4">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <div className="flex items-start justify-between w-full">
          <div className="flex-1">
            <AlertTitle className="text-amber-800 flex items-center space-x-2">
              <span>🚨 Sistema de E-mail Não Configurado</span>
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                {status === 'not_configured' ? 'Não Configurado' :
                 status === 'invalid' ? 'Inválido' : 'Erro'}
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-amber-700 space-y-3">
              <p>
                <strong>Os alertas por e-mail não estão funcionando.</strong> 
                {error && (
                  <span className="block text-sm mt-1">
                    Erro: {error}
                  </span>
                )}
              </p>

              <div className="bg-white p-3 rounded border border-amber-200">
                <h4 className="font-medium text-amber-900 mb-2">🔧 Solução Rápida:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-amber-800">
                  <li>Crie uma conta gratuita no <strong>Resend</strong> (3.000 e-mails/mês)</li>
                  <li>Gere uma <strong>API Key</strong> no dashboard (deve começar com "re_")</li>
                  <li>Configure no TranspJardim clicando no botão abaixo</li>
                </ol>
                {error && error.includes('formato inválido') && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                    <strong>❌ Erro:</strong> A API Key deve começar com "re_" e ter pelo menos 32 caracteres.
                    <br />Exemplo: re_AbCdEfGh123456789012345678901234
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={onConfigure}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Agora
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open('https://resend.com/signup', '_blank')}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Criar Conta Resend
                </Button>

                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={checkStatus}
                  disabled={isChecking}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  {isChecking ? 'Verificando...' : 'Verificar Status'}
                </Button>
              </div>
            </AlertDescription>
          </div>

          {showDismissible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Alert>
    );
  }

  // Se está verificando, mostrar loading
  if (isChecking || status === 'checking') {
    return (
      <Alert className="border-blue-200 bg-blue-50 mb-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <AlertTitle className="text-blue-800">
          Verificando Status do E-mail...
        </AlertTitle>
        <AlertDescription className="text-blue-700">
          Aguarde enquanto verificamos a configuração do sistema de e-mail.
        </AlertDescription>
      </Alert>
    );
  }

  // Se há erro de timeout ou conectividade, mostrar fallback
  if (status === 'unknown' && error && (error.includes('Timeout') || error.includes('conectividade'))) {
    return (
      <EmailSystemFallback 
        error={error}
        onRetry={checkStatus}
        showRetry={true}
      />
    );
  }

  return null;
}