
/**
 * Biblioteca de Webhook para Automação Inteligente
 * 
 * Este módulo gerencia o envio de eventos de agendamento para plataformas externas (Fiqeon, Z-API, etc.)
 * 
 * IMPORTANTE:
 * - Falhas no webhook NUNCA devem quebrar o fluxo principal do sistema
 * - Todos os erros são capturados e logados, mas não propagados
 * - Timeout de 5 segundos para evitar travamentos
 */

import { Agendamento, Cliente, Profissional, Servico, Salao } from '@prisma/client'

/**
 * Tipos de eventos de webhook suportados
 */
export type WebhookEvento = 'agendamento.criado' | 'agendamento.atualizado' | 'agendamento.cancelado'

/**
 * Payload padronizado enviado para o webhook
 */
interface WebhookPayload {
  evento: WebhookEvento
  timestamp: string
  salao: {
    id: string
    nome: string
    slug: string | null
  }
  agendamento: {
    id: string
    data: string
    hora_inicio: string
    hora_fim: string
    status: string
    origem: string
    valor_cobrado: number | null
    observacoes: string | null
  }
  cliente: {
    id: string
    nome: string
    telefone: string
    email: string | null
  }
  servico: {
    id: string
    nome: string
    preco: number
    duracao_minutos: number
  }
  profissional: {
    id: string
    nome: string
  }
}

/**
 * Tipo completo do agendamento com todas as relações
 */
type AgendamentoCompleto = Agendamento & {
  cliente: Cliente
  profissional: Profissional
  servico: Servico
  salao?: Salao
}

/**
 * Valida se o webhook está configurado e ativo para o salão
 */
function validarWebhookConfig(salao: Salao): boolean {
  if (!salao.automacao_ativa) {
    console.log(`[Webhook] Automação desativada para o salão ${salao.nome} (${salao.id})`)
    return false
  }

  if (!salao.webhook_url || salao.webhook_url.trim() === '') {
    console.log(`[Webhook] URL não configurada para o salão ${salao.nome} (${salao.id})`)
    return false
  }

  // Validação básica de URL
  try {
    new URL(salao.webhook_url)
  } catch (error) {
    console.error(`[Webhook] URL inválida para o salão ${salao.nome}:`, salao.webhook_url)
    return false
  }

  return true
}

/**
 * Formata o payload do webhook no padrão esperado
 */
function formatarPayloadWebhook(
  evento: WebhookEvento,
  agendamento: AgendamentoCompleto
): WebhookPayload {
  // Converter Decimal para number de forma segura
  const precoServico = typeof agendamento.servico.preco === 'number' 
    ? agendamento.servico.preco 
    : Number(agendamento.servico.preco)

  const valorCobrado = agendamento.valor_cobrado 
    ? (typeof agendamento.valor_cobrado === 'number' 
        ? agendamento.valor_cobrado 
        : Number(agendamento.valor_cobrado))
    : null

  return {
    evento,
    timestamp: new Date().toISOString(),
    salao: {
      id: agendamento.salao_id,
      nome: agendamento.salao?.nome || 'Nome não disponível',
      slug: agendamento.salao?.slug || null
    },
    agendamento: {
      id: agendamento.id,
      data: agendamento.data.toISOString().split('T')[0], // YYYY-MM-DD
      hora_inicio: agendamento.hora_inicio.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      }),
      hora_fim: agendamento.hora_fim.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      }),
      status: agendamento.status,
      origem: agendamento.origem,
      valor_cobrado: valorCobrado,
      observacoes: agendamento.observacoes
    },
    cliente: {
      id: agendamento.cliente.id,
      nome: agendamento.cliente.nome,
      telefone: agendamento.cliente.telefone,
      email: agendamento.cliente.email
    },
    servico: {
      id: agendamento.servico.id,
      nome: agendamento.servico.nome,
      preco: precoServico,
      duracao_minutos: agendamento.servico.duracao_minutos
    },
    profissional: {
      id: agendamento.profissional.id,
      nome: agendamento.profissional.nome
    }
  }
}

/**
 * Envia o webhook para a URL configurada
 * 
 * Esta função implementa:
 * - Timeout de 5 segundos
 * - Retry de 1 tentativa em caso de falha
 * - Captura total de erros (nunca propaga exceções)
 * - Logs detalhados para auditoria
 */
