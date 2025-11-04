
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
    const periodo = searchParams.get('periodo') || '30' // dias

    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - parseInt(periodo))

    // Agendamentos por status
    const agendamentosPorStatus = await prisma.agendamento.groupBy({
      by: ['status'],
      where: {
        salao_id: session.user.salao_id,
        data: {
          gte: dataInicio,
        },
      },
      _count: true,
    })

    // Faturamento total
    const vendasPeriodo = await prisma.venda.findMany({
      where: {
        salao_id: session.user.salao_id,
        data_venda: {
          gte: dataInicio,
        },
      },
      select: {
        valor_final: true,
        data_venda: true,
      },
    })

    const agendamentosPeriodo = await prisma.agendamento.findMany({
      where: {
        salao_id: session.user.salao_id,
        status: 'REALIZADO',
        data: {
          gte: dataInicio,
        },
      },
      select: {
        valor_cobrado: true,
        servico: {
          select: {
            preco: true,
          },
        },
        data: true,
      },
    })

    const faturamentoPorDia: any = {}

    vendasPeriodo.forEach(v => {
      const dia = v.data_venda.toISOString().split('T')[0]
      if (!faturamentoPorDia[dia]) faturamentoPorDia[dia] = 0
      faturamentoPorDia[dia] += parseFloat(v.valor_final.toString())
    })

    agendamentosPeriodo.forEach(a => {
      const dia = a.data.toISOString().split('T')[0]
      const valor = parseFloat(a.valor_cobrado?.toString() || a.servico.preco.toString())
      if (!faturamentoPorDia[dia]) faturamentoPorDia[dia] = 0
      faturamentoPorDia[dia] += valor
    })

    // Serviços mais vendidos
    const servicosMaisVendidos = await prisma.agendamento.groupBy({
      by: ['servico_id'],
      where: {
        salao_id: session.user.salao_id,
        status: 'REALIZADO',
        data: {
          gte: dataInicio,
        },
      },
      _count: true,
      orderBy: {
        _count: {
          servico_id: 'desc',
        },
      },
      take: 5,
    })

    const servicosDetalhes = await prisma.servico.findMany({
      where: {
        id: {
          in: servicosMaisVendidos.map(s => s.servico_id),
        },
      },
      select: {
        id: true,
        nome: true,
        preco: true,
      },
    })

    const servicosComCount = servicosMaisVendidos.map(s => ({
      ...servicosDetalhes.find(sd => sd.id === s.servico_id),
      total: s._count,
    }))

    // Produtos com estoque baixo
    const produtosEstoqueBaixo = await prisma.produto.findMany({
      where: {
        salao_id: session.user.salao_id,
        status: 'ATIVO',
        quantidade_estoque: {
          lte: prisma.produto.fields.estoque_minimo,
        },
      },
      select: {
        id: true,
        nome: true,
        quantidade_estoque: true,
        estoque_minimo: true,
      },
      orderBy: {
        quantidade_estoque: 'asc',
      },
      take: 10,
    })

    // Clientes mais ativos
    const clientesMaisAtivos = await prisma.agendamento.groupBy({
      by: ['cliente_id'],
      where: {
        salao_id: session.user.salao_id,
        status: 'REALIZADO',
        data: {
          gte: dataInicio,
        },
      },
      _count: true,
      orderBy: {
        _count: {
          cliente_id: 'desc',
        },
      },
      take: 5,
    })

    const clientesDetalhes = await prisma.cliente.findMany({
      where: {
        id: {
          in: clientesMaisAtivos.map(c => c.cliente_id),
        },
      },
      select: {
        id: true,
        nome: true,
        telefone: true,
      },
    })

    const clientesComCount = clientesMaisAtivos.map(c => ({
      ...clientesDetalhes.find(cd => cd.id === c.cliente_id),
      total_agendamentos: c._count,
    }))

    // Resumo geral
    const totalFaturamento = Object.values(faturamentoPorDia).reduce((sum: any, val: any) => sum + val, 0)
    const totalAgendamentos = agendamentosPorStatus.reduce((sum, item) => sum + item._count, 0)
    const totalClientes = await prisma.cliente.count({
      where: { salao_id: session.user.salao_id, status: 'ATIVO' },
    })
    const totalProfissionais = await prisma.profissional.count({
      where: { salao_id: session.user.salao_id, status: 'ATIVO' },
    })

    return NextResponse.json({
      resumo: {
        total_faturamento: totalFaturamento,
        total_agendamentos: totalAgendamentos,
        total_clientes: totalClientes,
        total_profissionais: totalProfissionais,
      },
      agendamentos_por_status: agendamentosPorStatus,
      faturamento_por_dia: Object.entries(faturamentoPorDia).map(([dia, valor]) => ({
        dia,
        valor,
      })).sort((a, b) => a.dia.localeCompare(b.dia)),
      servicos_mais_vendidos: servicosComCount,
      produtos_estoque_baixo: produtosEstoqueBaixo,
      clientes_mais_ativos: clientesComCount,
    })
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados do dashboard' }, { status: 500 })
  }
}
