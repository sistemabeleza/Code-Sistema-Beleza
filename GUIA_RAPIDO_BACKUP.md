
# 🚀 Computer Usea Rápido de Backup - Sistema Beleza

## ✅ Sistema Está PROTEGIDO!

Seu sistema já está configurado e pronto para fazer backups automáticos.

---

## 📦 COMO FAZER BACKUP MANUALMENTE (1 Comando)

```bash
cd /home/ubuntu/sistema_salao_beleza/nextjs_space
yarn tsx scripts/backup-database.ts
```

**Pronto!** Backup será criado em: `/home/ubuntu/backups/`

---

## ⏰ COMO AGENDAR BACKUP AUTOMÁTICO (Diário às 3h da manhã)

```bash
# 1. Abrir o editor de agendamentos
crontab -e

# 2. Adicionar esta linha no final:
0 3 * * * cd /home/ubuntu/sistema_salao_beleza/nextjs_space && yarn tsx scripts/backup-database.ts >> /home/ubuntu/backups/logs/cron.log 2>&1

# 3. Salvar e sair (Ctrl+X, depois Y, depois Enter)
```

**Pronto!** Backup automático todos os dias às 3h da manhã.

---

## 📁 ONDE ESTÃO OS BACKUPS?

```bash
# Ver todos os backups
ls -lh /home/ubuntu/backups/database/

# Ver último backup
ls -lt /home/ubuntu/backups/database/ | head -2
```

---

## 💾 O QUE É SALVO NO BACKUP?

✅ **Todos os dados do banco:**
- Salões cadastrados
- Usuários e senhas
- Clientes
- Profissionais
- Serviços
- Produtos
- Agendamentos
- Vendas
- Pagamentos
- Financeiro
- Relatórios

✅ **Arquivo .env** (suas credenciais)

---

## 🔐 COMO NUNCA PERDER SEU SISTEMA

### **REGRA DE OURO: 3-2-1**

```
3 = Ter 3 cópias dos seus dados
    ├─ 1 cópia no servidor (produção)
    ├─ 1 cópia no seu computador
    └─ 1 cópia na nuvem (Google Drive)

2 = Em 2 tipos de mídia diferentes
    ├─ Servidor
    └─ Google Drive ou HD externo

1 = 1 cópia fora do local (offsite)
    └─ Google Drive, Dropbox, etc
```

### **Passo a Passo Simples:**

#### **1. Fazer Backup Semanal no seu Computador**

No servidor:
```bash
cd /home/ubuntu/sistema_salao_beleza/nextjs_space
yarn tsx scripts/backup-database.ts
```

Depois, baixe o arquivo para seu computador:
```bash
# No seu computador, conecte por SCP/SFTP e baixe:
/home/ubuntu/backups/database/backup_*.json.gz
/home/ubuntu/backups/env/.env_*
```

#### **2. Guardar no Google Drive**

1. Acesse: https://drive.google.com
2. Crie uma pasta: "Sistema Beleza - Backups"
3. Faça upload dos arquivos baixados
4. Organize por data: "2025-11", "2025-12", etc

#### **3. Fazer Backup Mensal no HD Externo**

```bash
# Conectar HD externo e copiar
cp -r /home/ubuntu/backups /mnt/hd-externo/SistemaBeleza/
```

---

## 🔄 COMO RESTAURAR UM BACKUP

⚠️ **CUIDADO:** Isso vai substituir todos os dados atuais!

### **Método Seguro:**

```bash
# 1. Fazer backup de segurança primeiro
cd /home/ubuntu/sistema_salao_beleza/nextjs_space
yarn tsx scripts/backup-database.ts

# 2. Descompactar o backup que quer restaurar
gunzip /home/ubuntu/backups/database/backup_2025-11-06T22-35-33.json.gz

# 3. Restaurar (criar script de restauração se necessário)
# Por enquanto, entre em contato para ajuda na restauração
```

💡 **Dica:** Sempre teste a restauração em um ambiente de teste primeiro!

---

## ✅ CHECKLIST SEMANAL

```
[ ] Segunda-feira: Verificar se backup automático rodou
[ ] Quarta-feira: Fazer backup manual de teste
[ ] Sexta-feira: Baixar backup para seu computador
[ ] Domingo: Fazer upload para Google Drive
```

---

## 📊 VERIFICAR SE BACKUP ESTÁ FUNCIONANDO

```bash
# Ver últimos backups
ls -lht /home/ubuntu/backups/database/ | head -5

# Ver tamanho total dos backups
du -sh /home/ubuntu/backups/

# Ver espaço livre no disco
df -h /home

# Ver logs do cron (backups automáticos)
tail -f /home/ubuntu/backups/logs/cron.log
```

---

## 🆘 EMERGÊNCIA - SISTEMA CAIU!

### **Plano de Recuperação de Desastres:**

1. **Novo Servidor:**
   ```bash
   # Instalar Node.js e PostgreSQL
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs postgresql-client git
   ```

2. **Clonar Código do GitHub:**
   ```bash
   git clone https://github.com/SEU_USUARIO/sistema-beleza.git
   cd sistema-beleza/nextjs_space
   yarn install
   ```

3. **Restaurar .env:**
   ```bash
   # Copiar do backup
   cp /caminho/backup/.env_2025-11-06 .env
   ```

4. **Restaurar Banco:**
   ```bash
   # Criar novo banco e restaurar dados
   # (entre em contato para assistência)
   ```

5. **Iniciar Sistema:**
   ```bash
   yarn build
   yarn start
   ```

---

## 💡 DICAS IMPORTANTES

### ✅ FAÇA:
- Teste o backup semanalmente
- Mantenha múltiplas cópias
- Guarde backups em locais diferentes
- Documente suas senhas (em local seguro)
- Verifique se o backup automático está rodando

### ❌ NÃO FAÇA:
- Confiar em apenas 1 backup
- Guardar backup somente no servidor
- Esquecer de testar a restauração
- Deixar backups sem proteção
- Ignorar avisos de falha

---

## 📞 CONTATO E SUPORTE

**Email:** sistemabeleza.contato@gmail.com

---

## 🎯 COMANDOS MAIS USADOS

```bash
# Fazer backup agora
cd /home/ubuntu/sistema_salao_beleza/nextjs_space && yarn tsx scripts/backup-database.ts

# Ver últimos backups
ls -lht /home/ubuntu/backups/database/ | head -5

# Verificar espaço
du -sh /home/ubuntu/backups/

# Ver tarefas agendadas
crontab -l

# Ver logs do cron
tail -f /home/ubuntu/backups/logs/cron.log
```

---

## ✅ RESUMÃO - COMEÇAR AGORA (2 minutos)

```bash
# 1. Fazer primeiro backup
cd /home/ubuntu/sistema_salao_beleza/nextjs_space
yarn tsx scripts/backup-database.ts

# 2. Agendar backup diário (3h da manhã)
crontab -e
# Adicione: 0 3 * * * cd /home/ubuntu/sistema_salao_beleza/nextjs_space && yarn tsx scripts/backup-database.ts

# 3. Baixar backup para seu computador
# Use FileZilla, WinSCP ou:
scp usuario@servidor:/home/ubuntu/backups/database/backup_*.json.gz ~/Desktop/

# 4. Upload para Google Drive
# Acesse drive.google.com e faça upload

# 5. Pronto! Sistema protegido! ✅
```

---

**Última Atualização:** 06/11/2025  
**Versão:** 1.0.0  

🎉 **Seu sistema está PROTEGIDO contra perda de dados!**
