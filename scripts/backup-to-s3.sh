
#!/bin/bash

##############################################################################
# Script de Upload de Backup para AWS S3
# Sistema Beleza - Backup Automático em Nuvem
##############################################################################

# Configurações
BACKUP_DIR="/home/ubuntu/backups"
PROJECT_DIR="/home/ubuntu/sistema_salao_beleza/nextjs_space"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$BACKUP_DIR/logs/s3_sync_$DATE.log"

# Carregar variáveis de ambiente
if [ -f "$PROJECT_DIR/.env" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
fi

echo "=== UPLOAD PARA AWS S3 ===" > "$LOG_FILE"
echo "Data/Hora: $(date)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Verificar se AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI não está instalado!" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    echo "Para instalar:" >> "$LOG_FILE"
    echo "  sudo apt-get update" >> "$LOG_FILE"
    echo "  sudo apt-get install -y awscli" >> "$LOG_FILE"
    exit 1
fi

# Configurar AWS usando as variáveis de ambiente
# Note: O sistema usa o profile hosted_storage que já está configurado
export AWS_PROFILE=${AWS_PROFILE}
export AWS_REGION=${AWS_REGION}
BUCKET_NAME=${AWS_BUCKET_NAME}
FOLDER_PREFIX=${AWS_FOLDER_PREFIX}

if [ -z "$BUCKET_NAME" ]; then
    echo "❌ AWS_BUCKET_NAME não configurado no .env!" >> "$LOG_FILE"
    exit 1
fi

# Criar pasta de backups no S3 (se não existir)
S3_BACKUP_PATH="s3://${BUCKET_NAME}${FOLDER_PREFIX}backups/"

echo "📤 Iniciando upload para AWS S3..." >> "$LOG_FILE"
echo "   Bucket: $BUCKET_NAME" >> "$LOG_FILE"
echo "   Caminho: ${FOLDER_PREFIX}backups/" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Sincronizar backups do banco de dados
echo "📦 Enviando backups do banco de dados..." >> "$LOG_FILE"
aws s3 sync "$BACKUP_DIR/database/" "${S3_BACKUP_PATH}database/" \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE" \
    --exclude "*.tmp" \
    --exclude "*.lock" >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Backups do banco enviados com sucesso!" >> "$LOG_FILE"
else
    echo "❌ ERRO ao enviar backups do banco!" >> "$LOG_FILE"
    exit 1
fi

# Sincronizar backups do .env (credenciais)
echo "" >> "$LOG_FILE"
echo "🔑 Enviando backups de credenciais..." >> "$LOG_FILE"
aws s3 sync "$BACKUP_DIR/env/" "${S3_BACKUP_PATH}env/" \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE" >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Credenciais enviadas com sucesso!" >> "$LOG_FILE"
else
    echo "❌ ERRO ao enviar credenciais!" >> "$LOG_FILE"
fi

# Listar backups no S3
echo "" >> "$LOG_FILE"
echo "📋 Backups disponíveis no S3:" >> "$LOG_FILE"
aws s3 ls "${S3_BACKUP_PATH}database/" \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE" \
    --recursive \
    --human-readable \
    --summarize >> "$LOG_FILE" 2>&1

# Estatísticas
echo "" >> "$LOG_FILE"
echo "📊 Estatísticas:" >> "$LOG_FILE"

NUM_FILES=$(find "$BACKUP_DIR/database" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR/database" | cut -f1)

echo "   • Arquivos locais: $NUM_FILES" >> "$LOG_FILE"
echo "   • Tamanho total: $TOTAL_SIZE" >> "$LOG_FILE"
echo "   • Destino: ${S3_BACKUP_PATH}" >> "$LOG_FILE"

# Registrar sucesso
echo "" >> "$LOG_FILE"
echo "✅ Upload para AWS S3 concluído com sucesso em $(date)" >> "$LOG_FILE"
echo "✅ Backup sincronizado com AWS S3 em $(date)" >> "$BACKUP_DIR/logs/last_s3_sync.log"

echo "" >> "$LOG_FILE"
echo "=== FIM DO UPLOAD ===" >> "$LOG_FILE"

# Limpar logs antigos (manter 30 dias)
find "$BACKUP_DIR/logs" -name "s3_sync_*.log" -mtime +30 -delete

exit 0

