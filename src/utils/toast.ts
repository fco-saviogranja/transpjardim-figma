import { toast as sonnerToast } from 'sonner@2.0.3';
import { sanitizeErrorMessage, getUserFriendlyMessage, logError } from './errorHandling';

// Função para sanitizar e validar mensagens
const sanitizeMessage = (message: string | undefined | null): string => {
  if (!message) return '';
  return String(message).trim();
};

// Wrapper para o toast que previne mensagens vazias
export const toast = {
  success: (message: string, options?: any) => {
    const cleanMessage = sanitizeMessage(message);
    
    if (cleanMessage) {
      console.log('📢 Toast success:', cleanMessage);
      return sonnerToast.success(cleanMessage, options);
    }
    
    console.warn('⚠️ Tentativa de toast success com mensagem vazia, ignorando');
    return null;
  },
  
  error: (message: string | Error | any, options?: any) => {
    let cleanMessage = '';
    let description = options?.description;
    
    // Se é um erro estruturado, processar
    if (message instanceof Error || (message && typeof message === 'object')) {
      const friendlyMessage = getUserFriendlyMessage(message);
      cleanMessage = friendlyMessage.title;
      description = description || friendlyMessage.description;
      
      // Log estruturado
      logError('Toast Error', message);
    } else {
      cleanMessage = sanitizeMessage(message);
    }
    
    if (cleanMessage) {
      console.log('📢 Toast error:', cleanMessage);
      return sonnerToast.error(cleanMessage, {
        ...options,
        description
      });
    }
    
    console.warn('⚠️ Tentativa de toast error com mensagem vazia, usando fallback');
    return sonnerToast.error('Erro no sistema', {
      ...options,
      description: description || 'Algo deu errado. Tente novamente.'
    });
  },
  
  info: (message: string, options?: any) => {
    const cleanMessage = sanitizeMessage(message);
    
    if (cleanMessage) {
      console.log('📢 Toast info:', cleanMessage);
      return sonnerToast.info(cleanMessage, options);
    }
    
    console.warn('⚠️ Tentativa de toast info com mensagem vazia, ignorando');
    return null;
  },
  
  warning: (message: string, options?: any) => {
    const cleanMessage = sanitizeMessage(message);
    
    if (cleanMessage) {
      console.log('📢 Toast warning:', cleanMessage);
      return sonnerToast(cleanMessage, { 
        ...options, 
        style: { backgroundColor: '#fff3cd', color: '#856404' } 
      });
    }
    
    console.warn('⚠️ Tentativa de toast warning com mensagem vazia, ignorando');
    return null;
  },

  // Função especial para debug - sempre mostra algo
  debug: (message: string, data?: any) => {
    const cleanMessage = sanitizeMessage(message) || 'Debug info';
    console.log('🐛 Toast debug:', cleanMessage, data);
    
    return sonnerToast(cleanMessage, {
      description: data ? JSON.stringify(data, null, 2) : undefined,
      duration: 5000,
      style: { backgroundColor: '#e3f2fd', color: '#1565c0' }
    });
  },

  // Função para erros de rede com tratamento especial
  networkError: (error: any, context = 'Operação') => {
    const errorMessage = sanitizeErrorMessage(error);
    logError(`Network Error - ${context}`, error);
    
    return sonnerToast.error('Problema de conectividade', {
      description: `${context}: ${errorMessage}`,
      duration: 5000
    });
  }
};