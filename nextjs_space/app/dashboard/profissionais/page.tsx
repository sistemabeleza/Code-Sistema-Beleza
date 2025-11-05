'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, User } from 'lucide-react'
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
      }
    } catch (error) {
      toast.error('Erro ao carregar profissionais')
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
    if (!formData.nome.trim()) {
      toast.error('Informe o nome do profissional')
      return
    }

    try {
      setSalvando(true)
      const url = '/api/profissionais'
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

      toast.success(editando ? 'Profissional atualizado!' : 'Profissional criado!')
      setDialogOpen(false)
      carregarProfissionais()
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
          <h1 className="text-3xl font-bold">Profissionais</h1>
          <p className="text-gray-600 mt-1">Gerencie sua equipe de profissionais</p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Profissional
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profissionais.map((prof) => (
          <Card key={prof.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {prof.nome}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => abrirEditar(prof)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                {prof.telefone || 'Sem telefone'}
              </div>
              <Badge variant={prof.status === 'ATIVO' ? 'default' : 'secondary'} className="mt-2">
                {prof.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {profissionais.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            Nenhum profissional cadastrado ainda. Clique em "Novo Profissional" para começar.
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editando ? 'Editar Profissional' : 'Novo Profissional'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do profissional"
              />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
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
