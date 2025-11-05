import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { DEFAULT_WORK_HOURS } from '@/lib/scheduling'

// GET - Listar todos os profissionais
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const profissionais = await prisma.profissional.findMany({
      where: {
        salao_id: session.user.salao_id,
        ...(includeInactive ? {} : { status: 'ATIVO' })
      },
      orderBy: {
        nome: 'asc'
      }
    })

    return NextResponse.json(profissionais)
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar profissionais' },
      { status: 500 }
    )
  }
}

// POST - Criar novo profissional
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Validação básica - apenas nome é obrigatório
    if (!data.nome || data.nome.trim() === '') {
      return NextResponse.json(
        { error: 'Informe o nome do profissional' },
        { status: 400 }
      )
    }

    // Se não houver work_hours, usa o padrão (Seg-Sáb 08:00-20:00)
    const workHours = data.work_hours || JSON.stringify(DEFAULT_WORK_HOURS)

    const profissional = await prisma.profissional.create({
      data: {
        salao_id: session.user.salao_id,
        nome: data.nome.trim(),
        telefone: data.telefone || null,
        foto: data.foto || null,
        status: 'ATIVO',
        work_hours: typeof workHours === 'string' ? workHours : JSON.stringify(workHours)
      }
    })

    return NextResponse.json(profissional, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar profissional:', error)
    return NextResponse.json(
      { error: 'Erro ao criar profissional' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar profissional
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

    if (!data.id) {
      return NextResponse.json(
        { error: 'ID do profissional é obrigatório' },
        { status: 400 }
      )
    }

    // Verifica se o profissional pertence ao salão
    const profissionalExistente = await prisma.profissional.findFirst({
      where: {
        id: data.id,
        salao_id: session.user.salao_id
      }
    })

    if (!profissionalExistente) {
      return NextResponse.json(
        { error: 'Profissional não encontrado' },
        { status: 404 }
      )
    }

    // Validação básica
    if (!data.nome || data.nome.trim() === '') {
      return NextResponse.json(
        { error: 'Informe o nome do profissional' },
        { status: 400 }
      )
    }

    const profissional = await prisma.profissional.update({
      where: { id: data.id },
      data: {
        nome: data.nome.trim(),
        telefone: data.telefone || null,
        foto: data.foto || null,
        status: data.status || 'ATIVO'
      }
    })

    return NextResponse.json(profissional)
  } catch (error: any) {
    console.error('Erro ao atualizar profissional:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar profissional' },
      { status: 500 }
    )
  }
}

// DELETE - Desativar profissional (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID do profissional é obrigatório' },
        { status: 400 }
      )
    }

    // Verifica se o profissional pertence ao salão
    const profissional = await prisma.profissional.findFirst({
      where: {
        id,
        salao_id: session.user.salao_id
      }
    })

    if (!profissional) {
      return NextResponse.json(
        { error: 'Profissional não encontrado' },
        { status: 404 }
      )
    }

    // Soft delete - apenas desativa
    await prisma.profissional.update({
      where: { id },
      data: { status: 'INATIVO' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao desativar profissional:', error)
    return NextResponse.json(
      { error: 'Erro ao desativar profissional' },
      { status: 500 }
    )
  }
}