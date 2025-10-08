# 🚨 **CORREÇÃO NETLIFY - DEPLOY FUNCIONAL**

## **PROBLEMA IDENTIFICADO:**
- ❌ Build falha no Netlify (exit code 2)
- ❌ Pasta `dist` não criada
- ❌ Variáveis de ambiente podem estar faltando

## **🔧 CORREÇÃO PASSO A PASSO:**

### **1. CONFIGURAR VARIÁVEIS DE AMBIENTE NO NETLIFY**

**VITAS:** https://app.netlify.com → Site Settings → Environment Variables

**Adicione estas variáveis:**

```
VITE_SUPABASE_URL=https://npwskmzevvhuwllvocnj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wd3NrbXpldnZodXdsbHZvY25qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc4NDA3NDcsImV4cCI6MjA0MzQxNjc0N30.0rT9kYO0P5vLjsRkp0K6u3wz2OKWaR6dWYKxLrIVmFc
```

### **2. AJUSTAR BUILD SETTINGS NO NETLIFY**

**Site Settings → Build & Deploy → Build Settings:**

**Build command:** `npm run build:netlify`
**Publish directory:** `dist`

### **3. ALTERNATIVA: BUILD SIMPLES**

Se ainda falhar, mude para:

**Build command:** `npm ci && npm run build`
**Publish directory:** `dist`

### **4. DEPLOY MANUAL (BACKUP)**

Se nada funcionar:
```bash
# Local:
npm run build
cd dist/
netlify deploy --prod --dir=.
```

---

## **🚀 TESTE RÁPIDO LOCAL:**

```bash
# Simular build do Netlify:
rm -rf dist/
VITE_SUPABASE_URL=https://npwskmzevvhuwllvocnj.supabase.co VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wd3NrbXpldnZodXdsbHZvY25qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc4NDA3NDcsImV4cCI6MjA0MzQxNjc0N30.0rT9kYO0P5vLjsRkp0K6u3wz2OKWaR6dWYKxLrIVmFc npm run build

ls dist/
```

## **⚡ COMANDOS DE EMERGÊNCIA:**

### **BUILD SEM TYPE-CHECK:**
```bash
# Se type-check estiver causando problema:
npm run build
```

### **BUILD COM DEBUG:**
```bash
# Ver erros detalhados localmente:
npm run build -- --logLevel=verbose
```

---

## **🎯 EXECUTE ESTE PRIMEIRO:**

1. **Configurar Environment Variables no Netlify**
2. **Mudar Build Command para: `npm run build:netlify`**
3. **Retry Deploy**

**SE AINDA FALHAR, execute local e deploy manual:**

```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## **📞 RESULTADO ESPERADO:**

✅ Build command: `npm run build:netlify`  
✅ Environment variables configuradas  
✅ Deploy successful  
✅ Site live em: `https://[site-name].netlify.app`

**Execute e me confirme o resultado!** 🚀