import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { Mail, Send, CheckCircle, XCircle, Clock, User, AlertTriangle } from 'lucide-react';
import { emailService, getEmailLogs, sendTestEmail, validateEmailConfig } from '../lib/emailService';
import type { EmailLog } from '../lib/emailService';
import { EmailTestPanel } from './EmailTestPanel';
import { ResendApiKeyConfig } from './ResendApiKeyConfig';
import { QuickSetupGuide } from './QuickSetupGuide';
import { EmailStatusBanner } from './EmailStatusBanner';
import { useEmailStatus } from '../hooks/useEmailStatusOptimized';

interface EmailConfigPanelProps {
  onClose?: () => void;
}

export function EmailConfigPanel({ onClose }: EmailConfigPanelProps) {
  const [testEmail, setTestEmail] = useState('');
  const [isTestingSend, setIsTestingSend] = useState(false);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Usar hook de status de e-mail
  const { status, isConfigured: emailConfigValid, isChecking: isValidatingConfig, checkStatus: checkEmailConfig } = useEmailStatus();

  // Carregar logs ao inicializar
  useEffect(() => {
    loadEmailLogs();
  }, []);

  // Função removida - agora usa o hook useEmailStatus

  const loadEmailLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await getEmailLogs();
      setEmailLogs(logs);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      toast.error('Erro ao carregar histórico de e-mails');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Digite um e-mail para teste');
      return;
    }

    if (!emailService.isValidEmail(testEmail)) {
      toast.error('Digite um e-mail válido');
      return;
    }

    setIsTestingSend(true);
    try {
      const result = await sendTestEmail(testEmail);
      toast.success(result.message || 'E-mail de teste enviado com sucesso!');
      setTestEmail('');
      
      // Recarregar logs após envio
      setTimeout(() => {
        loadEmailLogs();
      }, 1000);
    } catch (error) {
      console.error('Erro no teste:', error);
      toast.error(`Erro ao enviar teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsTestingSend(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getAlertTypeColor = (alertType: string) => {
    switch (alertType) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Mail className="h-6 w-6 text-[var(--jardim-green)]" />
          <div>
            <h2 className="text-2xl font-bold text-[var(--jardim-green)]">
              Configuração de E-mail
            </h2>
            <p className="text-[var(--jardim-gray)]">
              Gerenciar sistema de alertas por e-mail
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        )}
      </div>

      {/* Banner de Status */}
      <EmailStatusBanner 
        status={
          emailConfigValid === null ? 'unknown' : 
          emailConfigValid ? 'valid' : 'invalid'
        }
        onConfigure={() => {
          // Mudar para aba de configuração
          const setupTab = document.querySelector('[value="setup"]') as HTMLElement;
          if (setupTab) setupTab.click();
        }}
      />

      <Tabs defaultValue={!emailConfigValid ? "setup" : "config"} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="setup">Configurar</TabsTrigger>
          <TabsTrigger value="config">Status</TabsTrigger>
          <TabsTrigger value="test">Teste</TabsTrigger>
          <TabsTrigger value="quick-test">Teste Rápido</TabsTrigger>
          <TabsTrigger value="logs">Histórico</TabsTrigger>
        </TabsList>

        {/* TAB: Configuração Rápida */}
        <TabsContent value="setup" className="space-y-4">
          <QuickSetupGuide onComplete={() => {
            // Mudar para aba de configuração
            const configTab = document.querySelector('[value="config"]') as HTMLElement;
            if (configTab) configTab.click();
          }} />
        </TabsContent>

        {/* TAB: Status */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Status da Configuração</span>
              </CardTitle>
              <CardDescription>
                Verificar se o serviço de e-mail está configurado corretamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {isValidatingConfig ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  ) : emailConfigValid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">
                      {isValidatingConfig ? 'Verificando...' : 
                       emailConfigValid ? 'Configuração OK' : 'Configuração com Problema'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isValidatingConfig ? 'Testando conexão com serviço de e-mail' :
                       emailConfigValid ? 'O sistema pode enviar e-mails' : 
                       'Verifique se RESEND_API_KEY está configurada'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={checkEmailConfig}
                  disabled={isValidatingConfig}
                >
                  Verificar Novamente
                </Button>
              </div>

              {/* Configuração de API Key */}
              <ResendApiKeyConfig 
                currentStatus={
                  status === 'checking' || status === 'unknown' ? 'unknown' : 
                  emailConfigValid ? 'valid' : 'invalid'
                }
                onConfigured={() => {
                  checkEmailConfig();
                  toast.success('API Key configurada! Recarregue a página para aplicar.');
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Provedor</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Resend</p>
                  <p className="text-xs text-muted-foreground">3.000 e-mails/mês gratuitos</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Remetente</span>
                  </div>
                  <p className="text-sm text-muted-foreground">TranspJardim</p>
                  <p className="text-xs text-muted-foreground">onboarding@resend.dev</p>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Teste */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Enviar E-mail de Teste</span>
              </CardTitle>
              <CardDescription>
                Teste o funcionamento do sistema enviando um e-mail de exemplo
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
                  disabled={isTestingSend}
                />
                <p className="text-xs text-muted-foreground">
                  Digite um e-mail válido para receber o teste
                </p>
              </div>

              <Button 
                onClick={handleTestEmail}
                disabled={!testEmail || isTestingSend || !emailConfigValid}
                className="w-full"
              >
                {isTestingSend ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Teste
                  </>
                )}
              </Button>

              {!emailConfigValid && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>E-mail não configurado</AlertTitle>
                  <AlertDescription>
                    Configure primeiro o serviço de e-mail na aba "Configuração"
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Teste Rápido */}
        <TabsContent value="quick-test" className="space-y-4">
          <div className="flex justify-center">
            <EmailTestPanel />
          </div>
        </TabsContent>

        {/* TAB: Histórico */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Histórico de E-mails</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {emailLogs.length} e-mails
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadEmailLogs}
                    disabled={isLoadingLogs}
                  >
                    {isLoadingLogs ? 'Carregando...' : 'Atualizar'}
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Histórico de todos os e-mails enviados pelo sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Carregando histórico...</span>
                </div>
              ) : emailLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum e-mail foi enviado ainda</p>
                  <p className="text-sm">Os e-mails enviados aparecerão aqui</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {emailLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getStatusIcon(log.status)}
                          <span className="font-medium">{log.subject}</span>
                          <Badge 
                            variant="secondary" 
                            className={getAlertTypeColor(log.alertType)}
                          >
                            {log.alertType === 'urgent' ? '🔴 Urgente' : '🟡 Aviso'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Para: {log.to}</p>
                          <p>Enviado: {new Date(log.sentAt).toLocaleString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          ID: {log.id.substring(0, 8)}...
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}