
#!/bin/bash

echo "🚀 ======================================"
echo "   UPLOAD PARA O GITHUB"
echo "======================================"
echo ""

# Verificar se já existe remote
if git remote | grep -q "origin"; then
    echo "✅ Remote 'origin' já existe"
    git remote -v
    echo ""
    echo "Deseja atualizar? (s/n)"
    read -r resposta
    if [ "$resposta" = "s" ]; then
        echo "Digite a nova URL do repositório GitHub:"
        read -r url
        git remote set-url origin "$url"
        echo "✅ Remote atualizado!"
    fi
else
    echo "📝 Cole a URL do seu repositório GitHub:"
    echo "   (exemplo: https://github.com/seu-usuario/sistema-salao-beleza.git)"
    read -r url
    git remote add origin "$url"
    echo "✅ Repositório conectado!"
fi

echo ""
echo "🔍 Verificando arquivos..."
git status

echo ""
echo "📤 Enviando código para o GitHub..."
git push -u origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ======================================"
    echo "   SUCESSO! Projeto no GitHub! 🎉"
    echo "======================================"
    echo ""
    echo "Acesse: $(git remote get-url origin | sed 's/.git$//')"
else
    echo ""
    echo "❌ Erro ao enviar. Verifique suas credenciais do GitHub."
    echo ""
    echo "💡 Dicas:"
    echo "   1. Certifique-se de estar logado no GitHub"
    echo "   2. Talvez precise usar um Personal Access Token"
    echo "   3. Veja: https://github.com/settings/tokens"
fi
