'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Produto {
  id: string
  nome: string
  preco_custo: number
  preco_venda: number
  quantidade_estoque: number
  estoque_minimo: number
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    preco_custo: '',
    preco_venda: '',
    quantidade_estoque: '',
    estoque_minimo: '',
  })

  useEffect(() => {
    carregarProdutos()
  }, [])

  const carregarProdutos = async () => {
    try {
      const response = await fetch('/api/produtos')
      const data = await response.json()
      setProdutos(data.produtos || [])
    } catch (error) {
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  const abrirModal = (produto?: Produto) => {
    if (produto) {
      setProdutoSelecionado(produto)
      setFormData({
        nome: produto.nome,
        preco_custo: produto.preco_custo.toString(),
        preco_venda: produto.preco_venda.toString(),
        quantidade_estoque: produto.quantidade_estoque.toString(),
        estoque_minimo: produto.estoque_minimo.toString(),
      })
    } else {
      setProdutoSelecionado(null)
      setFormData({
        nome: '',
        preco_custo: '',
        preco_venda: '',
        quantidade_estoque: '',
        estoque_minimo: '',
      })
    }
    setModalAberto(true)
  }

  const salvarProduto = async () => {
    try {
      const url = produtoSelecionado ? '/api/produtos' : '/api/produtos'
      const method = produtoSelecionado ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produtoSelecionado ? { ...formData, id: produtoSelecionado.id } : formData),
      })

      if (response.ok) {
        toast.success(produtoSelecionado ? 'Produto atualizado!' : 'Produto criado!')
        setModalAberto(false)
        carregarProdutos()
      } else {
        toast.error('Erro ao salvar produto')
      }
    } catch (error) {
      toast.error('Erro ao salvar produto')
    }
  }

  const excluirProduto = async (id: string) => {
    if (!confirm('Deseja realmente excluir este produto?')) return

    try {
      const response = await fetch(`/api/produtos?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('Produto excluído!')
        carregarProdutos()
      } else {
        toast.error('Erro ao excluir produto')
      }
    } catch (error) {
      toast.error('Erro ao excluir produto')
    }
  }

  const produtosEstoqueBaixo = produtos.filter(p => p.quantidade_estoque <= p.estoque_minimo)

  if (loading) {
    return <div className="flex items-center justify-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Controle seu estoque de produtos</p>
        </div>
        <Button onClick={() => abrirModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {produtosEstoqueBaixo.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Alerta de Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700">
              {produtosEstoqueBaixo.length} produto(s) com estoque abaixo do mínimo
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {produtos.map((produto) => (
          <Card key={produto.id} className={produto.quantidade_estoque <= produto.estoque_minimo ? 'border-orange-300' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{produto.nome}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Estoque</p>
                  <p className="font-semibold flex items-center">
                    {produto.quantidade_estoque}
                    {produto.quantidade_estoque <= produto.estoque_minimo && (
                      <AlertTriangle className="ml-1 h-3 w-3 text-orange-500" />
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Estoque Mínimo</p>
                  <p className="font-semibold">{produto.estoque_minimo}</p>
                </div>
                <div>
                  <p className="text-gray-500">Valor de Compra</p>
                  <p className="font-semibold text-red-600">
                    R$ {Number(produto.preco_custo).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Valor de Venda</p>
                  <p className="font-semibold text-green-600">
                    R$ {Number(produto.preco_venda).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => abrirModal(produto)}>
                  <Edit className="mr-1 h-3 w-3" />
                  Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => excluirProduto(produto.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {produtos.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum produto cadastrado
            </h3>
            <p className="text-gray-500 mb-4">
              Comece adicionando seu primeiro produto
            </p>
            <Button onClick={() => abrirModal()}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de Produto */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {produtoSelecionado ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Nome do Produto *</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do produto"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor de Compra *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.preco_custo}
                  onChange={(e) => setFormData({ ...formData, preco_custo: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Valor de Venda *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.preco_venda}
                  onChange={(e) => setFormData({ ...formData, preco_venda: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Estoque *</Label>
                <Input
                  type="number"
                  value={formData.quantidade_estoque}
                  onChange={(e) => setFormData({ ...formData, quantidade_estoque: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Alerta de Estoque Baixo *</Label>
                <Input
                  type="number"
                  value={formData.estoque_minimo}
                  onChange={(e) => setFormData({ ...formData, estoque_minimo: e.target.value })}
                  placeholder="5"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarProduto}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
