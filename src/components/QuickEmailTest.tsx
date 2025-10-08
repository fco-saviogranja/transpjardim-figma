import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { Mail, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import { sendTestEmail } from '../lib/emailService';

interface QuickTestResult {
  success: boolean;
  emailId?: string;
  message?: string;
  error?: string;
  timestamp: string;
  testMode?: boolean;
  authorizedEmail?: string;
}

export function QuickEmailTest() {
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<QuickTestResult | null>(null);
  
  const testEmail = 'fco.saviogranja@gmail.com';

  const handleSendTest = async () => {
    setIsSending(true);
    setLastResult(null);

    try {
      console.log('🧪 [QuickEmailTest] Enviando e-mail de teste para:', testEmail);
      
      const result = await sendTestEmail(testEmail);
      
      const testResult: QuickTestResult = {
        success: true,
        emailId: result.emailId,
        message: result.message,
        testMode: result.testMode,
        authorizedEmail: result.authorizedEmail,
        timestamp: new Date().toISOString()
      };
      
      setLastResult(testResult);
      
      if (result.testMode) {
        toast.success(`✅ Sistema configurado corretamente!`);
        toast.info(`📧 Modo de teste: E-mails enviados para ${result.authorizedEmail}`);
      } else {
        toast.success(`✅ E-mail enviado para ${testEmail}!`);
      }
      
      console.log('✅ [QuickEmailTest] Teste concluído:', result);
      
    } catch (error) {
      console.error('❌ [QuickEmailTest] Erro no teste:', error);
      
      const testResult: QuickTestResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      };
      
      setLastResult(testResult);
      toast.error(`❌ Erro no envio: ${testResult.error}`);
      
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <span>Teste Rápido</span>
        </CardTitle>
        <CardDescription>
          Enviar email de teste para<br />
          <code className="text-sm bg-gray-100 px-1 rounded">{testEmail}</code>
          <br />
          <span className="text-xs text-blue-600 mt-1 block">
            ℹ️ Em modo de teste, pode ser redirecionado
          </span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button 
          onClick={handleSendTest}
          disabled={isSending}
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
            <div className="flex items-center space-x-2">
              {lastResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <div className="flex-1">
                {lastResult.success ? (
                  <div className="space-y-2">
                    <p className="text-green-800 font-medium">✅ Email enviado com sucesso!</p>
                    
                    {lastResult.message && (
                      <p className="text-sm text-green-700">{lastResult.message}</p>
                    )}
                    
                    {lastResult.testMode && lastResult.authorizedEmail && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <p className="text-blue-800">
                          <strong>🧪 Modo de Teste:</strong> Email enviado para {lastResult.authorizedEmail}
                        </p>
                        <p className="text-blue-700 text-xs mt-1">
                          Contas novas do Resend só podem enviar para o email de cadastro.
                        </p>
                      </div>
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
        </div>
      </CardContent>
    </Card>
  );
}