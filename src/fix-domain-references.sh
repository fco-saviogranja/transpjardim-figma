#!/bin/bash

echo "🔄 Corrigindo todas as referências do domínio antigo..."

# Lista de arquivos importantes para correção
files_to_fix=(
    "/supabase/functions/server/index.tsx"
    "/components/DomainSetupGuide.tsx"
    "/components/FlexibleEmailTest.tsx"
    "/components/EmailTestModeStatus.tsx"
    "/hooks/useSystemConfig.ts"
)

echo "📝 Fazendo backup dos arquivos originais..."
for file in "${files_to_fix[@]}"; do
    if [ -f ".${file}" ]; then
        cp ".${file}" ".${file}.backup-$(date +%Y%m%d_%H%M%S)"
        echo "   ✓ Backup: ${file}"
    fi
done

echo ""
echo "🔄 Substituindo transparenciajardim.app por transpjardim.tech..."

# Fazer substituições nos arquivos principais
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" \) -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./backup/*" -exec sed -i 's/transparenciajardim\.app/transpjardim.tech/g' {} + 2>/dev/null || true

echo "✅ Substituições concluídas!"
echo ""
echo "📋 Arquivos principais corrigidos:"
for file in "${files_to_fix[@]}"; do
    if [ -f ".${file}" ]; then
        count=$(grep -c "transpjardim.tech" ".${file}" 2>/dev/null || echo "0")
        if [ "$count" -gt 0 ]; then
            echo "   ✅ ${file} - ${count} referência(s) atualizadas"
        else
            echo "   ⚠️  ${file} - nenhuma referência encontrada"
        fi
    else
        echo "   ❌ ${file} - arquivo não encontrado"
    fi
done

echo ""
echo "🔍 Verificando se ainda existem referências antigas..."
remaining=$(find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" \) -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./backup/*" -exec grep -l "transparenciajardim\.app" {} + 2>/dev/null | wc -l)

if [ "$remaining" -gt 0 ]; then
    echo "⚠️  Ainda existem $remaining arquivo(s) com referências antigas:"
    find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" \) -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./backup/*" -exec grep -l "transparenciajardim\.app" {} + 2>/dev/null | head -10
else
    echo "✅ Todas as referências foram atualizadas!"
fi

echo ""
echo "🚀 Próximos passos:"
echo "1. git add ."
echo "2. git commit -m \"feat: atualizar domínio para transpjardim.tech\""
echo "3. git push"
echo "4. Fazer novo deploy"
echo ""
echo "💡 Se o problema persistir, verifique:"
echo "   - Configurações do Supabase (Site URL)"
echo "   - Variáveis de ambiente do deploy"
echo "   - Cache do browser (Ctrl+F5)"