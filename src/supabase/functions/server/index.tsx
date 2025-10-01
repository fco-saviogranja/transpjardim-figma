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
    
    // Criar usuários de exemplo
    const usuarios = [
      {
        id: 'admin001',
        name: 'Administrador Sistema',
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      },
      {
        id: 'user001',
        name: 'João Silva',
        username: 'educacao',
        password: 'user123',
        role: 'padrão',
        secretaria: 'Secretaria de Educação'
      },
      {
        id: 'user002',
        name: 'Maria Santos',
        username: 'saude',
        password: 'user123',
        role: 'padrão',
        secretaria: 'Secretaria de Saúde'
      },
      {
        id: 'user003',
        name: 'Carlos Oliveira',
        username: 'obras',
        password: 'user123',
        role: 'padrão',
        secretaria: 'Secretaria de Obras e Infraestrutura'
      },
      {
        id: 'user004',
        name: 'Ana Costa',
        username: 'ambiente',
        password: 'user123',
        role: 'padrão',
        secretaria: 'Secretaria de Meio Ambiente'
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
    
    if (!usuario || usuario.password !== password) {
      console.log(`Login falhou para: ${username}`);
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

console.log('Servidor TranspJardim inicializado e pronto para receber requisições');

// Iniciar servidor
Deno.serve(app.fetch);