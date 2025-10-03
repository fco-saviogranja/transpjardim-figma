# 📧 **SOLUÇÃO DO ERRO: API Key do Resend**

## ❌ **Erro Atual:**
```
[EmailService] Erro na resposta: API Key do Resend inválida ou expirada
❌ Erro ao enviar e-mail: Error: API Key do Resend inválida ou expirada
```

## ✅ **SOLUÇÃO RÁPIDA (5 minutos):**

---

## 🚀 **Como Configurar o Resend (100% Gratuito)**

### **Passo 1: Criar Conta no Resend**

1. **Acesse:** https://resend.com
2. **Clique em "Sign Up"**
3. **Preencha:**
   - E-mail: `seu-email@dominio.com`
   - Nome: `Controladoria Jardim`
   - Senha: escolha uma senha segura
4. **Confirme o e-mail** que será enviado

---

### **Passo 2: Gerar API Key**

1. **Faça login** no dashboard do Resend
2. **No menu lateral:** clique em **"API Keys"**
3. **Clique:** "Create API Key"
4. **Configure:**
   - **Name:** `TranspJardim-Alertas`
   - **Permission:** `Send emails` (padrão)
   - **Domain:** deixe em branco por enquanto
5. **Clique:** "Create"
6. **⚠️ IMPORTANTE:** Copie a chave que aparece **IMEDIATAMENTE**
   - Formato: `re_xxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Ela só aparece uma vez!

---

### **Passo 3: Configurar no Sistema**

#### **✅ MÉTODO RECOMENDADO (Via Interface):**
1. **No TranspJardim:**
   - Login como admin (`admin` / `admin`)
   - Vá em **"Administração"** → **"Sistema de E-mail"**
   - Na aba **"Configurar"** → Siga o guia rápido
   - Cole sua API Key e clique **"Salvar"**
   - ✅ **Teste o envio** na aba "Teste Rápido"

#### **⚙️ Alternativa Técnica:**
```bash
# Configurar diretamente na variável de ambiente
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
```
**Nota:** Após configurar, recarregue a página do TranspJardim.

---

### **Passo 4: Testar Funcionamento**

1. **No painel de e-mail** do TranspJardim
2. Vá na aba **"Teste"**
3. **Digite seu e-mail**
4. **Clique:** "Enviar Teste"
5. **Verifique:** se recebeu o e-mail (pode ir para spam)

---

## 📊 **Limites Gratuitos do Resend**

| Recurso | Limite Gratuito |
|---------|----------------|
| **E-mails/mês** | 3.000 |
| **E-mails/dia** | 100 |
| **Domínios** | 1 |
| **API Keys** | Ilimitadas |
| **Templates** | Ilimitados |

---

## 🔧 **Configurações Avançadas (Opcional)**

### **Domínio Personalizado**
Para usar `@transparenciajardim.app` em vez de `@resend.dev`:

1. **No Resend:** vá em "Domains"
2. **Adicione:** `transparenciajardim.app`
3. **Configure DNS** conforme instruções
4. **Aguarde verificação** (até 24h)

### **Templates Personalizados**
1. **No Resend:** vá em "Templates"
2. **Crie templates** HTML personalizados
3. **Use no TranspJardim** via API

---

## 🛠️ **Solução de Problemas**

### **E-mail não chegou?**
- ✅ Verifique a **pasta de spam**
- ✅ Confirme se a **API key está correta**
- ✅ Teste com **outro e-mail**

### **Erro "API Key inválida"?**
- ✅ Verifique se **copiou corretamente**
- ✅ Gere uma **nova API key**
- ✅ Confirme se **não tem espaços extras**

### **Erro "Rate Limit"?**
- ✅ Aguarde alguns minutos
- ✅ Verifique se **não excedeu 100 e-mails/dia**

---

## 📞 **Suporte**

**Problemas técnicos:**
- Controladoria: `controladoria@jardim.ce.gov.br`
- Suporte Resend: https://resend.com/support

**Documentação:**
- Resend API: https://resend.com/docs
- TranspJardim: Sistema interno

---

## ✅ **Checklist de Configuração**

- [ ] Conta criada no Resend
- [ ] E-mail confirmado
- [ ] API Key gerada e copiada
- [ ] API Key configurada no TranspJardim
- [ ] Teste de e-mail realizado com sucesso
- [ ] E-mail recebido (verificar spam)

---

**🎉 Parabéns! O sistema de e-mail está configurado e funcionando!**

O TranspJardim agora enviará automaticamente alertas por e-mail quando:
- ✉️ Critérios estiverem próximos do vencimento
- ✉️ Metas estiverem abaixo do esperado
- ✉️ Houver problemas críticos no sistema

**Nota:** Os e-mails são enviados apenas em **dias úteis** para evitar spam nos fins de semana.