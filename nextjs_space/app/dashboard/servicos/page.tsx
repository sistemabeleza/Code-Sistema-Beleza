'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Scissors, Clock, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Servico {
  id: string
  nome: string
  descricao?: string
  preco: number
  duracao_minutos: number
  categoria?: string
  status: string
  profissionais?: any[]
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Servico | null>(null)
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: 0,
    duracao_minutos: 30,
    categoria: '',
    status: 'ATIVO'
  })

  useEffect(() => {
    carregarServicos()
  }, [])

  async function carregarServicos() {
    try {
      setLoading(true)
      const res = await fetch('/api/servicos?includeInactive=true')
      if (res.ok) {
        const data = await res.json()
        setServicos(data)
      }
    } catch (error) {
      toast.error('Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }

  function abrirNovo() {
    setEditando(null)
    setFormData({
      nome: '',
      descricao: '',
      preco: 0,
      duracao_minutos: 30,
      categoria: '',
      status: 'ATIVO'
    })
    setDialogOpen(true)
  }

  function abrirEditar(servico: Servico) {
    setEditando(servico)
    setFormData({
      nome: servico.nome,
      descricao: servico.descricao || '',
      preco: Number(servico.preco),
      duracao_minutos: servico.duracao_minutos,
      categoria: servico.categoria || '',
      status: servico.status
    })
    setDialogOpen(true)
  }

  async function salvar() {
    if (!formData.nome || formData.nome.trim() === '') {
      toast.error('Informe o nome do serviço.')
      return
    }

    if (!formData.duracao_minutos) {
      toast.error('Informe a duração do serviço em minutos.')
      return
    }

    if (formData.duracao_minutos < 5 || formData.duracao_minutos > 480) {
      toast.error('Duração deve estar entre 5 e 480 minutos.')
      return
    }

    if (formData.preco === undefined || formData.preco === null || formData.preco < 0) {
      toast.error('Informe o preço do serviço.')
      return
    }

    try {
      const payload = {
        ...formData,
        ...(editando ? { id: editando.id } : {})
      }

      const res = await fetch('/api/servicos', {
        method: editando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success(editando ? 'Serviço atualizado com sucesso!' : 'Serviço criado com sucesso!')
        setDialogOpen(false)
        carregarServicos()
      } else {
        const error = await res.json()
        toast.error(error.message || error.error || 'Erro ao salvar')
      }
    } catch (error) {
      toast.error('Erro ao salvar serviço')
    }
  }

  async function desativar(id: string) {
    if (!confirm('Deseja realmente desativar este serviço?')) return

    try {
      const res = await fetch(`/api/servicos?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Serviço desativado!')
        carregarServicos()
      } else {
        toast.error('Erro ao desativar')
      }
    } catch (error) {
      toast.error('Erro ao desativar serviço')
    }
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando serviços...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
          <p className="text-muted-foreground">Gerencie os serviços oferecidos</p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {servicos.map((servico) => (
          <Card key={servico.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{servico.nome}</CardTitle>
                  {servico.categoria && (
                    <CardDescription>{servico.categoria}</CardDescription>
                  )}
                </div>
                <Badge variant={servico.status === 'ATIVO' ? 'default' : 'secondary'}>
                  {servico.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {servico.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">{servico.descricao}</p>
              )}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-green-600">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span className="font-semibold">{formatarPreco(servico.preco)}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{formatarDuracao(servico.duracao_minutos)}</span>
                </div>
              </div>
              {servico.profissionais && servico.profissionais.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {servico.profissionais.length} profissional(is)
                  </p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => abrirEditar(servico)} className="flex-1">
                  <Edit className="mr-1 h-3 w-3" />
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => desativar(servico.id)}
                  disabled={servico.status === 'INATIVO'}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {servicos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Scissors className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum serviço cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-4">Comece adicionando seu primeiro serviço</p>
            <Button onClick={abrirNovo}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Serviço
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar' : 'Novo'} Serviço</DialogTitle>
            <DialogDescription>
              Preencha os dados do serviço
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Corte Feminino"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva o serviço..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preco">Preço (R$) *</Label>
                <Input
                  id="preco"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.preco}
                  onChange={(e) => setFormData(prev => ({ ...prev, preco: Number(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (min) *</Label>
                <Input
                  id="duracao"
                  type="number"
                  min="5"
                  max="480"
                  step="5"
                  value={formData.duracao_minutos}
                  onChange={(e) => setFormData(prev => ({ ...prev, duracao_minutos: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                id="categoria"
                value={formData.categoria}
                onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                placeholder="Ex: Cabelo, Unha, Estética"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ATIVO">Ativo</SelectItem>
                  <SelectItem value="INATIVO">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={salvar}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
