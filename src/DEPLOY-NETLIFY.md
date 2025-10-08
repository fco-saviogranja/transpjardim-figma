# 🚀 **DEPLOY NETLIFY - TRANSPJARDIM**

## ✅ **CONFIGURAÇÃO ATUAL**

✅ **netlify.toml** configurado  
✅ **Build command** definido: `npm run build`  
✅ **Publish directory**: `dist`  
✅ **Node version**: 18  
✅ **SPA redirects** configurados  
✅ **Headers de segurança** aplicados  
✅ **Cache otimizado** para assets  

## 🎯 **DEPLOY OPÇÕES**

### **🔥 OPÇÃO A: NETLIFY CLI (RECOMENDADO)**

1. **Instalar Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login no Netlify**:
   ```bash
   netlify login
   ```

3. **Deploy do projeto**:
   ```bash
   # Build local
   npm run build
   
   # Deploy
   netlify deploy --prod --dir=dist
   ```

### **🌐 OPÇÃO B: NETLIFY UI (MAIS FÁCIL)**

1. **Acesse**: https://app.netlify.com/
2. **Clique**: "Add new site" → "Deploy manually"
3. **Arraste**: a pasta `dist` (após build local)
4. **Configure**: variáveis de ambiente

### **📂 OPÇÃO C: GIT INTEGRATION**

1. **Push** para GitHub/GitLab
2. **Connect** repositório no Netlify
3. **Auto-deploy** em cada commit

## ⚙️ **VARIÁVEIS DE AMBIENTE**

No painel do Netlify, adicione:

```
VITE_SUPABASE_URL=https://dpnvtorphsxrncqtojvp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwbnZ0b3JwaHN4cm5jcXRvanZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjcwMDUsImV4cCI6MjA3NDc0MzAwNX0.sH9LSytHWu6ilUrp-zSgnwZ8Xq_pGb5TewavoYP3fYc
```

## 🚨 **POSSÍVEIS PROBLEMAS E SOLUÇÕES**

### **❌ PROBLEMA**: `figma:asset` imports
**✅ SOLUÇÃO**: Continuam funcionando no Figma Make, mas falharão em prod

**Para corrigir em produção:**
- Upload das imagens para `/public/images/`
- Alterar imports para caminhos relativos

### **❌ PROBLEMA**: Build TypeScript
**✅ SOLUÇÃO**: Já configurado com `tsc && vite build`

### **❌ PROBLEMA**: Roteamento SPA
**✅ SOLUÇÃO**: Redirects já configurados no `netlify.toml`

## 🎉 **VANTAGENS DO NETLIFY**

✅ **Deploy mais rápido** que Vercel  
✅ **Edge Functions** nativas  
✅ **Forms** integrados (se precisar)  
✅ **CDN global** automático  
✅ **SSL** automático  
✅ **Preview deploys** para cada branch  

## 📋 **CHECKLIST PRÉ-DEPLOY**

- [ ] Build local funcionando: `npm run build`
- [ ] Pasta `dist` gerada com sucesso
- [ ] Arquivos de configuração presentes
- [ ] Variáveis de ambiente definidas
- [ ] Domínio `transparenciajardim.app` configurado

## 🔧 **COMANDOS ÚTEIS**

```bash
# Build local
npm run build

# Preview local
npm run preview

# Deploy manual
netlify deploy --prod --dir=dist

# Status do site
netlify status

# Logs do build
netlify build --debug
```

## 🎯 **PRÓXIMOS PASSOS APÓS DEPLOY**

1. ✅ **Testar URL** gerada pelo Netlify
2. ✅ **Configurar domínio** transparenciajardim.app
3. ✅ **Atualizar Supabase** settings com nova URL
4. ✅ **Testar login** e funcionalidades
5. ✅ **Monitorar performance** no painel Netlify

---

## 🔥 **QUAL OPÇÃO VOCÊ PREFERE?**

**A) Netlify CLI** (mais controle)  
**B) Netlify UI** (mais fácil)  
**C) Git Integration** (automático)  

**Me avise sua escolha e te guio passo a passo!** 🚀