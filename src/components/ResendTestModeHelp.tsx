import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, Mail, Globe, ExternalLink, UserCheck } from 'lucide-react';

interface ResendTestModeHelpProps {
  authorizedEmail?: string;
  onDismiss?: () => void;
}

export function ResendTestModeHelp({ authorizedEmail, onDismiss }: ResendTestModeHelpProps) {
  return (
    <Alert className="border-green-200 bg-green-50 mt-4">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">
        ✅ Sistema de E-mail Configurado com Sucesso!
      </AlertTitle>
      <AlertDescription className="text-green-700 space-y-4">
        <p>
          <strong>Sua API Key do Resend está válida e funcionando!</strong> O sistema está pronto para enviar alertas automáticos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Atual */}
          <div className="p-3 bg-white border border-green-200 rounded">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <UserCheck className="h-3 w-3 mr-1" />
                Modo de Teste
              </Badge>
            </div>
            <p className="text-sm text-green-800 mb-2">
              <strong>E-mail autorizado para testes:</strong>
            </p>
            <code className="bg-green-100 px-2 py-1 rounded text-xs block">
              {authorizedEmail || 'Seu e-mail de cadastro no Resend'}
            </code>
            <p className="text-xs text-green-700 mt-2">
              ✅ Para este e-mail, o sistema enviará normalmente
            </p>
          </div>

          {/* Produção */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                <Globe className="h-3 w-3 mr-1" />
                Modo Produção
              </Badge>
            </div>
            <p className="text-sm text-blue-800 mb-2">
              <strong>Para enviar para qualquer e-mail:</strong>
            </p>
            <ol className="text-xs text-blue-800 space-y-1">
              <li>1. Verificar domínio no Resend</li>
              <li>2. Usar remetente do domínio verificado</li>
              <li>3. Enviar para qualquer destinatário</li>
            </ol>
          </div>
        </div>

        <div className="p-3 bg-white border border-green-200 rounded">
          <h4 className="font-medium text-green-900 mb-2">
            🎯 O que isso significa para o TranspJardim:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-green-800 mb-1">✅ Funcionando Agora:</p>
              <ul className="list-disc list-inside space-y-1 text-green-700">
                <li>API Key válida e configurada</li>
                <li>Sistema de alertas operacional</li>
                <li>Testes para {authorizedEmail?.split('@')[0] || 'sua conta'}</li>
                <li>Logs e monitoramento ativos</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-blue-800 mb-1">🚀 Para Produção Total:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Verificar domínio jardim.ce.gov.br</li>
                <li>Configurar DNS do domínio</li>
                <li>Atualizar código para usar domínio</li>
                <li>Enviar para todos os funcionários</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={() => window.open('https://resend.com/domains', '_blank')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Globe className="h-4 w-4 mr-2" />
            Verificar Domínio
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open('https://resend.com/docs/dashboard/domains/introduction', '_blank')}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Guia de Domínios
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