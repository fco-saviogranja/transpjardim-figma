#!/bin/bash

echo "🔧 TESTE DE BUILD - TRANSPJARDIM"
echo "================================"

# Limpar dist se existir
echo "1. Limpando build anterior..."
rm -rf dist/
echo "✅ Dist limpo"

# Verificar Node.js
echo ""
echo "2. Verificando ambiente..."
echo "Node.js: $(node --version)"
echo "NPM: $(npm --version)"

# Verificar dependências
echo ""
echo "3. Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
else
    echo "✅ node_modules existe"
fi

# Testar TypeScript isoladamente
echo ""
echo "4. Testando TypeScript..."
npx tsc --noEmit --skipLibCheck 2>&1 | head -20
if [ $? -eq 0 ]; then
    echo "✅ TypeScript passou"
else
    echo "❌ TypeScript falhou - continuando..."
fi

# Testar Vite build
echo ""
echo "5. Testando Vite build..."
npm run build 2>&1 | tee build-output.log

# Verificar resultado
echo ""
echo "6. Verificando resultado..."
if [ -d "dist" ]; then
    echo "✅ Pasta dist criada!"
    echo "📁 Conteúdo da dist:"
    ls -la dist/
    echo "📊 Tamanho:"
    du -sh dist/
else
    echo "❌ Pasta dist NÃO foi criada"
    echo "📋 Últimas linhas do build:"
    tail -10 build-output.log
fi

echo ""
echo "🎯 Teste concluído!"