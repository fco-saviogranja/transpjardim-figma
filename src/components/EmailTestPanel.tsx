import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { Mail, Send, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { emailService, sendTestEmail } from '../lib/emailService';
import { useEmailDebouncer } from './EmailDebouncer';
import { TestModeEmailHelper } from './TestModeEmailHelper';
import { EmailRateLimitHelper } from './EmailRateLimitHelper';

interface EmailTestResult {
  success: boolean;
  emailId?: string;
  message?: string;
  error?: string;
  timestamp: string;
  testMode?: boolean;
  authorizedEmail?: string;
  note?: string;
}

export function EmailTestPanel() {
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [lastResult, setLastResult] = useState<EmailTestResult | null>(null);
  const { state: debouncerState, executeWithDebounce } = useEmailDebouncer();

  const handleQuickTest = async () => {
    if (!testEmail) {
      toast.error('Digite um e-mail para teste');
      return;
    }

    if (!emailService.isValidEmail(testEmail)) {
      toast.error('Digite um e-mail válido');
      return;
    }

    setIsTesting(true);
    setLastResult(null);

    await executeWithDebounce(
      async () => {
        console.log('🧪 [EmailTestPanel] Iniciando teste rápido de e-mail...');
        return await sendTestEmail(testEmail);
      },
      (result) => {
        // Sucesso
        const testResult: EmailTestResult = {
          success: true,
          emailId: result.emailId,
          message: result.message,
          testMode: result.testMode,
          authorizedEmail: result.authorizedEmail,
          note: result.note,
          timestamp: new Date().toISOString()
        };
        
        setLastResult(testResult);
        
        if (result.testMode) {
          toast.success(`✅ API Key configurada corretamente!`);
          toast.info(`📧 Modo de teste: E-mails enviados para ${result.authorizedEmail}`);
        } else {
          toast.success(`✅ E-mail enviado para ${testEmail}!`);
        }
        
        console.log('✅ [EmailTestPanel] Teste concluído com sucesso:', result);
      },
      (error) => {
        // Erro (apenas para erros que não são de rate limit/debounce)
        if (!error.message.includes('rate limit') && !error.message.includes('Aguarde')) {
          console.error('❌ [EmailTestPanel] Erro no teste:', error);
          
          const testResult: EmailTestResult = {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          };
          
          setLastResult(testResult);
          toast.error(`❌ Falha no teste: ${testResult.error}`);
        }
      }
    );
    
    setIsTesting(false);
  };

  const handleTestAlert = async () => {
    setIsTesting(true);
    
    try {
      console.log('🚨 [EmailTestPanel] Testando alerta de exemplo...');
      
      const mockEmailData = {
        to: testEmail,
        subject: emailService.generateEmailSubject('urgent', 'Teste de Critério'),
        alertType: 'urgent' as const,
        criterio: {
          id: 'test-001',
          nome: 'Critério de Teste - Sistema de E-mail',
          secretaria: 'Controladoria Municipal'
        },
        usuario: {
          id: 'test-user',
          name: 'Teste TranspJardim'
        },
        dueDate: new Date().toISOString()
      };
      
      const result = await emailService.sendAlert(mockEmailData);
      
      const testResult: EmailTestResult = {
        success: true,
        emailId: result.emailId,
        message: 'Alerta de teste enviado com sucesso',
        timestamp: new Date().toISOString()
      };
      
      setLastResult(testResult);
      toast.success(`🚨 Alerta de teste enviado para ${testEmail}!`);
      
      console.log('✅ [EmailTestPanel] Alerta de teste enviado:', result);
      
    } catch (error) {
      console.error('❌ [EmailTestPanel] Erro no teste de alerta:', error);
      
      const testResult: EmailTestResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      };
      
      setLastResult(testResult);
      toast.error(`❌ Falha no teste de alerta: ${testResult.error}`);
      
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    if (success) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <span>Teste Rápido de E-mail</span>
        </CardTitle>
        <CardDescription>
          Teste o sistema de e-mail para verificar se está funcionando corretamente
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">E-mail de Teste</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="seu-email@exemplo.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            disabled={isTesting}
          />
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={handleQuickTest}
            disabled={!testEmail || isTesting}
            className="flex-1"
          >
            {isTesting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Teste Simples
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleTestAlert}
            disabled={!testEmail || isTesting}
            variant="outline"
            className="flex-1"
          >
            {isTesting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Teste Alerta
              </>
            )}
          </Button>
        </div>

        {lastResult && (
          <Alert className={lastResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center space-x-2">
              {getStatusIcon(lastResult.success)}
              <AlertTitle>
                {lastResult.success ? 'Teste Bem-sucedido' : 'Teste Falhou'}
              </AlertTitle>
            </div>
            <AlertDescription className="mt-2">
              {lastResult.success ? (
                <div className="space-y-1">
                  <p>{lastResult.message}</p>
                  {lastResult.testMode && lastResult.authorizedEmail && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                      <p className="text-blue-800">
                        <strong>🧪 Modo de Teste Ativo:</strong> E-mails só podem ser enviados para: {lastResult.authorizedEmail}
                      </p>
                      {lastResult.note && (
                        <p className="text-blue-700 text-xs mt-1">{lastResult.note}</p>
                      )}
                    </div>
                  )}
                  {lastResult.emailId && (
                    <p className="text-sm">
                      <Badge variant="outline">ID: {lastResult.emailId}</Badge>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enviado em: {new Date(lastResult.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-red-700">Erro: {lastResult.error}</p>
                  <p className="text-xs text-muted-foreground">
                    Falhou em: {new Date(lastResult.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground border-t pt-3">
          <p><strong>Teste Simples:</strong> Envia um e-mail básico de verificação</p>
          <p><strong>Teste Alerta:</strong> Envia um e-mail formatado como alerta do sistema</p>
          <p><strong>Nota:</strong> Verifique sua caixa de entrada e pasta de spam</p>
        </div>
        
        {/* Mostrar ajuda específica se em modo de teste */}
        {lastResult && lastResult.testMode && lastResult.authorizedEmail && (
          <TestModeEmailHelper 
            authorizedEmail={lastResult.authorizedEmail}
            onUseAuthorizedEmail={(email) => setTestEmail(email)}
          />
        )}
        
        {/* Mostrar ajuda para rate limit */}
        {lastResult && !lastResult.success && (
          <EmailRateLimitHelper error={lastResult.error} />
        )}
        
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 text-sm">
            <strong>Modo de Teste Ativo:</strong> Contas novas do Resend só podem enviar e-mails para o próprio e-mail de cadastro. 
            Para enviar para outros destinatários, é necessário verificar um domínio.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}