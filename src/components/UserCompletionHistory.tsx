import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';
import { Criterio, User } from '../types';

interface UserCompletionHistoryProps {
  criterios: Criterio[];
  user: User;
}

export function UserCompletionHistory({ criterios, user }: UserCompletionHistoryProps) {
  const userCompletions = useMemo(() => {
    return criterios
      .filter(criterio => criterio.conclusoesPorUsuario?.[user.id])
      .map(criterio => ({
        ...criterio,
        userCompletion: criterio.conclusoesPorUsuario![user.id]
      }))
      .sort((a, b) => {
        const dateA = a.userCompletion.dataConclusao ? new Date(a.userCompletion.dataConclusao) : new Date(0);
        const dateB = b.userCompletion.dataConclusao ? new Date(b.userCompletion.dataConclusao) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
  }, [criterios, user.id]);

  const completedCriterios = userCompletions.filter(c => c.userCompletion.concluido);
  const pendingCriterios = userCompletions.filter(c => !c.userCompletion.concluido);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (userCompletions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Critérios Concluídos */}
          <div>
            <h4 className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Concluídos ({completedCriterios.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {completedCriterios.map((criterio) => (
                <div key={criterio.id} className="p-3 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm truncate">{criterio.nome}</h5>
                      <p className="text-xs text-gray-600 mt-1">
                        {criterio.secretaria}
                      </p>
                      {criterio.userCompletion.dataConclusao && (
                        <p className="text-xs text-green-700 mt-1">
                          Concluído em {formatDate(criterio.userCompletion.dataConclusao)}
                        </p>
                      )}
                    </div>
                    <Badge variant="default" className="bg-green-600 text-white text-xs">
                      ✓
                    </Badge>
                  </div>
                </div>
              ))}
              
              {completedCriterios.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Nenhum critério concluído ainda
                </div>
              )}
            </div>
          </div>

          {/* Critérios Pendentes */}
          <div>
            <h4 className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-orange-600" />
              Em Andamento ({pendingCriterios.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {pendingCriterios.map((criterio) => (
                <div key={criterio.id} className="p-3 border rounded-lg bg-orange-50 border-orange-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm truncate">{criterio.nome}</h5>
                      <p className="text-xs text-gray-600 mt-1">
                        {criterio.secretaria}
                      </p>
                      <p className="text-xs text-orange-700 mt-1">
                        Vence em {new Date(criterio.dataVencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-orange-200 text-orange-800 text-xs">
                      Pendente
                    </Badge>
                  </div>
                </div>
              ))}
              
              {pendingCriterios.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Nenhum critério em andamento
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  );
}