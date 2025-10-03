import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Settings, 
  Bell, 
  AlertTriangle, 
  Clock, 
  Mail, 
  Shield,
  Plus,
  Trash2,
  Edit,
  Save,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { BusinessDaysTest } from './BusinessDaysTest';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: 'vencimento' | 'meta' | 'status' | 'inatividade';
  condition: {
    days?: number;
    percentage?: number;
    status?: string;
  };
  priority: 'alta' | 'média' | 'baixa';
  secretarias: string[];
  template: string;
  notifications: {
    dashboard: boolean;
    email: boolean; // Sempre obrigatório
    push: boolean;
  };
  businessDaysOnly: boolean; // Enviar apenas em dias úteis
}

interface UserNotificationSettings {
  userId: string;
  dashboard: boolean;
  email: boolean;
  push: boolean;
  frequency: 'imediato' | 'diario' | 'semanal';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const defaultRules: AlertRule[] = [
  {
    id: '1',
    name: 'Critérios Vencidos',
    description: 'Alerta quando um critério vence (envio apenas em dias úteis)',
    enabled: true,
    trigger: 'vencimento',
    condition: { days: 0 },
    priority: 'alta',
    secretarias: [],
    template: 'Critério "{nome}" venceu em {dataVencimento}',
    notifications: { dashboard: true, email: true, push: false },
    businessDaysOnly: true
  },
  {
    id: '2',
    name: 'Vencimento Próximo',
    description: 'Alerta 7 dias antes do vencimento (envio apenas em dias úteis)',
    enabled: true,
    trigger: 'vencimento',
    condition: { days: 7 },
    priority: 'média',
    secretarias: [],
    template: 'Critério "{nome}" vence em {diasRestantes} dias',
    notifications: { dashboard: true, email: true, push: false },
    businessDaysOnly: true
  },
  {
    id: '3',
    name: 'Meta Baixa',
    description: 'Alerta quando critério está abaixo de 50% da meta',
    enabled: true,
    trigger: 'meta',
    condition: { percentage: 50 },
    priority: 'alta',
    secretarias: [],
    template: 'Critério "{nome}" está {percentual}% abaixo da meta',
    notifications: { dashboard: true, email: true, push: false },
    businessDaysOnly: true
  },
  {
    id: '4',
    name: 'Inatividade Prolongada',
    description: 'Alerta quando critério não é atualizado há 30 dias',
    enabled: false,
    trigger: 'inatividade',
    condition: { days: 30 },
    priority: 'baixa',
    secretarias: [],
    template: 'Critério "{nome}" sem atualizações há {diasInativo} dias',
    notifications: { dashboard: true, email: true, push: false },
    businessDaysOnly: true
  }
];

const secretarias = [
  'Secretaria de Educação',
  'Secretaria de Saúde',
  'Secretaria de Obras e Infraestrutura',
  'Secretaria de Meio Ambiente',
  'Secretaria de Habitação e Desenvolvimento Social',
  'Secretaria de Agricultura e Desenvolvimento Rural',
  'Secretaria de Cultura, Esporte e Lazer',
  'Secretaria de Administração e Finanças',
  'Secretaria de Assistência Social',
  'Secretaria de Turismo e Desenvolvimento Econômico'
];

export const AlertsConfigPanel = () => {
  const [rules, setRules] = useState<AlertRule[]>(defaultRules);
  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({});

  // Configurações globais
  const [globalSettings, setGlobalSettings] = useState({
    alertsEnabled: true,
    maxAlertsPerDay: 50,
    autoCleanupDays: 30,
    debugMode: false,
    businessDaysOnly: true, // Padrão: alertas apenas em dias úteis
    emailRequired: true // E-mail sempre obrigatório
  });

  // Configurações do usuário
  const [userSettings, setUserSettings] = useState<UserNotificationSettings>({
    userId: '1',
    dashboard: true,
    email: false,
    push: false,
    frequency: 'imediato',
    quietHours: { enabled: false, start: '22:00', end: '08:00' }
  });

  const handleSaveRule = (rule: AlertRule) => {
    if (selectedRule) {
      setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
      toast.success('Regra de alerta atualizada com sucesso!');
    } else {
      const newRuleWithId = { ...rule, id: Date.now().toString() };
      setRules(prev => [...prev, newRuleWithId]);
      toast.success('Nova regra de alerta criada!');
    }
    setSelectedRule(null);
    setIsEditing(false);
    setNewRule({});
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
    toast.success('Regra de alerta removida!');
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    setRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, enabled } : r
    ));
    toast.success(`Regra ${enabled ? 'ativada' : 'desativada'}!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--jardim-green)]">
            Configurações de Alertas
          </h2>
          <p className="text-[var(--jardim-gray)]">
            Configure regras automáticas e personalize notificações
          </p>
        </div>
        <Button 
          onClick={() => setIsEditing(true)}
          className="bg-[var(--jardim-green)] hover:bg-[var(--jardim-green-light)]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Regra
        </Button>
      </div>

      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="rules">Regras de Alertas</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="global">Configurações Globais</TabsTrigger>
          <TabsTrigger value="test">Teste Dias Úteis</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* TAB: Regras de Alertas */}
        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-4">
            {rules.map((rule) => (
              <Card key={rule.id} className="border-l-4 border-l-[var(--jardim-green)]">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                          {rule.enabled ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {rule.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {rule.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Trigger: {rule.trigger}</span>
                        {rule.condition.days && <span>Dias: {rule.condition.days}</span>}
                        {rule.condition.percentage && <span>Meta: {rule.condition.percentage}%</span>}
                        {rule.businessDaysOnly && <span>📅 Dias úteis</span>}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        {rule.notifications.dashboard && <Badge variant="outline" className="text-xs">Dashboard</Badge>}
                        {rule.notifications.email && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            ✉️ Email (Obrigatório)
                          </Badge>
                        )}
                        {rule.notifications.push && <Badge variant="outline" className="text-xs">Push</Badge>}
                        {rule.businessDaysOnly && (
                          <Badge variant="secondary" className="text-xs">
                            📅 Apenas dias úteis
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRule(rule);
                          setIsEditing(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB: Configurações de Notificação */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Dashboard</Label>
                  <Switch
                    checked={userSettings.dashboard}
                    onCheckedChange={(checked) => 
                      setUserSettings(prev => ({ ...prev, dashboard: checked }))
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Switch
                    checked={userSettings.email}
                    onCheckedChange={(checked) => 
                      setUserSettings(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Push Notifications</Label>
                  <Switch
                    checked={userSettings.push}
                    onCheckedChange={(checked) => 
                      setUserSettings(prev => ({ ...prev, push: checked }))
                    }
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="frequency">Frequência de Notificações</Label>
                  <Select
                    value={userSettings.frequency}
                    onValueChange={(value: 'imediato' | 'diario' | 'semanal') =>
                      setUserSettings(prev => ({ ...prev, frequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="imediato">Imediato</SelectItem>
                      <SelectItem value="diario">Resumo Diário</SelectItem>
                      <SelectItem value="semanal">Resumo Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={userSettings.quietHours.enabled}
                      onCheckedChange={(checked) =>
                        setUserSettings(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, enabled: checked }
                        }))
                      }
                    />
                    <Label>Modo Silencioso (Horário de Descanso)</Label>
                  </div>
                  
                  {userSettings.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label htmlFor="start">Início</Label>
                        <Input
                          id="start"
                          type="time"
                          value={userSettings.quietHours.start}
                          onChange={(e) =>
                            setUserSettings(prev => ({
                              ...prev,
                              quietHours: { ...prev.quietHours, start: e.target.value }
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="end">Fim</Label>
                        <Input
                          id="end"
                          type="time"
                          value={userSettings.quietHours.end}
                          onChange={(e) =>
                            setUserSettings(prev => ({
                              ...prev,
                              quietHours: { ...prev.quietHours, end: e.target.value }
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={() => toast.success('Configurações de notificação salvas!')}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Configurações Globais */}
        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure o comportamento global do sistema de alertas
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sistema de Alertas Ativo</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilita/desabilita todo o sistema de alertas
                    </p>
                  </div>
                  <Switch
                    checked={globalSettings.alertsEnabled}
                    onCheckedChange={(checked) =>
                      setGlobalSettings(prev => ({ ...prev, alertsEnabled: checked }))
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxAlerts">Máximo de Alertas por Dia</Label>
                  <Input
                    id="maxAlerts"
                    type="number"
                    value={globalSettings.maxAlertsPerDay}
                    onChange={(e) =>
                      setGlobalSettings(prev => ({ ...prev, maxAlertsPerDay: parseInt(e.target.value) }))
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cleanup">Limpeza Automática (dias)</Label>
                  <Input
                    id="cleanup"
                    type="number"
                    value={globalSettings.autoCleanupDays}
                    onChange={(e) =>
                      setGlobalSettings(prev => ({ ...prev, autoCleanupDays: parseInt(e.target.value) }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Alertas lidos serão removidos automaticamente após este período
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Apenas Dias Úteis</Label>
                    <p className="text-sm text-muted-foreground">
                      Alertas enviados apenas em dias úteis (segunda a sexta, exceto feriados)
                    </p>
                  </div>
                  <Switch
                    checked={globalSettings.businessDaysOnly}
                    onCheckedChange={(checked) =>
                      setGlobalSettings(prev => ({ ...prev, businessDaysOnly: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>E-mail Obrigatório</Label>
                    <p className="text-sm text-muted-foreground">
                      Todos os alertas devem incluir notificação por e-mail
                    </p>
                  </div>
                  <Switch
                    checked={globalSettings.emailRequired}
                    onCheckedChange={(checked) =>
                      setGlobalSettings(prev => ({ ...prev, emailRequired: checked }))
                    }
                    disabled={true} // Sempre obrigatório
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo Debug</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibe logs detalhados no console
                    </p>
                  </div>
                  <Switch
                    checked={globalSettings.debugMode}
                    onCheckedChange={(checked) =>
                      setGlobalSettings(prev => ({ ...prev, debugMode: checked }))
                    }
                  />
                </div>
              </div>
              
              <Button 
                onClick={() => toast.success('Configurações globais salvas!')}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informações sobre Dias Úteis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Como funciona o sistema de dias úteis:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Dias úteis:</strong> Segunda a sexta-feira, exceto feriados</li>
                  <li>• <strong>Feriados considerados:</strong> Nacionais, estaduais (CE) e municipais (Jardim/CE)</li>
                  <li>• <strong>Alertas de fim de semana:</strong> Enviados na próxima segunda-feira</li>
                  <li>• <strong>Alertas de feriados:</strong> Enviados no próximo dia útil</li>
                  <li>• <strong>E-mails obrigatórios:</strong> Todos os alertas ativos incluem notificação por e-mail</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-semibold mb-2">Feriados Nacionais Inclusos:</h5>
                  <div className="space-y-1 text-muted-foreground">
                    <p>• Confraternização Universal (01/01)</p>
                    <p>• Tiradentes (21/04)</p>
                    <p>• Independência do Brasil (07/09)</p>
                    <p>• Nossa Sra. Aparecida (12/10)</p>
                    <p>• Finados (02/11)</p>
                    <p>• Proclamação da República (15/11)</p>
                    <p>• Natal (25/12)</p>
                    <p>• Carnaval, Sexta-feira Santa, Páscoa e Corpus Christi</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold mb-2">Feriados do Ceará:</h5>
                  <div className="space-y-1 text-muted-foreground">
                    <p>• Data da Abolição da Escravidão no Ceará (25/03)</p>
                  </div>
                  
                  <h5 className="font-semibold mb-2 mt-4">Exemplo de Funcionamento:</h5>
                  <div className="space-y-1 text-muted-foreground">
                    <p>📅 Sexta → Próxima segunda</p>
                    <p>📅 Sábado → Próxima segunda</p>
                    <p>📅 Domingo → Próxima segunda</p>
                    <p>📅 Feriado → Próximo dia útil</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Teste de Dias Úteis */}
        <TabsContent value="test" className="space-y-4">
          <BusinessDaysTest />
        </TabsContent>

        {/* TAB: Histórico */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Histórico de Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Histórico de alertas será implementado em breve</p>
                <p className="text-sm">
                  Aqui você poderá visualizar estatísticas e logs de alertas enviados
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};