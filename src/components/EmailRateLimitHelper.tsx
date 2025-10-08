import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface EmailRateLimitHelperProps {
  error?: string;
}

export function EmailRateLimitHelper({ error }: EmailRateLimitHelperProps) {
  const isRateLimitError = error?.includes('rate_limit_exceeded') || 
                          error?.includes('Too many requests') ||
                          error?.includes('Limite de e-mails do Resend atingido');

  if (!isRateLimitError) {
    return null;
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50 mt-4">
      <Clock className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">
        🕐 Rate Limit do Resend Atingido
      </AlertTitle>
      <AlertDescription className="text-yellow-700 space-y-3">
        <p>
          O Resend limita a <strong>2 requisições por segundo</strong> para evitar spam. 
          Você fez muitos testes rapidamente e atingiu esse limite.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-white border border-yellow-200 rounded">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-900">O que aconteceu:</span>
            </div>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Muitos testes de e-mail em sequência</li>
              <li>• Limite de 2 req/seg do Resend atingido</li>
              <li>• Sistema temporariamente bloqueado</li>
            </ul>
          </div>
          
          <div className="p-3 bg-white border border-green-200 rounded">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-900">Solução:</span>
            </div>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Aguarde 1-2 minutos</li>
              <li>• Teste com menos frequência</li>
              <li>• Sistema volta ao normal sozinho</li>
            </ul>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-medium text-blue-900 mb-2">💡 Dica Importante:</h4>
          <p className="text-sm text-blue-800">
            <strong>Isso confirma que sua API Key está funcionando!</strong> O rate limit só acontece 
            quando o sistema consegue se conectar ao Resend com sucesso. Em produção, o sistema 
            espaça automaticamente os envios para evitar esse problema.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Aguarde 1-2 minutos
          </Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            API Key Válida
          </Badge>
        </div>

        <div className="text-xs text-yellow-600 bg-white p-2 rounded border border-yellow-200">
          <strong>📈 Para Produção:</strong> O sistema implementa automaticamente um sistema de fila 
          que espaça os e-mails para respeitar os limites do Resend.
        </div>
      </AlertDescription>
    </Alert>
  );
}