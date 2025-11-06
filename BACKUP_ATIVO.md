
# 🔐 BACKUP DOS DADOS DOS CLIENTES

## ⚠️ ENTENDA ISSO PRIMEIRO!

### 📤 GITHUB = CÓDIGO
- ✅ Frontend (páginas, componentes)
- ✅ Backend (APIs, funções)
- ✅ Configurações
- ✅ Scripts

### 💾 BACKUP DO BANCO = DADOS DOS CLIENTES
- ✅ Clientes (nome, telefone, email)
- ✅ Agendamentos (horários, serviços)
- ✅ Vendas (transações, produtos)
- ✅ Estoque (produtos, movimentações)
- ✅ Profissionais e Serviços
- ✅ Configurações do salão

**São coisas DIFERENTES! Cada um tem seu lugar! 🎯**

---

## 🚀 CONFIGURAÇÃO RÁPIDA (3 PASSOS)

### PASSO 1: Configurar Sistema Automático
```bash
cd /home/ubuntu/sistema_salao_beleza
bash scripts/setup-backup-completo.sh
```

Isso vai:
- ✅ Criar todas as pastas necessárias
- ✅ Configurar backup automático DIÁRIO às 3h da manhã
- ✅ Testar se está funcionando
- ✅ Configurar limpeza automática (mantém 30 dias)

### PASSO 2: Verificar se está Funcionando
```bash
cd /home/ubuntu/sistema_salao_beleza
bash scripts/verify-backups.sh
```

Isso vai mostrar:
- 📊 Quantos backups você tem
- 🕐 Quando foi o último backup
- ⏰ Se o backup automático está ativo
- 💾 Quanto espaço está usando

### PASSO 3: Testar um Backup Manual
```bash
cd /home/ubuntu/sistema_salao_beleza/nextjs_space
yarn tsx scripts/backup-database.ts
```

Pronto! Você verá algo assim:
```
🔐 ==========================================
   BACKUP DO BANCO DE DADOS - Sistema Beleza
   06/11/2025 20:35:33
==========================================

💾 Fazendo backup do banco de dados...
✅ Dados exportados com sucesso!
✅ Backup criado com sucesso!
📁 Arquivo: /home/ubuntu/backups/database/backup_2025-11-06T20-35-33.json.gz
📊 Tamanho: 4.2 MB

📊 Estatísticas do banco:
   • Salões: 2
   • Usuários: 3
   • Clientes: 45
   • Agendamentos: 128
   • Produtos: 32
   • Vendas: 87

✅ BACKUP CONCLUÍDO COM SUCESSO!
```

---

## 📍 ONDE ESTÃO OS BACKUPS?

```
/home/ubuntu/backups/
├── database/          ← SEUS DADOS AQUI! 
│   ├── backup_2025-11-06T20-35-33.json.gz
│   ├── backup_2025-11-05T03-00-00.json.gz
│   └── backup_2025-11-04T03-00-00.json.gz
│
├── env/               ← SENHAS E CREDENCIAIS
│   ├── .env_2025-11-06T20-35-33
│   └── .env_2025-11-05T03-00-00
│
└── logs/              ← HISTÓRICO DO QUE ACONTECEU
    ├── auto_backup_20251106.log
    └── auto_backup_20251105.log
```

---

## ⏰ COMO FUNCIONA O BACKUP AUTOMÁTICO?

### Todos os dias às 3h da manhã:

1. 💾 **Salva todos os dados** do banco de dados
2. 🗜️ **Comprime** para economizar espaço
3. 🔑 **Salva o .env** (suas senhas e configurações)
4. 📊 **Gera estatísticas** (quantos clientes, vendas, etc)
5. 🗑️ **Limpa backups antigos** (mais de 30 dias)
6. 📝 **Gera log** do que aconteceu

**Você não precisa fazer NADA! É tudo automático! 🎉**

---

## 🆘 COMANDOS RÁPIDOS

### Ver status dos backups:
```bash
bash /home/ubuntu/sistema_salao_beleza/scripts/verify-backups.sh
```

### Fazer backup AGORA:
```bash
cd /home/ubuntu/sistema_salao_beleza/nextjs_space
yarn tsx scripts/backup-database.ts
```

### Listar todos os backups:
```bash
ls -lh /home/ubuntu/backups/database/
```

### Ver quanto espaço está usando:
```bash
du -sh /home/ubuntu/backups/
```

### Restaurar um backup (SE ALGO DER ERRADO):
```bash
bash /home/ubuntu/sistema_salao_beleza/scripts/restore.sh
```

