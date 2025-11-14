
import { NextRequest, NextResponse } from 'next/server';
import { formatarMensagemAutomacao } from '@/lib/mensagens-automacao';

/**
 * API para formatar mensagens de automação
 * 
 * POST /api/mensagens/formatar
 * 
 * Recebe um payload de webhook e retorna a mensagem formatada
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    // Valida se o payload contém os campos obrigatórios
    if (!payload.evento) {
      return NextResponse.json(
        { erro: 'Campo "evento" é obrigatório' },
        { status: 400 }
      );
    }

    if (!payload.salao || !payload.salao.nome || !payload.salao.telefone) {
      return NextResponse.json(
        { erro: 'Dados do salão são obrigatórios' },
        { status: 400 }
      );
    }

    if (!payload.agendamento) {
      return NextResponse.json(
        { erro: 'Dados do agendamento são obrigatórios' },
        { status: 400 }
      );
    }

    if (!payload.cliente || !payload.cliente.nome) {
      return NextResponse.json(
        { erro: 'Nome do cliente é obrigatório' },
        { status: 400 }
      );
    }

    if (!payload.servico || !payload.servico.nome) {
      return NextResponse.json(
        { erro: 'Nome do serviço é obrigatório' },
        { status: 400 }
      );
    }

    if (!payload.profissional || !payload.profissional.nome) {
      return NextResponse.json(
        { erro: 'Nome do profissional é obrigatório' },
        { status: 400 }
      );
    }

    // Formata a mensagem
    const mensagemFormatada = formatarMensagemAutomacao(payload);

    return NextResponse.json({
      sucesso: true,
      mensagem: mensagemFormatada,
      evento: payload.evento,
      telefone_destino: payload.cliente.telefone
    });

  } catch (erro: any) {
    console.error('Erro ao formatar mensagem:', erro);
    return NextResponse.json(
      { erro: erro.message || 'Erro ao formatar mensagem' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/mensagens/formatar?evento=agendamento_criado
 * 
 * Retorna um exemplo de mensagem formatada
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventoParam = searchParams.get('evento') || 'agendamento_criado';

    // Valida o tipo de evento
    const eventosValidos = [
      'agendamento_criado',
      'agendamento_atualizado',
      'agendamento_cancelado',
      'agendamento_lembrete'
    ];

    if (!eventosValidos.includes(eventoParam)) {
      return NextResponse.json(
        { erro: 'Tipo de evento inválido' },
        { status: 400 }
      );
    }

    const evento = eventoParam as 'agendamento_criado' | 'agendamento_atualizado' | 'agendamento_cancelado' | 'agendamento_lembrete';

    // Gera payload de exemplo
    const payloadExemplo = {
      evento,
      timestamp: new Date().toISOString(),
      salao: {
        nome: 'Barbearia do Naldo',
        telefone: '31971932516'
      },
      agendamento: {
        id: 1,
        data: new Date().toISOString().split('T')[0],
        hora_inicio: '15:00',
        hora_fim: '16:00',
        status: 'confirmado'
      },
      cliente: {
        nome: 'Henrique',
        telefone: '31999999999'
      },
      servico: {
        nome: 'Corte Masculino'
      },
      profissional: {
        nome: 'Naldo'
      }
    };

    const mensagemFormatada = formatarMensagemAutomacao(payloadExemplo);

    return NextResponse.json({
      sucesso: true,
      mensagem: mensagemFormatada,
      payload_exemplo: payloadExemplo
    });

  } catch (erro: any) {
    console.error('Erro ao gerar exemplo:', erro);
    return NextResponse.json(
      { erro: erro.message || 'Erro ao gerar exemplo' },
      { status: 500 }
    );
  }
}
