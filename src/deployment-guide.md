# Guia de Deploy do TranspJardim

## Visão Geral

O TranspJardim é uma plataforma de transparência e monitoramento para a Controladoria Municipal de Jardim/CE, otimizada para deploy em produção com infraestrutura moderna.

## Arquitetura

- **Frontend**: React + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (Edge Functions + Database)
- **Autenticação**: JWT via Supabase Auth
- **Storage**: LocalStorage (fallback) + Supabase Storage
- **Hospedagem recomendada**: Vercel ou Netlify
- **Domínio**: transpjardim.jardim.ce.gov.br (ou similar)

## Funcionalidades Principais

### 🔐 Sistema de Autenticação
- Login com username/password
- Níveis de usuário: admin e padrão
- Controle de acesso baseado em roles
- Session management automático

### 📊 Gestão de Critérios
- CRUD completo de critérios (apenas admin)
- Meta fixa de 100% para todos os critérios
- Periodicidades configuráveis: 15/15 dias, 30/30 dias, mensal, bimestral, semestral, anual
- Filtros por secretaria para usuários padrão
- Marcação de conclusão por usuário

### 🚨 Sistema de Alertas
- Alertas automáticos para vencimentos
- Notificações de metas não atingidas
- Sistema de marcação como lido
- Contador visual de alertas não lidos

### 📈 Relatórios e Dashboards
- Dashboard principal com métricas em tempo real
- Gráficos interativos (Recharts)
- Relatórios avançados (apenas admin)
- Análise por secretaria e periodicidade
- Exportação para Excel/CSV

### 🔄 Sistema Híbrido Online/Offline
- Fallback inteligente para modo offline
- Sincronização automática quando conectado
- Armazenamento local seguro
- Status de conexão em tempo real

## Preparação para Deploy

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-privada

# Opcional - Analytics/Monitoring
NEXT_PUBLIC_GA_ID=sua-ga-id
```

### 2. Configuração do Supabase

#### Database Schema
```sql
-- Tabela KV Store (já configurada)
CREATE TABLE kv_store_225e1157 (
  key TEXT PRIMARY KEY,
  value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Políticas RLS (Row Level Security)
ALTER TABLE kv_store_225e1157 ENABLE ROW LEVEL SECURITY;

-- Política para leitura (todos os usuários autenticados)
CREATE POLICY "Enable read for authenticated users" ON kv_store_225e1157
FOR SELECT USING (auth.role() = 'authenticated');

-- Política para escrita (todos os usuários autenticados)
CREATE POLICY "Enable write for authenticated users" ON kv_store_225e1157
FOR ALL USING (auth.role() = 'authenticated');
```

#### Edge Functions
As functions estão em `/supabase/functions/server/` e devem ser deployadas:

```bash
supabase functions deploy server
```

### 3. Deploy no Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar domínio customizado no dashboard do Vercel
# transpjardim.jardim.ce.gov.br
```

### 4. Deploy no Netlify

```bash
# Build
npm run build

# Upload da pasta dist/ para Netlify
# Configurar domínio customizado no dashboard do Netlify
```

## Configurações de DNS

Para o domínio `transpjardim.jardim.ce.gov.br`:

```dns
# CNAME para Vercel
transpjardim.jardim.ce.gov.br. CNAME cname.vercel-dns.com.

# ou A record para Netlify
transpjardim.jardim.ce.gov.br. A 75.2.60.5
```

## Monitoramento em Produção

### 1. Health Checks
- `/api/health` - Status da aplicação
- Sistema de monitoramento interno via `SystemHealthMonitor`
- Logs automáticos de conectividade

### 2. Error Tracking
- Console logging para debug
- Toast notifications para usuários
- Sistema de fallback robusto

### 3. Performance
- Lazy loading de componentes
- Memoização de cálculos pesados
- Otimização de re-renders

## Backup e Segurança

### 1. Backup de Dados
- Supabase realiza backups automáticos
- Exportação manual via relatórios Excel
- LocalStorage como fallback temporário

### 2. Segurança
- Todas as comunicações via HTTPS
- Autenticação JWT segura
- Sanitização de inputs
- Row Level Security no Supabase

## Usuários Padrão do Sistema

### Administrador
- **Username**: admin
- **Senha**: (definir em produção)
- **Acesso**: Completo a todas as funcionalidades

### Usuários por Secretaria
Cada secretaria deve ter um usuário padrão:
- educacao, saude, obras, ambiente, habitacao, agricultura, etc.
- **Acesso**: Limitado aos critérios da própria secretaria

## Checklist de Deploy

- [ ] Configurar variáveis de ambiente no Supabase
- [ ] Fazer deploy das Edge Functions
- [ ] Configurar RLS policies no banco
- [ ] Criar usuários iniciais no sistema
- [ ] Testar autenticação e autorização
- [ ] Configurar domínio personalizado
- [ ] Configurar SSL/TLS
- [ ] Testar funcionalidades offline
- [ ] Configurar monitoramento
- [ ] Treinar usuários finais

## Suporte e Manutenção

### 1. Logs e Debugging
- Painel de debug acessível via Ctrl+Shift+D
- Logs detalhados no console
- Sistema de toast para feedback visual

### 2. Atualizações
- Deploy contínuo via Git
- Rollback automático em caso de falhas
- Versionamento semântico

### 3. Escalabilidade
- Supabase escala automaticamente
- CDN global via Vercel/Netlify
- Caching otimizado

## Contato de Suporte

Para questões técnicas:
- **Sistema**: TranspJardim v1.0
- **Tecnologia**: React + Supabase
- **Documentação**: Este arquivo

---

**Desenvolvido para a Prefeitura Municipal de Jardim/CE**  
*Transparência, Eficiência e Modernidade*