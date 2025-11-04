'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Pagamento {
  id: string
  valor: number
  forma_pagamento: string
  status: string
  data_criacao: string
  agendamento?: {
    cliente: { nome: string }
    servico: { nome: string }
  }
  venda?: {
    numero_venda: string
    cliente: { nome: string } | null
  }
  profissional?: { nome: string }
}

interface Comissao {
  profissional: string
  total_servicos: number
  total_faturado: number
  total_comissao: number
}

export default function FinanceiroPage() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [comissoes, setComissoes] = useState<Comissao[]>([])
  const [resumo, setResumo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const response = await fetch('/api/financeiro')
      const data = await response.json()
      
      setPagamentos(data.pagamentos || [])
      setComissoes(data.comissoes || [])
      setResumo(data.resumo || {})
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-gray-600">Controle financeiro e comissões</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
              Total Recebido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatarMoeda(resumo.total_recebido || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingDown className="mr-2 h-4 w-4 text-orange-600" />
              Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatarMoeda(resumo.total_pendente || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-blue-600" />
              Dinheiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarMoeda(resumo.por_forma_pagamento?.DINHEIRO || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <CreditCard className="mr-2 h-4 w-4 text-purple-600" />
              Cartão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarMoeda((resumo.por_forma_pagamento?.CREDITO || 0) + (resumo.por_forma_pagamento?.DEBITO || 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pagamentos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          <TabsTrigger value="comissoes">Comissões</TabsTrigger>
          <TabsTrigger value="formas">Formas de Pagamento</TabsTrigger>
        </TabsList>

        <TabsContent value="pagamentos">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pagamentos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum pagamento registrado
                  </div>
                ) : (
                  pagamentos.slice(0, 20).map((pag) => (
                    <div key={pag.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium">
                          {pag.agendamento ? (
                            <>
                              {pag.agendamento.cliente.nome} - {pag.agendamento.servico.nome}
                            </>
                          ) : pag.venda ? (
                            <>
                              Venda {pag.venda.numero_venda}
                              {pag.venda.cliente && ` - ${pag.venda.cliente.nome}`}
                            </>
                          ) : (
                            'Pagamento'
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatarData(pag.data_criacao)}
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <div className="font-semibold text-green-600">
                            {formatarMoeda(Number(pag.valor))}
                          </div>
                          <div className="text-xs text-gray-500">
                            {pag.forma_pagamento}
                          </div>
                        </div>
                        <Badge variant={pag.status === 'PAGO' ? 'default' : pag.status === 'PENDENTE' ? 'secondary' : 'destructive'}>
                          {pag.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comissoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Comissões por Profissional
              </CardTitle>
            </CardHeader>
            <CardContent>
              {comissoes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma comissão calculada
                </div>
              ) : (
                <div className="space-y-4">
                  {comissoes.map((com, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-lg">{com.profissional}</h3>
                          <Badge>{com.total_servicos} serviços</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Total Faturado</p>
                            <p className="font-semibold text-blue-600">
                              {formatarMoeda(com.total_faturado)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Total Comissão</p>
                            <p className="font-semibold text-green-600">
                              {formatarMoeda(com.total_comissao)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Média por Serviço</p>
                            <p className="font-semibold">
                              {formatarMoeda(com.total_faturado / com.total_servicos)}
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

        <TabsContent value="formas">
          <Card>
            <CardHeader>
              <CardTitle>Recebimentos por Forma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(resumo.por_forma_pagamento || {}).map(([forma, valor]: [string, any]) => (
                  <div key={forma} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        forma === 'PIX' ? 'bg-green-100' :
                        forma === 'DINHEIRO' ? 'bg-blue-100' :
                        forma === 'CREDITO' ? 'bg-purple-100' :
                        forma === 'DEBITO' ? 'bg-orange-100' :
                        'bg-gray-100'
                      }`}>
                        <CreditCard className={`h-5 w-5 ${
                          forma === 'PIX' ? 'text-green-600' :
                          forma === 'DINHEIRO' ? 'text-blue-600' :
                          forma === 'CREDITO' ? 'text-purple-600' :
                          forma === 'DEBITO' ? 'text-orange-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium">{forma}</div>
                        <div className="text-sm text-gray-500">
                          {((Number(valor) / resumo.total_recebido) * 100).toFixed(1)}% do total
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {formatarMoeda(Number(valor))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
