
# ☁️ Backup Automático AWS S3 - Sistema Beleza

## 🎯 O que é AWS S3?

AWS S3 (Amazon Simple Storage Service) é um serviço de armazenamento em nuvem da Amazon. Seu sistema **JÁ USA S3** para guardar as fotos dos salões, agora vamos usar também para os backups!

### Vantagens do S3:
- ✅ **Já está configurado** no seu sistema
- ✅ **Altamente seguro** e confiável
- ✅ **Disponível 24/7** de qualquer lugar
- ✅ **Escalável** - cresce conforme você precisa
- ✅ **Baixo custo** - paga apenas pelo que usa

---

## 🚀 Configuração Rápida (4 Passos)

### PASSO 1: Instalar AWS CLI
```bash
sudo apt-get update
sudo apt-get install -y awscli
```

**Verificar instalação:**
```bash
aws --version
```

Você deve ver algo como: `aws-cli/1.x.x Python/3.x.x`

### PASSO 2: Fazer Primeiro Upload
```bash
cd /home/ubuntu/sistema_salao_beleza
bash scripts/backup-to-s3.sh
```

Isso vai:
- ✅ Pegar todos os backups locais
- ✅ Enviar para o S3
- ✅ Criar log do processo

### PASSO 3: Verificar se Funcionou
```bash
bash scripts/list-s3-backups.sh
```

Você verá todos os backups disponíveis no S3!

### PASSO 4: Configurar Upload Automático Diário
```bash
crontab -e
```

Adicione esta linha:
```
0 4 * * * /home/ubuntu/sistema_salao_beleza/scripts/backup-to-s3.sh
```

Pronto! Todo dia às 4h da manhã (1h depois do backup local), seus dados vão automaticamente para o S3! 🎉

---

## 📍 Onde Ficam os Backups no S3?

```
s3://abacusai-apps-c20175eafe99c22609c6d07e-us-west-2/
└── 9283/
    └── backups/
        ├── database/
        │   ├── backup_2025-11-06T22-35-33.json.gz
        │   ├── backup_2025-11-05T03-00-00.json.gz
        │   └── backup_2025-11-04T03-00-00.json.gz
        └── env/
            ├── .env_2025-11-06T22-35-33
            └── .env_2025-11-05T03-00-00
```

---

## 🔄 Fluxo Completo de Backup

```
┌─────────────────────────────────────────────────────────────┐
│                    TODO DIA                                 │
└─────────────────────────────────────────────────────────────┘

3:00 AM  ➜  Backup Local Automático
              │
              ├─ Banco de dados → /home/ubuntu/backups/
              ├─ Arquivo .env → /home/ubuntu/backups/env/
              └─ Log gerado
              
              ↓
              
4:00 AM  ➜  Upload Automático para S3
              │
              ├─ Envia para AWS S3
              ├─ Verifica integridade
              └─ Log gerado

RESULTADO: Backups em 2 locais! 🎉
           • Local: /home/ubuntu/backups/
           • Nuvem: AWS S3
```

---

## 🆘 Comandos Úteis

### Ver backups no S3:
```bash
bash /home/ubuntu/sistema_salao_beleza/scripts/list-s3-backups.sh
```

### Enviar backups para S3 agora:
```bash
bash /home/ubuntu/sistema_salao_beleza/scripts/backup-to-s3.sh
```

### Baixar backups do S3:
```bash
bash /home/ubuntu/sistema_salao_beleza/scripts/restore-from-s3.sh
```

### Ver logs do último upload:
```bash
cat /home/ubuntu/backups/logs/last_s3_sync.log
```

### Ver todos os logs de upload:
```bash
ls -lh /home/ubuntu/backups/logs/s3_sync_*.log
```

---

## 💰 Custos do S3

### Estimativa para o Sistema Beleza:

| Quantidade de Clientes | Backup Mensal | Custo Mensal S3* |
|------------------------|---------------|------------------|
| 10 clientes            | ~150 MB       | $0.01 USD       |
| 50 clientes            | ~300 MB       | $0.02 USD       |
| 100 clientes           | ~600 MB       | $0.03 USD       |
| 500 clientes           | ~3 GB         | $0.15 USD       |
| 1000 clientes          | ~6 GB         | $0.30 USD       |

*Estimativa considerando 30 dias de backups. Valores aproximados.

**É MUITO BARATO! 💰**

---

## 🔐 Segurança

### Seus backups estão seguros porque:

