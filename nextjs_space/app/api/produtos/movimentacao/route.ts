
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()

    // Verificar se o produto pertence ao salão
    const produto = await prisma.produto.findFirst({
      where: {
        id: data.produto_id,
        salao_id: session.user.salao_id,
      },
    })

    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Criar movimentação
    const movimentacao = await prisma.movimentacaoEstoque.create({
      data: {
        produto_id: data.produto_id,
        tipo: data.tipo,
        quantidade: parseInt(data.quantidade),
        valor_unitario: data.valor_unitario ? parseFloat(data.valor_unitario) : null,
        motivo: data.motivo,
        usuario_id: session.user.id,
      },
    })

    // Atualizar estoque do produto
    const novoEstoque = data.tipo === 'ENTRADA' || data.tipo === 'AJUSTE'
      ? produto.quantidade_estoque + parseInt(data.quantidade)
      : produto.quantidade_estoque - parseInt(data.quantidade)

    await prisma.produto.update({
      where: { id: data.produto_id },
      data: { quantidade_estoque: Math.max(0, novoEstoque) },
    })

    return NextResponse.json({ movimentacao })
  } catch (error) {
    console.error('Erro ao criar movimentação:', error)
    return NextResponse.json({ error: 'Erro ao criar movimentação' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const produto_id = searchParams.get('produto_id')

    const movimentacoes = await prisma.movimentacaoEstoque.findMany({
      where: {
        produto_id: produto_id || undefined,
        produto: {
          salao_id: session.user.salao_id,
        },
      },
      include: {
        produto: {
          select: {
            nome: true,
          },
        },
      },
      orderBy: {
        data_movimentacao: 'desc',
      },
      take: 50,
    })

    return NextResponse.json({ movimentacoes })
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error)
    return NextResponse.json({ error: 'Erro ao buscar movimentações' }, { status: 500 })
  }
}
