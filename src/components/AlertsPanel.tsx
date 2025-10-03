import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertTriangle, CheckCircle, Clock, XCircle, Bell } from 'lucide-react';
import { Alerta } from '../types';

interface AlertsPanelProps {
  alertas: Alerta[];
  onMarkAsRead?: (alertaId: string) => void;
}

export const AlertsPanel = ({ alertas, onMarkAsRead }: AlertsPanelProps) => {
  const [showAll, setShowAll] = useState(false);
  
  const alertasNaoLidos = alertas.filter(a => !a.lido);
  const alertasExibir = showAll ? alertas : alertas.slice(0, 5);

  const getPriorityIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'média':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'baixa':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (prioridade: string) => {
    const variants = {
      alta: 'destructive',
      média: 'secondary',
      baixa: 'outline'
    } as const;

    return (
      <Badge variant={variants[prioridade as keyof typeof variants] || 'outline'}>
        {prioridade.charAt(0).toUpperCase() + prioridade.slice(1)}
      </Badge>
    );
  };

  const handleMarkAsRead = (alertaId: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(alertaId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas do Sistema
            {alertasNaoLidos.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alertasNaoLidos.length}
              </Badge>
            )}
          </CardTitle>
          
          {alertas.length > 5 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Mostrar Menos' : `Ver Todos (${alertas.length})`}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {alertasExibir.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>Nenhum alerta ativo no momento</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alertasExibir.map((alerta) => (
              <div
                key={alerta.id}
                className={`p-4 rounded-lg border transition-colors ${
                  alerta.lido ? 'bg-gray-50' : 'bg-white border-l-4 border-l-blue-500'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {getPriorityIcon(alerta.prioridade)}
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(alerta.prioridade)}
                        <Badge variant="outline" className="text-xs">
                          {alerta.tipo.charAt(0).toUpperCase() + alerta.tipo.slice(1)}
                        </Badge>
                        {!alerta.lido && (
                          <Badge variant="default" className="text-xs">
                            Novo
                          </Badge>
                        )}
                      </div>
                      
                      <p className={`text-sm ${alerta.lido ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {alerta.mensagem}
                      </p>
                      
                      <p className="text-xs text-muted-foreground">
                        {new Date(alerta.dataEnvio).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  {!alerta.lido && onMarkAsRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(alerta.id)}
                      className="text-xs"
                    >
                      Marcar como lido
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};