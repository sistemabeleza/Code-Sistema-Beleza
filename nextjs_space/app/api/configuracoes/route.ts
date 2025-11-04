
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

    const salao = await prisma.salao.findUnique({
      where: {
        id: session.user.salao_id
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
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Validar slug único se fornecido
    if (data.slug) {
      const existente = await prisma.salao.findFirst({
        where: {
          slug: data.slug,
          id: { not: session.user.salao_id }
        }
      })

      if (existente) {
        return NextResponse.json(
          { error: 'Este link personalizado já está em uso' },
          { status: 400 }
        )
      }
    }

    const salao = await prisma.salao.update({
      where: {
        id: session.user.salao_id
      },
      data: {
        nome: data.nome,
        cnpj: data.cnpj,
        telefone: data.telefone,
        email: data.email,
        endereco: data.endereco,
        horario_funcionamento: data.horario_funcionamento,
        descricao: data.descricao,
        logo: data.logo,
        foto_1: data.foto_1,
        foto_2: data.foto_2,
        slug: data.slug,
        cor_tema: data.cor_tema
      }
    })

    return NextResponse.json({
      success: true,
      salao,
      message: 'Configurações atualizadas com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    )
  }
}
