import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { Mail, Send, CheckCircle, XCircle, Clock, Settings } from 'lucide-react';
import { sendTestEmail } from '../lib/emailService';

interface FlexibleTestResult {
  success: boolean;
  emailId?: string;
  message?: string;
  error?: string;
  timestamp: string;
  testMode?: boolean;
  authorizedEmail?: string;
  originalEmail?: string;
  redirected?: boolean;
}

export function FlexibleEmailTest() {
  const [targetEmail, setTargetEmail] = useState('fco.saviogranja@gmail.com');
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<FlexibleTestResult | null>(null);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendTest = async () => {
    if (!targetEmail.trim()) {
      toast.error('Digite um e-mail válido');
      return;
    }

    if (!isValidEmail(targetEmail)) {
      toast.error('Formato de e-mail inválido');
      return;
    }

    setIsSending(true);
    setLastResult(null);

    try {
      console.log('🧪 [FlexibleEmailTest] Enviando e-mail de teste para:', targetEmail);
      
      const result = await sendTestEmail(targetEmail);
      
      const testResult: FlexibleTestResult = {
        success: true,
        emailId: result.emailId,
        message: result.message,
        testMode: result.testMode,
        authorizedEmail: result.authorizedEmail,
        originalEmail: targetEmail,
        redirected: result.testMode && result.authorizedEmail !== targetEmail,
        timestamp: new Date().toISOString()
      };
      
      setLastResult(testResult);
      
      if (result.testMode && result.authorizedEmail !== targetEmail) {
        toast.success(`✅ Email enviado com sucesso!`);
        toast.info(`🔄 Redirecionado para: ${result.authorizedEmail}`);
      } else if (result.testMode) {
        toast.success(`✅ Sistema configurado corretamente!`);
        toast.info(`📧 Modo de teste ativo`);
      } else {
        toast.success(`✅ E-mail enviado para ${targetEmail}!`);
      }
      
      console.log('✅ [FlexibleEmailTest] Teste concluído:', result);
      
    } catch (error) {
      console.error('❌ [FlexibleEmailTest] Erro no teste:', error);
      
      const testResult: FlexibleTestResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        originalEmail: targetEmail,
        timestamp: new Date().toISOString()
      };
      
      setLastResult(testResult);
      toast.error(`❌ Erro no envio: ${testResult.error}`);
      
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickEmail = (email: string) => {
    setTargetEmail(email);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <span>Teste de Email Configurável</span>
        </CardTitle>
        <CardDescription>
          Configure o destinatário e teste o sistema de email
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="target-email">Email de Destino</Label>
          <Input
            id="target-email"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={targetEmail}
            onChange={(e) => setTargetEmail(e.target.value)}
            disabled={isSending}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickEmail('fco.saviogranja@gmail.com')}
            disabled={isSending}
          >
            <Settings className="h-3 w-3 mr-1" />
            Francisco
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickEmail('controleinterno@transparenciajardim.app')}
            disabled={isSending}
          >
            <Settings className="h-3 w-3 mr-1" />
            Sistema
          </Button>
        </div>

        <Button 
          onClick={handleSendTest}
          disabled={!targetEmail || isSending || !isValidEmail(targetEmail)}
          className="w-full bg-[var(--jardim-green)] hover:bg-[var(--jardim-green-light)]"
        >
          {isSending ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Enviar Email de Teste
            </>
          )}
        </Button>

        {lastResult && (
          <Alert className={lastResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-start space-x-2">
              {lastResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                {lastResult.success ? (
                  <div className="space-y-2">
                    <p className="text-green-800 font-medium">✅ Email enviado com sucesso!</p>
                    
                    {lastResult.redirected && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <p className="text-blue-800">
                          <strong>🔄 Redirecionamento de Teste:</strong>
                        </p>
                        <p className="text-blue-700">
                          📧 <strong>Solicitado:</strong> {lastResult.originalEmail}
                        </p>
                        <p className="text-blue-700">
                          📮 <strong>Enviado para:</strong> {lastResult.authorizedEmail}
                        </p>
                        <p className="text-blue-600 text-xs mt-1">
                          ℹ️ Contas novas do Resend só podem enviar para o email de cadastro
                        </p>
                      </div>
                    )}
                    
                    {lastResult.testMode && !lastResult.redirected && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <p className="text-blue-800">
                          <strong>🧪 Modo de Teste Ativo</strong>
                        </p>
                        <p className="text-blue-700 text-xs">
                          Sistema funcionando corretamente
                        </p>
                      </div>
                    )}
                    
                    {lastResult.message && (
                      <p className="text-sm text-green-700">{lastResult.message}</p>
                    )}
                    
                    {lastResult.emailId && (
                      <p className="text-sm">
                        <Badge variant="outline" className="text-xs">
                          ID: {lastResult.emailId}
                        </Badge>
                      </p>
                    )}
                    
                    <p className="text-xs text-green-600">
                      ⏰ {new Date(lastResult.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-red-800 font-medium">❌ Falha no envio</p>
                    <p className="text-sm text-red-700">{lastResult.error}</p>
                    <p className="text-xs text-red-600">
                      ⏰ {new Date(lastResult.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Alert>
        )}

        <div className="text-xs text-gray-500 border-t pt-3">
          <p>📧 Sistema de notificações TranspJardim</p>
          <p>🏛️ Controladoria Municipal de Jardim/CE</p>
          <p className="text-blue-600 mt-1">
            💡 <strong>Dica:</strong> Em modo de teste, emails são redirecionados automaticamente
          </p>
        </div>
      </CardContent>
    </Card>
  );
}