/**
 * Utilitários de debug para o sistema de heartbeat
 */

import { isDevelopment } from './environment';
import { getHeartbeatConfig, shouldEnableHeartbeat } from './heartbeatConfig';

export function debugHeartbeatState() {
  const config = getHeartbeatConfig();
  const shouldEnable = shouldEnableHeartbeat();
  const dev = isDevelopment();
  
  const debugInfo = {
    environment: {
      isDevelopment: dev,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
      hasLocalStorage: typeof localStorage !== 'undefined'
    },
    
    configuration: {
      enabled: config.enabled,
      shouldEnable,
      debugMode: config.debugMode,
      checkInterval: config.checkInterval,
      beatInterval: config.beatInterval,
      freezeThreshold: config.freezeThreshold,
      maxFreezeDetections: config.maxFreezeDetections
    },
    
    localStorage: {},
    
    currentState: {
      heartbeatActive: false,
      timeSinceLastBeat: 0,
      errorCount: 0,
      freezeCount: 0
    }
  };
  
  // Verificar localStorage
  if (typeof localStorage !== 'undefined') {
    try {
      debugInfo.localStorage = {
        enabled: localStorage.getItem('transpjardim-heartbeat-enabled'),
        hasURLParam: typeof window !== 'undefined' ? 
          new URLSearchParams(window.location.search).get('heartbeat') : null
      };
    } catch (error) {
      debugInfo.localStorage = { error: error.message };
    }
  }
  
  // Verificar estado atual via window API
  if (typeof window !== 'undefined' && (window as any).transpjardimHeartbeat) {
    try {
      const api = (window as any).transpjardimHeartbeat;
      const status = api.status();
      const stats = api.stats();
      
      if (status) {
        debugInfo.currentState = {
          heartbeatActive: status.active,
          timeSinceLastBeat: status.timeSince,
          lastBeat: new Date(status.lastBeat).toISOString(),
          errorCount: stats?.errorCount || 0,
          freezeCount: stats?.freezeDetectionCount || 0
        };
      }
    } catch (error) {
      debugInfo.currentState = { error: error.message };
    }
  }
  
  return debugInfo;
}

export function logHeartbeatDebug() {
  const debug = debugHeartbeatState();
  
  console.group('🔍 TranspJardim Heartbeat Debug');
  console.log('📊 Estado Completo:', debug);
  
  // Resumo da situação
  if (!debug.configuration.shouldEnable) {
    console.log('✅ CORRETO: Heartbeat desabilitado como esperado');
  } else {
    console.log('⚠️ ATENÇÃO: Heartbeat deveria estar habilitado');
  }
  
  if (debug.currentState.heartbeatActive) {
    console.log('🟢 Heartbeat ATIVO');
  } else {
    console.log('🔴 Heartbeat INATIVO');
  }
  
  console.groupEnd();
  
  return debug;
}

// Expor no window para debug
if (typeof window !== 'undefined') {
  (window as any).transpjardimDebug = {
    heartbeat: {
      debug: debugHeartbeatState,
      log: logHeartbeatDebug
    }
  };
}