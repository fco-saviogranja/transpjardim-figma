import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Database, Clock, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useBackupManager } from '../hooks/useBackupManager';

export function BackupNotification() {
  const { settings, getStats } = useBackupManager();
  const [isVisible, setIsVisible] = useState(false);
  const [notificationType, setNotificationType] = useState<'reminder' | 'success' | 'error'>('reminder');

  const stats = getStats();

  useEffect(() => {
    if (!settings.autoBackupEnabled) return;

    const checkBackupStatus = () => {
      if (!stats.lastBackupDate) {
        // Nunca fez backup
        setNotificationType('reminder');
        setIsVisible(true);
        return;
      }

      const lastBackup = new Date(stats.lastBackupDate);
      const now = new Date();
      const diffHours = (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60);
      
      let reminderThreshold = 24; // padrão: 24 horas
      if (settings.backupFrequency === 'weekly') {
        reminderThreshold = 7 * 24;
      } else if (settings.backupFrequency === 'monthly') {
        reminderThreshold = 30 * 24;
      }

      if (diffHours > reminderThreshold) {
        setNotificationType('reminder');
        setIsVisible(true);
      }
    };

    checkBackupStatus();
    
    // Verificar a cada hora
    const interval = setInterval(checkBackupStatus, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [settings, stats.lastBackupDate]);

  // Auto-hide após 10 segundos para notificações de sucesso
  useEffect(() => {
    if (notificationType === 'success' && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [notificationType, isVisible]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (notificationType) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getMessage = () => {
    switch (notificationType) {
      case 'success':
        return {
          title: 'Backup concluído com sucesso',
          description: `Backup automático ${settings.backupFrequency} realizado às ${new Date().toLocaleTimeString()}`
        };
      case 'error':
        return {
          title: 'Falha no backup automático',
          description: 'Verifique as configurações de backup no painel administrativo'
        };
      default:
        const lastBackup = stats.lastBackupDate ? new Date(stats.lastBackupDate).toLocaleDateString() : 'nunca';
        return {
          title: 'Lembrete de backup',
          description: `Último backup: ${lastBackup}. Considere fazer um backup manual dos dados.`
        };
    }
  };

  const message = getMessage();

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert className={`shadow-lg border-l-4 ${
        notificationType === 'success' ? 'border-l-green-500 bg-green-50' :
        notificationType === 'error' ? 'border-l-red-500 bg-red-50' :
        'border-l-blue-500 bg-blue-50'
      }`}>
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Database className="h-4 w-4" />
              <span className="font-medium">{message.title}</span>
              <Badge variant={
                notificationType === 'success' ? 'default' :
                notificationType === 'error' ? 'destructive' : 'secondary'
              }>
                {settings.backupFrequency}
              </Badge>
            </div>
            <AlertDescription className="text-sm">
              {message.description}
            </AlertDescription>
            {notificationType === 'reminder' && (
              <div className="flex space-x-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsVisible(false)}
                >
                  Dispensar
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    // Em uma implementação real, isso abriria o painel de backup
                    console.log('Abrindo painel de backup...');
                    setIsVisible(false);
                  }}
                >
                  Fazer Backup
                </Button>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}

// Hook para controlar as notificações programaticamente
export function useBackupNotifications() {
  const showSuccess = () => {
    // Implementar lógica para mostrar notificação de sucesso
    console.log('Backup realizado com sucesso!');
  };

  const showError = (error: string) => {
    // Implementar lógica para mostrar notificação de erro
    console.log('Erro no backup:', error);
  };

  const showReminder = () => {
    // Implementar lógica para mostrar lembrete
    console.log('Lembrete de backup');
  };

  return {
    showSuccess,
    showError,
    showReminder
  };
}