import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Mail, AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface EmailStatusBannerProps {
  status: 'unknown' | 'valid' | 'invalid';
  onConfigure?: () => void;
}

export function EmailStatusBanner({ status, onConfigure }: EmailStatusBannerProps) {
  if (status === 'valid') {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">
          ✅ Sistema de E-mail Configurado
        </AlertTitle>
        <AlertDescription className="text-green-700">
          O TranspJardim pode enviar alertas automáticos por e-mail. 
          O sistema está funcionando corretamente.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'invalid' || status === 'unknown') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800 flex items-center space-x-2">
          <span>🚨 Sistema de E-mail NÃO Configurado</span>
          <Badge variant="destructive">Ação Necessária</Badge>
        </AlertTitle>
        <AlertDescription className="text-red-700 space-y-3">
          <p>
            <strong>O sistema de alertas por e-mail não está funcionando.</strong> 
            Isso significa que os usuários não receberão notificações automáticas quando:
          </p>
          
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Critérios estiverem próximos do vencimento</li>
            <li>Metas estiverem abaixo do esperado</li>
            <li>Houver problemas críticos no sistema</li>
          </ul>

          <div className="bg-white p-4 rounded border border-red-200">
            <h4 className="font-medium text-red-900 mb-2">🔧 Solução:</h4>
            <p className="text-sm text-red-800 mb-3">
              Configure a API Key do Resend para ativar o envio de e-mails (100% gratuito):
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                className="bg-red-600 hover:bg-red-700"
                onClick={onConfigure}
              >
                <Mail className="h-4 w-4 mr-2" />
                Configurar Agora
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open('https://resend.com/signup', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Criar Conta Resend
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>💡 Importante:</strong> Sem esta configuração, o sistema funcionará normalmente, 
              mas os usuários precisarão verificar manualmente os critérios no painel.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}