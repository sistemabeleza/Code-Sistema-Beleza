
#!/bin/bash

##############################################################################
# Script de Restauração de Backup do AWS S3
# Sistema Beleza - Recuperação de Dados
##############################################################################

# Configurações
BACKUP_DIR="/home/ubuntu/backups"
PROJECT_DIR="/home/ubuntu/sistema_salao_beleza/nextjs_space"
DATE=$(date +%Y%m%d_%H%M%S)
RESTORE_DIR="$BACKUP_DIR/restore_$DATE"

# Carregar variáveis de ambiente
if [ -f "$PROJECT_DIR/.env" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
fi

echo "========================================"
echo "  RESTAURAR BACKUP DO AWS S3"
echo "  Sistema Beleza"
echo "========================================"
echo ""

# Verificar AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI não está instalado!"
    echo ""
    echo "Para instalar:"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install -y awscli"
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

echo "📥 Listando backups disponíveis no S3..."
echo ""

# Listar backups disponíveis
aws s3 ls "${S3_BACKUP_PATH}database/" \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE" \
    --recursive \
    --human-readable

echo ""
echo "========================================"
echo ""
echo "Deseja baixar TODOS os backups do S3? (s/n)"
read -r resposta

if [[ ! "$resposta" =~ ^[Ss]$ ]]; then
    echo "Operação cancelada."
    exit 0
fi

# Criar diretório de restauração
mkdir -p "$RESTORE_DIR/database"
mkdir -p "$RESTORE_DIR/env"

echo ""
echo "📥 Baixando backups do S3..."

# Baixar backups do banco
aws s3 sync "${S3_BACKUP_PATH}database/" "$RESTORE_DIR/database/" \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE"

if [ $? -eq 0 ]; then
    echo "✅ Backups do banco baixados com sucesso!"
else
    echo "❌ ERRO ao baixar backups do banco!"
    exit 1
fi

# Baixar backups do .env
aws s3 sync "${S3_BACKUP_PATH}env/" "$RESTORE_DIR/env/" \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE"

if [ $? -eq 0 ]; then
    echo "✅ Credenciais baixadas com sucesso!"
else
    echo "⚠️  Nenhuma credencial encontrada no S3"
fi

# Estatísticas
echo ""
echo "========================================"
echo "  DOWNLOAD CONCLUÍDO"
echo "========================================"
echo ""
echo "📊 Resumo:"
NUM_FILES=$(find "$RESTORE_DIR/database" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$RESTORE_DIR/database" | cut -f1)
echo "   • Arquivos baixados: $NUM_FILES"
echo "   • Tamanho total: $TOTAL_SIZE"
echo "   • Local: $RESTORE_DIR"
echo ""
echo "💡 Para restaurar um backup específico:"
echo "   bash /home/ubuntu/sistema_salao_beleza/scripts/restore.sh"
echo ""

