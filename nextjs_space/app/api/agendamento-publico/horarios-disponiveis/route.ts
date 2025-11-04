
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { 
  calculateAvailableSlots, 
  parseWorkHours, 
  parseBreaks, 
  parseDaysOff,
  DEFAULT_WORK_HOURS,
  DEFAULT_BREAKS
} from '@/lib/scheduling'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const salao_id = searchParams.get('salao_id')
    const profissional_id = searchParams.get('profissional_id')
    const servico_id = searchParams.get('servico_id')
    const data = searchParams.get('data')

    if (!salao_id || !profissional_id || !servico_id || !data) {
      return NextResponse.json(
        { error: 'E_MISSING_PARAMS', message: 'Parâmetros obrigatórios: salao_id, profissional_id, servico_id, data' },
        { status: 400 }
      )
    }

    // Buscar profissional e serviço
    const [profissional, servico] = await Promise.all([
      prisma.profissional.findUnique({
        where: { id: profissional_id }
      }),
      prisma.servico.findUnique({
        where: { id: servico_id }
      })
    ])

    if (!profissional) {
      return NextResponse.json(
        { error: 'E_PROFESSIONAL_NOT_FOUND', message: 'Profissional não encontrado' },
        { status: 404 }
      )
    }

    if (!servico) {
      return NextResponse.json(
        { error: 'E_SERVICE_NOT_FOUND', message: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    // Parse dos horários do profissional ou usa padrão
    let workHours = parseWorkHours(profissional.work_hours)
    if (!workHours) {
      workHours = DEFAULT_WORK_HOURS
    }

    const breaks = parseBreaks(profissional.breaks) || []
    const daysOff = parseDaysOff(profissional.days_off) || []

    // Buscar agendamentos do dia
    const targetDate = new Date(data)
    const dataInicio = new Date(targetDate)
    dataInicio.setHours(0, 0, 0, 0)
    
    const dataFim = new Date(targetDate)
    dataFim.setHours(23, 59, 59, 999)

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        salao_id,
        profissional_id,
        data: {
          gte: dataInicio,
          lte: dataFim
        },
        status: {
          notIn: ['CANCELADO', 'NAO_COMPARECEU']
        }
      },
      select: {
        hora_inicio: true,
        hora_fim: true
      }
    })

    // Converter agendamentos para o formato esperado pela função de cálculo
    const appointments = agendamentos.map(ag => ({
      start_datetime: new Date(ag.hora_inicio),
      end_datetime: new Date(ag.hora_fim)
    }))

    // Calcular slots disponíveis usando a biblioteca de scheduling
    const horarios = calculateAvailableSlots(
      targetDate,
      servico.duracao_minutos,
      workHours,
      breaks,
      daysOff,
      appointments
    )

    return NextResponse.json({ horarios })
  } catch (error) {
    console.error('Erro ao buscar horários:', error)
    return NextResponse.json(
      { error: 'E_FETCH_AVAILABILITY_FAILED', message: 'Erro ao buscar horários disponíveis' },
      { status: 500 }
    )
  }
}
