import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Zap,
  Shield,
  Activity
} from 'lucide-react';
import { useEmailDebouncer } from './EmailDebouncer';
import { getTestModeInfo } from '../lib/emailService';

export function EmailSystemStatus() {
  const { state: debouncerState, reset } = useEmailDebouncer();
  const [testModeInfo, setTestModeInfo] = useState<{
    testMode: boolean;
    authorizedEmail: string;
  }>({ testMode: false, authorizedEmail: '' });

  useEffect(() => {
    // Verificar modo de teste periodicamente
    const checkTestMode = () => {
      const info = getTestModeInfo();
      setTestModeInfo(info);
    };

    checkTestMode();
    const interval = setInterval(checkTestMode, 5000);
    return () => clearInterval(interval);
  }, []);

  const isInCooldown = Date.now() < debouncerState.cooldownUntil;
  const cooldownRemaining = Math.ceil((debouncerState.cooldownUntil - Date.now()) / 1000);

  const getStatusColor = () => {
    if (isInCooldown) return 'border-red-200 bg-red-50';
    if (debouncerState.isProcessing) return 'border-blue-200 bg-blue-50';
    if (testModeInfo.testMode) return 'border-orange-200 bg-orange-50';
    return 'border-green-200 bg-green-50';
  };

  const getStatusIcon = () => {
    if (isInCooldown) return <Shield className="h-5 w-5 text-red-600" />;
    if (debouncerState.isProcessing) return <Activity className="h-5 w-5 text-blue-600" />;
    if (testModeInfo.testMode) return <Zap className="h-5 w-5 text-orange-600" />;
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  const getStatusTitle = () => {
    if (isInCooldown) return 'Sistema em Cooldown';
    if (debouncerState.isProcessing) return 'Processando E-mail';
    if (testModeInfo.testMode) return 'Modo de Teste Ativo';
    return 'Sistema Operacional';
  };

  const getStatusDescription = () => {
    if (isInCooldown) return 'Rate limit atingido. Aguardando antes de próxima tentativa.';
    if (debouncerState.isProcessing) return 'Uma requisição de e-mail está sendo processada.';
    if (testModeInfo.testMode) return 'E-mails sendo redirecionados para conta autorizada.';
    return 'Sistema funcionando normalmente.';
  };

  return (
    <Card className={getStatusColor()}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">{getStatusTitle()}</CardTitle>
          </div>
          
          <div className="flex items-center space-x-2">
            {testModeInfo.testMode && (
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                Test Mode
              </Badge>
            )}
            
            {isInCooldown && (
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                Cooldown: {cooldownRemaining}s
              </Badge>
            )}
            
            {debouncerState.isProcessing && (
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                Enviando
              </Badge>
            )}
          </div>
        </div>
        
        <CardDescription>{getStatusDescription()}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informações do Rate Limiting */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {debouncerState.requestCount}
            </div>
            <div className="text-sm text-gray-500">Requisições</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {Math.max(0, Math.ceil((3000 - Date.now() + debouncerState.lastRequestTime) / 1000))}s
            </div>
            <div className="text-sm text-gray-500">Próxima permitida</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {debouncerState.isProcessing ? 'Sim' : 'Não'}
            </div>
            <div className="text-sm text-gray-500">Processando</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {isInCooldown ? cooldownRemaining : 0}s
            </div>
            <div className="text-sm text-gray-500">Cooldown</div>
          </div>
        </div>

        {/* Barra de progresso do cooldown */}
        {isInCooldown && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Cooldown Progress</span>
              <span>{cooldownRemaining}s restantes</span>
            </div>
            <Progress 
              value={((30 - cooldownRemaining) / 30) * 100} 
              className="h-2"
            />
          </div>
        )}

        {/* Informações do modo de teste */}
        {testModeInfo.testMode && (
          <Alert className="border-orange-200 bg-orange-50">
            <Mail className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Modo de Teste:</strong> Todos os e-mails são redirecionados para{' '}
              <code className="bg-orange-100 px-1 rounded text-sm">
                {testModeInfo.authorizedEmail}
              </code>
            </AlertDescription>
          </Alert>
        )}

        {/* Alertas específicos */}
        {isInCooldown && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Sistema em cooldown devido a muitas tentativas. 
              Aguarde {cooldownRemaining} segundos antes de tentar novamente.
            </AlertDescription>
          </Alert>
        )}

        {/* Botões de ação */}
        <div className="flex justify-end space-x-2">
          {(isInCooldown || debouncerState.requestCount > 0) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={reset}
              disabled={debouncerState.isProcessing}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Sistema
            </Button>
          )}
        </div>

        {/* Dicas */}
        <div className="text-xs text-gray-500 mt-4">
          <strong>💡 Dicas:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Limite: máximo 10 e-mails por minuto</li>
            <li>Intervalo: mínimo 3 segundos entre envios</li>
            <li>Cooldown: 30 segundos após muitas tentativas</li>
            {testModeInfo.testMode && <li>Modo teste: e-mails redirecionados automaticamente</li>}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}