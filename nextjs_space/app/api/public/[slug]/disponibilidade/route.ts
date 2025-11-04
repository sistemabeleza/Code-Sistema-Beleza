
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateAvailableSlots, parseWorkHours, parseBreaks, parseDaysOff } from '@/lib/scheduling'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { searchParams } = new URL(request.url)
    const servicoId = searchParams.get('servico_id')
    const profissionalId = searchParams.get('profissional_id')
    const dateStr = searchParams.get('date') // YYYY-MM-DD

    if (!servicoId || !profissionalId || !dateStr) {
      return NextResponse.json(
        { error: 'servico_id, profissional_id e date são obrigatórios' },
        { status: 400 }
      )
    }

    // Busca o salão
    const salao = await prisma.salao.findUnique({
      where: {
        slug: slug,
        status: 'ATIVO'
      },
      select: {
        id: true,
        timezone: true
      }
    })

    if (!salao) {
      return NextResponse.json(
        { error: 'Salão não encontrado' },
        { status: 404 }
      )
    }

    // Busca o serviço
    const servico = await prisma.servico.findFirst({
      where: {
        id: servicoId,
        salao_id: salao.id,
        status: 'ATIVO'
      },
      select: {
        duracao_minutos: true
      }
    })

    if (!servico) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    // Busca o profissional
    const profissional = await prisma.profissional.findFirst({
      where: {
        id: profissionalId,
        salao_id: salao.id,
        status: 'ATIVO'
      },
      select: {
        work_hours: true,
        breaks: true,
        days_off: true
      }
    })

    if (!profissional) {
      return NextResponse.json(
        { error: 'Profissional não encontrado' },
        { status: 404 }
      )
    }

    // Parse da data
    const date = new Date(dateStr + 'T00:00:00')

    // Busca agendamentos existentes do profissional nesta data
    const startOfDay = new Date(dateStr + 'T00:00:00')
    const endOfDay = new Date(dateStr + 'T23:59:59')

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        profissional_id: profissionalId,
        hora_inicio: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['AGENDADO', 'CONFIRMADO', 'EM_ANDAMENTO']
        }
      },
      select: {
        hora_inicio: true,
        hora_fim: true
      }
    })

    // Converte para formato esperado
    const appointments = agendamentos.map(ag => ({
      start_datetime: ag.hora_inicio,
      end_datetime: ag.hora_fim
    }))

    // Calcula os slots disponíveis
    const workHours = parseWorkHours(profissional.work_hours)
    const breaks = parseBreaks(profissional.breaks)
    const daysOff = parseDaysOff(profissional.days_off)

    const slots = calculateAvailableSlots(
      date,
      servico.duracao_minutos,
      workHours,
      breaks,
      daysOff,
      appointments
    )

    return NextResponse.json({
      date: dateStr,
      servico_id: servicoId,
      profissional_id: profissionalId,
      slots: slots
    })
  } catch (error) {
    console.error('Erro ao calcular disponibilidade:', error)
    return NextResponse.json(
      { error: 'Erro ao calcular disponibilidade' },
      { status: 500 }
    )
  }
}
