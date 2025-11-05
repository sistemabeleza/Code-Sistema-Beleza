
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Relatório de comissões
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const profissionalId = searchParams.get('profissionalId')
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')

    // Buscar agendamentos concluídos
    const where: any = {
      salao_id: session.user.salao_id,
      status: 'REALIZADO' // Apenas serviços concluídos
    }

    if (profissionalId) {
      where.profissional_id = profissionalId
    }

    if (dataInicio && dataFim) {
      where.data = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim)
      }
    }

    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: {
        profissional: true,
        servico: true,
        cliente: true
      },
      orderBy: {
        data: 'desc'
      }
    })

    // Calcular comissões para cada agendamento
    const comissoes = agendamentos.map(agendamento => {
      const valorServico = Number(agendamento.valor_cobrado || agendamento.servico.preco)
      let valorComissao = 0

      if (agendamento.profissional.commission_type && agendamento.profissional.commission_value) {
        const commissionValue = Number(agendamento.profissional.commission_value)
        
        if (agendamento.profissional.commission_type === 'PERCENTAGE') {
          valorComissao = (valorServico * commissionValue) / 100
        } else if (agendamento.profissional.commission_type === 'FIXED') {
          valorComissao = commissionValue
        }
      }

      return {
        id: agendamento.id,
        data: agendamento.data,
        profissional: {
          id: agendamento.profissional.id,
          nome: agendamento.profissional.nome,
          commission_type: agendamento.profissional.commission_type,
          commission_value: agendamento.profissional.commission_value
        },
        servico: {
          nome: agendamento.servico.nome,
          preco: Number(agendamento.servico.preco)
        },
        cliente: {
          nome: agendamento.cliente.nome
        },
        valor_servico: valorServico,
        valor_comissao: valorComissao
      }
    })

    // Agrupar por profissional
    const comissoesPorProfissional = comissoes.reduce((acc: any, item) => {
      const profId = item.profissional.id
      
      if (!acc[profId]) {
        acc[profId] = {
          profissional: item.profissional,
          total_servicos: 0,
          total_valor_servicos: 0,
          total_comissao: 0,
          servicos: []
        }
      }

      acc[profId].total_servicos++
      acc[profId].total_valor_servicos += item.valor_servico
      acc[profId].total_comissao += item.valor_comissao
      acc[profId].servicos.push(item)

      return acc
    }, {})

    return NextResponse.json({
      comissoes: Object.values(comissoesPorProfissional),
      total_geral: Object.values(comissoesPorProfissional).reduce(
        (sum: number, item: any) => sum + item.total_comissao, 
        0
      )
    })
  } catch (error) {
    console.error('Erro ao buscar comissões:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar comissões' },
      { status: 500 }
    )
  }
}
