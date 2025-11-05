
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')

    const whereClause: any = {
      OR: [
        {
          agendamento: {
            salao_id: session.user.salao_id,
          },
        },
        {
          venda: {
            salao_id: session.user.salao_id,
          },
        },
      ],
    }

    if (dataInicio && dataFim) {
      whereClause.data_criacao = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim),
      }
    }

    const pagamentos = await prisma.pagamento.findMany({
      where: whereClause,
      include: {
        agendamento: {
          include: {
            cliente: {
              select: {
                nome: true,
              },
            },
            servico: {
              select: {
                nome: true,
              },
            },
          },
        },
        venda: {
          include: {
            cliente: {
              select: {
                nome: true,
              },
            },
          },
        },
        profissional: {
          select: {
            nome: true,
          },
        },
      },
      orderBy: {
        data_criacao: 'desc',
      },
    })

    // Calcular resumo financeiro
    const resumo = {
      total_recebido: 0,
      total_pendente: 0,
      total_cancelado: 0,
      por_forma_pagamento: {
        DINHEIRO: 0,
        PIX: 0,
        DEBITO: 0,
        CREDITO: 0,
        BOLETO: 0,
      },
    }

    pagamentos.forEach(pag => {
      const valor = parseFloat(pag.valor.toString())
      
      if (pag.status === 'PAGO') {
        resumo.total_recebido += valor
        resumo.por_forma_pagamento[pag.forma_pagamento] += valor
      } else if (pag.status === 'PENDENTE') {
        resumo.total_pendente += valor
      } else if (pag.status === 'CANCELADO') {
        resumo.total_cancelado += valor
      }
    })

    // Calcular comissões dos profissionais
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        salao_id: session.user.salao_id,
        status: 'REALIZADO',
        ...(dataInicio && dataFim ? {
          data: {
            gte: new Date(dataInicio),
            lte: new Date(dataFim),
          },
        } : {}),
      },
      include: {
        profissional: {
          select: {
            id: true,
            nome: true,
          },
        },
        servico: {
          select: {
            preco: true,
          },
        },
      },
    })

    return NextResponse.json({
      pagamentos,
      resumo
    })
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados financeiros' }, { status: 500 })
  }
}
