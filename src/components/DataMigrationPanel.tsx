import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { supabaseDataService } from '../lib/supabaseDataService';
import { toast } from '../utils/toast';
import { CheckCircle, AlertCircle, RefreshCw, Database, Upload, Zap } from 'lucide-react';

interface MigrationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  errorMessage?: string;
}

export function DataMigrationPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [steps, setSteps] = useState<MigrationStep[]>([
    {
      id: 'health-check',
      title: 'Verificação de Conectividade',
      description: 'Testando conexão com servidor Supabase',
      status: 'pending'
    },
    {
      id: 'init-users',
      title: 'Inicializar Usuários',
      description: 'Criando usuários de exemplo no sistema',
      status: 'pending'
    },
    {
      id: 'migrate-data',
      title: 'Migrar Dados Iniciais',
      description: 'Transferindo critérios e alertas para o Supabase',
      status: 'pending'
    },
    {
      id: 'verify-data',
      title: 'Verificar Migração',
      description: 'Confirmando que todos os dados foram migrados corretamente',
      status: 'pending'
    }
  ]);

  const updateStepStatus = (stepId: string, status: MigrationStep['status'], errorMessage?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, errorMessage }
        : step
    ));
  };

  const runMigration = async () => {
    setIsRunning(true);
    setProgress(0);
    
    try {
      // Reset all steps
      setSteps(prev => prev.map(step => ({ ...step, status: 'pending', errorMessage: undefined })));

      // Step 1: Health Check
      setCurrentStep('health-check');
      updateStepStatus('health-check', 'running');
      setProgress(10);

      const isHealthy = await supabaseDataService.checkHealth();
      if (!isHealthy) {
        throw new Error('Servidor não está respondendo');
      }
      
      updateStepStatus('health-check', 'completed');
      setProgress(25);
      toast('✅ Conectividade verificada');

      // Step 2: Initialize Users
      setCurrentStep('init-users');
      updateStepStatus('init-users', 'running');
      setProgress(40);

      await supabaseDataService.initializeData();
      updateStepStatus('init-users', 'completed');
      setProgress(60);
      toast('✅ Usuários inicializados');

      // Step 3: Migrate Initial Data
      setCurrentStep('migrate-data');
      updateStepStatus('migrate-data', 'running');
      setProgress(75);

      await supabaseDataService.migrateInitialData();
      updateStepStatus('migrate-data', 'completed');
      setProgress(90);
      toast('✅ Dados migrados');

      // Step 4: Verify Migration
      setCurrentStep('verify-data');
      updateStepStatus('verify-data', 'running');
      setProgress(95);

      // Verificar se dados foram criados
      const [criterios, alertas, users] = await Promise.all([
        supabaseDataService.getCriterios(),
        supabaseDataService.getAlertas(),
        supabaseDataService.getUsers()
      ]);

      if (criterios.length === 0 || alertas.length === 0 || users.length === 0) {
        throw new Error('Alguns dados não foram migrados corretamente');
      }

      updateStepStatus('verify-data', 'completed');
      setProgress(100);
      setCurrentStep(null);

      toast('🎉 Migração concluída com sucesso!', 'success');

      // Auto-refresh após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Erro na migração:', error);
      
      if (currentStep) {
        updateStepStatus(currentStep, 'error', error instanceof Error ? error.message : 'Erro desconhecido');
      }
      
      toast('❌ Erro na migração: ' + (error instanceof Error ? error.message : 'Erro desconhecido'), 'destructive');
    } finally {
      setIsRunning(false);
    }
  };

  const getStepIcon = (status: MigrationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const hasErrors = steps.some(s => s.status === 'error');
  const allCompleted = completedSteps === steps.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-6 h-6 text-[var(--jardim-green)]" />
            <span>Migração de Dados para Supabase</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Esta ferramenta migra os dados mock para o banco de dados Supabase, 
            permitindo sincronização e persistência real dos dados.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso da Migração</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Status Summary */}
          {!isRunning && !allCompleted && (
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <strong>Pronto para migrar:</strong> Este processo irá transferir todos os dados mock 
                para o Supabase, criando usuários de exemplo e dados iniciais. 
                <br />
                <strong>Nota:</strong> A migração só precisa ser executada uma vez.
              </AlertDescription>
            </Alert>
          )}

          {hasErrors && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Erro na migração:</strong> Alguns passos falharam. 
                Verifique sua conexão com o Supabase e tente novamente.
              </AlertDescription>
            </Alert>
          )}

          {allCompleted && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Migração concluída!</strong> Todos os dados foram transferidos com sucesso. 
                A página será recarregada automaticamente.
              </AlertDescription>
            </Alert>
          )}

          {/* Migration Steps */}
          <div className="space-y-4">
            <h4 className="font-medium">Passos da Migração:</h4>
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                {getStepIcon(step.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">{index + 1}. {step.title}</h5>
                    {currentStep === step.id && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Em execução...
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  {step.errorMessage && (
                    <p className="text-sm text-red-600 mt-1">
                      ❌ {step.errorMessage}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <Button 
              onClick={runMigration}
              disabled={isRunning || allCompleted}
              className="flex items-center space-x-2"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Migrando...</span>
                </>
              ) : allCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Migração Concluída</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Iniciar Migração</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}