# 🚀 Guia Rápido - Backup Automático

## ⚡ SUPER SIMPLES!

Sempre que você fizer mudanças no código, execute:

```bash
cd /home/ubuntu/sistema_salao_beleza
./backup-auto-github.sh
```

Pronto! Tudo vai para o GitHub automaticamente! 🎉

---

## 📋 Comandos Úteis

### Fazer backup agora:
```bash
cd /home/ubuntu/sistema_salao_beleza && ./backup-auto-github.sh
```

### Ver status do Git:
```bash
cd /home/ubuntu/sistema_salao_beleza && git status
```

### Ver histórico de commits:
```bash
cd /home/ubuntu/sistema_salao_beleza && git log --oneline -10
```

### Ver diferenças:
```bash
cd /home/ubuntu/sistema_salao_beleza && git diff
```

---

## 🔄 Backup Automático Diário

Para configurar backup automático todos os dias às 23h:

```bash
crontab -e
```

Adicione esta linha:
```
0 23 * * * /home/ubuntu/sistema_salao_beleza/backup-auto-github.sh
```

Salve e pronto! Backup automático configurado! ✅

---

## 🌐 Ver no GitHub

Acesse: https://github.com/sistemabeleza/Code-Sistema-Beleza

---

## ❓ Precisa de Ajuda?

Leia o guia completo: `GUIA_BACKUP_AUTOMATICO.md`

---

**É SIMPLES ASSIM! 🚀**
