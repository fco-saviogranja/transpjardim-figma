import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ExternalLink, CheckCircle, Globe, ArrowRight } from 'lucide-react';

interface DomainConfigHelpProps {
  showSuccess?: boolean;
  onDismiss?: () => void;
}

export function DomainConfigHelp({ showSuccess = false, onDismiss }: DomainConfigHelpProps) {
  if (showSuccess) {
    return (
      <Alert className="border-green-200 bg-green-50 mt-4">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">
          ✅ API Key Configurada Corretamente!
        </AlertTitle>
        <AlertDescription className="text-green-700 space-y-3">
          <p>
            Sua API Key do Resend está válida e funcionando. O sistema está pronto para enviar alertas automáticos!
          </p>
          
          <div className="p-3 bg-white border border-green-200 rounded">
            <p className="font-medium text-green-900 mb-2">
              📧 Configuração Atual
            </p>
            <div className="text-sm space-y-1">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Remetente
                </Badge>
                <code className="bg-green-100 px-2 py-1 rounded text-xs">
                  TranspJardim &lt;onboarding@resend.dev&gt;
                </code>
              </div>
              <p className="text-green-700">
                ✅ Este é um domínio padrão do Resend que funciona imediatamente
              </p>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="font-medium text-blue-900 mb-2">
              🚀 Opcional: Domínio Personalizado
            </p>
            <p className="text-sm text-blue-800 mb-3">
              Para usar seu próprio domínio (ex: <code>noreply@jardim.ce.gov.br</code>), 
              você precisa verificá-lo no Resend:
            </p>
            <ol className="list-decimal list-inside text-sm space-y-1 text-blue-800">
              <li>Acesse o <strong>Resend Dashboard</strong></li>
              <li>Vá em <strong>"Domains"</strong></li>
              <li>Clique em <strong>"Add Domain"</strong></li>
              <li>Digite seu domínio e siga as instruções DNS</li>
              <li>Aguarde a verificação (pode levar até 24h)</li>
            </ol>
          </div>

          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => window.open('https://resend.com/domains', '_blank')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Globe className="h-4 w-4 mr-2" />
              Configurar Domínio
            </Button>
            
            {onDismiss && (
              <Button
                size="sm"
                variant="outline"
                onClick={onDismiss}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                Entendi
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-blue-200 bg-blue-50 mt-4">
      <Globe className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800">
        📧 Configuração de Domínio
      </AlertTitle>
      <AlertDescription className="text-blue-700 space-y-3">
        <p>
          O TranspJardim está configurado para usar <code>onboarding@resend.dev</code> como remetente. 
          Este é um domínio padrão que funciona imediatamente com novas contas do Resend.
        </p>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Configuração Atual (Funciona)</span>
          </div>
          <code className="block bg-white p-2 rounded border text-sm">
            TranspJardim &lt;onboarding@resend.dev&gt;
          </code>
        </div>

        <div className="p-3 bg-white border border-blue-200 rounded">
          <p className="font-medium text-blue-900 mb-2">
            💡 Para Produção: Domínio Personalizado
          </p>
          <p className="text-sm text-blue-800 mb-2">
            Para usar um domínio oficial da prefeitura:
          </p>
          <div className="flex items-center space-x-2 text-sm">
            <span>1. Configure no Resend</span>
            <ArrowRight className="h-3 w-3" />
            <span>2. Atualize o código</span>
            <ArrowRight className="h-3 w-3" />
            <span>3. Redeploy</span>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => window.open('https://resend.com/domains', '_blank')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Ver Guia de Domínios
        </Button>
      </AlertDescription>
    </Alert>
  );
}