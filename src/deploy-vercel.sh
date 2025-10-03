#!/bin/bash

echo "🚀 Deploy TranspJardim para Vercel"
echo "===================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${BLUE}[TranspJardim]${NC} $1"
}

success() {
    echo -e "${GREEN}✅${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

error() {
    echo -e "${RED}❌${NC} $1"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script na pasta raiz do projeto TranspJardim"
    exit 1
fi

log "Verificando dependências..."

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    warning "Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

log "Limpando builds anteriores..."
rm -rf dist/
rm -rf .vercel/

log "Verificando tipos TypeScript..."
npm run type-check
if [ $? -ne 0 ]; then
    error "Erros de TypeScript encontrados. Corrija antes de continuar."
    exit 1
fi

log "Construindo aplicação..."
npm run build
if [ $? -ne 0 ]; then
    error "Falha no build. Verifique os logs acima."
    exit 1
fi

success "Build concluído com sucesso!"

log "Iniciando deploy no Vercel..."
echo ""
echo "📋 INFORMAÇÕES PARA O DEPLOY:"
echo "   • Framework: Vite"
echo "   • Build Command: npm run build"
echo "   • Output Directory: dist"
echo "   • Install Command: npm install"
echo ""
warning "IMPORTANTE: Configure as variáveis de ambiente após o deploy:"
echo "   • VITE_SUPABASE_URL"
echo "   • VITE_SUPABASE_ANON_KEY"
echo "   • VITE_RESEND_API_KEY"
echo ""

# Deploy para produção
vercel --prod

if [ $? -eq 0 ]; then
    success "🎉 Deploy realizado com sucesso!"
    echo ""
    echo "🔧 PRÓXIMOS PASSOS:"
    echo "1. Acesse https://vercel.com/dashboard"
    echo "2. Vá em Settings > Environment Variables"
    echo "3. Configure suas variáveis do Supabase e Resend"
    echo "4. Faça um redeploy se necessário"
    echo ""
    echo "🌐 Domínio customizado (opcional):"
    echo "   • Settings > Domains"
    echo "   • Adicione: transpjardim.jardim.ce.gov.br"
else
    error "Falha no deploy. Verifique os logs acima."
    exit 1
fi