
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const data = await request.json()

    // Validações
    if (!data.servico_id || !data.profissional_id || !data.start_datetime || !data.customer_name || !data.customer_phone) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      )
    }

    // Busca o salão
    const salao = await prisma.salao.findUnique({
      where: {
        slug: slug,
        status: 'ATIVO'
      },
      select: {
        id: true
      }
    })

    if (!salao) {
      return NextResponse.json(
        { error: 'Salão não encontrado' },
        { status: 404 }
      )
    }

    // Busca o serviço
    const servico = await prisma.servico.findFirst({
      where: {
        id: data.servico_id,
        salao_id: salao.id,
        status: 'ATIVO'
      }
    })

    if (!servico) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    // Busca o profissional
    const profissional = await prisma.profissional.findFirst({
      where: {
        id: data.profissional_id,
        salao_id: salao.id,
        status: 'ATIVO'
      }
    })

    if (!profissional) {
      return NextResponse.json(
        { error: 'Profissional não encontrado' },
        { status: 404 }
      )
    }

    // Calcula hora de término baseado na duração do serviço
    const startDatetime = new Date(data.start_datetime)
    const endDatetime = new Date(startDatetime.getTime() + servico.duracao_minutos * 60000)

    // Verifica conflitos de horário
    const conflito = await prisma.agendamento.findFirst({
      where: {
        profissional_id: data.profissional_id,
        status: {
          in: ['AGENDADO', 'CONFIRMADO', 'EM_ANDAMENTO']
        },
        OR: [
          {
            AND: [
              { hora_inicio: { lte: startDatetime } },
              { hora_fim: { gt: startDatetime } }
            ]
          },
          {
            AND: [
              { hora_inicio: { lt: endDatetime } },
              { hora_fim: { gte: endDatetime } }
            ]
          },
          {
            AND: [
              { hora_inicio: { gte: startDatetime } },
              { hora_fim: { lte: endDatetime } }
            ]
          }
        ]
      }
    })

    if (conflito) {
      return NextResponse.json(
        { error: 'Este horário já está ocupado' },
        { status: 409 }
      )
    }

    // Busca ou cria o cliente
    let cliente = await prisma.cliente.findFirst({
      where: {
        salao_id: salao.id,
        telefone: data.customer_phone
      }
    })

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          salao_id: salao.id,
          nome: data.customer_name,
          telefone: data.customer_phone,
          email: data.customer_email || null
        }
      })
    }

    // Cria o agendamento
    const agendamento = await prisma.agendamento.create({
      data: {
        salao_id: salao.id,
        cliente_id: cliente.id,
        profissional_id: data.profissional_id,
        servico_id: data.servico_id,
        data: startDatetime,
        hora_inicio: startDatetime,
        hora_fim: endDatetime,
        status: 'AGENDADO',
        origem: 'SITE',
        valor_cobrado: servico.preco
      },
      include: {
        servico: true,
        profissional: true,
        cliente: true
      }
    })

    return NextResponse.json(agendamento, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro ao criar agendamento' },
      { status: 500 }
    )
  }
}
