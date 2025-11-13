
/**
 * API para testar webhook
 * 
 * POST /api/automacao/testar-webhook
 * Body: { webhook_url: "https://..." }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { testarWebhook } from '@/lib/webhook-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { webhook_url } = body

    if (!webhook_url) {
      return NextResponse.json(
        { 
          sucesso: false,
          mensagem: 'URL do webhook é obrigatória' 
        },
        { status: 400 }
      )
    }

    // Buscar dados do salão
    const salao = await prisma.salao.findUnique({
      where: { id: session.user.salao_id }
    })

    if (!salao) {
      return NextResponse.json(
        { 
          sucesso: false,
          mensagem: 'Salão não encontrado' 
        },
        { status: 404 }
      )
    }

    // Testar webhook usando a função utilitária
    const resultado = await testarWebhook({
      ...salao,
      webhook_url,
      automacao_ativa: true
    })

    return NextResponse.json(resultado)
  } catch (error) {
    console.error('[API] Erro ao testar webhook:', error)
    return NextResponse.json(
      { 
        sucesso: false,
        mensagem: 'Erro ao testar webhook' 
      },
      { status: 500 }
    )
  }
}
