
#!/bin/bash

##############################################################################
# Script Simples de Backup - Sistema Beleza
# Usa Node.js + Prisma para fazer backup
# Uso: bash scripts/simple-backup.sh
##############################################################################

echo "🔐 Iniciando backup do Sistema Beleza..."
echo ""

cd /home/ubuntu/sistema_salao_beleza/nextjs_space

# Verificar se Node.js está disponível
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    exit 1
fi

# Fazer backup usando script TypeScript
yarn tsx scripts/backup-database.ts

exit $?
