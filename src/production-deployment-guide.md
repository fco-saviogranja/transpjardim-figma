# TranspJardim - Guia de Deploy em Produção

Este guia contém todas as instruções para migrar o TranspJardim do ambiente Figma Make para infraestrutura própria.

## 🎯 Opções de Deploy

### Opção 1: Vercel (Recomendado)
- ✅ Deploy automático via Git
- ✅ Domínio personalizado gratuito
- ✅ SSL automático
- ✅ Edge Functions nativo

### Opção 2: Netlify
- ✅ Deploy contínuo
- ✅ Formulários nativos
- ✅ Redirects e rewrites
- ✅ Analytics integrado

## 🚀 Passo a Passo - Deploy Vercel

### 1. Preparação do Repositório
```bash
# 1. Criar repositório no GitHub
git init
git add .
git commit -m "feat: initial TranspJardim setup"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/transpjardim.git
git push -u origin main
```

### 2. Configuração no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Conecte sua conta GitHub
3. Importe o repositório `transpjardim`
4. Configure as variáveis de ambiente (ver seção abaixo)
5. Deploy!

### 3. Variáveis de Ambiente Necessárias
```env
# Supabase Configuration
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# App Configuration
NODE_ENV=production
VITE_APP_TITLE=TranspJardim
VITE_APP_DESCRIPTION=Sistema de Transparência Municipal de Jardim/CE

# Analytics (opcional)
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### 4. Configuração de Domínio Personalizado
1. No painel Vercel, vá em Settings → Domains
2. Adicione seu domínio: `transpjardim.jardim.ce.gov.br`
3. Configure os DNS conforme instruções do Vercel
4. Aguarde propagação (até 24h)

## 🗄️ Configuração do Supabase

### 1. Criar Projeto Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie novo projeto: `transpjardim-prod`
3. Escolha região próxima (South America)
4. Anote as credenciais

### 2. Configurar Tabelas
Execute os seguintes SQLs no SQL Editor do Supabase:

```sql
-- Tabela de usuários
CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  nome VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  secretaria VARCHAR,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de critérios
CREATE TABLE criterios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR NOT NULL,
  descricao TEXT,
  secretaria VARCHAR NOT NULL,
  periodicidade VARCHAR NOT NULL CHECK (periodicidade IN ('15_dias', '30_dias', 'mensal', 'bimestral', 'semestral', 'anual')),
  valor NUMERIC DEFAULT 0,
  meta NUMERIC DEFAULT 100,
  status VARCHAR DEFAULT 'ativo' CHECK (status IN ('ativo', 'pendente', 'vencido')),
  data_vencimento TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conclusões por usuário
CREATE TABLE criterio_conclusoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  criterio_id UUID REFERENCES criterios(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  concluido BOOLEAN DEFAULT false,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(criterio_id, usuario_id)
);

-- Tabela de alertas
CREATE TABLE alertas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR NOT NULL,
  descricao TEXT,
  tipo VARCHAR DEFAULT 'info' CHECK (tipo IN ('info', 'warning', 'error', 'success')),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  lido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_criterios_secretaria ON criterios(secretaria);
CREATE INDEX idx_criterios_status ON criterios(status);
CREATE INDEX idx_alertas_usuario ON alertas(usuario_id);
CREATE INDEX idx_conclusoes_criterio ON criterio_conclusoes(criterio_id);
CREATE INDEX idx_conclusoes_usuario ON criterio_conclusoes(usuario_id);
```

### 3. Configurar Row Level Security (RLS)
```sql
-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE criterios ENABLE ROW LEVEL SECURITY;
ALTER TABLE criterio_conclusoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY "Usuários podem ver próprio perfil" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os usuários" ON usuarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para critérios
CREATE POLICY "Usuários veem critérios da própria secretaria" ON criterios
  FOR SELECT USING (
    secretaria = (
      SELECT secretaria FROM usuarios WHERE id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para conclusões
CREATE POLICY "Usuários podem gerenciar próprias conclusões" ON criterio_conclusoes
  FOR ALL USING (usuario_id = auth.uid());
```

## 📊 Migração dos Dados

### 1. Dados Iniciais
Execute o script de migração (ver arquivo `scripts/migrate-data.sql`)

### 2. Usuário Administrador Inicial
```sql
-- Inserir usuário admin inicial
INSERT INTO usuarios (email, nome, role, secretaria) VALUES
('admin@jardim.ce.gov.br', 'Administrador Sistema', 'admin', 'Controladoria');
```

## 🔧 Configurações Adicionais

### 1. Configurar CORS no Supabase
No painel Supabase → Settings → API:
- Adicionar domínio: `https://transpjardim.jardim.ce.gov.br`
- Adicionar domínio de desenvolvimento: `http://localhost:5173`

### 2. Configurar Email Templates
No painel Supabase → Authentication → Email Templates:
- Personalizar templates com identidade visual de Jardim/CE

### 3. Configurar Storage (se necessário)
```sql
-- Criar bucket para uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('transpjardim-uploads', 'transpjardim-uploads', false);

-- Política de acesso
CREATE POLICY "Usuários podem fazer upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'transpjardim-uploads');
```

## 🧪 Testes Pré-Deploy

### 1. Checklist de Funcionalidades
- [ ] Login/logout funcionando
- [ ] Filtragem por secretaria
- [ ] Criação/edição de critérios (admin)
- [ ] Marcação de conclusões
- [ ] Sistema de alertas
- [ ] Relatórios avançados
- [ ] Modo offline (fallback)

### 2. Testes de Performance
- [ ] Carregamento inicial < 3s
- [ ] Navegação fluida
- [ ] Responsividade mobile
- [ ] Conectividade intermitente

## 🚨 Pós-Deploy

### 1. Monitoramento
- Configure alertas no Vercel para erros 5xx
- Monitore uso do Supabase
- Acompanhe métricas de performance

### 2. Backup
- Configure backup automático do Supabase
- Documente procedimento de restore

### 3. Documentação para Usuários
- Manual de uso para administradores
- Guia de primeiros passos
- FAQ comum

## 📞 Suporte

Para dúvidas durante o deploy:
1. Verifique logs no Vercel Dashboard
2. Analise logs no Supabase
3. Consulte documentação oficial
4. Entre em contato com suporte técnico

---

**Importante**: Mantenha sempre backup dos dados antes de qualquer migração!