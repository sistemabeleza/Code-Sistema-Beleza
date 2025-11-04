
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getInstagramUrl, getWhatsAppUrl } from '@/lib/validators'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const salao = await prisma.salao.findUnique({
      where: {
        slug: slug,
        status: 'ATIVO'
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        logo: true,
        foto_1: true,
        foto_2: true,
        instagram_handle: true,
        whatsapp_number: true,
        cor_tema: true,
        telefone: true,
        email: true,
        endereco: true
      }
    })

    if (!salao) {
      return NextResponse.json(
        { error: 'Salão não encontrado' },
        { status: 404 }
      )
    }

    // Gera URLs para redes sociais
    const response = {
      ...salao,
      instagram_url: salao.instagram_handle ? getInstagramUrl(salao.instagram_handle) : null,
      whatsapp_url: salao.whatsapp_number ? getWhatsAppUrl(salao.whatsapp_number) : null
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro ao buscar informações do salão:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar informações do salão' },
      { status: 500 }
    )
  }
}
