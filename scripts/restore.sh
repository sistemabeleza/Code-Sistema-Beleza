
#!/bin/bash

##############################################################################
# Script de Restauração - Sistema Beleza
# ATENÇÃO: Este script VAI SOBRESCREVER o banco de dados atual!
# Uso: bash scripts/restore.sh caminho/para/backup.backup
##############################################################################

echo "🔄 =========================================="
echo "   RESTAURAÇÃO - SISTEMA BELEZA"
echo "   $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

# Verificar se foi passado o arquivo de backup
if [ -z "$1" ]; then
    echo "❌ Erro: Você precisa especificar o arquivo de backup!"
    echo ""
    echo "Uso: bash scripts/restore.sh caminho/para/backup.backup"
    echo ""
    echo "📋 Backups disponíveis:"
    ls -lht /home/ubuntu/backups/database/*.backup | head -10
    exit 1
fi

BACKUP_FILE="$1"

# Verificar se o arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Erro: Arquivo de backup não encontrado: $BACKUP_FILE"
    exit 1
fi

echo "📁 Arquivo de backup: $BACKUP_FILE"
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "📊 Tamanho: $BACKUP_SIZE"
echo ""

# Confirmação
echo "⚠️  ATENÇÃO: Esta operação VAI SOBRESCREVER todos os dados atuais!"
echo ""
read -p "Você tem certeza que deseja continuar? (digite 'SIM' para confirmar): " CONFIRMACAO

if [ "$CONFIRMACAO" != "SIM" ]; then
    echo "❌ Restauração cancelada."
    exit 0
fi

echo ""
echo "🔄 Iniciando restauração..."
echo ""

# Configurações do banco
DB_HOST="db-42302409.db002.hosteddb.reai.io"
DB_PORT="5432"
DB_USER="role_42302409"
DB_NAME="42302409"
DB_PASS="zbUmJSq3214F0jCcN3hzpqNn7Gqf56tz"

# Configurar senha
export PGPASSWORD="$DB_PASS"

# Fazer backup de segurança antes de restaurar
echo "💾 Criando backup de segurança antes da restauração..."
SAFETY_BACKUP="/home/ubuntu/backups/database/pre_restore_$(date +%Y%m%d_%H%M%S).backup"
pg_dump -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -F c \
        -f "$SAFETY_BACKUP"

if [ $? -eq 0 ]; then
    echo "   ✅ Backup de segurança criado: $SAFETY_BACKUP"
else
    echo "   ⚠️  Aviso: Não foi possível criar backup de segurança"
    read -p "Continuar mesmo assim? (SIM/NAO): " CONTINUE
    if [ "$CONTINUE" != "SIM" ]; then
        exit 1
    fi
fi

echo ""

# Restaurar
echo "🔄 Restaurando banco de dados..."
pg_restore -h "$DB_HOST" \
           -p "$DB_PORT" \
           -U "$DB_USER" \
           -d "$DB_NAME" \
           --clean \
           --if-exists \
           --no-owner \
           --no-acl \
           "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ RESTAURAÇÃO CONCLUÍDA COM SUCESSO!"
    echo "=========================================="
    echo ""
    echo "💡 Próximos passos:"
    echo "   1. Reinicie a aplicação: pm2 restart sistema-beleza"
    echo "   2. Teste o login no sistema"
    echo "   3. Verifique se os dados estão corretos"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "❌ ERRO NA RESTAURAÇÃO!"
    echo "=========================================="
    echo ""
    echo "💡 O backup de segurança está em: $SAFETY_BACKUP"
    echo "   Você pode tentar restaurá-lo com:"
    echo "   bash scripts/restore.sh $SAFETY_BACKUP"
    echo ""
    exit 1
fi

# Limpar senha
unset PGPASSWORD

echo "✅ Processo finalizado em: $(date '+%Y-%m-%d %H:%M:%S')"
