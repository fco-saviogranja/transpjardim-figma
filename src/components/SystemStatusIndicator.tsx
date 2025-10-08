import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  Wifi,
  WifiOff,
  Database,
  Cloud
} from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';

export const SystemStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [supabaseStatus, setSupabaseStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');
  const supabase = useSupabase();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkSupabaseStatus = async () => {
      if (!isOnline) {
        setSupabaseStatus('offline');
        return;
      }

      try {
        const health = await supabase.healthCheck();
        if (mounted) {
          setSupabaseStatus(health.success ? 'online' : 'offline');
        }
      } catch {
        if (mounted) {
          setSupabaseStatus('offline');
        }
      }
    };

    if (isOnline) {
      // Verificar imediatamente
      checkSupabaseStatus();
      
      // Verificar periodicamente quando online
      timeoutId = setInterval(checkSupabaseStatus, 30000); // 30s
    } else {
      setSupabaseStatus('offline');
    }

    return () => {
      mounted = false;
      if (timeoutId) {
        clearInterval(timeoutId);
      }
    };
  }, [isOnline, supabase]);

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: 'Offline',
        variant: 'secondary' as const,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700'
      };
    }

    if (supabaseStatus === 'online') {
      return {
        icon: Cloud,
        text: 'Online',
        variant: 'default' as const,
        bgColor: 'bg-green-100',
        textColor: 'text-green-700'
      };
    }

    return {
      icon: Database,
      text: 'Local',
      variant: 'secondary' as const,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700'
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Badge 
      variant={statusInfo.variant}
      className={`${statusInfo.bgColor} ${statusInfo.textColor} border-0 text-xs px-2 py-1`}
    >
      <StatusIcon className="h-3 w-3 mr-1" />
      <span className="hidden sm:inline">{statusInfo.text}</span>
    </Badge>
  );
};