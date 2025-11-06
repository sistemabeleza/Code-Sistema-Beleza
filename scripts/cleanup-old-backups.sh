
#!/bin/bash

##############################################################################
# Script para Limpar Backups Antigos - Sistema Beleza
# Remove backups com mais de X dias para economizar espaço
# Uso: bash scripts/cleanup-old-backups.sh [dias]
##############################################################################

BACKUP_DIR="/home/ubuntu/backups"
DAYS=${1:-30}  # Padrão: 30 dias

echo "🗑️  =========================================="
echo "   LIMPEZA DE BACKUPS ANTIGOS"
echo "=========================================="
echo ""

echo "📁 Diretório: $BACKUP_DIR"
echo "⏰ Remover backups com mais de: $DAYS dias"
echo ""

# Calcular espaço antes
SPACE_BEFORE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
echo "💾 Espaço usado antes: $SPACE_BEFORE"
echo ""

# Listar arquivos que serão removidos
echo "📋 Arquivos que serão removidos:"
find "$BACKUP_DIR" -type f -mtime +$DAYS -ls

# Contar arquivos
COUNT=$(find "$BACKUP_DIR" -type f -mtime +$DAYS | wc -l)

if [ $COUNT -eq 0 ]; then
    echo "   ✅ Nenhum arquivo antigo encontrado"
    exit 0
fi

echo ""
echo "⚠️  Total de arquivos a remover: $COUNT"
read -p "Confirma a remoção? (SIM/NAO): " CONFIRMA

if [ "$CONFIRMA" != "SIM" ]; then
    echo "❌ Limpeza cancelada"
    exit 0
fi

# Remover arquivos
echo ""
echo "🗑️  Removendo arquivos antigos..."
find "$BACKUP_DIR" -type f -mtime +$DAYS -delete

# Calcular espaço depois
SPACE_AFTER=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)

echo ""
echo "=========================================="
echo "✅ LIMPEZA CONCLUÍDA"
echo "=========================================="
echo ""
echo "💾 Espaço usado antes: $SPACE_BEFORE"
echo "💾 Espaço usado depois: $SPACE_AFTER"
echo ""
echo "📊 Backups restantes:"
ls -lh "$BACKUP_DIR/database" 2>/dev/null | tail -10
echo ""
