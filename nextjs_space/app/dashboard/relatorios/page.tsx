'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, Calendar, Package, AlertTriangle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export default function RelatoriosPage() {
  const [dados, setDados] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30')

  useEffect(() => {
    carregarDados()
  }, [periodo])

  const carregarDados = async () => {
    try {
      const response = await fetch(`/api/relatorios/dashboard?periodo=${periodo}`)
      const data = await response.json()
      setDados(data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
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

  const resumo = dados.resumo || {}
  const agendamentosPorStatus = dados.agendamentos_por_status || []
  const faturamentoPorDia = dados.faturamento_por_dia || []
  const servicosMaisVendidos = dados.servicos_mais_vendidos || []
  const produtosEstoqueBaixo = dados.produtos_estoque_baixo || []
  const clientesMaisAtivos = dados.clientes_mais_ativos || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h1>
          <p className="text-gray-600">Visão geral do seu negócio</p>
        </div>
        <div className="w-48">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
              Faturamento Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatarMoeda(resumo.total_faturamento || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Últimos {periodo} dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-blue-600" />
              Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {resumo.total_agendamentos || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total de agendamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="mr-2 h-4 w-4 text-purple-600" />
              Clientes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {resumo.total_clientes || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="mr-2 h-4 w-4 text-orange-600" />
              Profissionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {resumo.total_profissionais || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Profissionais ativos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Agendamentos por Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Agendamentos por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agendamentosPorStatus.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Nenhum agendamento</p>
              ) : (
                agendamentosPorStatus.map((item: any) => (
                  <div key={item.status} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <Badge 
                        variant={
                          item.status === 'REALIZADO' ? 'default' :
                          item.status === 'AGENDADO' || item.status === 'CONFIRMADO' ? 'secondary' :
                          'destructive'
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{item._count}</div>
                      <div className="text-xs text-gray-500">
                        {((item._count / resumo.total_agendamentos) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Serviços Mais Vendidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Serviços Mais Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {servicosMaisVendidos.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Nenhum serviço realizado</p>
              ) : (
                servicosMaisVendidos.map((item: any, index: number) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-semibold">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{item.nome}</div>
                        <div className="text-sm text-gray-500">
                          {formatarMoeda(Number(item.preco))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{item.total}</div>
                      <div className="text-xs text-gray-500">realizações</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Faturamento por Dia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Faturamento Diário
          </CardTitle>
        </CardHeader>
        <CardContent>
          {faturamentoPorDia.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum faturamento registrado</p>
          ) : (
            <div className="space-y-2">
              {faturamentoPorDia.slice(-10).map((item: any) => {
                const maxValor = Math.max(...faturamentoPorDia.map((d: any) => d.valor))
                const porcentagem = (item.valor / maxValor) * 100
                
                return (
                  <div key={item.dia} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {new Date(item.dia).toLocaleDateString('pt-BR', { 
                          day: '2-digit', 
                          month: 'short' 
                        })}
                      </span>
                      <span className="font-semibold text-green-600">
                        {formatarMoeda(item.valor)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all" 
                        style={{ width: `${porcentagem}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Clientes Mais Ativos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Clientes Mais Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientesMaisAtivos.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Nenhum cliente ativo</p>
              ) : (
                clientesMaisAtivos.map((item: any, index: number) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <span className="text-purple-600 font-semibold">
                          {item.nome?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{item.nome}</div>
                        <div className="text-sm text-gray-500">{item.telefone}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-purple-600">
                        {item.total_agendamentos}
                      </div>
                      <div className="text-xs text-gray-500">agendamentos</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Produtos com Estoque Baixo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5 text-orange-600" />
              <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />
              Alertas de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            {produtosEstoqueBaixo.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-green-400 mx-auto mb-2" />
                <p className="text-green-600 font-medium">Estoque OK!</p>
                <p className="text-sm text-gray-500">Todos os produtos acima do mínimo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {produtosEstoqueBaixo.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-orange-200 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
                      <div>
                        <div className="font-medium text-orange-900">{item.nome}</div>
                        <div className="text-sm text-orange-700">
                          Mínimo: {item.estoque_minimo}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-orange-600">
                        {item.quantidade_estoque}
                      </div>
                      <div className="text-xs text-orange-700">em estoque</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
