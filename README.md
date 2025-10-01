# 🌱 TranspJardim

Sistema de Transparência e Monitoramento Municipal - Prefeitura de Jardim/CE

## 📋 Sobre o Projeto

O **TranspJardim** é uma plataforma moderna de transparência, eficiência e monitoramento de critérios para gestão pública municipal da Controladoria Municipal de Jardim/CE. Desenvolvido com tecnologias de ponta e baseado na identidade visual institucional.

## ⚡ Funcionalidades

- 📊 **Dashboard Interativo** - Visualização de métricas em tempo real
- 📈 **Análises Detalhadas** - Gráficos e relatórios personalizados  
- 🎯 **Gestão de Critérios** - CRUD completo com permissões por secretaria
- 🔔 **Sistema de Alertas** - Notificações baseadas em periodicidade
- 👥 **Multi-usuário** - Níveis admin e padrão com filtragem por secretaria
- 📱 **Responsivo** - Interface adaptada para todos os dispositivos
- 🔐 **Autenticação Segura** - JWT com Supabase Auth
- 📄 **Exportação Excel** - Relatórios para download

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS v4, Shadcn/ui
- **Backend**: Supabase (Database, Auth, Storage)
- **Deploy**: Vercel
- **Charts**: Recharts
- **Icons**: Lucide React

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Git
- Conta Supabase
- Conta Vercel (para deploy)

### Instalação Local

1. **Clone o repositório**
\`\`\`bash
git clone https://github.com/SEU_USUARIO/transpjardim.git
cd transpjardim
\`\`\`

2. **Instale dependências**
\`\`\`bash
npm install
\`\`\`

3. **Configure variáveis de ambiente**
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. **Configure Supabase**
- Crie projeto no Supabase
- Execute script SQL em \`/scripts/migrate-data.sql\`
- Adicione credenciais no \`.env.local\`

5. **Execute em desenvolvimento**
\`\`\`bash
npm run dev
\`\`\`

Acesse: \`http://localhost:3000\`

## 🔐 Usuários Padrão

- **Admin**: admin@jardim.ce.gov.br / admin123
- **User**: user@jardim.ce.gov.br / user123

## 📦 Deploy em Produção

1. **Push para GitHub**
2. **Conectar no Vercel**
3. **Configurar variáveis de ambiente**
4. **Deploy automático**

Detalhes: Consulte \`DEPLOY_CHECKLIST.md\`

## 🏛️ Estrutura de Secretarias

- Secretaria de Administração
- Secretaria de Finanças  
- Secretaria de Saúde
- Secretaria de Educação
- Secretaria de Infraestrutura
- Secretaria de Meio Ambiente
- Secretaria de Assistência Social

## 📊 Tipos de Critérios

- **Indicadores** - Métricas de performance
- **Metas** - Objetivos a serem alcançados
- **Processos** - Fluxos e procedimentos

## ⏰ Periodicidades

- 15/15 dias
- 30/30 dias  
- Mensal
- Bimestral
- Semestral
- Anual

## 🎨 Identidade Visual

O projeto segue a identidade visual oficial da Prefeitura de Jardim/CE:
- **Verde Institucional**: \`#4a7c59\`
- **Tipografia**: Sistema padrão otimizada
- **Logo**: Brasão oficial com tratamento circular

## 📄 Licença

Este projeto é de propriedade da **Prefeitura Municipal de Jardim/CE**.

## 🤝 Contribuição

Desenvolvido pela Controladoria Municipal de Jardim/CE.

---

**Prefeitura Municipal de Jardim - Ceará**  
*Transparência • Eficiência • Cidadania*