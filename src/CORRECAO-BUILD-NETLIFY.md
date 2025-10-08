# 🔧 **CORREÇÃO BUILD NETLIFY - TRANSPJARDIM**

## ❌ **PROBLEMA IDENTIFICADO**
```
Failed during stage 'building site': Build script returned non-zero exit code: 2
Deploy directory 'dist' does not exist
```

## ✅ **CORREÇÕES APLICADAS**

### **1. IMPORTS FIGMA:ASSET CORRIGIDOS**
❌ **Antes**: `import jardimLogo from 'figma:asset/...'`  
✅ **Depois**: `const jardimLogo = "/images/jardim-logo.png"`

**Arquivos corrigidos:**
- ✅ `/components/LoginForm.tsx`
- ✅ `/components/CriteriosList.tsx` 
- ✅ `/components/AdminPanel.tsx`
- ✅ `/components/Dashboard.tsx`
- ✅ `/components/JardimHeader.tsx`
- ✅ `/components/JardimFooter.tsx`
- ✅ `/App.tsx` (2 ocorrências)

### **2. VITE CONFIG OTIMIZADO**
```typescript
build: {
  outDir: 'dist',
  assetsDir: 'assets',
  sourcemap: false,
  minify: 'esbuild',        // ← Mudou de 'terser' para 'esbuild'
  target: 'esnext',         // ← Adicionado
  chunkSizeWarningLimit: 1000 // ← Adicionado
}
```

### **3. NETLIFY.TOML MELHORADO**
```toml
[build]
  publish = "dist"
  command = "npm ci && npm run type-check && npm run build"

[build.environment]
  NODE_VERSION = "18.19.0"  # ← Versão específica
  NPM_FLAGS = "--production=false"  # ← Adicionado
```

### **4. SCRIPT DE DEBUG CRIADO**
Arquivo: `/debug-build.js`
```bash
node debug-build.js
```

## 🚀 **TESTE LOCAL ANTES DO DEPLOY**

### **PASSO 1: Limpar cache**
```bash
rm -rf node_modules dist
npm install
```

### **PASSO 2: Verificar TypeScript**
```bash
npm run type-check
```

### **PASSO 3: Testar build**
```bash
npm run build
```

### **PASSO 4: Verificar dist**
```bash
ls -la dist/
```

## 🎯 **COMANDOS NETLIFY CORRETOS**

### **DEPLOY MANUAL (RECOMENDADO)**
```bash
# 1. Build local
npm run build

# 2. Verificar dist existe
ls dist/

# 3. Deploy no Netlify
netlify deploy --prod --dir=dist
```

### **VARIÁVEIS DE AMBIENTE**
```
VITE_SUPABASE_URL=https://dpnvtorphsxrncqtojvp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwbnZ0b3JwaHN4cm5jcXRvanZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjcwMDUsImV4cCI6MjA3NDc0MzAwNX0.sH9LSytHWu6ilUrp-zSgnwZ8Xq_pGb5TewavoYP3fYc
```

## 🔍 **SE AINDA FALHAR**

### **OPÇÃO A: Deploy Manual da Pasta Dist**
1. Fazer build local: `npm run build`
2. Ir para https://app.netlify.com/
3. Arrastar pasta `dist` para "Deploy manually"

### **OPÇÃO B: Debug Avançado**
```bash
# Executar debug script
node debug-build.js

# Verificar logs detalhados
npm run build 2>&1 | tee build.log
```

### **OPÇÃO C: Build Simples**
Alterar no `netlify.toml`:
```toml
[build]
  command = "npm install && npm run build"
```

## ✅ **PRINCIPAIS DIFERENÇAS**

| Aspecto | Antes | Depois |
|---------|--------|--------|
| **Imports** | `figma:asset` | `/images/jardim-logo.png` |
| **Minifier** | `terser` | `esbuild` |
| **Node Version** | `18` | `18.19.0` |
| **Build Command** | `npm run build` | `npm ci && npm run type-check && npm run build` |

## 🎉 **PRÓXIMOS PASSOS**

1. ✅ **Testar build local** com `npm run build`
2. ✅ **Fazer deploy manual** da pasta dist
3. ✅ **Configurar variáveis** de ambiente
4. ✅ **Testar site** funcionando
5. ✅ **Conectar domínio** transparenciajardim.app

---

## 🔥 **AGORA DEVE FUNCIONAR!**

**Principais problemas resolvidos:**
- ❌ Imports `figma:asset` incompatíveis
- ❌ Build command insuficiente  
- ❌ Configuração Vite subótima
- ❌ Node.js version genérica

**Todas as imagens agora apontam para `/images/jardim-logo.png` que existe no projeto!** 🎯