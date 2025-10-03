import { useState, useEffect, useCallback } from 'react';
import { Alerta, Criterio } from '../types';
import { toast } from 'sonner@2.0.3';
import { 
  isDiaUtil, 
  proximoDiaUtil, 
  proximoHorarioComercial, 
  formatarDataBrasil 
} from '../utils/businessDays';
import { emailService } from '../lib/emailService';
import { useEmailStatus } from './useEmailStatusOptimized';

interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: 'vencimento' | 'meta' | 'status' | 'inatividade';
  condition: {
    days?: number;
    percentage?: number;
    status?: string;
  };
  priority: 'alta' | 'média' | 'baixa';
  template: string;
  secretarias: string[];
  notifications: {
    dashboard: boolean;
    email: boolean; // Sempre obrigatório para regras ativas
    push: boolean;
  };
  businessDaysOnly: boolean; // Enviar apenas em dias úteis
}

interface AlertManagerConfig {
  enabled: boolean;
  checkInterval: number; // em minutos
  maxAlertsPerDay: number;
  debugMode: boolean;
  businessDaysOnly: boolean; // Configuração global para dias úteis
  emailRequired: boolean; // E-mail sempre obrigatório
}

const defaultRules: AlertRule[] = [
  {
    id: 'rule-vencimento',
    name: 'Critérios Vencidos',
    enabled: true,
    trigger: 'vencimento',
    condition: { days: 0 },
    priority: 'alta',
    template: 'Critério "{nome}" venceu em {dataVencimento}',
    secretarias: [],
    notifications: { dashboard: true, email: true, push: false },
    businessDaysOnly: true
  },
  {
    id: 'rule-vencimento-proximo',
    name: 'Vencimento Próximo',
    enabled: true,
    trigger: 'vencimento',
    condition: { days: 7 },
    priority: 'média',
    template: 'Critério "{nome}" vence em {diasRestantes} dias',
    secretarias: [],
    notifications: { dashboard: true, email: true, push: false },
    businessDaysOnly: true
  },
  {
    id: 'rule-meta-baixa',
    name: 'Meta Abaixo de 50%',
    enabled: true,
    trigger: 'meta',
    condition: { percentage: 50 },
    priority: 'alta',
    template: 'Critério "{nome}" está {percentualDiferenca}% abaixo da meta',
    secretarias: [],
    notifications: { dashboard: true, email: true, push: false },
    businessDaysOnly: true
  },
  {
    id: 'rule-meta-critica',
    name: 'Meta Crítica (abaixo de 25%)',
    enabled: true,
    trigger: 'meta',
    condition: { percentage: 25 },
    priority: 'alta',
    template: 'CRÍTICO: Critério "{nome}" está {percentualDiferenca}% abaixo da meta',
    secretarias: [],
    notifications: { dashboard: true, email: true, push: false },
    businessDaysOnly: true
  }
];

const defaultConfig: AlertManagerConfig = {
  enabled: true,
  checkInterval: 30, // 30 minutos
  maxAlertsPerDay: 50,
  debugMode: false,
  businessDaysOnly: true, // Por padrão, alertas apenas em dias úteis
  emailRequired: true // E-mail sempre obrigatório
};

