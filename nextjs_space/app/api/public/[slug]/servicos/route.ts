
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Busca o salão pelo slug
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

    // Busca todos os serviços ativos do salão
    const servicos = await prisma.servico.findMany({
      where: {
        salao_id: salao.id,
        status: 'ATIVO'
      },
      orderBy: {
        nome: 'asc'
      },
      select: {
        id: true,
        nome: true,
        preco: true,
        duracao_minutos: true
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
