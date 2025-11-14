
/**
 * Biblioteca Simples de Webhook para Fiqon
 * 
 * Este módulo envia eventos de agendamento para a Fiqon via webhook.
 * A Fiqon cuida de enviar as mensagens via ZAPI/WhatsApp.
 * 
 * IMPORTANTE:
 * - Falhas no webhook NUNCA devem quebrar o fluxo principal do sistema
 * - Todos os erros são capturados e logados
 * - Timeout de 10 segundos
 */

import { Agendamento, Cliente, Profissional, Servico, Salao } from '@prisma/client'
import { formatarMensagemAutomacao } from './mensagens-automacao'

/**
 * Tipos de eventos suportados
 */
export type TipoEvento = 'agendamento_criado' | 'agendamento_atualizado' | 'agendamento_cancelado' | 'lembrete_dia'

/**
 * Payload simples enviado para Fiqon
 */
interface PayloadFiqon {
  evento: TipoEvento
  timestamp: string
  salao: {
    nome: string
    telefone?: string
  }
  cliente: {
    nome: string
    telefone: string
  }
  agendamento: {
    id: string
    data: string           // Formato YYYY-MM-DD (para compatibilidade)
    data_formatada: string // Formato DD/MM/YYYY (para exibição)
    hora_inicio: string    // Formato HH:MM
    hora_fim: string       // Formato HH:MM
    status: string
  }
  servico: {
    nome: string
  }
  profissional: {
    nome: string
  }
  mensagem_formatada: string  // Mensagem pronta para envio via WhatsApp
}

/**
 * Tipo do agendamento completo
 */
type AgendamentoCompleto = Agendamento & {
  cliente: Cliente
  profissional: Profissional
  servico: Servico
  salao?: Salao
}

/**
 * Formata telefone para padrão brasileiro (+55...)
 */
function formatarTelefone(telefone: string): string {
  const numeros = telefone.replace(/\D/g, '')
  
  if (numeros.startsWith('55')) {
    return `+${numeros}`
  }
  
  return `+55${numeros}`
}

/**
 * Formata data para DD/MM/YYYY
 */
function formatarData(data: Date): string {
  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const ano = data.getFullYear()
  return `${dia}/${mes}/${ano}`
}

/**
 * Formata data para YYYY-MM-DD (formato ISO)
 */
function formatarDataISO(data: Date): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

/**
 * Valida se o webhook está configurado
 */
function validarWebhook(salao: Salao): boolean {
  if (!salao.automacao_ativa) {
    console.log(`[Webhook Fiqon] Automação desativada`)
    return false
  }

  if (!salao.webhook_fiqon || salao.webhook_fiqon.trim() === '') {
    console.log(`[Webhook Fiqon] URL não configurada`)
    return false
  }

  return true
}

/**
 * Formata hora para HH:MM
 */
function formatarHora(hora: Date | string): string {
  if (typeof hora === 'string') {
    // Se já é string, extrai apenas HH:MM
    return hora.slice(0, 5)
  }
  // Se é Date, converte para string HH:MM
  return hora.toTimeString().slice(0, 5)
}

/**
 * Monta payload para enviar à Fiqon
 */
function montarPayload(
  agendamento: AgendamentoCompleto,
  salao: Salao,
  evento: TipoEvento
): PayloadFiqon {
  // Formata hora_inicio e hora_fim
  const horaInicio = formatarHora(agendamento.hora_inicio)
  const horaFim = formatarHora(agendamento.hora_fim)

  // Mapeia evento para formato da mensagem
  let eventoMensagem: 'agendamento_criado' | 'agendamento_atualizado' | 'agendamento_cancelado' | 'agendamento_lembrete'
  
  if (evento === 'lembrete_dia') {
    eventoMensagem = 'agendamento_lembrete'
  } else {
    eventoMensagem = evento as 'agendamento_criado' | 'agendamento_atualizado' | 'agendamento_cancelado'
  }

  // Monta o payload base
  const payloadBase = {
    evento: eventoMensagem,
    timestamp: new Date().toISOString(),
    salao: {
      nome: salao.nome,
      telefone: salao.telefone || ''
    },
    agendamento: {
      id: agendamento.id,
      data: formatarDataISO(agendamento.data),
      hora_inicio: horaInicio,
      hora_fim: horaFim,
      status: agendamento.status
    },
    cliente: {
      nome: agendamento.cliente.nome,
      telefone: formatarTelefone(agendamento.cliente.telefone)
    },
    servico: {
      nome: agendamento.servico.nome
    },
    profissional: {
      nome: agendamento.profissional.nome
    }
  }

  // Gera a mensagem formatada
  const mensagemFormatada = formatarMensagemAutomacao(payloadBase)

  // Retorna o payload completo com a mensagem formatada
  return {
    ...payloadBase,
    evento: evento, // Mantém o evento original no payload
    agendamento: {
      ...payloadBase.agendamento,
      data_formatada: formatarData(agendamento.data)
    },
    mensagem_formatada: mensagemFormatada
  }
}

