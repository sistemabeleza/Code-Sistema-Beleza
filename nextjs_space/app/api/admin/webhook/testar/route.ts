
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { testarWebhook } from '@/lib/webhook-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { salaoId, webhook_url } = body

    if (!salaoId || !webhook_url) {
      return NextResponse.json(
        { error: 'salaoId e webhook_url são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar dados do salão
    const salao = await prisma.salao.findUnique({
      where: { id: salaoId }
    })

    if (!salao) {
      return NextResponse.json(
        { error: 'Salão não encontrado' },
        { status: 404 }
      )
    }

    // Testar webhook usando a função utilitária
    const resultado = await testarWebhook({
      ...salao,
      webhook_url, // Usar a URL fornecida no teste
      automacao_ativa: true // Forçar ativo para o teste
    })

    return NextResponse.json(resultado)
  } catch (error: any) {
    console.error('Erro ao testar webhook:', error)
    return NextResponse.json(
      { 
        sucesso: false,
        mensagem: 'Erro ao testar webhook: ' + (error.message || 'Erro desconhecido')
      },
      { status: 500 }
    )
  }
}
