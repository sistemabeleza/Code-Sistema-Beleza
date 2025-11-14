
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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
    const { automacao_ativa, webhook_fiqon } = body

    // Validação
    if (automacao_ativa && (!webhook_fiqon || webhook_fiqon.trim() === '')) {
      return NextResponse.json(
        { error: 'Informe a URL do webhook da Fiqon' },
        { status: 400 }
      )
    }

    // Atualizar salão
    await prisma.salao.update({
      where: { id: session.user.salao_id },
      data: {
        automacao_ativa,
        webhook_fiqon: webhook_fiqon?.trim() || null
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Configurações salvas com sucesso'
    })

  } catch (error) {
    console.error('Erro ao salvar webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar configurações' },
      { status: 500 }
    )
  }
}
