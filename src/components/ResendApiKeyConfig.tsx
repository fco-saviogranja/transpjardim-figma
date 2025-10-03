import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { Key, ExternalLink, CheckCircle, XCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { DomainConfigHelp } from './DomainConfigHelp';
import { ResendTestModeHelp } from './ResendTestModeHelp';
import { emailService } from '../lib/emailService';

interface ResendApiKeyConfigProps {
  onConfigured?: () => void;
  currentStatus?: 'unknown' | 'valid' | 'invalid';
}

export function ResendApiKeyConfig({ onConfigured, currentStatus = 'unknown' }: ResendApiKeyConfigProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showDomainHelp, setShowDomainHelp] = useState(false);
  const [testModeInfo, setTestModeInfo] = useState<{authorizedEmail?: string} | null>(null);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Digite uma API Key válida');
      return;
    }

    if (!apiKey.startsWith('re_')) {
      toast.error('API Key deve começar com "re_"');
      return;
    }

    if (apiKey.length < 32) {
      toast.error('API Key deve ter pelo menos 32 caracteres');
      return;
    }

    setIsValidating(true);

    try {
      console.log('Configurando API Key:', apiKey.substring(0, 10) + '...');
      
      // Usar o método específico do EmailService para testar API Key temporária
      const result = await emailService.testTemporaryApiKey(apiKey);

      // Se chegou aqui, a API key é válida
      if (result.testMode && result.authorizedEmail) {
        // Modo de teste - só pode enviar para o próprio e-mail
        toast.success('✅ API Key configurada corretamente!');
        toast.info(`📧 Modo de teste ativo. E-mails serão enviados para: ${result.authorizedEmail}`);
        setTestModeInfo({ authorizedEmail: result.authorizedEmail });
      } else {
        // Funcionamento normal
        toast.success('✅ API Key validada e configurada com sucesso!');
        setShowDomainHelp(true);
      }
      
      setApiKey('');
      
      if (onConfigured) {
        onConfigured();
      }
      
    } catch (error) {
      console.error('Erro ao configurar API Key:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          toast.error('Timeout na validação da API Key');
        } else if (error.message.includes('fetch')) {
          toast.error('Erro de conectividade. Verifique sua conexão.');
        } else {
          toast.error(`Erro ao configurar API Key: ${error.message}`);
        }
      } else {
        toast.error('Erro desconhecido ao configurar API Key');
      }
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusInfo = () => {
    switch (currentStatus) {
      case 'valid':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          text: 'API Key Válida',
          description: 'O sistema pode enviar e-mails',
          color: 'text-green-700'
        };
      case 'invalid':
        return {
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          text: 'API Key Inválida',
          description: 'Verifique se a chave está correta',
          color: 'text-red-700'
        };
      default:
        return {
          icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
          text: 'Status Desconhecido',
          description: 'Configure a API Key para verificar',
          color: 'text-yellow-700'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Key className="h-5 w-5 text-blue-600" />
          <span>Configurar API Key do Resend</span>
        </CardTitle>
        <CardDescription>
          Configure sua chave de API do Resend para habilitar o envio de e-mails
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Atual */}
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
          <div className="flex items-center space-x-3">
            {statusInfo.icon}
            <div>
              <p className="font-medium">{statusInfo.text}</p>
              <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
            </div>
          </div>
          <Badge variant={currentStatus === 'valid' ? 'default' : 'outline'}>
            {currentStatus === 'valid' ? 'Configurado' : 'Pendente'}
          </Badge>
        </div>

        {/* Configuração da API Key */}
        <div className="space-y-3">
          <Label htmlFor="resend-api-key">API Key do Resend</Label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                id="resend-api-key"
                type={showApiKey ? 'text' : 'password'}
                placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isValidating}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <Button 
              onClick={handleSaveApiKey}
              disabled={!apiKey.trim() || isValidating}
            >
              {isValidating ? 'Configurando...' : 'Salvar'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            A API Key deve começar com "re_" e ter pelo menos 32 caracteres
          </p>
        </div>

        {/* Instruções */}
        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertTitle>Como obter sua API Key:</AlertTitle>
          <AlertDescription>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>
                Acesse{' '}
                <a 
                  href="https://resend.com/signup" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  resend.com/signup
                </a>{' '}
                e crie uma conta gratuita
              </li>
              <li>Faça login no dashboard do Resend</li>
              <li>No menu lateral, clique em <strong>"API Keys"</strong></li>
              <li>Clique em <strong>"Create API Key"</strong></li>
              <li>Nome sugerido: <code className="bg-muted px-1 rounded">TranspJardim-Alertas</code></li>
              <li>Copie a chave gerada e cole no campo acima</li>
            </ol>
            
            <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>💡 Plano Gratuito:</strong> 3.000 e-mails/mês · 100 e-mails/dia · Mais que suficiente para alertas municipais!
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Botões de Ação */}
        <div className="flex space-x-2 pt-2">
          <Button
            variant="outline"
            onClick={() => window.open('https://resend.com/api-keys', '_blank')}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir Resend Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('https://resend.com/docs/introduction', '_blank')}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Documentação
          </Button>
        </div>
        
        {/* Ajuda sobre modo de teste */}
        {testModeInfo && (
          <ResendTestModeHelp 
            authorizedEmail={testModeInfo.authorizedEmail}
            onDismiss={() => setTestModeInfo(null)}
          />
        )}
        
        {/* Ajuda sobre configuração de domínio */}
        {showDomainHelp && !testModeInfo && (
          <DomainConfigHelp 
            showSuccess={true}
            onDismiss={() => setShowDomainHelp(false)}
          />
        )}
        
        {/* Mostra ajuda de domínio se status é válido mas usuário não viu ainda */}
        {currentStatus === 'valid' && !showDomainHelp && !testModeInfo && (
          <DomainConfigHelp showSuccess={false} />
        )}
      </CardContent>
    </Card>
  );
}