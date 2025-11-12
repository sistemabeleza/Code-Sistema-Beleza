
/**
 * Utilitários para sistema de Lembretes Inteligentes
 * Timezone fixo: America/Sao_Paulo
 */

export interface TemplateData {
  cliente_nome: string
  servico_nome: string
  profissional_nome: string
  agendamento_data_human: string
  tempo_restante: string
  link_publico: string
}

export type TipoMensagem = 'apenas_link' | 'lembrete_tempo' | 'lembrete_confirmacao'
export type QuandoEnviar = 'agora' | '24h' | '12h' | '3h' | '1h' | '30min'

/**
 * Templates fixos conforme especificação
 */
export const TEMPLATES: Record<TipoMensagem, string> = {
  apenas_link: 'Olá {{cliente_nome}}! Você pode agendar seu próximo horário pelo link: {{link_publico}}',
  lembrete_tempo: 'Olá {{cliente_nome}}! Seu atendimento de {{servico_nome}} com {{profissional_nome}} é em {{agendamento_data_human}} (faltam {{tempo_restante}}).',
  lembrete_confirmacao: 'Olá {{cliente_nome}}! Falta pouco para o seu atendimento de {{servico_nome}} com {{profissional_nome}}. Confirme presença ou avise se precisar reagendar.'
}

/**
 * Calcula tempo restante entre agora e data do agendamento
 * @param agendamentoDatetime Data/hora do agendamento em ISO string
 * @returns String formatada como "X horas e Y minutos" ou "X minutos"
 */
export function calcularTempoRestante(agendamentoDatetime: string): string {
  const agora = new Date()
  const agendamento = new Date(agendamentoDatetime)
  
  const diffMs = agendamento.getTime() - agora.getTime()
  
  if (diffMs <= 0) {
    return 'horário passou'
  }
  
  const diffMinutos = Math.floor(diffMs / (1000 * 60))
  const horas = Math.floor(diffMinutos / 60)
  const minutos = diffMinutos % 60
  
  if (horas > 0) {
    if (minutos > 0) {
      return `${horas} hora${horas > 1 ? 's' : ''} e ${minutos} minuto${minutos > 1 ? 's' : ''}`
    }
    return `${horas} hora${horas > 1 ? 's' : ''}`
  }
  
  return `${minutos} minuto${minutos > 1 ? 's' : ''}`
}

/**
 * Verifica se o horário do agendamento já passou
 */
export function agendamentoExpirado(agendamentoDatetime: string): boolean {
  const agora = new Date()
  const agendamento = new Date(agendamentoDatetime)
  return agendamento.getTime() <= agora.getTime()
}

/**
 * Processa template substituindo placeholders
 */
export function processarTemplate(template: string, data: TemplateData): string {
  let resultado = template
  
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    resultado = resultado.replace(new RegExp(placeholder, 'g'), value)
  })
  
  return resultado
}

/**
 * Formata data para formato brasileiro legível
 * IMPORTANTE: Não aplica conversão de timezone - usa hora local exata do banco
 */
export function formatarDataHumana(dataISO: string | Date, horaISO: string | Date | any): string {
  // Extrair data sem conversão UTC
  let dataStr = typeof dataISO === 'string' ? dataISO : dataISO.toISOString?.() || String(dataISO)
  const [ano, mes, dia] = dataStr.split('T')[0].split('-')
  
  // Extrair hora - SEMPRE usar valor local, SEM conversão de timezone
  let horas = '00'
  let minutos = '00'
  
  if (typeof horaISO === 'string') {
    // String: pode ser "HH:MM:SS", "HH:MM" ou "2025-11-12T17:45:00.000Z"
    const horaLimpa = horaISO.includes('T') ? horaISO.split('T')[1].split('.')[0] : horaISO
    const partes = horaLimpa.split(':')
    horas = partes[0].padStart(2, '0')
    minutos = (partes[1] || '00').padStart(2, '0')
  } else if (horaISO instanceof Date) {
    // Date object: usar getHours/getMinutes para EVITAR conversão de timezone
    horas = String(horaISO.getHours()).padStart(2, '0')
    minutos = String(horaISO.getMinutes()).padStart(2, '0')
  } else if (horaISO?.getHours !== undefined) {
    // Objeto com métodos de Date mas não instanceof Date
    horas = String(horaISO.getHours()).padStart(2, '0')
    minutos = String(horaISO.getMinutes()).padStart(2, '0')
  } else if (horaISO?.toISOString) {
    // Último recurso: usar toISOString e extrair (pode ter conversão de timezone)
    const isoString = horaISO.toISOString()
    const horaUTC = isoString.split('T')[1].split('.')[0]
    const [h, m] = horaUTC.split(':')
    horas = h.padStart(2, '0')
    minutos = m.padStart(2, '0')
  }
  
  return `${dia}/${mes}/${ano} às ${horas}:${minutos}`
}

/**
 * Calcula quando a mensagem deve ser enviada baseado na opção
 */
export function calcularHorarioEnvio(
  agendamentoDatetime: string, 
  quandoEnviar: QuandoEnviar
): Date | null {
  if (quandoEnviar === 'agora') {
    return null // Envia imediatamente
  }
  
  const agendamento = new Date(agendamentoDatetime)
  const horarioEnvio = new Date(agendamento)
  
  const horasAntes: Record<Exclude<QuandoEnviar, 'agora'>, number> = {
    '24h': 24 * 60,
    '12h': 12 * 60,
    '3h': 3 * 60,
    '1h': 1 * 60,
    '30min': 30
  }
  
  const minutosAntes = horasAntes[quandoEnviar as Exclude<QuandoEnviar, 'agora'>]
  horarioEnvio.setMinutes(horarioEnvio.getMinutes() - minutosAntes)
  
  // Verificar se o horário de envio já passou
  const agora = new Date()
  if (horarioEnvio.getTime() <= agora.getTime()) {
    return null // Horário de envio já passou
  }
  
  return horarioEnvio
}

/**
 * Valida se o agendamento está em status válido para lembretes
 */
export function statusValidoParaLembrete(status: string): boolean {
  return ['AGENDADO', 'CONFIRMADO'].includes(status)
}

/**
 * Labels para exibição
 */
export const LABELS_TIPO_MENSAGEM: Record<TipoMensagem, string> = {
  apenas_link: '📱 Apenas link de agendamento',
  lembrete_tempo: '⏰ Lembrete — faltam X horas/minutos',
  lembrete_confirmacao: '✅ Lembrete — confirmar presença / reagendar'
}

export const LABELS_QUANDO_ENVIAR: Record<QuandoEnviar, string> = {
  agora: 'Enviar agora',
  '24h': '24 horas antes',
  '12h': '12 horas antes',
  '3h': '3 horas antes',
  '1h': '1 hora antes',
  '30min': '30 minutos antes'
}
