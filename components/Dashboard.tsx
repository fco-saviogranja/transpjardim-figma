import { MetricsCards } from './MetricsCards';
import { CriteriosChart } from './CriteriosChart';
import { AlertsPanel } from './AlertsPanel';
import { JardimBreadcrumb } from './JardimBreadcrumb';
import { CriterioCompletionStatus } from './CriterioCompletionStatus';
import { Criterio, Alerta, Metricas, User } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import jardimLogo from 'figma:asset/4f3eac8f0c544542936be9cbdd5a45e730140e32.png';

interface DashboardProps {
  criterios: Criterio[];
  alertas: Alerta[];
  metricas: Metricas;
  user?: User | null;
  onMarkAlertAsRead?: (alertaId: string) => void;
  onToggleCompletion?: (criterioId: string, completed: boolean) => void;
}

export const Dashboard = ({ criterios, alertas, metricas, user, onMarkAlertAsRead, onToggleCompletion }: DashboardProps) => {
  // Critérios prioritários (próximos ao vencimento)
  const criteriosPrioritarios = criterios
    .filter(c => c.status === 'ativo' || c.status === 'pendente')
    .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: 'default',
      pendente: 'secondary',
      vencido: 'destructive',
      inativo: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  return (
    <div className="space-y-6">
      <JardimBreadcrumb items={[{ label: 'Dashboard' }]} />
      
      <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--border)]">
        <div className="flex items-center space-x-3 mb-4">
          <img 
            src={jardimLogo} 
            alt="Prefeitura de Jardim - CE" 
            className="w-12 h-12 bg-white rounded-full p-1 shadow-sm"
          />
          <div>
            <h2 className="text-2xl font-bold text-[var(--jardim-green)]">Indicadores de Transparência</h2>
            <p className="text-[var(--jardim-gray)]">
              Acompanhe os indicadores e critérios de transparência da Prefeitura de Jardim/CE
            </p>
          </div>
        </div>
      </div>

      {/* Métricas principais */}
      <MetricsCards metricas={metricas} />

      {/* Critérios Prioritários */}
      <Card className="shadow-sm border border-[var(--border)]">
        <CardHeader>
          <CardTitle className="text-xl text-[var(--jardim-green)]">
            Critérios Prioritários
          </CardTitle>
          <p className="text-sm text-[var(--jardim-gray)]">
            Critérios que requerem atenção imediata ou estão próximos ao vencimento
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criteriosPrioritarios.map((criterio) => (
              <div key={criterio.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{criterio.nome}</h4>
                    {getStatusBadge(criterio.status)}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Vence em: {new Date(criterio.dataVencimento).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {criterio.secretaria} • {criterio.responsavel}
                  </div>
                </div>
                
                {user && onToggleCompletion && (
                  <div className="ml-4">
                    <CriterioCompletionStatus
                      criterio={criterio}
                      user={user}
                      onToggleCompletion={onToggleCompletion}
                    />
                  </div>
                )}
              </div>
            ))}
            
            {criteriosPrioritarios.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                Nenhum critério prioritário no momento
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--border)]">
        <CriteriosChart criterios={criterios} />
      </div>

      {/* Alertas */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--border)]">
        <AlertsPanel alertas={alertas} onMarkAsRead={onMarkAlertAsRead} />
      </div>
    </div>
  );
};