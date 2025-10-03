import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import { emailService } from '../lib/emailService';

export type EmailStatus = 'unknown' | 'checking' | 'configured' | 'not_configured' | 'invalid';

interface EmailStatusHook {
  status: EmailStatus;
  isConfigured: boolean;
  isChecking: boolean;
  lastCheck: Date | null;
  checkStatus: () => Promise<void>;
  error: string | null;
}

export function useEmailStatus(): EmailStatusHook {
  const [status, setStatus] = useState<EmailStatus>('unknown');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    if (isChecking) {
      console.log('🔍 [useEmailStatus] Verificação já em andamento, pulando...');
      return;
    }
    
    setIsChecking(true);
    setError(null);
    
    try {
      console.log('🔍 [useEmailStatus] Verificando status da API Key usando EmailService...');
      
      // Usar o EmailService em vez de fetch direto
      const result = await emailService.sendTestEmail('test@status-check.com');

      // Se chegou aqui, significa que a API Key está válida
      setStatus('configured');
      setError(null);
      
      if (result.testMode) {
        console.log('✅ [useEmailStatus] API Key válida - Sistema em modo de teste');
      } else {
        console.log('✅ [useEmailStatus] API Key configurada e válida');
      }
      
      setLastCheck(new Date());
      
    } catch (error) {
      console.log('🔍 [useEmailStatus] Analisando erro da verificação...');
      
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        // Verificar se é erro de modo de teste (que na verdade é sucesso)
        if (errorMessage.includes('You can only send testing emails to your own email address')) {
          setStatus('configured');
          setError(null);
          console.log('✅ [useEmailStatus] API Key válida - Sistema em modo de teste (detectado via erro)');
        }
        // Verificar se é erro de API Key não configurada
        else if (errorMessage.includes('não configurada no servidor') || 
                 errorMessage.includes('missing_api_key')) {
          setStatus('not_configured');
          setError('API Key não configurada no servidor');
          console.log('⚠️ [useEmailStatus] API Key não configurada');
        }
        // Verificar se é erro de formato inválido
        else if (errorMessage.includes('formato inválido') || 
                 errorMessage.includes('invalid_api_key_format')) {
          setStatus('invalid');
          setError('API Key com formato inválido');
          console.log('❌ [useEmailStatus] API Key com formato inválido');
        }
        // Verificar se é erro de API Key inválida
        else if (errorMessage.includes('inválida') || errorMessage.includes('expirada')) {
          setStatus('invalid');
          setError('API Key inválida ou expirada');
          console.log('❌ [useEmailStatus] API Key inválida');
        }
        // Rate limit (que é um sinal de que a API Key está válida)
        else if (errorMessage.includes('rate_limit_exceeded') || 
                 errorMessage.includes('Too many requests')) {
          setStatus('configured');
          setError(null);
          console.log('✅ [useEmailStatus] API Key válida - Rate limit atingido (normal)');
        }
        // Verificar se é erro de conectividade
        else if (errorMessage.includes('conectividade') || errorMessage.includes('fetch')) {
          setStatus('unknown');
          setError('Erro de conectividade');
          console.log('❌ [useEmailStatus] Erro de conectividade');
        }
        // Outros erros
        else {
          setStatus('unknown');
          setError(errorMessage || 'Erro desconhecido');
          console.log('❌ [useEmailStatus] Erro desconhecido:', errorMessage);
        }
      } else {
        setStatus('unknown');
        setError('Erro desconhecido');
        console.log('❌ [useEmailStatus] Erro não identificado');
      }
      
      setLastCheck(new Date());
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Verificação inicial - usar ref para evitar loops
  useEffect(() => {
    let mounted = true;
    
    const performInitialCheck = async () => {
      if (mounted && !lastCheck) {
        await checkStatus();
      }
    };
    
    performInitialCheck();
    
    return () => {
      mounted = false;
    };
  }, []); // Dependência vazia para executar apenas uma vez

  const isConfigured = status === 'configured';

  return {
    status,
    isConfigured,
    isChecking,
    lastCheck,
    checkStatus,
    error
  };
}