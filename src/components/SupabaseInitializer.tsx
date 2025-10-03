import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, CheckCircle, Loader2, Database } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import { Alert, AlertDescription } from './ui/alert';

export const SupabaseInitializer = () => {
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error' | 'initializing'>('idle');
  const [message, setMessage] = useState('');
  const supabase = useSupabase();

  const checkConnection = async () => {
    setStatus('checking');
    setMessage('');

    try {
      const response = await supabase.healthCheck();
      
      if (response.success) {
        setStatus('success');
        setMessage('✅ Conexão com Supabase estabelecida com sucesso!');
      } else {
        setStatus('error');
        setMessage(`❌ Erro na conexão: ${response.error}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Erro na conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const initializeData = async () => {
    setStatus('initializing');
    setMessage('Inicializando dados do TranspJardim...');

    try {
      const response = await supabase.initData();
      
      if (response.success) {
        setStatus('success');
        setMessage('✅ Dados inicializados com sucesso! Usuários criados: admin/admin123, joao.silva/user123, maria.santos/user123');
      } else {
        setStatus('error');
        setMessage(`❌ Erro na inicialização: ${response.error}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Erro na inicialização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Auto-check na montagem do componente
  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
      case 'initializing':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Database className="h-5 w-5" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'checking':
      case 'initializing':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon()}
          <span>Supabase - TranspJardim</span>
        </CardTitle>
        <CardDescription>
          Configure e inicialize a conexão com o Supabase
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {message && (
          <Alert className={status === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <AlertDescription className={getStatusColor()}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col space-y-2">
          <Button 
            onClick={checkConnection}
            disabled={status === 'checking' || status === 'initializing'}
            variant="outline"
            className="w-full"
          >
            {status === 'checking' ? 'Verificando...' : 'Testar Conexão'}
          </Button>

          <Button 
            onClick={initializeData}
            disabled={status === 'checking' || status === 'initializing'}
            className="w-full"
          >
            {status === 'initializing' ? 'Inicializando...' : 'Inicializar Dados'}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p><strong>Credenciais de teste:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><code>admin</code> / <code>admin123</code> (Administrador)</li>
            <li><code>joao.silva</code> / <code>user123</code> (Educação)</li>
            <li><code>maria.santos</code> / <code>user123</code> (Saúde)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseInitializer;