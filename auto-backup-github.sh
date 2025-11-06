
#!/bin/bash

# Script de Backup Automático para GitHub
# Sistema Beleza - Backup automático após mudanças

echo "🔄 Iniciando backup automático no GitHub..."
echo ""

cd /home/ubuntu/sistema_salao_beleza

# Verifica se há mudanças
if [[ -z $(git status -s) ]]; then
    echo "✅ Nenhuma mudança detectada. GitHub já está atualizado!"
    exit 0
fi

# Adiciona todas as mudanças
git add .

# Cria commit com timestamp
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
git commit -m "🔄 Backup automático - $TIMESTAMP"

# Envia para o GitHub
echo "📤 Enviando para GitHub..."
git push origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║          ✅ BACKUP ATUALIZADO NO GITHUB! ✅                  ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🌐 Repositório: https://github.com/sistemabeleza/Code-Sistema-Beleza"
    echo "📦 Commits totais: $(git log --oneline | wc -l)"
    echo "⏰ Última atualização: $TIMESTAMP"
    echo ""
else
    echo "❌ Erro ao atualizar GitHub"
    echo "💡 Verifique sua conexão e credenciais"
    exit 1
fi
