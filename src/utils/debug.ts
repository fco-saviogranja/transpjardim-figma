// Utilitários de debug para desenvolvimento

export const debugUtils = {
  // Limpar todas as notificações armazenadas
  clearNotifications: () => {
    sessionStorage.removeItem('transpjardim-backend-notification-session');
    sessionStorage.removeItem('transpjardim-status-notified');
    localStorage.removeItem('transpjardim-backend-notification-shown');
    
    // Remover notificações visuais existentes
    const notifications = document.querySelectorAll('[style*="position: fixed"][style*="z-index: 10000"]');
    notifications.forEach(notification => notification.remove());
    
    console.log('🧹 Notificações limpas - recarregue a página para ver novamente');
  },

  // Forçar verificação de status
  forceStatusCheck: () => {
    // Disparar evento customizado que pode ser escutado pelos componentes
    window.dispatchEvent(new CustomEvent('transpjardim:force-status-check'));
    console.log('🔄 Verificação de status forçada');
  },

  // Mostrar informações de debug
  showDebugInfo: () => {
    const info = {
      localStorage: Object.keys(localStorage).filter(k => k.startsWith('transpjardim')),
      sessionStorage: Object.keys(sessionStorage).filter(k => k.startsWith('transpjardim')),
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
    
    console.table(info);
    return info;
  },

  // Simular erro de conexão (para teste)
  simulateConnectionError: () => {
    console.warn('🚨 Simulando erro de conexão para teste');
    window.dispatchEvent(new CustomEvent('transpjardim:simulate-error', {
      detail: { error: 'Erro simulado para teste' }
    }));
  }
};

// Expor globalmente em desenvolvimento
if (typeof window !== 'undefined') {
  (window as any).transpjardimDebug = debugUtils;
  console.log('🐛 Debug utils disponíveis em window.transpjardimDebug');
}