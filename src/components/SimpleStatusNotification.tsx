import { useEffect, useState } from 'react';
import { useSystemStatus } from '../hooks/useSystemStatus';

export const SimpleStatusNotification = () => {
  const [hasNotified, setHasNotified] = useState(false);
  const { status } = useSystemStatus();

  useEffect(() => {
    // Verificar se já notificou nesta sessão
    const sessionKey = 'transpjardim-status-notified';
    if (sessionStorage.getItem(sessionKey) || hasNotified) {
      return;
    }

    // Aguardar o sistema estar inicializado
    if (!status.initialized || status.checking) {
      return;
    }

    // Criar notificação visual simples no topo da página
    const createNotification = (message: string, type: 'success' | 'info') => {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        font-weight: 500;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        ${type === 'success' 
          ? 'background: #d4edda; color: #155724; border-left: 4px solid #28a745;'
          : 'background: #d1ecf1; color: #0c5460; border-left: 4px solid #17a2b8;'
        }
      `;
      
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">${type === 'success' ? '🚀' : '📱'}</span>
          <span>${message}</span>
          <button onclick="this.parentElement.parentElement.remove()" 
                  style="margin-left: auto; background: none; border: none; font-size: 18px; cursor: pointer; opacity: 0.7;">
            ×
          </button>
        </div>
      `;

      document.body.appendChild(notification);

      // Animar entrada
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 100);

      // Auto-remover após 5 segundos
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 300);
        }
      }, 5000);
    };

    // Mostrar notificação baseada no status
    try {
      if (status.backendOnline) {
        createNotification('Sistema conectado! Backend online e funcionando.', 'success');
        console.log('✅ Status: Backend online');
      } else {
        createNotification('Modo demonstração ativo. Sistema funcionando com dados locais.', 'info');
        console.log('📱 Status: Modo demonstração');
      }

      setHasNotified(true);
      sessionStorage.setItem(sessionKey, 'true');
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
    }
  }, [status.initialized, status.checking, status.backendOnline, hasNotified]);

  return null; // Este componente não renderiza nada no React
};