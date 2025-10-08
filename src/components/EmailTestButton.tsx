import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Mail, Send, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useEmailStatus } from '../hooks/useEmailStatusOptimized';
import { useEmailDebouncer } from './EmailDebouncer';
import { sendTestEmail } from '../lib/emailService';

interface EmailTestButtonProps {
  onShowConfig?: () => void;
}

export function EmailTestButton({ onShowConfig }: EmailTestButtonProps) {
  const [isTesting, setIsTesting] = useState(false);
  const { isConfigured: emailConfigured, status } = useEmailStatus();
  const { state: debouncerState, executeWithDebounce } = useEmailDebouncer();

  const handleQuickTest = async () => {
    if (!emailConfigured) {
      toast.error('Sistema de e-mail não configurado');
      if (onShowConfig) {
        onShowConfig();
      }
      return;
    }

    const testEmail = 'admin@jardim.ce.gov.br'; // E-mail de teste padrão
    setIsTesting(true);

    await executeWithDebounce(
      async () => {
        return await sendTestEmail(testEmail);
      },
      (result) => {
        // Sucesso
        console.log('✅ [EmailTestButton] Teste bem-sucedido:', result);
        
        if (result.testMode) {
          toast.success(`✅ E-mail enviado (modo teste)`, {
            description: `Redirecionado para: ${result.authorizedEmail}`,
            duration: 6000
          });
        } else {
          toast.success(`✅ E-mail de teste enviado para ${testEmail}!`, {
            description: `ID: ${result.emailId}`,
            duration: 5000
          });
        }
      },
      (error) => {
        // Erro
        console.error('❌ [EmailTestButton] Erro no teste:', error);
        
        if (!error.message.includes('rate limit') && !error.message.includes('Aguarde')) {
          toast.error(`❌ Falha no teste de e-mail`, {
            description: error.message || 'Erro desconhecido',
            duration: 8000,
            action: {
              label: 'Configurar',
              onClick: () => {
                if (onShowConfig) {
                  onShowConfig();
                }
              }
            }
          });
        }
      }
    );
    
    setIsTesting(false);
  };

  const getStatusColor = () => {
    if (status === 'checking') return 'bg-blue-100 text-blue-800';
    if (emailConfigured) return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusIcon = () => {
    if (status === 'checking') return <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>;
    if (emailConfigured) return <CheckCircle className="h-3 w-3" />;
    return <XCircle className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (status === 'checking') return 'Verificando...';
    if (emailConfigured) return 'Configurado';
    return 'Não Configurado';
  };

  return (
    <div className="flex items-center space-x-2">
      <Badge variant="outline" className={getStatusColor()}>
        <div className="flex items-center space-x-1">
          {getStatusIcon()}
          <span className="text-xs">{getStatusText()}</span>
        </div>
      </Badge>
      
      <Button
        size="sm"
        variant={emailConfigured ? "default" : "outline"}
        onClick={emailConfigured ? handleQuickTest : onShowConfig}
        disabled={isTesting || debouncerState.isProcessing || Date.now() < debouncerState.cooldownUntil}
        className={emailConfigured ? "" : "border-amber-300 text-amber-700 hover:bg-amber-50"}
      >
        {isTesting || debouncerState.isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
            Testando...
          </>
        ) : Date.now() < debouncerState.cooldownUntil ? (
          <>
            <Clock className="h-3 w-3 mr-2" />
            Aguarde...
          </>
        ) : emailConfigured ? (
          <>
            <Send className="h-3 w-3 mr-2" />
            Testar E-mail
          </>
        ) : (
          <>
            <AlertTriangle className="h-3 w-3 mr-2" />
            Configurar
          </>
        )}
      </Button>
    </div>
  );
}