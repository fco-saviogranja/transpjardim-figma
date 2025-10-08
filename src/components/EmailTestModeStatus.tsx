import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { Mail, Send, CheckCircle, XCircle, Clock, AlertTriangle, Info } from 'lucide-react';
import { sendTestEmail } from '../lib/emailService';

interface TestModeInfo {
  isTestMode: boolean;
  authorizedEmail: string;
  lastError?: string;
}

export function EmailTestModeStatus() {
  const [testModeInfo, setTestModeInfo] = useState<TestModeInfo | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<any>(null);

  // Detectar informações do modo de teste
  const detectTestMode = async () => {
    try {
      console.log('🔍 [EmailTestModeStatus] Detectando modo de teste...');
      
      // Tentar enviar para um email de teste para detectar o modo
      const result = await sendTestEmail('test-detection@example.com');
      
      if (result.testMode && result.authorizedEmail) {
        setTestModeInfo({
          isTestMode: true,
          authorizedEmail: result.authorizedEmail
        });
        console.log('✅ [EmailTestModeStatus] Modo de teste detectado:', result.authorizedEmail);
      } else {
        setTestModeInfo({
          isTestMode: false,
          authorizedEmail: ''
        });
        console.log('✅ [EmailTestModeStatus] Sistema em modo produção');
      }
    } catch (error) {
      console.error('❌ [EmailTestModeStatus] Erro na detecção:', error);
      
      // Tentar extrair informações do erro
      if (error instanceof Error && error.message.includes('You can only send testing emails')) {
        const emailMatch = error.message.match(/\(([^)]+)\)/);
        const authorizedEmail = emailMatch ? emailMatch[1] : '2421541@faculdadececape.edu.br';
        
        setTestModeInfo({
          isTestMode: true,
          authorizedEmail,
          lastError: error.message
        });
      } else {
        setTestModeInfo({
          isTestMode: false,
          authorizedEmail: '',
          lastError: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }
  };

  useEffect(() => {
    detectTestMode();
  }, []);

  const handleSendToAuthorized = async () => {
    if (!testModeInfo?.authorizedEmail) {
      toast.error('Email autorizado não detectado');
      return;
    }

    setIsTesting(true);
    setLastTestResult(null);

    try {
      console.log('📧 [EmailTestModeStatus] Enviando para email autorizado:', testModeInfo.authorizedEmail);
      
      const result = await sendTestEmail(testModeInfo.authorizedEmail);
      setLastTestResult(result);
      
      if (result.success) {
        toast.success(`✅ Email enviado para ${testModeInfo.authorizedEmail}!`);
      } else {
        toast.error(`❌ Erro: ${result.error}`);
      }
      
    } catch (error) {
      console.error('❌ [EmailTestModeStatus] Erro no envio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setLastTestResult({ success: false, error: errorMessage });
      toast.error(`❌ Erro: ${errorMessage}`);
      
    } finally {
      setIsTesting(false);
    }
  };

  if (!testModeInfo) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-muted-foreground">Detectando configuração...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <span>Status do Sistema de Email</span>
        </CardTitle>
        <CardDescription>
          Configuração atual do Resend
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status do Modo */}
        <Alert className={testModeInfo.isTestMode ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}>
          <div className="flex items-center space-x-2">
            {testModeInfo.isTestMode ? (
              <Info className="h-4 w-4 text-blue-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <AlertTitle>
              {testModeInfo.isTestMode ? '🧪 Modo de Teste Ativo' : '🚀 Modo de Produção'}
            </AlertTitle>
          </div>
          <AlertDescription className="mt-2">
            {testModeInfo.isTestMode ? (
              <div className="space-y-2">
                <p className="text-blue-800">
                  <strong>Email autorizado:</strong> <code className="bg-blue-100 px-1 rounded">{testModeInfo.authorizedEmail}</code>
                </p>
                <p className="text-blue-700 text-sm">
                  📝 Contas novas do Resend só podem enviar emails para o email de cadastro da conta.
                </p>
                <p className="text-blue-700 text-sm">
                  🔧 Para enviar para outros emails, verifique um domínio em resend.com/domains
                </p>
              </div>
            ) : (
              <p className="text-green-800">
                Sistema configurado para envio completo. Emails podem ser enviados para qualquer destinatário.
              </p>
            )}
          </AlertDescription>
        </Alert>

        {/* Teste Rápido */}
        {testModeInfo.isTestMode && (
          <div className="space-y-3">
            <Button 
              onClick={handleSendToAuthorized}
              disabled={isTesting}
              className="w-full bg-[var(--jardim-green)] hover:bg-[var(--jardim-green-light)]"
            >
              {isTesting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Teste para Email Autorizado
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Enviar teste para: <code className="bg-gray-100 px-1 rounded">{testModeInfo.authorizedEmail}</code>
            </p>
          </div>
        )}

        {/* Resultado do último teste */}
        {lastTestResult && (
          <Alert className={lastTestResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center space-x-2">
              {lastTestResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>
                {lastTestResult.success ? 'Teste Realizado' : 'Teste Falhou'}
              </AlertTitle>
            </div>
            <AlertDescription className="mt-2">
              {lastTestResult.success ? (
                <div className="space-y-1">
                  <p className="text-green-800">✅ Email enviado com sucesso!</p>
                  {lastTestResult.emailId && (
                    <p className="text-sm">
                      <Badge variant="outline" className="text-xs">
                        ID: {lastTestResult.emailId}
                      </Badge>
                    </p>
                  )}
                  {lastTestResult.message && (
                    <p className="text-sm text-green-700">{lastTestResult.message}</p>
                  )}
                </div>
              ) : (
                <p className="text-red-800">❌ {lastTestResult.error}</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Informações adicionais */}
        <div className="text-xs text-gray-500 border-t pt-3 space-y-1">
          <p>📧 <strong>Remetente:</strong> Controladoria Jardim &lt;onboarding@resend.dev&gt;</p>
          <p>🏛️ <strong>Sistema:</strong> TranspJardim - Controladoria Municipal de Jardim/CE</p>
          
          {testModeInfo.isTestMode && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
              <p className="text-xs">
                💡 <strong>Dica:</strong> Para usar um domínio personalizado como <code>@transparenciajardim.app</code>, 
                configure o domínio no painel do Resend em resend.com/domains
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}