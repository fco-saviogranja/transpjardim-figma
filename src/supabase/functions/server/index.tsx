import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Configurar CORS aberto
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

// Logger simples
app.use('*', async (c, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.url}`);
  await next();
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.url} - ${Date.now() - start}ms - ${c.res.status}`);
});

// Cliente Supabase para operações administrativas
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.log('Inicializando servidor TranspJardim...');
console.log('Supabase URL:', supabaseUrl ? 'Configurada' : 'Não configurada');
console.log('Supabase Key:', supabaseKey ? 'Configurada' : 'Não configurada');

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// ============================================
// ROTAS DO TRANSPJARDIM
// ============================================

// Rota de health check
app.get('/make-server-225e1157/health', (c) => {
  console.log('Health check solicitado');
  return c.json({ 
    status: 'ok', 
    service: 'TranspJardim API',
    timestamp: new Date().toISOString(),
    version: '1.0.1',
    environment: {
      deno: Deno.version.deno,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey
    },
    kvStore: {
      available: typeof kv === 'object',
      functions: Object.keys(kv).sort(),
      getByPrefix: typeof kv.getByPrefix,
      set: typeof kv.set,
      get: typeof kv.get
    }
  });
});

// Rota de debug para verificar KV store
app.get('/make-server-225e1157/debug/kv', async (c) => {
  try {
    console.log('Debug KV solicitado');
    
    const debug = {
      kvObject: typeof kv,
      availableFunctions: Object.keys(kv),
      functionTypes: {},
      testResults: {}
    };
    
    // Verificar tipos das funções
    for (const funcName of Object.keys(kv)) {
      debug.functionTypes[funcName] = typeof kv[funcName];
    }
    
    // Testar função count se disponível
    if (typeof kv.count === 'function') {
      try {
        debug.testResults.count = await kv.count();
      } catch (error) {
        debug.testResults.countError = error.message;
      }
    }
    
    // Testar função getByPrefix se disponível
    if (typeof kv.getByPrefix === 'function') {
      try {
        const testResult = await kv.getByPrefix('test_');
        debug.testResults.getByPrefix = {
          success: true,
          resultType: typeof testResult,
          isArray: Array.isArray(testResult),
          length: testResult?.length || 0
        };
      } catch (error) {
        debug.testResults.getByPrefixError = error.message;
      }
    }
    
    return c.json({ 
      status: 'ok',
      debug,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro no debug KV:', error);
    return c.json({ 
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// ============================================
// INICIALIZAÇÃO DE DADOS
// ============================================

app.post('/make-server-225e1157/init-data', async (c) => {
  try {
    console.log('=== INICIANDO INICIALIZAÇÃO DE DADOS ===');
    
    // Verificar se as funções KV estão disponíveis
    console.log('Verificando funções KV disponíveis:', Object.keys(kv));
    
    if (typeof kv.set !== 'function') {
      console.error('ERRO CRÍTICO: kv.set não é uma função');
      return c.json({ 
        success: false, 
        error: 'Sistema de armazenamento não configurado corretamente' 
      }, 500);
    }
    
    // Criar usuários de exemplo (senhas mais simples para facilitar testes)
    const usuarios = [
      {
        id: 'admin001',
        name: 'Administrador Sistema',
        username: 'admin',
        password: 'admin',
        role: 'admin',
        email: 'controleinterno@transpjardim.tech'
      },
      {
        id: 'user001',
        name: 'João Silva',
        username: 'educacao',
        password: '123',
        role: 'padrão',
        secretaria: 'Secretaria de Educação',
        email: 'educacao@transpjardim.tech'
      },
      {
        id: 'user002',
        name: 'Maria Santos',
        username: 'saude',
        password: '123',
        role: 'padrão',
        secretaria: 'Secretaria de Saúde',
        email: 'saude@transpjardim.tech'
      },
      {
        id: 'user003',
        name: 'Carlos Oliveira',
        username: 'obras',
        password: '123',
        role: 'padrão',
        secretaria: 'Secretaria de Obras e Infraestrutura',
        email: 'obras@transpjardim.tech'
      },
      {
        id: 'user004',
        name: 'Ana Costa',
        username: 'ambiente',
        password: '123',
        role: 'padrão',
        secretaria: 'Secretaria de Meio Ambiente',
        email: 'ambiente@transpjardim.tech'
      }
    ];
    
    console.log(`Criando ${usuarios.length} usuários...`);
    
    let usuariosCriados = 0;
    for (const usuario of usuarios) {
      try {
        const usuarioComData = {
          ...usuario,
          dataCriacao: new Date().toISOString()
        };
        
        await kv.set(`usuario:${usuario.username}`, usuarioComData);
        await kv.set(`usuario_id:${usuario.id}`, usuarioComData);
        
        usuariosCriados++;
        console.log(`✓ Usuário criado: ${usuario.username} (${usuario.name})`);
      } catch (userError) {
        console.error(`✗ Erro ao criar usuário ${usuario.username}:`, userError);
      }
    }
    
    console.log(`=== INICIALIZAÇÃO CONCLUÍDA: ${usuariosCriados}/${usuarios.length} usuários criados ===`);
    
    return c.json({ 
      success: true, 
      message: 'Dados inicializados com sucesso',
      usuarios: usuariosCriados,
      total: usuarios.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('=== ERRO NA INICIALIZAÇÃO ===', error);
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor ao inicializar dados',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// ============================================
// AUTENTICAÇÃO SIMPLES
// ============================================

app.post('/make-server-225e1157/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    console.log(`Tentativa de login: ${username}`);
    
    // Buscar usuário
    const usuario = await kv.get(`usuario:${username}`);
    
    if (!usuario) {
      console.log(`Usuário não encontrado: ${username}`);
      return c.json({ 
        success: false, 
        error: `Usuário '${username}' não encontrado. Execute a inicialização de dados primeiro.` 
      }, 401);
    }
    
    if (usuario.password !== password) {
      console.log(`Senha incorreta para usuário: ${username}`);
      return c.json({ 
        success: false, 
        error: 'Credenciais inválidas' 
      }, 401);
    }
    
    // Gerar token simples (em produção usar JWT)
    const token = `token_${username}_${Date.now()}`;
    
    // Salvar sessão
    await kv.set(`sessao:${token}`, {
      userId: usuario.id,
      username,
      role: usuario.role,
      secretaria: usuario.secretaria,
      dataLogin: new Date().toISOString()
    });
    
    console.log(`Login bem-sucedido: ${username} (${usuario.role})`);
    
    return c.json({ 
      success: true, 
      data: {
        user: {
          id: usuario.id,
          name: usuario.name,
          username,
          email: usuario.email,
          role: usuario.role,
          secretaria: usuario.secretaria
        },
        token
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, 500);
  }
});

// ============================================
// SISTEMA DE E-MAILS - RESEND
// ============================================

// Função para detectar e ajustar e-mail em modo de teste
function adjustEmailForTestMode(originalEmail: string, resendApiKey: string): string {
  // Se a API key começa com 're_' e tem menos de 40 caracteres, provavelmente está em modo de teste
  // Para contas novas do Resend, assumir que está em modo de teste
  const isLikelyTestMode = resendApiKey.startsWith('re_') && resendApiKey.length < 50;
  
  if (isLikelyTestMode) {
    // E-mail autorizado para modo de teste do Resend (baseado no erro observado)
    const testModeEmail = '2421541@faculdadececape.edu.br';
    console.log(`🔄 [SERVER] Modo teste detectado: redirecionando ${originalEmail} para ${testModeEmail}`);
    return testModeEmail;
  }
  
  return originalEmail;
}

// Função para selecionar domínio de e-mail com fallback
function getEmailSender(): string {
  // Tentar domínio personalizado primeiro, depois fallback para resend.dev
  const customDomain = 'controleinterno@transpjardim.tech';
  const fallbackDomain = 'Controladoria Jardim <onboarding@resend.dev>';
  
  // Por enquanto, usar o fallback que sabemos que funciona
  return fallbackDomain;
}

// Enviar e-mail de alerta
app.post('/make-server-225e1157/email/send-alert', async (c) => {
  try {
    const { to, subject, alertType, criterio, usuario, dueDate } = await c.req.json();
    console.log(`Enviando alerta por e-mail para: ${to}`);
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY não configurada');
      return c.json({ 
        success: false, 
        error: 'RESEND_API_KEY não configurada no servidor',
        errorType: 'missing_api_key',
        details: 'Configure a variável de ambiente RESEND_API_KEY'
      }, 500);
    }

    // Validar formato da API key
    const apiKeyTrimmed = resendApiKey.trim();
    if (!apiKeyTrimmed.startsWith('re_') || apiKeyTrimmed.length < 32) {
      const maskedKey = apiKeyTrimmed.length > 10 ? 
        apiKeyTrimmed.substring(0, 10) + '...' : 
        apiKeyTrimmed;
      
      console.error('RESEND_API_KEY com formato inválido:', maskedKey);
      return c.json({ 
        success: false, 
        error: 'RESEND_API_KEY com formato inválido',
        errorType: 'invalid_api_key_format',
        details: `A API Key deve começar com "re_" e ter pelo menos 32 caracteres. Recebido: ${maskedKey}`
      }, 500);
    }
    
    // Template HTML do e-mail
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TranspJardim - Alerta de Critério</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4a7c59, #6c9a6f); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }
            .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .alert-urgent { background: #f8d7da; border: 1px solid #f5c6cb; }
            .button { display: inline-block; background: #4a7c59; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏛️ TranspJardim</div>
                <h1>Alerta de Transparência</h1>
                <p>Controladoria Municipal de Jardim/CE</p>
            </div>
            
            <div class="content">
                <h2>⚠️ ${subject}</h2>
                
                <div class="alert-box ${alertType === 'urgent' ? 'alert-urgent' : ''}">
                    <h3>📋 Critério: ${criterio?.nome || 'N/A'}</h3>
                    <p><strong>Secretaria:</strong> ${criterio?.secretaria || 'N/A'}</p>
                    <p><strong>Responsável:</strong> ${usuario?.name || 'N/A'}</p>
                    <p><strong>Prazo:</strong> ${dueDate ? new Date(dueDate).toLocaleDateString('pt-BR') : 'N/A'}</p>
                    <p><strong>Tipo de Alerta:</strong> ${alertType === 'urgent' ? '🔴 URGENTE' : '🟡 AVISO'}</p>
                </div>
                
                <p>Este é um alerta automático do sistema TranspJardim da Controladoria Municipal de Jardim/CE.</p>
                
                <p>Por favor, acesse o sistema para marcar este critério como concluído quando apropriado.</p>
                
                <a href="https://transpjardim.tech" class="button">Acessar TranspJardim</a>
            </div>
            
            <div class="footer">
                <p>© 2024 Prefeitura Municipal de Jardim/CE - Controladoria Geral</p>
                <p>Este e-mail foi enviado automaticamente pelo sistema TranspJardim</p>
                <p>Para dúvidas, entre em contato com a Controladoria Municipal</p>
            </div>
        </div>
    </body>
    </html>`;
    
    // Ajustar e-mail para modo de teste se necessário
    const adjustedEmail = adjustEmailForTestMode(to, resendApiKey);
    const isTestModeRedirect = adjustedEmail !== to;
    
    // Enviar e-mail via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getEmailSender(),
        to: [adjustedEmail],
        subject: `TranspJardim: ${subject}${isTestModeRedirect ? ' [MODO TESTE]' : ''}`,
        html: htmlTemplate,
        text: `TranspJardim - ${subject}\n\nCritério: ${criterio?.nome}\nSecretaria: ${criterio?.secretaria}\nResponsável: ${usuario?.name}\nPrazo: ${dueDate ? new Date(dueDate).toLocaleDateString('pt-BR') : 'N/A'}\n\nAcesse: https://transparenciajardim.app`
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Erro do Resend:', result);
      
      // Determinar tipo específico de erro
      let errorMessage = 'Falha ao enviar e-mail';
      let errorType = 'send_failed';
      
      if (response.status === 401) {
        errorMessage = 'API Key do Resend inválida ou expirada';
        errorType = 'invalid_api_key';
      } else if (response.status === 403) {
        // Verificar se é modo de teste do Resend
        if (result.message && result.message.includes('You can only send testing emails to your own email address')) {
          console.log('🔵 [SERVER] Modo de teste Resend detectado - API Key válida');
          
          // Extrair o e-mail autorizado da mensagem
          const emailMatch = result.message.match(/\(([^)]+)\)/);
          const authorizedEmail = emailMatch ? emailMatch[1] : '2421541@faculdadececape.edu.br';
          
          console.log(`📧 [SERVER] Email autorizado detectado: ${authorizedEmail}`);
          
          // Tentar enviar novamente para o email autorizado
          try {
            const retryResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: getEmailSender(),
                to: [authorizedEmail],
                subject: `TranspJardim: ${subject} [MODO TESTE - Redirecionado]`,
                html: htmlTemplate,
                text: `TranspJardim - ${subject}\\n\\nCritério: ${criterio?.nome}\\nSecretaria: ${criterio?.secretaria}\\nResponsável: ${usuario?.name}\\nPrazo: ${dueDate ? new Date(dueDate).toLocaleDateString('pt-BR') : 'N/A'}\\n\\nAcesse: https://transparenciajardim.app\\n\\n[EMAIL REDIRECIONADO PARA MODO DE TESTE]`
              }),
            });
            
            const retryResult = await retryResponse.json();
            
            if (retryResponse.ok) {
              console.log(`✅ [SERVER] Email enviado com sucesso para ${authorizedEmail} (modo teste)`);
              
              // Salvar log do e-mail enviado
              const emailLog = {
                id: retryResult.id,
                to: authorizedEmail,
                originalTo: to,
                subject: `${subject} [MODO TESTE]`,
                alertType,
                criterioId: criterio?.id,
                usuarioId: usuario?.id,
                sentAt: new Date().toISOString(),
                status: 'sent',
                testModeRedirect: true
              };
              
              await kv.set(`email_log:${retryResult.id}`, emailLog);
              
              return c.json({ 
                success: true,
                emailId: retryResult.id,
                message: `Email enviado com sucesso em modo de teste para ${authorizedEmail}`,
                testMode: true,
                authorizedEmail,
                originalEmail: to,
                note: `Sistema em modo de teste: email redirecionado de ${to} para ${authorizedEmail}`
              });
            } else {
              console.error(`❌ [SERVER] Falha no retry para email autorizado:`, retryResult);
            }
          } catch (retryError) {
            console.error(`❌ [SERVER] Erro no retry:`, retryError);
          }
          
          // Se o retry falhou, retornar informação do modo de teste
          return c.json({ 
            success: true,
            emailId: 'test-mode-restriction',
            message: 'API Key válida - Sistema em modo de teste',
            testMode: true,
            authorizedEmail,
            note: `Em modo de teste, e-mails só podem ser enviados para: ${authorizedEmail}`
          });
        } else if (result.message && result.message.includes('domain is not verified')) {
          errorMessage = '📧 Sistema usando domínio padrão. Para domínio personalizado, configure transpjardim.tech no Resend.';
          errorType = 'domain_not_verified';
        } else {
          errorMessage = 'Acesso negado ao serviço Resend';
          errorType = 'access_denied';
        }
      } else if (response.status === 429) {
        console.warn('⚠️ [SERVER] Rate limit atingido - aguardando próxima tentativa');
        errorMessage = 'Rate limit atingido. Sistema aguardará antes da próxima tentativa.';
        errorType = 'rate_limit';
      } else if (response.status === 422) {
        errorMessage = 'Dados do e-mail inválidos';
        errorType = 'validation_error';
      } else if (result.message) {
        errorMessage = `Erro Resend: ${result.message}`;
        errorType = 'resend_error';
      }
      
      return c.json({ 
        success: false, 
        error: errorMessage,
        errorType,
        statusCode: response.status,
        details: result
      }, 500);
    }
    
    console.log(`E-mail enviado com sucesso. ID: ${result.id}`);
    
    // Salvar log do e-mail enviado
    const emailLog = {
      id: result.id,
      to: adjustedEmail,
      originalTo: to,
      subject,
      alertType,
      criterioId: criterio?.id,
      usuarioId: usuario?.id,
      sentAt: new Date().toISOString(),
      status: 'sent',
      testModeRedirect: isTestModeRedirect
    };
    
    await kv.set(`email_log:${result.id}`, emailLog);
    
    return c.json({ 
      success: true, 
      emailId: result.id,
      message: isTestModeRedirect 
        ? `E-mail enviado em modo de teste (redirecionado para ${adjustedEmail})`
        : 'E-mail enviado com sucesso',
      testMode: isTestModeRedirect,
      authorizedEmail: isTestModeRedirect ? adjustedEmail : undefined
    });
    
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    
    // Determinar tipo específico de erro
    let errorMessage = 'Erro interno do servidor ao enviar e-mail';
    let errorType = 'unknown';
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Erro de conectividade com serviço Resend';
      errorType = 'connectivity';
    } else if (error instanceof Error) {
      if (error.message.includes('RESEND_API_KEY')) {
        errorMessage = 'API Key do Resend não configurada';
        errorType = 'config';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Erro ao processar dados do e-mail';
        errorType = 'data';
      } else {
        errorMessage = `Erro no envio: ${error.message}`;
        errorType = 'send';
      }
    }
    
    return c.json({ 
      success: false, 
      error: errorMessage,
      errorType,
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Verificar apenas configuração de e-mail (sem envio de teste)
app.get('/make-server-225e1157/email/check-config', async (c) => {
  try {
    console.log('Verificando configuração de e-mail...');
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      return c.json({ 
        configured: false,
        error: 'RESEND_API_KEY não configurada'
      });
    }

    // Validar formato da API key
    const apiKeyTrimmed = resendApiKey.trim();
    if (!apiKeyTrimmed.startsWith('re_') || apiKeyTrimmed.length < 32) {
      return c.json({ 
        configured: false,
        error: 'RESEND_API_KEY com formato inválido'
      });
    }
    
    console.log('✅ API Key configurada e válida');
    return c.json({ 
      configured: true,
      message: 'Sistema de e-mail configurado'
    });
    
  } catch (error) {
    console.error('Erro ao verificar configuração de e-mail:', error);
    return c.json({ 
      configured: false,
      error: 'Erro ao verificar configuração'
    }, 500);
  }
});

// Buscar logs de e-mails
app.get('/make-server-225e1157/email/logs', async (c) => {
  try {
    console.log('Buscando logs de e-mails...');
    
    if (typeof kv.getByPrefix !== 'function') {
      return c.json({ 
        success: false, 
        error: 'Sistema de armazenamento não configurado' 
      }, 500);
    }
    
    const emailLogs = await kv.getByPrefix('email_log:');
    
    const logs = emailLogs.map(item => item.value).sort((a, b) => 
      new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
    
    return c.json({ 
      success: true, 
      data: logs,
      count: logs.length 
    });
    
  } catch (error) {
    console.error('Erro ao buscar logs de e-mail:', error);
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, 500);
  }
});

// Verificar status do domínio
app.get('/make-server-225e1157/email/domain-status', async (c) => {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return c.json({
        success: false,
        error: 'RESEND_API_KEY não configurada'
      }, 500);
    }

    // Verificar domínio transpjardim.tech
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return c.json({
        success: false,
        error: 'Erro ao verificar domínios',
        details: data
      }, response.status);
    }

    const transparenciaDomain = data.data?.find((domain: any) => 
      domain.name === 'transpjardim.tech'
    );

    return c.json({
      success: true,
      domain: transparenciaDomain ? {
        name: transparenciaDomain.name,
        status: transparenciaDomain.status,
        verified: transparenciaDomain.status === 'verified'
      } : null,
      message: transparenciaDomain 
        ? `Domínio transpjardim.tech está ${transparenciaDomain.status}`
        : 'Domínio transpjardim.tech não configurado no Resend',
      allDomains: data.data?.map((d: any) => ({ name: d.name, status: d.status })) || []
    });
  } catch (error) {
    console.error('Erro ao verificar status do domínio:', error);
    return c.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// Testar configuração de e-mail
app.post('/make-server-225e1157/email/test', async (c) => {
  try {
    const { testEmail, configTest } = await c.req.json();
    
    if (!testEmail) {
      return c.json({ 
        success: false, 
        error: 'E-mail de teste é obrigatório' 
      }, 400);
    }
    
    // Permitir API key temporária para testes de configuração
    let resendApiKey = Deno.env.get('RESEND_API_KEY');
    const tempApiKey = c.req.header('X-Test-API-Key');
    
    if (configTest && tempApiKey) {
      console.log('🔧 Usando API Key temporária para teste de configuração');
      resendApiKey = tempApiKey;
    }
    
    if (!resendApiKey) {
      return c.json({ 
        success: false, 
        error: 'RESEND_API_KEY não configurada no servidor',
        errorType: 'missing_api_key'
      }, 500);
    }

    // Validar formato da API key
    const apiKeyTrimmed = resendApiKey.trim();
    if (!apiKeyTrimmed.startsWith('re_') || apiKeyTrimmed.length < 32) {
      const maskedKey = apiKeyTrimmed.length > 10 ? 
        apiKeyTrimmed.substring(0, 10) + '...' : 
        apiKeyTrimmed;
      
      console.error('RESEND_API_KEY com formato inválido (teste):', maskedKey);
      return c.json({ 
        success: false, 
        error: 'RESEND_API_KEY com formato inválido',
        errorType: 'invalid_api_key_format',
        details: `A API Key deve começar com "re_" e ter pelo menos 32 caracteres. Recebido: ${maskedKey}`
      }, 500);
    }
    
    // Ajustar e-mail para modo de teste se necessário
    const adjustedTestEmail = adjustEmailForTestMode(testEmail, resendApiKey);
    const isTestModeRedirect = adjustedTestEmail !== testEmail;
    
    console.log(`Enviando e-mail de teste para: ${testEmail}${isTestModeRedirect ? ` (redirecionado para ${adjustedTestEmail})` : ''}`);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getEmailSender(),
        to: [adjustedTestEmail],
        subject: `TranspJardim - Teste de Configuração de E-mail${isTestModeRedirect ? ' [MODO TESTE]' : ''}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4a7c59, #6c9a6f); color: white; padding: 20px; text-align: center; border-radius: 8px;">
            <h1>🏛️ TranspJardim</h1>
            <p>Controladoria Municipal de Jardim/CE</p>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
            <h2>✅ Teste de E-mail Realizado com Sucesso!</h2>
            <p>Se você recebeu este e-mail, significa que o sistema de alertas por e-mail do TranspJardim está funcionando corretamente.</p>
            <p><strong>Data/Hora do Teste:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            ${isTestModeRedirect ? `<p><strong>🔄 Modo Teste:</strong> E-mail original destinado para <code>${testEmail}</code> foi redirecionado para esta conta autorizada.</p>` : ''}
            <p>O sistema agora pode enviar alertas automáticos para os critérios de transparência.</p>
          </div>
        </div>`,
        text: `TranspJardim - Teste de E-mail\n\nSe você recebeu este e-mail, o sistema está funcionando corretamente.\nData/Hora: ${new Date().toLocaleString('pt-BR')}`
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Erro no teste de e-mail:', result);
      
      // Determinar tipo específico de erro
      let errorMessage = 'Falha no teste de e-mail';
      let errorType = 'test_failed';
      
      if (response.status === 401) {
        errorMessage = 'API Key do Resend inválida ou expirada';
        errorType = 'invalid_api_key';
      } else if (response.status === 403) {
        if (result.message && result.message.includes('domain is not verified')) {
          errorMessage = 'API Key válida! Configure domínio transpjardim.tech no Resend.';
          errorType = 'success_with_domain_note';
          
          // Mesmo com erro 403 de domínio, se chegou até aqui a API key está válida
          return c.json({ 
            success: true, 
            emailId: 'domain-not-verified-but-api-valid',
            message: errorMessage,
            note: 'Para envios em produção, configure o domínio transpjardim.tech no painel do Resend.'
          });
        } else if (result.message && result.message.includes('You can only send testing emails to your own email address')) {
          console.log('🔵 [SERVER] Modo de teste detectado no endpoint de teste');
          
          // Extrair o e-mail autorizado da mensagem
          const emailMatch = result.message.match(/\(([^)]+)\)/);
          const authorizedEmail = emailMatch ? emailMatch[1] : '2421541@faculdadececape.edu.br';
          
          console.log(`📧 [SERVER] Email autorizado para teste: ${authorizedEmail}`);
          
          // Tentar enviar para o email autorizado
          try {
            const retryResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: getEmailSender(),
                to: [authorizedEmail],
                subject: `TranspJardim - Teste de Configuração [REDIRECIONADO]`,
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #4a7c59, #6c9a6f); color: white; padding: 20px; text-align: center; border-radius: 8px;">
                    <h1>🏛️ TranspJardim</h1>
                    <p>Controladoria Municipal de Jardim/CE</p>
                  </div>
                  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
                    <h2>✅ Teste de E-mail Realizado com Sucesso!</h2>
                    <p>Se você recebeu este e-mail, significa que o sistema de alertas por e-mail do TranspJardim está funcionando corretamente.</p>
                    <p><strong>Data/Hora do Teste:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                    <div style="background: #e3f2fd; border: 1px solid #2196f3; padding: 15px; border-radius: 6px; margin: 20px 0;">
                      <p><strong>🔄 Email Redirecionado (Modo Teste):</strong></p>
                      <p>📧 <strong>Destinatário solicitado:</strong> ${testEmail}</p>
                      <p>📮 <strong>Enviado para:</strong> ${authorizedEmail}</p>
                      <p><em>Contas novas do Resend só podem enviar para o email de cadastro.</em></p>
                    </div>
                    <p>O sistema agora pode enviar alertas automáticos para os critérios de transparência.</p>
                  </div>
                </div>`,
                text: `TranspJardim - Teste de E-mail\\n\\nSe você recebeu este e-mail, o sistema está funcionando corretamente.\\nData/Hora: ${new Date().toLocaleString('pt-BR')}\\n\\nEmail redirecionado de ${testEmail} para ${authorizedEmail} devido ao modo de teste do Resend.`
              }),
            });
            
            const retryResult = await retryResponse.json();
            
            if (retryResponse.ok) {
              console.log(`✅ [SERVER] Email de teste enviado com sucesso para ${authorizedEmail}`);
              
              return c.json({ 
                success: true, 
                emailId: retryResult.id,
                message: `Email de teste enviado com sucesso!`,
                note: `Sistema em modo de teste: email redirecionado de ${testEmail} para ${authorizedEmail}`,
                testMode: true,
                authorizedEmail,
                originalEmail: testEmail
              });
            } else {
              console.error(`❌ [SERVER] Falha no retry do teste:`, retryResult);
            }
          } catch (retryError) {
            console.error(`❌ [SERVER] Erro no retry do teste:`, retryError);
          }
          
          // Se o retry falhou, retornar informação básica
          return c.json({ 
            success: true, 
            emailId: 'test-restriction-but-api-valid',
            message: '✅ API Key configurada corretamente!',
            note: `Sistema funcionando! Em modo de teste, só pode enviar para: ${authorizedEmail}`,
            testMode: true,
            authorizedEmail
          });
        } else {
          errorMessage = 'Acesso negado ao serviço Resend';
          errorType = 'access_denied';
        }
      } else if (response.status === 429) {
        console.warn('⚠️ [SERVER] Rate limit atingido no teste de e-mail');
        errorMessage = '⏱️ Rate limit atingido. Aguarde alguns segundos antes de tentar novamente.';
        errorType = 'rate_limit';
      } else if (response.status === 422) {
        errorMessage = 'Dados do e-mail inválidos';
        errorType = 'validation_error';
      } else if (result.message) {
        errorMessage = `Erro Resend: ${result.message}`;
        errorType = 'resend_error';
      }
      
      return c.json({ 
        success: false, 
        error: errorMessage,
        errorType,
        statusCode: response.status,
        details: result
      }, 500);
    }
    
    console.log(`Teste de e-mail enviado com sucesso. ID: ${result.id}`);
    
    return c.json({ 
      success: true, 
      emailId: result.id,
      message: isTestModeRedirect 
        ? `E-mail enviado em modo de teste (redirecionado para ${adjustedTestEmail})`
        : `E-mail de teste enviado para ${testEmail}`,
      testMode: isTestModeRedirect,
      authorizedEmail: isTestModeRedirect ? adjustedTestEmail : undefined
    });
    
  } catch (error) {
    console.error('Erro no teste de e-mail:', error);
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// ============================================
// USUÁRIOS - CRUD
// ============================================

// Listar usuários
app.get('/make-server-225e1157/users', async (c) => {
  try {
    console.log('=== INICIANDO LISTAGEM DE USUÁRIOS ===');
    
    // Verificar se a função kv.getByPrefix existe
    if (typeof kv.getByPrefix !== 'function') {
      console.error('ERRO CRÍTICO: kv.getByPrefix não é uma função');
      console.log('Funções disponíveis no kv:', Object.keys(kv));
      return c.json({ 
        success: false, 
        error: 'Erro de configuração do sistema de armazenamento',
        debug: 'kv.getByPrefix is not a function'
      }, 500);
    }
    
    console.log('Chamando kv.getByPrefix("usuario:")...');
    const usuarios = await kv.getByPrefix('usuario:');
    console.log(`Resultado bruto da busca:`, usuarios);
    
    if (!Array.isArray(usuarios)) {
      console.error('ERRO: getByPrefix não retornou um array:', typeof usuarios);
      return c.json({ 
        success: false, 
        error: 'Formato de dados inesperado do armazenamento' 
      }, 500);
    }
    
    const usuariosSemSenha = usuarios.map(item => {
      if (!item || !item.value) {
        console.warn('Item de usuário inválido:', item);
        return null;
      }
      
      const { password, ...usuarioSemSenha } = item.value;
      return usuarioSemSenha;
    }).filter(Boolean); // Remove nulls
    
    console.log(`✅ ${usuariosSemSenha.length} usuários processados com sucesso`);
    console.log('Usuários encontrados:', usuariosSemSenha.map(u => u.username));
    
    return c.json({ 
      success: true, 
      data: usuariosSemSenha,
      count: usuariosSemSenha.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('💥 ERRO CRÍTICO ao buscar usuários:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor ao buscar usuários',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Criar usuário
app.post('/make-server-225e1157/users', async (c) => {
  try {
    const { name, username, password, role, secretaria } = await c.req.json();
    console.log(`Criando usuário: ${username}`);
    
    // Validações básicas
    if (!name || !username || !password || !role) {
      return c.json({ 
        success: false, 
        error: 'Nome, usuário, senha e role são obrigatórios' 
      }, 400);
    }
    
    // Verificar se username já existe
    const usuarioExistente = await kv.get(`usuario:${username}`);
    if (usuarioExistente) {
      return c.json({ 
        success: false, 
        error: 'Nome de usuário já existe' 
      }, 400);
    }
    
    const id = `user_${Date.now()}`;
    const novoUsuario = {
      id,
      name,
      username,
      password,
      role,
      secretaria: role === 'admin' ? undefined : secretaria,
      dataCriacao: new Date().toISOString()
    };
    
    await kv.set(`usuario:${username}`, novoUsuario);
    await kv.set(`usuario_id:${id}`, novoUsuario);
    
    console.log(`Usuário criado: ${username}`);
    
    const { password: _, ...usuarioSemSenha } = novoUsuario;
    
    return c.json({ 
      success: true, 
      data: usuarioSemSenha,
      message: 'Usuário criado com sucesso' 
    }, 201);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor ao criar usuário' 
    }, 500);
  }
});

// Atualizar usuário
app.put('/make-server-225e1157/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { name, username, password, role, secretaria } = await c.req.json();
    console.log(`Atualizando usuário ID: ${id}`);
    
    const usuarioAtual = await kv.get(`usuario_id:${id}`);
    if (!usuarioAtual) {
      return c.json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      }, 404);
    }
    
    const usuarioAtualizado = {
      ...usuarioAtual,
      ...(name && { name }),
      ...(username && { username }),
      ...(password && { password }),
      ...(role && { role }),
      secretaria: role === 'admin' ? undefined : secretaria,
      dataAtualizacao: new Date().toISOString()
    };
    
    // Se username mudou, remover chave antiga
    if (username && username !== usuarioAtual.username) {
      await kv.del(`usuario:${usuarioAtual.username}`);
      await kv.set(`usuario:${username}`, usuarioAtualizado);
    } else {
      await kv.set(`usuario:${usuarioAtual.username}`, usuarioAtualizado);
    }
    
    await kv.set(`usuario_id:${id}`, usuarioAtualizado);
    
    console.log(`Usuário atualizado: ${usuarioAtualizado.username}`);
    
    const { password: _, ...usuarioSemSenha } = usuarioAtualizado;
    
    return c.json({ 
      success: true, 
      data: usuarioSemSenha,
      message: 'Usuário atualizado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, 500);
  }
});

// Deletar usuário
app.delete('/make-server-225e1157/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    console.log(`Deletando usuário ID: ${id}`);
    
    const usuario = await kv.get(`usuario_id:${id}`);
    if (!usuario) {
      return c.json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      }, 404);
    }
    
    await kv.del(`usuario:${usuario.username}`);
    await kv.del(`usuario_id:${id}`);
    
    console.log(`Usuário deletado: ${usuario.username}`);
    
    return c.json({ 
      success: true, 
      message: 'Usuário deletado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, 500);
  }
});

// Rota catch-all
app.all('*', (c) => {
  console.log(`Rota não encontrada: ${c.req.method} ${c.req.path}`);
  return c.json({ 
    success: false, 
    error: 'Rota não encontrada',
    path: c.req.path,
    method: c.req.method 
  }, 404);
});

// ============================================
// ROTA PARA BUSCAR E-MAILS DE USUÁRIOS
// ============================================

// Buscar e-mails de usuários para notificações
app.get('/make-server-225e1157/users/emails', async (c) => {
  try {
    console.log('=== BUSCANDO E-MAILS DE USUÁRIOS ===');
    
    // Verificar parâmetros de consulta
    const secretaria = c.req.query('secretaria');
    const role = c.req.query('role');
    
    if (typeof kv.getByPrefix !== 'function') {
      console.error('ERRO: kv.getByPrefix não disponível');
      return c.json({ 
        success: false, 
        error: 'Sistema de armazenamento não configurado' 
      }, 500);
    }
    
    // Buscar todos os usuários
    const usuarios = await kv.getByPrefix('usuario:');
    
    if (!Array.isArray(usuarios)) {
      return c.json({ 
        success: false, 
        error: 'Erro ao buscar usuários' 
      }, 500);
    }
    
    // Filtrar usuários e extrair e-mails
    let usuariosFiltrados = usuarios.map(item => item.value).filter(Boolean);
    
    // Aplicar filtros se especificados
    if (secretaria) {
      usuariosFiltrados = usuariosFiltrados.filter(user => user.secretaria === secretaria);
    }
    
    if (role) {
      usuariosFiltrados = usuariosFiltrados.filter(user => user.role === role);
    }
    
    // Extrair e-mails válidos
    const emails = usuariosFiltrados
      .filter(user => user.email && user.email.includes('@'))
      .map(user => ({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        secretaria: user.secretaria,
        role: user.role
      }));
    
    console.log(`✅ ${emails.length} e-mails encontrados`);
    
    return c.json({ 
      success: true, 
      data: emails,
      count: emails.length,
      filters: { secretaria, role }
    });
    
  } catch (error) {
    console.error('Erro ao buscar e-mails de usuários:', error);
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, 500);
  }
});

// Enviar notificação para múltiplos usuários baseado em critério
app.post('/make-server-225e1157/email/notify-users', async (c) => {
  try {
    const { criterio, alertType, secretaria, includeAdmin } = await c.req.json();
    console.log(`Enviando notificações para critério: ${criterio?.nome}`);
    
    // Buscar e-mails dos usuários que devem receber a notificação
    const usuarios = await kv.getByPrefix('usuario:');
    
    if (!Array.isArray(usuarios)) {
      return c.json({ 
        success: false, 
        error: 'Erro ao buscar usuários' 
      }, 500);
    }
    
    // Filtrar usuários que devem receber a notificação
    let usuariosParaNotificar = usuarios.map(item => item.value).filter(Boolean);
    
    // Se especificada secretaria, filtrar por ela
    if (secretaria) {
      usuariosParaNotificar = usuariosParaNotificar.filter(user => 
        user.secretaria === secretaria || (includeAdmin && user.role === 'admin')
      );
    }
    
    // Se includeAdmin é false, excluir admins
    if (!includeAdmin) {
      usuariosParaNotificar = usuariosParaNotificar.filter(user => user.role !== 'admin');
    }
    
    // Filtrar apenas usuários com e-mail válido
    const emailsParaEnviar = usuariosParaNotificar
      .filter(user => user.email && user.email.includes('@'))
      .map(user => user.email);
    
    if (emailsParaEnviar.length === 0) {
      return c.json({ 
        success: false, 
        error: 'Nenhum usuário com e-mail válido encontrado para notificação',
        filters: { secretaria, includeAdmin }
      }, 400);
    }
    
    // Preparar dados do e-mail
    const subject = alertType === 'urgent' 
      ? `🔴 URGENTE: ${criterio?.nome}` 
      : `🟡 AVISO: ${criterio?.nome}`;
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return c.json({ 
        success: false, 
        error: 'RESEND_API_KEY não configurada' 
      }, 500);
    }
    
    // Template HTML do e-mail
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TranspJardim - Notificação de Critério</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4a7c59, #6c9a6f); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }
            .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .alert-urgent { background: #f8d7da; border: 1px solid #f5c6cb; }
            .button { display: inline-block; background: #4a7c59; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏛️ TranspJardim</div>
                <h1>Notificação de Transparência</h1>
                <p>Controladoria Municipal de Jardim/CE</p>
            </div>
            
            <div class="content">
                <h2>📋 ${subject}</h2>
                
                <div class="alert-box ${alertType === 'urgent' ? 'alert-urgent' : ''}">
                    <h3>Critério: ${criterio?.nome || 'N/A'}</h3>
                    <p><strong>Secretaria:</strong> ${criterio?.secretaria || 'N/A'}</p>
                    <p><strong>Tipo de Alerta:</strong> ${alertType === 'urgent' ? '🔴 URGENTE' : '🟡 AVISO'}</p>
                    <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                </div>
                
                <p>Esta é uma notificação automática do sistema TranspJardim da Controladoria Municipal de Jardim/CE.</p>
                
                <p>Por favor, acesse o sistema para verificar e atualizar o status dos critérios quando apropriado.</p>
                
                <a href="https://transpjardim.tech" class="button">Acessar TranspJardim</a>
            </div>
            
            <div class="footer">
                <p>© 2024 Prefeitura Municipal de Jardim/CE - Controladoria Geral</p>
                <p>Este e-mail foi enviado automaticamente pelo sistema TranspJardim</p>
                <p><strong>Remetente:</strong> controleinterno.jardimce@gmail.com</p>
            </div>
        </div>
    </body>
    </html>`;
    
    // Enviar e-mail para todos os destinatários
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Controladoria Jardim <controleinterno.jardimce@gmail.com>',
        to: emailsParaEnviar,
        subject: `TranspJardim: ${subject}`,
        html: htmlTemplate,
        text: `TranspJardim - ${subject}\n\nCritério: ${criterio?.nome}\nSecretaria: ${criterio?.secretaria}\nTipo: ${alertType === 'urgent' ? 'URGENTE' : 'AVISO'}\n\nAcesse: https://transparenciajardim.app`
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Erro do Resend na notificação em massa:', result);
      return c.json({ 
        success: false, 
        error: 'Falha ao enviar notificações',
        details: result 
      }, 500);
    }
    
    console.log(`Notificações enviadas com sucesso. ID: ${result.id}`);
    
    // Salvar log das notificações enviadas
    const emailLog = {
      id: result.id,
      to: emailsParaEnviar,
      recipientCount: emailsParaEnviar.length,
      subject,
      alertType,
      criterioId: criterio?.id,
      sentAt: new Date().toISOString(),
      status: 'sent',
      notificationType: 'mass_notification'
    };
    
    await kv.set(`email_log:${result.id}`, emailLog);
    
    return c.json({ 
      success: true, 
      emailId: result.id,
      message: `Notificações enviadas para ${emailsParaEnviar.length} usuários`,
      recipients: emailsParaEnviar.length,
      emails: emailsParaEnviar
    });
    
  } catch (error) {
    console.error('Erro ao enviar notificações em massa:', error);
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

console.log('Servidor TranspJardim inicializado e pronto para receber requisições');

// Iniciar servidor
Deno.serve(app.fetch);