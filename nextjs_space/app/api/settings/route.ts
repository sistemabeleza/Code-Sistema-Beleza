
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { validateCPF, validateCNPJ, validateAndNormalizeWhatsApp } from '@/lib/validators'

// GET - Buscar configurações do salão
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
      },
      select: {
        id: true,
        nome: true,
        document_type: true,
        document: true,
        telefone: true,
        email: true,
        endereco: true,
        horario_funcionamento: true,
        logo: true,
        foto_1: true,
        foto_2: true,
        slug: true,
        descricao: true,
        cor_tema: true,
        instagram_handle: true,
        whatsapp_number: true,
        timezone: true,
        status: true,
        plano: true
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

// PUT - Atualizar configurações do salão
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

    // Validação de documento (CPF ou CNPJ)
    if (data.document_type && data.document) {
      const cleanDocument = data.document.replace(/\D/g, '')
      
      if (data.document_type === 'CPF') {
        if (!validateCPF(cleanDocument)) {
          return NextResponse.json(
            { error: 'CPF inválido' },
            { status: 400 }
          )
        }
      } else if (data.document_type === 'CNPJ') {
        if (!validateCNPJ(cleanDocument)) {
          return NextResponse.json(
            { error: 'CNPJ inválido' },
            { status: 400 }
          )
        }
      }
      
      data.document = cleanDocument
    }

    // Validação de WhatsApp
    if (data.whatsapp_number) {
      const whatsappValidation = validateAndNormalizeWhatsApp(data.whatsapp_number)
      if (!whatsappValidation.valid) {
        return NextResponse.json(
          { error: whatsappValidation.error },
          { status: 400 }
        )
      }
      data.whatsapp_number = whatsappValidation.normalized
    }

    // Validação de slug (único)
    if (data.slug) {
      // Remove caracteres especiais e espaços
      const cleanSlug = data.slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      
      // Verifica se o slug já existe (em outro salão)
      const existingSlug = await prisma.salao.findFirst({
        where: {
          slug: cleanSlug,
          id: {
            not: session.user.salao_id
          }
        }
      })

      if (existingSlug) {
        return NextResponse.json(
          { error: 'Este slug já está em uso por outro salão' },
          { status: 409 }
        )
      }

      data.slug = cleanSlug
    }

    // Normaliza Instagram handle (remove @)
    if (data.instagram_handle) {
      data.instagram_handle = data.instagram_handle.replace(/^@/, '')
    }

    // Prepara os dados para atualização
    const updateData: any = {}
    
    const allowedFields = [
      'nome', 'document_type', 'document', 'telefone', 'email', 'endereco',
      'horario_funcionamento', 'logo', 'foto_1', 'foto_2', 'slug', 'descricao',
      'cor_tema', 'instagram_handle', 'whatsapp_number', 'timezone'
    ]

    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    })

    const salao = await prisma.salao.update({
      where: {
        id: session.user.salao_id
      },
      data: updateData
    })

    return NextResponse.json(salao)
  } catch (error: any) {
    console.error('Erro ao atualizar configurações:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Slug já está em uso' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    )
  }
}
