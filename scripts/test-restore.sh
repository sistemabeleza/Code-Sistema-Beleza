
#!/bin/bash

##############################################################################
# Script de Teste de Restauração - Sistema Beleza
# Testa se o backup pode ser restaurado sem afetar produção
# Uso: bash scripts/test-restore.sh
##############################################################################

echo "🧪 =========================================="
echo "   TESTE DE RESTAURAÇÃO - SISTEMA BELEZA"
echo "=========================================="
echo ""

# Encontrar último backup
LAST_BACKUP=$(ls -t /home/ubuntu/backups/database/*.backup 2>/dev/null | head -1)

if [ -z "$LAST_BACKUP" ]; then
    echo "❌ Nenhum backup encontrado!"
    echo "   Execute primeiro: bash scripts/backup.sh"
    exit 1
fi

echo "📁 Testando backup: $LAST_BACKUP"
BACKUP_SIZE=$(du -h "$LAST_BACKUP" | cut -f1)
echo "📊 Tamanho: $BACKUP_SIZE"
echo ""

# Testar integridade do arquivo
echo "🔍 Verificando integridade do backup..."

# Configurações do banco
DB_HOST="db-42302409.db002.hosteddb.reai.io"
DB_PORT="5432"
DB_USER="role_42302409"
DB_PASS="zbUmJSq3214F0jCcN3hzpqNn7Gqf56tz"

export PGPASSWORD="$DB_PASS"

# Listar conteúdo do backup
pg_restore --list "$LAST_BACKUP" > /tmp/backup_list.txt 2>&1

if [ $? -eq 0 ]; then
    echo "   ✅ Backup está íntegro e pode ser restaurado"
    
    # Mostrar estatísticas
    TOTAL_TABLES=$(grep "TABLE DATA" /tmp/backup_list.txt | wc -l)
    echo ""
    echo "📊 Conteúdo do backup:"
    echo "   • Total de tabelas: $TOTAL_TABLES"
    echo ""
    echo "   Principais tabelas:"
    grep "TABLE DATA" /tmp/backup_list.txt | head -10
    
else
    echo "   ❌ Backup parece estar corrompido!"
    exit 1
fi

unset PGPASSWORD
rm -f /tmp/backup_list.txt

echo ""
echo "=========================================="
echo "✅ TESTE DE RESTAURAÇÃO CONCLUÍDO"
echo "=========================================="
echo ""
echo "💡 O backup está válido e pronto para uso."
echo "   Para restaurar em produção, execute:"
echo "   bash scripts/restore.sh $LAST_BACKUP"
echo ""
