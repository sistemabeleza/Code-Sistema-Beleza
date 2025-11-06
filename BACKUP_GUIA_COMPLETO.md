
# 🔐 Guia Completo de Backup - Sistema Beleza

## 🎯 O que Precisa ter Backup

```
┌─────────────────────────────────────────────────────────────┐
│  DADOS CRÍTICOS QUE PRECISAM DE BACKUP                       │
├─────────────────────────────────────────────────────────────┤
│  1. ✅ Banco de Dados PostgreSQL (MAIS IMPORTANTE!)          │
│     └─ Todos os dados: salões, usuários, agendamentos, etc  │
│                                                              │
│  2. ✅ Código-fonte do Sistema                               │
│     └─ Já protegido no GitHub (se fez upload)               │
│                                                              │
│  3. ✅ Imagens e Uploads (AWS S3)                            │
│     └─ Logos, fotos de clientes, profissionais, produtos    │
│                                                              │
│  4. ✅ Arquivo .env (CREDENCIAIS)                            │
│     └─ Senhas do banco, chaves AWS, secrets                 │
└─────────────────────────────────────────────────────────────┘
```

## 📦 PARTE 1: Backup do Banco de Dados

### **Método 1: Backup Manual (Recomendado para Aprender)**

#### **A. Instalar PostgreSQL Client**

Se ainda não tem instalado:

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql-client

# Mac
brew install postgresql

# Windows
# Baixe em: https://www.postgresql.org/download/windows/
```

#### **B. Fazer Backup Completo**

```bash
# Criar pasta para backups
mkdir -p /home/ubuntu/backups

# Fazer backup do banco
pg_dump -h db-42302409.db002.hosteddb.reai.io \
        -p 5432 \
        -U role_42302409 \
        -d 42302409 \
        --no-password \
        -F c \
        -f /home/ubuntu/backups/sistema_beleza_$(date +%Y%m%d_%H%M%S).backup

# Explicação:
# -h = host do banco
# -p = porta
# -U = usuário
# -d = nome do banco
# -F c = formato compactado
# -f = arquivo de saída
# $(date) = adiciona data/hora no nome
```

#### **C. Fazer Backup em SQL (Alternativa)**

```bash
# Backup em formato SQL (legível)
pg_dump -h db-42302409.db002.hosteddb.reai.io \
        -p 5432 \
        -U role_42302409 \
        -d 42302409 \
        --no-password \
        -f /home/ubuntu/backups/sistema_beleza_$(date +%Y%m%d_%H%M%S).sql
```

#### **D. Configurar Senha (Para não pedir senha toda vez)**

Crie o arquivo `~/.pgpass`:

```bash
# Criar arquivo de senha
echo "db-42302409.db002.hosteddb.reai.io:5432:42302409:role_42302409:zbUmJSq3214F0jCcN3hzpqNn7Gqf56tz" > ~/.pgpass

# Dar permissão correta
chmod 600 ~/.pgpass
```

Agora pode rodar os comandos sem `--no-password`!

### **Método 2: Script Automatizado**

Vou criar um script que faz backup automático para você!

---

## 🤖 PARTE 2: Scripts Automatizados

### **Script 1: Backup Manual com 1 Comando**

Use o script `backup.sh` que vou criar abaixo.

```bash
# Para usar:
cd /home/ubuntu/sistema_salao_beleza
bash scripts/backup.sh
```

### **Script 2: Backup Automático Diário**

Use o script `backup-auto.sh` que agenda backups diários.

---

## ☁️ PARTE 3: Backup das Imagens (AWS S3)

### **Opção 1: AWS CLI (Mais Fácil)**

```bash
# Instalar AWS CLI (se não tiver)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configurar credenciais
aws configure

# Fazer backup do bucket inteiro
aws s3 sync s3://abacusai-apps-c20175eafe99c22609c6d07e-us-west-2/9283/ \
             /home/ubuntu/backups/s3_images_$(date +%Y%m%d)/
