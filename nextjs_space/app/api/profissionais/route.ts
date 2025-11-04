import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { DEFAULT_WORK_HOURS, DEFAULT_BREAKS } from '@/lib/scheduling'

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
      },
      include: {
        servicos: {
          include: {
            servico: true
          }
        }
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
        { error: 'E_PROFESSIONAL_NAME_REQUIRED', message: 'Informe o nome do profissional.' },
        { status: 400 }
      )
    }

    // Se não houver work_hours, usa o padrão (Seg-Sáb 08:00-20:00)
    const workHours = data.work_hours || JSON.stringify(DEFAULT_WORK_HOURS)
    const breaks = data.breaks || JSON.stringify(DEFAULT_BREAKS)
    const daysOff = data.days_off || JSON.stringify([])

    // Prepara os dados do profissional
    const profissionalData: any = {
      salao_id: session.user.salao_id,
      nome: data.nome.trim(),
      telefone: data.telefone || '',
      email: data.email || null,
      cpf: data.cpf || null,
      especialidade: data.especialidade || null,
      bio: data.bio || null,
      comissao_percentual: data.comissao_percentual || 0,
      status: data.status || 'ATIVO',
      foto: data.foto || null,
      work_hours: typeof workHours === 'string' ? workHours : JSON.stringify(workHours),
      breaks: typeof breaks === 'string' ? breaks : JSON.stringify(breaks),
      days_off: typeof daysOff === 'string' ? daysOff : JSON.stringify(daysOff),
      data_contratacao: data.data_contratacao ? new Date(data.data_contratacao) : null
    }

    const profissional = await prisma.profissional.create({
      data: profissionalData
    })

    // Se há serviços associados, cria os relacionamentos
    if (data.servicos && Array.isArray(data.servicos) && data.servicos.length > 0) {
      await prisma.profissionalServico.createMany({
        data: data.servicos.map((servicoId: string) => ({
          profissional_id: profissional.id,
          servico_id: servicoId
        }))
      })
    }

    // Busca o profissional criado com os relacionamentos
    const profissionalCompleto = await prisma.profissional.findUnique({
      where: { id: profissional.id },
      include: {
        servicos: {
          include: {
            servico: true
          }
        }
      }
    })

    return NextResponse.json(profissionalCompleto, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar profissional:', error)
    
    // Verifica erros de unicidade
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      let message = 'Já existe um profissional com este '
      if (field === 'email') message += 'e-mail'
      else if (field === 'cpf') message += 'CPF'
      else message = 'Já existe um profissional com estas informações'
      
      return NextResponse.json(
        { error: 'E_DUPLICATE_PROFESSIONAL', message },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'E_CREATE_PROFESSIONAL_FAILED', message: 'Erro ao criar profissional' },
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
        { error: 'E_PROFESSIONAL_NAME_REQUIRED', message: 'Informe o nome do profissional.' },
        { status: 400 }
      )
    }

    // Prepara os dados para atualização
    const updateData: any = {
      nome: data.nome.trim(),
      telefone: data.telefone || '',
      email: data.email || null,
      cpf: data.cpf || null,
      especialidade: data.especialidade || null,
      bio: data.bio || null,
      comissao_percentual: data.comissao_percentual || 0,
      status: data.status,
      foto: data.foto || null,
      data_contratacao: data.data_contratacao ? new Date(data.data_contratacao) : null
    }

    // Atualiza work_hours se fornecido
    if (data.work_hours !== undefined) {
      updateData.work_hours = typeof data.work_hours === 'string' 
        ? data.work_hours 
        : JSON.stringify(data.work_hours)
    }

    // Atualiza breaks se fornecido
    if (data.breaks !== undefined) {
      updateData.breaks = typeof data.breaks === 'string'
        ? data.breaks
        : JSON.stringify(data.breaks)
    }

    // Atualiza days_off se fornecido
    if (data.days_off !== undefined) {
      updateData.days_off = typeof data.days_off === 'string'
        ? data.days_off
        : JSON.stringify(data.days_off)
    }

    const profissional = await prisma.profissional.update({
      where: { id: data.id },
      data: updateData
    })

    // Atualiza os serviços associados se fornecido
    if (data.servicos !== undefined && Array.isArray(data.servicos)) {
      // Remove todos os serviços existentes
      await prisma.profissionalServico.deleteMany({
        where: { profissional_id: data.id }
      })

      // Adiciona os novos serviços
      if (data.servicos.length > 0) {
        await prisma.profissionalServico.createMany({
          data: data.servicos.map((servicoId: string) => ({
            profissional_id: data.id,
            servico_id: servicoId
          }))
        })
      }
    }

    // Busca o profissional atualizado com os relacionamentos
    const profissionalCompleto = await prisma.profissional.findUnique({
      where: { id: data.id },
      include: {
        servicos: {
          include: {
            servico: true
          }
        }
      }
    })

    return NextResponse.json(profissionalCompleto)
  } catch (error: any) {
    console.error('Erro ao atualizar profissional:', error)
    
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      let message = 'Já existe um profissional com este '
      if (field === 'email') message += 'e-mail'
      else if (field === 'cpf') message += 'CPF'
      else message = 'Já existe um profissional com estas informações'
      
      return NextResponse.json(
        { error: 'E_DUPLICATE_PROFESSIONAL', message },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'E_UPDATE_PROFESSIONAL_FAILED', message: 'Erro ao atualizar profissional' },
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