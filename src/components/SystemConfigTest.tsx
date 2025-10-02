import { useSystemConfig } from '../hooks/useSystemConfig';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Settings, CheckCircle, AlertTriangle } from 'lucide-react';

/**
 * Componente de teste para verificar se as configurações do sistema estão funcionando
 */
export const SystemConfigTest = () => {
  const { 
    config, 
    isLoading, 
    hasUnsavedChanges, 
    updateConfig, 
    saveConfig, 
    resetConfig 
  } = useSystemConfig();

  const handleTestUpdate = () => {
    updateConfig('siteName', `TranspJardim - Teste ${new Date().getTime()}`);
  };

  const handleTestSave = async () => {
    await saveConfig();
  };

  const handleTestReset = () => {
    resetConfig();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Teste de Configurações do Sistema</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant={isLoading ? "secondary" : "default"} className="flex items-center space-x-1 w-fit">
              {isLoading ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <CheckCircle className="h-3 w-3" />
              )}
              <span>{isLoading ? 'Carregando' : 'Pronto'}</span>
            </Badge>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Mudanças Pendentes</p>
            <Badge variant={hasUnsavedChanges ? "destructive" : "default"} className="w-fit">
              {hasUnsavedChanges ? 'Sim' : 'Não'}
            </Badge>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Nome do Site</p>
          <p className="font-medium">{config.siteName}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">E-mail Admin</p>
          <p className="font-medium">{config.adminEmail}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Modo Manutenção</p>
          <Badge variant={config.maintenanceMode ? "destructive" : "secondary"}>
            {config.maintenanceMode ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>

        <div className="flex space-x-2 pt-4">
          <Button
            onClick={handleTestUpdate}
            disabled={isLoading}
            size="sm"
          >
            Teste Atualizar
          </Button>
          
          <Button
            onClick={handleTestSave}
            disabled={!hasUnsavedChanges || isLoading}
            size="sm"
            variant="outline"
          >
            Teste Salvar
          </Button>
          
          <Button
            onClick={handleTestReset}
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            Teste Reset
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Este componente é apenas para testes. Pode ser removido em produção.</p>
        </div>
      </CardContent>
    </Card>
  );
};