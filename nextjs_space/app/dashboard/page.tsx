
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { DashboardOverview } from './_components/dashboard-overview'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  const hoje = new Date()
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

  const [
    receitaHoje,
    receitaMes,
    agendamentosHoje,
    totalClientes,
    servicosRealizadosMes,
    agendamentosProximos,
    servicosMaisVendidos,
    profissionaisDesempenho,
    produtosBaixoEstoque
  ] = await Promise.all([
    // Receita de hoje
    prisma.pagamento.aggregate({
      where: {
        status: 'PAGO',
        data_pagamento: {
          gte: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()),
          lt: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1)
        }
      },
      _sum: { valor: true }
    }),

    // Receita do mês
    prisma.pagamento.aggregate({
      where: {
        status: 'PAGO',
        data_pagamento: {
          gte: inicioMes,
          lte: fimMes
        }
      },
      _sum: { valor: true }
    }),

    // Agendamentos de hoje
    prisma.agendamento.count({
      where: {
        data: {
          gte: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()),
          lt: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1)
        },
        status: {
          in: ['AGENDADO', 'CONFIRMADO', 'EM_ANDAMENTO', 'REALIZADO']
        }
      }
    }),

    // Total de clientes
    prisma.cliente.count({
      where: { status: 'ATIVO' }
    }),

    // Serviços realizados no mês
    prisma.agendamento.count({
      where: {
        status: 'REALIZADO',
        data_atualizacao: {
          gte: inicioMes,
          lte: fimMes
        }
      }
    }),

    // Próximos agendamentos
    prisma.agendamento.findMany({
      where: {
        data: {
          gte: hoje,
          lte: new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000) // Próximos 7 dias
        },
        status: {
          in: ['AGENDADO', 'CONFIRMADO']
        }
      },
      include: {
        cliente: true,
        profissional: {
          select: {
            id: true,
            nome: true,
            telefone: true,
            email: true,
            especialidade: true,
            status: true
          }
        },
        servico: {
          select: {
            id: true,
            nome: true,
            descricao: true,
            categoria: true,
            cor_agenda: true,
            status: true,
            duracao_minutos: true,
            preco: true
          }
        }
      },
      orderBy: {
        hora_inicio: 'asc'
      },
      take: 5
    }),

    // Serviços mais vendidos do mês
    prisma.agendamento.groupBy({
      by: ['servico_id'],
      where: {
        status: 'REALIZADO',
        data_atualizacao: {
          gte: inicioMes,
          lte: fimMes
        }
      },
      _count: { servico_id: true },
      _sum: { valor_cobrado: true },
      orderBy: {
        _count: {
          servico_id: 'desc'
        }
      },
      take: 5
    }),

    // Performance dos profissionais
    prisma.agendamento.groupBy({
      by: ['profissional_id'],
      where: {
        status: 'REALIZADO',
        data_atualizacao: {
          gte: inicioMes,
          lte: fimMes
        }
      },
      _count: { profissional_id: true },
      _sum: { valor_cobrado: true },
      orderBy: {
        _sum: {
          valor_cobrado: 'desc'
        }
      },
      take: 5
    }),

    // Produtos com baixo estoque
    prisma.produto.findMany({
      where: {
        status: 'ATIVO',
        quantidade_estoque: {
          lte: prisma.produto.fields.estoque_minimo
        }
      },
      orderBy: {
        quantidade_estoque: 'asc'
      },
      take: 10
    })
  ])

  // Buscar detalhes dos serviços mais vendidos
  const servicosDetalhes = await prisma.servico.findMany({
    where: {
      id: { in: servicosMaisVendidos.map(s => s.servico_id) }
    }
  })

  // Buscar detalhes dos profissionais
  const profissionaisDetalhes = await prisma.profissional.findMany({
    where: {
      id: { in: profissionaisDesempenho.map(p => p.profissional_id) }
    }
  })

  // Serializar dados corretamente (converter Decimals para números)
  const serializedAgendamentos = agendamentosProximos?.map(agendamento => ({
    ...agendamento,
    valor_cobrado: agendamento.valor_cobrado ? Number(agendamento.valor_cobrado) : null,
    desconto: agendamento.desconto ? Number(agendamento.desconto) : null,
    servico: agendamento.servico ? {
      ...agendamento.servico,
      preco: Number(agendamento.servico.preco)
    } : null
  })) || []

  const serializedProdutos = produtosBaixoEstoque?.map(produto => ({
    ...produto,
    preco_custo: Number(produto.preco_custo),
    preco_venda: Number(produto.preco_venda)
  })) || []

  return {
    resumoFinanceiro: {
      receita_hoje: Number(receitaHoje._sum.valor) || 0,
      receita_mes: Number(receitaMes._sum.valor) || 0,
      agendamentos_hoje: agendamentosHoje,
      clientes_total: totalClientes,
      servicos_realizados_mes: servicosRealizadosMes
    },
    agendamentosProximos: serializedAgendamentos,
    servicosMaisVendidos: servicosMaisVendidos.map(s => {
      const servico = servicosDetalhes.find(sd => sd.id === s.servico_id)
      return {
        nome: servico?.nome || 'Serviço não encontrado',
        quantidade: s._count.servico_id,
        receita: Number(s._sum.valor_cobrado) || 0,
        categoria: servico?.categoria || 'N/A'
      }
    }),
    profissionaisDesempenho: profissionaisDesempenho.map(p => {
      const profissional = profissionaisDetalhes.find(pd => pd.id === p.profissional_id)
      return {
        nome: profissional?.nome || 'Profissional não encontrado',
        servicos_realizados: p._count.profissional_id,
        receita_gerada: Number(p._sum.valor_cobrado) || 0,
        comissao_total: Number(p._sum.valor_cobrado) * (Number(profissional?.comissao_percentual) || 0) / 100
      }
    }),
    produtosBaixoEstoque: serializedProdutos
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/login')
  }

  const dashboardData = await getDashboardData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Bem-vindo(a), {session.user?.name}! Acompanhe o resumo do seu salão.
        </p>
      </div>

      <DashboardOverview data={dashboardData} />
    </div>
  )
}
