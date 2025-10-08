import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Mail, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  ArrowRight, 
  Zap,
  Clock,
  Key
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface QuickSetupGuideProps {
  onComplete?: () => void;
}

export function QuickSetupGuide({ onComplete }: QuickSetupGuideProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      id: 1,
      title: 'Criar Conta Resend',
      description: 'Conta gratuita com 3.000 e-mails/mês',
      action: 'Abrir Resend',
      url: 'https://resend.com/signup',
      icon: Mail,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 2,
      title: 'Gerar API Key',
      description: 'Criar chave de acesso no dashboard',
      action: 'Dashboard API Keys',
      url: 'https://resend.com/api-keys',
      icon: Key,
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      id: 3,
      title: 'Configurar no Sistema',
      description: 'Adicionar a chave no TranspJardim',
      action: 'Ir para Configuração',
      internal: true,
      icon: Zap,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ];

  const handleStepAction = (step: any) => {
    if (step.internal) {
      // Ação interna - ir para configuração
      if (onComplete) {
        onComplete();
      }
    } else {
      // Abrir link externo
      window.open(step.url, '_blank');
      markStepCompleted(step.id);
    }
  };

  const markStepCompleted = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
      toast.success(`Passo ${stepId} concluído!`);
      
      // Avançar para próximo passo
      if (stepId < steps.length) {
        setCurrentStep(stepId + 1);
      }
    }
  };

  const copyApiKeyExample = () => {
    navigator.clipboard.writeText('re_AbCdEfGh123456789...');
    toast.success('Exemplo copiado!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[var(--jardim-green)] mb-2">
          ⚡ Configuração Rápida - E-mail
        </h2>
        <p className="text-[var(--jardim-gray)] text-lg">
          Configure o sistema de e-mail em 3 passos simples (5 minutos)
        </p>
      </div>

      <Tabs value={`step-${currentStep}`} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          {steps.map((step) => (
            <TabsTrigger 
              key={step.id}
              value={`step-${step.id}`}
              className={`relative ${completedSteps.includes(step.id) ? 'bg-green-100' : ''}`}
              onClick={() => setCurrentStep(step.id)}
            >
              <div className="flex items-center space-x-2">
                {completedSteps.includes(step.id) ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
                <span>Passo {step.id}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {steps.map((step) => (
          <TabsContent key={step.id} value={`step-${step.id}`} className="space-y-4">
            <Card className={`border-2 ${step.color}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${step.color}`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xl">{step.title}</span>
                    {completedSteps.includes(step.id) && (
                      <Badge className="ml-2 bg-green-100 text-green-800">
                        Concluído ✅
                      </Badge>
                    )}
                  </div>
                </CardTitle>
                <CardDescription className="text-base">
                  {step.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {step.id === 1 && (
                  <div className="space-y-3">
                    <Alert>
                      <Mail className="h-4 w-4" />
                      <AlertTitle>Criar Conta Gratuita</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                          <li>Acesse resend.com e clique em "Sign Up"</li>
                          <li>Use seu e-mail profissional/institucional</li>
                          <li>Confirme o e-mail e faça login</li>
                        </ul>
                        <div className="mt-3 p-3 bg-blue-50 rounded border">
                          <p className="text-sm text-blue-800">
                            <strong>💰 100% Gratuito:</strong> 3.000 e-mails/mês · Sem cartão de crédito
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {step.id === 2 && (
                  <div className="space-y-3">
                    <Alert>
                      <Key className="h-4 w-4" />
                      <AlertTitle>Gerar API Key</AlertTitle>
                      <AlertDescription>
                        <ol className="list-decimal list-inside space-y-1 mt-2">
                          <li>No dashboard do Resend, clique em <strong>"API Keys"</strong></li>
                          <li>Clique em <strong>"Create API Key"</strong></li>
                          <li>Nome: <code className="bg-gray-100 px-1 rounded">TranspJardim-Alertas</code></li>
                          <li>Copie a chave gerada (começa com "re_")</li>
                        </ol>
                        
                        <div className="mt-3 p-3 bg-gray-50 rounded border">
                          <p className="text-sm font-medium mb-1">Exemplo de API Key:</p>
                          <div className="flex items-center space-x-2">
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                              re_AbCdEfGh123456789...
                            </code>
                            <Button size="sm" variant="outline" onClick={copyApiKeyExample}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {step.id === 3 && (
                  <div className="space-y-3">
                    <Alert>
                      <Zap className="h-4 w-4" />
                      <AlertTitle>Configurar API Key</AlertTitle>
                      <AlertDescription>
                        <p className="mb-2">
                          Agora você precisa adicionar a API Key copiada no sistema TranspJardim.
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Clique no botão abaixo para ir à configuração</li>
                          <li>Cole sua API Key no campo "API Key do Resend"</li>
                          <li>Clique em "Salvar" e aguarde a validação</li>
                          <li>Teste o envio para confirmar funcionamento</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Tempo estimado: {step.id === 1 ? '2 min' : step.id === 2 ? '2 min' : '1 min'}</span>
                  </div>
                  
                  <Button 
                    onClick={() => handleStepAction(step)}
                    className="flex items-center space-x-2"
                    disabled={completedSteps.includes(step.id) && !step.internal}
                  >
                    <span>{step.action}</span>
                    {step.internal ? (
                      <ArrowRight className="h-4 w-4" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Progress */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-muted p-3 rounded-lg">
          <span className="text-sm font-medium">Progresso:</span>
          <Badge variant="outline">
            {completedSteps.length} / {steps.length} passos
          </Badge>
          {completedSteps.length === steps.length - 1 && (
            <span className="text-sm text-green-600 font-medium">
              🎉 Quase pronto! Falta apenas configurar a API Key
            </span>
          )}
        </div>
      </div>
    </div>
  );
}