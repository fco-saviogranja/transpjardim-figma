import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  Mail, 
  Zap, 
  RefreshCw,
  Settings,
  Info
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { sendTestEmail } from '../lib/emailService';

interface AutoConfigState {
  phase: 'idle' | 'testing' | 'configuring' | 'completed' | 'failed';
  testModeDetected: boolean;
  authorizedEmail: string;
  lastError: string;
  progress: number;
}

export function EmailAutoConfigHandler() {
  const [state, setState] = useState<AutoConfigState>({
    phase: 'idle',
    testModeDetected: false,
    authorizedEmail: '',
    lastError: '',
    progress: 0
  });

  const [autoConfigEnabled, setAutoConfigEnabled] = useState(() => {
    return localStorage.getItem('transpjardim-auto-email-config') !== 'false';
  });

  // Auto-configurar na primeira execução
  useEffect(() => {
    if (autoConfigEnabled && state.phase === 'idle') {
      // Aguardar um pouco antes de iniciar auto-config
      const timer = setTimeout(() => {
        handleAutoConfig();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [autoConfigEnabled, state.phase]);

  const handleAutoConfig = async () => {
    setState(prev => ({ ...prev, phase: 'testing', progress: 10 }));

    try {
      // Fase 1: Teste básico de conectividade
      setState(prev => ({ ...prev, progress: 25 }));
      
      console.log('🔧 [EmailAutoConfig] Iniciando auto-configuração...');
      
      // Testar com e-mail dummy para forçar detecção do modo de teste
      const testResult = await sendTestEmail('test@example.com');
      
      setState(prev => ({ ...prev, progress: 50 }));
      
      if (testResult.testMode && testResult.authorizedEmail) {
        // Modo de teste detectado!
        console.log('✅ [EmailAutoConfig] Modo de teste detectado:', testResult.authorizedEmail);
        
        setState(prev => ({ 
          ...prev, 
          phase: 'configuring',
          testModeDetected: true,
          authorizedEmail: testResult.authorizedEmail,
          progress: 75
        }));
        
        // Confirmar com teste final para o e-mail autorizado
        await sendTestEmail(testResult.authorizedEmail);
        
        setState(prev => ({ ...prev, phase: 'completed', progress: 100 }));
        
        // Mostrar notificação de sucesso
        toast.success('✅ Sistema de E-mail Auto-Configurado!', {
          description: `Modo de teste detectado. E-mails redirecionados para: ${testResult.authorizedEmail}`,
          duration: 8000
        });
        
        // Salvar configuração
        localStorage.setItem('transpjardim-email-auto-configured', 'true');
        localStorage.setItem('transpjardim-email-test-mode', 'true');
        localStorage.setItem('transpjardim-email-authorized', testResult.authorizedEmail);
        
      } else {
        // Modo de produção
        setState(prev => ({ ...prev, phase: 'completed', progress: 100 }));
        
        toast.success('✅ Sistema de E-mail Configurado!', {
          description: 'Sistema funcionando em modo de produção.',
          duration: 5000
        });
      }
      
    } catch (error) {
      console.error('❌ [EmailAutoConfig] Erro na auto-configuração:', error);
      
      setState(prev => ({ 
        ...prev, 
        phase: 'failed',
        lastError: error instanceof Error ? error.message : 'Erro desconhecido',
        progress: 0
      }));
      
      // Se for erro conhecido de modo de teste, ainda considerar como sucesso
      if (error instanceof Error && error.message.includes('You can only send testing emails')) {
        // Extrair e-mail autorizado do erro
        const emailMatch = error.message.match(/\(([^)]+)\)/);
        const authorizedEmail = emailMatch ? emailMatch[1] : '';
        
        if (authorizedEmail) {
          setState(prev => ({ 
            ...prev, 
            phase: 'completed',
            testModeDetected: true,
            authorizedEmail,
            progress: 100
          }));
          
          toast.success('✅ Sistema Auto-Configurado via Análise de Erro!', {
            description: `Modo de teste detectado: ${authorizedEmail}`,
            duration: 8000
          });
          
          localStorage.setItem('transpjardim-email-auto-configured', 'true');
          localStorage.setItem('transpjardim-email-test-mode', 'true');
          localStorage.setItem('transpjardim-email-authorized', authorizedEmail);
        }
      }
    }
  };

  const handleRetryConfig = () => {
    setState(prev => ({ ...prev, phase: 'idle', lastError: '', progress: 0 }));
    setTimeout(handleAutoConfig, 500);
  };

  const handleDisableAutoConfig = () => {
    setAutoConfigEnabled(false);
    localStorage.setItem('transpjardim-auto-email-config', 'false');
    setState(prev => ({ ...prev, phase: 'idle' }));
    
    toast.info('Auto-configuração desabilitada', {
      description: 'Você pode configurar manualmente no painel de administração.'
    });
  };

  // Não mostrar se já foi configurado ou se auto-config está desabilitado
  if (!autoConfigEnabled || localStorage.getItem('transpjardim-email-auto-configured') === 'true') {
    return null;
  }

  // Não mostrar se não está em fase de teste/configuração
  if (state.phase === 'idle' || state.phase === 'completed') {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900">Auto-Configuração de E-mail</CardTitle>
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
              {state.phase === 'testing' && 'Testando...'}
              {state.phase === 'configuring' && 'Configurando...'}
              {state.phase === 'failed' && 'Erro'}
            </Badge>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDisableAutoConfig}
            className="text-blue-600 hover:text-blue-800"
          >
            ✕
          </Button>
        </div>
        
        <CardDescription className="text-blue-700">
          {state.phase === 'testing' && 'Detectando configuração automática do sistema de e-mail...'}
          {state.phase === 'configuring' && 'Aplicando configurações detectadas...'}
          {state.phase === 'failed' && 'Falha na auto-configuração. Configuração manual necessária.'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso da Configuração</span>
            <span>{state.progress}%</span>
          </div>
          <Progress value={state.progress} className="h-2" />
        </div>

        {/* Estado atual */}
        <div className="space-y-3">
          {state.phase === 'testing' && (
            <div className="flex items-center space-x-2 text-blue-700">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Testando conectividade e modo de operação...</span>
            </div>
          )}

          {state.phase === 'configuring' && (
            <div className="flex items-center space-x-2 text-blue-700">
              <Zap className="h-4 w-4" />
              <span className="text-sm">
                Modo de teste detectado: {state.authorizedEmail}
              </span>
            </div>
          )}

          {state.phase === 'failed' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Erro:</strong> {state.lastError}
                <br />
                <small>Configure manualmente no painel de administração.</small>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Ações */}
        {state.phase === 'failed' && (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetryConfig}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDisableAutoConfig}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Configurar Manualmente
            </Button>
          </div>
        )}

        {/* Informação sobre o processo */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Como funciona:</strong>
            <br />
            1. Sistema testa conectividade com Resend
            <br />
            2. Detecta automaticamente se está em modo de teste
            <br />
            3. Configura redirecionamento automático se necessário
            <br />
            4. Sistema fica 100% funcional
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}