
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

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

    const body = await request.json()
    const {
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

    // Atualizar configurações do salão
    const salaoAtualizado = await prisma.salao.update({
      where: { id: user.salao_id },
      data: {
        automacao_ativa: automacao_ativa || false,
        webhook_url: webhook_url || null,
        zapi_tipo_envio: zapi_tipo_envio || 'texto',
        zapi_delay: zapi_delay || 2,
        zapi_enviar_confirmacao: zapi_enviar_confirmacao !== false,
        zapi_enviar_atualizacao: zapi_enviar_atualizacao !== false,
        zapi_enviar_cancelamento: zapi_enviar_cancelamento !== false,
        zapi_documento_url: zapi_documento_url || null,
        zapi_documento_nome: zapi_documento_nome || null,
        zapi_documento_extensao: zapi_documento_extensao || '.pdf',
        zapi_documento_descricao: zapi_documento_descricao || null
      }
    })

    return NextResponse.json({
      message: 'Configurações ZAPI salvas com sucesso',
      salao: salaoAtualizado
    })
  } catch (error) {
    console.error('Erro ao salvar configurações ZAPI:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar configurações' },
      { status: 500 }
    )
  }
}
