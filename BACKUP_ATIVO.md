# 🔄 BACKUP AUTOMÁTICO ATIVO - SISTEMA BELEZA

**Data de configuração:** 11/11/2025

---

## ✅ BACKUP AUTOMÁTICO CONFIGURADO!

O sistema de backup automático está **ATIVO** e funcionando!

---

## ⏰ PROGRAMAÇÃO

| Horário | Ação | Frequência |
|---------|------|------------|
| **03:00** | Backup completo do banco | Diariamente |
| **04:00** | Limpeza de backups antigos | Diariamente |

**Retenção:** Últimos 30 dias de backups são mantidos

---

## 💾 O QUE É FEITO NO BACKUP

### Backup Completo Inclui:

1. **Banco de Dados PostgreSQL**
   - Formato binário (.backup) - para restauração rápida
   - Formato SQL compactado (.sql.gz) - legível e portátil

2. **Arquivo .env**
   - Todas as variáveis de ambiente
   - Credenciais e configurações

3. **Logs de Backup**
   - Registro completo de cada operação
   - Histórico de sucessos/falhas

---

## 📁 LOCALIZAÇÃO DOS BACKUPS

```
/home/ubuntu/backups/
├── database/
│   ├── backup_auto_20251111_030000.backup
│   ├── backup_auto_20251111_030000.sql.gz
│   ├── backup_auto_20251112_030000.backup
│   └── ...
├── env/
│   ├── .env_20251111_030000
│   ├── .env_20251112_030000
│   └── ...
└── logs/
    ├── backup_agendado_20251111_030000.log
    └── ...
```

---

## 🔧 GERENCIAR BACKUPS

### Executar Backup Manual Agora:

```bash
cd /home/ubuntu/sistema_salao_beleza
bash scripts/backup-agendado.sh
```

### Ver Backups Existentes:

```bash
ls -lh /home/ubuntu/backups/database/
```

### Ver Logs de Backup:

```bash
# Ver último log
ls -t /home/ubuntu/backups/logs/ | head -1 | xargs -I {} cat /home/ubuntu/backups/logs/{}

# Ver últimos 10 logs
ls -t /home/ubuntu/backups/logs/ | head -10
```

### Ver Espaço Usado:

```bash
du -sh /home/ubuntu/backups/
```

---

## 🔄 RESTAURAR UM BACKUP

### Método 1: Via Script (Recomendado)

```bash
cd /home/ubuntu/sistema_salao_beleza
bash scripts/restore.sh
```

### Método 2: Manual (Arquivo .backup)

```bash
# Escolha o arquivo de backup
BACKUP_FILE="/home/ubuntu/backups/database/backup_auto_20251111_030000.backup"

# Restaurar
pg_restore -h db-42302409.db002.hosteddb.reai.io \
           -p 5432 \
           -U role_42302409 \
           -d 42302409 \
           --clean \
           --if-exists \
           "$BACKUP_FILE"
```

### Método 3: Manual (Arquivo SQL)

```bash
# Descompactar e restaurar
gunzip -c /home/ubuntu/backups/database/backup_auto_20251111_030000.sql.gz | \
psql -h db-42302409.db002.hosteddb.reai.io \
     -p 5432 \
     -U role_42302409 \
     -d 42302409
```

---

## 📊 MONITORAMENTO

### Verificar Status dos Backups:

```bash
cd /home/ubuntu/sistema_salao_beleza
bash scripts/verify-backups.sh
```

### Ver Últimos Backups:

```bash
ls -lth /home/ubuntu/backups/database/ | head -10
```

### Verificar Se Backup Rodou Hoje:

```bash
# Verificar se existe backup de hoje
TODAY=$(date +%Y%m%d)
ls /home/ubuntu/backups/database/ | grep $TODAY
```

---

## 🚨 ALERTAS E NOTIFICAÇÕES

### Se Backup Falhar:

Os logs são salvos em `/home/ubuntu/backups/logs/`

Para verificar erros:
```bash
grep -i "erro\|error\|fail" /home/ubuntu/backups/logs/backup_agendado_*.log
```

---

## 📋 CHECKLIST DE VERIFICAÇÃO MENSAL

- [ ] Verificar se backups estão sendo criados diariamente
- [ ] Testar restauração de um backup antigo
- [ ] Verificar espaço em disco disponível
- [ ] Revisar logs de backup para erros
- [ ] Copiar backups importantes para HD externo
- [ ] Verificar se limpeza automática está funcionando

---

## 🎯 BOAS PRÁTICAS

### ✅ Faça:
- Teste restauração pelo menos 1x por mês
- Mantenha cópias em locais diferentes (HD externo, nuvem)
- Revise logs regularmente
- Monitore espaço em disco

### ❌ Não faça:
- Deletar backups manualmente sem necessidade
- Ignorar mensagens de erro nos logs
- Deixar disco cheio (pode impedir novos backups)
- Modificar scripts sem fazer backup antes

---

## 🔐 SEGURANÇA

- ✅ Backups contêm dados sensíveis
- ✅ Mantenha permissões restritas
- ✅ Não compartilhe backups publicamente
- ✅ Criptografe antes de enviar para nuvem

---

## 📞 COMANDOS RÁPIDOS

### Backup Manual:
```bash
bash /home/ubuntu/sistema_salao_beleza/scripts/backup-agendado.sh
```

### Listar Backups:
```bash
ls -lh /home/ubuntu/backups/database/
```

### Ver Último Log:
```bash
ls -t /home/ubuntu/backups/logs/ | head -1 | xargs -I {} cat /home/ubuntu/backups/logs/{}
```

### Espaço Usado:
```bash
du -sh /home/ubuntu/backups/
```

### Testar Restauração:
```bash
bash /home/ubuntu/sistema_salao_beleza/scripts/test-restore.sh
```

---

## 📈 ESTATÍSTICAS

O sistema mantém:
- **30 dias** de backups (configurável)
- **2 formatos** por backup (binário + SQL)
- **Logs completos** de cada operação
- **Limpeza automática** de arquivos antigos

---

## 🆘 SUPORTE

**Email:** sistemabeleza.contato@gmail.com  
**Documentação Completa:** `/home/ubuntu/sistema_salao_beleza/ACESSO_BANCO_DADOS.md`

---

## ✅ STATUS ATUAL

- ✅ **Backup automático:** CONFIGURADO
- ✅ **Frequência:** Diário às 03:00
- ✅ **Retenção:** 30 dias
- ✅ **Limpeza automática:** ATIVA
- ✅ **Logs:** ATIVOS
- ✅ **Último backup:** Execute para verificar

---

**Configurado em:** 11/11/2025  
**Próximo backup:** Hoje às 03:00 (ou execute manualmente)

---

## 🎉 PRONTO PARA USO!

Seu sistema de backup está **100% operacional**!

Execute agora para testar:
```bash
bash /home/ubuntu/sistema_salao_beleza/scripts/backup-agendado.sh
```
