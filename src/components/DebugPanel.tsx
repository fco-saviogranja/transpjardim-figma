import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronRight, Bug, Copy, Check } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { toast } from '../utils/toast';

export const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const { user } = useAuth();
  const supabase = useSupabase();
  const { status } = useSystemStatus();

  // Só mostrar para administradores
  if (!user || user.role !== 'admin') {
    return null;
  }

  const testConnectivity = async () => {
    console.log('🧪 Testando conectividade...');
    setTesting(true);
    
    try {
      const response = await supabase.healthCheck();
      if (response.success) {
        console.log('✅ Teste de conectividade: Sucesso');
        toast.success('Conectividade OK: Servidor respondeu corretamente');
      } else {
        console.log('❌ Teste de conectividade: Falhou -', response.error);
        toast.error(`Falha na conectividade: ${response.error}`);
      }
    } catch (error) {
      console.error('💥 Erro no teste de conectividade:', error);
      toast.error(`Erro no teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setTesting(false);
    }
  };

  const collectDebugInfo = async () => {
    const info = {
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        role: user.role,
        name: user.name
      },
      browser: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        networkOnline: navigator.onLine,
        localStorage: Object.keys(localStorage).filter(key => key.startsWith('transpjardim')),
      },
      system: {
        backendOnline: status.backendOnline,
        lastChecked: status.lastChecked,
        checking: status.checking,
        error: status.error,
        initialized: status.initialized
      },
      supabase: {
        projectId: 'dpnvtorphsxrncqtojvp',
        healthCheckUrl: 'https://dpnvtorphsxrncqtojvp.supabase.co/functions/v1/make-server-225e1157/health',
        usersUrl: 'https://dpnvtorphsxrncqtojvp.supabase.co/functions/v1/make-server-225e1157/users'
      },
      healthCheck: null,
      usersFetch: null
    };

    try {
      console.log('🔍 Coletando informações de debug...');
      
      // Health Check
      const healthResponse = await supabase.healthCheck();
      info.healthCheck = {
        success: healthResponse.success,
        data: healthResponse.data,
        error: healthResponse.error
      };
      
      // Test da função getUsers
      try {
        const usersResponse = await supabase.getUsers();
        info.usersFetch = {
          success: usersResponse.success,
          dataLength: usersResponse.data?.length || 0,
          error: usersResponse.error
        };
      } catch (error) {
        info.usersFetch = {
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        };
      }
      
    } catch (error) {
      info.healthCheck = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }

    console.log('📊 Debug info coletado:', info);
    setDebugInfo(info);
  };

  const copyToClipboard = async () => {
    const textToCopy = JSON.stringify(debugInfo, null, 2);
    
    try {
      // Tentar usar Clipboard API primeiro
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Debug info copiado para o clipboard');
        return;
      }
      
      // Fallback: usar método deprecado mas compatível
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Debug info copiado para o clipboard');
      } catch (err) {
        console.error('Erro ao copiar:', err);
        // Criar modal para copiar manualmente
        const modal = document.createElement('div');
        modal.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
          background: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 80%;
          max-height: 80%;
          overflow: auto;
        `;
        
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.cssText = `
          width: 600px;
          height: 400px;
          font-family: monospace;
          font-size: 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Fechar';
        closeBtn.style.cssText = `
          margin-top: 10px;
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        `;
        
        closeBtn.onclick = () => document.body.removeChild(modal);
        modal.onclick = (e) => e.target === modal && document.body.removeChild(modal);
        
        content.appendChild(textarea);
        content.appendChild(closeBtn);
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        textarea.select();
      }
      
      document.body.removeChild(textArea);
    } catch (error) {
      console.error('Erro ao copiar para clipboard:', error);
      toast.error('Erro ao copiar. Verifique as permissões do navegador.');
    }
  };

  useEffect(() => {
    if (isOpen && !debugInfo) {
      collectDebugInfo();
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-white shadow-lg border-orange-200 text-orange-600 hover:bg-orange-50"
          >
            <Bug className="h-4 w-4 mr-2" />
            Debug
            {isOpen ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <Card className="mt-2 w-96 max-h-96 overflow-auto shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Debug do Sistema</CardTitle>
                  <CardDescription className="text-xs">
                    Informações técnicas para troubleshooting
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={testConnectivity}
                    disabled={testing}
                    title="Testar conectividade"
                  >
                    {testing ? '⏳' : '🧪'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    disabled={!debugInfo}
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {debugInfo ? (
                <>
                  {/* Status da Conexão */}
                  <div>
                    <div className="text-xs font-medium mb-1">Status Backend:</div>
                    <Badge variant={debugInfo.healthCheck?.success ? "default" : "destructive"}>
                      {debugInfo.healthCheck?.success ? "Online" : "Offline"}
                    </Badge>
                    {debugInfo.healthCheck?.error && (
                      <div className="text-xs text-red-600 mt-1 p-1 bg-red-50 rounded">
                        {debugInfo.healthCheck.error}
                      </div>
                    )}
                  </div>

                  {/* Usuário */}
                  <div>
                    <div className="text-xs font-medium mb-1">Usuário:</div>
                    <div className="text-xs">
                      <span className="font-medium">{debugInfo.user.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {debugInfo.user.role}
                      </Badge>
                    </div>
                  </div>

                  {/* API URL */}
                  <div>
                    <div className="text-xs font-medium mb-1">API URL:</div>
                    <div className="text-xs text-blue-600 bg-blue-50 p-1 rounded break-all">
                      {debugInfo.supabase.healthCheckUrl}
                    </div>
                  </div>

                  {/* Local Storage */}
                  <div>
                    <div className="text-xs font-medium mb-1">Local Storage:</div>
                    <div className="text-xs">
                      {debugInfo.browser.localStorage.length} chaves encontradas
                    </div>
                  </div>

                  {/* Botão para atualizar */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDebugInfo(null);
                      collectDebugInfo();
                    }}
                    className="w-full"
                  >
                    Atualizar Debug Info
                  </Button>
                </>
              ) : (
                <div className="text-xs text-center py-4">
                  Carregando informações de debug...
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};