✅ **Criptografia em trânsito**: Dados são criptografados ao serem enviados
✅ **Criptografia em repouso**: Dados ficam criptografados no S3
✅ **Acesso restrito**: Só você tem as credenciais
✅ **Versionamento**: S3 mantém histórico de versões
✅ **Durabilidade**: 99.999999999% (11 noves!)
✅ **Disponibilidade**: 99.99%

---

## 📊 Verificar Status do Backup S3

Execute:
```bash
bash /home/ubuntu/sistema_salao_beleza/scripts/verify-backups.sh
```

Ele mostra:
- ✅ Quantos backups locais você tem
- ✅ Quando foi o último backup
- ✅ Se o upload automático está configurado
- ✅ Logs recentes

Depois execute:
```bash
bash /home/ubuntu/sistema_salao_beleza/scripts/list-s3-backups.sh
```

Ele mostra:
- ✅ Quantos backups estão no S3
- ✅ Tamanho de cada backup
- ✅ Datas dos backups

---

## 🆘 Restaurar Backup do S3

### Se você perder TUDO (servidor formatado, etc):

1. **Baixar backups do S3:**
```bash
bash /home/ubuntu/sistema_salao_beleza/scripts/restore-from-s3.sh
```

2. **Escolher qual backup restaurar:**
```bash
bash /home/ubuntu/sistema_salao_beleza/scripts/restore.sh
```

3. Pronto! Tudo volta ao normal! 🎉

---

## ✅ Checklist de Configuração

Marque o que você já fez:

- [ ] ✅ Instalei AWS CLI
- [ ] ✅ Testei o comando `aws --version`
- [ ] ✅ Executei primeiro upload: `bash scripts/backup-to-s3.sh`
- [ ] ✅ Verifiquei no S3: `bash scripts/list-s3-backups.sh`
- [ ] ✅ Configurei cron para upload automático diário
- [ ] ✅ Testei baixar backup: `bash scripts/restore-from-s3.sh`
- [ ] 📅 Agendei verificação semanal dos backups

---

## 🎯 Estratégia Completa de Backup

### Nível BÁSICO (Mínimo):
- ✅ Backup local diário (3h da manhã)
- ✅ Retenção de 30 dias local

### Nível INTERMEDIÁRIO (Recomendado):
- ✅ Backup local diário (3h da manhã)
- ✅ Upload S3 diário (4h da manhã)  ← **VOCÊ ESTÁ AQUI!**
- ✅ Retenção de 30 dias local
- ✅ Retenção de 90 dias no S3

### Nível PROFISSIONAL (Ideal):
- ✅ Backup local diário (3h da manhã)
- ✅ Upload S3 diário (4h da manhã)
- ✅ Segundo backup semanal para outro local
- ✅ Teste de restauração mensal
- ✅ Alertas automáticos se backup falhar
- ✅ Retenção de 180 dias no S3

---

## 💡 Dicas Importantes

1. **Mantenha backups em múltiplos locais**: Local + S3 = Máxima segurança
2. **Monitore regularmente**: Execute `verify-backups.sh` toda semana
3. **Teste restauração**: Faça um teste de restauração 1x por mês
4. **Custos**: Verifique sua conta AWS mensalmente
5. **LGPD**: Backups têm dados pessoais, mantenha-os seguros

---

## 📞 Suporte

### Verificar se está tudo funcionando:
```bash
# Status geral
bash /home/ubuntu/sistema_salao_beleza/scripts/verify-backups.sh

# Status S3
bash /home/ubuntu/sistema_salao_beleza/scripts/list-s3-backups.sh
```

### Ver logs:
```bash
# Logs de backup local
cat /home/ubuntu/backups/logs/auto_backup_$(date +%Y%m%d)*.log

# Logs de upload S3
cat /home/ubuntu/backups/logs/s3_sync_$(date +%Y%m%d)*.log
```

---

## 🎉 Resumo Final

| O QUE | ONDE | QUANDO | COMANDO |
|-------|------|--------|---------|
| **Backup Local** | /home/ubuntu/backups | 3h AM diário | Automático |
| **Upload S3** | AWS S3 | 4h AM diário | Automático |
| **Verificação** | - | Semanal | `verify-backups.sh` |
| **Restauração** | Local | Quando precisar | `restore.sh` |

---

**PRONTO! SEUS DADOS ESTÃO DUPLAMENTE SEGUROS! 🎉🔐**

**Backups em 2 lugares:**
- 🏠 Local: /home/ubuntu/backups/
- ☁️ Nuvem: AWS S3

**Você pode dormir tranquilo! 😴**

