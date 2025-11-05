
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Plus, Trash2, Calendar, FileText, ShoppingCart, AlertTriangle, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Lancamento {
  id: string
  tipo: 'RECEITA' | 'DESPESA'
  categoria: string
  descricao: string
  valor: number
  data_lancamento: string
  observacoes: string | null
}

interface Relatorio {
  id: string
  tipo_periodo: string
  data_inicio: string
  data_fim: string
  total_receitas: number
  total_despesas: number
  saldo: number
  data_criacao: string
}

interface Produto {
  id: string
  nome: string
  preco_venda: number
  quantidade_estoque: number
  estoque_minimo: number
}

const categoriasReceita = [
  { value: 'SERVICO', label: 'Serviço' },
  { value: 'PRODUTO', label: 'Produto' },
  { value: 'OUTRO_RECEITA', label: 'Outros' },
]

const categoriasDespesa = [
  { value: 'SALARIO', label: 'Salário' },
  { value: 'FORNECEDOR', label: 'Fornecedor' },
  { value: 'ALUGUEL', label: 'Aluguel' },
  { value: 'AGUA', label: 'Água' },
  { value: 'LUZ', label: 'Luz' },
  { value: 'INTERNET', label: 'Internet' },
  { value: 'TELEFONE', label: 'Telefone' },
  { value: 'PRODUTO_COMPRA', label: 'Compra de Produtos' },
  { value: 'EQUIPAMENTO', label: 'Equipamento' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'MANUTENCAO', label: 'Manutenção' },
  { value: 'OUTRO_DESPESA', label: 'Outros' },
]

