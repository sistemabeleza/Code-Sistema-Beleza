
#!/bin/bash

##############################################################################
# Script para Configurar Backup Automático - Sistema Beleza
# Este script configura o cron para fazer backups automáticos
# Uso: bash scripts/setup-cron.sh
##############################################################################

echo "⏰ =========================================="
echo "   CONFIGURAR BACKUP AUTOMÁTICO"
echo "=========================================="
echo ""

echo "Escolha a frequência de backup:"
echo ""
echo "1) Diariamente às 3h da manhã (recomendado)"
echo "2) A cada 6 horas"
echo "3) A cada 12 horas"
echo "4) Semanalmente (domingo às 2h)"
echo "5) Personalizado"
echo ""
read -p "Escolha uma opção [1-5]: " OPCAO

case $OPCAO in
    1)
        CRON_SCHEDULE="0 3 * * *"
        DESCRICAO="Diariamente às 3h da manhã"
        ;;
    2)
        CRON_SCHEDULE="0 */6 * * *"
        DESCRICAO="A cada 6 horas"
        ;;
    3)
        CRON_SCHEDULE="0 */12 * * *"
        DESCRICAO="A cada 12 horas"
        ;;
    4)
        CRON_SCHEDULE="0 2 * * 0"
        DESCRICAO="Semanalmente (domingo às 2h)"
        ;;
    5)
        echo ""
        echo "Digite o agendamento do cron (formato: minuto hora dia mês dia_semana)"
        echo "Exemplos:"
        echo "  0 3 * * *    = 3h da manhã todos os dias"
        echo "  0 */6 * * *  = A cada 6 horas"
        echo "  30 2 * * 0   = 2:30h todo domingo"
        read -p "Schedule: " CRON_SCHEDULE
        DESCRICAO="Personalizado: $CRON_SCHEDULE"
        ;;
    *)
        echo "Opção inválida!"
        exit 1
        ;;
esac

echo ""
echo "📋 Configuração escolhida:"
echo "   Frequência: $DESCRICAO"
echo "   Schedule: $CRON_SCHEDULE"
echo ""

# Verificar se já existe tarefa agendada
EXISTING_CRON=$(crontab -l 2>/dev/null | grep "backup-auto.sh")

if [ -n "$EXISTING_CRON" ]; then
    echo "⚠️  Já existe um backup automático configurado:"
    echo "   $EXISTING_CRON"
    echo ""
    read -p "Deseja substituir? (SIM/NAO): " SUBSTITUIR
    
    if [ "$SUBSTITUIR" != "SIM" ]; then
        echo "❌ Configuração cancelada."
        exit 0
    fi
    
    # Remover tarefa antiga
    crontab -l 2>/dev/null | grep -v "backup-auto.sh" | crontab -
    echo "   ✅ Tarefa antiga removida"
fi

# Adicionar nova tarefa
SCRIPT_PATH="/home/ubuntu/sistema_salao_beleza/scripts/backup-auto.sh"

# Garantir que o script é executável
chmod +x "$SCRIPT_PATH"

# Adicionar ao crontab
(crontab -l 2>/dev/null; echo "$CRON_SCHEDULE $SCRIPT_PATH") | crontab -

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ BACKUP AUTOMÁTICO CONFIGURADO!"
    echo "=========================================="
    echo ""
    echo "📋 Detalhes:"
    echo "   Frequência: $DESCRICAO"
    echo "   Script: $SCRIPT_PATH"
    echo ""
    echo "📅 Tarefas agendadas atuais:"
    crontab -l
    echo ""
    echo "💡 Os backups serão salvos em: /home/ubuntu/backups/"
    echo "   Backups antigos (> 30 dias) serão removidos automaticamente"
    echo ""
    echo "🔍 Para verificar logs:"
    echo "   tail -f /home/ubuntu/backups/logs/auto_backup_*.log"
    echo ""
else
    echo "❌ Erro ao configurar cron!"
    exit 1
fi

# Teste rápido
echo "🧪 Deseja fazer um backup de teste agora? (SIM/NAO): "
read TESTAR

if [ "$TESTAR" = "SIM" ]; then
    echo ""
    echo "🔄 Executando backup de teste..."
    bash "$SCRIPT_PATH"
fi

echo ""
echo "✅ Configuração concluída!"
