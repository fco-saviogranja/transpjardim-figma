#!/bin/bash

# 🚀 Build Script para Netlify - TranspJardim
# Este script otimiza o build para o ambiente Netlify

echo "🏗️  Iniciando build para Netlify..."

# Limpar cache e node_modules se necessário
echo "🧹 Limpando caches..."
rm -rf node_modules/.cache
rm -rf dist

# Instalar dependências com cache otimizado
echo "📦 Instalando dependências..."
npm ci --prefer-offline --no-audit

# Verificar TypeScript
echo "🔍 Verificando TypeScript..."
npx tsc --noEmit

# Build otimizado
echo "⚡ Gerando build de produção..."
npm run build

# Verificar se o build foi bem-sucedido
if [ -d "dist" ]; then
    echo "✅ Build concluído com sucesso!"
    echo "📊 Tamanho do build:"
    du -sh dist/
    echo "📋 Arquivos gerados:"
    ls -la dist/
else
    echo "❌ Erro no build - pasta dist não foi criada"
    exit 1
fi

echo "🎉 Build pronto para deploy no Netlify!"