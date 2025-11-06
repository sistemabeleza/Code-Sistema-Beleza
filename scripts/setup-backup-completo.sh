
#!/bin/bash

##############################################################################
# Script de Configuração do Sistema Completo de Backup
# Sistema Beleza - Backup de Dados dos Clientes
##############################################################################

echo "========================================"
echo "  CONFIGURAÇÃO DO SISTEMA DE BACKUP"
echo "  Sistema Beleza"
echo "========================================"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretórios
BACKUP_BASE="/home/ubuntu/backups"
PROJETO_DIR="/home/ubuntu/sistema_salao_beleza"

echo "📁 Criando diretórios de backup..."
mkdir -p "$BACKUP_BASE/database"
mkdir -p "$BACKUP_BASE/env"
mkdir -p "$BACKUP_BASE/logs"
mkdir -p "$BACKUP_BASE/cloud_sync"

echo "✅ Diretórios criados!"
echo ""

# Configurar permissões
echo "🔐 Configurando permissões de segurança..."
chmod 700 "$BACKUP_BASE"
chmod 700 "$BACKUP_BASE/database"
chmod 700 "$BACKUP_BASE/env"
chmod 755 "$BACKUP_BASE/logs"
echo "✅ Permissões configuradas!"
echo ""

# Tornar scripts executáveis
echo "⚙️  Configurando scripts..."
chmod +x "$PROJETO_DIR/scripts/backup-auto.sh"
chmod +x "$PROJETO_DIR/scripts/restore.sh"
chmod +x "$PROJETO_DIR/scripts/cleanup-old-backups.sh"
chmod +x "$PROJETO_DIR/scripts/test-restore.sh"
echo "✅ Scripts configurados!"
echo ""

# Verificar dependências
echo "🔍 Verificando dependências..."

# PostgreSQL client
if ! command -v pg_dump &> /dev/null; then
    echo -e "${YELLOW}⚠️  pg_dump não encontrado. Instalando...${NC}"
    sudo apt-get update && sudo apt-get install -y postgresql-client
fi

# Node e Yarn
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    echo "Por favor, instale Node.js primeiro"
    exit 1
fi

if ! command -v yarn &> /dev/null; then
    echo -e "${YELLOW}⚠️  Yarn não encontrado. Instalando...${NC}"
    npm install -g yarn
fi

echo "✅ Dependências OK!"
echo ""

# Teste de backup
echo "🧪 Testando sistema de backup..."
cd "$PROJETO_DIR/nextjs_space"

if yarn tsx scripts/backup-database.ts > "$BACKUP_BASE/logs/test_backup_$(date +%Y%m%d_%H%M%S).log" 2>&1; then
    echo -e "${GREEN}✅ Teste de backup bem-sucedido!${NC}"
else
    echo -e "${RED}❌ Erro no teste de backup. Verifique os logs.${NC}"
    echo "Log em: $BACKUP_BASE/logs/"
    exit 1
fi
echo ""

# Configurar cron
echo "⏰ Deseja configurar backup automático diário às 3h da manhã? (s/n)"
read -r resposta

if [[ "$resposta" =~ ^[Ss]$ ]]; then
    # Verificar se já existe
    if crontab -l 2>/dev/null | grep -q "backup-auto.sh"; then
        echo -e "${YELLOW}⚠️  Backup automático já está configurado!${NC}"
    else
        # Adicionar ao crontab
        (crontab -l 2>/dev/null; echo "0 3 * * * $PROJETO_DIR/scripts/backup-auto.sh") | crontab -
        echo -e "${GREEN}✅ Backup automático configurado!${NC}"
        echo "   Será executado todo dia às 3h da manhã"
    fi
else
    echo "ℹ️  Você pode configurar manualmente depois com:"
    echo "   crontab -e"
    echo "   Adicione: 0 3 * * * $PROJETO_DIR/scripts/backup-auto.sh"
fi
echo ""

# Estatísticas
echo "========================================"
echo "  CONFIGURAÇÃO CONCLUÍDA! ✅"
echo "========================================"
echo ""
echo "📊 Resumo:"
echo "   • Diretório de backups: $BACKUP_BASE"
echo "   • Retenção: 30 dias"
echo "   • Backup automático: $(crontab -l 2>/dev/null | grep -q 'backup-auto.sh' && echo 'Ativo ✅' || echo 'Inativo ⚠️')"
echo ""
echo "📋 Comandos úteis:"
echo "   • Backup manual:"
echo "     cd $PROJETO_DIR/nextjs_space"
echo "     yarn tsx scripts/backup-database.ts"
echo ""
echo "   • Ver backups:"
echo "     ls -lh $BACKUP_BASE/database/"
echo ""
echo "   • Ver logs:"
echo "     cat $BACKUP_BASE/logs/*.log"
echo ""
echo "   • Restaurar backup:"
echo "     bash $PROJETO_DIR/scripts/restore.sh"
echo ""
echo "💡 Recomendações:"
echo "   1. Teste restaurar um backup para garantir que funciona"
echo "   2. Configure backup em nuvem (Google Drive/Dropbox)"
echo "   3. Mantenha backups em pelo menos 2 locais diferentes"
echo "   4. Verifique os logs semanalmente"
echo ""
echo "📖 Documentação completa:"
echo "   $PROJETO_DIR/BACKUP_DADOS_CLIENTES.md"
echo ""
echo "========================================"

