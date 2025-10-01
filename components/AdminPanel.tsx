import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Settings, Users, Database, Mail, Shield, Activity } from 'lucide-react';
import { JardimBreadcrumb } from './JardimBreadcrumb';
import jardimLogo from 'figma:asset/4f3eac8f0c544542936be9cbdd5a45e730140e32.png';

export const AdminPanel = () => {
  const systemStats = [
    {
      title: 'Usuários Ativos',
      value: '12',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'APIs Ativas',
      value: '8',
      icon: Database,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'E-mails Enviados',
      value: '156',
      icon: Mail,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Uptime Sistema',
      value: '99.8%',
      icon: Activity,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  const adminActions = [
    {
      title: 'Gerenciar Usuários',
      description: 'Adicionar, editar ou remover usuários do sistema',
      icon: Users,
      action: 'users'
    },
    {
      title: 'Configurações do Sistema',
      description: 'Ajustar parâmetros gerais e preferências',
      icon: Settings,
      action: 'settings'
    },
    {
      title: 'Backup de Dados',
      description: 'Fazer backup e restaurar dados do sistema',
      icon: Database,
      action: 'backup'
    },
    {
      title: 'Logs de Segurança',
      description: 'Visualizar logs de acesso e atividades',
      icon: Shield,
      action: 'logs'
    },
    {
      title: 'Configurar Alertas',
      description: 'Definir regras e destinatários de alertas',
      icon: Mail,
      action: 'alerts'
    },
    {
      title: 'Monitoramento',
      description: 'Acompanhar performance e métricas',
      icon: Activity,
      action: 'monitoring'
    }
  ];

  const handleAction = (action: string) => {
    // Em produção, navegaria para a tela específica
    console.log(`Ação administrativa: ${action}`);
    alert(`Funcionalidade "${action}" em desenvolvimento`);
  };

  return (
    <div className="space-y-6">
      <JardimBreadcrumb items={[{ label: 'Administração' }]} />
      
      <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--border)]">
        <div className="flex items-center space-x-3 mb-4">
          <img 
            src={jardimLogo} 
            alt="Prefeitura de Jardim - CE" 
            className="w-11 h-11 bg-white rounded-full p-1 shadow-sm"
          />
          <div>
            <h2 className="text-2xl font-bold text-[var(--jardim-green)]">Painel Administrativo</h2>
            <p className="text-[var(--jardim-gray)]">
              Gerencie usuários, configurações e monitore o sistema
            </p>
          </div>
        </div>
      </div>

      {/* Estatísticas do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemStats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ações Administrativas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Administrativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminActions.map((action, index) => {
              const Icon = action.icon;
              
              return (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleAction(action.action)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-base">{action.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>API Principal</span>
              <Badge variant="default">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Banco de Dados</span>
              <Badge variant="default">Conectado</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Serviço de E-mail</span>
              <Badge variant="secondary">Configurando</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Backup Automático</span>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Cron Jobs</span>
              <Badge variant="default">Executando</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};