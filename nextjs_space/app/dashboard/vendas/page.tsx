'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, Plus, Eye, DollarSign, Shield, Trash2, KeyRound, UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface Venda {
  id: string
  numero_venda: string
  valor_final: number
  data_venda: string
  cliente: { nome: string } | null
  itens: Array<{
    quantidade: number
    valor_unitario: number
    valor_total: number
    produto: { nome: string } | null
    servico: { nome: string } | null
  }>
  pagamento: {
    forma_pagamento: string
    status: string
  } | null
}

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

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
  const [servicos, setServicos] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [saloes, setSaloes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [modalUsuario, setModalUsuario] = useState(false)
  const [modalResetSenha, setModalResetSenha] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null)
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null)
  const [formData, setFormData] = useState({
    cliente_id: '',
    desconto: '0',
    observacoes: '',
    itens: [] as Array<{
      tipo: 'produto' | 'servico'
      produto_id: string | null
      servico_id: string | null
      quantidade: string
      valor_unitario: string
      desconto: string
    }>,
    pagamento: {
      forma_pagamento: 'DINHEIRO',
      status: 'PAGO',
      parcelas: '1',
    }
  })

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
      const [vendasRes, clientesRes, produtosRes, servicosRes, usuariosRes, saloesRes] = await Promise.all([
        fetch('/api/vendas'),
        fetch('/api/clientes'),
        fetch('/api/produtos'),
        fetch('/api/servicos'),
        fetch('/api/admin/usuarios'),
        fetch('/api/configuracoes'),
      ])
      
      const [vendasData, clientesData, produtosData, servicosData, usuariosData, saloesData] = await Promise.all([
        vendasRes.json(),
        clientesRes.json(),
        produtosRes.json(),
        servicosRes.json(),
        usuariosRes.json(),
        saloesRes.json(),
      ])

      setVendas(vendasData.vendas || [])
      setClientes(clientesData.clientes || [])
      setProdutos(produtosData.produtos || [])
      setServicos(servicosData.servicos || [])
      setUsuarios(usuariosData.usuarios || [])
      setSaloes(saloesData.saloes || [saloesData.salao])
    } catch (error) {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const abrirModal = () => {
    setFormData({
      cliente_id: '',
      desconto: '0',
      observacoes: '',
      itens: [{
        tipo: 'produto',
        produto_id: null,
        servico_id: null,
        quantidade: '1',
        valor_unitario: '',
        desconto: '0',
      }],
      pagamento: {
        forma_pagamento: 'DINHEIRO',
        status: 'PAGO',
        parcelas: '1',
      }
    })
    setModalAberto(true)
  }

  const adicionarItem = () => {
    setFormData({
      ...formData,
      itens: [...formData.itens, {
        tipo: 'produto',
        produto_id: null,
        servico_id: null,
        quantidade: '1',
        valor_unitario: '',
        desconto: '0',
      }]
    })
  }

  const removerItem = (index: number) => {
    setFormData({
      ...formData,
      itens: formData.itens.filter((_, i) => i !== index)
    })
  }

  const atualizarItem = (index: number, campo: string, valor: any) => {
    const novosItens = [...formData.itens]
    novosItens[index] = { ...novosItens[index], [campo]: valor }

    // Atualizar valor_unitario automaticamente
    if (campo === 'produto_id' && valor) {
      const produto = produtos.find(p => p.id === valor)
      if (produto) {
        novosItens[index].valor_unitario = produto.preco_venda.toString()
      }
    } else if (campo === 'servico_id' && valor) {
      const servico = servicos.find(s => s.id === valor)
      if (servico) {
        novosItens[index].valor_unitario = servico.preco.toString()
      }
    }

    setFormData({ ...formData, itens: novosItens })
  }

  const calcularTotal = () => {
    const subtotal = formData.itens.reduce((sum, item) => {
      const valor = parseFloat(item.valor_unitario || '0') * parseInt(item.quantidade || '1')
      return sum + valor - parseFloat(item.desconto || '0')
    }, 0)
    return subtotal - parseFloat(formData.desconto || '0')
  }

  const salvarVenda = async () => {
    try {
      const response = await fetch('/api/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Venda registrada com sucesso!')
        setModalAberto(false)
        carregarDados()
      } else {
        toast.error('Erro ao registrar venda')
      }
    } catch (error) {
      toast.error('Erro ao registrar venda')
    }
  }

  // Funções de Admin
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

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarDataHora = (data: string) => {
    return new Date(data).toLocaleString('pt-BR')
  }

  const totalVendas = vendas.reduce((sum, v) => sum + Number(v.valor_final), 0)
  const vendasHoje = vendas.filter(v => 
    new Date(v.data_venda).toDateString() === new Date().toDateString()
  )
  const totalHoje = vendasHoje.reduce((sum, v) => sum + Number(v.valor_final), 0)

  if (loading) {
    return <div className="flex items-center justify-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendas & Administração</h1>
          <p className="text-gray-600">Gestão de vendas e usuários do sistema</p>
        </div>
      </div>

      <Tabs defaultValue="vendas" className="space-y-6">
        <TabsList>
          <TabsTrigger value="vendas">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Vendas
          </TabsTrigger>
          <TabsTrigger value="admin">
            <Shield className="mr-2 h-4 w-4" />
            Painel Admin
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vendas" className="space-y-6">
          <div className="flex items-center justify-end">
            <Button onClick={abrirModal}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Venda
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalVendas.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">{vendas.length} vendas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Vendas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {totalHoje.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">{vendasHoje.length} vendas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {vendas.length > 0 ? (totalVendas / vendas.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-gray-500 mt-1">Média por venda</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Histórico de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vendas.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma venda registrada</p>
              <Button onClick={abrirModal} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Registrar Primeira Venda
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {vendas.map((venda) => (
                <div key={venda.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{venda.numero_venda}</span>
                      {venda.cliente && (
                        <span className="text-sm text-gray-600">- {venda.cliente.nome}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatarData(venda.data_venda)} • {venda.itens.length} item(ns)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      R$ {Number(venda.valor_final).toFixed(2)}
                    </div>
                    {venda.pagamento && (
                      <Badge variant={venda.pagamento.status === 'PAGO' ? 'default' : 'secondary'} className="text-xs">
                        {venda.pagamento.forma_pagamento}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        {/* Aba Admin */}
        <TabsContent value="admin" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Gerenciamento de Usuários
              </h2>
              <p className="text-sm text-gray-600 mt-1">Visualize e gerencie todos os usuários do sistema</p>
            </div>
            <Button onClick={abrirModalUsuario}>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usuários Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              {usuarios.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum usuário cadastrado
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
        </TabsContent>
      </Tabs>

      {/* Modal de Nova Venda */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Venda</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Cliente (Opcional)</Label>
              <Select value={formData.cliente_id} onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem-cliente">Sem Cliente</SelectItem>
                  {clientes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Itens da Venda</Label>
                <Button size="sm" onClick={adicionarItem}>
                  <Plus className="mr-1 h-3 w-3" />
                  Adicionar Item
                </Button>
              </div>

              {formData.itens.map((item, index) => (
                <Card key={index} className="p-3">
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Tipo</Label>
                        <Select 
                          value={item.tipo} 
                          onValueChange={(value) => atualizarItem(index, 'tipo', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="produto">Produto</SelectItem>
                            <SelectItem value="servico">Serviço</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{item.tipo === 'produto' ? 'Produto' : 'Serviço'}</Label>
                        <Select 
                          value={item.tipo === 'produto' ? (item.produto_id || '') : (item.servico_id || '')}
                          onValueChange={(value) => atualizarItem(index, item.tipo === 'produto' ? 'produto_id' : 'servico_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {item.tipo === 'produto' ? (
                              produtos.filter(p => p.status === 'ATIVO').map(p => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.nome} - R$ {Number(p.preco_venda).toFixed(2)}
                                </SelectItem>
                              ))
                            ) : (
                              servicos.filter(s => s.status === 'ATIVO').map(s => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.nome} - R$ {Number(s.preco).toFixed(2)}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <Label>Quantidade</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantidade}
                          onChange={(e) => atualizarItem(index, 'quantidade', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Valor Unit.</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.valor_unitario}
                          onChange={(e) => atualizarItem(index, 'valor_unitario', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Desconto</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.desconto}
                          onChange={(e) => atualizarItem(index, 'desconto', e.target.value)}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removerItem(index)}
                          className="w-full"
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Desconto Total</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.desconto}
                  onChange={(e) => setFormData({ ...formData, desconto: e.target.value })}
                />
              </div>
              <div>
                <Label>Total da Venda</Label>
                <div className="text-2xl font-bold text-green-600 pt-2">
                  R$ {calcularTotal().toFixed(2)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t pt-4">
              <div>
                <Label>Forma de Pagamento</Label>
                <Select 
                  value={formData.pagamento.forma_pagamento}
                  onValueChange={(value) => setFormData({ ...formData, pagamento: { ...formData.pagamento, forma_pagamento: value }})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="DEBITO">Débito</SelectItem>
                    <SelectItem value="CREDITO">Crédito</SelectItem>
                    <SelectItem value="BOLETO">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select 
                  value={formData.pagamento.status}
                  onValueChange={(value) => setFormData({ ...formData, pagamento: { ...formData.pagamento, status: value }})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAGO">Pago</SelectItem>
                    <SelectItem value="PENDENTE">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Parcelas</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.pagamento.parcelas}
                  onChange={(e) => setFormData({ ...formData, pagamento: { ...formData.pagamento, parcelas: e.target.value }})}
                />
              </div>
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações sobre a venda"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarVenda}>
              Finalizar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
