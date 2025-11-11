
# 🗄️ ACESSO AO BANCO DE DADOS - SISTEMA BELEZA

**Data de criação:** 11/11/2025

---

## 📊 INFORMAÇÕES DE CONEXÃO

### Credenciais PostgreSQL

| Campo | Valor |
|-------|-------|
| **Host** | `db-42302409.db002.hosteddb.reai.io` |
| **Porta** | `5432` |
| **Usuário** | `role_42302409` |
| **Senha** | `zbUmJSq3214F0jCcN3hzpqNn7Gqf56tz` |
| **Database** | `42302409` |
| **Tipo** | PostgreSQL (Managed Database) |

### String de Conexão Completa
```
postgresql://role_42302409:zbUmJSq3214F0jCcN3hzpqNn7Gqf56tz@db-42302409.db002.hosteddb.reai.io:5432/42302409
```

---

## 🔧 COMO ACESSAR O BANCO DE DADOS

### Opção 1: pgAdmin 4 (Interface Gráfica - RECOMENDADO)

1. **Baixar pgAdmin:**
   - Site: https://www.pgadmin.org/download/
   - Escolha a versão para seu sistema operacional

2. **Conectar ao Banco:**
   - Abra o pgAdmin
   - Clique em "Add New Server"
   - Aba "General":
     - Nome: `Sistema Beleza`
   - Aba "Connection":
     - Host: `db-42302409.db002.hosteddb.reai.io`
     - Port: `5432`
     - Database: `42302409`
     - Username: `role_42302409`
     - Password: `zbUmJSq3214F0jCcN3hzpqNn7Gqf56tz`
   - Marque "Save password"
   - Clique em "Save"

3. **Pronto!** Agora você pode:
   - Ver todas as tabelas
   - Executar consultas SQL
   - Fazer backups manuais
   - Visualizar dados

### Opção 2: DBeaver (Alternativa Gratuita)

1. **Baixar DBeaver:**
   - Site: https://dbeaver.io/download/
   - Versão Community é gratuita

2. **Conectar:**
   - Nova Conexão → PostgreSQL
   - Preencha os dados acima
   - Teste a conexão
   - Finalizar

### Opção 3: Via Terminal (Linha de Comando)

```bash
# Conectar ao banco
psql -h db-42302409.db002.hosteddb.reai.io \
     -p 5432 \
     -U role_42302409 \
     -d 42302409

# Quando pedir senha, use:
# zbUmJSq3214F0jCcN3hzpqNn7Gqf56tz

# Comandos úteis após conectar:
\dt              # Listar todas as tabelas
\d+ Salao        # Ver estrutura da tabela Salao
SELECT * FROM "Salao" LIMIT 5;   # Ver dados
\q               # Sair
```

### Opção 4: Prisma Studio (Interface do Prisma)

```bash
cd /home/ubuntu/sistema_salao_beleza/nextjs_space
yarn prisma studio

# Abre no navegador em http://localhost:5555
# Interface visual para ver e editar dados
```

---

## 💾 SISTEMA DE BACKUP

### Backups Disponíveis

Você já tem **scripts de backup prontos** em:
```
/home/ubuntu/sistema_salao_beleza/scripts/
```

### Scripts Disponíveis:

1. **backup.sh** - Backup manual completo
2. **backup-auto.sh** - Backup automático diário
3. **backup-to-s3.sh** - Backup para AWS S3
4. **backup-to-gdrive.sh** - Backup para Google Drive
5. **restore.sh** - Restaurar backup
6. **cleanup-old-backups.sh** - Limpar backups antigos

### Como Fazer Backup Manual:

```bash
cd /home/ubuntu/sistema_salao_beleza
bash scripts/backup.sh
```

Isso cria backup em: `/home/ubuntu/backups/database/`

### Ver Backups Existentes:

```bash
ls -lh /home/ubuntu/backups/database/
```

---

## ⏰ CONFIGURAR BACKUP AUTOMÁTICO DIÁRIO

### Passo 1: Editar Crontab

```bash
crontab -e
```

### Passo 2: Adicionar Linha de Backup Diário

Adicione esta linha no final do arquivo:

```cron
# Backup automático às 3h da manhã todos os dias
0 3 * * * /home/ubuntu/sistema_salao_beleza/scripts/backup-auto.sh

# Limpeza de backups antigos (mantém últimos 30 dias) às 4h
0 4 * * * /home/ubuntu/sistema_salao_beleza/scripts/cleanup-old-backups.sh
```

### Passo 3: Salvar e Sair
- Pressione `Ctrl+X`
- Depois `Y` para confirmar
- Enter para salvar

### Verificar Cron Configurado:

```bash
crontab -l
```

---

## 🔍 CONSULTAS SQL ÚTEIS

### Ver Todos os Salões:
```sql
SELECT id, nome, email, plano, status, data_criacao 
FROM "Salao" 
ORDER BY data_criacao DESC;
```

### Contar Usuários por Plano:
```sql
SELECT plano, COUNT(*) as total 
FROM "Salao" 
GROUP BY plano;
```

### Ver Agendamentos Recentes:
```sql
SELECT a.id, s.nome as salao, c.nome as cliente, a.data, a.status
FROM "Agendamento" a
JOIN "Salao" s ON a.salao_id = s.id
JOIN "Cliente" c ON a.cliente_id = c.id
ORDER BY a.data DESC
LIMIT 10;
```

### Ver Produtos com Estoque Baixo:
```sql
SELECT p.nome, p.quantidade, p.quantidade_minima, s.nome as salao
FROM "Produto" p
JOIN "Salao" s ON p.salao_id = s.id
WHERE p.quantidade <= p.quantidade_minima
ORDER BY p.quantidade ASC;
```

---

## 🚨 SEGURANÇA E BOAS PRÁTICAS

### ⚠️ ATENÇÃO:

1. **NUNCA compartilhe essas credenciais publicamente**
2. **Faça backup antes de qualquer alteração manual**
3. **Não execute comandos DELETE sem WHERE**
4. **Use sempre transações para múltiplas alterações**

### Backup Antes de Alterações:
```bash
# Sempre faça backup antes de alterar dados
bash /home/ubuntu/sistema_salao_beleza/scripts/backup.sh
```

### Restaurar Backup:
```bash
# Se algo der errado, você pode restaurar
bash /home/ubuntu/sistema_salao_beleza/scripts/restore.sh
```

---

## 📞 SUPORTE

- **Email Admin:** sistemabeleza.contato@gmail.com
- **Documentação:** /home/ubuntu/sistema_salao_beleza/README.md
- **Logs de Backup:** /home/ubuntu/backups/logs/

---

## ✅ CHECKLIST DE SEGURANÇA

- [ ] Backup automático diário configurado
- [ ] Credenciais salvas em local seguro
- [ ] pgAdmin ou DBeaver instalado
- [ ] Teste de restauração realizado
- [ ] Limpeza automática de backups antigos ativa

---

**Última atualização:** 11/11/2025
