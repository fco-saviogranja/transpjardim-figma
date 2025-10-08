/**
 * Configuração do sistema de heartbeat
 */

import { isDevelopment } from './environment';

export interface HeartbeatConfig {
  enabled: boolean;
  checkInterval: number; // ms
  beatInterval: number; // ms
  freezeThreshold: number; // ms
  maxFreezeDetections: number;
  debugMode: boolean;
}

export const getHeartbeatConfig = (): HeartbeatConfig => {
  const dev = isDevelopment();
  
  return {
    // Desabilitar completamente em desenvolvimento por padrão
    enabled: false, // Sempre desabilitado até ser explicitamente habilitado
    
    // Intervalos muito relaxados para quando habilitado
    checkInterval: dev ? 300000 : 120000, // 5min dev, 2min prod
    beatInterval: dev ? 60000 : 30000,    // 1min dev, 30s prod
    freezeThreshold: dev ? 600000 : 300000, // 10min dev, 5min prod
    maxFreezeDetections: dev ? 20 : 10,   // Muito tolerante
    
    debugMode: dev
  };
};

// Verificar se o heartbeat deve estar ativo
export const shouldEnableHeartbeat = (): boolean => {
  const config = getHeartbeatConfig();
  
  // Permitir forçar através de query param ou localStorage
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const forceHeartbeat = urlParams.get('heartbeat');
    
    if (forceHeartbeat === 'true' || forceHeartbeat === '1') {
      console.log('🔧 Heartbeat forçado via URL');
      return true;
    }
    
    if (forceHeartbeat === 'false' || forceHeartbeat === '0') {
      console.log('🔧 Heartbeat desabilitado via URL');
      return false;
    }
    
    // Verificar localStorage
    const localSetting = localStorage.getItem('transpjardim-heartbeat-enabled');
    if (localSetting === 'true') {
      console.log('🔧 Heartbeat habilitado via localStorage');
      return true;
    }
    if (localSetting === 'false') {
      console.log('🔧 Heartbeat desabilitado via localStorage');
      return false;
    }
  }
  
  return config.enabled;
};

// Função para toggle do heartbeat via console
export const toggleHeartbeat = () => {
  if (typeof window !== 'undefined') {
    const current = shouldEnableHeartbeat();
    const newValue = !current;
    localStorage.setItem('transpjardim-heartbeat-enabled', newValue.toString());
    console.log(`🔧 Heartbeat ${newValue ? 'habilitado' : 'desabilitado'}. Recarregue a página.`);
    return newValue;
  }
  return false;
};