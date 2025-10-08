import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertTriangle, CheckCircle, Mail, Info } from 'lucide-react';
import { emailService } from '../lib/emailService';

interface EmailTestModeHandlerProps {
  onClose?: () => void;
}

export function EmailTestModeHandler({ onClose }: EmailTestModeHandlerProps) {
  const [testModeInfo, setTestModeInfo] = useState<{
    testMode: boolean;
    authorizedEmail: string;
  }>({ testMode: false, authorizedEmail: '' });

  useEffect(() => {
    // Verificar se está em modo de teste
    const info = emailService.isInTestMode();
    setTestModeInfo(info);
  }, []);

  if (!testModeInfo.testMode) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-orange-900">Modo de Teste Detectado</CardTitle>
            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
              Resend Test Mode
            </Badge>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
        <CardDescription className="text-orange-700">
          O sistema está configurado em modo de teste do Resend
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>O que isso significa?</strong>
            <br />
            Sua API Key do Resend está funcionando corretamente, mas está limitada ao modo de teste.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">✅ Sistema Funcionando</p>
              <p className="text-sm text-gray-600">
                A API Key está configurada e válida
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">📧 E-mails Redirecionados</p>
              <p className="text-sm text-gray-600">
                Todos os e-mails serão enviados para: 
                <br />
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {testModeInfo.authorizedEmail}
                </code>
              </p>
            </div>
          </div>
        </div>

        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Para usar em produção:</strong>
            <br />
            1. Acesse <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline">resend.com/domains</a>
            <br />
            2. Verifique um domínio próprio
            <br />
            3. Use um e-mail "from" do domínio verificado
          </AlertDescription>
        </Alert>

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>💡 Dica:</strong> Por enquanto, o sistema continuará funcionando normalmente. 
            Todos os alertas serão enviados para o e-mail cadastrado na sua conta Resend.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}