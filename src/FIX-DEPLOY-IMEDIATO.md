# 🚨 **CORREÇÃO DEPLOY - IMEDIATA**

## **PROBLEMA IDENTIFICADO:**
- ✅ Build funciona perfeitamente
- ❌ Vite cria `build/` mas Netlify procura `dist/`
- ❌ Configuração conflitante entre CLI e config file

## **🔧 CORREÇÃO IMEDIATA - 2 OPÇÕES:**

### **OPÇÃO 1: FORÇAR DIST (MAIS RÁPIDO)**

```bash
# 1. Limpar tudo:
rm -rf dist/ build/ build-test/

# 2. Build forçando dist:
npx vite build --outDir dist

# 3. Verificar:
ls dist/

# 4. Deploy:
netlify deploy --prod --dir=dist
```

### **OPÇÃO 2: AJUSTAR NETLIFY PARA BUILD**

```bash
# 1. Build normal (cria build/):
npm run build

# 2. Deploy apontando para build/:
netlify deploy --prod --dir=build
```

---

## **🎯 EXECUTE ESTE COMANDO AGORA:**

```bash
rm -rf dist/ build/ build-test/
npx vite build --outDir dist --config vite.config.ts
ls dist/
netlify deploy --prod --dir=dist
```

---

## **🔍 SE AINDA FALHAR:**

### **Teste com config minimal:**

```bash
npx vite build --config vite.config.minimal.ts --outDir dist
ls dist/
netlify deploy --prod --dir=dist
```

### **Deploy via Netlify UI com correção:**

1. **Netlify Dashboard → Site Settings → Build & Deploy**
2. **Build command:** `npx vite build --outDir dist`
3. **Publish directory:** `dist`
4. **Retry Deploy**

---

## **⚡ COMANDO DE EMERGÊNCIA:**

```bash
# Build + Deploy em uma linha:
rm -rf dist && npx vite build --outDir dist && ls dist && netlify deploy --prod --dir=dist
```

**EXECUTE E ME CONFIRME O RESULTADO!** 🚀