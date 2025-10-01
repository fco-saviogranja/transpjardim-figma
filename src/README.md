# TranspJardim 🏛️

Sistema de Transparência e Monitoramento da Controladoria Municipal de Jardim/CE

## 🌟 Sobre o Projeto

O TranspJardim é uma plataforma moderna de transparência e monitoriamento desenvolvida para a Controladoria Municipal de Jardim, Ceará. O sistema permite o acompanhamento de critérios e metas das secretarias municipais, promovendo transparência na gestão pública.

### ✨ Funcionalidades Principais

- **🔐 Sistema de Autenticação**: Login seguro com JWT e diferentes níveis de usuário
- **📊 Dashboard Intuitivo**: Visualização de métricas e status em tempo real
- **🎯 Gestão de Critérios**: Criação e monitoramento de critérios por secretaria
- **📅 Periodicidade Flexível**: Suporte a diferentes intervalos (15 dias, mensal, bimestral, etc.)
- **🚨 Sistema de Alertas**: Notificações automáticas para prazos e pendências
- **📈 Relatórios Avançados**: Análises detalhadas para administradores
- **📱 Design Responsivo**: Interface adaptada para desktop e mobile
- **🔄 Modo Offline**: Fallback inteligente quando servidor indisponível
- **🎨 Identidade Visual**: Design baseado na identidade de Jardim/CE

### 🏢 Secretarias Atendidas

- Controladoria Municipal
- Secretaria de Saúde
- Secretaria de Educação
- Secretaria de Obras
- Secretaria de Assistência Social

## 🚀 Tecnologias

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS V4** para estilização
- **Vite** como bundler
- **Zustand** para gerenciamento de estado
- **React Hook Form** + **Zod** para formulários
- **Recharts** para gráficos
- **Lucide React** para ícones
- **Sonner** para notificações

### Backend
- **Supabase** (PostgreSQL + Edge Functions)
- **Row Level Security (RLS)** para segurança
- **Realtime subscriptions** para atualizações em tempo real

### Deploy e Infraestrutura
- **Vercel** ou **Netlify** para hosting
- **Supabase Cloud** para backend
- **GitHub Actions** para CI/CD

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Conta no Vercel ou Netlify

## 🛠️ Instalação Local

1. **Clone o repositório**
```bash
git clone https://github.com/jardim-ce/transpjardim.git
cd transpjardim
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

4. **Execute o projeto**
```bash
npm run dev
```

Acesse: http://localhost:5173

## 🚀 Deploy em Produção

### Opção 1: Vercel (Recomendado)

1. Conecte seu repositório no [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente
3. Deploy automático!

### Opção 2: Netlify

1. Conecte seu repositório no [Netlify](https://netlify.com)
2. Configure as variáveis de ambiente
3. Deploy automático!

**📖 Para instruções detalhadas, consulte o [Guia de Deploy](./production-deployment-guide.md)**

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- **usuarios**: Cadastro e permissões dos usuários
- **criterios**: Critérios de monitoramento por secretaria
- **criterio_conclusoes**: Conclusões marcadas pelos usuários
- **alertas**: Sistema de notificações

### Relacionamentos

```
usuarios (1) -----> (N) criterio_conclusoes
criterios (1) -----> (N) criterio_conclusoes
usuarios (1) -----> (N) alertas
```

## 👥 Níveis de Usuário

### 👑 Administrador
- Acesso completo ao sistema
- Gestão de usuários e critérios
- Relatórios avançados
- Configurações globais

### 👤 Usuário Padrão
- Visualiza critérios da própria secretaria
- Marca conclusões de tarefas
- Recebe alertas personalizados
- Acesso ao dashboard básico

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run build           # Build para produção
npm run preview         # Preview do build

# Deploy
npm run deploy:vercel   # Deploy no Vercel
npm run deploy:netlify  # Deploy no Netlify

# Utilitários
npm run type-check      # Verificação de tipos
npm run lint            # Análise de código
npm run backup:data     # Backup dos dados
```

## 📈 Monitoramento

### Health Checks
- ✅ Conectividade com Supabase
- ✅ Status dos serviços
- ✅ Performance da aplicação
- ✅ Logs de erro em tempo real

### Métricas Disponíveis
- Total de critérios por status
- Percentual de cumprimento
- Alertas ativos
- Conclusões por usuário
- Performance por secretaria

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🏛️ Entidade Responsável

**Controladoria Municipal de Jardim/CE**
- Website: https://jardim.ce.gov.br
- Email: controladoria@jardim.ce.gov.br
- Telefone: (88) 3xxx-xxxx

## 📞 Suporte

Para suporte técnico:
- 📧 Email: suporte.transpjardim@jardim.ce.gov.br
- 📱 WhatsApp: (88) 9xxxx-xxxx
- 🕒 Horário: Segunda a Sexta, 8h às 17h

---

<div align="center">
  <img src="https://via.placeholder.com/100x100/4a7c59/ffffff?text=JCE" alt="Jardim/CE" width="60"/>
  <br>
  <strong>Desenvolvido com ❤️ para Jardim/CE</strong>
  <br>
  <em>Transparência • Eficiência • Cidadania</em>
</div>