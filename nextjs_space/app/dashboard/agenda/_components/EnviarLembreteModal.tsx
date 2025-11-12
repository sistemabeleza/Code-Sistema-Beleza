
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { MessageCircle, Clock, CheckCircle, AlertCircle, Send, Calendar } from 'lucide-react'
import {
  TipoMensagem,
  QuandoEnviar,
  TEMPLATES,
  LABELS_TIPO_MENSAGEM,
  LABELS_QUANDO_ENVIAR,
  calcularTempoRestante,
  formatarDataHumana,
  processarTemplate,
  agendamentoExpirado,
  calcularHorarioEnvio,
  TemplateData
} from '@/lib/lembretes-utils'

interface Agendamento {
  id: string
  cliente: { nome: string; telefone: string }
  profissional: { nome: string }
  servico: { nome: string }
  data: string
  hora_inicio: string
  status: string
}

interface EnviarLembreteModalProps {
  aberto: boolean
  onFechar: () => void
  agendamento: Agendamento | null
  linkPublico: string
}

export default function EnviarLembreteModal({
  aberto,
  onFechar,
  agendamento,
  linkPublico
}: EnviarLembreteModalProps) {
  const [tipoMensagem, setTipoMensagem] = useState<TipoMensagem>('apenas_link')
  const [quandoEnviar, setQuandoEnviar] = useState<QuandoEnviar>('agora')
  const [enviando, setEnviando] = useState(false)

  // Reset ao abrir modal
  useEffect(() => {
    if (aberto) {
      setTipoMensagem('apenas_link')
      setQuandoEnviar('agora')
    }
  }, [aberto])

  if (!agendamento) return null

  // Verificar se agendamento expirou
  // Extrair hora da string hora_inicio (pode vir como "HH:MM:SS", "HH:MM" ou Date)
  // IMPORTANTE: Sempre extrair como string local, SEM conversão de timezone
  let horaFormatada = ''
  const horaInicio: any = agendamento.hora_inicio
  
  if (typeof horaInicio === 'string') {
    // Se já é string, usar direto (pode ter ou não a parte de data)
    if (horaInicio.includes('T')) {
      // Formato ISO completo: "2025-11-12T17:45:00.000Z"
      horaFormatada = horaInicio.split('T')[1].split('.')[0]
    } else {
      // Formato simples: "17:45:00" ou "17:45"
      horaFormatada = horaInicio
    }
  } else if (horaInicio instanceof Date) {
    // CRÍTICO: Se é Date object, extrair usando getHours/getMinutes
    // para EVITAR conversão de timezone do toISOString()
    const h = String(horaInicio.getHours()).padStart(2, '0')
    const m = String(horaInicio.getMinutes()).padStart(2, '0')
    const s = String(horaInicio.getSeconds()).padStart(2, '0')
    horaFormatada = `${h}:${m}:${s}`
  } else if (horaInicio?.getHours !== undefined) {
    // Objeto com métodos de Date mas não instanceof Date
    const h = String(horaInicio.getHours()).padStart(2, '0')
    const m = String(horaInicio.getMinutes()).padStart(2, '0')
    const s = String(horaInicio.getSeconds()).padStart(2, '0')
    horaFormatada = `${h}:${m}:${s}`
  } else {
    // Fallback: tentar converter para Date
    const dataHora = new Date(horaInicio)
    const h = String(dataHora.getHours()).padStart(2, '0')
    const m = String(dataHora.getMinutes()).padStart(2, '0')
    const s = String(dataHora.getSeconds()).padStart(2, '0')
    horaFormatada = `${h}:${m}:${s}`
  }
  
  const agendamentoDatetime = `${agendamento.data.split('T')[0]}T${horaFormatada}`
  const expirado = agendamentoExpirado(agendamentoDatetime)

  // Dados para template - usar horaFormatada extraída, não o valor original
  const templateData: TemplateData = {
    cliente_nome: agendamento.cliente.nome,
    servico_nome: agendamento.servico.nome,
    profissional_nome: agendamento.profissional.nome,
    agendamento_data_human: formatarDataHumana(agendamento.data, horaFormatada),
    tempo_restante: calcularTempoRestante(agendamentoDatetime),
    link_publico: linkPublico
  }

  // Gerar prévia da mensagem
  const mensagemPrevia = processarTemplate(TEMPLATES[tipoMensagem], templateData)

  const handleEnviar = async () => {
    if (expirado) {
      toast.error('⚠️ Horário expirado! Não é possível enviar lembrete.')
      return
    }

    setEnviando(true)

    try {
      const horarioEnvio = calcularHorarioEnvio(agendamentoDatetime, quandoEnviar)
      
      // Se horário de envio já passou e não é "agora"
      if (quandoEnviar !== 'agora' && !horarioEnvio) {
        toast.error('⚠️ Horário de envio já passou! Escolha outra opção.')
        setEnviando(false)
        return
      }

      const payload = {
        agendamento_id: agendamento.id,
        tipo_mensagem: tipoMensagem,
        quando_enviar: quandoEnviar,
        telefone: agendamento.cliente.telefone,
        mensagem_template: TEMPLATES[tipoMensagem],
        template_data: templateData,
        horario_envio: horarioEnvio?.toISOString() || null
      }

      const res = await fetch('/api/lembretes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao processar lembrete')
      }

      const resultado = await res.json()

      if (resultado.enviado_agora) {
        // Abre WhatsApp diretamente
        const telefone = agendamento.cliente.telefone.replace(/\D/g, '')
        const whatsappUrl = `https://wa.me/${telefone}?text=${encodeURIComponent(resultado.mensagem_final)}`
        window.open(whatsappUrl, '_blank')
        toast.success('✅ WhatsApp aberto com mensagem!')
      } else {
        toast.success(`⏰ Lembrete agendado para ${new Date(resultado.horario_envio).toLocaleString('pt-BR')}`)
      }

      onFechar()
    } catch (error: any) {
      console.error('Erro ao enviar lembrete:', error)
      toast.error(error.message || 'Erro ao processar lembrete')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Enviar Lembrete Inteligente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações do Agendamento */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                👤 {agendamento.cliente.nome}
              </span>
              <Badge variant="outline" className="bg-white">
                {agendamento.status}
              </Badge>
            </div>
            <div className="text-sm text-blue-700">
              💇 {agendamento.servico.nome} • {agendamento.profissional.nome}
            </div>
            <div className="text-sm text-blue-700 font-medium">
              📅 {templateData.agendamento_data_human}
            </div>
            {!expirado && (
              <div className="text-sm text-blue-600 font-semibold">
                ⏰ Faltam {templateData.tempo_restante}
              </div>
            )}
            {expirado && (
              <div className="flex items-center gap-2 text-red-600 font-semibold">
                <AlertCircle className="h-4 w-4" />
                Horário expirado
              </div>
            )}
          </div>

          {/* Tipo de Mensagem */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Tipo de Mensagem</Label>
            <div className="space-y-2">
              {(Object.keys(TEMPLATES) as TipoMensagem[]).map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setTipoMensagem(tipo)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    tipoMensagem === tipo
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={expirado}
                >
                  <div className="font-medium">{LABELS_TIPO_MENSAGEM[tipo]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quando Enviar */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Quando Enviar</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(LABELS_QUANDO_ENVIAR) as QuandoEnviar[]).map((quando) => (
                <button
                  key={quando}
                  onClick={() => setQuandoEnviar(quando)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    quandoEnviar === quando
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={expirado}
                >
                  {quando === 'agora' && <Send className="inline h-4 w-4 mr-1" />}
                  {quando !== 'agora' && <Clock className="inline h-4 w-4 mr-1" />}
                  {LABELS_QUANDO_ENVIAR[quando]}
                </button>
              ))}
            </div>
          </div>

          {/* Pré-visualização */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Pré-visualização da Mensagem
            </Label>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {mensagemPrevia}
              </p>
            </div>
          </div>

          {/* Informações adicionais */}
          {quandoEnviar !== 'agora' && !expirado && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              <Calendar className="inline h-4 w-4 mr-1" />
              O lembrete será agendado e enviado automaticamente no horário programado. 
              O tempo restante será recalculado no momento do envio.
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onFechar}
            className="flex-1"
            disabled={enviando}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEnviar}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={enviando || expirado}
          >
            {enviando ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : quandoEnviar === 'agora' ? (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Agora
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Lembrete
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
