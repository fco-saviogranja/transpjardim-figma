/**
 * Utilitários para detectar o ambiente de execução
 */

/**
 * Verifica se está em modo de desenvolvimento
 */
export function isDevelopment(): boolean {
  try {
    // Verificar Vite
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.DEV === true || import.meta.env.MODE === 'development';
    }
    
    // Verificar Node.js
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV === 'development';
    }
    
    // Fallback: verificar pela URL
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('dev');
    }
    
    return false;
  } catch (error) {
    console.warn('Erro ao detectar ambiente:', error);
    return false;
  }
}

/**
 * Verifica se está em modo de produção
 */
export function isProduction(): boolean {
  try {
    // Verificar Vite
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.PROD === true || import.meta.env.MODE === 'production';
    }
    
    // Verificar Node.js
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV === 'production';
    }
    
    // Fallback: assumir produção se não conseguir detectar dev
    return !isDevelopment();
  } catch (error) {
    console.warn('Erro ao detectar ambiente de produção:', error);
    return true; // Default para produção por segurança
  }
}

/**
 * Obtém variável de ambiente de forma segura
 */
export function getEnvVar(key: string, defaultValue: string = ''): string {
  try {
    // Verificar Vite
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || defaultValue;
    }
    
    // Verificar Node.js
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
    
    return defaultValue;
  } catch (error) {
    console.warn(`Erro ao obter variável de ambiente ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Log apenas em desenvolvimento
 */
export function devLog(...args: any[]): void {
  if (isDevelopment()) {
    console.log('[DEV]', ...args);
  }
}

/**
 * Log de debug com contexto
 */
export function debugLog(context: string, ...args: any[]): void {
  if (isDevelopment()) {
    console.log(`[DEBUG:${context}]`, ...args);
  }
}

/**
 * Informações do ambiente
 */
export function getEnvironmentInfo() {
  return {
    isDev: isDevelopment(),
    isProd: isProduction(),
    hasVite: typeof import.meta !== 'undefined',
    hasNode: typeof process !== 'undefined',
    hasWindow: typeof window !== 'undefined',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown'
  };
}