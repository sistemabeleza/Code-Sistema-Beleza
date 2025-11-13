
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Shield, Plus, Edit, Trash2, Key, LogOut, Users, Webhook, CheckCircle2, XCircle } from 'lucide-react'
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
  const [modalWebhookAberto, setModalWebhookAberto] = useState(false)
  const [webhookConfig, setWebhookConfig] = useState({
    automacao_ativa: false,
    webhook_url: ''
  })
  const [testando, setTestando] = useState(false)

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

  const abrirModalWebhook = (user: User) => {
    if (!user.salao) {
      toast.error('Este usuário não tem um salão associado')
      return
    }
    setUsuarioSelecionado(user)
    setWebhookConfig({
      automacao_ativa: false,
      webhook_url: ''
    })
    setModalWebhookAberto(true)
    
    // Carregar configuração atual do webhook
    carregarWebhookConfig(user.salao.id)
  }

  const carregarWebhookConfig = async (salaoId: string) => {
    try {
      const response = await fetch(`/api/admin/webhook?salaoId=${salaoId}`)
      if (response.ok) {
        const data = await response.json()
        setWebhookConfig({
          automacao_ativa: data.automacao_ativa || false,
          webhook_url: data.webhook_url || ''
        })
      }
    } catch (error) {
      console.error('Erro ao carregar configuração de webhook:', error)
    }
  }

  const handleSalvarWebhook = async () => {
    if (!usuarioSelecionado?.salao) {
      toast.error('Salão não encontrado')
      return
    }

    // Validar URL se a automação estiver ativa
    if (webhookConfig.automacao_ativa && !webhookConfig.webhook_url.trim()) {
      toast.error('Informe a URL do webhook')
      return
    }

    // Validar formato da URL
    if (webhookConfig.webhook_url.trim()) {
      try {
        new URL(webhookConfig.webhook_url)
      } catch {
        toast.error('URL inválida. Use o formato: https://exemplo.com/webhook')
        return
      }
    }

    try {
      const response = await fetch('/api/admin/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salaoId: usuarioSelecionado.salao.id,
          ...webhookConfig
        })
      })

      if (response.ok) {
        toast.success('Configuração de webhook salva com sucesso!')
        setModalWebhookAberto(false)
        setUsuarioSelecionado(null)
        await carregarUsuarios()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao salvar configuração')
      }
    } catch (error) {
      toast.error('Erro ao salvar configuração de webhook')
    }
  }

  const handleTestarWebhook = async () => {
    if (!usuarioSelecionado?.salao) {
      toast.error('Salão não encontrado')
      return
    }

    if (!webhookConfig.webhook_url.trim()) {
      toast.error('Informe a URL do webhook para testar')
      return
    }

    setTestando(true)
    try {
      const response = await fetch('/api/admin/webhook/testar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salaoId: usuarioSelecionado.salao.id,
          webhook_url: webhookConfig.webhook_url
        })
      })

      const data = await response.json()
      
      if (data.sucesso) {
        toast.success('✓ Webhook testado com sucesso!')
      } else {
        toast.error(`✗ Falha no teste: ${data.mensagem}`)
      }
    } catch (error) {
      toast.error('Erro ao testar webhook')
    } finally {
      setTestando(false)
    }
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
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => abrirModalPlano(user)}
                                title="Alterar plano"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Users className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => abrirModalWebhook(user)}
                                title="Configurar Webhook"
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                              >
                                <Webhook className="h-4 w-4" />
                              </Button>
                            </>
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

      {/* Modal Configurar Webhook */}
      <Dialog open={modalWebhookAberto} onOpenChange={setModalWebhookAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-purple-600" />
              Automação Inteligente via Webhook
            </DialogTitle>
          </DialogHeader>
          {usuarioSelecionado?.salao && (
            <div className="space-y-6">
              {/* Info do Salão */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-900 font-semibold">
                  {usuarioSelecionado.salao.nome}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  Configurar notificações automáticas para plataformas externas
                </p>
              </div>

              {/* Explicação */}
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-blue-900 text-sm">ℹ️ Como funciona:</h4>
                <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                  <li>Quando ativado, o sistema enviará notificações para a URL configurada</li>
                  <li>Eventos: criação, atualização e cancelamento de agendamentos</li>
                  <li>Útil para integração com Fiqeon, Zapier, Make, n8n, etc.</li>
                  <li>Falhas no webhook não afetam o funcionamento do sistema</li>
                </ul>
              </div>

              {/* Switch Ativar/Desativar */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {webhookConfig.automacao_ativa ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <Label className="text-base font-semibold">
                      {webhookConfig.automacao_ativa ? 'Automação Ativa' : 'Automação Desativada'}
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      {webhookConfig.automacao_ativa 
                        ? 'Notificações estão sendo enviadas' 
                        : 'Nenhuma notificação será enviada'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setWebhookConfig({ ...webhookConfig, automacao_ativa: !webhookConfig.automacao_ativa })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    webhookConfig.automacao_ativa ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      webhookConfig.automacao_ativa ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* URL do Webhook */}
              <div>
                <Label htmlFor="webhook-url" className="text-sm font-semibold">
                  URL do Webhook {webhookConfig.automacao_ativa && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="webhook-url"
                  value={webhookConfig.webhook_url}
                  onChange={(e) => setWebhookConfig({ ...webhookConfig, webhook_url: e.target.value })}
                  placeholder="https://api.fiqeon.com/webhook/seu-codigo-aqui"
                  className="mt-2 font-mono text-sm"
                  disabled={!webhookConfig.automacao_ativa}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Cole aqui a URL fornecida pela plataforma de automação (Fiqeon, Zapier, Make, etc.)
                </p>
              </div>

              {/* Botão Testar */}
              {webhookConfig.webhook_url && (
                <div className="border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={handleTestarWebhook}
                    disabled={testando}
                    className="w-full"
                  >
                    {testando ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                        Testando...
                      </>
                    ) : (
                      <>
                        <Webhook className="mr-2 h-4 w-4" />
                        Testar Webhook
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Envia um agendamento de teste para verificar a conexão
                  </p>
                </div>
              )}

              {/* Exemplo de Payload */}
              <details className="bg-gray-50 p-4 rounded-lg">
                <summary className="cursor-pointer font-semibold text-sm text-gray-700">
                  📄 Ver exemplo de payload enviado
                </summary>
                <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded mt-3 overflow-x-auto">
{`{
  "evento": "agendamento.criado",
  "timestamp": "2024-11-13T10:30:00Z",
  "salao": {
    "id": "abc123",
    "nome": "Salão Exemplo",
    "slug": "salao-exemplo"
  },
  "agendamento": {
    "id": "xyz789",
    "data": "2024-11-15",
    "hora_inicio": "14:00",
    "hora_fim": "15:00",
    "status": "AGENDADO",
    "valor_cobrado": 50.00
  },
  "cliente": {
    "nome": "João Silva",
    "telefone": "+5511999999999",
    "email": "joao@email.com"
  },
  "servico": {
    "nome": "Corte de Cabelo",
    "preco": 50.00,
    "duracao_minutos": 60
  }
}`}
                </pre>
              </details>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalWebhookAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarWebhook} className="bg-purple-600 hover:bg-purple-700">
              <Webhook className="mr-2 h-4 w-4" />
              Salvar Configuração
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
