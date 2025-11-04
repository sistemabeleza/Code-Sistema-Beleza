
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

    const servicos = await prisma.servico.findMany({
      where: {
        salao_id: session.user.salao_id,
        status: 'ATIVO'
      },
      orderBy: {
        nome: 'asc'
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        preco: true,
        duracao_minutos: true,
        categoria: true
      }
    })

    return NextResponse.json(servicos)
  } catch (error) {
    console.error('Erro ao buscar serviços:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar serviços' },
      { status: 500 }
    )
  }
}
