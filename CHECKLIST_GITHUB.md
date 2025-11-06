
# ✅ CHECKLIST: Upload para GitHub

## 📋 Antes de Começar

- [ ] Tenho conta no GitHub (https://github.com)
- [ ] Sei meu usuário do GitHub
- [ ] Tenho acesso ao terminal

---

## 🚀 PASSO A PASSO

### 1️⃣ Criar Repositório no GitHub (5 min)

- [ ] Acessei: https://github.com
- [ ] Fiz login
- [ ] Cliquei no **"+"** → **"New repository"**
- [ ] Nome: `sistema-salao-beleza`
- [ ] Descrição: `Sistema de gestão para salões de beleza`
- [ ] Visibilidade: **Private** ✅
- [ ] NÃO marquei: README, .gitignore, license
- [ ] Cliquei em **"Create repository"**
- [ ] COPIEI a URL: `https://github.com/MEU-USUARIO/sistema-salao-beleza.git`

---

### 2️⃣ Criar Token de Acesso (3 min)

- [ ] Acessei: https://github.com/settings/tokens
- [ ] Cliquei: **"Generate new token (classic)"**
- [ ] Nome: `Sistema Beleza`
- [ ] Expiração: `No expiration`
- [ ] Marquei: ✅ **repo** (todas as opções)
- [ ] Cliquei: **"Generate token"**
- [ ] COPIEI o token (ghp_xxx...)
- [ ] GUARDEI em lugar seguro

---

### 3️⃣ Executar Upload (2 min)

**Comandos para copiar e colar:**

```bash
cd /home/ubuntu/sistema_salao_beleza
./upload-github.sh
```

**Quando pedir:**
- [ ] Colei a URL do repositório
- [ ] Digitei meu usuário do GitHub
- [ ] Colei o token como senha

---

### 4️⃣ Verificar se Funcionou

- [ ] Acessei meu repositório no GitHub
- [ ] Vejo os arquivos do projeto
- [ ] Vejo: README.md, nextjs_space/, scripts/
- [ ] NÃO vejo: .env, node_modules, .auth_config.json

---

## ✅ PRONTO!

**Seu código está no GitHub!** 🎉

**Link:** https://github.com/SEU-USUARIO/sistema-salao-beleza

---

## 🆘 Se der erro

### Erro: "Permission denied"
```bash
chmod +x upload-github.sh
./upload-github.sh
```

### Erro: "Support for password authentication was removed"
→ Use o Personal Access Token (não a senha normal)

### Erro: "remote origin already exists"
```bash
git remote remove origin
./upload-github.sh
```

---

## 📞 Próximos Passos

Depois de subir:

1. **Proteger credenciais:** ✅ Já feito (.env no .gitignore)
2. **Fazer backup regular:** ✅ Já configurado
3. **Começar vendas:** Use os planos já definidos
4. **Migrar infraestrutura:** Quando passar de 30 clientes

---

## 📚 Documentos Disponíveis

- ✅ README.md - Visão geral do projeto
- ✅ ANALISE_SISTEMA.md - Capacidade e limites
- ✅ BACKUP_GUIA_COMPLETO.md - Sistema de backup
- ✅ GITHUB_SETUP.md - Guia Git detalhado
- ✅ GUIA_UPLOAD_GITHUB.md - Este guia

---

**Tudo pronto para comercializar!** 💼✨
