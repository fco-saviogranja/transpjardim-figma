import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertCircle, Loader2, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { toast } from '../utils/toast';
import { useSupabase } from '../hooks/useSupabase';

interface ConnectionStatus {
  status: 'unknown' | 'testing' | 'connected' | 'failed';
  message?: string;
  details?: string;
}

export const ConnectionTester = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ status: 'unknown' });
  const supabase = useSupabase();

  const testConnection = async () => {
    setConnectionStatus({ status: 'testing' });
    
    try {
      console.log('🔍 Testando conexão com o backend...');
      const response = await supabase.healthCheck();
      
      if (response.success && response.data) {
        console.log('✅ Conexão bem-sucedida:', response.data);
        
        // Detalhes melhorados baseados na resposta
        let details = `Servidor: ${response.data.service || 'TranspJardim API'}`;
        
        if (response.data.kvStore) {
          const kv = response.data.kvStore;
          details += `\nKV Store: ${kv.available ? 'Disponível' : 'Indisponível'}`;
          details += `\nFunções: ${kv.functions?.length || 0} disponíveis`;
          
          if (kv.getByPrefix !== 'function') {
            details += '\n⚠️ Problema: getByPrefix não é função';
          }
        }
        
        setConnectionStatus({
          status: 'connected',
          message: 'Conexão estabelecida com sucesso!',
          details
        });
        toast.success('Conexão estabelecida com sucesso!');
      } else {
        // Analisar o tipo de erro para dar feedback mais específico
        let errorMsg = 'Servidor não disponível';
        let specificDetails = '';
        
        if (response.error) {
          const error = response.error.trim();
          if (error.includes('fetch')) {
            errorMsg = 'Não foi possível conectar ao servidor';
            specificDetails = 'Função edge pode estar inativa';
          } else if (error.includes('timeout') || error.includes('Timeout')) {
            errorMsg = 'Timeout na conexão';
            specificDetails = 'Servidor demorou para responder';
          } else if (error.includes('NetworkError')) {
            errorMsg = 'Erro de rede';
            specificDetails = 'Verifique sua conexão com a internet';
          } else if (error) {
            errorMsg = error;
            specificDetails = 'Erro retornado pelo servidor';
          }
        }
        
        console.error('❌ Falha na conexão:', { errorMsg, originalError: response.error });
        
        const fullDetails = specificDetails ? `${errorMsg}\n${specificDetails}` : errorMsg;
        
        setConnectionStatus({
          status: 'failed',
          message: 'Falha na conexão',
          details: fullDetails
        });
        
        // Toast usando o sistema melhorado
        toast.networkError(response, 'Teste de conexão');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('💥 Erro de conexão:', error);
      setConnectionStatus({
        status: 'failed',
        message: 'Erro de rede',
        details: `${errorMessage}\n\nVerifique:\n• Função edge ativa\n• Variáveis ambiente\n• KV store configurado`
      });
      
      // Toast usando o sistema melhorado
      toast.networkError(error, 'Teste de conexão');
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'testing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case 'connected':
        return <Wifi className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <WifiOff className="h-5 w-5 text-red-600" />;
      default:
        return <RefreshCw className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return 'border-green-200 bg-green-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      case 'testing':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon()}
          <span>Teste de Conectividade</span>
        </CardTitle>
        <CardDescription>
          Verifique se o servidor backend está disponível
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status da Conexão */}
        {connectionStatus.status !== 'unknown' && (
          <Alert className={getStatusColor()}>
            <div className="flex items-start space-x-2">
              {connectionStatus.status === 'connected' ? (
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              ) : connectionStatus.status === 'failed' ? (
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              ) : (
                <Loader2 className="h-4 w-4 text-blue-600 mt-0.5 animate-spin" />
              )}
              <div className="flex-1">
                <AlertDescription className={
                  connectionStatus.status === 'connected' ? 'text-green-800' :
                  connectionStatus.status === 'failed' ? 'text-red-800' :
                  'text-blue-800'
                }>
                  <div className="font-medium mb-1">{connectionStatus.message}</div>
                  {connectionStatus.details && (
                    <div className="text-sm opacity-90">{connectionStatus.details}</div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Botão de Teste */}
        <Button
          onClick={testConnection}
          disabled={connectionStatus.status === 'testing'}
          className="w-full"
          variant={connectionStatus.status === 'connected' ? 'outline' : 'default'}
        >
          {connectionStatus.status === 'testing' ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testando...
            </>
          ) : connectionStatus.status === 'connected' ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Testar Novamente
            </>
          ) : (
            <>
              <Wifi className="h-4 w-4 mr-2" />
              Testar Conexão
            </>
          )}
        </Button>

        {/* Informações Adicionais */}
        <div className="bg-gray-50 p-3 rounded-lg text-sm">
          <div className="font-medium text-gray-900 mb-2">Informações de Debug:</div>
          <ul className="text-gray-600 space-y-1">
            <li>🔗 URL: https://dpnvtorphsxrncqtojvp.supabase.co/functions/v1/make-server-225e1157/health</li>
            <li>📡 Servidor Supabase: {connectionStatus.status === 'connected' ? 'Online' : 'Verificando...'}</li>
            <li>⚡ Função Edge: {connectionStatus.status === 'connected' ? 'Ativa' : 'Aguardando...'}</li>
          </ul>
        </div>

        {/* Troubleshooting */}
        {connectionStatus.status === 'failed' && (
          <div className="bg-amber-50 p-3 rounded-lg text-sm">
            <div className="font-medium text-amber-900 mb-2">Possíveis Soluções:</div>
            <ul className="text-amber-800 space-y-1">
              <li>• Aguarde alguns minutos (cold start)</li>
              <li>• Verifique se a função edge está ativa</li>
              <li>• Confirme as variáveis de ambiente</li>
              <li>• Use o modo demonstração enquanto isso</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};