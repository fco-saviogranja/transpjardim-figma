import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthProvider } from './components/AuthProvider';
import { LoginForm } from './components/LoginForm';
import { JardimHeader } from './components/JardimHeader';
import { JardimFooter } from './components/JardimFooter';
import { JardimBreadcrumb } from './components/JardimBreadcrumb';
import { Dashboard } from './components/Dashboard';
import { CriteriosList } from './components/CriteriosList';
import { CriteriosChart } from './components/CriteriosChart';
import { AlertsPanel } from './components/AlertsPanel';
import { AdminPanel } from './components/AdminPanel';
import { Toaster } from './components/ui/sonner';
import { useAuth } from './hooks/useAuth';
import { mockCriterios, mockAlertas, mockMetricas } from './lib/mockData';
import { Alerta, Criterio, Metricas } from './types';

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Inicializar currentView com valor do localStorage ou 'dashboard' como fallback
  // Isso permite que a navegação seja mantida mesmo após atualizar a página (F5)
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('transpjardim-current-view') || 'dashboard';
    }
    return 'dashboard';
  });
  
  const [alertas, setAlertas] = useState<Alerta[]>(mockAlertas);
  const [criterios, setCriterios] = useState<Criterio[]>(mockCriterios);
  const [metricas, setMetricas] = useState<Metricas>(mockMetricas);

  // Função para mudar view e persistir no localStorage
  const handleViewChange = useCallback((newView: string) => {
    setCurrentView(newView);
    if (typeof window !== 'undefined') {
      localStorage.setItem('transpjardim-current-view', newView);
    }
  }, []);

  // Verificar se a view atual é válida quando o usuário mudar (apenas uma vez)
  useEffect(() => {
    if (user && currentView === 'admin' && user.role !== 'admin') {
      // Se usuário não é admin mas está na página admin, redirecionar para dashboard
      setCurrentView('dashboard');
      if (typeof window !== 'undefined') {
        localStorage.setItem('transpjardim-current-view', 'dashboard');
      }
    }
  }, [user]); // Só roda quando o usuário mudar

  // Carregar completions do localStorage quando o usuário mudar
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const storageKey = `transpjardim-user-completions-${user.id}`;
      const savedCompletions = JSON.parse(localStorage.getItem(storageKey) || '{}');
      
      // Aplicar completions salvos aos critérios
      setCriterios(prev => 
        prev.map(criterio => {
          const savedCompletion = savedCompletions[criterio.id];
          if (savedCompletion) {
            return {
              ...criterio,
              conclusoesPorUsuario: {
                ...criterio.conclusoesPorUsuario,
                [user.id]: savedCompletion
              }
            };
          }
          return criterio;
        })
      );
    }
  }, [user]); // Só roda quando o usuário mudar

  const handleMarkAlertAsRead = (alertaId: string) => {
    setAlertas(prev => 
      prev.map(alerta => 
        alerta.id === alertaId 
          ? { ...alerta, lido: true }
          : alerta
      )
    );
  };

  const alertasNaoLidos = useMemo(() => alertas.filter(a => !a.lido), [alertas]);

  // Filtrar critérios baseado na secretaria do usuário (memoizado)
  const filteredCriterios = useMemo(() => {
    if (!user) return [];
    
    // Admin vê todos os critérios
    if (user.role === 'admin') {
      return criterios;
    }
    
    // Usuário padrão vê apenas critérios da sua secretaria
    if (user.secretaria) {
      return criterios.filter(criterio => criterio.secretaria === user.secretaria);
    }
    
    return [];
  }, [user, criterios]);

  // Calcular métricas (memoizado)
  const calculatedMetricas = useMemo(() => {
    const criteriosConcluidos = user ? filteredCriterios.filter(c => 
      c.conclusoesPorUsuario?.[user.id]?.concluido
    ).length : 0;

    return {
      totalCriterios: filteredCriterios.length,
      ativas: filteredCriterios.filter(c => c.status === 'ativo').length,
      pendentes: filteredCriterios.filter(c => c.status === 'pendente').length,
      vencidas: filteredCriterios.filter(c => c.status === 'vencido').length,
      percentualCumprimento: filteredCriterios.length > 0 
        ? Math.round(filteredCriterios.reduce((acc, c) => acc + (c.valor / c.meta), 0) / filteredCriterios.length * 100)
        : 0,
      alertasAtivos: alertasNaoLidos.length,
      criteriosConcluidos,
      percentualConclusao: filteredCriterios.length > 0 
        ? Math.round((criteriosConcluidos / filteredCriterios.length) * 100)
        : 0
    };
  }, [filteredCriterios, alertasNaoLidos.length, user]);

  // Atualizar métricas quando calculatedMetricas mudar
  useEffect(() => {
    setMetricas(calculatedMetricas);
  }, [calculatedMetricas]);

  const handleAddCriterio = (criterioData: Omit<Criterio, 'id'>) => {
    const newCriterio: Criterio = {
      ...criterioData,
      id: Date.now().toString() // Em produção, seria gerado pelo backend
    };
    
    setCriterios(prev => [...prev, newCriterio]);
  };

  const handleEditCriterio = (id: string, criterioData: Omit<Criterio, 'id'>) => {
    setCriterios(prev => 
      prev.map(criterio => 
        criterio.id === id 
          ? { ...criterioData, id }
          : criterio
      )
    );
  };

  const handleDeleteCriterio = (id: string) => {
    setCriterios(prev => prev.filter(criterio => criterio.id !== id));
  };

  const handleToggleCriterioCompletion = useCallback((criterioId: string, completed: boolean) => {
    if (!user) return;
    
    setCriterios(prev => 
      prev.map(criterio => {
        if (criterio.id === criterioId) {
          const updatedConclusoes = { ...criterio.conclusoesPorUsuario };
          
          if (completed) {
            updatedConclusoes[user.id] = {
              concluido: true,
              dataConclusao: new Date().toISOString()
            };
          } else {
            updatedConclusoes[user.id] = {
              concluido: false
            };
          }
          
          return {
            ...criterio,
            conclusoesPorUsuario: updatedConclusoes
          };
        }
        return criterio;
      })
    );
    
    // Persistir no localStorage até integração com Supabase
    const storageKey = `transpjardim-user-completions-${user.id}`;
    const existingCompletions = JSON.parse(localStorage.getItem(storageKey) || '{}');
    existingCompletions[criterioId] = {
      concluido: completed,
      dataConclusao: completed ? new Date().toISOString() : undefined
    };
    localStorage.setItem(storageKey, JSON.stringify(existingCompletions));
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            criterios={filteredCriterios}
            alertas={alertas}
            metricas={metricas}
            onMarkAlertAsRead={handleMarkAlertAsRead}
            user={user}
            onToggleCompletion={handleToggleCriterioCompletion}
          />
        );
      
      case 'criterios':
        return (
          <CriteriosList 
            criterios={criterios}
            user={user}
            onAddCriterio={handleAddCriterio}
            onEditCriterio={handleEditCriterio}
            onDeleteCriterio={handleDeleteCriterio}
            onToggleCompletion={handleToggleCriterioCompletion}
          />
        );
      
      case 'analytics':
        return (
          <div className="space-y-6">
            <JardimBreadcrumb items={[{ label: 'Análises' }]} />
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--border)]">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="figma:asset/4f3eac8f0c544542936be9cbdd5a45e730140e32.png" 
                  alt="Prefeitura de Jardim - CE" 
                  className="w-11 h-11 bg-white rounded-full p-1 shadow-sm"
                />
                <div>
                  <h2 className="text-2xl font-bold text-[var(--jardim-green)]">Análises Detalhadas</h2>
                  <p className="text-[var(--jardim-gray)]">
                    Visualize análises aprofundadas dos critérios e indicadores
                  </p>
                </div>
              </div>
              <CriteriosChart criterios={filteredCriterios} />
            </div>
          </div>
        );
      
      case 'alertas':
        return (
          <div className="space-y-6">
            <JardimBreadcrumb items={[{ label: 'Alertas' }]} />
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--border)]">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="figma:asset/4f3eac8f0c544542936be9cbdd5a45e730140e32.png" 
                  alt="Prefeitura de Jardim - CE" 
                  className="w-11 h-11 bg-white rounded-full p-1 shadow-sm"
                />
                <div>
                  <h2 className="text-2xl font-bold text-[var(--jardim-green)]">Central de Alertas</h2>
                  <p className="text-[var(--jardim-gray)]">
                    Gerencie todos os alertas e notificações do sistema
                  </p>
                </div>
              </div>
              <AlertsPanel alertas={alertas} onMarkAsRead={handleMarkAlertAsRead} />
            </div>
          </div>
        );
      
      case 'admin':
        return user?.role === 'admin' ? <AdminPanel /> : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Acesso negado. Apenas administradores.</p>
          </div>
        );
      
      default:
        return <Dashboard criterios={filteredCriterios} alertas={alertas} metricas={metricas} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--jardim-gray-light)] flex flex-col">
      <JardimHeader
        currentView={currentView}
        onViewChange={handleViewChange}
        alertCount={alertasNaoLidos.length}
      />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {renderContent()}
        </div>
      </main>

      <JardimFooter />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}