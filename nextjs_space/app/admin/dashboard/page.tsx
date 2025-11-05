
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Shield, Plus, Edit, Trash2, Key, LogOut, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface User {
  id: string
  name: string | null
  email: string
  tipo: string
  status: string
  createdAt: string
  salao?: {
    id: string
    nome: string
    plano: string
    is_trial_active: boolean
    trial_end_date: string | null
  }
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [modalAberto, setModalAberto] = useState(false)
  const [modalEditAberto, setModalEditAberto] = useState(false)
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false)
  const [modalPlanoAberto, setModalPlanoAberto] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<User | null>(null)
  const [deleteDialogAberto, setDeleteDialogAberto] = useState(false)
  const [usuarioParaDeletar, setUsuarioParaDeletar] = useState<User | null>(null)
  const [novoPlano, setNovoPlano] = useState('')

  const [novoUsuario, setNovoUsuario] = useState({
    name: '',
    email: '',
    password: '',
    tipo: 'ADMIN'
  })

  const [editUsuario, setEditUsuario] = useState({
    name: '',
    email: '',
    tipo: ''
  })

  const [novaSenha, setNovaSenha] = useState({
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    verificarAutenticacao()
  }, [])

  const verificarAutenticacao = async () => {
    const token = localStorage.getItem('admin_token')
    
    if (!token) {
      router.push('/admin/login')
      return
    }

    try {
      const response = await fetch('/api/admin/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      if (!response.ok) {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }

      await carregarUsuarios()
    } catch (error) {
      localStorage.removeItem('admin_token')
      router.push('/admin/login')
    }
  }

  const carregarUsuarios = async () => {
    try {
      const response = await fetch('/api/admin/usuarios')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    toast.success('Logout realizado com sucesso')
    router.push('/admin/login')
  }

  const handleCriarUsuario = async () => {
    if (!novoUsuario.name || !novoUsuario.email || !novoUsuario.password) {
      toast.error('Preencha todos os campos')
      return
    }

    try {
      const response = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoUsuario)
      })

      if (response.ok) {
        toast.success('Usuário criado com sucesso!')
        setModalAberto(false)
        setNovoUsuario({ name: '', email: '', password: '', tipo: 'ADMIN' })
        await carregarUsuarios()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao criar usuário')
      }
    } catch (error) {
      toast.error('Erro ao criar usuário')
    }
  }

  const handleEditarUsuario = async () => {
    if (!usuarioSelecionado || !editUsuario.name || !editUsuario.email) {
      toast.error('Preencha todos os campos')
      return
    }

    try {
      const response = await fetch('/api/admin/usuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: usuarioSelecionado.id,
          ...editUsuario
        })
      })

      if (response.ok) {
        toast.success('Usuário atualizado com sucesso!')
        setModalEditAberto(false)
        setUsuarioSelecionado(null)
        await carregarUsuarios()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao atualizar usuário')
      }
    } catch (error) {
      toast.error('Erro ao atualizar usuário')
    }
  }

  const handleAlterarSenha = async () => {
    if (!usuarioSelecionado || !novaSenha.password || !novaSenha.confirmPassword) {
      toast.error('Preencha todos os campos')
      return
    }

    if (novaSenha.password !== novaSenha.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    try {
      const response = await fetch('/api/admin/usuarios/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: usuarioSelecionado.id,
          newPassword: novaSenha.password
        })
      })

      if (response.ok) {
        toast.success('Senha alterada com sucesso!')
        setModalSenhaAberto(false)
        setUsuarioSelecionado(null)
        setNovaSenha({ password: '', confirmPassword: '' })
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao alterar senha')
      }
    } catch (error) {
      toast.error('Erro ao alterar senha')
    }
  }

  const abrirModalEdit = (user: User) => {
    setUsuarioSelecionado(user)
    setEditUsuario({
      name: user.name || '',
      email: user.email,
      tipo: user.tipo
    })
    setModalEditAberto(true)
  }

  const abrirModalSenha = (user: User) => {
    setUsuarioSelecionado(user)
    setNovaSenha({ password: '', confirmPassword: '' })
    setModalSenhaAberto(true)
  }

  const abrirModalPlano = (user: User) => {
    if (!user.salao) {
      toast.error('Este usuário não tem um salão associado')
      return
    }
    setUsuarioSelecionado(user)
    setNovoPlano(user.salao.plano)
    setModalPlanoAberto(true)
  }

  const handleAlterarPlano = async () => {
    if (!usuarioSelecionado?.salao || !novoPlano) {
      toast.error('Selecione um plano')
      return
    }

    try {
      const response = await fetch('/api/admin/usuarios/alterar-plano', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salaoId: usuarioSelecionado.salao.id,
          plano: novoPlano
        })
      })

      if (response.ok) {
        toast.success('Plano alterado com sucesso!')
        setModalPlanoAberto(false)
        setUsuarioSelecionado(null)
        await carregarUsuarios()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao alterar plano')
      }
    } catch (error) {
      toast.error('Erro ao alterar plano')
    }
  }

  const confirmarDelete = (user: User) => {
    setUsuarioParaDeletar(user)
    setDeleteDialogAberto(true)
  }

  const handleDeletarUsuario = async () => {
    if (!usuarioParaDeletar) return

    try {
      const response = await fetch('/api/admin/usuarios', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: usuarioParaDeletar.id })
      })

      if (response.ok) {
        toast.success('Usuário deletado com sucesso!')
        setDeleteDialogAberto(false)
        setUsuarioParaDeletar(null)
        await carregarUsuarios()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao deletar usuário')
      }
    } catch (error) {
      toast.error('Erro ao deletar usuário')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-900 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel do Desenvolvedor</h1>
                <p className="text-sm text-gray-600">Gestão de usuários do sistema</p>
              </div>
            </div>
            
            <Button 
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">{users.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Usuários Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'ATIVO').length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Administradores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.tipo === 'ADMIN').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Usuários Cadastrados</h2>
          <Button onClick={() => setModalAberto(true)} className="bg-gray-900 hover:bg-gray-800">
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plano
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{user.name || 'Sem nome'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.tipo === 'ADMIN' ? 'default' : 'secondary'}>
                          {user.tipo}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.status === 'ATIVO' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {user.salao?.nome || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant={
                              user.salao?.plano === 'COMPLETO' ? 'default' : 
                              user.salao?.plano === 'INTERMEDIARIO' ? 'secondary' : 
                              'outline'
                            }
                          >
                            {user.salao?.plano || 'N/A'}
                          </Badge>
                          {user.salao?.is_trial_active && (
                            <span className="text-xs text-green-600 font-medium">
                              Trial ativo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirModalEdit(user)}
                            title="Editar usuário"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirModalSenha(user)}
                            title="Alterar senha"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          {user.salao && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => abrirModalPlano(user)}
                              title="Alterar plano"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmarDelete(user)}
                            title="Deletar usuário"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modal Criar Usuário */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={novoUsuario.name}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={novoUsuario.email}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={novoUsuario.password}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, password: e.target.value })}
                placeholder="Senha do usuário"
              />
            </div>
            <div>
              <Label htmlFor="tipo">Tipo de Usuário</Label>
              <Select
                value={novoUsuario.tipo}
                onValueChange={(value) => setNovoUsuario({ ...novoUsuario, tipo: value })}
              >
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="GERENTE">Gerente</SelectItem>
                  <SelectItem value="ATENDENTE">Atendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarUsuario} className="bg-gray-900 hover:bg-gray-800">
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Usuário */}
      <Dialog open={modalEditAberto} onOpenChange={setModalEditAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={editUsuario.name}
                onChange={(e) => setEditUsuario({ ...editUsuario, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUsuario.email}
                onChange={(e) => setEditUsuario({ ...editUsuario, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-tipo">Tipo de Usuário</Label>
              <Select
                value={editUsuario.tipo}
                onValueChange={(value) => setEditUsuario({ ...editUsuario, tipo: value })}
              >
                <SelectTrigger id="edit-tipo">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="GERENTE">Gerente</SelectItem>
                  <SelectItem value="ATENDENTE">Atendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalEditAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditarUsuario} className="bg-gray-900 hover:bg-gray-800">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Alterar Senha */}
      <Dialog open={modalSenhaAberto} onOpenChange={setModalSenhaAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha do Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={novaSenha.password}
                onChange={(e) => setNovaSenha({ ...novaSenha, password: e.target.value })}
                placeholder="Digite a nova senha"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={novaSenha.confirmPassword}
                onChange={(e) => setNovaSenha({ ...novaSenha, confirmPassword: e.target.value })}
                placeholder="Confirme a nova senha"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalSenhaAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAlterarSenha} className="bg-gray-900 hover:bg-gray-800">
              Alterar Senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Alterar Plano */}
      <Dialog open={modalPlanoAberto} onOpenChange={setModalPlanoAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Plano do Salão</DialogTitle>
          </DialogHeader>
          {usuarioSelecionado?.salao && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Salão: <span className="font-semibold text-gray-900">{usuarioSelecionado.salao.nome}</span>
                </p>
                {usuarioSelecionado.salao.is_trial_active && usuarioSelecionado.salao.trial_end_date && (
                  <p className="text-sm text-green-600 mt-1">
                    Trial ativo até {new Date(usuarioSelecionado.salao.trial_end_date).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="plano">Plano</Label>
                <Select
                  value={novoPlano}
                  onValueChange={(value) => setNovoPlano(value)}
                >
                  <SelectTrigger id="plano">
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASICO">
                      <div className="flex flex-col">
                        <span className="font-medium">Básico</span>
                        <span className="text-xs text-gray-500">R$ 39,90/mês - Até 2 profissionais</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="INTERMEDIARIO">
                      <div className="flex flex-col">
                        <span className="font-medium">Intermediário</span>
                        <span className="text-xs text-gray-500">R$ 49,90/mês - Até 6 profissionais</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="COMPLETO">
                      <div className="flex flex-col">
                        <span className="font-medium">Completo</span>
                        <span className="text-xs text-gray-500">R$ 99,90/mês - Profissionais ilimitados</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Atenção:</strong> A alteração do plano será aplicada imediatamente. O período de trial não será alterado.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalPlanoAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAlterarPlano} className="bg-blue-600 hover:bg-blue-700">
              Alterar Plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog Deletar */}
      <AlertDialog open={deleteDialogAberto} onOpenChange={setDeleteDialogAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O usuário <strong>{usuarioParaDeletar?.name}</strong> será permanentemente removido do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletarUsuario}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
