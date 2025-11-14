
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
    const { webhook_fiqon } = body

    if (!webhook_fiqon || webhook_fiqon.trim() === '') {
      return NextResponse.json(
        { sucesso: false, mensagem: 'URL do webhook não fornecida' },
        { status: 400 }
      )
    }

    // Buscar salão
    const salao = await prisma.salao.findUnique({
      where: { id: session.user.salao_id }
    })

    if (!salao) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Salão não encontrado' },
        { status: 404 }
      )
    }

    // Criar salão temporário para teste
    const salaoTeste = {
      ...salao,
      webhook_fiqon
    }

    // Testar webhook
    const resultado = await testarWebhook(salaoTeste)

    return NextResponse.json(resultado)

  } catch (error) {
    console.error('Erro ao testar webhook:', error)
    return NextResponse.json(
      { sucesso: false, mensagem: 'Erro ao testar webhook' },
      { status: 500 }
    )
  }
}
