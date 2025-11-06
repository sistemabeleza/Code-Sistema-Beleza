
'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Loader2, Plus, UserPlus, X } from 'lucide-react'

interface Cliente {
  id: string
  nome: string
  telefone: string
}

interface Profissional {
  id: string
  nome: string
}

interface Servico {
  id: string
  nome: string
  preco: number
  duracao_minutos: number
}

interface Props {
  aberto: boolean
  onFechar: () => void
  onSucesso: () => void
  dataInicial: string
}

export default function NovoAgendamentoModal({
  aberto,
  onFechar,
  onSucesso,
  dataInicial
}: Props) {
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [mostrarFormNovoCliente, setMostrarFormNovoCliente] = useState(false)
  const [loadingNovoCliente, setLoadingNovoCliente] = useState(false)

  const [formData, setFormData] = useState({
    cliente_id: '',
    profissional_id: '',
    servico_id: '',
    data: dataInicial,
    hora_inicio: '',
    observacoes: ''
  })

  const [novoClienteData, setNovoClienteData] = useState({
    nome: '',
    telefone: '',
    email: ''
  })

  useEffect(() => {
    if (aberto) {
      carregarDados()
      setFormData(prev => ({ ...prev, data: dataInicial }))
    }
  }, [aberto, dataInicial])

  const carregarDados = async () => {
    try {
      const [clientesRes, profissionaisRes, servicosRes] = await Promise.all([
        fetch('/api/clientes'),
        fetch('/api/profissionais'),
        fetch('/api/servicos')
      ])

      if (clientesRes.ok) {
        const data = await clientesRes.json()
        setClientes(data)
      }

      if (profissionaisRes.ok) {
        const data = await profissionaisRes.json()
        setProfissionais(data)
      }

      if (servicosRes.ok) {
        const data = await servicosRes.json()
        setServicos(data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const handleCriarNovoCliente = async () => {
    if (!novoClienteData.nome || !novoClienteData.telefone) {
      toast.error('Nome e telefone são obrigatórios')
      return
    }

    setLoadingNovoCliente(true)
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoClienteData)
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Cliente cadastrado com sucesso!')
        // Adiciona o novo cliente à lista
        setClientes(prev => [...prev, data])
        // Seleciona o novo cliente
        setFormData(prev => ({ ...prev, cliente_id: data.id }))
        // Limpa o formulário e fecha
        setNovoClienteData({ nome: '', telefone: '', email: '' })
        setMostrarFormNovoCliente(false)
      } else {
        toast.error(data.error || 'Erro ao cadastrar cliente')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao cadastrar cliente')
    } finally {
      setLoadingNovoCliente(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.cliente_id || !formData.profissional_id || !formData.servico_id || !formData.data || !formData.hora_inicio) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Agendamento criado com sucesso!')
        setFormData({
          cliente_id: '',
          profissional_id: '',
          servico_id: '',
          data: dataInicial,
          hora_inicio: '',
          observacoes: ''
        })
        onSucesso()
      } else {
        toast.error(data.error || 'Erro ao criar agendamento')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao criar agendamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Agendamento Manual</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cliente">Cliente*</Label>
                {!mostrarFormNovoCliente && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMostrarFormNovoCliente(true)}
                    className="h-7 text-xs"
                  >
                    <UserPlus className="mr-1 h-3 w-3" />
                    Novo Cliente
                  </Button>
                )}
              </div>

              {!mostrarFormNovoCliente ? (
                <Select
                  value={formData.cliente_id || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cliente_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome} - {cliente.telefone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="border rounded-lg p-3 bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Cadastrar Novo Cliente</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMostrarFormNovoCliente(false)
                        setNovoClienteData({ nome: '', telefone: '', email: '' })
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Nome*</Label>
                      <Input
                        value={novoClienteData.nome}
                        onChange={(e) =>
                          setNovoClienteData({ ...novoClienteData, nome: e.target.value })
                        }
                        placeholder="Nome completo"
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Telefone*</Label>
                      <Input
                        value={novoClienteData.telefone}
                        onChange={(e) =>
                          setNovoClienteData({ ...novoClienteData, telefone: e.target.value })
                        }
                        placeholder="(00) 00000-0000"
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Email (opcional)</Label>
                      <Input
                        type="email"
                        value={novoClienteData.email}
                        onChange={(e) =>
                          setNovoClienteData({ ...novoClienteData, email: e.target.value })
                        }
                        placeholder="email@exemplo.com"
                        className="h-8"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleCriarNovoCliente}
                      disabled={loadingNovoCliente}
                      className="w-full h-8"
                      size="sm"
                    >
                      {loadingNovoCliente ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-3 w-3" />
                          Salvar Cliente
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profissional">Profissional*</Label>
              <Select
                value={formData.profissional_id || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, profissional_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um profissional" />
                </SelectTrigger>
                <SelectContent>
                  {profissionais.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="servico">Serviço*</Label>
              <Select
                value={formData.servico_id || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, servico_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {servicos.map((servico) => (
                    <SelectItem key={servico.id} value={servico.id}>
                      {servico.nome} - R$ {Number(servico.preco).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">Data*</Label>
              <Input
                type="date"
                id="data"
                value={formData.data}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) =>
                  setFormData({ ...formData, data: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora_inicio">Horário de Início*</Label>
              <Input
                type="time"
                id="hora_inicio"
                value={formData.hora_inicio}
                onChange={(e) =>
                  setFormData({ ...formData, hora_inicio: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              placeholder="Observações sobre o agendamento..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onFechar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Agendamento
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
