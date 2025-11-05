'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, User, Phone } from 'lucide-react'
import { toast } from 'sonner'

interface Profissional {
  id: string
  nome: string
  telefone?: string
  status: string
}

export default function ProfissionaisPage() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Profissional | null>(null)
  
  const [formData, setFormData] = useState({
    nome: '',
    telefone: ''
  })

  useEffect(() => {
    carregarProfissionais()
  }, [])

  async function carregarProfissionais() {
    try {
      setLoading(true)
      const res = await fetch('/api/profissionais')
      if (res.ok) {
        const data = await res.json()
        setProfissionais(data)
      } else {
        toast.error('Erro ao carregar profissionais')
      }
    } catch (error) {
      toast.error('Erro ao carregar profissionais')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function abrirNovo() {
    setEditando(null)
    setFormData({
      nome: '',
      telefone: ''
    })
    setDialogOpen(true)
  }

  function abrirEditar(prof: Profissional) {
    setEditando(prof)
    setFormData({
      nome: prof.nome,
      telefone: prof.telefone || ''
    })
    setDialogOpen(true)
  }

  async function salvar() {
    // Validação
    if (!formData.nome.trim()) {
      toast.error('Informe o nome do profissional')
      return
    }

    try {
      setSalvando(true)
      
      const body = {
        nome: formData.nome.trim(),
        telefone: formData.telefone.trim() || null
      }

      const url = '/api/profissionais'
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

      toast.success(editando ? 'Profissional atualizado com sucesso!' : 'Profissional criado com sucesso!')
      setDialogOpen(false)
      carregarProfissionais()
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error(error.message || 'Erro ao salvar profissional')
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
          <h1 className="text-3xl font-bold text-gray-900">Profissionais</h1>
          <p className="text-gray-600 mt-2">Cadastre e gerencie sua equipe de profissionais</p>
        </div>
        <Button onClick={abrirNovo} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Novo Profissional
        </Button>
      </div>

      {profissionais.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <User className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum profissional cadastrado</h3>
            <p className="text-gray-600 mb-6">Comece criando seu primeiro profissional</p>
            <Button onClick={abrirNovo}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Profissional
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profissionais.map((prof) => (
            <Card key={prof.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold">
                    {prof.nome}
                  </CardTitle>
                  <Badge 
                    variant={prof.status === 'ATIVO' ? 'default' : 'secondary'}
                    className="mt-2"
                  >
                    {prof.status}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => abrirEditar(prof)}
                  className="hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 text-base text-gray-600">
                  <Phone className="h-5 w-5" />
                  <span>{prof.telefone || 'Sem telefone'}</span>
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
              {editando ? 'Editar Profissional' : 'Novo Profissional'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-base font-semibold">
                Nome Completo *
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Maria da Silva"
                className="text-base"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone" className="text-base font-semibold">
                Telefone
              </Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
                className="text-base"
              />
              <p className="text-xs text-gray-500">Campo opcional</p>
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
              {salvando ? 'Salvando...' : 'Salvar Profissional'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
