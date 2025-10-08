import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Copy, CheckCircle, Mail, UserCheck } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useState } from 'react';

interface TestModeEmailHelperProps {
  authorizedEmail: string;
  onUseAuthorizedEmail?: (email: string) => void;
}

export function TestModeEmailHelper({ authorizedEmail, onUseAuthorizedEmail }: TestModeEmailHelperProps) {
  const [copied, setCopied] = useState(false);

  const copyAuthorizedEmail = () => {
    navigator.clipboard.writeText(authorizedEmail);
    setCopied(true);
    toast.success('E-mail autorizado copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  const useAuthorizedEmail = () => {
    if (onUseAuthorizedEmail) {
      onUseAuthorizedEmail(authorizedEmail);
      toast.success('E-mail autorizado aplicado no campo de teste!');
    }
  };

  return (
    <Alert className="border-blue-200 bg-blue-50 mt-4">
      <UserCheck className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800">
        💡 Use o E-mail Autorizado para Testar
      </AlertTitle>
      <AlertDescription className="text-blue-700 space-y-3">
        <p>
          Para testar o sistema de e-mail corretamente, use o e-mail autorizado da sua conta Resend:
        </p>

        <div className="p-3 bg-white border border-blue-200 rounded">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-blue-900 mb-1">E-mail Autorizado:</p>
              <div className="flex items-center space-x-2">
                <Input 
                  value={authorizedEmail} 
                  readOnly 
                  className="bg-blue-50 border-blue-300 text-blue-900"
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={copyAuthorizedEmail}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <h4 className="font-medium text-green-900 mb-2">✅ Funcionará:</h4>
            <p className="text-sm text-green-800">
              Enviar teste para <code className="bg-green-100 px-1 rounded">{authorizedEmail}</code>
            </p>
          </div>
          
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <h4 className="font-medium text-red-900 mb-2">❌ Falhará:</h4>
            <p className="text-sm text-red-800">
              Enviar para qualquer outro e-mail sem domínio verificado
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          {onUseAuthorizedEmail && (
            <Button 
              size="sm" 
              onClick={useAuthorizedEmail}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Mail className="h-4 w-4 mr-2" />
              Usar Este E-mail para Teste
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={copyAuthorizedEmail}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? 'Copiado!' : 'Copiar E-mail'}
          </Button>
        </div>

        <div className="text-xs text-blue-600 bg-white p-2 rounded border border-blue-200">
          <strong>💡 Dica:</strong> Este é o comportamento normal de contas Resend novas. 
          O sistema está funcionando perfeitamente - apenas com limitação de destinatário para segurança.
        </div>
      </AlertDescription>
    </Alert>
  );
}