
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

    const lancamentos = await prisma.lancamento.findMany({
      where: {
        salao_id: session.user.salao_id,
      },
      orderBy: {
        data_lancamento: 'desc',
      },
    })

    return NextResponse.json({ lancamentos })
  } catch (error) {
    console.error('Erro ao buscar lançamentos:', error)
    return NextResponse.json({ error: 'Erro ao buscar lançamentos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()

    const lancamento = await prisma.lancamento.create({
      data: {
        salao_id: session.user.salao_id,
        tipo: data.tipo,
        categoria: data.categoria,
        descricao: data.descricao,
        valor: parseFloat(data.valor),
        data_lancamento: new Date(data.data_lancamento),
        observacoes: data.observacoes || null,
      },
    })

    return NextResponse.json({ lancamento })
  } catch (error) {
    console.error('Erro ao criar lançamento:', error)
    return NextResponse.json({ error: 'Erro ao criar lançamento' }, { status: 500 })
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
      return NextResponse.json({ error: 'ID não informado' }, { status: 400 })
    }

    const lancamento = await prisma.lancamento.findFirst({
      where: {
        id,
        salao_id: session.user.salao_id,
      },
    })

    if (!lancamento) {
      return NextResponse.json({ error: 'Lançamento não encontrado' }, { status: 404 })
    }

    await prisma.lancamento.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Lançamento excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir lançamento:', error)
    return NextResponse.json({ error: 'Erro ao excluir lançamento' }, { status: 500 })
  }
}
