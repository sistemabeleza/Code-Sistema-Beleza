
#!/bin/bash

##############################################################################
# Script de Verificação de Backups
# Verifica a integridade e status dos backups
##############################################################################

BACKUP_DIR="/home/ubuntu/backups"

echo "========================================"
echo "  VERIFICAÇÃO DE BACKUPS"
echo "  $(date)"
echo "========================================"
echo ""

# Verificar se diretório existe
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Diretório de backup não encontrado: $BACKUP_DIR"
    exit 1
fi

echo "📊 Estatísticas Gerais:"
echo "---"

# Contar backups
NUM_DB_BACKUPS=$(find "$BACKUP_DIR/database" -type f \( -name "*.backup" -o -name "*.gz" -o -name "*.json.gz" \) 2>/dev/null | wc -l)
NUM_ENV_BACKUPS=$(find "$BACKUP_DIR/env" -type f -name ".env_*" 2>/dev/null | wc -l)

echo "• Backups de banco de dados: $NUM_DB_BACKUPS"
echo "• Backups de .env: $NUM_ENV_BACKUPS"
echo ""

# Tamanho total
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
echo "• Espaço usado: $TOTAL_SIZE"
echo ""

# Espaço disponível
AVAILABLE_SPACE=$(df -h "$BACKUP_DIR" | tail -1 | awk '{print $4}')
echo "• Espaço disponível: $AVAILABLE_SPACE"
echo ""

echo "📁 Últimos 10 Backups:"
echo "---"
find "$BACKUP_DIR/database" -type f \( -name "*.backup" -o -name "*.gz" -o -name "*.json.gz" \) -printf "%T@ %Tc %p\n" 2>/dev/null | sort -rn | head -10 | awk '{$1=""; print $0}' | sed 's/^ //'

if [ $NUM_DB_BACKUPS -eq 0 ]; then
    echo "⚠️  Nenhum backup encontrado!"
fi
echo ""

# Verificar último backup
echo "🕐 Último Backup:"
echo "---"
LAST_BACKUP=$(find "$BACKUP_DIR/database" -type f \( -name "*.backup" -o -name "*.gz" -o -name "*.json.gz" \) -printf "%T@ %p\n" 2>/dev/null | sort -rn | head -1)

if [ -n "$LAST_BACKUP" ]; then
    LAST_FILE=$(echo "$LAST_BACKUP" | cut -d' ' -f2)
    LAST_DATE=$(stat -c %y "$LAST_FILE" | cut -d'.' -f1)
    LAST_SIZE=$(du -h "$LAST_FILE" | cut -f1)
    
    echo "• Arquivo: $(basename "$LAST_FILE")"
    echo "• Data: $LAST_DATE"
    echo "• Tamanho: $LAST_SIZE"
    
    # Calcular há quanto tempo
    LAST_TIMESTAMP=$(stat -c %Y "$LAST_FILE")
    NOW_TIMESTAMP=$(date +%s)
    DIFF=$((NOW_TIMESTAMP - LAST_TIMESTAMP))
    HOURS=$((DIFF / 3600))
    
    echo "• Há: $HOURS horas atrás"
    
    # Alerta se muito antigo
    if [ $HOURS -gt 48 ]; then
        echo ""
        echo "⚠️  ATENÇÃO: Último backup tem mais de 48 horas!"
        echo "   Recomenda-se fazer backup diário."
    fi
else
    echo "⚠️  Nenhum backup encontrado!"
fi
echo ""

# Verificar cron
echo "⏰ Backup Automático:"
echo "---"
if crontab -l 2>/dev/null | grep -q "backup-auto.sh"; then
    echo "✅ Backup automático CONFIGURADO"
    echo ""
    echo "Agendamento:"
    crontab -l 2>/dev/null | grep "backup-auto.sh"
else
    echo "⚠️  Backup automático NÃO configurado"
    echo ""
    echo "Para configurar:"
    echo "  crontab -e"
    echo "  Adicione: 0 3 * * * /home/ubuntu/sistema_salao_beleza/scripts/backup-auto.sh"
fi
echo ""

# Verificar logs
echo "📋 Últimos Logs de Backup:"
echo "---"
if [ -d "$BACKUP_DIR/logs" ]; then
    LAST_LOG=$(ls -t "$BACKUP_DIR/logs"/auto_backup_*.log 2>/dev/null | head -1)
    if [ -n "$LAST_LOG" ]; then
        echo "Último log: $(basename "$LAST_LOG")"
        echo ""
        echo "--- Conteúdo ---"
        tail -20 "$LAST_LOG"
    else
        echo "ℹ️  Nenhum log encontrado"
    fi
else
    echo "ℹ️  Diretório de logs não existe"
fi
echo ""

# Verificar Google Drive sync (se configurado)
echo "☁️  Sync com Nuvem:"
echo "---"
if command -v rclone &> /dev/null; then
    if rclone listremotes | grep -q "gdrive:"; then
        echo "✅ rclone configurado com Google Drive"
        
        # Verificar último sync
        if [ -f "$BACKUP_DIR/logs/last_sync.log" ]; then
            echo ""
            cat "$BACKUP_DIR/logs/last_sync.log"
        fi
    else
        echo "⚠️  rclone instalado mas Google Drive não configurado"
    fi
else
    echo "ℹ️  rclone não instalado (sync manual necessário)"
fi
echo ""

echo "========================================"
echo "  VERIFICAÇÃO CONCLUÍDA"
echo "========================================"
echo ""
echo "💡 Recomendações:"

# Gerar recomendações baseadas na verificação
if [ $NUM_DB_BACKUPS -eq 0 ]; then
    echo "   ⚠️  URGENTE: Fazer primeiro backup"
    echo "      cd /home/ubuntu/sistema_salao_beleza/nextjs_space"
    echo "      yarn tsx scripts/backup-database.ts"
fi

if ! crontab -l 2>/dev/null | grep -q "backup-auto.sh"; then
    echo "   ⚠️  Configurar backup automático"
    echo "      bash /home/ubuntu/sistema_salao_beleza/scripts/setup-backup-completo.sh"
fi

if ! command -v rclone &> /dev/null; then
    echo "   💡 Configurar backup em nuvem para maior segurança"
    echo "      Ver: /home/ubuntu/sistema_salao_beleza/BACKUP_DADOS_CLIENTES.md"
fi

if [ $NUM_DB_BACKUPS -gt 0 ] && crontab -l 2>/dev/null | grep -q "backup-auto.sh"; then
    echo "   ✅ Sistema de backup está funcionando corretamente!"
fi

echo ""

