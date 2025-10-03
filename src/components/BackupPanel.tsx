import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Download, 
  Upload, 
  Database, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  Calendar,
  FileText,
  Package,
  RefreshCw,
  Shield,
  HardDrive,
  Trash2,
  Info
} from 'lucide-react';
import { toast } from '../utils/toast';
import { exportToExcel } from '../lib/exportExcel';
import { useBackupManager } from '../hooks/useBackupManager';
import { useBackupScheduler } from '../utils/backupScheduler';
import { Criterio, Alerta, User } from '../types';

interface BackupPanelProps {
  criterios: Criterio[];
  alertas: Alerta[];
  onDataRestore?: (data: any) => void;
}

export function BackupPanel({ criterios, alertas, onDataRestore }: BackupPanelProps) {
  const {
    backupHistory,
    isCreating,
    isRestoring,
    progress,
    settings,
    createBackup,
    restoreBackup,
    exportData,
    saveSettings,
    cleanOldBackups,
    getStats
  } = useBackupManager();

  const {
    configure: configureScheduler,
    getNextBackupTime,
    getTimeUntilNext,
    isActive: isSchedulerActive
  } = useBackupScheduler();

  const stats = getStats();

  // Criar backup manual
  const handleCreateBackup = useCallback(async (description?: string) => {
    await createBackup(criterios, alertas, [], description);
  }, [criterios, alertas, createBackup]);

  // Restaurar backup
  const handleRestoreBackup = useCallback(async (file: File) => {
    await restoreBackup(file, onDataRestore);
  }, [restoreBackup, onDataRestore]);

  // Exportar dados para Excel
  const exportToExcelBackup = useCallback(() => {
    try {
      exportToExcel(criterios);
      toast.success('Dados exportados para Excel com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      toast.error('Erro ao exportar para Excel');
    }
  }, [criterios]);

  // Atualizar configurações
  const updateSettings = useCallback((key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
    
    // Reconfigurar o scheduler quando necessário
    if (['autoBackupEnabled', 'backupFrequency', 'backupTime'].includes(key)) {
      configureScheduler({
        frequency: newSettings.backupFrequency,
        time: newSettings.backupTime,
        enabled: newSettings.autoBackupEnabled,
        onBackupNeeded: async () => {
          return await createBackup(criterios, alertas, [], 'Backup automático agendado', 'automatic');
        },
        onBackupSuccess: () => {
          console.log('✅ Backup automático executado com sucesso');
        },
        onBackupError: (error: string) => {
          console.error('❌ Erro no backup automático:', error);
        }
      });
    }
    
    if (key === 'autoBackupEnabled') {
      toast.success(value ? 'Backup automático ativado' : 'Backup automático desativado', {
        description: value ? `Backups ${newSettings.backupFrequency} às ${newSettings.backupTime}` : undefined
      });
    }
  }, [settings, saveSettings, configureScheduler, createBackup, criterios, alertas]);

  // Formatar tamanho de arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Estatísticas dos dados
  const dataStats = {
    totalCriterios: criterios.length,
    totalAlertas: alertas.length,
    criteriosAtivos: criterios.filter(c => c.status === 'ativo').length,
    alertasNaoLidos: alertas.filter(a => !a.lido).length,
    lastModified: criterios.length > 0 ? new Date(Math.max(...criterios.map(c => new Date(c.dataUltimaAtualizacao || c.dataVencimento).getTime()))).toLocaleDateString() : 'N/A'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--jardim-green)] mb-2">Sistema de Backup</h2>
        <p className="text-[var(--jardim-gray)]">
          Gerencie backups dos dados do sistema, configure backup automático e restaure dados quando necessário.
        </p>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-[var(--jardim-green)]" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Critérios</p>
                <p className="text-2xl font-bold">{dataStats.totalCriterios}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Alertas</p>
                <p className="text-2xl font-bold">{dataStats.totalAlertas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Último Backup</p>
                <p className="text-sm font-semibold">
                  {stats.lastBackupDate ? new Date(stats.lastBackupDate).toLocaleDateString() : 'Nunca'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Backup Automático</p>
                <div className="flex items-center space-x-2">
                  <Badge variant={settings.autoBackupEnabled ? "default" : "secondary"}>
                    {settings.autoBackupEnabled ? 'Ativo' : 'Inativo'}
                  </Badge>
                  {settings.autoBackupEnabled && isSchedulerActive() && (
                    <Badge variant="outline" className="text-xs">
                      {getTimeUntilNext() || 'Agendando...'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Criar Backup</TabsTrigger>
          <TabsTrigger value="restore">Restaurar</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Tab: Criar Backup */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Criar Novo Backup</span>
              </CardTitle>
              <CardDescription>
                Crie um backup completo dos dados do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isCreating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Criando backup...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => handleCreateBackup('Backup manual completo')}
                  disabled={isCreating}
                  className="h-20 flex-col space-y-2"
                >
                  <Download className="h-6 w-6" />
                  <span>Backup Completo (JSON)</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={exportToExcelBackup}
                  className="h-20 flex-col space-y-2"
                >
                  <FileText className="h-6 w-6" />
                  <span>Exportar Excel</span>
                </Button>
              </div>

              <Alert>
                <HardDrive className="h-4 w-4" />
                <AlertDescription>
                  O backup inclui todos os critérios, alertas e configurações do sistema. 
                  O arquivo será baixado automaticamente no formato JSON.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Restaurar */}
        <TabsContent value="restore" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Restaurar Backup</span>
              </CardTitle>
              <CardDescription>
                Restaure dados a partir de um arquivo de backup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atenção:</strong> A restauração substituirá todos os dados atuais do sistema. 
                  Certifique-se de ter um backup atual antes de prosseguir.
                </AlertDescription>
              </Alert>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione um arquivo de backup</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Arraste e solte um arquivo JSON de backup ou clique para selecionar
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleRestoreBackup(file);
                    }
                  }}
                  className="hidden"
                  id="backup-file-input"
                />
                <label htmlFor="backup-file-input">
                  <Button variant="outline" disabled={isRestoring} asChild>
                    <span>
                      {isRestoring ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Restaurando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Selecionar Arquivo
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Histórico */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Histórico de Backups</span>
              </CardTitle>
              <CardDescription>
                Visualize todos os backups criados recentemente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {backupHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Nenhum backup encontrado</p>
                  <p className="text-sm text-gray-500">Crie seu primeiro backup na aba "Criar Backup"</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {backupHistory.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          backup.status === 'success' ? 'bg-green-100 text-green-600' :
                          backup.status === 'error' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {backup.status === 'success' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : backup.status === 'error' ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{backup.fileName}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(backup.timestamp).toLocaleString()} • {formatFileSize(backup.size)} • {backup.records} registros
                          </p>
                          {backup.description && (
                            <p className="text-xs text-gray-500">{backup.description}</p>
                          )}
                          {backup.tags && backup.tags.length > 0 && (
                            <div className="flex space-x-1 mt-1">
                              {backup.tags.map((tag, index) => (
                                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          backup.type === 'manual' ? 'default' : 
                          backup.type === 'automatic' ? 'secondary' : 'outline'
                        }>
                          {backup.type === 'manual' ? 'Manual' : 
                           backup.type === 'automatic' ? 'Automático' : 'Agendado'}
                        </Badge>
                        <Badge variant={
                          backup.status === 'success' ? 'default' : 
                          backup.status === 'error' ? 'destructive' : 'secondary'
                        }>
                          {backup.status === 'success' ? 'Sucesso' :
                           backup.status === 'error' ? 'Erro' : 'Em andamento'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Configurações */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configurações de Backup</span>
              </CardTitle>
              <CardDescription>
                Configure as opções de backup automático e outras preferências
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Configurações de Backup Automático */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Backup Automático</h4>
                    <p className="text-sm text-gray-600">
                      Agendar backups automáticos do sistema
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoBackupEnabled}
                    onCheckedChange={(checked) => updateSettings('autoBackupEnabled', checked)}
                  />
                </div>

                {settings.autoBackupEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="backup-frequency">Frequência</Label>
                      <Select
                        value={settings.backupFrequency}
                        onValueChange={(value) => updateSettings('backupFrequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Diário</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="backup-time">Horário</Label>
                      <Select
                        value={settings.backupTime}
                        onValueChange={(value) => updateSettings('backupTime', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="02:00">02:00</SelectItem>
                          <SelectItem value="23:00">23:00</SelectItem>
                          <SelectItem value="01:00">01:00</SelectItem>
                          <SelectItem value="03:00">03:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Configurações Avançadas */}
              <div className="space-y-4">
                <h4 className="font-medium">Configurações Avançadas</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Incluir Dados de Usuário</Label>
                      <p className="text-xs text-gray-600">Salvar dados pessoais nos backups</p>
                    </div>
                    <Switch
                      checked={settings.includeUserData}
                      onCheckedChange={(checked) => updateSettings('includeUserData', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Compressão</Label>
                      <p className="text-xs text-gray-600">Reduzir tamanho dos arquivos</p>
                    </div>
                    <Switch
                      checked={settings.compressionEnabled}
                      onCheckedChange={(checked) => updateSettings('compressionEnabled', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Retenção de Backups (dias)</Label>
                  <Select
                    value={settings.retentionDays.toString()}
                    onValueChange={(value) => updateSettings('retentionDays', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="15">15 dias</SelectItem>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="60">60 dias</SelectItem>
                      <SelectItem value="90">90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Estatísticas e Limpeza */}
              <div className="space-y-4">
                <h4 className="font-medium">Estatísticas</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total de Backups:</span>
                    <span className="ml-2 font-medium">{stats.totalBackups}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Backups com Sucesso:</span>
                    <span className="ml-2 font-medium text-green-600">{stats.successfulBackups}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Backups com Erro:</span>
                    <span className="ml-2 font-medium text-red-600">{stats.failedBackups}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tamanho Total:</span>
                    <span className="ml-2 font-medium">{formatFileSize(stats.totalSizeBytes)}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cleanOldBackups}
                    className="flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Limpar Backups Antigos</span>
                  </Button>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Os backups são armazenados localmente. Para ambientes de produção, 
                  considere implementar backup em nuvem e configure alertas de monitoramento.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}