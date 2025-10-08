import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ExternalLink, CheckCircle, AlertCircle, Globe, Mail } from 'lucide-react';

interface DomainStatus {
  name: string;
  status: string;
  verified: boolean;
}

interface DomainStatusResponse {
  success: boolean;
  domain: DomainStatus | null;
  message: string;
  allDomains: Array<{ name: string; status: string }>;
}

export const DomainSetupGuide = () => {
  const [domainStatus, setDomainStatus] = useState<DomainStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const checkDomainStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email/domain-status');
      const data = await response.json();
      setDomainStatus(data);
    } catch (error) {
      console.error('Erro ao verificar status do domínio:', error);
      setDomainStatus({
        success: false,
        domain: null,
        message: 'Erro ao verificar status do domínio',
        allDomains: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getDomainStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">✅ Verificado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Pendente</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">❌ Falhou</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Configuração do Domínio de E-mail
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Check */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={checkDomainStatus} 
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Verificando...' : 'Verificar Status do Domínio'}
            </Button>
            
            {domainStatus && (
              <div className="flex items-center gap-2">
                {domainStatus.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm text-muted-foreground">
                  {domainStatus.message}
                </span>
              </div>
            )}
          </div>

          {/* Domain Status */}
          {domainStatus && (
            <div className="space-y-4">
              {domainStatus.domain ? (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">transparenciajardim.app</h4>
                      <p className="text-sm text-muted-foreground">
                        Domínio principal do TranspJardim
                      </p>
                    </div>
                    {getDomainStatusBadge(domainStatus.domain.status)}
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    O domínio transparenciajardim.app não foi encontrado na sua conta Resend.
                  </AlertDescription>
                </Alert>
              )}

              {domainStatus.allDomains.length > 0 && (
                <div>
                  <h5 className="font-semibold mb-2">Domínios Configurados:</h5>
                  <div className="space-y-2">
                    {domainStatus.allDomains.map((domain, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{domain.name}</span>
                        {getDomainStatusBadge(domain.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Setup Instructions */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Instruções de Configuração
            </h4>
            
            <div className="space-y-3 text-sm">
              <div className="p-4 border rounded-lg bg-blue-50">
                <h5 className="font-semibold text-blue-800 mb-2">
                  Passo 1: Adicionar Domínio no Resend
                </h5>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Acesse o painel do Resend</li>
                  <li>Vá para a seção "Domains"</li>
                  <li>Clique em "Add Domain"</li>
                  <li>Digite: <code className="bg-blue-100 px-1 rounded">transparenciajardim.app</code></li>
                </ol>
              </div>

              <div className="p-4 border rounded-lg bg-green-50">
                <h5 className="font-semibold text-green-800 mb-2">
                  Passo 2: Configurar DNS
                </h5>
                <p className="text-green-700 mb-2">
                  Adicione os registros DNS fornecidos pelo Resend no seu provedor de domínio:
                </p>
                <ul className="list-disc list-inside space-y-1 text-green-700">
                  <li>Registro MX para recebimento</li>
                  <li>Registro TXT para verificação</li>
                  <li>Registro CNAME para DKIM</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg bg-purple-50">
                <h5 className="font-semibold text-purple-800 mb-2">
                  Passo 3: Verificação
                </h5>
                <p className="text-purple-700">
                  Após configurar o DNS, aguarde a verificação automática (pode levar até 24 horas).
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button asChild variant="outline">
                <a 
                  href="https://resend.com/domains" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir Painel Resend
                </a>
              </Button>
              
              <Button asChild variant="outline">
                <a 
                  href="https://resend.com/docs/dashboard/domains/introduction" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Documentação
                </a>
              </Button>
            </div>
          </div>

          {/* Current Configuration */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h5 className="font-semibold mb-2">Configuração Atual do Sistema:</h5>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><strong>E-mail remetente:</strong> controleinterno@transparenciajardim.app</p>
              <p><strong>Domínio necessário:</strong> transparenciajardim.app</p>
              <p><strong>Status:</strong> {domainStatus?.domain?.verified ? '✅ Configurado' : '⚠️ Pendente'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};