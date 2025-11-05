'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Scissors, Clock, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

interface Servico {
  id: string
  nome: string
  preco: number
  duracao_minutos: number
  status: string
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Servico | null>(null)
  
  const [formData, setFormData] = useState({
    nome: '',
    preco: 0,
    duracao_minutos: 30
  })

  useEffect(() => {
    carregarServicos()
  }, [])

  async function carregarServicos() {
    try {
      setLoading(true)
      const res = await fetch('/api/servicos')
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
      preco: 0,
      duracao_minutos: 30
    })
    setDialogOpen(true)
  }

  function abrirEditar(servico: Servico) {
    setEditando(servico)
    setFormData({
      nome: servico.nome,
      preco: Number(servico.preco),
      duracao_minutos: servico.duracao_minutos
    })
    setDialogOpen(true)
  }

  async function salvar() {
    if (!formData.nome.trim()) {
      toast.error('Informe o nome do serviço')
      return
    }

    if (formData.preco < 0) {
      toast.error('Informe o preço do serviço')
      return
    }

    if (formData.duracao_minutos < 5 || formData.duracao_minutos > 480) {
      toast.error('Duração deve estar entre 5 e 480 minutos')
      return
    }

    try {
      setSalvando(true)
      const url = '/api/servicos'
      const method = editando ? 'PUT' : 'POST'
      const body = editando 
        ? { ...formData, id: editando.id }
        : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao salvar')
      }

      toast.success(editando ? 'Serviço atualizado!' : 'Serviço criado!')
      setDialogOpen(false)
      carregarServicos()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Serviços</h1>
          <p className="text-gray-600 mt-1">Gerencie os serviços oferecidos</p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {servicos.map((servico) => (
          <Card key={servico.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {servico.nome}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => abrirEditar(servico)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  R$ {Number(servico.preco).toFixed(2)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {servico.duracao_minutos} minutos
                </div>
                <Badge variant={servico.status === 'ATIVO' ? 'default' : 'secondary'}>
                  {servico.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {servicos.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            Nenhum serviço cadastrado ainda. Clique em "Novo Serviço" para começar.
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editando ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nome">Nome do Serviço *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Corte de Cabelo"
              />
            </div>

            <div>
              <Label htmlFor="preco">Preço (R$) *</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                min="0"
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="duracao">Duração (minutos) *</Label>
              <Input
                id="duracao"
                type="number"
                min="5"
                max="480"
                value={formData.duracao_minutos}
                onChange={(e) => setFormData({ ...formData, duracao_minutos: parseInt(e.target.value) || 30 })}
                placeholder="30"
              />
              <p className="text-xs text-gray-500 mt-1">Entre 5 e 480 minutos</p>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
