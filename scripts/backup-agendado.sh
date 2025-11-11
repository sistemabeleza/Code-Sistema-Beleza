#!/bin/bash

##############################################################################
# Script de Backup Agendado - Sistema Beleza
# Executa backup completo automaticamente usando Node.js/Prisma
##############################################################################

cd /home/ubuntu/sistema_salao_beleza/nextjs_space

# Criar diretórios de backup
mkdir -p /home/ubuntu/backups/database
mkdir -p /home/ubuntu/backups/env
mkdir -p /home/ubuntu/backups/logs

echo "========================================="
echo "🔄 Iniciando Backup Automático"
echo "📅 $(date '+%d/%m/%Y às %H:%M:%S')"
echo "========================================="
echo ""

# Executar script de backup com Node.js
yarn tsx scripts/backup-database.ts

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Backup automático concluído com sucesso!"
    exit 0
else
    echo ""
    echo "❌ Erro no backup automático!"
    exit 1
fi
