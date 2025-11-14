
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { testarWebhook } from '@/lib/webhook-utils'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar usuário e salão
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user?.salao_id) {
      return NextResponse.json({ error: 'Salão não encontrado' }, { status: 404 })
    }

    // Buscar dados do salão
    const salao = await prisma.salao.findUnique({
      where: { id: user.salao_id }
    })

    if (!salao) {
      return NextResponse.json({ error: 'Salão não encontrado' }, { status: 404 })
    }

    // Testar webhook
    const resultado = await testarWebhook(salao)

    return NextResponse.json(resultado)
  } catch (error) {
    console.error('Erro ao testar webhook ZAPI:', error)
    return NextResponse.json(
      { 
        sucesso: false,
        mensagem: 'Erro ao testar webhook' 
      },
      { status: 500 }
    )
  }
}
