
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

    const relatorios = await prisma.relatorioFinanceiro.findMany({
      where: {
        salao_id: session.user.salao_id,
      },
      orderBy: {
        data_criacao: 'desc',
      },
    })

    return NextResponse.json({ relatorios })
  } catch (error) {
    console.error('Erro ao buscar relatórios:', error)
    return NextResponse.json({ error: 'Erro ao buscar relatórios' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const { tipo_periodo } = data

    // Calcular período
    const hoje = new Date()
    let data_inicio: Date
    let data_fim: Date

    if (tipo_periodo === 'SEMANAL') {
      // Última semana (7 dias)
      data_inicio = new Date(hoje)
      data_inicio.setDate(hoje.getDate() - 7)
      data_fim = hoje
    } else {
      // Último mês (30 dias)
      data_inicio = new Date(hoje)
      data_inicio.setDate(hoje.getDate() - 30)
      data_fim = hoje
    }

    // Buscar lançamentos do período
    const lancamentos = await prisma.lancamento.findMany({
      where: {
        salao_id: session.user.salao_id,
        data_lancamento: {
          gte: data_inicio,
          lte: data_fim,
        },
      },
    })

    // Calcular totais
    const receitas = lancamentos
      .filter(l => l.tipo === 'RECEITA')
      .reduce((acc, l) => acc + Number(l.valor), 0)

    const despesas = lancamentos
      .filter(l => l.tipo === 'DESPESA')
      .reduce((acc, l) => acc + Number(l.valor), 0)

    const saldo = receitas - despesas

    // Criar relatório
    const relatorio = await prisma.relatorioFinanceiro.create({
      data: {
        salao_id: session.user.salao_id,
        tipo_periodo,
        data_inicio,
        data_fim,
        total_receitas: receitas,
        total_despesas: despesas,
        saldo,
        dados_json: JSON.stringify({
          lancamentos: lancamentos.length,
          categorias: lancamentos.reduce((acc: any, l) => {
            acc[l.categoria] = (acc[l.categoria] || 0) + Number(l.valor)
            return acc
          }, {}),
        }),
      },
    })

    return NextResponse.json({ relatorio })
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json({ error: 'Erro ao gerar relatório' }, { status: 500 })
  }
}
