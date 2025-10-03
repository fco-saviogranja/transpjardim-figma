import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export function EmailSystemMonitor() {
  const [status, setStatus] = useState<'checking' | 'operational' | 'test_mode' | 'error'>('checking');
  const [message, setMessage] = useState('Verificando sistema de e-mail...');
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    // Monitorar os logs do console para detectar o status do sistema
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    console.log = (...args) => {
      const message = args.join(' ');
      
      // Detectar mensagens de sucesso
      if (message.includes('✅') && message.includes('API Key válida')) {
        if (message.includes('modo de teste')) {
          setStatus('test_mode');
          setMessage('Sistema operacional em modo de teste');
          setDetails('E-mails limitados ao proprietário da conta Resend');
        } else {
          setStatus('operational');
          setMessage('Sistema de e-mail totalmente operacional');
          setDetails('Todos os recursos de e-mail disponíveis');
        }
      }
      
      // Detectar rate limiting (que é normal)
      if (message.includes('Rate limit atingido') || message.includes('rate_limit_exceeded')) {
        setStatus('operational');
        setMessage('Sistema operacional - Rate limit ativo');
        setDetails('Proteção contra spam funcionando corretamente');
      }

      originalConsoleLog(...args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      
      // Detectar erros reais de configuração
      if (message.includes('API Key não configurada') || 
          message.includes('formato inválido') ||
          message.includes('conectividade')) {
        setStatus('error');
        setMessage('Sistema de e-mail com problemas');
        setDetails('Verifique a configuração da API Key');
      }

      originalConsoleError(...args);
    };

    // Cleanup
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  }, []);

  // Não mostrar se ainda está verificando por muito tempo ou se está operacional
  if (status === 'checking' || status === 'operational') {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'test_mode':
        return {
          icon: <CheckCircle className="h-4 w-4 text-blue-600" />,
          className: 'border-blue-200 bg-blue-50',
          titleColor: 'text-blue-800',
          descColor: 'text-blue-700',
          badge: { text: 'Modo Teste', className: 'bg-blue-100 text-blue-800' }
        };
      case 'error':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
          className: 'border-red-200 bg-red-50',
          titleColor: 'text-red-800',
          descColor: 'text-red-700',
          badge: { text: 'Erro', className: 'bg-red-100 text-red-800' }
        };
      default:
        return {
          icon: <Clock className="h-4 w-4 text-yellow-600" />,
          className: 'border-yellow-200 bg-yellow-50',
          titleColor: 'text-yellow-800',
          descColor: 'text-yellow-700',
          badge: { text: 'Verificando', className: 'bg-yellow-100 text-yellow-800' }
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Alert className={`${config.className} mb-4`}>
      <div className="flex items-center space-x-2">
        {config.icon}
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className={`font-medium ${config.titleColor}`}>{message}</span>
            <Badge variant="outline" className={config.badge.className}>
              {config.badge.text}
            </Badge>
          </div>
          {details && (
            <p className={`text-sm ${config.descColor} mt-1`}>{details}</p>
          )}
        </div>
      </div>
    </Alert>
  );
}