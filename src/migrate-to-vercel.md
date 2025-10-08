# 🚀 Guia Completo de Migração Netlify → Vercel

## ⚡ Migração Rápida (5 minutos)

### **Passo 1: Preparar Projeto**
```bash
# Limpar builds anteriores
rm -rf dist/
rm -rf .vercel/
```

### **Passo 2: Deploy Automático**
```bash
# Usar script otimizado
npm run deploy:vercel
```

**OU deploy manual:**
```bash
# Instalar Vercel CLI (se não tiver)
npm install -g vercel

# Build do projeto
npm run build

# Deploy direto
vercel --prod
```

### **Passo 3: Configurações no Deploy**
Quando o Vercel perguntar:

```
? Set up and deploy? [Y/n] Y
? Which scope? [Use arrows] [Seu usuário/organização]
? Link to existing project? [y/N] N
? What's your project's name? transpjardim
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

### **Passo 4: Variáveis de Ambiente**
1. Acesse https://vercel.com/dashboard
2. Clique no projeto **transpjardim**
3. Settings > Environment Variables
4. Adicione **APENAS** a variável obrigatória:

```
VITE_RESEND_API_KEY = re_[sua-chave-resend]
```

⚠️ **Marque todas as 3 opções:** Production, Preview, Development

**✅ Observação:** O Supabase já está configurado no código (não precisa de variáveis).

### **Passo 5: Domínio Customizado (Opcional)**
1. Settings > Domains
2. Add Domain: `transpjardim.jardim.ce.gov.br`
3. Configure DNS no provedor do domínio

## 🎯 Vantagens da Migração

### **Performance:**
- ✅ Build mais rápido (Vite otimizado)
- ✅ CDN global automático
- ✅ Edge computing

### **Recursos:**
- ✅ 100GB bandwidth gratuito
- ✅ Deploys ilimitados
- ✅ Preview automático
- ✅ Analytics incluído

### **Integração:**
- ✅ GitHub/GitLab automático
- ✅ CI/CD nativo
- ✅ Zero configuração

## 🔧 Diferenças do Netlify

| Recurso | Netlify | Vercel |
|---------|---------|--------|
| Build Command | `npm run build` | `npm run build` |
| Output Dir | `dist` | `dist` |
| Redirects | `_redirects` | `vercel.json` |
| Environment | Web UI | Web UI |
| Free Tier | 300 min/mês | 100GB/mês |

## 📋 Checklist Pós-Migração

- [ ] Site carregando corretamente
- [ ] Login funcionando
- [ ] Dashboard operacional  
- [ ] Sistema de e-mail ativo
- [ ] Alertas sendo gerados
- [ ] Performance satisfatória
- [ ] Mobile responsivo
- [ ] SEO mantido

## 🚨 Rollback (se necessário)

Se algo der errado, você pode:

1. **Voltar para Netlify** (resolver créditos)
2. **Usar GitHub Pages** (gratuito)
3. **Manter ambos** (redundância)

## 🎉 Resultado Final

Após a migração, seu TranspJardim estará:
- 🚀 **Mais rápido** (edge computing)
- 💰 **Mais econômico** (free tier generoso)
- 🔧 **Mais simples** (zero config)
- 📈 **Mais escalável** (serverless automático)

---

**Pronto para migrar? Execute:**
```bash
npm run deploy:vercel
```