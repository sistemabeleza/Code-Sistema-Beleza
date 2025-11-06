
# 📚 Como Colocar o Sistema Beleza no GitHub

## 🎯 Passo a Passo Completo

### **1. Instalar o Git** (se ainda não tiver)

**Windows**:
- Baixe em: https://git-scm.com/download/win
- Execute o instalador
- Aceite as configurações padrão

**Linux/Mac**:
```bash
# Linux (Ubuntu/Debian)
sudo apt-get install git

# Mac
brew install git
```

### **2. Configurar o Git (primeira vez)**

Abra o terminal e execute:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

### **3. Criar Repositório no GitHub**

1. Acesse https://github.com
2. Faça login (ou crie uma conta)
3. Clique no botão **"+"** (canto superior direito) → **"New repository"**
4. Preencha:
   - **Repository name**: `sistema-beleza` (ou o nome que preferir)
   - **Description**: "Sistema completo de gestão para salões de beleza"
   - **Visibilidade**: 
     - ✅ **Private** (recomendado para projetos comerciais)
     - ⚠️ Public (qualquer pessoa pode ver o código)
5. **NÃO** marque "Initialize this repository with a README"
6. Clique em **"Create repository"**

### **4. Preparar o Projeto Localmente**

Navegue até a pasta do projeto no terminal:

```bash
cd /home/ubuntu/sistema_salao_beleza
```

### **5. Inicializar o Repositório Git**

Execute os comandos na sequência:

```bash
# 1. Inicializar repositório
git init

# 2. Adicionar todos os arquivos (exceto os do .gitignore)
git add .

# 3. Criar o primeiro commit
git commit -m "🎉 Initial commit: Sistema Beleza completo"

# 4. Renomear branch para 'main'
git branch -M main
```

### **6. Conectar ao GitHub e Fazer Push**

Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub:

```bash
# Adicionar repositório remoto
git remote add origin https://github.com/SEU_USUARIO/sistema-beleza.git

# Enviar código para o GitHub
git push -u origin main
```

**Autenticação**: O GitHub vai pedir credenciais:
- **Username**: seu nome de usuário
- **Password**: use um **Personal Access Token** (não a senha da conta)

### **7. Criar Personal Access Token** (se necessário)

Se o GitHub pedir token:

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Dê um nome: "Sistema Beleza Upload"
4. Marque o escopo: **repo** (todos os sub-itens)
5. Clique em **"Generate token"**
6. **COPIE O TOKEN** (não vai aparecer de novo!)
7. Use esse token como senha ao fazer o push

### **8. Verificar Upload**

Após o push bem-sucedido:

1. Acesse: `https://github.com/SEU_USUARIO/sistema-beleza`
2. Você verá todo o código do projeto!

## 🔐 Segurança IMPORTANTE

### **Arquivos que NÃO devem ir para o GitHub**

O arquivo `.gitignore` já está configurado para proteger:

✅ `.env` (credenciais sensíveis)  
✅ `node_modules` (dependências)  
✅ `.next` (build temporário)  
✅ Uploads locais  

⚠️ **NUNCA** commite:
- Senhas de banco de dados
- Chaves de API (AWS, Cakto)
- Secrets do NextAuth
- Arquivos de backup com dados reais

### **Verificar se .env não está no Git**

```bash
git status
```

Se aparecer `.env` na lista, **remova imediatamente**:

```bash
git rm --cached .env
git commit -m "🔒 Remove .env do repositório"
git push
```

## 🚀 Workflow de Desenvolvimento

### **Fazendo Alterações no Código**

```bash
# 1. Verificar status
git status

# 2. Adicionar arquivos modificados
git add .

# 3. Commitar com mensagem descritiva
git commit -m "✨ Adiciona funcionalidade X"

# 4. Enviar para o GitHub
git push
```

### **Boas Práticas de Commit**

Use emojis e mensagens claras:

```bash
git commit -m "🐛 Corrige erro no cálculo de comissões"
git commit -m "✨ Adiciona filtro de data nos relatórios"
git commit -m "♻️ Refatora componente de agenda"
git commit -m "📝 Atualiza documentação da API"
git commit -m "🔒 Melhora validação de senhas"
```

### **Branches para Funcionalidades**

```bash
# Criar branch para nova funcionalidade
git checkout -b feature/nova-funcionalidade

# Trabalhar normalmente...
git add .
git commit -m "✨ Implementa nova funcionalidade"

# Enviar branch para o GitHub
git push -u origin feature/nova-funcionalidade

# Voltar para a main
git checkout main

# Merge da funcionalidade (após testar)
git merge feature/nova-funcionalidade
git push
```

## 📋 Checklist Final

Antes de fazer o primeiro push, verifique:

- [ ] Arquivo `.gitignore` está presente
- [ ] Arquivo `.env` NÃO está sendo rastreado
- [ ] Arquivo `.env.example` está presente (sem credenciais)
- [ ] `README.md` está completo
- [ ] Todas as dependências estão no `package.json`
- [ ] Código está funcionando localmente

## 🆘 Problemas Comuns

### **"Permission denied (publickey)"**

Solução: Use HTTPS em vez de SSH:
```bash
git remote set-url origin https://github.com/SEU_USUARIO/sistema-beleza.git
```

### **"Updates were rejected"**

Solução: Fazer pull antes do push:
```bash
git pull origin main --rebase
git push
```

### **"Large files detected"**

Solução: Remover uploads grandes:
```bash
git rm --cached nextjs_space/public/uploads/*
git commit -m "🗑️ Remove uploads grandes"
```

### **Desfazer último commit**

```bash
# Desfazer mas manter alterações
git reset --soft HEAD~1

# Desfazer e descartar alterações
git reset --hard HEAD~1
```

## 📞 Precisa de Ajuda?

Se encontrar problemas:
1. Veja a documentação oficial: https://docs.github.com
2. Tutorial interativo: https://try.github.io
3. Entre em contato: sistemabeleza.contato@gmail.com

## 🎉 Pronto!

Agora seu código está seguro no GitHub e você pode:
- ✅ Versionar todas as alterações
- ✅ Colaborar com outros desenvolvedores
- ✅ Fazer backup automático
- ✅ Deploy direto do GitHub (Vercel, etc)

---

**Comandos Rápidos de Referência**:

```bash
git status              # Ver status
git add .              # Adicionar tudo
git commit -m "msg"    # Commitar
git push               # Enviar
git pull               # Baixar
git log --oneline      # Ver histórico
```