export const useAlertManager = (criterios: Criterio[], onNewAlert?: (alerta: Alerta) => void) => {
  const [rules, setRules] = useState<AlertRule[]>(defaultRules);
  const [config, setConfig] = useState<AlertManagerConfig>(defaultConfig);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [alertHistory, setAlertHistory] = useState<Alerta[]>([]);
  const [alertsToday, setAlertsToday] = useState(0);
  
  // Hook para verificar status do e-mail
  const { isConfigured: emailConfigured } = useEmailStatus();

  // Função para calcular dias até vencimento
  const calculateDaysUntilDue = (dataVencimento: string): number => {
    const today = new Date();
    const dueDate = new Date(dataVencimento);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Função para gerar ID único para alerta
  const generateAlertId = (): string => {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Função para processar template de mensagem
  const processTemplate = (template: string, criterio: Criterio, context: any = {}): string => {
    let message = template;
    
    // Substituições básicas
    message = message.replace(/{nome}/g, criterio.nome);
    message = message.replace(/{dataVencimento}/g, new Date(criterio.dataVencimento).toLocaleDateString('pt-BR'));
    message = message.replace(/{responsavel}/g, criterio.responsavel);
    message = message.replace(/{secretaria}/g, criterio.secretaria);
    message = message.replace(/{valor}/g, criterio.valor.toString());
    message = message.replace(/{meta}/g, criterio.meta.toString());
    
    // Substituições contextuais
    if (context.diasRestantes !== undefined) {
      message = message.replace(/{diasRestantes}/g, Math.abs(context.diasRestantes).toString());
    }
    
    if (context.percentualDiferenca !== undefined) {
      message = message.replace(/{percentualDiferenca}/g, context.percentualDiferenca.toString());
    }
    
    return message;
  };

  // Função para verificar se deve enviar alerta (considerando dias úteis)
  const shouldSendAlert = (rule: AlertRule): { send: boolean; scheduledDate?: Date } => {
    const now = new Date();
    
    // Verificar configuração global
    if (config.businessDaysOnly || rule.businessDaysOnly) {
      if (!isDiaUtil(now)) {
        const nextBusinessDay = proximoDiaUtil(now);
        return {
          send: false,
          scheduledDate: nextBusinessDay
        };
      }
    }
    
    return { send: true };
  };

  // Função para verificar se deve gerar alerta de vencimento
  const checkVencimentoAlert = (criterio: Criterio, rule: AlertRule): Alerta | null => {
    const daysUntilDue = calculateDaysUntilDue(criterio.dataVencimento);
    const conditionDays = rule.condition.days || 0;
    
    // Verifica se deve disparar o alerta
    let shouldAlert = false;
    
    if (conditionDays === 0) {
      // Alerta de vencimento (hoje ou vencido)
      shouldAlert = daysUntilDue <= 0;
    } else {
      // Alerta de vencimento próximo
      shouldAlert = daysUntilDue === conditionDays;
    }
    
    if (!shouldAlert) return null;
    
    // Verificar se deve enviar hoje (dias úteis)
    const sendCheck = shouldSendAlert(rule);
    if (!sendCheck.send) {
      if (config.debugMode) {
        console.log(`[AlertManager] Alerta "${rule.name}" agendado para ${formatarDataBrasil(sendCheck.scheduledDate!)}`);
      }
      return null; // Não envia hoje, espera próximo dia útil
    }
    
    // Verifica se já existe alerta similar recente (últimas 24h)
    const existingAlert = alertHistory.find(alert => 
      alert.criterioId === criterio.id &&
      alert.tipo === 'vencimento' &&
      new Date(alert.dataEnvio).getTime() > Date.now() - (24 * 60 * 60 * 1000)
    );
    
    if (existingAlert) return null;
    
    const message = processTemplate(rule.template, criterio, { diasRestantes: daysUntilDue });
    
    return {
      id: generateAlertId(),
      criterioId: criterio.id,
      tipo: 'vencimento',
      mensagem: message,
      prioridade: rule.priority,
      dataEnvio: new Date().toISOString(),
      lido: false
    };
  };

  // Função para verificar se deve gerar alerta de meta
  const checkMetaAlert = (criterio: Criterio, rule: AlertRule): Alerta | null => {
    const percentualAtual = (criterio.valor / criterio.meta) * 100;
    const limitePercentual = rule.condition.percentage || 100;
    
    // Só dispara se estiver abaixo do limite
    if (percentualAtual >= limitePercentual) return null;
    
    // Verificar se deve enviar hoje (dias úteis)
    const sendCheck = shouldSendAlert(rule);
    if (!sendCheck.send) {
      if (config.debugMode) {
        console.log(`[AlertManager] Alerta de meta "${rule.name}" agendado para ${formatarDataBrasil(sendCheck.scheduledDate!)}`);
      }
      return null; // Não envia hoje, espera próximo dia útil
    }
    
    // Verifica se já existe alerta similar recente (últimas 24h)
    const existingAlert = alertHistory.find(alert => 
      alert.criterioId === criterio.id &&
      alert.tipo === 'meta' &&
      new Date(alert.dataEnvio).getTime() > Date.now() - (24 * 60 * 60 * 1000)
    );
    
    if (existingAlert) return null;
    
    const percentualDiferenca = Math.round(limitePercentual - percentualAtual);
    const message = processTemplate(rule.template, criterio, { percentualDiferenca });
    
    return {
      id: generateAlertId(),
      criterioId: criterio.id,
      tipo: 'meta',
      mensagem: message,
      prioridade: rule.priority,
      dataEnvio: new Date().toISOString(),
      lido: false
    };
  };

  // Função principal para processar regras e gerar alertas
  const processAlerts = useCallback(() => {
    if (!config.enabled) {
      if (config.debugMode) {
        console.log('[AlertManager] Sistema de alertas desabilitado');
      }
      return;
    }

    if (alertsToday >= config.maxAlertsPerDay) {
      if (config.debugMode) {
        console.log('[AlertManager] Limite diário de alertas atingido');
      }
      return;
    }

    const newAlerts: Alerta[] = [];

    // Filtrar regras ativas
    const activeRules = rules.filter(rule => rule.enabled);
    
    if (config.debugMode) {
      console.log(`[AlertManager] Processando ${activeRules.length} regras para ${criterios.length} critérios`);
    }

    criterios.forEach(criterio => {
      activeRules.forEach(rule => {
        // Verificar se a regra se aplica à secretaria do critério
        if (rule.secretarias.length > 0 && !rule.secretarias.includes(criterio.secretaria)) {
          return;
        }

        let alert: Alerta | null = null;

        switch (rule.trigger) {
          case 'vencimento':
            alert = checkVencimentoAlert(criterio, rule);
            break;
          case 'meta':
            alert = checkMetaAlert(criterio, rule);
            break;
          case 'status':
            // TODO: Implementar alertas baseados em status
            break;
          case 'inatividade':
            // TODO: Implementar alertas de inatividade
            break;
        }

        if (alert) {
          newAlerts.push(alert);
          if (config.debugMode) {
            console.log(`[AlertManager] Novo alerta gerado: ${alert.mensagem}`);
          }

          // Enviar e-mail se habilitado na regra E se o e-mail estiver configurado
          if (rule.notifications.email && emailConfigured) {
            try {
              const criterioCompleto = criterios.find(c => c.id === alert.criterioId);
              if (criterioCompleto) {
                const emailData = {
                  to: 'controladoria@jardim.ce.gov.br', // E-mail da controladoria
                  subject: emailService.generateEmailSubject(
                    alert.prioridade === 'alta' ? 'urgent' : 'warning',
                    criterioCompleto.nome
                  ),
                  alertType: alert.prioridade === 'alta' ? 'urgent' as const : 'warning' as const,
                  criterio: {
                    id: criterioCompleto.id,
                    nome: criterioCompleto.nome,
                    secretaria: criterioCompleto.secretaria
                  },
                  usuario: {
                    id: 'system',
                    name: 'Sistema TranspJardim'
                  },
                  dueDate: criterioCompleto.dataVencimento
                };

                // Enviar e-mail de forma assíncrona (não bloquear o fluxo)
                emailService.sendAlert(emailData)
                  .then(result => {
                    if (config.debugMode) {
                      console.log(`[AlertManager] ✅ E-mail enviado com sucesso: ${result.emailId}`);
                      toast.success(`E-mail de alerta enviado para ${emailData.to}`, { duration: 3000 });
                    }
                  })
                  .catch(error => {
                    console.error('[AlertManager] ❌ Erro ao enviar e-mail:', error);
                    
                    // Verificar se é um erro conhecido e tratável
                    const errorMessage = error.message || '';
                    const isTestModeError = errorMessage.includes('You can only send testing emails');
                    const isRateLimitError = errorMessage.includes('rate_limit_exceeded') || 
                                           errorMessage.includes('Too many requests');
                    
                    if (config.debugMode) {
                      if (isTestModeError) {
                        toast.info('🧪 Sistema em modo de teste - E-mails só para conta autorizada', { 
                          duration: 4000
                        });
                      } else if (isRateLimitError) {
                        toast.warning('🕐 Rate limit atingido - Sistema aguardando intervalo', { 
                          duration: 4000
                        });
                      } else {
                        toast.error(`🚨 E-mail falhou: ${errorMessage}`, { 
                          duration: 5000,
                          action: {
                            label: 'Configurar E-mail',
                            onClick: () => {
                              console.log('Usuário solicitou configuração de e-mail');
                            }
                          }
                        });
                      }
                    }
                  });
              }
            } catch (error) {
              console.error('[AlertManager] Erro na preparação do e-mail:', error);
            }
          } else if (rule.notifications.email && !emailConfigured) {
            // Log quando e-mail está habilitado mas não configurado
            if (config.debugMode) {
              console.log(`[AlertManager] ⚠️ E-mail habilitado mas não configurado para alerta: ${alert.mensagem}`);
            }
          }
        }
      });
    });

    // Processar novos alertas
    if (newAlerts.length > 0) {
      newAlerts.forEach(alert => {
        // Adicionar ao histórico
        setAlertHistory(prev => [...prev, alert]);
        
        // Chamar callback se fornecido
        if (onNewAlert) {
          onNewAlert(alert);
        }
        
        // Mostrar toast para alertas de alta prioridade
        if (alert.prioridade === 'alta') {
          toast.error(alert.mensagem, {
            duration: 10000,
            action: {
              label: 'Ver Detalhes',
              onClick: () => console.log('Navegar para critério:', alert.criterioId)
            }
          });
        }
      });

      setAlertsToday(prev => prev + newAlerts.length);
      
      if (config.debugMode) {
        console.log(`[AlertManager] ${newAlerts.length} novos alertas processados`);
      }
    }

    setLastCheck(new Date());
  }, [criterios, rules, config, alertHistory, alertsToday, onNewAlert]);

  // Effect para executar verificação periódica
  useEffect(() => {
    if (!config.enabled) return;

    // Executar verificação inicial
    processAlerts();

    // Configurar intervalo de verificação
    const interval = setInterval(() => {
      processAlerts();
    }, config.checkInterval * 60 * 1000); // converter minutos para ms

    return () => clearInterval(interval);
  }, [processAlerts, config.checkInterval, config.enabled]);

  // Reset contador diário à meia-noite
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    
    const msUntilMidnight = midnight.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
      setAlertsToday(0);
      if (config.debugMode) {
        console.log('[AlertManager] Contador diário de alertas resetado');
      }
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, [config.debugMode]);

  // Função manual para forçar verificação
  const manualCheck = useCallback(() => {
    if (config.debugMode) {
      console.log('[AlertManager] Verificação manual iniciada');
    }
    processAlerts();
  }, [processAlerts, config.debugMode]);

  // Função para testar envio de e-mail manualmente
  const testEmailAlert = useCallback(async (testEmail: string) => {
    if (!testEmail || !emailService.isValidEmail(testEmail)) {
      throw new Error('E-mail inválido para teste');
    }

    console.log('[AlertManager] Testando envio de e-mail para:', testEmail);

    const mockEmailData = {
      to: testEmail,
      subject: emailService.generateEmailSubject('warning', 'Teste Manual do Sistema'),
      alertType: 'warning' as const,
      criterio: {
        id: 'test-manual',
        nome: 'Teste Manual - AlertManager',
        secretaria: 'Sistema de Alertas'
      },
      usuario: {
        id: 'alert-manager',
        name: 'AlertManager TranspJardim'
      },
      dueDate: new Date().toISOString()
    };

    try {
      const result = await emailService.sendAlert(mockEmailData);
      console.log('[AlertManager] ✅ Teste de e-mail bem-sucedido:', result);
      return result;
    } catch (error) {
      console.error('[AlertManager] ❌ Teste de e-mail falhou:', error);
      throw error;
    }
  }, []);

  return {
    rules,
    setRules,
    config,
    setConfig,
    lastCheck,
    alertHistory,
    alertsToday,
    manualCheck,
    processAlerts,
    testEmailAlert
  };
};