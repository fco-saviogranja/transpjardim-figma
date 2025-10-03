import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { 
  Bell, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Settings, 
  Clock,
  Bug 
} from 'lucide-react';
import { useAlertManager } from '../hooks/useAlertManager';
import { mockCriterios } from '../lib/mockData';
import { EmailRateLimitHelper } from './EmailRateLimitHelper';

interface AlertsDebugPanelProps {
  onClose?: () => void;
}

export function AlertsDebugPanel({ onClose }: AlertsDebugPanelProps) {
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<any>(null);

  const {
    rules,
    config,
    setConfig,
    lastCheck,
    alertHistory,
    alertsToday,
    manualCheck,
    testEmailAlert
  } = useAlertManager(mockCriterios);

  const handleTestEmailAlert = async () => {
    if (!testEmail) {
      toast.error('Digite um e-mail para teste');
      return;
    }

    setIsTesting(true);
    setLastTestResult(null);

    try {
      console.log('🧪 [AlertsDebugPanel] Testando e-mail de alerta...');
      
      const result = await testEmailAlert(testEmail);
      
      setLastTestResult({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
      
      toast.success(`✅ E-mail de alerta enviado para ${testEmail}!`);
      
    } catch (error) {
      console.error('❌ [AlertsDebugPanel] Erro no teste:', error);
      
      setLastTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      });
      
      toast.error(`❌ Falha no teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggleDebugMode = () => {
    setConfig(prev => ({
      ...prev,
      debugMode: !prev.debugMode
    }));
    
    toast.info(`Modo debug ${config.debugMode ? 'desativado' : 'ativado'}`);
  };

  const handleManualCheck = () => {
    console.log('🔍 [AlertsDebugPanel] Executando verificação manual...');
    manualCheck();
    toast.info('Verificação manual de alertas executada');
  };

  const getStatusIcon = (success: boolean) => {
    return success ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bug className="h-6 w-6 text-orange-600" />
          <div>
            <h2 className="text-2xl font-bold text-orange-600">
              Debug de Alertas
            </h2>
            <p className="text-muted-foreground">
              Ferramentas de teste e debug para o sistema de alertas
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        )}
      </div>

      <Tabs defaultValue="test" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="test">Teste E-mail</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        {/* TAB: Teste E-mail */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Teste de E-mail de Alerta</span>
              </CardTitle>
              <CardDescription>
                Enviar um e-mail de teste usando o sistema de alertas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">E-mail de Destino</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="seu-email@exemplo.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  disabled={isTesting}
                />
              </div>

              <Button 
                onClick={handleTestEmailAlert}
                disabled={!testEmail || isTesting}
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Enviando Teste...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar E-mail de Teste
                  </>
                )}
              </Button>

              {lastTestResult && (
                <Alert className={lastTestResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(lastTestResult.success)}
                    <AlertTitle>
                      {lastTestResult.success ? 'Teste Bem-sucedido' : 'Teste Falhou'}
                    </AlertTitle>
                  </div>
                  <AlertDescription className="mt-2">
                    {lastTestResult.success ? (
                      <div className="space-y-1">
                        <p>E-mail de alerta enviado com sucesso!</p>
                        {lastTestResult.data?.emailId && (
                          <p className="text-sm">
                            <Badge variant="outline">ID: {lastTestResult.data.emailId}</Badge>
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Enviado em: {new Date(lastTestResult.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-red-700">Erro: {lastTestResult.error}</p>
                        <p className="text-xs text-muted-foreground">
                          Falhou em: {new Date(lastTestResult.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Mostrar ajuda para rate limit */}
              {lastTestResult && !lastTestResult.success && (
                <EmailRateLimitHelper error={lastTestResult.error} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Configuração */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configurações de Debug</span>
              </CardTitle>
              <CardDescription>
                Ajustar configurações para debug e teste
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Modo Debug</p>
                  <p className="text-sm text-muted-foreground">
                    Ativar logs detalhados e notificações de debug
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={config.debugMode ? 'default' : 'outline'}>
                    {config.debugMode ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleDebugMode}
                  >
                    {config.debugMode ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Verificação Manual</p>
                  <p className="text-sm text-muted-foreground">
                    Executar verificação manual de alertas
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualCheck}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Verificar Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Status */}
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Status do Sistema</span>
              </CardTitle>
              <CardDescription>
                Informações sobre o estado atual do sistema de alertas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bell className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Sistema</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Status: {config.enabled ? '✅ Ativo' : '❌ Inativo'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Debug: {config.debugMode ? '🐛 Ativo' : '📝 Normal'}
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Última Verificação</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {lastCheck.toLocaleString('pt-BR')}
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">Alertas Hoje</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {alertsToday} / {config.maxAlertsPerDay} alertas
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Settings className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Regras Ativas</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {rules.filter(r => r.enabled).length} / {rules.length} regras
                  </p>
                </Card>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Histórico de Alertas</h4>
                {alertHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum alerta gerado ainda</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {alertHistory.slice(-5).reverse().map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                        <span className="truncate">{alert.mensagem}</span>
                        <Badge variant="outline" className="ml-2">
                          {alert.prioridade}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}