export default function FinanceiroPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingVenda, setLoadingVenda] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [modalRelatorio, setModalRelatorio] = useState(false)
  const [resumo, setResumo] = useState({ receitas: 0, despesas: 0, saldo: 0 })
  const [formData, setFormData] = useState({
    tipo: 'RECEITA',
    categoria: '',
    descricao: '',
    valor: '',
    data_lancamento: new Date().toISOString().split('T')[0],
    observacoes: '',
  })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const [lancRes, relRes, prodRes] = await Promise.all([
        fetch('/api/financeiro/lancamentos'),
        fetch('/api/financeiro/relatorios'),
        fetch('/api/produtos')
      ])
      
      const lancData = await lancRes.json()
      const relData = await relRes.json()
      const prodData = await prodRes.json()
      
      setLancamentos(lancData.lancamentos || [])
      setRelatorios(relData.relatorios || [])
      setProdutos(prodData.produtos || [])
      
      // Calcular resumo
      const receitas = lancData.lancamentos
        .filter((l: Lancamento) => l.tipo === 'RECEITA')
        .reduce((acc: number, l: Lancamento) => acc + Number(l.valor), 0)
      
      const despesas = lancData.lancamentos
        .filter((l: Lancamento) => l.tipo === 'DESPESA')
        .reduce((acc: number, l: Lancamento) => acc + Number(l.valor), 0)
      
      setResumo({
        receitas,
        despesas,
        saldo: receitas - despesas
      })
    } catch (error) {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const salvarLancamento = async () => {
    if (!formData.descricao || !formData.valor || !formData.categoria) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      const response = await fetch('/api/financeiro/lancamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Lançamento registrado!')
        setModalAberto(false)
        setFormData({
          tipo: 'RECEITA',
          categoria: '',
          descricao: '',
          valor: '',
          data_lancamento: new Date().toISOString().split('T')[0],
          observacoes: '',
        })
        carregarDados()
      } else {
        toast.error('Erro ao salvar lançamento')
      }
    } catch (error) {
      toast.error('Erro ao salvar lançamento')
    }
  }

  const excluirLancamento = async (id: string) => {
    if (!confirm('Deseja realmente excluir este lançamento?')) return

    try {
      const response = await fetch(`/api/financeiro/lancamentos?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Lançamento excluído!')
        carregarDados()
      } else {
        toast.error('Erro ao excluir lançamento')
      }
    } catch (error) {
      toast.error('Erro ao excluir lançamento')
    }
  }

  const gerarRelatorio = async (tipo: 'SEMANAL' | 'MENSAL') => {
    try {
      const response = await fetch('/api/financeiro/relatorios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo_periodo: tipo }),
      })

      if (response.ok) {
        toast.success('Relatório gerado!')
        carregarDados()
      } else {
        toast.error('Erro ao gerar relatório')
      }
    } catch (error) {
      toast.error('Erro ao gerar relatório')
    }
  }

  const venderProduto = async (produtoId: string) => {
    setLoadingVenda(produtoId)
    try {
      const response = await fetch('/api/produtos/venda-rapida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produto_id: produtoId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Venda registrada!')
        carregarDados()
      } else {
        toast.error(data.error || 'Erro ao registrar venda')
      }
    } catch (error) {
      toast.error('Erro ao registrar venda')
    } finally {
      setLoadingVenda(null)
    }
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const getCategoriaLabel = (categoria: string) => {
    const cat = [...categoriasReceita, ...categoriasDespesa].find(c => c.value === categoria)
    return cat?.label || categoria
  }

  if (loading) {
    return <div className="flex items-center justify-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600">Controle de receitas e despesas</p>
        </div>
        <Button onClick={() => setModalAberto(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Lançamento
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatarMoeda(resumo.receitas)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingDown className="mr-2 h-4 w-4 text-red-600" />
              Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatarMoeda(resumo.despesas)}
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${resumo.saldo >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${resumo.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatarMoeda(resumo.saldo)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lancamentos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
          <TabsTrigger value="produtos">Venda Rápida</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios Salvos</TabsTrigger>
        </TabsList>

        <TabsContent value="lancamentos">
          <Card>
            <CardHeader>
              <CardTitle>Últimos Lançamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {lancamentos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum lançamento registrado
                </div>
              ) : (
                <div className="space-y-2">
                  {lancamentos.map((lanc) => (
                    <div
                      key={lanc.id}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        lanc.tipo === 'RECEITA' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{lanc.descricao}</div>
                        <div className="text-sm text-gray-500">
                          {getCategoriaLabel(lanc.categoria)} • {formatarData(lanc.data_lancamento)}
                        </div>
                        {lanc.observacoes && (
                          <div className="text-xs text-gray-400 mt-1">{lanc.observacoes}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`text-lg font-semibold ${
                          lanc.tipo === 'RECEITA' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {lanc.tipo === 'RECEITA' ? '+' : '-'} {formatarMoeda(Number(lanc.valor))}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => excluirLancamento(lanc.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="produtos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Venda Rápida de Produtos
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Clique no produto para registrar a venda (diminui 1 unidade do estoque e registra receita)
              </p>
            </CardHeader>
            <CardContent>
              {produtos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum produto cadastrado
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {produtos
                    .filter(p => p.quantidade_estoque > 0)
                    .map((produto) => (
                      <Card 
                        key={produto.id} 
                        className={`border cursor-pointer hover:shadow-md transition-shadow ${
                          produto.quantidade_estoque <= produto.estoque_minimo 
                            ? 'border-orange-300' 
                            : 'border-gray-200'
                        }`}
                        onClick={() => venderProduto(produto.id)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{produto.nome}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={
                                  produto.quantidade_estoque <= produto.estoque_minimo 
                                    ? 'destructive' 
                                    : 'secondary'
                                }>
                                  <Package className="mr-1 h-3 w-3" />
                                  {produto.quantidade_estoque} un
                                </Badge>
                                {produto.quantidade_estoque <= produto.estoque_minimo && (
                                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="text-xl font-bold text-green-600">
                              {formatarMoeda(Number(produto.preco_venda))}
                            </div>
                            <Button 
                              size="sm"
                              disabled={loadingVenda === produto.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                venderProduto(produto.id)
                              }}
                            >
                              {loadingVenda === produto.id ? (
                                <>
                                  <span className="animate-spin mr-2">⏳</span>
                                  Vendendo...
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="mr-1 h-4 w-4" />
                                  Vender
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
              {produtos.filter(p => p.quantidade_estoque > 0).length === 0 && produtos.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  Todos os produtos estão sem estoque
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Relatórios Salvos
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => gerarRelatorio('SEMANAL')}>
                    Gerar Semanal
                  </Button>
                  <Button size="sm" onClick={() => gerarRelatorio('MENSAL')}>
                    Gerar Mensal
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {relatorios.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum relatório salvo ainda
                </div>
              ) : (
                <div className="space-y-3">
                  {relatorios.map((rel) => (
                    <Card key={rel.id} className="border">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">Relatório {rel.tipo_periodo}</h3>
                            <p className="text-sm text-gray-500">
                              {formatarData(rel.data_inicio)} a {formatarData(rel.data_fim)}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400">
                            Gerado em {formatarData(rel.data_criacao)}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Receitas</p>
                            <p className="font-semibold text-green-600">
                              {formatarMoeda(Number(rel.total_receitas))}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Despesas</p>
                            <p className="font-semibold text-red-600">
                              {formatarMoeda(Number(rel.total_despesas))}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Saldo</p>
                            <p className={`font-semibold ${
                              Number(rel.saldo) >= 0 ? 'text-blue-600' : 'text-orange-600'
                            }`}>
                              {formatarMoeda(Number(rel.saldo))}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Lançamento */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Lançamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value, categoria: '' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECEITA">Receita</SelectItem>
                  <SelectItem value="DESPESA">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Categoria *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {(formData.tipo === 'RECEITA' ? categoriasReceita : categoriasDespesa).map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Descrição *</Label>
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: Pagamento de corte"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={formData.data_lancamento}
                  onChange={(e) => setFormData({ ...formData, data_lancamento: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Informações adicionais (opcional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarLancamento}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
