import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';

interface EmailDebouncerState {
  isProcessing: boolean;
  lastRequestTime: number;
  requestCount: number;
  cooldownUntil: number;
}

class EmailDebouncer {
  private state: EmailDebouncerState = {
    isProcessing: false,
    lastRequestTime: 0,
    requestCount: 0,
    cooldownUntil: 0
  };

  private readonly MIN_INTERVAL = 3000; // 3 segundos entre requisições
  private readonly MAX_REQUESTS_PER_MINUTE = 10;
  private readonly COOLDOWN_DURATION = 30000; // 30 segundos de cooldown

  canMakeRequest(): { allowed: boolean; reason?: string; waitTime?: number } {
    const now = Date.now();

    // Verificar se está em cooldown
    if (now < this.state.cooldownUntil) {
      const waitTime = Math.ceil((this.state.cooldownUntil - now) / 1000);
      return {
        allowed: false,
        reason: 'Sistema em cooldown após muitas tentativas',
        waitTime
      };
    }

    // Verificar se já está processando
    if (this.state.isProcessing) {
      return {
        allowed: false,
        reason: 'Já existe uma requisição sendo processada'
      };
    }

    // Verificar intervalo mínimo
    const timeSinceLastRequest = now - this.state.lastRequestTime;
    if (timeSinceLastRequest < this.MIN_INTERVAL) {
      const waitTime = Math.ceil((this.MIN_INTERVAL - timeSinceLastRequest) / 1000);
      return {
        allowed: false,
        reason: 'Aguarde antes de fazer nova tentativa',
        waitTime
      };
    }

    // Resetar contador se passou mais de 1 minuto
    if (timeSinceLastRequest > 60000) {
      this.state.requestCount = 0;
    }

    // Verificar limite por minuto
    if (this.state.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
      this.state.cooldownUntil = now + this.COOLDOWN_DURATION;
      return {
        allowed: false,
        reason: 'Muitas tentativas. Sistema em cooldown.',
        waitTime: 30
      };
    }

    return { allowed: true };
  }

  markRequestStart() {
    const now = Date.now();
    this.state.isProcessing = true;
    this.state.lastRequestTime = now;
    this.state.requestCount++;
  }

  markRequestEnd() {
    this.state.isProcessing = false;
  }

  getState() {
    return { ...this.state };
  }

  reset() {
    this.state = {
      isProcessing: false,
      lastRequestTime: 0,
      requestCount: 0,
      cooldownUntil: 0
    };
  }
}

// Instância singleton
const emailDebouncer = new EmailDebouncer();

export function useEmailDebouncer() {
  const [state, setState] = useState(emailDebouncer.getState());
  const updateStateRef = useRef<number>();

  const updateState = useCallback(() => {
    setState(emailDebouncer.getState());
  }, []);

  const startPeriodicUpdate = useCallback(() => {
    if (updateStateRef.current) {
      clearInterval(updateStateRef.current);
    }
    updateStateRef.current = window.setInterval(updateState, 1000);
  }, [updateState]);

  const stopPeriodicUpdate = useCallback(() => {
    if (updateStateRef.current) {
      clearInterval(updateStateRef.current);
      updateStateRef.current = undefined;
    }
  }, []);

  const executeWithDebounce = useCallback(async <T,>(
    requestFn: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ): Promise<T | null> => {
    const checkResult = emailDebouncer.canMakeRequest();
    
    if (!checkResult.allowed) {
      const message = checkResult.waitTime 
        ? `${checkResult.reason} (${checkResult.waitTime}s)`
        : checkResult.reason;

      toast.warning(message || 'Requisição bloqueada', {
        description: checkResult.waitTime 
          ? `Aguarde ${checkResult.waitTime} segundos antes de tentar novamente.`
          : 'Tente novamente em alguns instantes.'
      });

      if (onError) {
        onError(new Error(checkResult.reason || 'Request blocked'));
      }

      return null;
    }

    try {
      emailDebouncer.markRequestStart();
      updateState();
      startPeriodicUpdate();

      const result = await requestFn();
      
      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      console.error('[EmailDebouncer] Erro na requisição:', error);
      
      if (onError) {
        onError(error instanceof Error ? error : new Error('Unknown error'));
      }

      // Se for erro de rate limit, entrar em cooldown
      if (error instanceof Error && error.message.includes('rate limit')) {
        emailDebouncer.getState().cooldownUntil = Date.now() + emailDebouncer['COOLDOWN_DURATION'];
        toast.error('Rate limit atingido', {
          description: 'Sistema entrará em cooldown por 30 segundos.'
        });
      }

      throw error;
    } finally {
      emailDebouncer.markRequestEnd();
      updateState();
      
      // Parar atualização periódica se não há cooldown ativo
      if (Date.now() >= emailDebouncer.getState().cooldownUntil) {
        stopPeriodicUpdate();
      }
    }
  }, [updateState, startPeriodicUpdate, stopPeriodicUpdate]);

  const reset = useCallback(() => {
    emailDebouncer.reset();
    updateState();
    stopPeriodicUpdate();
  }, [updateState, stopPeriodicUpdate]);

  return {
    state,
    executeWithDebounce,
    reset,
    canMakeRequest: emailDebouncer.canMakeRequest.bind(emailDebouncer)
  };
}

export { emailDebouncer };