```

### **Opção 2: Usar o Console AWS**

1. Acesse: https://s3.console.aws.amazon.com
2. Entre no bucket: `abacusai-apps-c20175eafe99c22609c6d07e-us-west-2`
3. Selecione a pasta `9283/`
4. Clique em **"Actions"** → **"Download"**

---

## 🔄 PARTE 4: Restaurar Backup (Recuperação)

### **Restaurar Banco de Dados**

#### **A. Restaurar de Backup Compactado (.backup)**

```bash
pg_restore -h db-42302409.db002.hosteddb.reai.io \
           -p 5432 \
           -U role_42302409 \
           -d 42302409 \
           --clean \
           --if-exists \
           /home/ubuntu/backups/sistema_beleza_20250106_120000.backup
```

#### **B. Restaurar de SQL (.sql)**

```bash
psql -h db-42302409.db002.hosteddb.reai.io \
     -p 5432 \
     -U role_42302409 \
     -d 42302409 \
     -f /home/ubuntu/backups/sistema_beleza_20250106_120000.sql
```

### **Restaurar Imagens S3**

```bash
# Upload de volta para S3
aws s3 sync /home/ubuntu/backups/s3_images_20250106/ \
            s3://abacusai-apps-c20175eafe99c22609c6d07e-us-west-2/9283/
```

---

## 📅 PARTE 5: Estratégia de Backup (Regra 3-2-1)

### **Recomendação Profissional**

```
┌─────────────────────────────────────────────────────────────┐
│  ESTRATÉGIA 3-2-1                                            │
├─────────────────────────────────────────────────────────────┤
│  3 = Manter 3 cópias dos dados                               │
│      ├─ 1 cópia no servidor (produção)                       │
│      ├─ 1 cópia local (seu computador)                       │
│      └─ 1 cópia na nuvem (Google Drive, Dropbox)            │
│                                                              │
│  2 = Usar 2 tipos de mídia diferentes                        │
│      ├─ HD externo                                           │
│      └─ Nuvem (Google Drive, AWS S3)                         │
│                                                              │
│  1 = Manter 1 cópia offsite (fora do local)                  │
│      └─ Google Drive, Dropbox, outro servidor                │
└─────────────────────────────────────────────────────────────┘
```

### **Frequência Recomendada**

```yaml
Banco de Dados:
  - Diário: Backup completo às 3h da manhã
  - Semanal: Manter últimas 4 semanas
  - Mensal: Manter últimos 12 meses
  - Anual: Manter permanente

Código-fonte:
  - Sempre: Git push após cada alteração
  - GitHub: Backup automático

Imagens S3:
  - Semanal: Backup das imagens novas
  - Mensal: Backup completo
```

---

## 💾 PARTE 6: Onde Guardar Backups

### **Opções Seguras**

#### **1. Google Drive (RECOMENDADO)**

```bash
# Instalar rclone
curl https://rclone.org/install.sh | sudo bash

# Configurar Google Drive
rclone config

# Enviar backup
rclone copy /home/ubuntu/backups/ gdrive:SistemaBeleza/Backups/
```

#### **2. Dropbox**

```bash
# Instalar Dropbox
cd ~ && wget -O - "https://www.dropbox.com/download?plat=lnx.x86_64" | tar xzf -
~/.dropbox-dist/dropboxd

# Copiar backups
cp /home/ubuntu/backups/* ~/Dropbox/SistemaBeleza/
```

#### **3. HD Externo**

```bash
# Montar HD externo (ajuste /dev/sdb1 para seu HD)
sudo mount /dev/sdb1 /mnt/backup

# Copiar backups
cp -r /home/ubuntu/backups/* /mnt/backup/SistemaBeleza/

# Desmontar
sudo umount /mnt/backup
```

---

## ⏰ PARTE 7: Automatizar com Cron

### **Configurar Backup Automático Diário**

```bash
# Abrir crontab
crontab -e

# Adicionar linha (backup às 3h da manhã):
0 3 * * * /home/ubuntu/sistema_salao_beleza/scripts/backup-auto.sh

# Backup a cada 6 horas:
0 */6 * * * /home/ubuntu/sistema_salao_beleza/scripts/backup-auto.sh

# Backup semanal (domingo às 2h):
0 2 * * 0 /home/ubuntu/sistema_salao_beleza/scripts/backup-weekly.sh
```

### **Verificar Cron**

```bash
# Ver tarefas agendadas
crontab -l

