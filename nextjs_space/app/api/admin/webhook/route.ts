
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Buscar configuração de webhook de um salão
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const salaoId = searchParams.get('salaoId')

    if (!salaoId) {
      return NextResponse.json(
        { error: 'salaoId é obrigatório' },
        { status: 400 }
      )
    }

    const salao = await prisma.salao.findUnique({
      where: { id: salaoId },
      select: {
        automacao_ativa: true,
        webhook_url: true
      }
    })

    if (!salao) {
      return NextResponse.json(
        { error: 'Salão não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(salao)
  } catch (error: any) {
    console.error('Erro ao buscar configuração de webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configuração' },
      { status: 500 }
    )
  }
}

// POST - Salvar configuração de webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { salaoId, automacao_ativa, webhook_url } = body

    if (!salaoId) {
      return NextResponse.json(
        { error: 'salaoId é obrigatório' },
        { status: 400 }
      )
    }

    // Validar URL se automação estiver ativa
    if (automacao_ativa && !webhook_url) {
      return NextResponse.json(
        { error: 'webhook_url é obrigatório quando automação está ativa' },
        { status: 400 }
      )
    }

    // Validar formato da URL
    if (webhook_url && webhook_url.trim()) {
      try {
        new URL(webhook_url)
      } catch {
        return NextResponse.json(
          { error: 'URL inválida' },
          { status: 400 }
        )
      }
    }

    const salaoAtualizado = await prisma.salao.update({
      where: { id: salaoId },
      data: {
        automacao_ativa: Boolean(automacao_ativa),
        webhook_url: webhook_url || null
      },
      select: {
        id: true,
        nome: true,
        automacao_ativa: true,
        webhook_url: true
      }
    })

    return NextResponse.json({
      success: true,
      salao: salaoAtualizado
    })
  } catch (error: any) {
    console.error('Erro ao salvar configuração de webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar configuração' },
      { status: 500 }
    )
  }
}
