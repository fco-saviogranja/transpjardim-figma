import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Mail, Clock } from 'lucide-react';
import { useEmailStatus } from '../hooks/useEmailStatusOptimized';

interface EmailStatusIndicatorProps {
  showFullAlert?: boolean;
}

export function EmailStatusIndicator({ showFullAlert = false }: EmailStatusIndicatorProps) {
  const { status, isConfigured, isChecking, error } = useEmailStatus();

  if (showFullAlert) {
    if (isChecking || status === 'checking') {
      return (
        <Alert className="border-blue-200 bg-blue-50">
          <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
          <AlertTitle className="text-blue-800">
            Verificando Sistema de E-mail...
          </AlertTitle>
          <AlertDescription className="text-blue-700">
            Aguarde enquanto verificamos se o sistema de alertas por e-mail está configurado.
          </AlertDescription>
        </Alert>
      );
    }

    if (!isConfigured) {
      return (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">
            ⚠️ Alertas por E-mail Desabilitados
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            <p>O sistema não enviará alertas automáticos por e-mail porque:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>A API Key do Resend não está configurada</li>
              <li>Os alertas serão exibidos apenas no painel</li>
              <li>Configure o e-mail para receber notificações automáticas</li>
            </ul>
            {error && (
              <p className="text-sm mt-2 p-2 bg-amber-100 rounded">
                <strong>Erro:</strong> {error}
              </p>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">
          ✅ Alertas por E-mail Ativos
        </AlertTitle>
        <AlertDescription className="text-green-700">
          O sistema pode enviar alertas automáticos por e-mail quando necessário.
        </AlertDescription>
      </Alert>
    );
  }

  // Versão compacta (badge)
  const getStatusInfo = () => {
    if (isChecking || status === 'checking') {
      return {
        variant: 'outline' as const,
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <Clock className="h-3 w-3 animate-pulse" />,
        text: 'Verificando E-mail'
      };
    }

    if (isConfigured) {
      return {
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="h-3 w-3" />,
        text: 'E-mail OK'
      };
    }

    return {
      variant: 'outline' as const,
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <XCircle className="h-3 w-3" />,
      text: 'E-mail OFF'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Badge variant={statusInfo.variant} className={statusInfo.className}>
      <div className="flex items-center space-x-1">
        {statusInfo.icon}
        <span className="text-xs">{statusInfo.text}</span>
      </div>
    </Badge>
  );
}