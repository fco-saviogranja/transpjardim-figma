import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { Badge } from './ui/badge';

export const ConnectionIndicator = () => {
  const { status } = useSystemStatus();

  if (status.checking) {
    return (
      <Badge variant="secondary" className="flex items-center space-x-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-xs">Verificando...</span>
      </Badge>
    );
  }

  if (status.backendOnline) {
    return (
      <Badge variant="default" className="flex items-center space-x-1 bg-green-100 text-green-800">
        <Wifi className="h-3 w-3" />
        <span className="text-xs">Online</span>
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="flex items-center space-x-1 bg-blue-100 text-blue-800">
      <WifiOff className="h-3 w-3" />
      <span className="text-xs">Demo</span>
    </Badge>
  );
};