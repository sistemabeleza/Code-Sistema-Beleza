
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

    console.log('=== LISTANDO AGENDAMENTOS ===')
    console.log('salao_id da sessão:', session.user.salao_id)
    console.log('data filtro:', data)

    let where: any = {
      salao_id: session.user.salao_id
    }

    if (data) {
      const dataInicio = new Date(data)
      dataInicio.setHours(0, 0, 0, 0)
      
      const dataFim = new Date(data)
      dataFim.setHours(23, 59, 59, 999)

      console.log('dataInicio:', dataInicio)
      console.log('dataFim:', dataFim)

      where.data = {
        gte: dataInicio,
        lte: dataFim
      }
    }

    console.log('Where clause:', JSON.stringify(where, null, 2))

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

    console.log('Agendamentos encontrados:', agendamentos.length)
    if (agendamentos.length > 0) {
      console.log('Primeira data de agendamento:', agendamentos[0].data)
    }

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
        servico: true
      }
    })

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
