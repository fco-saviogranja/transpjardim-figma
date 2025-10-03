# 🔧 Configuração de Variáveis de Ambiente - Vercel

## ⚡ Setup Rápido das Variáveis

### 1. Acesse o Dashboard Vercel
```
https://vercel.com/dashboard
```

### 2. Vá para o seu projeto TranspJardim
- Clique no projeto recém-criado
- Vá em **Settings** > **Environment Variables**

### 3. Adicione as Variáveis (uma por vez)

#### 🗄️ **Supabase Database**
```
Nome: VITE_SUPABASE_URL
Valor: https://[SEU-PROJECT-ID].supabase.co
Environments: Production, Preview, Development
```

```
Nome: VITE_SUPABASE_ANON_KEY  
Valor: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9... (sua chave anon)
Environments: Production, Preview, Development
```

#### 📧 **Resend Email API**
```
Nome: VITE_RESEND_API_KEY
Valor: re_[SUA-CHAVE-RESEND]
Environments: Production, Preview, Development
```

### 4. Redeploy Automático
- Após adicionar as variáveis, o Vercel fará redeploy automático
- Aguarde alguns minutos para conclusão

## 🔍 Como Encontrar suas Chaves

### **Supabase:**
1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Settings > API
4. Copie "URL" e "anon public"

### **Resend:**
1. Acesse https://resend.com/dashboard
2. API Keys > Create API Key
3. Copie a chave gerada

## ✅ Verificação Final

Depois de configurar, acesse seu site e verifique:
- ✅ Login funcionando
- ✅ Dashboard carregando
- ✅ Sistema de e-mail operacional
- ✅ Alertas sendo gerados

## 🚨 Troubleshooting

Se algo não funcionar:
1. Verifique se as variáveis estão corretas
2. Confirme que aplicou em todos environments
3. Aguarde o redeploy completar
4. Limpe cache do navegador (Ctrl+F5)