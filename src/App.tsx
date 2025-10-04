import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthProvider } from './components/AuthProvider';
import { LoginForm } from './components/LoginForm';
import { JardimHeader } from './components/JardimHeader';
import { JardimFooter } from './components/JardimFooter';
import { JardimBreadcrumb } from './components/JardimBreadcrumb';
import { Dashboard } from './components/Dashboard';
import { CriteriosList } from './components/CriteriosList';
import { AdvancedAlertsPanel } from './components/AdvancedAlertsPanel';
import { AdminPanel } from './components/AdminPanel';
import { AdvancedMetrics } from './components/AdvancedMetrics';
import { Toaster } from './components/ui/sonner';
import { JardimLogo } from './components/JardimLogo';
import { useAuth } from './hooks/useAuth';
import { mockCriterios, mockAlertas, mockMetricas } from './lib/mockData';
import { Alerta, Criterio, Metricas } from './types';

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Estado inicial
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('transpjardim-current-view');
      const validViews = ['dashboard', 'criterios', 'alertas', 'admin', 'relatorios'];
      return validViews.includes(savedView || '') ? savedView : 'dashboard';
    }
    return 'dashboard';
  });
  
  const [alertas, setAlertas] = useState<Alerta[]>(mockAlertas);
  const [criterios, setCriterios] = useState<Criterio[]>(() => 
    mockCriterios.map(criterio => ({ ...criterio, meta: 100 }))
  );
  const [metricas, setMetricas] = useState<Metricas>(mockMetricas);

  // Navegação
  const handleViewChange = useCallback((newView: string) => {
    const validViews = ['dashboard', 'criterios', 'alertas', 'admin', 'relatorios'];
    if (!validViews.includes(newView)) return;
    
    if ((newView === 'admin' || newView === 'relatorios') && user?.role !== 'admin') return;
    
    setCurrentView(newView);
    if (typeof window !== 'undefined') {
      localStorage.setItem('transpjardim-current-view', newView);
    }
  }, [user?.role]);

  // Verificar permissões uma única vez
  useEffect(() => {
    if (user && currentView === 'admin' && user.role !== 'admin') {
      setCurrentView('dashboard');
      if (typeof window !== 'undefined') {
        localStorage.setItem('transpjardim-current-view', 'dashboard');
      }
    }
  }, [user]);

  // Carregar completions uma única vez
  useEffect(() => {
    if (user?.id && typeof window !== 'undefined') {
      try {
        const storageKey = `transpjardim-user-completions-${user.id}`;
        const savedCompletions = JSON.parse(localStorage.getItem(storageKey) || '{}');
        
        if (Object.keys(savedCompletions).length > 0) {
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
      } catch (error) {
        console.warn('Erro ao carregar completions:', error);
      }
    }
  }, [user?.id]);

  // Handlers
  const handleNewAlert = useCallback((novoAlerta: Alerta) => {
    setAlertas(prev => [novoAlerta, ...prev]);
  }, []);

  const handleMarkAlertAsRead = useCallback((alertaId: string) => {
    setAlertas(prev => 
      prev.map(alerta => 
        alerta.id === alertaId 
          ? { ...alerta, lido: !alerta.lido }
          : alerta
      )
    );
  }, []);

  const handleMarkAllAlertsAsRead = useCallback(() => {
    setAlertas(prev => prev.map(alerta => ({ ...alerta, lido: true })));
  }, []);

  const handleDeleteAlert = useCallback((alertaId: string) => {
    setAlertas(prev => prev.filter(alerta => alerta.id !== alertaId));
  }, []);

  const handleArchiveAlert = useCallback((alertaId: string) => {
    handleMarkAlertAsRead(alertaId);
  }, [handleMarkAlertAsRead]);

  const handleAddCriterio = useCallback((criterioData: Omit<Criterio, 'id'>) => {
    const newCriterio: Criterio = {
      ...criterioData,
      meta: 100,
      id: Date.now().toString()
    };
    setCriterios(prev => [...prev, newCriterio]);
  }, []);

  const handleEditCriterio = useCallback((id: string, criterioData: Omit<Criterio, 'id'>) => {
    setCriterios(prev => 
      prev.map(criterio => 
        criterio.id === id 
          ? { ...criterioData, meta: 100, id }
          : criterio
      )
    );
  }, []);

  const handleDeleteCriterio = useCallback((id: string) => {
    setCriterios(prev => prev.filter(criterio => criterio.id !== id));
    
    if (user?.id && typeof window !== 'undefined') {
      try {
        const storageKey = `transpjardim-user-completions-${user.id}`;
        const existingCompletions = JSON.parse(localStorage.getItem(storageKey) || '{}');
        delete existingCompletions[id];
        localStorage.setItem(storageKey, JSON.stringify(existingCompletions));
      } catch (error) {
        console.warn('Erro ao limpar completion:', error);
      }
    }
  }, [user?.id]);

  const handleToggleCriterioCompletion = useCallback((criterioId: string, completed: boolean) => {
    if (!user?.id) return;
    
    setCriterios(prev => 
      prev.map(criterio => {
        if (criterio.id === criterioId) {
          const updatedConclusoes = { ...criterio.conclusoesPorUsuario };
          
          updatedConclusoes[user.id] = {
            concluido: completed,
            dataConclusao: completed ? new Date().toISOString() : undefined
          };
          
          return {
            ...criterio,
            conclusoesPorUsuario: updatedConclusoes
          };
        }
        return criterio;
      })
    );
    
    // Persistir no localStorage
    try {
      const storageKey = `transpjardim-user-completions-${user.id}`;
      const existingCompletions = JSON.parse(localStorage.getItem(storageKey) || '{}');
      existingCompletions[criterioId] = {
        concluido: completed,
        dataConclusao: completed ? new Date().toISOString() : undefined
      };
      localStorage.setItem(storageKey, JSON.stringify(existingCompletions));
    } catch (error) {
      console.warn('Erro ao salvar completion:', error);
    }
  }, [user?.id]);

  // Cálculos simples
  const alertasNaoLidos = useMemo(() => alertas.filter(a => !a.lido), [alertas]);

  const filteredCriterios = useMemo(() => {
    if (!user?.id) return [];
    
    if (user.role === 'admin') {
      return criterios;
    }
    
    if (user.secretaria) {
      return criterios.filter(criterio => criterio.secretaria === user.secretaria);
    }
    
    return [];
  }, [user?.id, user?.role, user?.secretaria, criterios]);

  const calculatedMetricas = useMemo(() => {
    if (!user?.id || filteredCriterios.length === 0) {
      return {
        totalCriterios: 0,
        ativas: 0,
        pendentes: 0,
        vencidas: 0,
        percentualCumprimento: 0,
        alertasAtivos: alertasNaoLidos.length,
        criteriosConcluidos: 0,
        percentualConclusao: 0
      };
    }

    const criteriosConcluidos = filteredCriterios.filter(c => 
      c.conclusoesPorUsuario?.[user.id]?.concluido
    ).length;

    return {
      totalCriterios: filteredCriterios.length,
      ativas: filteredCriterios.filter(c => c.status === 'ativo').length,
      pendentes: filteredCriterios.filter(c => c.status === 'pendente').length,
      vencidas: filteredCriterios.filter(c => c.status === 'vencido').length,
      percentualCumprimento: filteredCriterios.length > 0 ? Math.round(
        filteredCriterios.reduce((acc, c) => acc + (c.valor / c.meta), 0) / filteredCriterios.length * 100
      ) : 0,
      alertasAtivos: alertasNaoLidos.length,
      criteriosConcluidos,
      percentualConclusao: filteredCriterios.length > 0 ? Math.round((criteriosConcluidos / filteredCriterios.length) * 100) : 0
    };
  }, [filteredCriterios, alertasNaoLidos, user?.id]);

  // Atualizar métricas
  useEffect(() => {
    setMetricas(calculatedMetricas);
  }, [calculatedMetricas]);

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

      case 'alertas':
        return (
          <div className="space-y-6">
            <JardimBreadcrumb items={[{ label: 'Alertas' }]} />
            
            <AdvancedAlertsPanel 
              alertas={alertas} 
              onMarkAsRead={handleMarkAlertAsRead}
              onMarkAllAsRead={handleMarkAllAlertsAsRead}
              onDeleteAlert={handleDeleteAlert}
              onArchiveAlert={handleArchiveAlert}
            />
          </div>
        );
      
      case 'admin':
        return user?.role === 'admin' ? <AdminPanel /> : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Acesso negado. Apenas administradores.</p>
          </div>
        );
      
      case 'relatorios':
        return user?.role === 'admin' ? (
          <div className="space-y-6">
            <JardimBreadcrumb items={[{ label: 'Relatórios Avançados' }]} />
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--border)]">
              <div className="flex items-center space-x-3 mb-6">
                <JardimLogo />
                <div>
                  <h2 className="text-2xl font-bold text-[var(--jardim-green)]">Relatórios Avançados</h2>
                  <p className="text-[var(--jardim-gray)]">
                    Análises detalhadas e métricas avançadas do sistema
                  </p>
                </div>
              </div>
              <AdvancedMetrics criterios={criterios} user={user} />
            </div>
          </div>
        ) : (
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