
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, UserPlus, Users, Trash2, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Usuario {
  id: string
  name: string | null
  email: string
  tipo: string
  status: string
  telefone: string | null
  cpf: string | null
  salao: {
    nome: string
    email: string | null
  }
  createdAt: string
  updatedAt: string
}

export default function AdminPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [saloes, setSaloes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalUsuario, setModalUsuario] = useState(false)
  const [modalResetSenha, setModalResetSenha] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null)
  
  const [formUsuario, setFormUsuario] = useState({
    name: '',
    email: '',
    password: '123456',
    salao_id: '',
    tipo: 'ADMIN',
    status: 'ATIVO',
    telefone: '',
    cpf: '',
  })

  const [formSenha, setFormSenha] = useState({
    new_password: '',
    confirm_password: '',
  })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const [usuariosRes, saloesRes] = await Promise.all([
        fetch('/api/admin/usuarios'),
        fetch('/api/configuracoes'),
      ])
      
      const [usuariosData, saloesData] = await Promise.all([
        usuariosRes.json(),
        saloesRes.json(),
      ])

      setUsuarios(usuariosData.usuarios || [])
      setSaloes(saloesData.saloes || [saloesData.salao])
    } catch (error) {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const abrirModalUsuario = () => {
    setFormUsuario({
      name: '',
      email: '',
      password: '123456',
      salao_id: saloes[0]?.id || '',
      tipo: 'ADMIN',
      status: 'ATIVO',
      telefone: '',
      cpf: '',
    })
    setModalUsuario(true)
  }

  const salvarUsuario = async () => {
    if (!formUsuario.name || !formUsuario.email || !formUsuario.salao_id) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    try {
      const response = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formUsuario),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Usuário criado com sucesso!')
        setModalUsuario(false)
        carregarDados()
      } else {
        toast.error(data.error || 'Erro ao criar usuário')
      }
    } catch (error) {
      toast.error('Erro ao criar usuário')
    }
  }

  const excluirUsuario = async (id: string) => {
    if (!confirm('Deseja realmente excluir este usuário?')) return

    try {
      const response = await fetch(`/api/admin/usuarios?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Usuário excluído com sucesso!')
        carregarDados()
      } else {
        toast.error(data.error || 'Erro ao excluir usuário')
      }
    } catch (error) {
      toast.error('Erro ao excluir usuário')
    }
  }

  const abrirModalResetSenha = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario)
    setFormSenha({
      new_password: '',
      confirm_password: '',
    })
    setModalResetSenha(true)
  }

  const resetarSenha = async () => {
    if (!formSenha.new_password || formSenha.new_password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres')
      return
    }

    if (formSenha.new_password !== formSenha.confirm_password) {
      toast.error('As senhas não conferem')
      return
    }

    try {
      const response = await fetch('/api/admin/usuarios/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: usuarioSelecionado?.id,
          new_password: formSenha.new_password,
        }),
      })

      if (response.ok) {
        toast.success('Senha redefinida com sucesso!')
        setModalResetSenha(false)
        setUsuarioSelecionado(null)
      } else {
        toast.error('Erro ao redefinir senha')
      }
    } catch (error) {
      toast.error('Erro ao redefinir senha')
    }
  }

  const formatarDataHora = (data: string) => {
    return new Date(data).toLocaleString('pt-BR')
  }

  if (loading) {
    return <div className="flex items-center justify-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="mr-2 h-6 w-6" />
            Painel Admin
          </h1>
          <p className="text-gray-600 mt-1">Gerenciamento de usuários do sistema</p>
        </div>
        <Button onClick={abrirModalUsuario}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Usuários Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usuarios.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum usuário cadastrado</p>
              <Button onClick={abrirModalUsuario} className="mt-4">
                <UserPlus className="mr-2 h-4 w-4" />
                Criar Primeiro Usuário
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {usuarios.map((usuario) => (
                <div key={usuario.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{usuario.name || 'Sem nome'}</span>
                      <Badge variant={usuario.status === 'ATIVO' ? 'default' : 'secondary'}>
                        {usuario.status}
                      </Badge>
                      <Badge variant="outline">{usuario.tipo}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {usuario.email}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Salão: {usuario.salao.nome}
                      {usuario.telefone && ` • Tel: ${usuario.telefone}`}
                      {usuario.cpf && ` • CPF: ${usuario.cpf}`}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Criado em: {formatarDataHora(usuario.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => abrirModalResetSenha(usuario)}
                    >
                      <KeyRound className="mr-1 h-4 w-4" />
                      Resetar Senha
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => excluirUsuario(usuario.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Novo Usuário */}
      <Dialog open={modalUsuario} onOpenChange={setModalUsuario}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome Completo *</Label>
                <Input
                  value={formUsuario.name}
                  onChange={(e) => setFormUsuario({ ...formUsuario, name: e.target.value })}
                  placeholder="Ex: João Silva"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formUsuario.email}
                  onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })}
                  placeholder="exemplo@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Senha (padrão: 123456)</Label>
                <Input
                  type="text"
                  value={formUsuario.password}
                  onChange={(e) => setFormUsuario({ ...formUsuario, password: e.target.value })}
                />
              </div>
              <div>
                <Label>Salão *</Label>
                <Select
                  value={formUsuario.salao_id}
                  onValueChange={(value) => setFormUsuario({ ...formUsuario, salao_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o salão" />
                  </SelectTrigger>
                  <SelectContent>
                    {saloes.filter(s => s?.id).map((salao) => (
                      <SelectItem key={salao.id} value={salao.id}>
                        {salao.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Usuário</Label>
                <Select
                  value={formUsuario.tipo}
                  onValueChange={(value) => setFormUsuario({ ...formUsuario, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="GERENTE">Gerente</SelectItem>
                    <SelectItem value="FUNCIONARIO">Funcionário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={formUsuario.status}
                  onValueChange={(value) => setFormUsuario({ ...formUsuario, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATIVO">Ativo</SelectItem>
                    <SelectItem value="INATIVO">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telefone</Label>
                <Input
                  value={formUsuario.telefone}
                  onChange={(e) => setFormUsuario({ ...formUsuario, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <Label>CPF</Label>
                <Input
                  value={formUsuario.cpf}
                  onChange={(e) => setFormUsuario({ ...formUsuario, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalUsuario(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarUsuario}>
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Reset de Senha */}
      <Dialog open={modalResetSenha} onOpenChange={setModalResetSenha}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Redefinindo senha para: <span className="font-semibold">{usuarioSelecionado?.name}</span>
              </p>
              <p className="text-xs text-gray-500">{usuarioSelecionado?.email}</p>
            </div>
            <div>
              <Label>Nova Senha *</Label>
              <Input
                type="password"
                value={formSenha.new_password}
                onChange={(e) => setFormSenha({ ...formSenha, new_password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <Label>Confirmar Senha *</Label>
              <Input
                type="password"
                value={formSenha.confirm_password}
                onChange={(e) => setFormSenha({ ...formSenha, confirm_password: e.target.value })}
                placeholder="Digite novamente a senha"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalResetSenha(false)}>
              Cancelar
            </Button>
            <Button onClick={resetarSenha}>
              Redefinir Senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
