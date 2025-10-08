import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { Mail, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import { sendTestEmail } from '../lib/emailService';

interface TestResult {
  success: boolean;
  emailId?: string;
  message?: string;
  error?: string;
  testMode?: boolean;
  authorizedEmail?: string;
  originalEmail?: string;
}

export function SimpleEmailTest() {
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);

  const handleSendTest = async () => {
    setIsSending(true);
    setLastResult(null);

    try {
      console.log('🧪 [SimpleEmailTest] Enviando teste de email...');
      
      const result = await sendTestEmail('2421541@faculdadececape.edu.br');
      
      const testResult: TestResult = {
        success: true,
        emailId: result.emailId,
        message: result.message || 'Email enviado com sucesso!',
        testMode: result.testMode,
        authorizedEmail: result.authorizedEmail,
        originalEmail: '2421541@faculdadececape.edu.br'
      };
      
      setLastResult(testResult);
      toast.success('✅ Email de teste enviado com sucesso!');
      
      console.log('✅ [SimpleEmailTest] Teste concluído:', result);
      
    } catch (error) {
      console.error('❌ [SimpleEmailTest] Erro no teste:', error);
      
      const testResult: TestResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        originalEmail: '2421541@faculdadececape.edu.br'
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
          <span>Teste de Email</span>
        </CardTitle>
        <CardDescription>
          Verificar funcionamento do sistema de email
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Email de destino: <code className="bg-gray-100 px-1 rounded">2421541@faculdadececape.edu.br</code>
          </p>
        </div>

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
              Enviar Teste
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
                    <p className="text-green-800 font-medium">✅ Email enviado!</p>
                    
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
                    
                    {lastResult.testMode && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <p className="text-blue-800">
                          <strong>🧪 Modo de Teste Ativo</strong>
                        </p>
                        <p className="text-blue-700 text-xs">
                          Sistema funcionando corretamente
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-red-800 font-medium">❌ Falha no envio</p>
                    <p className="text-sm text-red-700">{lastResult.error}</p>
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