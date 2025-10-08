import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  Database, 
  CloudUpload, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Server,
  Wifi,
  WifiOff,
  Download,
  Upload
} from 'lucide-react';
import { useHybridData } from '../hooks/useHybridData';
import { toast } from '../utils/toast';

interface MigrationStats {
  usuarios: { local: number; servidor: number; sincronizado: boolean };
  criterios: { local: number; servidor: number; sincronizado: boolean };
  alertas: { local: number; servidor: number; sincronizado: boolean };
}

export function MigrationPanel() {
  const { 
    state, 
    users, 
    criterios, 
    alertas, 
    checkConnectivity, 
    syncData, 
    initializeData 
  } = useHybridData();

  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [stats, setStats] = useState<MigrationStats>({
    usuarios: { local: 0, servidor: 0, sincronizado: false },
    criterios: { local: 0, servidor: 0, sincronizado: false },
    alertas: { local: 0, servidor: 0, sincronizado: false }
  });

  // Atualizar estatísticas
  useEffect(() => {
    setStats({
      usuarios: { 
        local: users.length, 
        servidor: state.isOnline ? users.length : 0, 
        sincronizado: state.dataSource === 'online' 
      },
      criterios: { 
        local: criterios.length, 
        servidor: state.isOnline ? criterios.length : 0, 
        sincronizado: state.dataSource === 'online' 
      },
      alertas: { 
        local: alertas.length, 
        servidor: state.isOnline ? alertas.length : 0, 
        sincronizado: state.dataSource === 'online' 
      }
    });
  }, [users, criterios, alertas, state]);

  const handleInitializeData = async () => {
    setMigrationStatus('running');
    setMigrationProgress(0);
    
    try {
      // Passo 1: Verificar conectividade
      setMigrationProgress(20);
      const isConnected = await checkConnectivity();
      
      if (!isConnected) {
        throw new Error('Sem conectividade com o servidor');
      }
      
      // Passo 2: Inicializar dados no servidor
      setMigrationProgress(50);
      const initResult = await initializeData();
      
      if (!initResult) {
        throw new Error('Falha na inicialização dos dados');
      }
      
      // Passo 3: Sincronizar dados
      setMigrationProgress(80);
      const syncResult = await syncData();
      
      if (!syncResult) {
        throw new Error('Falha na sincronização dos dados');
      }
      
      setMigrationProgress(100);
      setMigrationStatus('completed');
      toast.success('Migração concluída com sucesso!');
      
    } catch (error) {
      console.error('Erro na migração:', error);
      setMigrationStatus('error');
      toast.error(`Erro na migração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleSyncData = async () => {
    setMigrationStatus('running');
    setMigrationProgress(0);
    
    try {
      setMigrationProgress(30);
      const result = await syncData();
      
      if (result) {
        setMigrationProgress(100);
        setMigrationStatus('completed');
        toast.success('Sincronização concluída!');
      } else {
        throw new Error('Falha na sincronização');
      }
    } catch (error) {
      setMigrationStatus('error');
      toast.error('Erro na sincronização');
    }
  };

  const handleCheckConnectivity = async () => {
    try {
      await checkConnectivity();
      toast.success('Conectividade verificada');
    } catch (error) {
      toast.error('Erro ao verificar conectividade');
    }
  };

  const getStatusColor = (sincronizado: boolean) => {
    return sincronizado ? 'text-green-600' : 'text-orange-600';
  };

  const getStatusIcon = (sincronizado: boolean) => {
    return sincronizado ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Status da Conectividade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {state.isOnline ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-red-600" />}
            <span>Status da Conectividade</span>
          </CardTitle>
          <CardDescription>
            Status atual da conexão com o servidor Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant={state.isOnline ? "default" : "destructive"}>
                {state.isOnline ? 'Online' : 'Offline'}
              </Badge>
              <Badge variant="outline">
                Fonte: {state.dataSource === 'online' ? 'Servidor' : 'Local'}
              </Badge>
              {state.lastSync && (
                <span className="text-sm text-muted-foreground">
                  Última sync: {new Date(state.lastSync).toLocaleString('pt-BR')}
                </span>
              )}
            </div>
            <Button 
              onClick={handleCheckConnectivity}
              variant="outline" 
              size="sm"
              disabled={state.syncInProgress}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Verificar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas dos Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Estatísticas dos Dados</span>
          </CardTitle>
          <CardDescription>
            Comparação entre dados locais e do servidor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Usuários */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={getStatusColor(stats.usuarios.sincronizado)}>
                  {getStatusIcon(stats.usuarios.sincronizado)}
                </div>
                <div>
                  <p className="font-medium">Usuários</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.usuarios.local} registros locais
                  </p>
                </div>
              </div>
              <Badge variant={stats.usuarios.sincronizado ? "default" : "secondary"}>
                {stats.usuarios.sincronizado ? 'Sincronizado' : 'Local apenas'}
              </Badge>
            </div>

            {/* Critérios */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={getStatusColor(stats.criterios.sincronizado)}>
                  {getStatusIcon(stats.criterios.sincronizado)}
                </div>
                <div>
                  <p className="font-medium">Critérios</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.criterios.local} registros locais
                  </p>
                </div>
              </div>
              <Badge variant={stats.criterios.sincronizado ? "default" : "secondary"}>
                {stats.criterios.sincronizado ? 'Sincronizado' : 'Local apenas'}
              </Badge>
            </div>

            {/* Alertas */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={getStatusColor(stats.alertas.sincronizado)}>
                  {getStatusIcon(stats.alertas.sincronizado)}
                </div>
                <div>
                  <p className="font-medium">Alertas</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.alertas.local} registros locais
                  </p>
                </div>
              </div>
              <Badge variant={stats.alertas.sincronizado ? "default" : "secondary"}>
                {stats.alertas.sincronizado ? 'Sincronizado' : 'Local apenas'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progresso da Migração */}
      {migrationStatus === 'running' && (
        <Card>
          <CardHeader>
            <CardTitle>Progresso da Migração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={migrationProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {migrationProgress}% concluído
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações de Migração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CloudUpload className="w-5 h-5" />
            <span>Ações de Migração</span>
          </CardTitle>
          <CardDescription>
            Ferramentas para migrar e sincronizar dados com o servidor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inicializar Dados */}
            <Button
              onClick={handleInitializeData}
              disabled={migrationStatus === 'running' || !state.isOnline}
              className="h-auto p-4 flex flex-col items-start space-y-2"
              variant="default"
            >
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4" />
                <span className="font-medium">Inicializar Servidor</span>
              </div>
              <span className="text-sm opacity-90 text-left">
                Cria dados iniciais no servidor Supabase
              </span>
            </Button>

            {/* Sincronizar Dados */}
            <Button
              onClick={handleSyncData}
              disabled={migrationStatus === 'running' || !state.isOnline}
              className="h-auto p-4 flex flex-col items-start space-y-2"
              variant="outline"
            >
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span className="font-medium">Sincronizar Dados</span>
              </div>
              <span className="text-sm opacity-90 text-left">
                Atualiza dados locais com o servidor
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alertas e Informações */}
      {!state.isOnline && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            <strong>Modo Offline:</strong> O sistema está funcionando com dados locais. 
            Conecte-se à internet para sincronizar com o servidor.
          </AlertDescription>
        </Alert>
      )}

      {migrationStatus === 'completed' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Migração Concluída:</strong> Todos os dados foram sincronizados com sucesso. 
            O sistema agora está operando com dados do servidor.
          </AlertDescription>
        </Alert>
      )}

      {migrationStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro na Migração:</strong> Houve um problema durante a migração. 
            Verifique a conectividade e tente novamente.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}