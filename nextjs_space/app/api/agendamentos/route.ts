
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { enviarWebhookAgendamento } from '@/lib/webhook-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const data = searchParams.get('data')

    let where: any = {
      salao_id: session.user.salao_id
    }

    if (data) {
      const dataInicio = new Date(data)
      dataInicio.setHours(0, 0, 0, 0)
      
      const dataFim = new Date(data)
      dataFim.setHours(23, 59, 59, 999)

      where.data = {
        gte: dataInicio,
        lte: dataFim
      }
    }

    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: {
        cliente: true,
        profissional: true,
        servico: true
      },
      orderBy: {
        hora_inicio: 'asc'
      }
    })

    return NextResponse.json(agendamentos)
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar agendamentos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      cliente_id,
      profissional_id,
      servico_id,
      data,
      hora_inicio,
      observacoes
    } = body

    // Buscar serviço para calcular hora_fim
    const servico = await prisma.servico.findUnique({
      where: { id: servico_id }
    })

    if (!servico) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    const dataHoraInicio = new Date(`${data}T${hora_inicio}:00`)
    const dataHoraFim = new Date(dataHoraInicio)
    dataHoraFim.setMinutes(dataHoraFim.getMinutes() + servico.duracao_minutos)

    const agendamento = await prisma.agendamento.create({
      data: {
        salao_id: session.user.salao_id,
        cliente_id,
        profissional_id,
        servico_id,
        data: new Date(data),
        hora_inicio: dataHoraInicio,
        hora_fim: dataHoraFim,
        status: 'AGENDADO',
        origem: 'MANUAL',
        valor_cobrado: servico.preco,
        observacoes
      },
      include: {
        cliente: true,
        profissional: true,
        servico: true,
        salao: true // Incluir dados do salão para webhook
      }
    })

    // Enviar webhook Fiqon (se configurado)
    // Não aguarda conclusão para não atrasar a resposta ao usuário
    if (agendamento.salao) {
      enviarWebhookAgendamento(agendamento, agendamento.salao, 'agendamento_criado').catch(err => {
        console.error('[API] Erro ao enviar webhook (ignorado):', err)
      })
    }

    return NextResponse.json({
      success: true,
      agendamento,
      message: 'Agendamento criado com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro ao criar agendamento' },
      { status: 500 }
    )
  }
}
