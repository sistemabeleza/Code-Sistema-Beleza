'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, User, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface Profissional {
  id: string
  nome: string
  telefone: string
  email?: string
  cpf?: string
  especialidade?: string
  bio?: string
  comissao_percentual: number
  status: string
  foto?: string
  work_hours?: string
  breaks?: string
  days_off?: string
  servicos?: any[]
}

interface Servico {
  id: string
  nome: string
}

export default function ProfissionaisPage() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Profissional | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    especialidade: '',
    bio: '',
    comissao_percentual: 0,
    status: 'ATIVO',
    servicos: [] as string[]
  })

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      setLoading(true)
      const [profRes, servRes] = await Promise.all([
        fetch('/api/profissionais?includeInactive=true'),
        fetch('/api/servicos')
      ])
      
      if (profRes.ok) {
        const data = await profRes.json()
        setProfissionais(data)
      }
      
      if (servRes.ok) {
        const data = await servRes.json()
        setServicos(data)
      }
    } catch (error) {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  function abrirNovo() {
    setEditando(null)
    setFormData({
      nome: '',
      telefone: '',
      email: '',
      especialidade: '',
      bio: '',
      comissao_percentual: 0,
      status: 'ATIVO',
      servicos: []
    })
    setDialogOpen(true)
  }

  function abrirEditar(prof: Profissional) {
    setEditando(prof)
    setFormData({
      nome: prof.nome,
      telefone: prof.telefone || '',
      email: prof.email || '',
      especialidade: prof.especialidade || '',
      bio: prof.bio || '',
      comissao_percentual: Number(prof.comissao_percentual),
      status: prof.status,
      servicos: prof.servicos?.map(s => s.servico_id) || []
    })
    setDialogOpen(true)
  }

  async function salvar() {
    if (!formData.nome || formData.nome.trim() === '') {
      toast.error('Informe o nome do profissional.')
      return
    }

    try {
      const payload = {
        ...formData,
        ...(editando ? { id: editando.id } : {})
      }

      const res = await fetch('/api/profissionais', {
        method: editando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const message = editando 
          ? 'Profissional atualizado com sucesso!' 
          : 'Profissional criado com horário padrão Seg–Sáb 08:00–20:00.'
        toast.success(message)
        setDialogOpen(false)
        carregarDados()
      } else {
        const error = await res.json()
        toast.error(error.message || error.error || 'Erro ao salvar')
      }
    } catch (error) {
      toast.error('Erro ao salvar profissional')
    }
  }

  async function desativar(id: string) {
    if (!confirm('Deseja realmente desativar este profissional?')) return

    try {
      const res = await fetch(`/api/profissionais?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Profissional desativado!')
        carregarDados()
      } else {
        toast.error('Erro ao desativar')
      }
    } catch (error) {
      toast.error('Erro ao desativar profissional')
    }
  }

  function toggleServico(servicoId: string) {
    setFormData(prev => ({
      ...prev,
      servicos: prev.servicos.includes(servicoId)
        ? prev.servicos.filter(id => id !== servicoId)
        : [...prev.servicos, servicoId]
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando profissionais...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profissionais</h1>
          <p className="text-muted-foreground">Gerencie sua equipe de profissionais</p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Profissional
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profissionais.map((prof) => (
          <Card key={prof.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {prof.foto ? (
                    <img src={prof.foto} alt={prof.nome} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <CardTitle>{prof.nome}</CardTitle>
                    <CardDescription>{prof.especialidade || 'Profissional'}</CardDescription>
                  </div>
                </div>
                <Badge variant={prof.status === 'ATIVO' ? 'default' : 'secondary'}>
                  {prof.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {prof.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">{prof.bio}</p>
              )}
              <div className="space-y-1 text-sm">
                <p>📱 {prof.telefone}</p>
                {prof.email && <p>✉️ {prof.email}</p>}
                <p>💰 Comissão: {prof.comissao_percentual}%</p>
              </div>
              {prof.servicos && prof.servicos.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Serviços:</p>
                  <div className="flex flex-wrap gap-1">
                    {prof.servicos.slice(0, 3).map((ps: any) => (
                      <Badge key={ps.servico.id} variant="outline" className="text-xs">
                        {ps.servico.nome}
                      </Badge>
                    ))}
                    {prof.servicos.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{prof.servicos.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => abrirEditar(prof)} className="flex-1">
                  <Edit className="mr-1 h-3 w-3" />
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => desativar(prof.id)}
                  disabled={prof.status === 'INATIVO'}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {profissionais.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum profissional cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-4">Comece adicionando seu primeiro profissional</p>
            <Button onClick={abrirNovo}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Profissional
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar' : 'Novo'} Profissional</DialogTitle>
            <DialogDescription>
              Preencha os dados do profissional
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome completo do profissional"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="especialidade">Especialidade</Label>
                <Input
                  id="especialidade"
                  value={formData.especialidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, especialidade: e.target.value }))}
                  placeholder="Ex: Cabeleireiro, Manicure"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comissao">Comissão (%)</Label>
                <Input
                  id="comissao"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.comissao_percentual}
                  onChange={(e) => setFormData(prev => ({ ...prev, comissao_percentual: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Breve descrição do profissional..."
                rows={3}
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
                  <SelectItem value="FERIAS">Férias</SelectItem>
                  <SelectItem value="LICENCA">Licença</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Serviços que atende</Label>
              <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                {servicos.map((servico) => (
                  <div key={servico.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`servico-${servico.id}`}
                      checked={formData.servicos.includes(servico.id)}
                      onCheckedChange={() => toggleServico(servico.id)}
                    />
                    <Label 
                      htmlFor={`servico-${servico.id}`} 
                      className="text-sm font-normal cursor-pointer"
                    >
                      {servico.nome}
                    </Label>
                  </div>
                ))}
                {servicos.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum serviço cadastrado</p>
                )}
              </div>
            </div>

            {!editando && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <Clock className="inline h-4 w-4 mr-1" />
                  <strong>Horário padrão:</strong> Segunda a Sábado, 08:00 às 20:00 (Domingo fechado). Você poderá personalizar depois.
                </p>
              </div>
            )}

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
