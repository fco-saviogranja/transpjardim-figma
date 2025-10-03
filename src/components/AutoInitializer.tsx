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

      // Verificar se o servidor está online
      const healthCheck = await supabase.healthCheck();
      
      if (!healthCheck.success) {
        setStatus('error');
        setError('Servidor Supabase não está disponível. Usando sistema mock.');
        return;
      }

      // Tentar fazer login com admin para verificar se o sistema está inicializado
      const loginTest = await supabase.login('admin', 'admin');
      
      if (loginTest.success) {
        setStatus('initialized');
        toast.success('Sistema já está inicializado e funcionando!');
      } else {
        setStatus('needs-init');
      }
    } catch (error) {
      console.error('Erro ao verificar status do sistema:', error);
      setStatus('error');
      setError('Erro ao conectar com o servidor. Sistema funcionará em modo mock.');
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
          <Alert>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Verificando status do sistema...
            </AlertDescription>
          </Alert>
        );

      case 'needs-init':
        return (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-3">
              <div>
                <strong>Sistema precisa ser inicializado</strong>
                <p className="text-sm mt-1">
                  O servidor Supabase está online, mas os dados iniciais não foram carregados. 
                  Clique no botão abaixo para criar os usuários de teste.
                </p>
              </div>
              <Button
                onClick={initializeSystem}
                disabled={isInitializing}
                size="sm"
                className="flex items-center space-x-2"
              >
                {isInitializing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                <span>{isInitializing ? 'Inicializando...' : 'Inicializar Sistema'}</span>
              </Button>
            </AlertDescription>
          </Alert>
        );

      case 'initialized':
        return (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-green-800">Sistema inicializado</strong>
                  <p className="text-sm text-green-700 mt-1">
                    O servidor Supabase está funcionando e os usuários foram criados. 
                    Você pode fazer login normalmente.
                  </p>
                </div>
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        );

      case 'error':
        return (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-3">
              <div>
                <strong>Problema de conexão</strong>
                <p className="text-sm mt-1">{error}</p>
                <p className="text-sm mt-2">
                  <Info className="h-3 w-3 inline mr-1" />
                  Use as credenciais mock para continuar. O sistema funcionará localmente.
                </p>
              </div>
              <Button
                onClick={checkSystemStatus}
                size="sm"
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Tentar Novamente</span>
              </Button>
            </AlertDescription>
          </Alert>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-4">
      {renderContent()}
      
      {status === 'initialized' && (
        <div className="text-xs text-muted-foreground text-center">
          <p>✅ Sistema online • 👤 Usuários criados • 🔐 Autenticação ativa</p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-xs text-muted-foreground text-center">
          <p>🔧 Modo local ativo • 👤 Use credenciais mock abaixo</p>
        </div>
      )}
    </div>
  );
};