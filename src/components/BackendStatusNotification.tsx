import { useEffect, useState, useRef } from 'react';
import { toast } from '../utils/toast';
import { useSystemStatus } from '../hooks/useSystemStatus';

export const BackendStatusNotification = () => {
  const [hasShownNotification, setHasShownNotification] = useState(false);
  const { status } = useSystemStatus();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Limpar timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Verificar se já foi mostrado nesta sessão
    const sessionKey = 'transpjardim-backend-notification-session';
    
    if (sessionStorage.getItem(sessionKey)) {
      setHasShownNotification(true);
      return;
    }

    // Aguardar o sistema ser inicializado
    if (!status.initialized || status.checking) {
      console.log('⏳ Aguardando inicialização do sistema...');
      return;
    }

    // Aguardar um pouco antes de mostrar a notificação para evitar conflitos
    if (!hasShownNotification) {
      timeoutRef.current = setTimeout(() => {
        try {
          if (status.backendOnline) {
            console.log('✅ Backend online - mostrando notificação de sucesso');
            toast.success('🚀 Sistema conectado!', {
              duration: 3000,
              description: 'Backend online e funcionando normalmente.'
            });
          } else {
            console.log('📱 Backend offline - mostrando notificação de modo demo');
            // Verificar se temos informação sobre o erro
            const description = status.error && status.error.trim() 
              ? `Backend indisponível (${status.error}). Sistema funcionando com dados locais.`
              : 'Sistema funcionando perfeitamente com dados locais!';
              
            toast.info('📱 Modo demonstração ativo', {
              duration: 4000,
              description
            });
          }
          
          setHasShownNotification(true);
          sessionStorage.setItem(sessionKey, 'true');
        } catch (error) {
          console.error('💥 Erro ao mostrar notificação:', error);
          // Fallback: mostrar notificação básica
          try {
            toast.info('Sistema carregado', {
              duration: 2000,
              description: 'TranspJardim está funcionando normalmente.'
            });
          } catch (fallbackError) {
            console.error('💥 Erro no fallback de notificação:', fallbackError);
          }
        }
      }, 2000); // 2 segundos de delay
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [status.initialized, status.checking, status.backendOnline, hasShownNotification]);

  return null; // Este componente não renderiza nada
};