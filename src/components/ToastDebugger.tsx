import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export const ToastDebugger = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Interceptar console.error para capturar possíveis fontes de toast vazios
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      // Verificar se é um erro relacionado a toast
      const errorStr = args.join(' ');
      if (errorStr.includes('toast') || errorStr.includes('Toast')) {
        console.log('🚨 TOAST DEBUG - Console Error:', args);
      }
      originalError(...args);
    };

    console.warn = (...args: any[]) => {
      // Verificar se é um warning relacionado a toast
      const warnStr = args.join(' ');
      if (warnStr.includes('toast') || warnStr.includes('Toast')) {
        console.log('⚠️ TOAST DEBUG - Console Warn:', args);
      }
      originalWarn(...args);
    };

    // Interceptar chamadas de fetch para debug
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0];
      if (typeof url === 'string' && url.includes('supabase.co')) {
        console.log('🌐 FETCH DEBUG:', url);
      }
      
      try {
        const response = await originalFetch(...args);
        if (typeof url === 'string' && url.includes('supabase.co')) {
          console.log(`📡 FETCH RESPONSE (${response.status}):`, url);
        }
        return response;
      } catch (error) {
        if (typeof url === 'string' && url.includes('supabase.co')) {
          console.log('💥 FETCH ERROR:', url, error);
        }
        throw error;
      }
    };

    // Cleanup ao desmontar
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.fetch = originalFetch;
    };
  }, []);

  // Só renderizar para admins e apenas em desenvolvimento
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-yellow-100 border border-yellow-300 rounded p-2 text-xs">
      <div className="font-mono">🐛 Toast Debugger Ativo</div>
      <div className="text-gray-600">Usuário: {user.username}</div>
    </div>
  );
};