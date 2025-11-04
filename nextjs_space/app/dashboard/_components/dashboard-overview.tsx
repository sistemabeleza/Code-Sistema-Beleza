
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  Star,
  AlertTriangle,
  ArrowRight,
  Package
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DashboardData {
  resumoFinanceiro: {
    receita_hoje: number
    receita_mes: number
    agendamentos_hoje: number
    clientes_total: number
    servicos_realizados_mes: number
  }
  agendamentosProximos: any[]
  servicosMaisVendidos: any[]
  profissionaisDesempenho: any[]
  produtosBaixoEstoque: any[]
}

interface DashboardOverviewProps {
  data: DashboardData
}

export function DashboardOverview({ data }: DashboardOverviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AGENDADO':
        return 'bg-blue-100 text-blue-800'
      case 'CONFIRMADO':
        return 'bg-green-100 text-green-800'
      case 'EM_ANDAMENTO':
        return 'bg-yellow-100 text-yellow-800'
      case 'REALIZADO':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AGENDADO':
        return 'Agendado'
      case 'CONFIRMADO':
        return 'Confirmado'
      case 'EM_ANDAMENTO':
        return 'Em Andamento'
      case 'REALIZADO':
        return 'Realizado'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita de Hoje
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.resumoFinanceiro.receita_hoje)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita do Mês
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.resumoFinanceiro.receita_mes)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agendamentos Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.resumoFinanceiro.agendamentos_hoje}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.resumoFinanceiro.clientes_total}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Agendamentos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Próximos Agendamentos</CardTitle>
            <Link href="/dashboard/agenda">
              <Button variant="outline" size="sm">
                Ver Todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.agendamentosProximos?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhum agendamento encontrado
              </p>
            ) : (
              data.agendamentosProximos?.map((agendamento) => (
                <div key={agendamento.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">
                        {agendamento.cliente?.nome}
                      </p>
                      <p className="text-xs text-gray-500">
                        {agendamento.servico?.nome} - {agendamento.profissional?.nome}
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(agendamento.hora_inicio), "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(agendamento.status)}>
                    {getStatusLabel(agendamento.status)}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Serviços Mais Vendidos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Serviços Mais Vendidos</CardTitle>
            <Link href="/dashboard/relatorios">
              <Button variant="outline" size="sm">
                Ver Relatório
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.servicosMaisVendidos?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhum serviço vendido este mês
              </p>
            ) : (
              data.servicosMaisVendidos?.map((servico, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Star className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{servico.nome}</p>
                      <p className="text-xs text-gray-500">{servico.categoria}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{servico.quantidade}x</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(servico.receita)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Performance dos Profissionais */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Performance dos Profissionais</CardTitle>
            <Link href="/dashboard/profissionais">
              <Button variant="outline" size="sm">
                Ver Todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.profissionaisDesempenho?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhum serviço realizado este mês
              </p>
            ) : (
              data.profissionaisDesempenho?.map((profissional, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{profissional.nome}</p>
                      <p className="text-xs text-gray-500">
                        {profissional.servicos_realizados} serviços
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatCurrency(profissional.receita_gerada)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Comissão: {formatCurrency(profissional.comissao_total)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Produtos com Baixo Estoque */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Estoque Baixo</CardTitle>
            <Link href="/dashboard/produtos">
              <Button variant="outline" size="sm">
                Gerenciar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.produtosBaixoEstoque?.length === 0 ? (
              <p className="text-green-600 text-center py-4">
                Todos os produtos com estoque adequado
              </p>
            ) : (
              data.produtosBaixoEstoque?.map((produto) => (
                <div key={produto.id} className="flex items-center justify-between p-3 border rounded-lg border-orange-200 bg-orange-50">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="font-medium text-sm">{produto.nome}</p>
                      <p className="text-xs text-gray-500">{produto.categoria}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">
                      {produto.quantidade_estoque} un.
                    </p>
                    <p className="text-xs text-gray-500">
                      Mín: {produto.estoque_minimo}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
