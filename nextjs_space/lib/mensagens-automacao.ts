
/**
 * Utilitário para formatação de mensagens de automação do Sistema Beleza
 * 
 * Este módulo formata mensagens de WhatsApp baseado em payloads de webhook
 */

interface PayloadWebhook {
  evento: 'agendamento_criado' | 'agendamento_atualizado' | 'agendamento_cancelado' | 'agendamento_lembrete';
  timestamp: string;
  salao: {
    nome: string;
    telefone: string;
  };
  agendamento: {
    id: number | string; // Aceita tanto number quanto string
    data: string; // YYYY-MM-DD
    hora_inicio: string; // HH:MM
    hora_fim: string;
    status: string;
  };
  cliente: {
    nome: string;
    telefone: string;
  };
  servico: {
    nome: string;
  };
  profissional: {
    nome: string;
  };
}

/**
 * Formata data de YYYY-MM-DD para DD/MM/AAAA
 */
function formatarData(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

/**
 * Formata mensagem de WhatsApp baseado no tipo de evento
 */
export function formatarMensagemAutomacao(payload: PayloadWebhook): string {
  const { evento, salao, agendamento, cliente, servico, profissional } = payload;
  
  // Formata a data no formato brasileiro
  const dataFormatada = formatarData(agendamento.data);
  
  switch (evento) {
    case 'agendamento_criado':
      return `Olá, ${cliente.nome}! 🗓️
Seu agendamento foi criado na ${salao.nome}.

Serviço: ${servico.nome}
Profissional: ${profissional.nome}
Data: ${dataFormatada} às ${agendamento.hora_inicio}.

Qualquer dúvida, fale com a gente pelo WhatsApp ${salao.telefone}.`;

    case 'agendamento_atualizado':
      return `Olá, ${cliente.nome}! 🔁
Seu agendamento na ${salao.nome} foi atualizado.

Serviço: ${servico.nome}
Profissional: ${profissional.nome}
Nova data/horário: ${dataFormatada} às ${agendamento.hora_inicio}.

Se precisar ajustar novamente, é só chamar no WhatsApp ${salao.telefone}.`;

    case 'agendamento_cancelado':
      return `Olá, ${cliente.nome}. ❌
Seu agendamento na ${salao.nome} foi cancelado.

Serviço: ${servico.nome}
Data/horário anterior: ${dataFormatada} às ${agendamento.hora_inicio}.

Se quiser remarcar, fale com a gente no WhatsApp ${salao.telefone}.`;

    case 'agendamento_lembrete':
      return `Olá, ${cliente.nome}! 🗓️
Só passando para lembrar que HOJE é o dia do seu horário na ${salao.nome}. 💇‍♂️💅

Serviço: ${servico.nome}
Profissional: ${profissional.nome}
Horário: hoje, às ${agendamento.hora_inicio}.

Se não puder comparecer, avise a gente pelo WhatsApp ${salao.telefone} para liberarmos o horário para outro cliente. 😉`;

    default:
      throw new Error(`Tipo de evento desconhecido: ${evento}`);
  }
}

/**
 * Gera payload de exemplo para testes
 */
export function gerarPayloadExemplo(
  evento: PayloadWebhook['evento'],
  salaoNome: string = 'Barbearia do Naldo',
  salaoTelefone: string = '31971932516'
): PayloadWebhook {
  return {
    evento,
    timestamp: new Date().toISOString(),
    salao: {
      nome: salaoNome,
      telefone: salaoTelefone
    },
    agendamento: {
      id: 1,
      data: new Date().toISOString().split('T')[0],
      hora_inicio: '15:00',
      hora_fim: '16:00',
      status: 'confirmado'
    },
    cliente: {
      nome: 'Cliente Exemplo',
      telefone: '31999999999'
    },
    servico: {
      nome: 'Corte Masculino'
    },
    profissional: {
      nome: 'Profissional Exemplo'
    }
  };
}
