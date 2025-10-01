import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertCircle, Loader2, Database, Users, FileText } from 'lucide-react';
import { toast } from '../utils/toast';
import { useSupabase } from '../hooks/useSupabase';
import { ConnectionTester } from './ConnectionTester';

interface InitStep {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: 'pending' | 'running' | 'success' | 'error';
  error?: string;
}

export const SystemInitializer = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [steps, setSteps] = useState<InitStep[]>([
    {
      id: 'health-check',
      name: 'Verificar Conexão',
      description: 'Testar conexão com o servidor',
      icon: Database,
      status: 'pending'
    },
    {
      id: 'init-users',
      name: 'Inicializar Usuários',
      description: 'Criar usuários de exemplo do sistema',
      icon: Users,
      status: 'pending'
    },
    {
      id: 'init-data',
      name: 'Carregar Dados Mock',
      description: 'Carregar critérios e alertas de exemplo',
      icon: FileText,
      status: 'pending'
    }
  ]);

  const supabase = useSupabase();

  const updateStepStatus = (stepId: string, status: InitStep['status'], error?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, error }
        : step
    ));
  };

  const initializeSystem = async () => {
    setIsInitializing(true);
    
    try {
      // Passo 1: Health Check
      updateStepStatus('health-check', 'running');
      
      const healthResponse = await supabase.healthCheck();
      
      if (healthResponse.success) {
        updateStepStatus('health-check', 'success');
        toast.success('Conexão estabelecida com sucesso');
        
        // Aguardar um pouco antes do próximo passo
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Passo 2: Inicializar Usuários e Dados
        updateStepStatus('init-users', 'running');
        updateStepStatus('init-data', 'running');
        
        const initResponse = await supabase.initData();
        
        if (initResponse.success) {
          updateStepStatus('init-users', 'success');
          updateStepStatus('init-data', 'success');
          toast.success('Sistema inicializado com sucesso!');
        } else {
          updateStepStatus('init-users', 'error', initResponse.error);
          updateStepStatus('init-data', 'error', initResponse.error);
          toast.error('Erro na inicialização: ' + initResponse.error);
        }
        
      } else {
        updateStepStatus('health-check', 'error', healthResponse.error);
        
        // Verificar se é erro de rede ou servidor não disponível
        if (healthResponse.error?.includes('Failed to fetch') || 
            healthResponse.error?.includes('NetworkError') ||
            healthResponse.error?.includes('AbortError')) {
          toast.error('Servidor Supabase não está disponível. Verifique se a função edge está ativa.');
        } else {
          toast.error('Falha na conexão: ' + healthResponse.error);
        }
        return;
      }

    } catch (error) {
      console.error('Erro durante inicialização:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      // Marcar todos os passos pendentes como erro
      setSteps(prev => prev.map(step => 
        step.status === 'pending' || step.status === 'running'
          ? { ...step, status: 'error', error: errorMessage }
          : step
      ));
      
      if (errorMessage.includes('Failed to fetch')) {
        toast.error('Não foi possível conectar ao servidor. Verifique se a função edge do Supabase está ativa.');
      } else {
        toast.error('Erro crítico durante inicialização');
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const resetInitialization = () => {
    setSteps(prev => prev.map(step => ({ 
      ...step, 
      status: 'pending', 
      error: undefined 
    })));
  };

  const getStepIcon = (step: InitStep) => {
    const Icon = step.icon;
    
    if (step.status === 'running') {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
    } else if (step.status === 'success') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (step.status === 'error') {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    } else {
      return <Icon className="h-5 w-5 text-gray-400" />;
    }
  };

  const allStepsComplete = steps.every(step => step.status === 'success');
  const hasErrors = steps.some(step => step.status === 'error');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Título da Seção */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--jardim-green)] mb-2">
          Configuração do Sistema
        </h1>
        <p className="text-muted-foreground">
          Teste a conectividade e inicialize o TranspJardim com dados de exemplo
        </p>
      </div>

      {/* Teste de Conectividade e Inicialização */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConnectionTester />
        
        <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-6 w-6 text-[var(--jardim-green)]" />
          <span>Inicialização do Sistema</span>
        </CardTitle>
        <CardDescription>
          Configure o TranspJardim com dados iniciais para começar a usar
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Lista de Passos */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getStepIcon(step)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{step.name}</p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {step.error && (
                  <p className="text-sm text-red-600 mt-1">{step.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mensagens de Status */}
        {allStepsComplete && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Sistema inicializado com sucesso! Você pode começar a usar o TranspJardim.
            </AlertDescription>
          </Alert>
        )}

        {hasErrors && !isInitializing && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Ocorreram erros durante a inicialização. Tente novamente.
            </AlertDescription>
          </Alert>
        )}

        {/* Botões de Ação */}
        <div className="flex space-x-3">
          <Button
            onClick={initializeSystem}
            disabled={isInitializing || allStepsComplete}
            className="bg-[var(--jardim-green)] hover:bg-[var(--jardim-green-light)]"
          >
            {isInitializing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Inicializando...
              </>
            ) : allStepsComplete ? (
              'Concluído'
            ) : (
              'Inicializar Sistema'
            )}
          </Button>
          
          {(hasErrors || allStepsComplete) && (
            <Button
              variant="outline"
              onClick={resetInitialization}
              disabled={isInitializing}
            >
              Reiniciar
            </Button>
          )}
        </div>

        {/* Informações Importantes */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Informações Importantes:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Esta inicialização criará usuários de exemplo para teste</li>
            <li>• Dados existentes não serão sobrescritos</li>
            <li>• O administrador padrão é: <strong>admin</strong> / <strong>admin123</strong></li>
            <li>• Usuários padrão têm senha: <strong>user123</strong></li>
          </ul>
        </div>

        {/* Aviso sobre Backend */}
        {hasErrors && (
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Problema de Conectividade
            </h4>
            <div className="text-sm text-amber-800 space-y-2">
              <p>O servidor backend não está respondendo adequadamente.</p>
              <p><strong>Possíveis causas:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Função edge do Supabase não está ativa (cold start)</li>
                <li>Problema na configuração do banco KV</li>
                <li>Variáveis de ambiente não configuradas</li>
                <li>Limite de recursos da função edge</li>
              </ul>
              <p><strong>Soluções:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Aguarde 1-2 minutos e tente novamente</li>
                <li>Verifique logs do Supabase Dashboard</li>
                <li>Use o modo demonstração (totalmente funcional)</li>
              </ul>
              <p className="font-medium mt-3 p-2 bg-blue-100 rounded text-blue-800">
                💡 O sistema funcionará perfeitamente em modo demonstração com todas as funcionalidades!
              </p>
            </div>
          </div>
        )}
      </CardContent>
        </Card>
      </div>
    </div>
  );
};