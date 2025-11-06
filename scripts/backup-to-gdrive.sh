
#!/bin/bash

##############################################################################
# Script de Upload de Backup para Google Drive
# Requisito: rclone configurado com remote "gdrive"
##############################################################################

# Configurações
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$BACKUP_DIR/logs/gdrive_sync_$DATE.log"

echo "=== SYNC PARA GOOGLE DRIVE ===" > "$LOG_FILE"
echo "Data/Hora: $(date)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Verificar se rclone está instalado
if ! command -v rclone &> /dev/null; then
    echo "❌ rclone não está instalado!" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    echo "Para instalar:" >> "$LOG_FILE"
    echo "  curl https://rclone.org/install.sh | sudo bash" >> "$LOG_FILE"
    echo "  rclone config" >> "$LOG_FILE"
    exit 1
fi

# Verificar se remote gdrive está configurado
if ! rclone listremotes | grep -q "gdrive:"; then
    echo "❌ Remote 'gdrive' não configurado!" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    echo "Para configurar:" >> "$LOG_FILE"
    echo "  rclone config" >> "$LOG_FILE"
    echo "  Escolha: Google Drive" >> "$LOG_FILE"
    echo "  Nome: gdrive" >> "$LOG_FILE"
    exit 1
fi

echo "📤 Iniciando upload para Google Drive..." >> "$LOG_FILE"

# Sincronizar backups
rclone sync "$BACKUP_DIR" gdrive:SistemaBelez/backups \
  --log-file="$LOG_FILE" \
  --log-level INFO \
  --progress \
  --create-empty-src-dirs \
  --exclude "cloud_sync/**" \
  --exclude "logs/gdrive_sync_*.log"

if [ $? -eq 0 ]; then
    echo "" >> "$LOG_FILE"
    echo "✅ Upload concluído com sucesso!" >> "$LOG_FILE"
    
    # Estatísticas
    TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
    NUM_FILES=$(find "$BACKUP_DIR/database" -type f | wc -l)
    
    echo "" >> "$LOG_FILE"
    echo "📊 Estatísticas:" >> "$LOG_FILE"
    echo "   • Arquivos enviados: $NUM_FILES" >> "$LOG_FILE"
    echo "   • Tamanho total: $TOTAL_SIZE" >> "$LOG_FILE"
    echo "   • Destino: gdrive:SistemaBelez/backups" >> "$LOG_FILE"
    
    # Notificar sucesso
    echo "✅ Backup sincronizado com Google Drive em $(date)" >> "$BACKUP_DIR/logs/last_sync.log"
else
    echo "" >> "$LOG_FILE"
    echo "❌ ERRO no upload!" >> "$LOG_FILE"
    
    # Enviar alerta (se configurado)
    # echo "Upload para Google Drive falhou em $(date)" | mail -s "ALERTA: Sync Falhou" sistemabeleza.contato@gmail.com
fi

echo "" >> "$LOG_FILE"
echo "=== FIM DO SYNC ===" >> "$LOG_FILE"

# Limpar logs antigos (manter 30 dias)
find "$BACKUP_DIR/logs" -name "gdrive_sync_*.log" -mtime +30 -delete

exit 0

