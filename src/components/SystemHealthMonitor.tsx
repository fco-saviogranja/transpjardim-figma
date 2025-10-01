import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { AlertCircle, CheckCircle, Clock, Database, Server, Wifi, WifiOff } from 'lucide-react';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { toast } from '../utils/toast';

export const SystemHealthMonitor = () => {
  const { status, checkStatus, isOnline, isOfflineMode } = useSystemStatus();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShownOfflineToast, setHasShownOfflineToast] = useState(false);

  // Verificar conectividade de rede
  const [networkOnline, setNetworkOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setNetworkOnline(true);
    const handleOffline = () => setNetworkOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mostrar toast apenas uma vez quando entrar em modo offline
  useEffect(() => {
    if (isOfflineMode && !hasShownOfflineToast && status.initialized) {
      toast.warning('Sistema funcionando em modo offline - dados salvos localmente');
      setHasShownOfflineToast(true);
    } else if (isOnline && hasShownOfflineToast) {
      // Reset do flag quando voltar online
      setHasShownOfflineToast(false);
    }
  }, [isOfflineMode, hasShownOfflineToast, status.initialized, isOnline]);

  const getStatusBadge = (online: boolean, checking: boolean = false) => {
    if (checking) {
      return <Badge variant="outline">Verificando...</Badge>;
    }
    return online 
      ? <Badge variant="secondary" className="bg-green-100 text-green-800">OK</Badge>
      : <Badge variant="destructive">Offline</Badge>;
  };

  const getOverallStatus = () => {
    if (status.checking) return 'checking';
    if (!isOnline || !networkOnline) return 'offline';
    return 'online';
  };

  const overallStatus = getOverallStatus();

  const handleRefresh = async () => {
    try {
      await checkStatus();
      toast.success('Status atualizado');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao verificar status do sistema');
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-20 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="shadow-lg"
        >
          {overallStatus === 'online' ? (
            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
          ) : overallStatus === 'offline' ? (
            <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
          ) : (
            <Clock className="w-4 h-4 text-blue-600 mr-2 animate-pulse" />
          )}
          Status do Sistema
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Card className="w-80 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Server className="w-4 h-4" />
              Status do Sistema
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              ×
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {networkOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                <span className="text-sm">Conectividade</span>
              </div>
              {getStatusBadge(networkOnline)}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                <span className="text-sm">Backend</span>
              </div>
              {getStatusBadge(isOnline, status.checking)}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span className="text-sm">Base de Dados</span>
              </div>
              {getStatusBadge(isOnline, status.checking)}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Armazenamento Local</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">OK</Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Última verificação:</span>
              <span>
                {status.lastChecked 
                  ? new Date(status.lastChecked).toLocaleTimeString('pt-BR')
                  : 'Nunca'
                }
              </span>
            </div>

            {status.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                <p className="text-xs text-red-800">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  {status.error}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={status.checking}
                className="flex-1"
              >
                {status.checking ? 'Verificando...' : 'Atualizar'}
              </Button>
            </div>

            {isOfflineMode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                <p className="text-xs text-yellow-800">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  Modo offline ativo - dados salvos localmente
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};