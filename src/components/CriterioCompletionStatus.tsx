import { useState } from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { toast } from 'sonner@2.0.3';
import { Criterio, User } from '../types';

interface CriterioCompletionStatusProps {
  criterio: Criterio;
  user: User;
  onToggleCompletion: (criterioId: string, completed: boolean) => void;
}

export function CriterioCompletionStatus({ 
  criterio, 
  user, 
  onToggleCompletion 
}: CriterioCompletionStatusProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const userCompletion = criterio.conclusoesPorUsuario?.[user.id];
  const isCompleted = userCompletion?.concluido || false;
  const completionDate = userCompletion?.dataConclusao;

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await onToggleCompletion(criterio.id, !isCompleted);
      
      // Mostrar notificação
      if (!isCompleted) {
        toast.success('Critério marcado como concluído!', {
          description: `"${criterio.nome}" foi marcado como concluído por você.`,
          action: {
            label: 'Reverter',
            onClick: () => onToggleCompletion(criterio.id, false),
          },
        });
      } else {
        toast.info('Critério desmarcado', {
          description: `"${criterio.nome}" foi removido dos seus critérios concluídos.`,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex items-center gap-3">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isCompleted ? "default" : "outline"}
              size="sm"
              onClick={handleToggle}
              disabled={isLoading}
              className={`flex items-center gap-2 transition-all duration-200 ${
                isCompleted 
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' 
                  : 'hover:bg-green-50 hover:border-green-300 text-gray-700'
              }`}
            >
              {isLoading ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : isCompleted ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
              {isCompleted ? 'Reverter' : 'Concluir'}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isCompleted 
                ? `Concluído por você${completionDate ? ` em ${formatDate(completionDate)}` : ''}. Clique para reverter.`
                : 'Clique para marcar este critério como concluído'
              }
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isCompleted && (
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 animate-pulse">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Concluído por mim
        </Badge>
      )}
    </div>
  );
}