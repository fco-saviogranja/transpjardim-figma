# 🚀 COLOCAR SITE NO AR - PASSO A PASSO

## ⚡ DEPLOY RÁPIDO (5 minutos)

### PASSO 1: Preparar Vercel
1. **Acesse**: https://vercel.com
2. **Clique "Sign Up"** 
3. **Escolha "Continue with GitHub"** (mais fácil)
4. **Autorize** o Vercel no GitHub

### PASSO 2: Fazer Upload do Projeto
1. **No Vercel**, clique **"New Project"**
2. **Clique "Browse"** ou arraste a pasta do projeto
3. **Selecione TODOS os arquivos** desta pasta (App.tsx, package.json, etc.)
4. **Framework**: Vite (deve detectar automaticamente)
5. **Clique "Deploy"**
6. **Aguarde 2-3 minutos**

### PASSO 3: Configurar Domínio
1. **Após deploy**, vá em **"Settings" → "Domains"**
2. **Digite**: `transparenciajardim.app`
3. **Clique "Add"**
4. **Siga instruções** para configurar DNS

### PASSO 4: Atualizar Supabase
1. **Supabase Dashboard** → **Authentication** → **Settings**
2. **Site URL**: `https://transparenciajardim.app`
3. **Additional Redirect URLs**:
   ```
   https://transparenciajardim.app
   https://www.transparenciajardim.app
   https://*.vercel.app
   ```
4. **Salvar**

## 🎯 RESULTADO

✅ **Site funcionando**: https://transparenciajardim.app
✅ **Login funcionando** 
✅ **Banco de dados** conectado
✅ **Domínio personalizado** ativo

## 🆘 PRECISA DE AJUDA?

Se der erro ou travar em algum passo, me fale:
1. **Em que passo** travou
2. **Qual erro** apareceu
3. **Screenshot** se possível

**TEMPO TOTAL: 5-10 minutos máximo!**