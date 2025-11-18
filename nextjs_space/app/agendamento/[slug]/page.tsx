'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'
import { Clock, DollarSign, Instagram, MessageCircle, ChevronLeft, Check, XCircle, Search } from 'lucide-react'
import { ptBR } from 'date-fns/locale'

interface Salao {
  id: string
  nome: string
  descricao?: string
  logo?: string
  foto_1?: string
  instagram_url?: string
  whatsapp_url?: string
  cor_tema?: string
}

interface Servico {
  id: string
  nome: string
  descricao?: string
  preco: number
  duracao_minutos: number
  categoria?: string
}

interface Profissional {
  id: string
  nome: string
  bio?: string
  foto?: string
  especialidade?: string
}

type Step = 'servico' | 'profissional' | 'data' | 'horario' | 'dados' | 'sucesso'

export default function AgendamentoPublicoPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [step, setStep] = useState<Step>('servico')
  const [salao, setSalao] = useState<Salao | null>(null)
  const [servicos, setServicos] = useState<Servico[]>([])
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [slots, setSlots] = useState<string[]>([])
  
  const [selectedServico, setSelectedServico] = useState<Servico | null>(null)
  const [selectedProfissional, setSelectedProfissional] = useState<Profissional | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [agendamentoId, setAgendamentoId] = useState<string | null>(null)
  
  // Estados para cancelamento
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelSearchName, setCancelSearchName] = useState('')
  const [cancelSearchPhone, setCancelSearchPhone] = useState('')
  const [searchingAppointments, setSearchingAppointments] = useState(false)
  const [foundAppointments, setFoundAppointments] = useState<any[]>([])
  const [selectedAppointmentToCancel, setSelectedAppointmentToCancel] = useState<any>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (slug) {
      carregarSalao()
    }
  }, [slug])

  async function carregarSalao() {
    try {
      const res = await fetch(`/api/public/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setSalao(data)
        carregarServicos()
      } else {
        toast.error('Salão não encontrado')
      }
    } catch (error) {
      toast.error('Erro ao carregar informações')
    } finally {
      setLoading(false)
    }
  }

  async function carregarServicos() {
    try {
      const res = await fetch(`/api/public/${slug}/servicos`)
      if (res.ok) {
        const data = await res.json()
        setServicos(data)
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    }
  }

  async function carregarProfissionais(servicoId: string) {
    try {
      const res = await fetch(`/api/public/${slug}/profissionais?servico_id=${servicoId}`)
      if (res.ok) {
        const data = await res.json()
        setProfissionais(data)
      }
    } catch (error) {
      toast.error('Erro ao carregar profissionais')
    }
  }

  async function carregarDisponibilidade(date: Date) {
    if (!selectedServico || !selectedProfissional) return

    try {
      setLoadingSlots(true)
      const dateStr = date.toISOString().split('T')[0]
      const res = await fetch(
        `/api/public/${slug}/disponibilidade?servico_id=${selectedServico.id}&profissional_id=${selectedProfissional.id}&date=${dateStr}`
      )
      
      if (res.ok) {
        const data = await res.json()
        setSlots(data.slots || [])
        if (data.slots.length === 0) {
          toast.info('Nenhum horário disponível nesta data')
        }
      }
    } catch (error) {
      toast.error('Erro ao carregar horários')
    } finally {
      setLoadingSlots(false)
    }
  }

  function selecionarServico(servico: Servico) {
    setSelectedServico(servico)
    carregarProfissionais(servico.id)
    setStep('profissional')
  }

  function selecionarProfissional(prof: Profissional) {
    setSelectedProfissional(prof)
    setStep('data')
  }

  function selecionarData(date: Date | undefined) {
    if (!date) return
    setSelectedDate(date)
    setSelectedSlot(null)
    carregarDisponibilidade(date)
    setStep('horario')
  }

  function selecionarHorario(slot: string) {
    setSelectedSlot(slot)
    setStep('dados')
  }

  async function confirmarAgendamento() {
    if (!customerName || !customerPhone) {
      toast.error('Nome e telefone são obrigatórios')
      return
    }

    if (!selectedServico || !selectedProfissional || !selectedDate || !selectedSlot) {
      toast.error('Selecione todos os dados do agendamento')
      return
    }

    try {
      setSubmitting(true)
      
      const [hours, minutes] = selectedSlot.split(':')
      const startDatetime = new Date(selectedDate)
      startDatetime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      const res = await fetch(`/api/public/${slug}/agendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servico_id: selectedServico.id,
          profissional_id: selectedProfissional.id,
          start_datetime: startDatetime.toISOString(),
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || undefined
        })
      })

      if (res.ok) {
        const agendamento = await res.json()
        setAgendamentoId(agendamento.id)
        setStep('sucesso')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Erro ao criar agendamento')
      }
    } catch (error) {
      toast.error('Erro ao confirmar agendamento')
    } finally {
      setSubmitting(false)
    }
  }

  function voltar() {
    if (step === 'profissional') setStep('servico')
    else if (step === 'data') setStep('profissional')
    else if (step === 'horario') setStep('data')
    else if (step === 'dados') setStep('horario')
  }

  function formatarPreco(preco: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(preco))
  }

  function formatarDuracao(minutos: number) {
    if (minutos < 60) return `${minutos}min`
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`
  }

  async function buscarAgendamentos() {
    if (!cancelSearchName && !cancelSearchPhone) {
      toast.error('Preencha seu nome ou telefone')
      return
    }

    try {
      setSearchingAppointments(true)
      setFoundAppointments([])
      
      const res = await fetch('/api/agendamento-publico/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          nome_cliente: cancelSearchName,
          telefone_cliente: cancelSearchPhone
        })
      })

      const data = await res.json()

      if (res.ok) {
        setFoundAppointments(data)
        if (data.length === 0) {
          toast.info('Você não possui agendamentos ativos')
        }
      } else {
        toast.error(data.error || 'Erro ao buscar agendamentos')
      }
    } catch (error) {
      toast.error('Erro ao buscar agendamentos')
    } finally {
      setSearchingAppointments(false)
    }
  }

  async function confirmarCancelamento() {
    if (!selectedAppointmentToCancel) return

    try {
      setCancelling(true)

      const res = await fetch('/api/agendamento-publico/cancelar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agendamento_id: selectedAppointmentToCancel.id,
          nome_cliente: cancelSearchName,
          telefone_cliente: cancelSearchPhone,
          motivo: cancelReason
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Agendamento cancelado com sucesso!')
        setShowCancelModal(false)
        setCancelSearchName('')
        setCancelSearchPhone('')
        setCancelReason('')
        setFoundAppointments([])
        setSelectedAppointmentToCancel(null)
      } else {
        toast.error(data.error || 'Erro ao cancelar agendamento')
      }
    } catch (error) {
      toast.error('Erro ao cancelar agendamento')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!salao) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Salão não encontrado</h2>
            <p className="text-muted-foreground">Verifique o link e tente novamente</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              {salao.logo && (
                <img src={salao.logo} alt={salao.nome} className="h-12 mb-2" />
              )}
              <h1 className="text-2xl font-bold">{salao.nome}</h1>
              {salao.descricao && (
                <p className="text-muted-foreground text-sm">{salao.descricao}</p>
              )}
            </div>
            <div className="flex gap-2 items-center">
              {/* Botão Discreto de Cancelamento */}
              <button
                onClick={() => setShowCancelModal(true)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors underline"
              >
                Cancelar agendamento
              </button>
              
              {salao.instagram_url && (
                <a 
                  href={salao.instagram_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md h-10 w-10 transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                    color: 'white'
                  }}
                  title="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {salao.whatsapp_url && (
                <a 
                  href={salao.whatsapp_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md h-10 w-10 transition-all hover:scale-105"
                  style={{
                    background: '#25D366',
                    color: 'white'
                  }}
                  title="WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb de progresso */}
        {step !== 'sucesso' && (
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
            <Badge variant={step === 'servico' ? 'default' : 'secondary'} className="whitespace-nowrap">1. Serviço</Badge>
            <span className="hidden sm:inline">→</span>
            <Badge variant={step === 'profissional' ? 'default' : 'secondary'} className="whitespace-nowrap">2. Profissional</Badge>
            <span className="hidden sm:inline">→</span>
            <Badge variant={step === 'data' || step === 'horario' ? 'default' : 'secondary'} className="whitespace-nowrap">3. Data/Hora</Badge>
            <span className="hidden sm:inline">→</span>
            <Badge variant={step === 'dados' ? 'default' : 'secondary'} className="whitespace-nowrap">4. Confirmação</Badge>
          </div>
        )}

        {/* Botão voltar */}
        {step !== 'servico' && step !== 'sucesso' && (
          <Button variant="ghost" onClick={voltar} className="mb-4">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Voltar
          </Button>
        )}

        {/* Etapa: Seleção de Serviço */}
        {step === 'servico' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Escolha o serviço</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {servicos.map((servico) => (
                <Card 
                  key={servico.id} 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => selecionarServico(servico)}
                >
                  <CardHeader>
                    <CardTitle>{servico.nome}</CardTitle>
                    {servico.categoria && <CardDescription>{servico.categoria}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    {servico.descricao && (
                      <p className="text-sm text-muted-foreground mb-3">{servico.descricao}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-green-600 font-semibold">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatarPreco(servico.preco)}
                      </div>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatarDuracao(servico.duracao_minutos)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Etapa: Seleção de Profissional */}
        {step === 'profissional' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Escolha o profissional</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {profissionais.map((prof) => (
                <Card 
                  key={prof.id} 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => selecionarProfissional(prof)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {prof.foto ? (
                        <img src={prof.foto} alt={prof.nome} className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">{prof.nome[0]}</span>
                        </div>
                      )}
                      <div>
                        <CardTitle>{prof.nome}</CardTitle>
                        {prof.especialidade && <CardDescription>{prof.especialidade}</CardDescription>}
                      </div>
                    </div>
                  </CardHeader>
                  {prof.bio && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{prof.bio}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Etapa: Seleção de Data */}
        {step === 'data' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Escolha a data</h2>
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={selecionarData}
                  locale={ptBR}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Etapa: Seleção de Horário */}
        {step === 'horario' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Escolha o horário</h2>
            {loadingSlots ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Carregando horários...</p>
              </div>
            ) : slots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 max-w-2xl mx-auto">
                {slots.map((slot) => (
                  <Button
                    key={slot}
                    variant="outline"
                    onClick={() => selecionarHorario(slot)}
                    className="h-12 text-sm sm:text-base"
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            ) : (
              <Card className="max-w-md mx-auto">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Nenhum horário disponível para esta data</p>
                  <Button variant="outline" onClick={() => setStep('data')} className="mt-4">
                    Escolher outra data
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Etapa: Dados do Cliente */}
        {step === 'dados' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Confirme seus dados</h2>
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6 space-y-4">
                <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
                  <p><strong>Serviço:</strong> {selectedServico?.nome}</p>
                  <p><strong>Profissional:</strong> {selectedProfissional?.nome}</p>
                  <p><strong>Data:</strong> {selectedDate?.toLocaleDateString('pt-BR')}</p>
                  <p><strong>Horário:</strong> {selectedSlot}</p>
                  <p><strong>Valor:</strong> {selectedServico && formatarPreco(selectedServico.preco)}</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Seu nome"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail (opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={confirmarAgendamento}
                  disabled={submitting}
                >
                  {submitting ? 'Confirmando...' : 'Confirmar Agendamento'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Etapa: Sucesso */}
        {step === 'sucesso' && (
          <div>
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6 text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Agendamento Confirmado!</h2>
                <p className="text-muted-foreground mb-6">
                  Seu agendamento foi realizado com sucesso. Em breve você receberá uma confirmação.
                </p>
                <div className="bg-muted p-4 rounded-md space-y-2 text-sm text-left mb-6">
                  <p><strong>Serviço:</strong> {selectedServico?.nome}</p>
                  <p><strong>Profissional:</strong> {selectedProfissional?.nome}</p>
                  <p><strong>Data:</strong> {selectedDate?.toLocaleDateString('pt-BR')}</p>
                  <p><strong>Horário:</strong> {selectedSlot}</p>
                </div>
                
                <div className="space-y-3">
                  {agendamentoId && (
                    <Button 
                      onClick={() => window.location.href = `/agendamento/${slug}/cancelar/${agendamentoId}`}
                      variant="destructive"
                      className="w-full"
                    >
                      Cancelar este Agendamento
                    </Button>
                  )}
                  <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                    Fazer Novo Agendamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modal de Cancelamento */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  Cancelar Agendamento
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCancelModal(false)
                    setCancelSearchName('')
                    setCancelSearchPhone('')
                    setFoundAppointments([])
                    setSelectedAppointmentToCancel(null)
                  }}
                >
                  ✕
                </Button>
              </div>
              <CardDescription>
                Digite seu nome ou telefone para encontrar seus agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulário de Busca */}
              {!selectedAppointmentToCancel && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cancel-name">Seu Nome</Label>
                      <Input
                        id="cancel-name"
                        value={cancelSearchName}
                        onChange={(e) => setCancelSearchName(e.target.value)}
                        placeholder="Digite seu nome"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cancel-phone">Seu Telefone</Label>
                      <Input
                        id="cancel-phone"
                        value={cancelSearchPhone}
                        onChange={(e) => setCancelSearchPhone(e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={buscarAgendamentos}
                    disabled={searchingAppointments}
                    className="w-full"
                  >
                    {searchingAppointments ? (
                      <>Buscando...</>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Buscar Meus Agendamentos
                      </>
                    )}
                  </Button>

                  {/* Lista de Agendamentos Encontrados */}
                  {foundAppointments.length > 0 && (
                    <div className="space-y-3 mt-6">
                      <h3 className="font-semibold text-sm">Seus agendamentos:</h3>
                      {foundAppointments.map((agendamento) => (
                        <Card 
                          key={agendamento.id}
                          className="cursor-pointer hover:border-primary transition-colors"
                          onClick={() => setSelectedAppointmentToCancel(agendamento)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-1">
                                <div className="font-semibold">{agendamento.servico.nome}</div>
                                <div className="text-sm text-muted-foreground">
                                  {agendamento.profissional.nome}
                                </div>
                                <div className="text-sm">
                                  📅 {new Date(agendamento.data).toLocaleDateString('pt-BR')}
                                  {' às '}
                                  {new Date(agendamento.hora_inicio).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                                <div className="text-sm text-green-600 font-semibold">
                                  {formatarPreco(agendamento.servico.preco)}
                                </div>
                              </div>
                              <Badge variant="default">{agendamento.status}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Confirmação de Cancelamento */}
              {selectedAppointmentToCancel && (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <h3 className="font-semibold">Confirmar cancelamento:</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Serviço:</strong> {selectedAppointmentToCancel.servico.nome}</p>
                      <p><strong>Profissional:</strong> {selectedAppointmentToCancel.profissional.nome}</p>
                      <p><strong>Data:</strong> {new Date(selectedAppointmentToCancel.data).toLocaleDateString('pt-BR')}</p>
                      <p><strong>Horário:</strong> {new Date(selectedAppointmentToCancel.hora_inicio).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cancel-reason">Motivo do cancelamento (opcional)</Label>
                    <Input
                      id="cancel-reason"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Conte-nos o motivo..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedAppointmentToCancel(null)
                        setCancelReason('')
                      }}
                      className="flex-1"
                    >
                      Voltar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={confirmarCancelamento}
                      disabled={cancelling}
                      className="flex-1"
                    >
                      {cancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
