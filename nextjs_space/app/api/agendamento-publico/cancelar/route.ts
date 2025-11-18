
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { enviarWebhookAgendamento } from '@/lib/webhook-utils'

const prisma = new PrismaClient()

// POST /api/agendamento-publico/cancelar - Cancelar agendamento pelo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agendamento_id, nome_cliente, telefone_cliente, email_cliente, motivo } = body

    // Validações básicas
    if (!agendamento_id) {
      return NextResponse.json(
        { error: 'ID do agendamento é obrigatório' },
        { status: 400 }
      )
    }

    if (!nome_cliente && !telefone_cliente && !email_cliente) {
      return NextResponse.json(
        { error: 'Informe pelo menos um dado para confirmar sua identidade (nome, telefone ou email)' },
        { status: 400 }
      )
    }

    // Buscar agendamento com dados do cliente
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: agendamento_id },
      include: {
        cliente: true,
        salao: true,
        profissional: true,
        servico: true
      }
    })

    if (!agendamento) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o agendamento já foi cancelado
    if (agendamento.status === 'CANCELADO') {
      return NextResponse.json(
        { error: 'Este agendamento já foi cancelado' },
        { status: 400 }
      )
    }

    // Verificar se o agendamento já foi realizado
    if (agendamento.status === 'REALIZADO') {
      return NextResponse.json(
        { error: 'Não é possível cancelar um agendamento já realizado' },
        { status: 400 }
      )
    }

    // Validar identidade do cliente
    const cliente = agendamento.cliente
    let identidadeConfirmada = false

    // Normalizar strings para comparação (remover espaços, converter para minúscula)
    const normalizar = (str: string | null | undefined) => {
      if (!str) return ''
      return str.toLowerCase().trim().replace(/\s+/g, ' ')
    }

    // Normalizar telefone (remover caracteres especiais)
    const normalizarTelefone = (tel: string | null | undefined) => {
      if (!tel) return ''
      return tel.replace(/\D/g, '')
    }

    if (nome_cliente) {
      const nomeNormalizado = normalizar(nome_cliente)
      const nomeClienteNormalizado = normalizar(cliente.nome)
      if (nomeNormalizado === nomeClienteNormalizado) {
        identidadeConfirmada = true
      }
    }

    if (telefone_cliente && !identidadeConfirmada) {
      const telefoneNormalizado = normalizarTelefone(telefone_cliente)
      const telefoneClienteNormalizado = normalizarTelefone(cliente.telefone)
      if (telefoneNormalizado === telefoneClienteNormalizado) {
        identidadeConfirmada = true
      }
    }

    if (email_cliente && !identidadeConfirmada) {
      const emailNormalizado = normalizar(email_cliente)
      const emailClienteNormalizado = normalizar(cliente.email)
      if (emailNormalizado === emailClienteNormalizado) {
        identidadeConfirmada = true
      }
    }

    if (!identidadeConfirmada) {
      return NextResponse.json(
        { error: 'Os dados informados não conferem com o cadastro do agendamento' },
        { status: 403 }
      )
    }

    // Atualizar agendamento para cancelado
    const agendamentoAtualizado = await prisma.agendamento.update({
      where: { id: agendamento_id },
      data: {
        status: 'CANCELADO',
        cancelado_por: 'CLIENTE',
        motivo_cancelamento: motivo || 'Cancelado pelo cliente',
        data_cancelamento: new Date()
      },
      include: {
        cliente: true,
        salao: true,
        profissional: true,
        servico: true
      }
    })

    // Enviar notificação via webhook Fiqon se configurado
    if (agendamento.salao.automacao_ativa && agendamento.salao.webhook_fiqon) {
      try {
        await enviarWebhookAgendamento(
          agendamentoAtualizado,
          agendamento.salao,
          'agendamento_cancelado'
        )
      } catch (webhookError) {
        console.error('Erro ao enviar webhook de cancelamento:', webhookError)
        // Não retornar erro, apenas logar
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Agendamento cancelado com sucesso',
      agendamento: {
        id: agendamentoAtualizado.id,
        status: agendamentoAtualizado.status,
        cancelado_por: agendamentoAtualizado.cancelado_por,
        data_cancelamento: agendamentoAtualizado.data_cancelamento
      }
    })

  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro ao cancelar agendamento. Tente novamente.' },
      { status: 500 }
    )
  }
}
