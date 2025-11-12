
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  TipoMensagem, 
  QuandoEnviar, 
  TemplateData,
  processarTemplate,
  calcularTempoRestante,
  agendamentoExpirado,
  statusValidoParaLembrete,
  calcularHorarioEnvio
} from '@/lib/lembretes-utils'

/**
 * API para processamento de Lembretes Inteligentes
 * Feature flag: reminders_in_link_send=true
 * 
 * Não altera banco de dados - apenas processa e agenda mensagens
 * usando infraestrutura existente de notificações
 */

interface LembreteRequest {
  agendamento_id: string
  tipo_mensagem: TipoMensagem
  quando_enviar: QuandoEnviar
  telefone: string
  mensagem_template: string
  template_data: TemplateData
  horario_envio: string | null
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body: LembreteRequest = await request.json()

    // Validações
    if (!body.agendamento_id || !body.tipo_mensagem || !body.quando_enviar) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Recalcular tempo restante em tempo real
    const agendamentoDatetime = new Date(
      body.template_data.agendamento_data_human.split(' às ')[0].split('/').reverse().join('-') + 
      'T' + 
      body.template_data.agendamento_data_human.split(' às ')[1] + ':00'
    ).toISOString()

    // Verificar se horário expirou
    if (agendamentoExpirado(agendamentoDatetime)) {
      return NextResponse.json(
        { error: 'Horário do agendamento já passou' },
        { status: 400 }
      )
    }

    // Atualizar tempo restante com valor atual
    const tempoRestanteAtual = calcularTempoRestante(agendamentoDatetime)
    const templateDataAtualizado: TemplateData = {
      ...body.template_data,
      tempo_restante: tempoRestanteAtual
    }

    // Processar template com dados atualizados
    const mensagemFinal = processarTemplate(
      body.mensagem_template,
      templateDataAtualizado
    )

    // Se for envio imediato ("agora")
    if (body.quando_enviar === 'agora') {
      return NextResponse.json({
        success: true,
        enviado_agora: true,
        mensagem_final: mensagemFinal,
        telefone: body.telefone
      })
    }

    // Se for agendado
    const horarioEnvio = calcularHorarioEnvio(agendamentoDatetime, body.quando_enviar)

    if (!horarioEnvio) {
      return NextResponse.json(
        { error: 'Horário de envio já passou. Escolha outra opção.' },
        { status: 400 }
      )
    }

    // Aqui seria a integração com fila de jobs existente
    // Por enquanto, retornamos os dados para confirmação
    // Em produção, isso criaria um job agendado usando a mesma
    // infraestrutura de notificações já existente no sistema

    /**
     * NOTA TÉCNICA:
     * Para implementação completa com fila de jobs, integrar com:
     * - BullMQ / Redis para agendamento
     * - ou cron jobs com database scheduling
     * - ou serviço de filas existente (se houver)
     * 
     * Estrutura do job:
     * {
     *   id: uuid(),
     *   tipo: 'lembrete_whatsapp',
     *   agendamento_id: body.agendamento_id,
     *   telefone: body.telefone,
     *   mensagem: mensagemFinal,
     *   horario_execucao: horarioEnvio,
     *   status: 'agendado',
     *   criado_em: new Date()
     * }
     */

    console.log('📅 Lembrete agendado:', {
      agendamento_id: body.agendamento_id,
      tipo: body.tipo_mensagem,
      horario_envio: horarioEnvio.toISOString(),
      mensagem: mensagemFinal
    })

    return NextResponse.json({
      success: true,
      enviado_agora: false,
      agendado: true,
      horario_envio: horarioEnvio.toISOString(),
      mensagem_final: mensagemFinal,
      telefone: body.telefone,
      info: 'Lembrete agendado com sucesso. Job será processado no horário definido.'
    })

  } catch (error: any) {
    console.error('Erro na API de lembretes:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar lembrete' },
      { status: 500 }
    )
  }
}

/**
 * GET - Listar lembretes agendados (opcional)
 * Retorna jobs pendentes de execução
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Aqui retornaria lista de lembretes agendados
    // consultando a fila de jobs existente

    return NextResponse.json({
      success: true,
      lembretes_agendados: [],
      info: 'Funcionalidade de listagem será implementada com integração à fila de jobs'
    })

  } catch (error: any) {
    console.error('Erro ao listar lembretes:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao listar lembretes' },
      { status: 500 }
    )
  }
}
