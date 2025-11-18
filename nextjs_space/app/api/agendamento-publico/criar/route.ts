
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { enviarWebhookAgendamento } from '@/lib/webhook-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      salao_id,
      nome_cliente,
      telefone_cliente,
      email_cliente,
      profissional_id,
      servico_id,
      data,
      horario,
      observacoes
    } = body

    // Validações
    if (!salao_id || !nome_cliente || !telefone_cliente || !profissional_id || !servico_id || !data || !horario) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Buscar ou criar cliente
    let cliente = await prisma.cliente.findFirst({
      where: {
        salao_id,
        telefone: telefone_cliente
      }
    })

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          salao_id,
          nome: nome_cliente,
          telefone: telefone_cliente,
          email: email_cliente,
          status: 'ATIVO'
        }
      })
    }

    // Buscar serviço para saber duração e preço
    const servico = await prisma.servico.findUnique({
      where: { id: servico_id }
    })

    if (!servico) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    // Calcular horário de início e fim
    const [horas, minutos] = horario.split(':').map(Number)
    const dataAgendamento = new Date(data)
    dataAgendamento.setHours(horas, minutos, 0, 0)

    const dataFim = new Date(dataAgendamento)
    dataFim.setMinutes(dataFim.getMinutes() + servico.duracao_minutos)

    // Verificar se o horário ainda está disponível
    const conflito = await prisma.agendamento.findFirst({
      where: {
        salao_id,
        profissional_id,
        data: {
          gte: new Date(data + 'T00:00:00'),
          lte: new Date(data + 'T23:59:59')
        },
        status: {
          notIn: ['CANCELADO', 'NAO_COMPARECEU']
        },
        OR: [
          {
            hora_inicio: {
              gte: dataAgendamento,
              lt: dataFim
            }
          },
          {
            hora_fim: {
              gt: dataAgendamento,
              lte: dataFim
            }
          },
          {
            AND: [
              { hora_inicio: { lte: dataAgendamento } },
              { hora_fim: { gte: dataFim } }
            ]
          }
        ]
      }
    })

    if (conflito) {
      return NextResponse.json(
        { error: 'E_CONFLICT_APPOINTMENT', message: 'Já existe agendamento neste horário para este profissional.' },
        { status: 409 }
      )
    }

    // Criar agendamento
    const agendamento = await prisma.agendamento.create({
      data: {
        salao_id,
        cliente_id: cliente.id,
        profissional_id,
        servico_id,
        data: dataAgendamento,
        hora_inicio: dataAgendamento,
        hora_fim: dataFim,
        status: 'AGENDADO',
        origem: 'SITE',
        valor_cobrado: servico.preco,
        observacoes
      },
      include: {
        servico: true,
        profissional: true,
        cliente: true,
        salao: true
      }
    })

    // Enviar webhook Fiqon se configurado
    if (agendamento.salao.automacao_ativa && agendamento.salao.webhook_fiqon) {
      try {
        await enviarWebhookAgendamento(
          agendamento,
          agendamento.salao,
          'agendamento_criado'
        )
      } catch (webhookError) {
        console.error('Erro ao enviar webhook de novo agendamento:', webhookError)
        // Não retornar erro, apenas logar
      }
    }

    return NextResponse.json({
      success: true,
      agendamento,
      message: 'Agendamento realizado com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return NextResponse.json(
      { error: 'E_CREATE_APPOINTMENT_FAILED', message: 'Erro ao criar agendamento' },
      { status: 500 }
    )
  }
}
