
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

    const produtos = await prisma.produto.findMany({
      where: {
        salao_id: session.user.salao_id,
      },
      orderBy: {
        nome: 'asc',
      },
    })

    return NextResponse.json({ produtos })
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()

    const produto = await prisma.produto.create({
      data: {
        salao_id: session.user.salao_id,
        nome: data.nome,
        descricao: data.descricao,
        codigo_barras: data.codigo_barras,
        preco_custo: parseFloat(data.preco_custo),
        preco_venda: parseFloat(data.preco_venda),
        quantidade_estoque: parseInt(data.quantidade_estoque) || 0,
        estoque_minimo: parseInt(data.estoque_minimo) || 5,
        categoria: data.categoria,
        marca: data.marca,
        fornecedor: data.fornecedor,
        status: data.status || 'ATIVO',
      },
    })

    // Registrar movimentação de estoque inicial
    if (parseInt(data.quantidade_estoque) > 0) {
      await prisma.movimentacaoEstoque.create({
        data: {
          produto_id: produto.id,
          tipo: 'ENTRADA',
          quantidade: parseInt(data.quantidade_estoque),
          valor_unitario: parseFloat(data.preco_custo),
          motivo: 'Estoque inicial',
        },
      })
    }

    return NextResponse.json({ produto })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()

    if (!data.id) {
      return NextResponse.json({ error: 'ID do produto não informado' }, { status: 400 })
    }

    const produtoExistente = await prisma.produto.findFirst({
      where: {
        id: data.id,
        salao_id: session.user.salao_id,
      },
    })

    if (!produtoExistente) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    const produto = await prisma.produto.update({
      where: { id: data.id },
      data: {
        nome: data.nome,
        descricao: data.descricao,
        codigo_barras: data.codigo_barras,
        preco_custo: parseFloat(data.preco_custo),
        preco_venda: parseFloat(data.preco_venda),
        estoque_minimo: parseInt(data.estoque_minimo),
        categoria: data.categoria,
        marca: data.marca,
        fornecedor: data.fornecedor,
        status: data.status,
      },
    })

    return NextResponse.json({ produto })
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID do produto não informado' }, { status: 400 })
    }

    const produto = await prisma.produto.findFirst({
      where: {
        id,
        salao_id: session.user.salao_id,
      },
    })

    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    await prisma.produto.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Produto excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    return NextResponse.json({ error: 'Erro ao excluir produto' }, { status: 500 })
  }
}