/**
 * Envia dados para o webhook da Fiqon
 */
async function enviarParaFiqon(webhookUrl: string, payload: PayloadFiqon): Promise<boolean> {
  try {
    console.log(`[Webhook Fiqon] Enviando evento: ${payload.evento}`)
    console.log(`[Webhook Fiqon] Cliente: ${payload.cliente.nome} - ${payload.cliente.telefone}`)
    console.log(`[Webhook Fiqon] Agendamento: ${payload.agendamento.data_formatada} às ${payload.agendamento.hora_inicio}`)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10 segundos

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (response.ok) {
      console.log(`[Webhook Fiqon] ✅ Sucesso! Status: ${response.status}`)
      return true
    } else {
      const erro = await response.text()
      console.error(`[Webhook Fiqon] ❌ Erro ${response.status}: ${erro}`)
      return false
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('[Webhook Fiqon] ❌ Timeout após 10 segundos')
    } else {
      console.error('[Webhook Fiqon] ❌ Erro ao enviar:', error.message)
    }
    return false
  }
}

/**
 * FUNÇÃO PRINCIPAL: Envia evento de agendamento para Fiqon
 */
export async function enviarWebhookAgendamento(
  agendamento: AgendamentoCompleto,
  salao: Salao,
  evento: TipoEvento
): Promise<void> {
  try {
    // Validar configuração
    if (!validarWebhook(salao)) {
      return
    }

    // Montar payload
    const payload = montarPayload(agendamento, salao, evento)

    // Enviar para Fiqon
    await enviarParaFiqon(salao.webhook_fiqon!, payload)

  } catch (error: any) {
    console.error('[Webhook Fiqon] ❌ Erro inesperado:', error.message)
  }
}

/**
 * Envia lembretes de agendamentos do dia
 */
export async function enviarLembretesDia(
  agendamentos: AgendamentoCompleto[],
  salao: Salao
): Promise<void> {
  try {
    // Validar configuração
    if (!validarWebhook(salao)) {
      return
    }

    console.log(`[Webhook Fiqon] Enviando ${agendamentos.length} lembretes do dia`)

    // Enviar cada lembrete
    for (const agendamento of agendamentos) {
      const payload = montarPayload(agendamento, salao, 'lembrete_dia')
      await enviarParaFiqon(salao.webhook_fiqon!, payload)
      
      // Pequeno delay entre envios
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log(`[Webhook Fiqon] ✅ Lembretes enviados com sucesso`)

  } catch (error: any) {
    console.error('[Webhook Fiqon] ❌ Erro ao enviar lembretes:', error.message)
  }
}

/**
 * Testa o webhook com payload de exemplo
 */
export async function testarWebhook(salao: Salao, telefone: string = '5511999999999'): Promise<{ sucesso: boolean, mensagem: string }> {
  try {
    if (!salao.webhook_fiqon || salao.webhook_fiqon.trim() === '') {
      return {
        sucesso: false,
        mensagem: 'URL do webhook não configurada'
      }
    }

    const dataHoje = new Date()
    
    // Monta payload base
    const payloadBase = {
      evento: 'agendamento_criado' as const,
      timestamp: new Date().toISOString(),
      salao: {
        nome: salao.nome,
        telefone: salao.telefone || ''
      },
      cliente: {
        nome: 'Cliente Teste',
        telefone: formatarTelefone(telefone)
      },
      agendamento: {
        id: 'teste-999',
        data: formatarDataISO(dataHoje),
        hora_inicio: '14:00',
        hora_fim: '15:00',
        status: 'confirmado'
      },
      servico: {
        nome: 'Serviço de Teste'
      },
      profissional: {
        nome: 'Profissional Teste'
      }
    }

    // Gera a mensagem formatada
    const mensagemFormatada = formatarMensagemAutomacao(payloadBase)

    // Payload completo
    const payloadTeste: PayloadFiqon = {
      ...payloadBase,
      agendamento: {
        ...payloadBase.agendamento,
        data_formatada: formatarData(dataHoje)
      },
      mensagem_formatada: mensagemFormatada
    }

    const sucesso = await enviarParaFiqon(salao.webhook_fiqon, payloadTeste)

    return {
      sucesso,
      mensagem: sucesso 
        ? 'Teste enviado com sucesso! Verifique se a mensagem chegou.'
        : 'Falha ao enviar teste. Verifique a URL do webhook e tente novamente.'
    }

  } catch (error: any) {
    return {
      sucesso: false,
      mensagem: `Erro no teste: ${error.message}`
    }
  }
}
