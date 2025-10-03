import { useState, useEffect, useCallback, useRef } from 'react';
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

// Cache global para evitar múltiplas verificações
let globalEmailStatus: EmailStatus = 'unknown';
let globalLastCheck: Date | null = null;
let globalError: string | null = null;
let isGlobalChecking = false;

export function useEmailStatus(): EmailStatusHook {
  const [status, setStatus] = useState<EmailStatus>(globalEmailStatus);
  const [lastCheck, setLastCheck] = useState<Date | null>(globalLastCheck);
  const [error, setError] = useState<string | null>(globalError);
  const [isChecking, setIsChecking] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const checkStatus = useCallback(async () => {
    // Evitar verificações múltiplas
    if (isGlobalChecking || isChecking) {
      console.log('🔍 [useEmailStatus] Verificação já em andamento, pulando...');
      return;
    }

    // Se verificou recentemente (menos de 5 minutos), usar cache
    const now = new Date();
    if (globalLastCheck && (now.getTime() - globalLastCheck.getTime()) < 5 * 60 * 1000) {
      console.log('🔍 [useEmailStatus] Usando status em cache (verificado há menos de 5 min)');
      setStatus(globalEmailStatus);
      setError(globalError);
      setLastCheck(globalLastCheck);
      return;
    }
    
    isGlobalChecking = true;
    setIsChecking(true);
    setError(null);
    
    try {
      console.log('🔍 [useEmailStatus] Verificando status da API Key usando EmailService...');
      
      // Usar o EmailService em vez de fetch direto
      const result = await emailService.sendTestEmail('status-check@test.local');

      if (!mountedRef.current) return;

      // Se chegou aqui, significa que a API Key está válida
      globalEmailStatus = 'configured';
      setStatus('configured');
      globalError = null;
      setError(null);
      
      if (result.testMode) {
        console.log('✅ [useEmailStatus] API Key válida - Sistema em modo de teste');
      } else {
        console.log('✅ [useEmailStatus] API Key configurada e válida');
      }
      
      globalLastCheck = new Date();
      setLastCheck(globalLastCheck);
      
    } catch (error) {
      if (!mountedRef.current) return;
      
      console.log('🔍 [useEmailStatus] Analisando erro da verificação...');
      
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        // Verificar se é erro de modo de teste (que na verdade é sucesso)
        if (errorMessage.includes('You can only send testing emails to your own email address')) {
          globalEmailStatus = 'configured';
          setStatus('configured');
          globalError = null;
          setError(null);
          console.log('✅ [useEmailStatus] API Key válida - Sistema em modo de teste (detectado via erro)');
        }
        // Verificar se é erro de API Key não configurada
        else if (errorMessage.includes('não configurada no servidor') || 
                 errorMessage.includes('missing_api_key')) {
          globalEmailStatus = 'not_configured';
          setStatus('not_configured');
          globalError = 'API Key não configurada no servidor';
          setError(globalError);
          console.log('⚠️ [useEmailStatus] API Key não configurada');
        }
        // Verificar se é erro de formato inválido
        else if (errorMessage.includes('formato inválido') || 
                 errorMessage.includes('invalid_api_key_format')) {
          globalEmailStatus = 'invalid';
          setStatus('invalid');
          globalError = 'API Key com formato inválido';
          setError(globalError);
          console.log('❌ [useEmailStatus] API Key com formato inválido');
        }
        // Verificar se é erro de API Key inválida
        else if (errorMessage.includes('inválida') || errorMessage.includes('expirada')) {
          globalEmailStatus = 'invalid';
          setStatus('invalid');
          globalError = 'API Key inválida ou expirada';
          setError(globalError);
          console.log('❌ [useEmailStatus] API Key inválida');
        }
        // Verificar se é erro de conectividade
        else if (errorMessage.includes('conectividade') || errorMessage.includes('fetch')) {
          globalEmailStatus = 'unknown';
          setStatus('unknown');
          globalError = 'Erro de conectividade';
          setError(globalError);
          console.log('❌ [useEmailStatus] Erro de conectividade');
        }
        // Rate limit (que é um sinal de que a API Key está válida)
        else if (errorMessage.includes('rate_limit_exceeded') || 
                 errorMessage.includes('Too many requests')) {
          globalEmailStatus = 'configured';
          setStatus('configured');
          globalError = null;
          setError(null);
          console.log('✅ [useEmailStatus] API Key válida - Rate limit atingido (normal)');
        }
        // Outros erros
        else {
          globalEmailStatus = 'unknown';
          setStatus('unknown');
          globalError = errorMessage || 'Erro desconhecido';
          setError(globalError);
          console.log('❌ [useEmailStatus] Erro desconhecido:', errorMessage);
        }
      } else {
        globalEmailStatus = 'unknown';
        setStatus('unknown');
        globalError = 'Erro desconhecido';
        setError(globalError);
        console.log('❌ [useEmailStatus] Erro não identificado');
      }
      
      globalLastCheck = new Date();
      setLastCheck(globalLastCheck);
    } finally {
      isGlobalChecking = false;
      if (mountedRef.current) {
        setIsChecking(false);
      }
    }
  }, [isChecking]);

  // Verificação inicial apenas se nunca verificou ou há mais de 10 minutos
  useEffect(() => {
    if (!globalLastCheck || (new Date().getTime() - globalLastCheck.getTime()) > 10 * 60 * 1000) {
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          checkStatus();
        }
      }, 1000); // Aguardar 1 segundo antes da primeira verificação
      
      return () => clearTimeout(timer);
    } else {
      // Usar status em cache
      setStatus(globalEmailStatus);
      setError(globalError);
      setLastCheck(globalLastCheck);
    }
  }, []);

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