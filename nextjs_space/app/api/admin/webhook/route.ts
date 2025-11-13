
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
        webhook_url: true,
        zapi_tipo_envio: true,
        zapi_delay: true,
        zapi_enviar_confirmacao: true,
        zapi_enviar_atualizacao: true,
        zapi_enviar_cancelamento: true,
        zapi_documento_url: true,
        zapi_documento_nome: true,
        zapi_documento_extensao: true,
        zapi_documento_descricao: true
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
    const { 
      salaoId, 
      automacao_ativa, 
      webhook_url,
      zapi_tipo_envio,
      zapi_delay,
      zapi_enviar_confirmacao,
      zapi_enviar_atualizacao,
      zapi_enviar_cancelamento,
      zapi_documento_url,
      zapi_documento_nome,
      zapi_documento_extensao,
      zapi_documento_descricao
    } = body

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

    // Validar delay (1-15 segundos)
    if (zapi_delay && (zapi_delay < 1 || zapi_delay > 15)) {
      return NextResponse.json(
        { error: 'O atraso deve estar entre 1 e 15 segundos' },
        { status: 400 }
      )
    }

    const salaoAtualizado = await prisma.salao.update({
      where: { id: salaoId },
      data: {
        automacao_ativa: Boolean(automacao_ativa),
        webhook_url: webhook_url || null,
        zapi_tipo_envio: zapi_tipo_envio || 'texto',
        zapi_delay: zapi_delay || 2,
        zapi_enviar_confirmacao: zapi_enviar_confirmacao ?? true,
        zapi_enviar_atualizacao: zapi_enviar_atualizacao ?? true,
        zapi_enviar_cancelamento: zapi_enviar_cancelamento ?? true,
        zapi_documento_url: zapi_documento_url || null,
        zapi_documento_nome: zapi_documento_nome || null,
        zapi_documento_extensao: zapi_documento_extensao || null,
        zapi_documento_descricao: zapi_documento_descricao || null
      },
      select: {
        id: true,
        nome: true,
        automacao_ativa: true,
        webhook_url: true,
        zapi_tipo_envio: true,
        zapi_delay: true,
        zapi_enviar_confirmacao: true,
        zapi_enviar_atualizacao: true,
        zapi_enviar_cancelamento: true,
        zapi_documento_url: true,
        zapi_documento_nome: true,
        zapi_documento_extensao: true,
        zapi_documento_descricao: true
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
