
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { slug, nome_cliente, telefone_cliente } = await request.json()

    // Validações
    if (!slug || (!nome_cliente && !telefone_cliente)) {
      return NextResponse.json(
        { error: 'Informe o nome ou telefone para buscar seus agendamentos' },
        { status: 400 }
      )
    }

    // Buscar o salão
    const salao = await prisma.salao.findUnique({
      where: { slug }
    })

    if (!salao) {
      return NextResponse.json(
        { error: 'Salão não encontrado' },
        { status: 404 }
      )
    }

    // Buscar cliente(s) com os dados fornecidos
    const whereClause: any = {
      salao_id: salao.id,
      OR: []
    }

    if (nome_cliente) {
      whereClause.OR.push({
        nome: {
          contains: nome_cliente,
          mode: 'insensitive'
        }
      })
    }

    if (telefone_cliente) {
      whereClause.OR.push({
        telefone: {
          contains: telefone_cliente.replace(/\D/g, '') // Remove formatação
        }
      })
    }

    const clientes = await prisma.cliente.findMany({
      where: whereClause
    })

    if (clientes.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum cliente encontrado com esses dados' },
        { status: 404 }
      )
    }

    // Buscar agendamentos ativos desses clientes
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        salao_id: salao.id,
        cliente_id: {
          in: clientes.map(c => c.id)
        },
        status: {
          in: ['AGENDADO', 'CONFIRMADO']
        },
        data: {
          gte: new Date() // Apenas agendamentos futuros
        }
      },
      include: {
        servico: {
          select: {
            nome: true,
            preco: true,
            duracao_minutos: true
          }
        },
        profissional: {
          select: {
            nome: true,
            foto: true
          }
        },
        cliente: {
          select: {
            nome: true,
            telefone: true,
            email: true
          }
        }
      },
      orderBy: {
        data: 'asc'
      }
    })

    if (agendamentos.length === 0) {
      return NextResponse.json(
        { error: 'Você não possui agendamentos ativos' },
        { status: 404 }
      )
    }

    return NextResponse.json(agendamentos, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar agendamentos' },
      { status: 500 }
    )
  }
}
