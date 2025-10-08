import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Settings, Users, Database, Mail, Shield, Activity, Server, Bell, AlertTriangle } from 'lucide-react';
import { JardimBreadcrumb } from './JardimBreadcrumb';
import { UserManagement } from './UserManagement';
import { SystemInitializer } from './SystemInitializer';
import { SystemStatus } from './SystemStatus';
import { BackupPanel } from './BackupPanel';
import { SystemSettings } from './SystemSettings';
import { AlertsConfigPanel } from './AlertsConfigPanel';
import { EmailConfigPanel } from './EmailConfigPanel';
import { EmailSystemStatus } from './EmailSystemStatus';
import { AlertsDebugPanel } from './AlertsDebugPanel';
import { EmailTestButton } from './EmailTestButton';
import { EmailStatusIndicator } from './EmailStatusIndicator';
import { SimpleEmailTest } from './SimpleEmailTest';
import { useSupabase } from '../hooks/useSupabase';
import { JardimLogo } from './JardimLogo';
import { mockCriterios, mockAlertas } from '../lib/mockData';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoRedonda from 'figma:asset/f6a9869d371560fae8a34486a3ae60bdf404d376.png';

interface AdminPanelProps {
  onNavigate?: (view: string) => void;
}

export const AdminPanel = ({ onNavigate }: AdminPanelProps) => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const supabase = useSupabase();

  // Verificar status do backend ao carregar
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await supabase.healthCheck();
        setBackendAvailable(response.success);
      } catch (error) {
        setBackendAvailable(false);
      }
    };
    
    checkBackend();
  }, []);

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
      title: 'Inicializar Sistema',
      description: 'Configurar dados iniciais e usuários de exemplo',
      icon: Server,
      action: 'init-system'
    },
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
      description: 'Definir regras automáticas e notificações',
      icon: Bell,
      action: 'alerts'
    },
    {
      title: 'Sistema de E-mail',
      description: 'Configurar e testar envio de e-mails',
      icon: Mail,
      action: 'email'
    },
    {
      title: 'Debug de Alertas',
      description: 'Testar e debugar sistema de alertas',
      icon: AlertTriangle,
      action: 'alerts-debug'
    }
  ];

  const handleAction = (action: string) => {
    if (action === 'users') {
      setCurrentView('users');
    } else if (action === 'init-system') {
      setCurrentView('init-system');
    } else if (action === 'backup') {
      console.log('[AdminPanel] Executando: setCurrentView(backup)');
      setCurrentView('backup');
    } else if (action === 'settings') {
      console.log('[AdminPanel] Executando: setCurrentView(settings)');
      setCurrentView('settings');
    } else if (action === 'alerts') {
      console.log('[AdminPanel] Executando: setCurrentView(alerts)');
      setCurrentView('alerts');
    } else if (action === 'email') {
      console.log('[AdminPanel] Executando: setCurrentView(email)');
      setCurrentView('email');
    } else if (action === 'alerts-debug') {
      console.log('[AdminPanel] Executando: setCurrentView(alerts-debug)');
      setCurrentView('alerts-debug');
    } else {
      // Em produção, navegaria para outras telas específicas
      console.log(`Ação administrativa: ${action}`);
      alert(`Funcionalidade "${action}" em desenvolvimento`);
    }
  };

  // Renderizar conteúdo baseado na view atual
  if (currentView === 'users') {
    return (
      <div className="space-y-6">
        <JardimBreadcrumb 
          items={[
            { label: 'Administração', onClick: () => setCurrentView('dashboard') },
            { label: 'Gerenciar Usuários' }
          ]}
          onHomeClick={() => onNavigate ? onNavigate('dashboard') : setCurrentView('dashboard')}
        />
        <UserManagement />
      </div>
    );
  }

  if (currentView === 'init-system') {
    return (
      <div className="space-y-6">
        <JardimBreadcrumb 
          items={[
            { label: 'Administração', onClick: () => setCurrentView('dashboard') },
            { label: 'Inicializar Sistema' }
          ]}
          onHomeClick={() => onNavigate ? onNavigate('dashboard') : setCurrentView('dashboard')}
        />
        <SystemInitializer />
      </div>
    );
  }

  if (currentView === 'backup') {
    console.log('[AdminPanel] Renderizando view: backup');
    return (
      <div className="space-y-6">
        <JardimBreadcrumb 
          items={[
            { label: 'Administração', onClick: () => setCurrentView('dashboard') },
            { label: 'Backup de Dados' }
          ]}
          onHomeClick={() => onNavigate ? onNavigate('dashboard') : setCurrentView('dashboard')}
        />
        <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--border)]">
          <BackupPanel 
            criterios={mockCriterios} 
            alertas={mockAlertas}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'settings') {
    console.log('[AdminPanel] Renderizando view: settings');
    return (
      <div className="space-y-6">
        <JardimBreadcrumb 
          items={[
            { label: 'Administração', onClick: () => setCurrentView('dashboard') },
            { label: 'Configurações do Sistema' }
          ]}
          onHomeClick={() => onNavigate ? onNavigate('dashboard') : setCurrentView('dashboard')}
        />
        <SystemSettings />
      </div>
    );
  }

  if (currentView === 'alerts') {
    console.log('[AdminPanel] Renderizando view: alerts');
    return (
      <div className="space-y-6">
        <JardimBreadcrumb 
          items={[
            { label: 'Administração', onClick: () => setCurrentView('dashboard') },
            { label: 'Configurar Alertas' }
          ]}
          onHomeClick={() => onNavigate ? onNavigate('dashboard') : setCurrentView('dashboard')}
        />
        <div className="space-y-4">
          {/* Indicador de status de e-mail */}
          <EmailStatusIndicator showFullAlert={true} />
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--border)]">
            <AlertsConfigPanel />
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'email') {
    console.log('[AdminPanel] Renderizando view: email');
    return (
      <div className="space-y-6">
        <JardimBreadcrumb 
          items={[
            { label: 'Administração', onClick: () => setCurrentView('dashboard') },
            { label: 'Sistema de E-mail' }
          ]}
          onHomeClick={() => onNavigate ? onNavigate('dashboard') : setCurrentView('dashboard')}
        />
        <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--border)]">
          <EmailConfigPanel onClose={() => setCurrentView('dashboard')} />
        </div>
      </div>
    );
  }

  if (currentView === 'alerts-debug') {
    console.log('[AdminPanel] Renderizando view: alerts-debug');
    return (
      <div className="space-y-6">
        <JardimBreadcrumb 
          items={[
            { label: 'Administração', onClick: () => setCurrentView('dashboard') },
            { label: 'Debug de Alertas' }
          ]}
          onHomeClick={() => onNavigate ? onNavigate('dashboard') : setCurrentView('dashboard')}
        />
        <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--border)]">
          <AlertsDebugPanel onClose={() => setCurrentView('dashboard')} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <JardimBreadcrumb 
        items={[{ label: 'Administração' }]}
        onHomeClick={() => onNavigate ? onNavigate('dashboard') : undefined}
      />
      
      <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <ImageWithFallback 
                src={logoRedonda}
                alt="Prefeitura de Jardim - CE"
                className="w-11 h-11 object-contain rounded-full"
                style={{ 
                  filter: 'drop-shadow(0 2px 4px rgba(74, 124, 89, 0.1)) brightness(1.05) contrast(1.05)',
                  background: 'transparent'
                }}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--jardim-green)]">Painel Administrativo</h2>
              <p className="text-[var(--jardim-gray)]">
                Gerencie usuários, configurações e monitore o sistema
              </p>
            </div>
          </div>
          
          {/* Botão de teste de e-mail */}
          <EmailTestButton 
            onShowConfig={() => handleAction('email')}
          />
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
                      <div className="p-2 rounded-lg bg-[var(--jardim-green-lighter)]">
                        <Icon className="h-5 w-5 text-[var(--jardim-green)]" />
                      </div>
                      <CardTitle className="text-base">
                        {action.title}
                      </CardTitle>
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

      {/* Teste de Email */}
      <div className="flex justify-center">
        <SimpleEmailTest />
      </div>

      {/* Status do Sistema */}
      {backendAvailable !== null && (
        <SystemStatus backendAvailable={backendAvailable} />
      )}


    </div>
  );
};