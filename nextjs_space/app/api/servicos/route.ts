
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Listar todos os serviços
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

    const servicos = await prisma.servico.findMany({
      where: {
        salao_id: session.user.salao_id,
        ...(includeInactive ? {} : { status: 'ATIVO' })
      },
      orderBy: {
        nome: 'asc'
      },
      include: {
        profissionais: {
          include: {
            profissional: true
          }
        }
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

// POST - Criar novo serviço
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

    // Validação do nome
    if (!data.nome || data.nome.trim() === '') {
      return NextResponse.json(
        { error: 'E_SERVICE_NAME_REQUIRED', message: 'Informe o nome do serviço.' },
        { status: 400 }
      )
    }

    // Validação do preço
    if (data.preco === undefined || data.preco === null || data.preco < 0) {
      return NextResponse.json(
        { error: 'E_SERVICE_PRICE_REQUIRED', message: 'Informe o preço do serviço.' },
        { status: 400 }
      )
    }

    // Validação da duração
    if (!data.duracao_minutos) {
      return NextResponse.json(
        { error: 'E_SERVICE_DURATION_REQUIRED', message: 'Informe a duração do serviço em minutos.' },
        { status: 400 }
      )
    }

    // Valida duração (entre 5 e 480 minutos)
    if (data.duracao_minutos < 5 || data.duracao_minutos > 480) {
      return NextResponse.json(
        { error: 'E_SERVICE_DURATION_INVALID', message: 'Duração deve estar entre 5 e 480 minutos.' },
        { status: 400 }
      )
    }

    const servico = await prisma.servico.create({
      data: {
        salao_id: session.user.salao_id,
        nome: data.nome.trim(),
        descricao: data.descricao?.trim() || null,
        preco: data.preco,
        duracao_minutos: parseInt(data.duracao_minutos),
        categoria: data.categoria?.trim() || null,
        cor_agenda: data.cor_agenda || null,
        status: data.status || 'ATIVO'
      }
    })

    // Se há profissionais associados, cria os relacionamentos
    if (data.profissionais && Array.isArray(data.profissionais) && data.profissionais.length > 0) {
      await prisma.profissionalServico.createMany({
        data: data.profissionais.map((profissionalId: string) => ({
          profissional_id: profissionalId,
          servico_id: servico.id
        }))
      })
    }

    // Busca o serviço criado com os relacionamentos
    const servicoCompleto = await prisma.servico.findUnique({
      where: { id: servico.id },
      include: {
        profissionais: {
          include: {
            profissional: true
          }
        }
      }
    })

    return NextResponse.json(servicoCompleto, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar serviço:', error)
    return NextResponse.json(
      { error: 'E_CREATE_SERVICE_FAILED', message: 'Erro ao criar serviço' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar serviço
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
        { error: 'ID do serviço é obrigatório' },
        { status: 400 }
      )
    }

    // Verifica se o serviço pertence ao salão
    const servicoExistente = await prisma.servico.findFirst({
      where: {
        id: data.id,
        salao_id: session.user.salao_id
      }
    })

    if (!servicoExistente) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    // Validações
    if (!data.nome || data.nome.trim() === '') {
      return NextResponse.json(
        { error: 'E_SERVICE_NAME_REQUIRED', message: 'Informe o nome do serviço.' },
        { status: 400 }
      )
    }

    if (data.duracao_minutos && (data.duracao_minutos < 5 || data.duracao_minutos > 480)) {
      return NextResponse.json(
        { error: 'E_SERVICE_DURATION_INVALID', message: 'Duração deve estar entre 5 e 480 minutos.' },
        { status: 400 }
      )
    }

    const servico = await prisma.servico.update({
      where: { id: data.id },
      data: {
        nome: data.nome.trim(),
        descricao: data.descricao?.trim() || null,
        preco: data.preco,
        duracao_minutos: parseInt(data.duracao_minutos),
        categoria: data.categoria?.trim() || null,
        cor_agenda: data.cor_agenda || null,
        status: data.status
      }
    })

    // Atualiza os profissionais associados se fornecido
    if (data.profissionais !== undefined && Array.isArray(data.profissionais)) {
      // Remove todos os profissionais existentes
      await prisma.profissionalServico.deleteMany({
        where: { servico_id: data.id }
      })

      // Adiciona os novos profissionais
      if (data.profissionais.length > 0) {
        await prisma.profissionalServico.createMany({
          data: data.profissionais.map((profissionalId: string) => ({
            profissional_id: profissionalId,
            servico_id: data.id
          }))
        })
      }
    }

    // Busca o serviço atualizado com os relacionamentos
    const servicoCompleto = await prisma.servico.findUnique({
      where: { id: data.id },
      include: {
        profissionais: {
          include: {
            profissional: true
          }
        }
      }
    })

    return NextResponse.json(servicoCompleto)
  } catch (error: any) {
    console.error('Erro ao atualizar serviço:', error)
    return NextResponse.json(
      { error: 'E_UPDATE_SERVICE_FAILED', message: 'Erro ao atualizar serviço' },
      { status: 500 }
    )
  }
}

// DELETE - Desativar serviço (soft delete)
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
        { error: 'ID do serviço é obrigatório' },
        { status: 400 }
      )
    }

    // Verifica se o serviço pertence ao salão
    const servico = await prisma.servico.findFirst({
      where: {
        id,
        salao_id: session.user.salao_id
      }
    })

    if (!servico) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    // Soft delete - apenas desativa
    await prisma.servico.update({
      where: { id },
      data: { status: 'INATIVO' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao desativar serviço:', error)
    return NextResponse.json(
      { error: 'Erro ao desativar serviço' },
      { status: 500 }
    )
  }
}
