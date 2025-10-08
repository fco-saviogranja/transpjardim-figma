// Utilitários para tratamento de erros no TranspJardim

export interface ErrorInfo {
  message: string;
  description?: string;
  type: 'network' | 'server' | 'client' | 'unknown';
  severity: 'low' | 'medium' | 'high';
}

// Analisar erro e retornar informações estruturadas
export const analyzeError = (error: any): ErrorInfo => {
  let message = 'Erro desconhecido';
  let description = '';
  let type: ErrorInfo['type'] = 'unknown';
  let severity: ErrorInfo['severity'] = 'medium';

  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('failed to fetch') || errorMessage.includes('network')) {
      message = 'Problema de conectividade';
      description = 'Não foi possível comunicar com o servidor';
      type = 'network';
      severity = 'high';
    } else if (errorMessage.includes('timeout') || error.name === 'AbortError') {
      message = 'Timeout na conexão';
      description = 'O servidor demorou para responder';
      type = 'network';
      severity = 'medium';
    } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      message = 'Recurso não encontrado';
      description = 'O endpoint solicitado não existe';
      type = 'client';
      severity = 'medium';
    } else if (errorMessage.includes('500') || errorMessage.includes('internal server')) {
      message = 'Erro interno do servidor';
      description = 'Problema no processamento da requisição';
      type = 'server';
      severity = 'high';
    } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      message = 'Acesso não autorizado';
      description = 'Credenciais inválidas ou expiradas';
      type = 'client';
      severity = 'medium';
    } else if (error.message && error.message.trim()) {
      message = error.message.trim();
      type = 'client';
      severity = 'low';
    }
  } else if (typeof error === 'string' && error.trim()) {
    message = error.trim();
    type = 'unknown';
    severity = 'low';
  }

  return { message, description, type, severity };
};

// Sanitizar mensagem para toast
export const sanitizeErrorMessage = (error: any): string => {
  const analyzed = analyzeError(error);
  return analyzed.message || 'Erro no sistema';
};

// Gerar mensagem amigável para o usuário
export const getUserFriendlyMessage = (error: any): { title: string; description: string } => {
  const analyzed = analyzeError(error);
  
  const friendlyMessages = {
    network: {
      title: 'Problema de conexão',
      description: 'Verifique sua internet ou tente novamente em alguns instantes'
    },
    server: {
      title: 'Problema no servidor',
      description: 'Nossos serviços estão temporariamente indisponíveis'
    },
    client: {
      title: 'Erro na solicitação',
      description: 'Verifique os dados informados e tente novamente'
    },
    unknown: {
      title: 'Erro inesperado',
      description: 'Algo deu errado. Tente novamente ou contate o suporte'
    }
  };

  const friendly = friendlyMessages[analyzed.type];
  
  return {
    title: analyzed.message || friendly.title,
    description: analyzed.description || friendly.description
  };
};

// Log estruturado de erro
export const logError = (context: string, error: any, additionalData?: any) => {
  const analyzed = analyzeError(error);
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    context,
    error: analyzed,
    originalError: error,
    additionalData,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // Log colorido baseado na severidade
  const colors = {
    low: 'color: #28a745',
    medium: 'color: #ffc107', 
    high: 'color: #dc3545'
  };

  console.groupCollapsed(
    `%c🚨 [${analyzed.severity.toUpperCase()}] ${context}: ${analyzed.message}`,
    colors[analyzed.severity]
  );
  console.log('Análise do erro:', analyzed);
  console.log('Erro original:', error);
  if (additionalData) {
    console.log('Dados adicionais:', additionalData);
  }
  console.log('Log completo:', logEntry);
  console.groupEnd();

  return logEntry;
};