import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Save, 
  RefreshCw, 
  Bell, 
  Globe, 
  Shield, 
  Monitor, 
  Database,
  Mail,
  Clock,
  Settings,
  Palette,
  Users,
  AlertTriangle,
  CheckCircle,
  Info,
  Upload,
  Download
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { JardimLogo } from './JardimLogo';
import { useSystemConfig, SystemConfig } from '../hooks/useSystemConfig';



interface SystemSettingsProps {
  onSave?: (config: SystemConfig) => void;
}

export const SystemSettings = ({ onSave }: SystemSettingsProps) => {
  const {
    config,
    isLoading,
    hasUnsavedChanges,
    updateConfig,
    saveConfig,
    resetConfig,
    exportConfig,
    importConfig
  } = useSystemConfig();
  
  const [activeTab, setActiveTab] = useState('general');

  const handleConfigChange = (key: keyof SystemConfig, value: string | number | boolean) => {
    // Validação para campos numéricos
    if (typeof value === 'string' && ['sessionTimeout', 'maxLoginAttempts', 'cacheDuration', 'maxFileSize', 'backupRetention'].includes(key)) {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        updateConfig(key, numValue);
      }
    } else {
      updateConfig(key, value);
    }
  };

  const handleSave = async () => {
    const result = await saveConfig();
    if (result.success && onSave) {
      onSave(config);
    }
  };

  const handleReset = () => {
    resetConfig();
  };

  const handleExport = () => {
    exportConfig();
  };

  const handleImport = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          await importConfig(file);
        }
      };
      input.click();
    } catch (error) {
      console.error('Erro ao abrir seletor de arquivo:', error);
      toast.error('Erro ao abrir seletor de arquivo');
    }
  };

  const tabs = [
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'system', label: 'Sistema', icon: Monitor },
    { id: 'backup', label: 'Backup', icon: Database },
    { id: 'appearance', label: 'Aparência', icon: Palette }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="siteName">Nome do Site</Label>
          <Input
            id="siteName"
            value={config.siteName}
            onChange={(e) => handleConfigChange('siteName', e.target.value)}
            placeholder="Nome do site"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="adminEmail">E-mail do Administrador</Label>
          <Input
            id="adminEmail"
            type="email"
            value={config.adminEmail}
            onChange={(e) => handleConfigChange('adminEmail', e.target.value)}
            placeholder="admin@exemplo.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="siteDescription">Descrição do Site</Label>
        <Textarea
          id="siteDescription"
          value={config.siteDescription}
          onChange={(e) => handleConfigChange('siteDescription', e.target.value)}
          placeholder="Descrição do site"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="timezone">Fuso Horário</Label>
          <Select 
            value={config.timezone} 
            onValueChange={(value) => handleConfigChange('timezone', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o fuso horário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Fortaleza">América/Fortaleza (UTC-3)</SelectItem>
              <SelectItem value="America/Sao_Paulo">América/São Paulo (UTC-3)</SelectItem>
              <SelectItem value="America/Recife">América/Recife (UTC-3)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultLanguage">Idioma Padrão</Label>
          <Select 
            value={config.defaultLanguage} 
            onValueChange={(value) => handleConfigChange('defaultLanguage', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="es-ES">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Notificações por E-mail</Label>
          <p className="text-sm text-muted-foreground">
            Receber notificações importantes por e-mail
          </p>
        </div>
        <Switch
          checked={config.emailNotifications}
          onCheckedChange={(checked) => handleConfigChange('emailNotifications', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Notificações Push</Label>
          <p className="text-sm text-muted-foreground">
            Receber notificações em tempo real no navegador
          </p>
        </div>
        <Switch
          checked={config.pushNotifications}
          onCheckedChange={(checked) => handleConfigChange('pushNotifications', checked)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="alertsEmail">E-mail para Alertas</Label>
        <Input
          id="alertsEmail"
          type="email"
          value={config.alertsEmail}
          onChange={(e) => handleConfigChange('alertsEmail', e.target.value)}
          placeholder="alertas@exemplo.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notificationFrequency">Frequência de Notificações</Label>
        <Select 
          value={config.notificationFrequency} 
          onValueChange={(value) => handleConfigChange('notificationFrequency', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a frequência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="immediate">Imediata</SelectItem>
            <SelectItem value="hourly">A cada hora</SelectItem>
            <SelectItem value="daily">Diária</SelectItem>
            <SelectItem value="weekly">Semanal</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sessionTimeout">Timeout da Sessão (minutos)</Label>
          <Input
            id="sessionTimeout"
            type="number"
            value={config.sessionTimeout}
            onChange={(e) => handleConfigChange('sessionTimeout', parseInt(e.target.value) || 480)}
            min="30"
            max="1440"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxLoginAttempts">Máximo de Tentativas de Login</Label>
          <Input
            id="maxLoginAttempts"
            type="number"
            value={config.maxLoginAttempts}
            onChange={(e) => handleConfigChange('maxLoginAttempts', parseInt(e.target.value) || 5)}
            min="3"
            max="10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="passwordComplexity">Complexidade de Senha</Label>
        <Select 
          value={config.passwordComplexity} 
          onValueChange={(value) => handleConfigChange('passwordComplexity', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a complexidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baixa (mínimo 6 caracteres)</SelectItem>
            <SelectItem value="medium">Média (8 caracteres, letras e números)</SelectItem>
            <SelectItem value="high">Alta (10 caracteres, letras, números e símbolos)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Autenticação de Dois Fatores</Label>
          <p className="text-sm text-muted-foreground">
            Obrigar 2FA para todos os usuários
          </p>
        </div>
        <Switch
          checked={config.twoFactorRequired}
          onCheckedChange={(checked) => handleConfigChange('twoFactorRequired', checked)}
        />
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Modo de Manutenção</Label>
          <p className="text-sm text-muted-foreground">
            Desabilitar acesso para usuários não-admin
          </p>
        </div>
        <Switch
          checked={config.maintenanceMode}
          onCheckedChange={(checked) => handleConfigChange('maintenanceMode', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Modo Debug</Label>
          <p className="text-sm text-muted-foreground">
            Exibir informações de debug (apenas desenvolvimento)
          </p>
        </div>
        <Switch
          checked={config.debugMode}
          onCheckedChange={(checked) => handleConfigChange('debugMode', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Permitir Registro</Label>
          <p className="text-sm text-muted-foreground">
            Permitir que novos usuários se registrem
          </p>
        </div>
        <Switch
          checked={config.allowRegistration}
          onCheckedChange={(checked) => handleConfigChange('allowRegistration', checked)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cacheDuration">Duração do Cache (segundos)</Label>
          <Input
            id="cacheDuration"
            type="number"
            value={config.cacheDuration}
            onChange={(e) => handleConfigChange('cacheDuration', parseInt(e.target.value) || 3600)}
            min="300"
            max="86400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxFileSize">Tamanho Máximo de Arquivo (MB)</Label>
          <Input
            id="maxFileSize"
            type="number"
            value={config.maxFileSize}
            onChange={(e) => handleConfigChange('maxFileSize', parseInt(e.target.value) || 50)}
            min="1"
            max="500"
          />
        </div>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Backup Automático</Label>
          <p className="text-sm text-muted-foreground">
            Executar backups automaticamente
          </p>
        </div>
        <Switch
          checked={config.autoBackup}
          onCheckedChange={(checked) => handleConfigChange('autoBackup', checked)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="backupFrequency">Frequência do Backup</Label>
        <Select 
          value={config.backupFrequency} 
          onValueChange={(value) => handleConfigChange('backupFrequency', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a frequência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hourly">A cada hora</SelectItem>
            <SelectItem value="daily">Diário</SelectItem>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="monthly">Mensal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="backupRetention">Retenção de Backup (dias)</Label>
        <Input
          id="backupRetention"
          type="number"
          value={config.backupRetention}
          onChange={(e) => handleConfigChange('backupRetention', parseInt(e.target.value) || 30)}
          min="7"
          max="365"
        />
        <p className="text-sm text-muted-foreground">
          Backups mais antigos que este período serão removidos automaticamente
        </p>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="primaryColor">Cor Primária</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="primaryColor"
            type="color"
            value={config.primaryColor}
            onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
            className="w-20 h-10"
          />
          <Input
            value={config.primaryColor}
            onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
            placeholder="#4a7c59"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="logoUrl">URL do Logo</Label>
        <Input
          id="logoUrl"
          value={config.logoUrl}
          onChange={(e) => handleConfigChange('logoUrl', e.target.value)}
          placeholder="https://exemplo.com/logo.png"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Habilitar Modo Escuro</Label>
          <p className="text-sm text-muted-foreground">
            Permitir que usuários usem tema escuro
          </p>
        </div>
        <Switch
          checked={config.enableDarkMode}
          onCheckedChange={(checked) => handleConfigChange('enableDarkMode', checked)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customCSS">CSS Customizado</Label>
        <Textarea
          id="customCSS"
          value={config.customCSS || ''}
          onChange={(e) => handleConfigChange('customCSS', e.target.value)}
          placeholder="/* CSS customizado */&#10;.custom-class {&#10;  color: #333;&#10;}"
          rows={8}
          className="font-mono text-sm"
        />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'system':
        return renderSystemSettings();
      case 'backup':
        return renderBackupSettings();
      case 'appearance':
        return renderAppearanceSettings();
      default:
        return renderGeneralSettings();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--border)]">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[var(--jardim-green)]" />
              <p className="text-muted-foreground">Carregando configurações...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--border)]">
        <div className="flex items-center space-x-3 mb-4">
          <JardimLogo />
          <div>
            <h2 className="text-2xl font-bold text-[var(--jardim-green)]">Configurações do Sistema</h2>
            <p className="text-[var(--jardim-gray)]">
              Gerencie as configurações gerais da plataforma TranspJardim
            </p>
          </div>
        </div>

        {/* Status de Mudanças */}
        {hasUnsavedChanges && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Você tem alterações não salvas. Clique em "Salvar Configurações" para aplicá-las.
            </AlertDescription>
          </Alert>
        )}

        {/* Botões de Ação */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Salvar Configurações</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Restaurar Padrões</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleImport}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Importar</span>
          </Button>
        </div>
      </div>

      {/* Tabs de Configuração */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--border)]">
        {/* Tab Navigation */}
        <div className="border-b border-[var(--border)]">
          <nav className="flex space-x-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                    isActive
                      ? 'border-[var(--jardim-green)] text-[var(--jardim-green)]'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Informações do Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Versão</Label>
              <p className="font-medium">TranspJardim v2.0.0</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Última Atualização</Label>
              <p className="font-medium">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Status</Label>
              <Badge variant="default" className="flex items-center space-x-1 w-fit">
                <CheckCircle className="h-3 w-3" />
                <span>Operacional</span>
              </Badge>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Modo Manutenção</Label>
              <Badge variant={config.maintenanceMode ? "destructive" : "secondary"} className="w-fit">
                {config.maintenanceMode ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Backup Automático</Label>
              <Badge variant={config.autoBackup ? "default" : "secondary"} className="w-fit">
                {config.autoBackup ? "Ativado" : "Desativado"}
              </Badge>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Configurações Salvas</Label>
              <Badge variant={hasUnsavedChanges ? "destructive" : "default"} className="w-fit">
                {hasUnsavedChanges ? "Pendentes" : "Sincronizadas"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};