# Ver logs do cron
tail -f /var/log/syslog | grep CRON
```

---

## 🔍 PARTE 8: Verificar Integridade do Backup

### **Testar Backup**

```bash
# Verificar tamanho do arquivo
ls -lh /home/ubuntu/backups/

# Testar se arquivo não está corrompido
pg_restore --list /home/ubuntu/backups/sistema_beleza_20250106_120000.backup

# Restaurar em banco de teste
createdb teste_restauracao
pg_restore -d teste_restauracao /home/ubuntu/backups/sistema_beleza_20250106_120000.backup
```

---

## 📊 PARTE 9: Monitorar Backups

### **Checklist de Verificação**

```
DIARIAMENTE:
[ ] Verificar se backup foi criado
[ ] Verificar tamanho do arquivo (deve ser > 0)
[ ] Verificar logs de erro

SEMANALMENTE:
[ ] Testar restauração em ambiente de teste
[ ] Verificar espaço em disco
[ ] Enviar backup para nuvem

MENSALMENTE:
[ ] Fazer restauração completa de teste
[ ] Limpar backups antigos (manter últimos 30 dias)
[ ] Verificar integridade dos dados
```

---

## 🚨 PARTE 10: Plano de Recuperação de Desastres

### **Cenário 1: Banco de Dados Corrompeu**

```bash
# 1. Parar aplicação
# 2. Restaurar último backup
pg_restore -d 42302409 /home/ubuntu/backups/ultimo_backup.backup
# 3. Reiniciar aplicação
```

### **Cenário 2: Servidor Inteiro Caiu**

```bash
# 1. Novo servidor
# 2. Instalar Node.js, PostgreSQL, etc
# 3. Clonar código do GitHub
git clone https://github.com/SEU_USUARIO/sistema-beleza.git

# 4. Restaurar .env
cp backup/.env sistema-beleza/nextjs_space/

# 5. Restaurar banco
pg_restore -d novo_banco backup.backup

# 6. Instalar dependências
cd sistema-beleza/nextjs_space
yarn install

# 7. Rodar sistema
yarn build
yarn start
```

### **Cenário 3: Imagens S3 Foram Deletadas**

```bash
# Restaurar do backup local
aws s3 sync /home/ubuntu/backups/s3_images/ s3://seu-bucket/9283/
```

---

## 📱 PARTE 11: Notificações de Backup

### **Receber Email Quando Backup Falhar**

Adicione ao script:

```bash
# Se backup falhar, enviar email
if [ $? -ne 0 ]; then
    echo "ERRO: Backup falhou!" | mail -s "Sistema Beleza - Backup Falhou" sistemabeleza.contato@gmail.com
fi
```

---

## 💡 PARTE 12: Dicas Importantes

### **✅ Boas Práticas**

```
1. ✅ Nunca confie em apenas 1 backup
2. ✅ Teste restaurações regularmente
3. ✅ Mantenha backups em locais diferentes
4. ✅ Criptografe backups sensíveis
5. ✅ Documente procedimentos
6. ✅ Automatize tudo
7. ✅ Monitore e receba alertas
```

### **❌ Erros Comuns**

```
1. ❌ Fazer backup mas nunca testar restauração
2. ❌ Manter apenas 1 cópia do backup
3. ❌ Guardar backup no mesmo servidor
4. ❌ Não verificar integridade
5. ❌ Esquecer de fazer backup do .env
6. ❌ Não automatizar
```

---

## 📞 Suporte

**Email**: sistemabeleza.contato@gmail.com

---

**🎯 RESUMO RÁPIDO - COMEÇAR AGORA:**

```bash
# 1. Criar arquivo de senha
echo "db-42302409.db002.hosteddb.reai.io:5432:42302409:role_42302409:zbUmJSq3214F0jCcN3hzpqNn7Gqf56tz" > ~/.pgpass
chmod 600 ~/.pgpass

# 2. Criar pasta de backups
mkdir -p /home/ubuntu/backups

# 3. Fazer primeiro backup
cd /home/ubuntu/sistema_salao_beleza
bash scripts/backup.sh

# 4. Agendar backup diário
crontab -e
# Adicionar: 0 3 * * * /home/ubuntu/sistema_salao_beleza/scripts/backup-auto.sh

# 5. Testar restauração
bash scripts/test-restore.sh
```

✅ **Pronto! Sistema protegido contra perda de dados!**
