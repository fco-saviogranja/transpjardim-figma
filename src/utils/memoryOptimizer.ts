/**
 * Utilitário otimizado para monitoramento e otimização de memória
 */

let lastMemoryCheck = 0;
let memoryWarningCount = 0;

export function optimizeMemoryUsage(): void {
  const now = Date.now();
  
  // Apenas verificar a cada 5 minutos para reduzir overhead
  if (now - lastMemoryCheck < 300000) {
    return;
  }
  
  lastMemoryCheck = now;
  
  try {
    // Verificar memória se API estiver disponível
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const used = Math.round(memInfo.usedJSHeapSize / 1048576); // MB
      const limit = Math.round(memInfo.jsHeapSizeLimit / 1048576); // MB
      
      // Apenas alertar se uso for muito alto (mais de 70% do limite)
      const percentage = (used / limit) * 100;
      if (percentage > 70) {
        memoryWarningCount++;
        
        // Alertar apenas ocasionalmente para evitar spam
        if (memoryWarningCount % 3 === 1) {
          console.warn('⚠️ Alto uso de memória:', {
            used: `${used}MB`,
            limit: `${limit}MB`,
            percentage: `${Math.round(percentage)}%`
          });
        }
        
        // Tentar otimizações automáticas
        performMemoryOptimizations();
      } else {
        // Reset contador se memória voltar ao normal
        memoryWarningCount = 0;
      }
    }
  } catch (error) {
    // Ignorar erros silenciosamente
  }
}

function performMemoryOptimizations(): void {
  try {
    // Limpar caches antigos do localStorage
    cleanupLocalStorage();
    
    // Limpar timers órfãos se possível
    cleanupTimers();
    
    // Forçar garbage collection se disponível (apenas em desenvolvimento)
    if (isDevelopment() && 'gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  } catch (error) {
    // Ignorar erros de otimização
  }
}

function cleanupLocalStorage(): void {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    // Remover itens antigos específicos do TranspJardim
    keys.forEach(key => {
      if (key.startsWith('transpjardim-') && key.includes('temp-')) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const data = JSON.parse(item);
            // Remover itens temporários com mais de 1 hora
            if (data.timestamp && (now - data.timestamp) > 3600000) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Se não conseguir parsear, remover item
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    // Ignorar erros de limpeza
  }
}

function cleanupTimers(): void {
  // Esta função é limitada no que pode fazer no browser
  // Principalmente serve para demonstrar a intenção de limpeza
}

function isDevelopment(): boolean {
  try {
    return (
      typeof import.meta !== 'undefined' && import.meta.env?.DEV === true ||
      typeof window !== 'undefined' && window.location.hostname === 'localhost'
    );
  } catch {
    return false;
  }
}

// Função para ser chamada quando o componente é desmontado
export function cleanupComponentMemory(componentName: string): void {
  try {
    // Limpar qualquer dados específicos do componente
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes(componentName.toLowerCase())) {
        try {
          localStorage.removeItem(key);
        } catch {
          // Ignorar erros
        }
      }
    });
  } catch (error) {
    // Ignorar erros de limpeza
  }
}