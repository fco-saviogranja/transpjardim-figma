import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, XCircle, Target } from 'lucide-react';
import { Metricas } from '../types';

interface MetricsCardsProps {
  metricas: Metricas;
}

export const MetricsCards = ({ metricas }: MetricsCardsProps) => {
  const cards = [
    {
      title: 'Total de Critérios',
      value: metricas.totalCriterios,
      icon: CheckCircle,
      color: 'text-[var(--jardim-green)]',
      bgColor: 'bg-[var(--jardim-green-lighter)]'
    },
    {
      title: 'Critérios Concluídos',
      value: metricas.criteriosConcluidos || 0,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Taxa de Conclusão',
      value: `${metricas.percentualConclusao || 0}%`,
      icon: metricas.percentualConclusao && metricas.percentualConclusao >= 70 ? TrendingUp : TrendingDown,
      color: metricas.percentualConclusao && metricas.percentualConclusao >= 70 ? 'text-[var(--jardim-green)]' : 'text-orange-600',
      bgColor: metricas.percentualConclusao && metricas.percentualConclusao >= 70 ? 'bg-[var(--jardim-green-lighter)]' : 'bg-orange-50'
    },
    {
      title: 'Pendentes',
      value: metricas.pendentes,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Vencidos',
      value: metricas.vencidas,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Alertas Ativos',
      value: metricas.alertasAtivos,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.title === 'Taxa de Conclusão' && (
                <Badge 
                  variant={metricas.percentualConclusao && metricas.percentualConclusao >= 70 ? 'default' : 'destructive'}
                  className="mt-1"
                >
                  {metricas.percentualConclusao && metricas.percentualConclusao >= 70 ? 'Excelente' : 'Pode Melhorar'}
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};