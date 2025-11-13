
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { enviarWebhookAgendamento } from '@/lib/webhook-utils'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()

    // Verificar se o agendamento pertence ao salão
    const agendamento = await prisma.agendamento.findFirst({
      where: {
        id,
        salao_id: session.user.salao_id
      },
      include: {
        servico: true,
        cliente: true
      }
    })

    if (!agendamento) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    const agendamentoAtualizado = await prisma.agendamento.update({
      where: { id },
      data: body,
      include: {
        cliente: true,
        profissional: true,
        servico: true,
        salao: true // Incluir dados do salão para webhook
      }
    })

    // Enviar webhook de automação (se configurado)
    enviarWebhookAgendamento('agendamento.atualizado', agendamentoAtualizado).catch(err => {
      console.error('[API] Erro ao enviar webhook (ignorado):', err)
    })

    // Se o status mudou para REALIZADO, registrar automaticamente como receita
    if (body.status === 'REALIZADO' && agendamento.status !== 'REALIZADO') {
      const valorServico = agendamento.valor_cobrado || agendamento.servico.preco
      
      await prisma.lancamento.create({
        data: {
          salao_id: session.user.salao_id,
          tipo: 'RECEITA',
          categoria: 'SERVICO',
          descricao: `Serviço: ${agendamento.servico.nome} - Cliente: ${agendamento.cliente.nome}`,
          valor: valorServico,
          data_lancamento: new Date(),
          observacoes: `Agendamento #${id.slice(0, 8)}`
        }
      })
    }

    return NextResponse.json({
      success: true,
      agendamento: agendamentoAtualizado,
      message: 'Agendamento atualizado com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar agendamento' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id } = params

    // Buscar agendamento com todas as relações antes de deletar (para webhook)
    const agendamento = await prisma.agendamento.findFirst({
      where: {
        id,
        salao_id: session.user.salao_id
      },
      include: {
        cliente: true,
        profissional: true,
        servico: true,
        salao: true
      }
    })

    if (!agendamento) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // Deletar agendamento
    await prisma.agendamento.delete({
      where: { id }
    })

    // Enviar webhook de automação (se configurado)
    enviarWebhookAgendamento('agendamento.cancelado', agendamento).catch(err => {
      console.error('[API] Erro ao enviar webhook (ignorado):', err)
    })

    return NextResponse.json({
      success: true,
      message: 'Agendamento excluído com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir agendamento' },
      { status: 500 }
    )
  }
}
