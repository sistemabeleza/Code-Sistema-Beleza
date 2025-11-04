
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
      salao_id: session.user.salao_id,
    }

    if (dataInicio && dataFim) {
      whereClause.data_venda = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim),
      }
    }

    const vendas = await prisma.venda.findMany({
      where: whereClause,
      include: {
        cliente: {
          select: {
            nome: true,
            telefone: true,
          },
        },
        itens: {
          include: {
            produto: {
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
        pagamento: true,
      },
      orderBy: {
        data_venda: 'desc',
      },
    })

    return NextResponse.json({ vendas })
  } catch (error) {
    console.error('Erro ao buscar vendas:', error)
    return NextResponse.json({ error: 'Erro ao buscar vendas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()

    // Gerar número da venda
    const ultimaVenda = await prisma.venda.findFirst({
      where: { salao_id: session.user.salao_id },
      orderBy: { data_venda: 'desc' },
    })

    const numeroVenda = ultimaVenda 
      ? `V${(parseInt(ultimaVenda.numero_venda.substring(1)) + 1).toString().padStart(6, '0')}`
      : 'V000001'

    // Calcular totais
    const valor_total = data.itens.reduce((sum: number, item: any) => 
      sum + (parseFloat(item.valor_unitario) * parseInt(item.quantidade)), 0
    )
    const desconto = parseFloat(data.desconto) || 0
    const valor_final = valor_total - desconto

    // Criar venda com itens
    const venda = await prisma.venda.create({
      data: {
        salao_id: session.user.salao_id,
        cliente_id: data.cliente_id || null,
        numero_venda: numeroVenda,
        valor_total: valor_total,
        desconto: desconto,
        valor_final: valor_final,
        observacoes: data.observacoes,
        itens: {
          create: data.itens.map((item: any) => ({
            produto_id: item.produto_id || null,
            servico_id: item.servico_id || null,
            quantidade: parseInt(item.quantidade),
            valor_unitario: parseFloat(item.valor_unitario),
            desconto: parseFloat(item.desconto) || 0,
            valor_total: parseFloat(item.valor_unitario) * parseInt(item.quantidade) - (parseFloat(item.desconto) || 0),
          })),
        },
        pagamento: data.pagamento ? {
          create: {
            valor: valor_final,
            forma_pagamento: data.pagamento.forma_pagamento,
            status: data.pagamento.status || 'PAGO',
            data_pagamento: new Date(),
            parcelas: parseInt(data.pagamento.parcelas) || 1,
            parcela_atual: 1,
          },
        } : undefined,
      },
      include: {
        itens: true,
        pagamento: true,
      },
    })

    // Atualizar estoque para produtos vendidos
    for (const item of data.itens) {
      if (item.produto_id) {
        const produto = await prisma.produto.findUnique({
          where: { id: item.produto_id },
        })

        if (produto) {
          await prisma.produto.update({
            where: { id: item.produto_id },
            data: {
              quantidade_estoque: Math.max(0, produto.quantidade_estoque - parseInt(item.quantidade)),
            },
          })

          // Registrar movimentação de estoque
          await prisma.movimentacaoEstoque.create({
            data: {
              produto_id: item.produto_id,
              tipo: 'SAIDA',
              quantidade: parseInt(item.quantidade),
              valor_unitario: parseFloat(item.valor_unitario),
              motivo: `Venda ${numeroVenda}`,
              usuario_id: session.user.id,
            },
          })
        }
      }
    }

    return NextResponse.json({ venda })
  } catch (error) {
    console.error('Erro ao criar venda:', error)
    return NextResponse.json({ error: 'Erro ao criar venda' }, { status: 500 })
  }
}
