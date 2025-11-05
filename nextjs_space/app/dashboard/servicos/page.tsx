'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Clock, DollarSign } from 'lucide-react'
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
    preco: '',
    duracao_minutos: '30'
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
      } else {
        toast.error('Erro ao carregar serviços')
      }
    } catch (error) {
      toast.error('Erro ao carregar serviços')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function abrirNovo() {
    setEditando(null)
    setFormData({
      nome: '',
      preco: '',
      duracao_minutos: '30'
    })
    setDialogOpen(true)
  }

  function abrirEditar(servico: Servico) {
    setEditando(servico)
    setFormData({
      nome: servico.nome,
      preco: String(servico.preco),
      duracao_minutos: String(servico.duracao_minutos)
    })
    setDialogOpen(true)
  }

  async function salvar() {
    // Validações
    if (!formData.nome.trim()) {
      toast.error('Informe o nome do serviço')
      return
    }

    const preco = parseFloat(formData.preco)
    if (isNaN(preco) || preco < 0) {
      toast.error('Informe um preço válido')
      return
    }

    const duracao = parseInt(formData.duracao_minutos)
    if (isNaN(duracao) || duracao < 5 || duracao > 480) {
      toast.error('Duração deve estar entre 5 e 480 minutos')
      return
    }

    try {
      setSalvando(true)
      
      const body = {
        nome: formData.nome.trim(),
        preco: preco,
        duracao_minutos: duracao
      }

      const url = '/api/servicos'
      const method = editando ? 'PUT' : 'POST'
      const payload = editando ? { ...body, id: editando.id } : body

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Erro ao salvar')
      }

      toast.success(editando ? 'Serviço atualizado com sucesso!' : 'Serviço criado com sucesso!')
      setDialogOpen(false)
      carregarServicos()
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error(error.message || 'Erro ao salvar serviço')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-600 mt-2">Cadastre e gerencie os serviços do seu estabelecimento</p>
        </div>
        <Button onClick={abrirNovo} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Novo Serviço
        </Button>
      </div>

      {servicos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Clock className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum serviço cadastrado</h3>
            <p className="text-gray-600 mb-6">Comece criando seu primeiro serviço</p>
            <Button onClick={abrirNovo}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Serviço
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {servicos.map((servico) => (
            <Card key={servico.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold">
                    {servico.nome}
                  </CardTitle>
                  <Badge 
                    variant={servico.status === 'ATIVO' ? 'default' : 'secondary'}
                    className="mt-2"
                  >
                    {servico.status}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => abrirEditar(servico)}
                  className="hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-base">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-600">
                      R$ {Number(servico.preco).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-base text-gray-600">
                    <Clock className="h-5 w-5" />
                    <span>{servico.duracao_minutos} minutos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editando ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-base font-semibold">
                Nome do Serviço *
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Corte de Cabelo, Manicure, etc."
                className="text-base"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preco" className="text-base font-semibold">
                  Preço (R$) *
                </Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                  placeholder="0.00"
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracao" className="text-base font-semibold">
                  Duração (min) *
                </Label>
                <Input
                  id="duracao"
                  type="number"
                  min="5"
                  max="480"
                  value={formData.duracao_minutos}
                  onChange={(e) => setFormData({ ...formData, duracao_minutos: e.target.value })}
                  placeholder="30"
                  className="text-base"
                />
              </div>
            </div>

            <p className="text-sm text-gray-500">
              * Campos obrigatórios
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={salvando}
              size="lg"
            >
              Cancelar
            </Button>
            <Button 
              onClick={salvar} 
              disabled={salvando}
              size="lg"
            >
              {salvando ? 'Salvando...' : 'Salvar Serviço'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
