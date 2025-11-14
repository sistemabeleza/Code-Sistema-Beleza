
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
 * Formato de payload para ZAPI/Fiqon (WhatsApp)
 */
interface ZAPIPayload {
  phone: string              // Telefone no formato internacional (+5511999999999)
  message: string            // Mensagem de texto
  delayMessage?: number      // Atraso em segundos (1-15), padrão 1
}

/**
 * Formato de payload com documento para ZAPI/Fiqon
 */
interface ZAPIPayloadComDocumento {
  phone: string              // Telefone no formato internacional
  document: string           // URL do documento ou Base64
  fileName?: string          // Nome do arquivo
  extension?: string         // Extensão (.pdf, .docx, etc)
  caption?: string           // Descrição/legenda do documento
  messageId?: string         // ID da mensagem para responder
  delayMessage?: number      // Atraso em segundos (1-15)
}

/**
 * Payload padronizado enviado para o webhook (formato genérico - mantido para compatibilidade)
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
 * Formata o telefone para o padrão internacional da ZAPI
 */
function formatarTelefoneInternacional(telefone: string): string {
  // Remove todos os caracteres não numéricos
  let numeros = telefone.replace(/\D/g, '')
  
  // Se não começar com 55 (código do Brasil), adiciona
  if (!numeros.startsWith('55')) {
    numeros = '55' + numeros
  }
  
  // Adiciona o + no início
  return '+' + numeros
}

/**
 * Formata mensagem de agendamento para WhatsApp
 */
function formatarMensagemAgendamento(
  evento: WebhookEvento,
  agendamento: AgendamentoCompleto
): string {
  const dataFormatada = agendamento.data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  })
  
  const horaInicio = agendamento.hora_inicio.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  })

  const nomeSalao = agendamento.salao?.nome || 'Nosso salão'
  const nomeCliente = agendamento.cliente.nome
  const nomeServico = agendamento.servico.nome
  const nomeProfissional = agendamento.profissional.nome

  let mensagem = ''

  switch (evento) {
    case 'agendamento.criado':
      mensagem = `✅ *Agendamento Confirmado!*\n\n` +
        `Olá ${nomeCliente}! 👋\n\n` +
        `Seu agendamento foi realizado com sucesso no *${nomeSalao}*.\n\n` +
        `📅 *Data:* ${dataFormatada}\n` +
        `🕐 *Horário:* ${horaInicio}\n` +
        `💇 *Serviço:* ${nomeServico}\n` +
        `👤 *Profissional:* ${nomeProfissional}\n\n` +
        `Aguardamos você! 😊`
      break

    case 'agendamento.atualizado':
      mensagem = `🔄 *Agendamento Atualizado*\n\n` +
        `Olá ${nomeCliente}! 👋\n\n` +
        `Seu agendamento no *${nomeSalao}* foi atualizado.\n\n` +
        `📅 *Nova Data:* ${dataFormatada}\n` +
        `🕐 *Novo Horário:* ${horaInicio}\n` +
        `💇 *Serviço:* ${nomeServico}\n` +
        `👤 *Profissional:* ${nomeProfissional}\n\n` +
        `Nos vemos lá! 😊`
      break

    case 'agendamento.cancelado':
      mensagem = `❌ *Agendamento Cancelado*\n\n` +
        `Olá ${nomeCliente}! 👋\n\n` +
        `Seu agendamento no *${nomeSalao}* foi cancelado.\n\n` +
        `📅 *Data:* ${dataFormatada}\n` +
        `🕐 *Horário:* ${horaInicio}\n` +
        `💇 *Serviço:* ${nomeServico}\n\n` +
        `Para reagendar, entre em contato conosco! 📞`
      break
  }

  if (agendamento.observacoes) {
    mensagem += `\n\n📝 *Observações:* ${agendamento.observacoes}`
  }

  return mensagem
}

/**
 * Formata o payload do webhook no formato ZAPI (WhatsApp) - Apenas Texto
 */
function formatarPayloadZAPI(
  evento: WebhookEvento,
  agendamento: AgendamentoCompleto,
  delaySegundos: number = 2
): ZAPIPayload {
  return {
    phone: formatarTelefoneInternacional(agendamento.cliente.telefone),
    message: formatarMensagemAgendamento(evento, agendamento),
    delayMessage: delaySegundos
  }
}

/**
 * Formata o payload do webhook no formato ZAPI com documento
 */
