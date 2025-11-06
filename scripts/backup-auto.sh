
#!/bin/bash

##############################################################################
# Script de Backup Automático Diário - Sistema Beleza
# Este script é executado pelo cron diariamente
# Uso: crontab -e
#      0 3 * * * /home/ubuntu/sistema_salao_beleza/scripts/backup-auto.sh
##############################################################################

# Configurações
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$BACKUP_DIR/logs/auto_backup_$DATE.log"
RETENTION_DAYS=30  # Manter backups dos últimos 30 dias

# Criar diretórios
mkdir -p "$BACKUP_DIR/database"
mkdir -p "$BACKUP_DIR/logs"

echo "=== BACKUP AUTOMÁTICO ===" > "$LOG_FILE"
echo "Data/Hora: $(date)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Configurações do banco
DB_HOST="db-42302409.db002.hosteddb.reai.io"
DB_PORT="5432"
DB_USER="role_42302409"
DB_NAME="42302409"
DB_PASS="zbUmJSq3214F0jCcN3hzpqNn7Gqf56tz"

# Configurar senha
export PGPASSWORD="$DB_PASS"

# Fazer backup
BACKUP_FILE="$BACKUP_DIR/database/auto_backup_$DATE.backup"
pg_dump -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -F c \
        -f "$BACKUP_FILE" >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Backup criado com sucesso: $BACKUP_FILE" >> "$LOG_FILE"
    
    # Tamanho do backup
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "   Tamanho: $BACKUP_SIZE" >> "$LOG_FILE"
    
    # Limpar backups antigos
    echo "" >> "$LOG_FILE"
    echo "🗑️  Limpando backups antigos (> $RETENTION_DAYS dias)..." >> "$LOG_FILE"
    find "$BACKUP_DIR/database" -name "auto_backup_*.backup" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR/logs" -name "auto_backup_*.log" -mtime +$RETENTION_DAYS -delete
    echo "   Limpeza concluída" >> "$LOG_FILE"
    
else
    echo "❌ ERRO ao criar backup!" >> "$LOG_FILE"
    
    # Enviar alerta por email (se configurado)
    # echo "Backup falhou em $(date)" | mail -s "ALERTA: Backup Sistema Beleza Falhou" sistemabeleza.contato@gmail.com
fi

# Limpar senha
unset PGPASSWORD

# Estatísticas
echo "" >> "$LOG_FILE"
echo "📊 Estatísticas:" >> "$LOG_FILE"
echo "   Total de backups: $(ls -1 $BACKUP_DIR/database/*.backup 2>/dev/null | wc -l)" >> "$LOG_FILE"
echo "   Espaço usado: $(du -sh $BACKUP_DIR | cut -f1)" >> "$LOG_FILE"
echo "   Espaço livre: $(df -h /home | tail -1 | awk '{print $4}')" >> "$LOG_FILE"

echo "" >> "$LOG_FILE"
echo "=== FIM DO BACKUP ===" >> "$LOG_FILE"

# Manter apenas os últimos 90 dias de logs
find "$BACKUP_DIR/logs" -name "*.log" -mtime +90 -delete

exit 0
