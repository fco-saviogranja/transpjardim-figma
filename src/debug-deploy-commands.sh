#!/bin/bash

echo "🔧 Deploy Debug - Admin Panel Fix"
echo "=================================="

# Verificar status
echo "📋 Status atual do repositório:"
git status

# Adicionar mudanças
echo ""
echo "📦 Adicionando arquivos..."
git add .

# Commit
echo ""
echo "💾 Commit das mudanças..."
git commit -m "debug: modo debug admin panel para identificar problema configurações/backup"

# Push para trigger deploy
echo ""
echo "🚀 Fazendo push para deploy..."
git push origin main

echo ""
echo "✅ Deploy iniciado!"
echo ""
echo "🔍 Para testar:"
echo "1. Acesse: https://transparenciajardim.app"
echo "2. Login: admin/admin"
echo "3. Clique em 'Administração'"
echo "4. Verá painel DEBUG vermelho"
echo "5. Teste os botões de Configurações e Backup"
echo "6. Observe logs de debug em tempo real"
echo ""
echo "📊 Verifique também o Console do navegador (F12)"
echo "🐛 Reporte o resultado: funcionou ou quais erros apareceram"