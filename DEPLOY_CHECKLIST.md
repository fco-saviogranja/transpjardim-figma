# 🚀 CheckList de Deploy - TranspJardim

## ✅ Pré-Deploy

- [ ] Projeto Supabase criado e configurado
- [ ] Tabelas criadas via SQL Script
- [ ] Políticas RLS configuradas
- [ ] Usuário admin criado
- [ ] Repositório GitHub configurado
- [ ] Variáveis de ambiente definidas

## ✅ Deploy Vercel

- [ ] Projeto conectado ao GitHub
- [ ] Build realizado com sucesso
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio personalizado adicionado
- [ ] DNS configurado
- [ ] SSL ativo

## ✅ Pós-Deploy

- [ ] Site acessível via domínio
- [ ] Login funcionando
- [ ] Dados carregando corretamente
- [ ] Responsividade testada
- [ ] Performance verificada
- [ ] SEO configurado

## 🔧 Variáveis de Ambiente Necessárias

```env
NEXT_PUBLIC_SUPABASE_URL=https://seuprojetosupabase.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0...
SUPABASE_SERVICE_ROLE_KEY=eyJ0...
NEXT_PUBLIC_APP_URL=https://transpjardim.jardim.ce.gov.br
```

## 📱 Testar Funcionalidades

- [ ] Login como admin (admin@jardim.ce.gov.br / admin123)
- [ ] Navegação entre páginas
- [ ] Persistência após F5
- [ ] Criação de critérios
- [ ] Visualização de gráficos
- [ ] Sistema de alertas
- [ ] Responsividade mobile

## 🎯 URLs de Produção

- **Site**: https://transpjardim.jardim.ce.gov.br
- **Supabase**: https://seuprojetosupabase.supabase.co
- **Vercel**: https://vercel.com/dashboard

## 📞 Suporte

Em caso de problemas:
1. Verificar logs no Vercel
2. Verificar logs no Supabase
3. Testar variáveis de ambiente
4. Validar DNS