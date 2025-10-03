// Sistema de configuração offline para quando o servidor não está disponível

interface OfflineEmailConfig {
  configured: boolean;
  apiKey?: string;
  configuredAt?: string;
  lastTest?: string;
  testResult?: 'success' | 'failed';
}

const STORAGE_KEY = 'transpjardim-offline-email-config';

export function saveOfflineEmailConfig(config: OfflineEmailConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    console.log('📱 [OfflineEmailConfig] Configuração salva offline');
  } catch (error) {
    console.error('❌ [OfflineEmailConfig] Erro ao salvar:', error);
  }
}

export function getOfflineEmailConfig(): OfflineEmailConfig | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const config = JSON.parse(stored) as OfflineEmailConfig;
      console.log('📱 [OfflineEmailConfig] Configuração carregada offline');
      return config;
    }
  } catch (error) {
    console.error('❌ [OfflineEmailConfig] Erro ao carregar:', error);
  }
  return null;
}

export function clearOfflineEmailConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('📱 [OfflineEmailConfig] Configuração removida');
  } catch (error) {
    console.error('❌ [OfflineEmailConfig] Erro ao remover:', error);
  }
}

export function isValidApiKeyFormat(apiKey: string): boolean {
  return apiKey.trim().startsWith('re_') && apiKey.trim().length >= 10;
}

export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 10) return apiKey;
  return apiKey.substring(0, 8) + '***' + apiKey.substring(apiKey.length - 4);
}