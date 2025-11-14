
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { enviarLembretesDia } from '@/lib/webhook-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar salão
    const salao = await prisma.salao.findUnique({
      where: { id: session.user.salao_id }
    })

    if (!salao) {
      return NextResponse.json(
        { error: 'Salão não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se a automação está ativa
    if (!salao.automacao_ativa || !salao.webhook_fiqon) {
      return NextResponse.json(
        { error: 'Automação de webhooks não está configurada' },
        { status: 400 }
      )
    }

    // Buscar agendamentos do dia (status AGENDADO)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        salao_id: session.user.salao_id,
        data: {
          gte: hoje,
          lt: amanha
        },
        status: 'AGENDADO'
      },
      include: {
        cliente: true,
        profissional: true,
        servico: true
      },
      orderBy: {
        hora_inicio: 'asc'
      }
    })

    if (agendamentos.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum agendamento encontrado para hoje',
        total: 0
      })
    }

    // Adicionar dados do salão a cada agendamento
    const agendamentosComSalao = agendamentos.map(ag => ({
      ...ag,
      salao
    }))

    // Enviar lembretes
    await enviarLembretesDia(agendamentosComSalao, salao)

    return NextResponse.json({
      success: true,
      message: `Lembretes enviados com sucesso para ${agendamentos.length} cliente(s)`,
      total: agendamentos.length
    })

  } catch (error) {
    console.error('Erro ao enviar lembretes diários:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar lembretes diários' },
      { status: 500 }
    )
  }
}
