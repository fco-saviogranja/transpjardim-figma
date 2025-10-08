#!/bin/bash

echo "🔥 TESTE FINAL - BUILD NORMAL"
echo "============================="

# Limpar builds anteriores
echo "1. Limpando builds anteriores..."
rm -rf dist/ build-test/

# Build normal (deve funcionar agora)
echo ""
echo "2. Executando build normal..."
npm run build

# Verificar resultado
echo ""
echo "3. Verificando pasta dist..."
if [ -d "dist" ]; then
    echo "✅ SUCESSO! Pasta dist criada!"
    echo ""
    echo "📁 Conteúdo:"
    ls -la dist/
    echo ""
    echo "📊 Tamanho:"
    du -sh dist/
    echo ""
    echo "🎯 PRONTO PARA DEPLOY NO NETLIFY!"
else
    echo "❌ Pasta dist NÃO criada"
    echo "🔍 Verificando se há erro..."
fi

echo ""
echo "4. Testando preview local (opcional)..."
echo "Execute: npm run preview"
echo ""
echo "🚀 PRÓXIMO PASSO: Deploy no Netlify!"
echo "Execute: npm run deploy:netlify"