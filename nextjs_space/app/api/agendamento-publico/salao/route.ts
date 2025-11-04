
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug é obrigatório' },
        { status: 400 }
      )
    }

    const salao = await prisma.salao.findUnique({
      where: { slug },
      include: {
        servicos: {
          where: { status: 'ATIVO' },
          orderBy: { nome: 'asc' }
        },
        profissionais: {
          where: { status: 'ATIVO' },
          orderBy: { nome: 'asc' }
        }
      }
    })

    if (!salao) {
      return NextResponse.json(
        { error: 'Salão não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(salao)
  } catch (error) {
    console.error('Erro ao buscar salão:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados do salão' },
      { status: 500 }
    )
  }
}
