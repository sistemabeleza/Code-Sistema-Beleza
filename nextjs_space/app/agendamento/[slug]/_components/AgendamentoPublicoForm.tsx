
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Scissors,
  CheckCircle2,
  Loader2,
  MapPin,
  Clock3,
  Building2
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Servico {
  id: string
  nome: string
  preco: number | any
  duracao_minutos: number
  descricao?: string | null
}

interface Profissional {
  id: string
  nome: string
  foto?: string | null
}

interface Salao {
  id: string
  nome: string
  slug?: string | null
  telefone?: string | null
  email?: string | null
  endereco?: string | null
  horario_funcionamento?: string | null
  descricao?: string | null
  logo?: string | null
  foto_1?: string | null
  foto_2?: string | null
  cor_tema?: string | null
  servicos: Servico[]
  profissionais: Profissional[]
}

interface Props {
  salao: Salao
}

export default function AgendamentoPublicoForm({ salao }: Props) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingHorarios, setLoadingHorarios] = useState(false)
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([])
  const [concluido, setConcluido] = useState(false)
  const [agendamentoId, setAgendamentoId] = useState<string>('')

  const [formData, setFormData] = useState({
    nome_cliente: '',
    telefone_cliente: '',
    email_cliente: '',
    servico_id: '',
    profissional_id: '',
    data: '',
    horario: '',
    observacoes: ''
  })

  const servicoSelecionado = salao.servicos.find(s => s.id === formData.servico_id)
  const profissionalSelecionado = salao.profissionais.find(p => p.id === formData.profissional_id)

  // Função para formatar data no padrão brasileiro (DD/MM/YYYY)
  const formatarDataBrasileira = (dataString: string): string => {
    if (!dataString) return ''
    // Garantir que a data seja interpretada como local (não UTC)
    const [ano, mes, dia] = dataString.split('-')
    return `${dia}/${mes}/${ano}`
  }

  const buscarHorariosDisponiveis = async () => {
    if (!formData.servico_id || !formData.profissional_id || !formData.data) return

    setLoadingHorarios(true)
    try {
      const params = new URLSearchParams({
        salao_id: salao.id,
        profissional_id: formData.profissional_id,
        servico_id: formData.servico_id,
        data: formData.data
      })

      const res = await fetch(`/api/agendamento-publico/horarios-disponiveis?${params}`)
      const data = await res.json()

      if (res.ok) {
        setHorariosDisponiveis(data.horarios || [])
        if (data.horarios?.length === 0) {
          toast.error('Não há horários disponíveis para esta data')
        }
      } else {
        toast.error(data.error || 'Erro ao buscar horários')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao buscar horários disponíveis')
    } finally {
      setLoadingHorarios(false)
    }
  }

  const handleSubmit = async () => {
    // Validações
    if (!formData.nome_cliente || !formData.telefone_cliente) {
      toast.error('Preencha seu nome e telefone')
      return
    }

    if (!formData.servico_id || !formData.profissional_id) {
      toast.error('Selecione um serviço e profissional')
      return
    }

    if (!formData.data || !formData.horario) {
      toast.error('Selecione uma data e horário')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/agendamento-publico/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salao_id: salao.id,
          ...formData
        })
      })

      const data = await res.json()

      if (res.ok) {
        setAgendamentoId(data.agendamento?.id || '')
        setConcluido(true)
        toast.success('Agendamento realizado com sucesso!')
      } else {
        toast.error(data.error || 'Erro ao realizar agendamento')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao realizar agendamento')
    } finally {
      setLoading(false)
    }
  }

  const proximoPasso = () => {
    if (step === 1 && (!formData.servico_id || !formData.profissional_id)) {
      toast.error('Selecione um serviço e profissional')
      return
    }

    if (step === 2 && (!formData.data || !formData.horario)) {
      toast.error('Selecione uma data e horário')
      return
    }

    setStep(step + 1)
  }

  if (concluido) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <Card className="border-2 border-green-200">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Agendamento Confirmado!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Seu agendamento foi realizado com sucesso!
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left space-y-3">
              <div className="flex items-start gap-3">
                <Scissors className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Serviço</p>
                  <p className="font-medium text-gray-900">{servicoSelecionado?.nome}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Profissional</p>
                  <p className="font-medium text-gray-900">{profissionalSelecionado?.nome}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Data e Horário</p>
                  <p className="font-medium text-gray-900">
                    {formatarDataBrasileira(formData.data)} às {formData.horario}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Você receberá uma confirmação em breve. Em caso de dúvidas, entre em contato conosco.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => {
                  setFormData({
                    nome_cliente: '',
                    telefone_cliente: '',
                    email_cliente: '',
                    servico_id: '',
                    profissional_id: '',
                    data: '',
                    horario: '',
                    observacoes: ''
                  })
                  setStep(1)
                  setConcluido(false)
                  setHorariosDisponiveis([])
                  setAgendamentoId('')
                }}
                variant="outline"
              >
                Fazer Novo Agendamento
              </Button>

              {agendamentoId && (
                <Link href={`/agendamento/${salao.slug}/cancelar/${agendamentoId}`}>
                  <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    Cancelar este Agendamento
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header do Salão */}
      <div className="mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              {salao.logo && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 shrink-0">
                  <Image
                    src={`/api/download?key=${encodeURIComponent(salao.logo)}`}
                    alt={salao.nome}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Informações */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{salao.nome}</h1>
                {salao.descricao && (
                  <p className="text-gray-600 mb-4">{salao.descricao}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {salao.endereco && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <span className="text-gray-700">{salao.endereco}</span>
                    </div>
                  )}
                  {salao.telefone && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                      <span className="text-gray-700">{salao.telefone}</span>
                    </div>
                  )}
                  {salao.horario_funcionamento && (
                    <div className="flex items-start gap-2">
                      <Clock3 className="h-4 w-4 text-gray-500 mt-0.5" />
                      <span className="text-gray-700">{salao.horario_funcionamento}</span>
                    </div>
                  )}
                  {salao.email && (
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                      <span className="text-gray-700">{salao.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fotos */}
              {(salao.foto_1 || salao.foto_2) && (
                <div className="flex gap-2">
                  {salao.foto_1 && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image
                        src={`/api/download?key=${encodeURIComponent(salao.foto_1)}`}
                        alt="Foto 1"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  {salao.foto_2 && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image
                        src={`/api/download?key=${encodeURIComponent(salao.foto_2)}`}
                        alt="Foto 2"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > s ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center mt-4 gap-4 text-sm font-medium">
          <span className={step >= 1 ? 'text-blue-600' : 'text-gray-500'}>
            Serviço
          </span>
          <span className={step >= 2 ? 'text-blue-600' : 'text-gray-500'}>
            Data/Hora
          </span>
          <span className={step >= 3 ? 'text-blue-600' : 'text-gray-500'}>
            Seus Dados
          </span>
        </div>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Escolha o Serviço e Profissional'}
            {step === 2 && 'Selecione Data e Horário'}
            {step === 3 && 'Confirme seus Dados'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Serviço e Profissional */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="servico">Serviço*</Label>
                <Select
                  value={formData.servico_id || undefined}
                  onValueChange={(value) => {
                    setFormData({ ...formData, servico_id: value })
                    setHorariosDisponiveis([])
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {salao.servicos.map((servico) => (
                      <SelectItem key={servico.id} value={servico.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{servico.nome}</span>
                          <span className="ml-4 text-sm text-gray-500">
                            R$ {Number(servico.preco).toFixed(2)} • {servico.duracao_minutos}min
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {servicoSelecionado?.descricao && (
                  <p className="text-sm text-gray-500">{servicoSelecionado.descricao}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="profissional">Profissional*</Label>
                <Select
                  value={formData.profissional_id || undefined}
                  onValueChange={(value) => {
                    setFormData({ ...formData, profissional_id: value })
                    setHorariosDisponiveis([])
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {salao.profissionais.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button onClick={proximoPasso}>
                  Próximo
                </Button>
              </div>
            </>
          )}

          {/* Step 2: Data e Horário */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="data">Data*</Label>
                <Input
                  type="date"
                  id="data"
                  value={formData.data}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setFormData({ ...formData, data: e.target.value, horario: '' })
                    setHorariosDisponiveis([])
                  }}
                  onBlur={buscarHorariosDisponiveis}
                />
              </div>

              {loadingHorarios && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Buscando horários...</span>
                </div>
              )}

              {!loadingHorarios && horariosDisponiveis.length > 0 && (
                <div className="space-y-2">
                  <Label>Horário*</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {horariosDisponiveis.map((horario) => (
                      <Button
                        key={horario}
                        variant={formData.horario === horario ? 'default' : 'outline'}
                        onClick={() => setFormData({ ...formData, horario })}
                        className="w-full"
                      >
                        {horario}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {!loadingHorarios && formData.data && horariosDisponiveis.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  Não há horários disponíveis para esta data
                </p>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button onClick={proximoPasso}>
                  Próximo
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Dados do Cliente */}
          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="nome">Seu Nome*</Label>
                <Input
                  id="nome"
                  value={formData.nome_cliente}
                  onChange={(e) => setFormData({ ...formData, nome_cliente: e.target.value })}
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Seu Telefone*</Label>
                <Input
                  id="telefone"
                  value={formData.telefone_cliente}
                  onChange={(e) => setFormData({ ...formData, telefone_cliente: e.target.value })}
                  placeholder="(11) 98888-8888"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Seu E-mail (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email_cliente}
                  onChange={(e) => setFormData({ ...formData, email_cliente: e.target.value })}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações (opcional)</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Alguma observação sobre o agendamento?"
                  rows={3}
                />
              </div>

              {/* Resumo */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-blue-900 mb-3">Resumo do Agendamento</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Serviço:</strong> {servicoSelecionado?.nome}</p>
                  <p><strong>Profissional:</strong> {profissionalSelecionado?.nome}</p>
                  <p><strong>Data:</strong> {formatarDataBrasileira(formData.data)}</p>
                  <p><strong>Horário:</strong> {formData.horario}</p>
                  <p><strong>Valor:</strong> R$ {Number(servicoSelecionado?.preco || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Voltar
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirmar Agendamento
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