function formatarPayloadZAPIComDocumento(
  evento: WebhookEvento,
  agendamento: AgendamentoCompleto,
  configuracao: {
    documento_url: string
    documento_nome?: string
    documento_extensao?: string
    documento_descricao?: string
    delay: number
  }
): ZAPIPayloadComDocumento {
  return {
    phone: formatarTelefoneInternacional(agendamento.cliente.telefone),
    document: configuracao.documento_url,
    fileName: configuracao.documento_nome || 'Comprovante',
    extension: configuracao.documento_extensao || '.pdf',
    caption: configuracao.documento_descricao || formatarMensagemAgendamento(evento, agendamento),
    delayMessage: configuracao.delay
  }
}

/**
 * Formata o payload do webhook no padrão genérico (mantido para compatibilidade)
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
 * Envia o webhook para a URL configurada (formato ZAPI/Fiqon)
 * 
 * Esta função implementa:
 * - Timeout de 10 segundos (WhatsApp pode demorar mais)
 * - Retry de 1 tentativa em caso de falha
 * - Captura total de erros (nunca propaga exceções)
 * - Logs detalhados para auditoria
 */
async function enviarWebhook(url: string, payload: ZAPIPayload | ZAPIPayloadComDocumento): Promise<boolean> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos

  try {
    console.log(`[Webhook ZAPI] Enviando mensagem WhatsApp para ${payload.phone}`)
    console.log(`[Webhook ZAPI] URL:`, url)
    console.log(`[Webhook ZAPI] Payload:`, JSON.stringify(payload, null, 2))

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
      const responseData = await response.json().catch(() => ({}))
      console.log(`[Webhook ZAPI] ✓ Enviado com sucesso (status ${response.status})`)
      console.log(`[Webhook ZAPI] Resposta:`, responseData)
      return true
    } else {
      const errorText = await response.text().catch(() => 'Sem resposta')
      console.error(`[Webhook ZAPI] ✗ Erro no servidor remoto (status ${response.status}):`, errorText)
      return false
    }
  } catch (error: any) {
    clearTimeout(timeoutId)

    if (error.name === 'AbortError') {
      console.error(`[Webhook ZAPI] ✗ Timeout após 10 segundos`)
    } else {
      console.error(`[Webhook ZAPI] ✗ Erro ao enviar webhook:`, error.message || error)
    }

    return false
  }
}

/**
 * Função principal: envia webhook de evento de agendamento (formato ZAPI/Fiqon)
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
      console.error('[Webhook ZAPI] Dados do salão não disponíveis para envio de webhook')
      return
    }

    // Validar configuração
    if (!validarWebhookConfig(salaoData)) {
      return // Não fazer nada se webhook não estiver configurado
    }

    // Verificar se deve enviar notificação para este tipo de evento
    const deveEnviar = (() => {
      switch (evento) {
        case 'agendamento.criado':
          return (salaoData as any).zapi_enviar_confirmacao !== false
        case 'agendamento.atualizado':
          return (salaoData as any).zapi_enviar_atualizacao !== false
        case 'agendamento.cancelado':
          return (salaoData as any).zapi_enviar_cancelamento !== false
        default:
          return true
      }
    })()

    if (!deveEnviar) {
      console.log(`[Webhook ZAPI] Evento ${evento} desabilitado nas configurações`)
      return
    }

    console.log('[Webhook ZAPI] Iniciando envio de notificação WhatsApp...')

    // Obter configurações da ZAPI
    const tipoEnvio = (salaoData as any).zapi_tipo_envio || 'texto'
    const delay = (salaoData as any).zapi_delay || 2

    let payload: ZAPIPayload | ZAPIPayloadComDocumento

    // Escolher formato de payload baseado na configuração
    if (tipoEnvio === 'documento' && (salaoData as any).zapi_documento_url) {
      // Enviar com documento
      payload = formatarPayloadZAPIComDocumento(evento, {
        ...agendamento,
        salao: salaoData
      }, {
        documento_url: (salaoData as any).zapi_documento_url,
        documento_nome: (salaoData as any).zapi_documento_nome,
        documento_extensao: (salaoData as any).zapi_documento_extensao,
        documento_descricao: (salaoData as any).zapi_documento_descricao,
        delay
      })

      console.log('[Webhook ZAPI] Enviando mensagem COM documento')
    } else {
      // Enviar apenas texto
      payload = formatarPayloadZAPI(evento, {
        ...agendamento,
        salao: salaoData
      }, delay)

      console.log('[Webhook ZAPI] Enviando mensagem de TEXTO')
    }

    // Enviar webhook (com retry automático)
    const sucesso = await enviarWebhook(salaoData.webhook_url!, payload)

    // Se falhou, tentar uma vez mais após o delay configurado
    if (!sucesso) {
      console.log(`[Webhook ZAPI] Tentando reenvio em ${delay} segundos...`)
      await new Promise(resolve => setTimeout(resolve, delay * 1000))
      await enviarWebhook(salaoData.webhook_url!, payload)
    }
  } catch (error) {
    // Captura absoluta de qualquer erro - NUNCA propagar para o fluxo principal
    console.error('[Webhook ZAPI] Erro crítico capturado (não afeta o agendamento):', error)
  }
}

/**
 * Utilitário para testar webhook sem criar agendamento real (formato ZAPI/Fiqon)
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

    // Criar payload de teste no formato ZAPI
    const payloadTeste: ZAPIPayload = {
      phone: '+5511999999999',
      message: `🧪 *Teste de Webhook - ${salao.nome}*\n\n` +
        `Este é um teste de integração WhatsApp.\n\n` +
        `✅ Sua configuração está funcionando corretamente!\n\n` +
        `📅 Data do teste: ${new Date().toLocaleDateString('pt-BR')}\n` +
        `🕐 Horário: ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n\n` +
        `Sistema Beleza - Automação Inteligente`,
      delayMessage: 1
    }

    console.log('[Webhook ZAPI] Enviando mensagem de teste...')

    const sucesso = await enviarWebhook(salao.webhook_url!, payloadTeste)

    return {
      sucesso,
      mensagem: sucesso 
        ? '✓ Webhook ZAPI enviado com sucesso! Verifique o WhatsApp.' 
        : '✗ Falha ao enviar webhook. Verifique a URL da ZAPI e tente novamente.'
    }
  } catch (error: any) {
    return {
      sucesso: false,
      mensagem: `Erro ao testar webhook: ${error.message || 'Erro desconhecido'}`
    }
  }
}

/**
 * Envia lembrete automático de agendamento via ZAPI
 * Usado pelo sistema de lembretes automáticos do dia
 */
