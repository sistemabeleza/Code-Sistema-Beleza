'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, User, Phone, Percent, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

interface Profissional {
  id: string
  nome: string
  telefone?: string
  status: string
  commission_type?: string | null
  commission_value?: number | null
}

export default function ProfissionaisPage() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Profissional | null>(null)
  
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    commission_type: '' as string,
    commission_value: ''
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
      telefone: '',
      commission_type: '',
      commission_value: ''
    })
    setDialogOpen(true)
  }

  function abrirEditar(prof: Profissional) {
    setEditando(prof)
    setFormData({
      nome: prof.nome,
      telefone: prof.telefone || '',
      commission_type: prof.commission_type || '',
      commission_value: prof.commission_value ? String(prof.commission_value) : ''
    })
    setDialogOpen(true)
  }

  async function salvar() {
    // Validação
    if (!formData.nome.trim()) {
      toast.error('Informe o nome do profissional')
      return
    }

    // Validação de comissão
    if (formData.commission_type && !formData.commission_value) {
      toast.error('Informe o valor da comissão')
      return
    }

    if (formData.commission_value && !formData.commission_type) {
      toast.error('Selecione o tipo de comissão')
      return
    }

    // Validar percentual
    if (formData.commission_type === 'PERCENTAGE' && formData.commission_value) {
      const valor = parseFloat(formData.commission_value)
      if (valor < 0 || valor > 100) {
        toast.error('A comissão em porcentagem deve estar entre 0% e 100%')
        return
      }
    }

    try {
      setSalvando(true)
      
      const body = {
        nome: formData.nome.trim(),
        telefone: formData.telefone.trim() || null,
        commission_type: (formData.commission_type && formData.commission_type !== 'none') ? formData.commission_type : null,
        commission_value: (formData.commission_value && formData.commission_type !== 'none') ? formData.commission_value : null
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

            <div className="border-t pt-4 mt-4">
              <h3 className="text-base font-semibold mb-4">Comissão (Opcional)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commission_type" className="text-sm font-medium">
                    Tipo de Comissão
                  </Label>
                  <Select
                    value={formData.commission_type}
                    onValueChange={(value) => setFormData({ ...formData, commission_type: value })}
                  >
                    <SelectTrigger id="commission_type">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem comissão</SelectItem>
                      <SelectItem value="PERCENTAGE">Porcentagem (%)</SelectItem>
                      <SelectItem value="FIXED">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commission_value" className="text-sm font-medium">
                    Valor
                  </Label>
                  <div className="relative">
                    {formData.commission_type === 'PERCENTAGE' && (
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    )}
                    {formData.commission_type === 'FIXED' && (
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    )}
                    <Input
                      id="commission_value"
                      type="number"
                      step="0.01"
                      min="0"
                      max={formData.commission_type === 'PERCENTAGE' ? '100' : undefined}
                      value={formData.commission_value}
                      onChange={(e) => setFormData({ ...formData, commission_value: e.target.value })}
                      placeholder={formData.commission_type === 'PERCENTAGE' ? '0 - 100' : '0.00'}
                      className={formData.commission_type ? 'pl-10' : ''}
                      disabled={!formData.commission_type || formData.commission_type === 'none'}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.commission_type === 'PERCENTAGE' 
                      ? 'Porcentagem do valor do serviço'
                      : formData.commission_type === 'FIXED'
                      ? 'Valor fixo por serviço concluído'
                      : 'Selecione um tipo de comissão'}
                  </p>
                </div>
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
              {salvando ? 'Salvando...' : 'Salvar Profissional'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
