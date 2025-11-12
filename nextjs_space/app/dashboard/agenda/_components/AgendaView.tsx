
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Calendar,
  Plus,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  XCircle,
  Loader2,
  Globe,
  UserPlus,
  MessageCircle,
  Check
} from 'lucide-react'
import NovoAgendamentoModal from './NovoAgendamentoModal'
import EnviarLembreteModal from './EnviarLembreteModal'

interface Agendamento {
  id: string
  cliente: { id: string; nome: string; telefone: string }
  profissional: { id: string; nome: string }
  servico: { id: string; nome: string; preco: number }
  data: string
  hora_inicio: string
  hora_fim: string
  status: string
  origem: string
  observacoes?: string
}

interface ConfiguracoesSalao {
  slug: string
  whatsapp_number?: string
}

export default function AgendaView() {
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [modalLembreteAberto, setModalLembreteAberto] = useState(false)
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null)
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesSalao | null>(null)

  useEffect(() => {
    carregarConfiguracoes()
    carregarAgendamentos()
  }, [dataSelecionada])

  const carregarConfiguracoes = async () => {
    try {
      const res = await fetch('/api/configuracoes')
      if (res.ok) {
        const data = await res.json()
        setConfiguracoes(data)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const carregarAgendamentos = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/agendamentos?data=${dataSelecionada}`)
      if (res.ok) {
        const data = await res.json()
        setAgendamentos(data)
      } else {
        toast.error('Erro ao carregar agendamentos')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }

  const confirmarAgendamento = async (id: string) => {
    try {
      const res = await fetch(`/api/agendamentos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMADO' })
      })

      if (res.ok) {
        toast.success('Agendamento confirmado!')
        carregarAgendamentos()
      } else {
        toast.error('Erro ao confirmar agendamento')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao confirmar agendamento')
    }
  }

  const cancelarAgendamento = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return

    try {
      const res = await fetch(`/api/agendamentos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELADO' })
      })

      if (res.ok) {
        toast.success('Agendamento cancelado!')
        carregarAgendamentos()
      } else {
        toast.error('Erro ao cancelar agendamento')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao cancelar agendamento')
    }
  }

  const concluirServico = async (id: string) => {
    try {
      const res = await fetch(`/api/agendamentos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REALIZADO' })
      })

      if (res.ok) {
        toast.success('Serviço concluído!')
        carregarAgendamentos()
      } else {
        toast.error('Erro ao concluir serviço')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao concluir serviço')
    }
  }

  const abrirModalLembrete = (agendamento: Agendamento) => {
    if (!configuracoes?.slug) {
      toast.error('Link de agendamento não configurado')
      return
    }
    setAgendamentoSelecionado(agendamento)
    setModalLembreteAberto(true)
  }

  const enviarWhatsAppConfirmacao = (agendamento: Agendamento) => {
    const telefone = agendamento.cliente.telefone.replace(/\D/g, '')
    
    // Formatar data sem conversão UTC - extrair do formato ISO diretamente
    const formatarDataBrasileira = (dataISO: string): string => {
      // Se vier no formato YYYY-MM-DD
      if (dataISO.includes('T')) {
        const data = new Date(dataISO)
        const dia = String(data.getDate()).padStart(2, '0')
        const mes = String(data.getMonth() + 1).padStart(2, '0')
        const ano = data.getFullYear()
        return `${dia}/${mes}/${ano}`
      } else {
        // Se vier só a data YYYY-MM-DD
        const [ano, mes, dia] = dataISO.split('-')
        return `${dia}/${mes}/${ano}`
      }
    }
    
    // Formatar horário sem conversão UTC
    const formatarHorario = (horaISO: string): string => {
      const data = new Date(horaISO)
      const horas = String(data.getHours()).padStart(2, '0')
      const minutos = String(data.getMinutes()).padStart(2, '0')
      return `${horas}:${minutos}`
    }

    const dataFormatada = formatarDataBrasileira(agendamento.data)
    const horaInicio = formatarHorario(agendamento.hora_inicio)

    const mensagem = `Olá ${agendamento.cliente.nome}! 👋\n\n` +
      `✅ Seu agendamento está confirmado:\n\n` +
      `📅 Data: ${dataFormatada}\n` +
      `⏰ Horário: ${horaInicio}\n` +
      `💇 Serviço: ${agendamento.servico.nome}\n` +
      `👤 Profissional: ${agendamento.profissional.nome}\n\n` +
      `Te esperamos! 😊`

    const whatsappUrl = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`
    window.open(whatsappUrl, '_blank')
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      AGENDADO: 'bg-blue-100 text-blue-800',
      CONFIRMADO: 'bg-green-100 text-green-800',
      EM_ANDAMENTO: 'bg-yellow-100 text-yellow-800',
      REALIZADO: 'bg-purple-100 text-purple-800',
      CANCELADO: 'bg-red-100 text-red-800',
      NAO_COMPARECEU: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      AGENDADO: 'Agendado',
      CONFIRMADO: 'Confirmado',
      EM_ANDAMENTO: 'Em Andamento',
      REALIZADO: 'Realizado',
      CANCELADO: 'Cancelado',
      NAO_COMPARECEU: 'Não Compareceu'
    }
    return labels[status] || status
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário e Filtros */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Selecionar Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              className="w-full"
            />

            <Button
              onClick={() => setModalAberto(true)}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Resumo do Dia</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold">{agendamentos.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confirmados:</span>
                  <span className="font-semibold text-green-600">
                    {agendamentos.filter(a => a.status === 'CONFIRMADO').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Agendados:</span>
                  <span className="font-semibold text-blue-600">
                    {agendamentos.filter(a => a.status === 'AGENDADO').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Do Site:</span>
                  <span className="font-semibold text-purple-600">
                    {agendamentos.filter(a => a.origem === 'SITE').length}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Agendamentos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Agendamentos de {new Date(dataSelecionada + 'T12:00:00').toLocaleDateString('pt-BR')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : agendamentos.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum agendamento para esta data</p>
              </div>
            ) : (
              <div className="space-y-3">
                {agendamentos.map((agendamento) => (
                  <div
                    key={agendamento.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {agendamento.cliente.nome}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {agendamento.cliente.telefone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(agendamento.status)}>
                          {getStatusLabel(agendamento.status)}
                        </Badge>
                        {agendamento.origem === 'SITE' && (
                          <Badge variant="outline" className="bg-purple-50">
                            <Globe className="h-3 w-3 mr-1" />
                            Site
                          </Badge>
                        )}
                        {agendamento.origem === 'MANUAL' && (
                          <Badge variant="outline" className="bg-gray-50">
                            <UserPlus className="h-3 w-3 mr-1" />
                            Manual
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>
                          {new Date(agendamento.hora_inicio).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - {new Date(agendamento.hora_fim).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Scissors className="h-4 w-4 text-gray-400" />
                        <span>{agendamento.servico.nome}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{agendamento.profissional.nome}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span>R$ {Number(agendamento.servico.preco).toFixed(2)}</span>
                      </div>
                    </div>

                    {agendamento.observacoes && (
                      <p className="text-sm text-gray-600 mb-3 italic">
                        Obs: {agendamento.observacoes}
                      </p>
                    )}

                    {/* Botões de ação */}
                    <div className="pt-3 border-t space-y-2">
                      {/* Linha 1: Ações principais */}
                      {agendamento.status === 'AGENDADO' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => confirmarAgendamento(agendamento.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => cancelarAgendamento(agendamento.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      )}

                      {agendamento.status === 'CONFIRMADO' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-green-50 hover:bg-green-100"
                            onClick={() => concluirServico(agendamento.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Concluir Serviço
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => cancelarAgendamento(agendamento.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      )}

                      {/* Linha 2: WhatsApp (para agendamentos ativos) */}
                      {(agendamento.status === 'AGENDADO' || agendamento.status === 'CONFIRMADO') && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-blue-50 hover:bg-blue-100"
                            onClick={() => abrirModalLembrete(agendamento)}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Enviar Link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-green-50 hover:bg-green-100"
                            onClick={() => enviarWhatsAppConfirmacao(agendamento)}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Enviar Confirmação
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <NovoAgendamentoModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onSucesso={() => {
          setModalAberto(false)
          carregarAgendamentos()
        }}
        dataInicial={dataSelecionada}
      />

      <EnviarLembreteModal
        aberto={modalLembreteAberto}
        onFechar={() => {
          setModalLembreteAberto(false)
          setAgendamentoSelecionado(null)
        }}
        agendamento={agendamentoSelecionado}
        linkPublico={configuracoes?.slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/agendamento/${configuracoes.slug}` : ''}
      />
    </>
  )
}
