import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  Database,
  Server,
  Globe,
  Zap
} from 'lucide-react';

interface MigrationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  isOptional?: boolean;
}

export function SystemMigrationStatus() {
  const [migrationSteps, setMigrationSteps] = useState<MigrationStep[]>([
    {
      id: 'data-structure',
      title: 'Estrutura de Dados',
      description: 'Modelos de usuário, critérios e alertas definidos',
      status: 'completed'
    },
    {
      id: 'authentication',
      title: 'Sistema de Autenticação',
      description: 'Login, sessões e controle de acesso implementados',
      status: 'completed'
    },
    {
      id: 'frontend-ready',
      title: 'Interface Responsiva',
      description: 'UI/UX completa com identidade visual do município',
      status: 'completed'
    },
    {
      id: 'backend-api',
      title: 'API Backend Supabase',
      description: 'Edge Functions com CRUD completo implementado',
      status: 'completed'
    },
    {
      id: 'hybrid-system',
      title: 'Sistema Híbrido',
      description: 'Fallback offline/online com sincronização',
      status: 'completed'
    },
    {
      id: 'admin-panel',
      title: 'Painel Administrativo',
      description: 'Gerenciamento de usuários e migração de dados',
      status: 'completed'
    },
    {
      id: 'deploy-ready',
      title: 'Pronto para Deploy',
      description: 'Código otimizado para Vercel/Netlify',
      status: 'completed'
    },
    {
      id: 'supabase-setup',
      title: 'Configurar Supabase Próprio',
      description: 'Criar projeto e configurar variáveis de ambiente',
      status: 'pending'
    },
    {
      id: 'production-deploy',
      title: 'Deploy em Produção',
      description: 'Subir aplicação para Vercel/Netlify',
      status: 'pending'
    },
    {
      id: 'custom-domain',
      title: 'Domínio Personalizado',
      description: 'Configurar transparencia.jardim.ce.gov.br',
      status: 'pending',
      isOptional: true
    },
    {
      id: 'data-migration',
      title: 'Migração de Dados',
      description: 'Inicializar dados no servidor de produção',
      status: 'pending'
    }
  ]);

  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    const completed = migrationSteps.filter(step => step.status === 'completed').length;
    const total = migrationSteps.length;
    const progress = Math.round((completed / total) * 100);
    setOverallProgress(progress);
  }, [migrationSteps]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string, isOptional?: boolean) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Em Progresso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return (
          <Badge variant="secondary" className={isOptional ? "bg-orange-100 text-orange-800" : ""}>
            {isOptional ? 'Opcional' : 'Pendente'}
          </Badge>
        );
    }
  };

  const completedSteps = migrationSteps.filter(step => step.status === 'completed').length;
  const totalSteps = migrationSteps.length;
  const pendingSteps = migrationSteps.filter(step => step.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Progresso Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            <span>Status da Migração TranspJardim</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-[var(--jardim-green)]">
                  {overallProgress}%
                </div>
                <div>
                  <p className="font-medium">Progresso Geral</p>
                  <p className="text-sm text-muted-foreground">
                    {completedSteps} de {totalSteps} etapas concluídas
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-2">
                  {pendingSteps} pendentes
                </Badge>
              </div>
            </div>
            <Progress value={overallProgress} className="w-full h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Etapas */}
      <Card>
        <CardHeader>
          <CardTitle>Etapas da Migração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {migrationSteps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="mt-0.5">
                  {getStatusIcon(step.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{step.title}</h4>
                    {getStatusBadge(step.status, step.isOptional)}
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {index < migrationSteps.length - 1 && step.status === 'completed' && (
                  <ArrowRight className="w-4 h-4 text-gray-400 mt-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Próximos Passos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowRight className="w-5 h-5" />
            <span>Próximos Passos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                <strong>Sistema Pronto!</strong> Todas as funcionalidades principais foram implementadas. 
                Agora você pode migrar para produção seguindo o guia de deployment.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-4 border rounded-lg text-center">
                <Server className="w-8 h-8 text-blue-600 mb-2" />
                <h4 className="font-medium">1. Supabase</h4>
                <p className="text-sm text-muted-foreground">
                  Criar projeto próprio no Supabase
                </p>
              </div>
              
              <div className="flex flex-col items-center p-4 border rounded-lg text-center">
                <Zap className="w-8 h-8 text-green-600 mb-2" />
                <h4 className="font-medium">2. Deploy</h4>
                <p className="text-sm text-muted-foreground">
                  Subir para Vercel ou Netlify
                </p>
              </div>
              
              <div className="flex flex-col items-center p-4 border rounded-lg text-center">
                <Globe className="w-8 h-8 text-purple-600 mb-2" />
                <h4 className="font-medium">3. Domínio</h4>
                <p className="text-sm text-muted-foreground">
                  Configurar domínio oficial
                </p>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button 
                onClick={() => window.open('/deployment-instructions.md', '_blank')}
                className="flex items-center space-x-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Ver Guia Completo de Migração</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}