import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Copy, ExternalLink, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ApiKeyErrorHelpProps {
  error?: string;
  onFixAttempt?: () => void;
}

export function ApiKeyErrorHelp({ error, onFixAttempt }: ApiKeyErrorHelpProps) {
  const isFormatError = error?.includes('formato inválido');
  const isTestError = error?.includes('teste');

  const copyValidExample = () => {
    navigator.clipboard.writeText('re_AbCdEfGh123456789012345678901234567890');
    toast.success('Exemplo de API Key válida copiado!');
  };

  if (!isFormatError && !isTestError) {
    return null;
  }

  return (
    <Alert className="border-red-200 bg-red-50 mt-4">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">
        🚨 Erro de API Key Detectado
      </AlertTitle>
      <AlertDescription className="text-red-700 space-y-3">
        {isTestError && (
          <div className="p-3 bg-white border border-red-200 rounded">
            <p className="font-medium text-red-900 mb-2">
              ❌ API Key "teste" não é válida!
            </p>
            <p className="text-sm">
              Você inseriu "teste" como API Key, mas isso não é uma chave válida do Resend.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <p className="font-medium">✅ Como obter uma API Key válida:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Acesse <strong>resend.com</strong> e crie uma conta gratuita</li>
            <li>Faça login no dashboard</li>
            <li>Vá em <strong>"API Keys"</strong> no menu lateral</li>
            <li>Clique em <strong>"Create API Key"</strong></li>
            <li>Nome: <code className="bg-red-100 px-1 rounded">TranspJardim</code></li>
            <li><strong>Copie a chave gerada</strong> (começa com "re_")</li>
          </ol>
        </div>

        <div className="p-3 bg-white border border-red-200 rounded">
          <p className="font-medium text-red-900 mb-2">📋 Formato Correto:</p>
          <div className="flex items-center space-x-2">
            <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
              re_AbCdEfGh123456789012345678901234567890
            </code>
            <Button size="sm" variant="outline" onClick={copyValidExample}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-red-600 mt-1">
            ⚠️ Este é apenas um exemplo. Use sua API Key real do Resend.
          </p>
        </div>

        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={() => window.open('https://resend.com/signup', '_blank')}
            className="bg-red-600 hover:bg-red-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Criar Conta Resend
          </Button>
          {onFixAttempt && (
            <Button
              size="sm"
              variant="outline"
              onClick={onFixAttempt}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Tentar Novamente
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}