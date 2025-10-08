import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Database,
  Users,
  Info
} from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import { toast } from 'sonner@2.0.3';

export const AutoInitializer = () => {
  const [status, setStatus] = useState<'checking' | 'needs-init' | 'initialized' | 'error'>('checking');
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string>('');
  const supabase = useSupabase();

  const checkSystemStatus = async () => {
    try {
      setStatus('checking');
      setError('');

      // Verificar se estamos online primeiro
      if (!navigator.onLine) {
        console.log('📱 Sem conexão, usando modo mock');
        setStatus('error');
        setError('Sem conexão de internet. Sistema funcionando em modo local.');
        return;
      }

      // Verificar se o servidor está online (com timeout mais curto)
      const healthCheck = await supabase.healthCheck();
      
      if (!healthCheck.success) {
        console.log('⚠️ Servidor não disponível, usando modo mock');
        setStatus('error');
        setError('Servidor não está disponível. Sistema funcionando em modo local com dados mock.');
        return;
      }

      // Tentar fazer login com admin para verificar se o sistema está inicializado
      try {
        const loginTest = await supabase.login('admin', 'admin');
        
        if (loginTest.success) {
          setStatus('initialized');
          toast.success('🚀 Sistema Supabase online e funcionando!', { duration: 3000 });
        } else {
          setStatus('needs-init');
          toast.info('💡 Sistema online mas precisa ser inicializado');
        }
      } catch (loginError) {
        console.log('⚠️ Erro no teste de login, usando modo mock');
        setStatus('error');
        setError('Servidor online mas com problemas de autenticação. Usando modo local.');
      }
    } catch (error) {
      console.error('Erro ao verificar status do sistema:', error);
      setStatus('error');
      setError('Erro de conexão. Sistema funcionando em modo local com dados mock.');
    }
  };

  const initializeSystem = async () => {
    try {
      setIsInitializing(true);
      toast.info('Inicializando sistema...');

      const result = await supabase.initData();
      
      if (result.success) {
        setStatus('initialized');
        toast.success('Sistema inicializado com sucesso!');
        
        // Aguardar um momento e verificar se o login funciona
        setTimeout(async () => {
          const loginTest = await supabase.login('admin', 'admin');
          if (loginTest.success) {
            toast.success('Login teste bem-sucedido! Sistema pronto para uso.');
          } else {
            toast.warning('Sistema inicializado, mas login ainda não funciona. Tente usar as credenciais mock.');
          }
        }, 1000);
      } else {
        setStatus('error');
        setError(result.error || 'Erro na inicialização');
        toast.error('Falha na inicialização: ' + (result.error || 'Erro desconhecido'));
      }
    } catch (error) {
      setStatus('error');
      setError('Erro crítico na inicialização');
      console.error('Erro na inicialização:', error);
      toast.error('Erro crítico na inicialização do sistema');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="flex items-center justify-center py-2">
            <RefreshCw className="h-4 w-4 animate-spin text-[var(--jardim-green)] mr-2" />
            <span className="text-sm text-[var(--jardim-gray)]">Verificando sistema...</span>
          </div>
        );

      case 'needs-init':
        return (
          <Alert className="border-blue-200 bg-blue-50">
            <Database className="h-4 w-4 text-blue-600" />
            <AlertDescription className="space-y-3">
              <div>
                <strong className="text-blue-800">Configuração inicial necessária</strong>
                <p className="text-sm mt-1 text-blue-700">
                  Clique para configurar os dados iniciais do sistema.
                </p>
              </div>
              <Button
                onClick={initializeSystem}
                disabled={isInitializing}
                size="sm"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                {isInitializing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                <span>{isInitializing ? 'Configurando...' : 'Configurar'}</span>
              </Button>
            </AlertDescription>
          </Alert>
        );

      case 'initialized':
        return null; // Não exibir nada quando inicializado

      case 'error':
        return null; // Não exibir alertas de erro na tela de login

      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-4">
      {renderContent()}
      

    </div>
  );
};