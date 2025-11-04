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
import { Clock, DollarSign, Instagram, MessageCircle, ChevronLeft, Check } from 'lucide-react'
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
          <div className="flex items-center justify-between">
            <div>
              {salao.logo && (
                <img src={salao.logo} alt={salao.nome} className="h-12 mb-2" />
              )}
              <h1 className="text-2xl font-bold">{salao.nome}</h1>
              {salao.descricao && (
                <p className="text-muted-foreground text-sm">{salao.descricao}</p>
              )}
            </div>
            <div className="flex gap-2">
              {salao.instagram_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={salao.instagram_url} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {salao.whatsapp_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={salao.whatsapp_url} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb de progresso */}
        {step !== 'sucesso' && (
          <div className="mb-6 flex items-center justify-center gap-2 text-sm">
            <Badge variant={step === 'servico' ? 'default' : 'secondary'}>1. Serviço</Badge>
            <span>→</span>
            <Badge variant={step === 'profissional' ? 'default' : 'secondary'}>2. Profissional</Badge>
            <span>→</span>
            <Badge variant={step === 'data' || step === 'horario' ? 'default' : 'secondary'}>3. Data/Hora</Badge>
            <span>→</span>
            <Badge variant={step === 'dados' ? 'default' : 'secondary'}>4. Confirmação</Badge>
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
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                {slots.map((slot) => (
                  <Button
                    key={slot}
                    variant="outline"
                    onClick={() => selecionarHorario(slot)}
                    className="h-12"
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
                <Button onClick={() => window.location.reload()} variant="outline">
                  Fazer Novo Agendamento
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
