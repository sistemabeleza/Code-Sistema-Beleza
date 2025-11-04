
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const salao_id = searchParams.get('salao_id')
    const profissional_id = searchParams.get('profissional_id')
    const servico_id = searchParams.get('servico_id')
    const data = searchParams.get('data')

    if (!salao_id || !profissional_id || !servico_id || !data) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: salao_id, profissional_id, servico_id, data' },
        { status: 400 }
      )
    }

    // Buscar serviço para saber a duração
    const servico = await prisma.servico.findUnique({
      where: { id: servico_id }
    })

    if (!servico) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    const duracaoMinutos = servico.duracao_minutos

    // Buscar agendamentos do dia
    const dataInicio = new Date(data)
    dataInicio.setHours(0, 0, 0, 0)
    
    const dataFim = new Date(data)
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

    // Gerar horários disponíveis (8h às 18h, intervalo de 30 minutos)
    const horarios: string[] = []
    const inicio = 8 * 60 // 8h em minutos
    const fim = 18 * 60 // 18h em minutos

    for (let minutos = inicio; minutos < fim; minutos += 30) {
      const horas = Math.floor(minutos / 60)
      const mins = minutos % 60
      const horario = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
      
      // Verificar se o horário está disponível
      const horarioInicio = new Date(data)
      horarioInicio.setHours(horas, mins, 0, 0)

      const horarioFim = new Date(horarioInicio)
      horarioFim.setMinutes(horarioFim.getMinutes() + duracaoMinutos)

      // Verificar conflitos
      const temConflito = agendamentos.some(ag => {
        const agInicio = new Date(ag.hora_inicio)
        const agFim = new Date(ag.hora_fim)
        
        return (
          (horarioInicio >= agInicio && horarioInicio < agFim) ||
          (horarioFim > agInicio && horarioFim <= agFim) ||
          (horarioInicio <= agInicio && horarioFim >= agFim)
        )
      })

      if (!temConflito) {
        horarios.push(horario)
      }
    }

    return NextResponse.json({ horarios })
  } catch (error) {
    console.error('Erro ao buscar horários:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar horários disponíveis' },
      { status: 500 }
    )
  }
}
