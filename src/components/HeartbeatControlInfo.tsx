import { useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, Info, Settings, X } from 'lucide-react';
import { isDevelopment } from '../utils/environment';

export const HeartbeatControlInfo = () => {
  const [visible, setVisible] = useState(false);
  
  // Mostrar apenas em desenvolvimento e apenas uma vez por sessão
  useState(() => {
    if (isDevelopment() && typeof window !== 'undefined') {
      const sessionKey = 'transpjardim-heartbeat-info-shown';
      if (!sessionStorage.getItem(sessionKey)) {
        setVisible(true);
        sessionStorage.setItem(sessionKey, 'true');
      }
    }
  });

  if (!visible || !isDevelopment()) {
    return null;
  }

  const handleToggleHeartbeat = () => {
    if (typeof window !== 'undefined' && (window as any).transpjardimHeartbeat) {
      (window as any).transpjardimHeartbeat.toggle();
    }
  };

  const handleDisableHeartbeat = () => {
    if (typeof window !== 'undefined' && (window as any).transpjardimHeartbeat) {
      (window as any).transpjardimHeartbeat.disable();
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50 max-w-md">
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-800">
                Modo Desenvolvimento
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setVisible(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="text-sm text-blue-700 space-y-2">
              <p>
                <Heart className="h-3 w-3 inline mr-1" />
                Sistema de heartbeat {' '}
                <Badge variant="destructive" className="text-xs">
                  Desabilitado
                </Badge>
              </p>
              
              <p className="text-xs">
                O monitoramento está desabilitado para evitar alertas durante desenvolvimento.
              </p>
              
              <div className="text-xs space-y-1">
                <p><strong>Controles no console:</strong></p>
                <code className="block bg-blue-100 p-1 rounded text-xs">
                  transpjardimHeartbeat.enable() // Habilitar<br/>
                  transpjardimHeartbeat.forceStop() // Parar agora<br/>
                  transpjardimHeartbeat.status() // Ver status
                </code>
              </div>
              
              <p className="text-xs text-blue-600">
                ✨ Se não está vendo alertas de heartbeat, está funcionando corretamente!
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleToggleHeartbeat}
                className="text-xs h-7 bg-blue-50 text-blue-800 border-blue-200"
              >
                <Settings className="h-3 w-3 mr-1" />
                Alternar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setVisible(false)}
                className="text-xs h-7 text-blue-600"
              >
                Entendi
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};