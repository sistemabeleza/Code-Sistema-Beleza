
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

    // Busca todos os clientes do salão que já têm cadastro
    const clientesCadastrados = await prisma.cliente.findMany({
      where: {
        salao_id: session.user.salao_id,
        status: 'ATIVO'
      },
      include: {
        agendamentos: {
          orderBy: {
            data: 'desc'
          },
          take: 1,
          select: {
            data: true,
            hora_inicio: true,
            status: true
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    })

    // Busca todos os agendamentos para estatísticas
    const agendamentosPorCliente = await prisma.agendamento.groupBy({
      by: ['cliente_id'],
      where: {
        salao_id: session.user.salao_id
      },
      _count: {
        id: true
      }
    })

    // Cria um mapa de estatísticas
    const statsMap = new Map(
      agendamentosPorCliente.map(stat => [stat.cliente_id, stat._count.id])
    )

    // Formata os dados dos clientes
    const clientesComStats = clientesCadastrados.map(cliente => ({
      id: cliente.id,
      nome: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email,
      total_agendamentos: statsMap.get(cliente.id) || 0,
      ultimo_agendamento: cliente.agendamentos[0] || null
    }))

    return NextResponse.json(clientesComStats)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar clientes' },
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
    const { nome, telefone, email } = body

    // Validações
    if (!nome || !telefone) {
      return NextResponse.json(
        { error: 'Nome e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Verifica se já existe um cliente com o mesmo telefone neste salão
    const clienteExistente = await prisma.cliente.findFirst({
      where: {
        salao_id: session.user.salao_id,
        telefone: telefone,
        status: 'ATIVO'
      }
    })

    if (clienteExistente) {
      return NextResponse.json(
        { error: 'Já existe um cliente cadastrado com este telefone' },
        { status: 400 }
      )
    }

    // Cria o novo cliente
    const novoCliente = await prisma.cliente.create({
      data: {
        nome,
        telefone,
        email: email || null,
        salao_id: session.user.salao_id,
        status: 'ATIVO'
      },
      select: {
        id: true,
        nome: true,
        telefone: true,
        email: true
      }
    })

    return NextResponse.json(novoCliente, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 }
    )
  }
}