async function enviarWebhook(url: string, payload: WebhookPayload): Promise<boolean> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos

  try {
    console.log(`[Webhook] Enviando evento ${payload.evento} para ${url}`)
    console.log(`[Webhook] Payload:`, JSON.stringify(payload, null, 2))

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Sistema-Beleza-Webhook/1.0'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      console.log(`[Webhook] ✓ Enviado com sucesso (status ${response.status})`)
      return true
    } else {
      const errorText = await response.text().catch(() => 'Sem resposta')
      console.error(`[Webhook] ✗ Erro no servidor remoto (status ${response.status}):`, errorText)
      return false
    }
  } catch (error: any) {
    clearTimeout(timeoutId)

    if (error.name === 'AbortError') {
      console.error(`[Webhook] ✗ Timeout após 5 segundos`)
    } else {
      console.error(`[Webhook] ✗ Erro ao enviar webhook:`, error.message || error)
    }

    return false
  }
}

/**
 * Função principal: envia webhook de evento de agendamento
 * 
 * Esta é a função que deve ser chamada nos endpoints de agendamento.
 * 
 * GARANTIA: Nunca lança exceção - qualquer erro é capturado e logado
 * 
 * @param evento - Tipo de evento (criado, atualizado, cancelado)
 * @param agendamento - Agendamento completo com todas as relações
 * @param salao - Dados do salão (opcional, se não vier no agendamento)
 */
export async function enviarWebhookAgendamento(
  evento: WebhookEvento,
  agendamento: AgendamentoCompleto,
  salao?: Salao
): Promise<void> {
  try {
    // Se o salão não veio no agendamento, usar o parâmetro
    const salaoData = agendamento.salao || salao

    if (!salaoData) {
      console.error('[Webhook] Dados do salão não disponíveis para envio de webhook')
      return
    }

    // Validar configuração
    if (!validarWebhookConfig(salaoData)) {
      return // Não fazer nada se webhook não estiver configurado
    }

    // Formatar payload
    const payload = formatarPayloadWebhook(evento, {
      ...agendamento,
      salao: salaoData
    })

    // Enviar webhook (com retry automático)
    const sucesso = await enviarWebhook(salaoData.webhook_url!, payload)

    // Se falhou, tentar uma vez mais após 1 segundo
    if (!sucesso) {
      console.log('[Webhook] Tentando reenvio em 1 segundo...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      await enviarWebhook(salaoData.webhook_url!, payload)
    }
  } catch (error) {
    // Captura absoluta de qualquer erro - NUNCA propagar para o fluxo principal
    console.error('[Webhook] Erro crítico capturado (não afeta o agendamento):', error)
  }
}

/**
 * Utilitário para testar webhook sem criar agendamento real
 * Útil para validação da configuração
 */
export async function testarWebhook(salao: Salao): Promise<{ sucesso: boolean; mensagem: string }> {
  try {
    if (!validarWebhookConfig(salao)) {
      return {
        sucesso: false,
        mensagem: 'Webhook não está configurado ou ativo'
      }
    }

    const payloadTeste: WebhookPayload = {
      evento: 'agendamento.criado',
      timestamp: new Date().toISOString(),
      salao: {
        id: salao.id,
        nome: salao.nome,
        slug: salao.slug
      },
      agendamento: {
        id: 'test-123',
        data: new Date().toISOString().split('T')[0],
        hora_inicio: '10:00',
        hora_fim: '11:00',
        status: 'AGENDADO',
        origem: 'MANUAL',
        valor_cobrado: 50.00,
        observacoes: 'Teste de webhook'
      },
      cliente: {
        id: 'test-cliente',
        nome: 'Cliente Teste',
        telefone: '+5511999999999',
        email: 'teste@exemplo.com'
      },
      servico: {
        id: 'test-servico',
        nome: 'Corte de Cabelo',
        preco: 50.00,
        duracao_minutos: 60
      },
      profissional: {
        id: 'test-profissional',
        nome: 'Profissional Teste'
      }
    }

    const sucesso = await enviarWebhook(salao.webhook_url!, payloadTeste)

    return {
      sucesso,
      mensagem: sucesso 
        ? 'Webhook enviado com sucesso!' 
        : 'Falha ao enviar webhook. Verifique a URL e tente novamente.'
    }
  } catch (error: any) {
    return {
      sucesso: false,
      mensagem: `Erro ao testar webhook: ${error.message || 'Erro desconhecido'}`
    }
  }
}
