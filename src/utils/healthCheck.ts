// Utility para verificar saúde do sistema e prevenir timeouts

interface HealthStatus {
  localStorage: boolean;
  mockData: boolean;
  auth: boolean;
  performance: boolean;
}

export function checkSystemHealth(): HealthStatus {
  const status: HealthStatus = {
    localStorage: false,
    mockData: false,
    auth: false,
    performance: false
  };

  // Verificar localStorage
  try {
    const testKey = '__transpjardim_health_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    status.localStorage = true;
  } catch (error) {
    console.warn('localStorage não disponível:', error);
  }

  // Verificar dados mock
  try {
    const { mockCriterios, mockAlertas } = require('../lib/mockData');
    if (Array.isArray(mockCriterios) && Array.isArray(mockAlertas)) {
      status.mockData = true;
    }
  } catch (error) {
    console.warn('Erro ao carregar dados mock:', error);
  }

  // Verificar auth
  try {
    const { getStoredAuth } = require('../lib/auth');
    if (typeof getStoredAuth === 'function') {
      status.auth = true;
    }
  } catch (error) {
    console.warn('Erro no sistema de auth:', error);
  }

  // Verificar performance básica
  const startTime = performance.now();
  for (let i = 0; i < 10000; i++) {
    // Loop simples de teste
  }
  const endTime = performance.now();
  status.performance = (endTime - startTime) < 50; // Menos de 50ms é considerado bom

  return status;
}

export function logSystemHealth(): void {
  const health = checkSystemHealth();
  const healthScore = Object.values(health).filter(Boolean).length;
  
  console.log('=== TranspJardim System Health ===');
  console.log(`Score: ${healthScore}/4`);
  console.log('localStorage:', health.localStorage ? '✅' : '❌');
  console.log('mockData:', health.mockData ? '✅' : '❌');
  console.log('auth:', health.auth ? '✅' : '❌');
  console.log('performance:', health.performance ? '✅' : '❌');
  
  if (healthScore < 3) {
    console.warn('⚠️ Sistema com problemas de saúde detectados');
  } else {
    console.log('✅ Sistema saudável');
  }
}

// Detectar possíveis loops infinitos
const componentRenderCounts = new Map<string, { count: number; lastTime: number; firstTime: number }>();

export function detectInfiniteLoop(componentName: string): boolean {
  const now = Date.now();
  const existing = componentRenderCounts.get(componentName);
  
  if (!existing) {
    componentRenderCounts.set(componentName, { count: 1, lastTime: now, firstTime: now });
    return false;
  }
  
  const timeSinceFirst = now - existing.firstTime;
  const timeSinceLast = now - existing.lastTime;
  
  // Reset counter if enough time passed (mais de 1 segundo)
  if (timeSinceLast > 1000) {
    componentRenderCounts.set(componentName, { count: 1, lastTime: now, firstTime: now });
    return false;
  }
  
  existing.count++;
  existing.lastTime = now;
  
  // Critério mais tolerante: mais de 100 renders em menos de 2 segundos
  if (existing.count > 100 && timeSinceFirst < 2000) {
    console.error(`🚨 Loop infinito detectado em ${componentName}: ${existing.count} renders em ${timeSinceFirst}ms`);
    
    // Tentar recuperação automática
    try {
      // Limpar o contador para dar uma chance
      componentRenderCounts.delete(componentName);
      
      // Forçar cleanup de timers ativos
      const highestId = setTimeout(() => {}, 0);
      for (let i = 0; i < highestId; i++) {
        clearTimeout(i);
      }
      
      console.log('🔄 Tentativa de recuperação automática executada');
    } catch (error) {
      console.error('❌ Falha na recuperação automática:', error);
    }
    
    return true;
  }
  
  return false;
}

// Função otimizada para verificar memory leaks
export function checkMemoryUsage(): void {
  if ('memory' in performance) {
    const memInfo = (performance as any).memory;
    const used = Math.round(memInfo.usedJSHeapSize / 1048576); // MB
    const total = Math.round(memInfo.totalJSHeapSize / 1048576); // MB
    const limit = Math.round(memInfo.jsHeapSizeLimit / 1048576); // MB
    
    // Limite muito mais realista - apenas alertar se crítico
    if (used > 500) { // 500MB é crítico
      console.warn('⚠️ Alto uso de memória detectado:', {
        used: `${used}MB`,
        total: `${total}MB`,
        limit: `${limit}MB`,
        percentage: Math.round((used / limit) * 100) + '%'
      });
      
      // Sugerir garbage collection se disponível
      if ('gc' in window && typeof (window as any).gc === 'function') {
        try {
          (window as any).gc();
          console.log('🗑️ Garbage collection executado');
        } catch {
          // Ignorar se não funcionar
        }
      }
    }
  }
}