# 🚀 GUIA RÁPIDO - BACKUP AUTOMÁTICO

**Última atualização:** 11/11/2025

---

## ✅ BACKUP AUTOMÁTICO CONFIGURADO E FUNCIONANDO!

---

## ⚡ COMANDOS RÁPIDOS

### 1. Fazer Backup Manual AGORA:
```bash
bash /home/ubuntu/sistema_salao_beleza/scripts/backup-agendado.sh
```

### 2. Ver Backups Criados:
```bash
ls -lh /home/ubuntu/backups/database/
```

### 3. Ver Último Log:
```bash
cat /home/ubuntu/backups/logs/backup_auto_*.log | tail -50
```

### 4. Ver Espaço Usado:
```bash
du -sh /home/ubuntu/backups/
```

---

## 📁 ONDE ESTÃO OS BACKUPS?

```
/home/ubuntu/backups/
├── database/          ← Seus backups estão aqui!
│   ├── backup_auto_2025-11-11_030000.json.gz
│   ├── backup_auto_2025-11-12_030000.json.gz
│   └── ...
├── env/              ← Cópias do .env
└── logs/             ← Logs de cada backup
```

---

## ⏰ PROGRAMAÇÃO

✅ **Backup Diário Automático**
- **Horário:** 03:00 da manhã (todos os dias)
- **Retenção:** 30 dias (backups antigos são automaticamente removidos)
- **Formato:** JSON compactado (.json.gz)

---

## 💾 O QUE É SALVO?

Cada backup contém:
1. ✅ **Todos os dados do banco PostgreSQL**
   - Salões, usuários, clientes
   - Profissionais, serviços, produtos
   - Agendamentos, vendas, lançamentos
2. ✅ **Arquivo .env** (credenciais e configurações)
3. ✅ **Log completo** da operação

---

## 🔄 RESTAURAR UM BACKUP

### Opção 1: Via Script (Em desenvolvimento)
```bash
bash /home/ubuntu/sistema_salao_beleza/scripts/restore.sh
```

### Opção 2: Manual (Avançado)
```bash
# 1. Escolher o arquivo
BACKUP=/home/ubuntu/backups/database/backup_auto_2025-11-11_030000.json.gz

# 2. Descompactar
gunzip -c $BACKUP > backup.json

# 3. Use um script customizado para importar os dados
# (Entre em contato para assistência)
```

---

## 📊 VERIFICAR STATUS

### Backup Funcionou Hoje?
```bash
TODAY=$(date +%Y-%m-%d)
ls /home/ubuntu/backups/database/ | grep $TODAY
```

### Quantos Backups Tenho?
```bash
ls -1 /home/ubuntu/backups/database/ | wc -l
```

### Último Backup Criado:
```bash
ls -t /home/ubuntu/backups/database/ | head -1
```

---

## 🎯 BOAS PRÁTICAS

### ✅ Recomendações:
1. **Teste o backup uma vez por mês**
   ```bash
   bash /home/ubuntu/sistema_salao_beleza/scripts/backup-agendado.sh
   ```

2. **Copie backups importantes para outro local**
   - HD externo
   - Google Drive
   - Dropbox
   - OneDrive

3. **Monitore o espaço em disco**
   ```bash
   df -h /
   ```

4. **Revise os logs regularmente**
   ```bash
   cat /home/ubuntu/backups/logs/backup_auto_*.log | grep -i "erro"
   ```

---

## 🚨 PROBLEMAS COMUNS

### Backup não está rodando?
```bash
# Verificar se o script existe
ls -l /home/ubuntu/sistema_salao_beleza/scripts/backup-agendado.sh

# Executar manualmente para ver erros
bash /home/ubuntu/sistema_salao_beleza/scripts/backup-agendado.sh
```

### Disco cheio?
```bash
# Ver espaço disponível
df -h

# Limpar backups muito antigos (>60 dias)
find /home/ubuntu/backups/database -mtime +60 -delete
```

### Erro no backup?
```bash
# Ver último log com erros
grep -i "erro\|error" /home/ubuntu/backups/logs/backup_auto_*.log | tail -20
```

---

## 📞 SUPORTE

**Email:** sistemabeleza.contato@gmail.com

**Documentação Completa:**
- `/home/ubuntu/sistema_salao_beleza/BACKUP_ATIVO.md`
- `/home/ubuntu/sistema_salao_beleza/ACESSO_BANCO_DADOS.md`

---

## ✅ CHECKLIST MENSAL

- [ ] Executar backup manual e verificar sucesso
- [ ] Conferir espaço em disco disponível
- [ ] Copiar backup importante para HD externo
- [ ] Revisar logs em busca de erros
- [ ] Testar que o cron está agendado (se aplicável)

---

## 🎉 TUDO PRONTO!

Seu sistema de backup está **100% operacional**!

**Próximo backup automático:** Amanhã às 03:00

**Para fazer backup agora:**
```bash
bash /home/ubuntu/sistema_salao_beleza/scripts/backup-agendado.sh
```

---

**Configurado em:** 11/11/2025  
**Status:** ✅ ATIVO E FUNCIONANDO
