
#!/bin/bash

##############################################################################
# Script para Listar Backups no AWS S3
# Sistema Beleza
##############################################################################

# Configurações
PROJECT_DIR="/home/ubuntu/sistema_salao_beleza/nextjs_space"

# Carregar variáveis de ambiente
if [ -f "$PROJECT_DIR/.env" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
fi

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "  BACKUPS NO AWS S3"
echo "  Sistema Beleza"
echo "========================================"
echo ""

# Verificar AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI não está instalado!"
    exit 1
fi

# Configurar AWS
export AWS_PROFILE=${AWS_PROFILE:-hosted_storage}
export AWS_REGION=${AWS_REGION:-us-west-2}
BUCKET_NAME=${AWS_BUCKET_NAME}
FOLDER_PREFIX=${AWS_FOLDER_PREFIX}

if [ -z "$BUCKET_NAME" ]; then
    echo "❌ AWS_BUCKET_NAME não configurado no .env!"
    exit 1
fi

S3_BACKUP_PATH="s3://${BUCKET_NAME}${FOLDER_PREFIX}backups/"

echo "📦 Bucket: $BUCKET_NAME"
echo "📁 Caminho: ${FOLDER_PREFIX}backups/"
echo ""
echo "🗂️  Backups do Banco de Dados:"
echo "---"

aws s3 ls "${S3_BACKUP_PATH}database/" \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE" \
    --recursive \
    --human-readable

echo ""
echo "🔑 Backups de Credenciais:"
echo "---"

aws s3 ls "${S3_BACKUP_PATH}env/" \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE" \
    --recursive \
    --human-readable

echo ""
echo "📊 Resumo:"
echo "---"

# Contar arquivos
DB_COUNT=$(aws s3 ls "${S3_BACKUP_PATH}database/" --recursive | wc -l)
ENV_COUNT=$(aws s3 ls "${S3_BACKUP_PATH}env/" --recursive | wc -l)

echo "• Backups de banco: $DB_COUNT"
echo "• Backups de .env: $ENV_COUNT"

echo ""
echo "💡 Comandos úteis:"
echo "   • Baixar backups: bash scripts/restore-from-s3.sh"
echo "   • Enviar novos backups: bash scripts/backup-to-s3.sh"
echo ""

