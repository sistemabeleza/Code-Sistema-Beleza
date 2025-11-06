#!/bin/bash

# ============================================================================
# 🔄 SCRIPT DE BACKUP AUTOMÁTICO PARA GITHUB
# ============================================================================
# Este script faz backup automático do código para o GitHub
# Mantém seu repositório sempre atualizado com as últimas mudanças
# ============================================================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Diretório do projeto
PROJECT_DIR="/home/ubuntu/sistema_salao_beleza"

# Data e hora para o commit
DATA=$(date '+%Y-%m-%d %H:%M:%S')

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║              🔄 BACKUP AUTOMÁTICO PARA GITHUB 🔄                     ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Navegar para o diretório do projeto
cd "$PROJECT_DIR" || {
    echo -e "${RED}❌ Erro: Não foi possível acessar o diretório do projeto${NC}"
    exit 1
}

echo -e "${BLUE}📂 Diretório do projeto: $PROJECT_DIR${NC}"
echo ""

# Verificar se é um repositório Git
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Erro: Este diretório não é um repositório Git${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 Verificando mudanças...${NC}"
echo ""

# Verificar se há mudanças
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${GREEN}✅ Nenhuma mudança detectada. Repositório já está atualizado!${NC}"
    echo ""
    exit 0
fi

echo -e "${YELLOW}📝 Mudanças detectadas:${NC}"
git status --short
echo ""

# Adicionar todas as mudanças
echo -e "${BLUE}➕ Adicionando arquivos...${NC}"
git add .

# Verificar se há algo para commitar
if git diff --cached --quiet; then
    echo -e "${GREEN}✅ Nada para commitar após adicionar os arquivos${NC}"
    echo ""
    exit 0
fi

# Fazer commit
echo -e "${BLUE}💾 Fazendo commit...${NC}"
COMMIT_MSG="🔄 Backup automático - $DATA"
git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Commit realizado com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao fazer commit${NC}"
    exit 1
fi

echo ""

# Fazer push para o GitHub
echo -e "${BLUE}🚀 Enviando para o GitHub...${NC}"
git push origin master

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Backup enviado com sucesso para o GitHub!${NC}"
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                      ║"
    echo "║                  ✅ BACKUP CONCLUÍDO COM SUCESSO! ✅                 ║"
    echo "║                                                                      ║"
    echo "║  📍 Repositório: sistemabeleza/Code-Sistema-Beleza                   ║"
    echo "║  🕐 Data/Hora: $DATA                                  ║"
    echo "║  🔗 https://github.com/sistemabeleza/Code-Sistema-Beleza            ║"
    echo "║                                                                      ║"
    echo "╚══════════════════════════════════════════════════════════════════════╝"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Erro ao enviar para o GitHub${NC}"
    echo -e "${YELLOW}💡 Dica: Verifique sua conexão com a internet e as credenciais${NC}"
    exit 1
fi

exit 0
