
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Calendar, Clock, User, Scissors, X, CheckCircle2, AlertCircle } from 'lucide-react'

interface AgendamentoData {
  id: string
  data: string
  hora_inicio: string
  hora_fim: string
  status: string
  cliente: {
    nome: string
    telefone: string
    email: string
  }
  salao: {
    nome: string
    logo?: string
    telefone?: string
    endereco?: string
    cor_tema?: string
  }
  profissional: {
    nome: string
  }
  servico: {
    nome: string
    preco: number
    duracao_minutos: number
  }
}

export default function CancelarAgendamentoPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const agendamentoId = params.id as string

  const [agendamento, setAgendamento] = useState<AgendamentoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [cancelando, setCancelando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  // Dados do formulário
  const [nomeCliente, setNomeCliente] = useState('')
  const [telefoneCliente, setTelefoneCliente] = useState('')
  const [emailCliente, setEmailCliente] = useState('')
  const [motivo, setMotivo] = useState('')

  useEffect(() => {
    carregarAgendamento()
  }, [agendamentoId])

  const carregarAgendamento = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`/api/agendamento-publico/salao?slug=${slug}`)
      if (!response.ok) {
        throw new Error('Salão não encontrado')
      }

      const salaoData = await response.json()

      // Buscar agendamento específico
      const agendamentosResponse = await fetch(`/api/agendamentos?salao_id=${salaoData.id}`)
      if (!agendamentosResponse.ok) {
        throw new Error('Erro ao buscar agendamentos')
      }

      const agendamentos = await agendamentosResponse.json()
      const agendamentoEncontrado = agendamentos.find((ag: any) => ag.id === agendamentoId)

      if (!agendamentoEncontrado) {
        setError('Agendamento não encontrado')
        setLoading(false)
        return
      }

      setAgendamento(agendamentoEncontrado)
      setLoading(false)
    } catch (err) {
      console.error('Erro ao carregar agendamento:', err)
      setError('Não foi possível carregar os dados do agendamento')
      setLoading(false)
    }
  }

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr)
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo'
    })
  }

  const formatarHora = (horaStr: string) => {
    const hora = new Date(horaStr)
    return hora.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    })
  }

  const handleCancelar = async () => {
    if (!nomeCliente && !telefoneCliente && !emailCliente) {
      setError('Preencha pelo menos um dado para confirmar sua identidade')
      return
    }

    try {
      setCancelando(true)
      setError('')

      const response = await fetch('/api/agendamento-publico/cancelar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agendamento_id: agendamentoId,
          nome_cliente: nomeCliente,
          telefone_cliente: telefoneCliente,
          email_cliente: emailCliente,
          motivo: motivo
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cancelar agendamento')
      }

      setSucesso(true)
      setShowConfirmation(false)

      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push(`/agendamento/${slug}`)
      }, 3000)

    } catch (err: any) {
      console.error('Erro ao cancelar:', err)
      setError(err.message || 'Erro ao cancelar agendamento')
      setCancelando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !agendamento) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push(`/agendamento/${slug}`)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Cancelamento Confirmado
          </h2>
          <p className="text-gray-600 mb-6">
            Seu agendamento foi cancelado com sucesso. O salão foi notificado.
          </p>
          <div className="text-sm text-gray-500">
            Você será redirecionado em instantes...
          </div>
        </div>
      </div>
    )
  }

  if (!agendamento) {
    return null
  }

  const corTema = agendamento.salao.cor_tema || '#3B82F6'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header do Salão */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-4">
            {agendamento.salao.logo && (
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={agendamento.salao.logo}
                  alt={agendamento.salao.nome}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {agendamento.salao.nome}
              </h1>
              {agendamento.salao.telefone && (
                <p className="text-sm text-gray-600">{agendamento.salao.telefone}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Card do Agendamento */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Detalhes do Agendamento
              </h2>
              {agendamento.status === 'CANCELADO' ? (
                <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                  Cancelado
                </span>
              ) : (
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  Agendado
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* Cliente */}
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Cliente</div>
                  <div className="font-semibold text-gray-900">{agendamento.cliente.nome}</div>
                </div>
              </div>

              {/* Serviço */}
              <div className="flex items-start space-x-3">
                <Scissors className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Serviço</div>
                  <div className="font-semibold text-gray-900">{agendamento.servico.nome}</div>
                  <div className="text-sm text-gray-600">
                    R$ {agendamento.servico.preco.toFixed(2)} • {agendamento.servico.duracao_minutos} min
                  </div>
                </div>
              </div>

              {/* Profissional */}
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Profissional</div>
                  <div className="font-semibold text-gray-900">{agendamento.profissional.nome}</div>
                </div>
              </div>

              {/* Data */}
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Data</div>
                  <div className="font-semibold text-gray-900">{formatarData(agendamento.data)}</div>
                </div>
              </div>

              {/* Horário */}
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Horário</div>
                  <div className="font-semibold text-gray-900">
                    {formatarHora(agendamento.hora_inicio)} às {formatarHora(agendamento.hora_fim)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de Cancelamento */}
          {agendamento.status !== 'CANCELADO' && agendamento.status !== 'REALIZADO' && !showConfirmation && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Cancelar Agendamento
              </h3>

              <p className="text-gray-600 mb-6">
                Para cancelar seu agendamento, confirme pelo menos um dos dados abaixo:
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seu Nome
                  </label>
                  <input
                    type="text"
                    value={nomeCliente}
                    onChange={(e) => setNomeCliente(e.target.value)}
                    placeholder="Digite seu nome completo"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seu Telefone
                  </label>
                  <input
                    type="tel"
                    value={telefoneCliente}
                    onChange={(e) => setTelefoneCliente(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seu E-mail
                  </label>
                  <input
                    type="email"
                    value={emailCliente}
                    onChange={(e) => setEmailCliente(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo (Opcional)
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Conte-nos o motivo do cancelamento..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/agendamento/${slug}`)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setShowConfirmation(true)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Cancelar Agendamento
                </button>
              </div>
            </div>
          )}

          {/* Modal de Confirmação */}
          {showConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
                <div className="text-center mb-6">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Confirmar Cancelamento
                  </h3>
                  <p className="text-gray-600">
                    Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    disabled={cancelando}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Não, voltar
                  </button>
                  <button
                    onClick={handleCancelar}
                    disabled={cancelando}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {cancelando ? 'Cancelando...' : 'Sim, cancelar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Já Cancelado */}
          {agendamento.status === 'CANCELADO' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center">
                <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Agendamento Cancelado
                </h3>
                <p className="text-gray-600 mb-6">
                  Este agendamento já foi cancelado anteriormente.
                </p>
                <button
                  onClick={() => router.push(`/agendamento/${slug}`)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Fazer Novo Agendamento
                </button>
              </div>
            </div>
          )}

          {/* Já Realizado */}
          {agendamento.status === 'REALIZADO' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Serviço Já Realizado
                </h3>
                <p className="text-gray-600 mb-6">
                  Este agendamento já foi realizado e não pode ser cancelado.
                </p>
                <button
                  onClick={() => router.push(`/agendamento/${slug}`)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Fazer Novo Agendamento
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