export async function enviarLembreteZAPI(
  agendamento: Agendamento & {
    cliente: Cliente
    servico: Servico
    profissional: Profissional
  },
  salao: Salao
): Promise<boolean> {
  try {
    if (!salao.automacao_ativa || !salao.zapi_enviar_lembretes) {
      console.log('[Lembrete ZAPI] Lembretes automáticos não estão ativos');
      return false;
    }

    if (!salao.zapi_instance_id || !salao.zapi_token) {
      console.log('[Lembrete ZAPI] Credenciais ZAPI não configuradas');
      return false;
    }

    // Formatar telefone
    const phone = formatarTelefoneInternacional(agendamento.cliente.telefone);

    // Formatar data/hora do agendamento
    const dataFormatada = new Date(agendamento.data).toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    });
    const horaFormatada = new Date(agendamento.hora_inicio).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    });

    // Montar mensagem de lembrete
    const mensagem = `🔔 *Lembrete de Agendamento*\n\n` +
      `Olá, ${agendamento.cliente.nome}!\n\n` +
      `Você tem um agendamento *hoje*:\n\n` +
      `📅 Data: ${dataFormatada}\n` +
      `🕐 Horário: ${horaFormatada}\n` +
      `💇 Serviço: ${agendamento.servico.nome}\n` +
      `👤 Profissional: ${agendamento.profissional.nome}\n\n` +
      `📍 ${salao.nome}\n\n` +
      `Nos vemos em breve! 😊`;

    let url = '';
    let payload: any = {};

    // Verificar tipo de envio (texto ou documento)
    if (salao.zapi_tipo_envio === 'documento' && salao.zapi_documento_url) {
      // Enviar com documento
      url = `https://api.z-api.io/instances/${salao.zapi_instance_id}/token/${salao.zapi_token}/send-document/${phone}`;
      payload = {
        phone: phone,
        document: salao.zapi_documento_url,
        fileName: salao.zapi_documento_nome || 'lembrete-agendamento.pdf',
        extension: salao.zapi_documento_extensao || '.pdf',
        caption: salao.zapi_documento_descricao || mensagem,
      };
    } else {
      // Enviar texto simples
      url = `https://api.z-api.io/instances/${salao.zapi_instance_id}/token/${salao.zapi_token}/send-text`;
      payload = {
        phone: phone,
        message: mensagem,
      };
    }

    console.log('[Lembrete ZAPI] Enviando lembrete para:', phone);
    console.log('[Lembrete ZAPI] URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': salao.zapi_token,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[Lembrete ZAPI] Erro na resposta:', result);
      return false;
    }

    console.log('[Lembrete ZAPI] Lembrete enviado com sucesso!');
    return true;
  } catch (error: any) {
    console.error('[Lembrete ZAPI] Erro ao enviar lembrete:', error);
    return false;
  }
}