
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, Plus, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
  const [servicos, setServicos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
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

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const [vendasRes, clientesRes, produtosRes, servicosRes] = await Promise.all([
        fetch('/api/vendas'),
        fetch('/api/clientes'),
        fetch('/api/produtos'),
        fetch('/api/servicos'),
      ])
      
      const [vendasData, clientesData, produtosData, servicosData] = await Promise.all([
        vendasRes.json(),
        clientesRes.json(),
        produtosRes.json(),
        servicosRes.json(),
      ])

      setVendas(vendasData.vendas || [])
      setClientes(clientesData.clientes || [])
      setProdutos(produtosData.produtos || [])
      setServicos(servicosData.servicos || [])
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

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
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
          <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-600">Gestão de vendas do salão</p>
        </div>
      </div>

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

      {/* Botão Admin Desenvolvedor - Rodapé */}
      <div className="fixed bottom-4 right-4">
        <Link
          href="/admin/login"
          className="flex items-center justify-center p-4 text-red-600 hover:text-red-700 transition-all rounded-full bg-red-50 hover:bg-red-100 border-2 border-red-600 shadow-lg hover:shadow-xl"
          title="Painel Desenvolvedor"
        >
          <Wrench className="h-6 w-6" />
        </Link>
      </div>
    </div>
  )
}