---

## ☁️ BACKUP NA NUVEM (EXTRA SEGURANÇA)

### Opção 1: Google Drive (Recomendado)

1. **Instalar ferramenta:**
```bash
curl https://rclone.org/install.sh | sudo bash
```

2. **Configurar Google Drive:**
```bash
rclone config
```
- Digite: `n` (novo)
- Nome: `gdrive`
- Storage: `drive`
- Siga as instruções

3. **Testar:**
```bash
rclone lsd gdrive:
```

4. **Enviar backups para Google Drive:**
```bash
bash /home/ubuntu/sistema_salao_beleza/scripts/backup-to-gdrive.sh
```

5. **Automatizar (opcional):**
```bash
crontab -e
```
Adicione:
```
0 4 * * * /home/ubuntu/sistema_salao_beleza/scripts/backup-to-gdrive.sh
```

Pronto! Agora você tem backups em 2 lugares! 🎉

---

## ✅ CHECKLIST DE SEGURANÇA

Marque o que você já fez:

- [ ] ✅ Executei `setup-backup-completo.sh`
- [ ] ✅ Testei fazer um backup manual
- [ ] ✅ Verifiquei que o backup automático está ativo
- [ ] ✅ Vi onde ficam os arquivos de backup
- [ ] ✅ Entendi que GitHub = código, Backup = dados
- [ ] ☁️ (Opcional) Configurei Google Drive
- [ ] ☁️ (Opcional) Testei enviar backup para nuvem
- [ ] 🧪 (Recomendado) Testei restaurar um backup

---

## 🎯 RECOMENDAÇÕES

### Para 1-10 clientes (Uso leve):
- ✅ Backup automático diário local ← **VOCÊ JÁ TEM ISSO!**
- ☁️ Upload manual para nuvem 1x por semana

### Para 11-50 clientes (Uso moderado):
- ✅ Backup automático diário local
- ☁️ Upload automático para nuvem 1x por semana

### Para 50+ clientes (Uso intenso):
- ✅ Backup automático diário local
- ☁️ Upload automático para nuvem DIÁRIO
- 🔄 Teste de restauração mensal

---

## 📊 TAMANHO DOS BACKUPS

| Quantidade de Clientes | Tamanho Aproximado |
|------------------------|-------------------|
| 10 clientes            | 2-5 MB           |
| 50 clientes            | 5-10 MB          |
| 100 clientes           | 10-20 MB         |
| 500 clientes           | 50-100 MB        |
| 1000 clientes          | 100-200 MB       |

**Backups são comprimidos (.gz) para economizar espaço! 🗜️**

---

## 🆘 E SE ALGO DER ERRADO?

### Se perder dados:
```bash
bash /home/ubuntu/sistema_salao_beleza/scripts/restore.sh
```

Ele vai:
1. Mostrar todos os backups disponíveis
2. Você escolhe qual quer restaurar
3. Ele restaura tudo automaticamente

### Se backup automático parar de funcionar:
```bash
# Reconfigurar
bash /home/ubuntu/sistema_salao_beleza/scripts/setup-backup-completo.sh
```

---

## 📞 ONDE BUSCAR AJUDA?

- 📖 Guia completo: `/home/ubuntu/sistema_salao_beleza/BACKUP_DADOS_CLIENTES.md`
- 📋 Logs: `/home/ubuntu/backups/logs/`
- 🔍 Verificação: `bash scripts/verify-backups.sh`

---

## 💡 DICAS IMPORTANTES

1. **Teste restaurar**: Faça um teste de restauração 1x por mês
2. **Múltiplas cópias**: Sempre tenha backups em 2+ lugares
3. **Monitore**: Rode `verify-backups.sh` toda semana
4. **Nuvem**: Configure Google Drive para máxima segurança
5. **LGPD**: Os backups têm dados pessoais, mantenha-os seguros

---

## 🔐 RESUMO FINAL

| O QUE | ONDE VAI | QUANDO |
|-------|----------|---------|
| **Código** (frontend, backend) | GitHub | Sempre que modificar |
| **Dados** (clientes, vendas) | Backups locais | Todo dia às 3h (automático) |
| **Segurança extra** | Google Drive | 1x por semana (ou diário) |

---

**PRONTO! SEUS DADOS ESTÃO SEGUROS! 🎉🔐**

**Qualquer dúvida, consulte: `BACKUP_DADOS_CLIENTES.md`**

