

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

    const { produto_id } = await request.json()

    // Buscar o produto
    const produto = await prisma.produto.findFirst({
      where: {
        id: produto_id,
        salao_id: session.user.salao_id
      }
    })

    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Verificar se há estoque
    if (produto.quantidade_estoque < 1) {
      return NextResponse.json({ error: 'Produto sem estoque' }, { status: 400 })
    }

    // Atualizar estoque
    await prisma.produto.update({
      where: { id: produto_id },
      data: {
        quantidade_estoque: produto.quantidade_estoque - 1
      }
    })

    // Criar movimentação de estoque
    await prisma.movimentacaoEstoque.create({
      data: {
        produto_id: produto_id,
        tipo: 'SAIDA',
        quantidade: 1,
        valor_unitario: produto.preco_venda,
        motivo: 'Venda rápida pelo financeiro'
      }
    })

    // Registrar receita no financeiro
    await prisma.lancamento.create({
      data: {
        salao_id: session.user.salao_id,
        tipo: 'RECEITA',
        categoria: 'PRODUTO',
        descricao: `Venda: ${produto.nome}`,
        valor: produto.preco_venda,
        data_lancamento: new Date(),
        observacoes: 'Venda rápida'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Venda registrada com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao registrar venda:', error)
    return NextResponse.json({ error: 'Erro ao registrar venda' }, { status: 500 })
  }
}
