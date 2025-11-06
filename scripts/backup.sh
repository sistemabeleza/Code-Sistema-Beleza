
#!/bin/bash

##############################################################################
# Script de Backup Manual - Sistema Beleza
# Uso: bash scripts/backup.sh
##############################################################################

echo "🔐 =========================================="
echo "   BACKUP - SISTEMA BELEZA"
echo "   $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

# Configurações
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_HOST="db-42302409.db002.hosteddb.reai.io"
DB_PORT="5432"
DB_USER="role_42302409"
DB_NAME="42302409"
DB_PASS="zbUmJSq3214F0jCcN3hzpqNn7Gqf56tz"

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKUP_DIR/database"
mkdir -p "$BACKUP_DIR/env"
mkdir -p "$BACKUP_DIR/logs"

# Log file
LOG_FILE="$BACKUP_DIR/logs/backup_$DATE.log"

echo "📁 Diretório de backup: $BACKUP_DIR" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# ============================================================================
# BACKUP 1: BANCO DE DADOS
# ============================================================================
echo "💾 [1/3] Fazendo backup do banco de dados..." | tee -a "$LOG_FILE"

# Configurar senha temporariamente
export PGPASSWORD="$DB_PASS"

# Backup em formato compactado
BACKUP_FILE="$BACKUP_DIR/database/sistema_beleza_$DATE.backup"
pg_dump -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -F c \
        -f "$BACKUP_FILE" 2>&1 | tee -a "$LOG_FILE"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "   ✅ Backup do banco criado: $BACKUP_FILE ($BACKUP_SIZE)" | tee -a "$LOG_FILE"
else
    echo "   ❌ ERRO ao criar backup do banco!" | tee -a "$LOG_FILE"
    exit 1
fi

# Backup em SQL (legível)
SQL_FILE="$BACKUP_DIR/database/sistema_beleza_$DATE.sql"
pg_dump -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -f "$SQL_FILE" 2>&1 | tee -a "$LOG_FILE"

if [ $? -eq 0 ]; then
    SQL_SIZE=$(du -h "$SQL_FILE" | cut -f1)
    echo "   ✅ Backup SQL criado: $SQL_FILE ($SQL_SIZE)" | tee -a "$LOG_FILE"
    
    # Comprimir SQL
    gzip "$SQL_FILE"
    echo "   ✅ SQL comprimido: ${SQL_FILE}.gz" | tee -a "$LOG_FILE"
else
    echo "   ⚠️  Aviso: Backup SQL falhou (não é crítico)" | tee -a "$LOG_FILE"
fi

# Limpar variável de senha
unset PGPASSWORD

echo "" | tee -a "$LOG_FILE"

# ============================================================================
# BACKUP 2: ARQUIVO .ENV (CREDENCIAIS)
# ============================================================================
echo "🔑 [2/3] Fazendo backup do arquivo .env..." | tee -a "$LOG_FILE"

ENV_FILE="/home/ubuntu/sistema_salao_beleza/nextjs_space/.env"
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$BACKUP_DIR/env/.env_$DATE"
    chmod 600 "$BACKUP_DIR/env/.env_$DATE"
    echo "   ✅ Backup do .env criado" | tee -a "$LOG_FILE"
else
    echo "   ⚠️  Arquivo .env não encontrado" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"

# ============================================================================
# BACKUP 3: CÓDIGO-FONTE (OPCIONAL)
# ============================================================================
echo "📦 [3/3] Verificando código-fonte no Git..." | tee -a "$LOG_FILE"

cd /home/ubuntu/sistema_salao_beleza

if [ -d ".git" ]; then
    # Verificar se há alterações não commitadas
    if [[ -n $(git status -s) ]]; then
        echo "   ⚠️  Há alterações não commitadas no Git!" | tee -a "$LOG_FILE"
        echo "   💡 Execute: git add . && git commit -m 'Update' && git push" | tee -a "$LOG_FILE"
    else
        echo "   ✅ Código-fonte sincronizado com Git" | tee -a "$LOG_FILE"
    fi
else
    echo "   ⚠️  Git não inicializado" | tee -a "$LOG_FILE"
    echo "   💡 Execute: bash scripts/github-setup.sh" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"

# ============================================================================
# RESUMO
# ============================================================================
echo "=========================================="
echo "✅ BACKUP CONCLUÍDO COM SUCESSO!"
echo "=========================================="
echo ""
echo "📊 Resumo:"
echo "   • Banco de dados: $BACKUP_FILE"
echo "   • SQL comprimido: ${SQL_FILE}.gz"
echo "   • Arquivo .env: $BACKUP_DIR/env/.env_$DATE"
echo ""
echo "📁 Todos os backups em: $BACKUP_DIR"
echo ""
echo "💡 Próximos passos:"
echo "   1. Copie os backups para um local seguro (HD externo, Google Drive)"
echo "   2. Teste a restauração: bash scripts/test-restore.sh"
echo "   3. Agende backups automáticos: bash scripts/setup-cron.sh"
echo ""
echo "=========================================="

# Listar últimos backups
echo ""
echo "📋 Últimos backups:"
ls -lht "$BACKUP_DIR/database" | head -6

# Calcular espaço usado
echo ""
echo "💾 Espaço usado pelos backups:"
du -sh "$BACKUP_DIR"

# Verificar espaço livre
echo ""
echo "💿 Espaço livre no disco:"
df -h /home | tail -1

echo ""
echo "✅ Backup finalizado em: $(date '+%Y-%m-%d %H:%M:%S')"
