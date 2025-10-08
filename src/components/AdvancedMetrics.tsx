import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Criterio, User } from '../types';
import { TrendingUp, TrendingDown, Calendar, Users, Target, AlertTriangle } from 'lucide-react';

interface AdvancedMetricsProps {
  criterios: Criterio[];
  user: User | null;
}

export const AdvancedMetrics = ({ criterios, user }: AdvancedMetricsProps) => {
  const metrics = useMemo(() => {
    if (!criterios.length) {
      return {
        performancePorSecretaria: [],
        tendencias: {
          melhorias: 0,
          declinio: 0,
          estavel: 0
        },
        proximosVencimentos: [],
        eficienciaPorPeriodicidade: {},
        statusDistribution: {
          ativo: 0,
          pendente: 0,
          vencido: 0,
          inativo: 0
        }
      };
    }

    // Calcular performance por secretaria
    const secretariasMap = new Map<string, { total: number; valor: number; concluidos: number }>();
    
    criterios.forEach(criterio => {
      const key = criterio.secretaria;
      const current = secretariasMap.get(key) || { total: 0, valor: 0, concluidos: 0 };
      const isConcluido = user ? criterio.conclusoesPorUsuario?.[user.id]?.concluido || false : false;
      
      secretariasMap.set(key, {
        total: current.total + 1,
        valor: current.valor + criterio.valor,
        concluidos: current.concluidos + (isConcluido ? 1 : 0)
      });
    });

    const performancePorSecretaria = Array.from(secretariasMap.entries()).map(([secretaria, data]) => ({
      secretaria: secretaria.replace('Secretaria de ', ''),
      performance: Math.round((data.valor / data.total) || 0),
      concluidos: data.concluidos,
      total: data.total,
      percentualConclusao: Math.round((data.concluidos / data.total) * 100)
    })).sort((a, b) => b.performance - a.performance);

    // Calcular próximos vencimentos (próximos 30 dias)
    const hoje = new Date();
    const proximoMes = new Date();
    proximoMes.setDate(hoje.getDate() + 30);

    const proximosVencimentos = criterios
      .filter(c => {
        const vencimento = new Date(c.dataVencimento);
        return vencimento >= hoje && vencimento <= proximoMes && c.status !== 'vencido';
      })
      .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())
      .slice(0, 5);

    // Distribuição por status
    const statusDistribution = criterios.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Eficiência por periodicidade
    const periodicidadeMap = new Map<string, { total: number; valor: number }>();
    criterios.forEach(c => {
      const key = c.periodicidade;
      const current = periodicidadeMap.get(key) || { total: 0, valor: 0 };
      periodicidadeMap.set(key, {
        total: current.total + 1,
        valor: current.valor + c.valor
      });
    });

    const eficienciaPorPeriodicidade = Object.fromEntries(
      Array.from(periodicidadeMap.entries()).map(([key, data]) => [
        key,
        Math.round(data.valor / data.total)
      ])
    );

    return {
      performancePorSecretaria,
      proximosVencimentos,
      eficienciaPorPeriodicidade,
      statusDistribution
    };
  }, [criterios, user]);

  const getPeriodicidadeLabel = (periodicidade: string) => {
    const labels = {
      '15_dias': '15 dias',
      '30_dias': '30 dias',
      'mensal': 'Mensal',
      'bimestral': 'Bimestral',
      'semestral': 'Semestral',
      'anual': 'Anual'
    };
    return labels[periodicidade as keyof typeof labels] || periodicidade;
  };

  const getDiasParaVencimento = (dataVencimento: string) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diff = vencimento.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';  
      case 'vencido': return 'bg-red-100 text-red-800';
      case 'inativo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!criterios.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum critério disponível para análise</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance por Secretaria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Performance por Secretaria
          </CardTitle>
          <CardDescription>
            Desempenho médio de cada secretaria na execução dos critérios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.performancePorSecretaria.map((item, index) => (
              <div key={item.secretaria} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.secretaria}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.concluidos}/{item.total} concluídos
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.performance}%</span>
                    {index === 0 && <TrendingUp className="w-4 h-4 text-green-600" />}
                  </div>
                </div>
                <Progress value={item.performance} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Próximos Vencimentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Próximos Vencimentos
          </CardTitle>
          <CardDescription>
            Critérios que vencem nos próximos 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.proximosVencimentos.length > 0 ? (
            <div className="space-y-3">
              {metrics.proximosVencimentos.map(criterio => {
                const dias = getDiasParaVencimento(criterio.dataVencimento);
                return (
                  <div key={criterio.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{criterio.nome}</p>
                      <p className="text-xs text-muted-foreground">{criterio.secretaria}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={dias <= 7 ? "destructive" : dias <= 15 ? "secondary" : "outline"}>
                        {dias === 1 ? '1 dia' : `${dias} dias`}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum critério com vencimento próximo
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribuição por Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.statusDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <Badge className={getStatusColor(status)}>
                    {status.toUpperCase()}
                  </Badge>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Eficiência por Periodicidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Eficiência por Periodicidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.eficienciaPorPeriodicidade).map(([periodicidade, eficiencia]) => (
                <div key={periodicidade} className="flex items-center justify-between">
                  <span className="text-sm">{getPeriodicidadeLabel(periodicidade)}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{eficiencia}%</span>
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${eficiencia}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};