
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { DollarSign, TrendingUp, Users, Calendar, Download, Percent, ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Profissional {
  id: string
  nome: string
  commission_type?: string | null
  commission_value?: number | null
}

interface Servico {
  nome: string
  preco: number
}

interface Cliente {
  nome: string
}

interface ItemComissao {
  id: string
  data: Date
  profissional: Profissional
  servico: Servico
  cliente: Cliente
  valor_servico: number
  valor_comissao: number
}

interface ComissaoProfissional {
  profissional: Profissional
  total_servicos: number
  total_valor_servicos: number
  total_comissao: number
  servicos: ItemComissao[]
}

type PeriodoPreset = 'semanal' | 'quinzenal' | 'mensal' | 'mes_anterior' | 'custom'

export default function RelatorioComissoesPage() {
  const [loading, setLoading] = useState(true)
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [comissoes, setComissoes] = useState<ComissaoProfissional[]>([])
  const [comissoesMesAnterior, setComissoesMesAnterior] = useState<ComissaoProfissional[]>([])
  const [totalGeral, setTotalGeral] = useState(0)
  const [totalMesAnterior, setTotalMesAnterior] = useState(0)
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<string>('all')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [periodoSelecionado, setPeriodoSelecionado] = useState<PeriodoPreset>('mensal')
  const [expandido, setExpandido] = useState<string | null>(null)

  useEffect(() => {
    carregarProfissionais()
    // Definir período padrão (mês atual)
    aplicarPeriodoPreset('mensal')
  }, [])

  useEffect(() => {
    if (dataInicio && dataFim) {
      carregarComissoes()
      carregarComissoesMesAnterior()
    }
  }, [dataInicio, dataFim, profissionalSelecionado])

  function aplicarPeriodoPreset(periodo: PeriodoPreset) {
    const hoje = new Date()
    let inicio: Date
    let fim: Date

    switch (periodo) {
      case 'semanal':
        // Últimos 7 dias
        inicio = subDays(hoje, 6)
        fim = hoje
        break
      
      case 'quinzenal':
        // Últimos 15 dias
        inicio = subDays(hoje, 14)
        fim = hoje
        break
      
      case 'mensal':
        // Mês atual
        inicio = startOfMonth(hoje)
        fim = endOfMonth(hoje)
        break
      
      case 'mes_anterior':
        // Mês anterior completo
        const mesAnterior = subMonths(hoje, 1)
        inicio = startOfMonth(mesAnterior)
        fim = endOfMonth(mesAnterior)
        break
      
      default:
        return
    }

    setDataInicio(format(inicio, 'yyyy-MM-dd'))
    setDataFim(format(fim, 'yyyy-MM-dd'))
    setPeriodoSelecionado(periodo)
  }

  async function carregarProfissionais() {
    try {
      const res = await fetch('/api/profissionais')
      if (res.ok) {
        const data = await res.json()
        setProfissionais(data)
      }
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error)
    }
  }

  async function carregarComissoes() {
    try {
      setLoading(true)
      
      let url = `/api/relatorios/comissoes?dataInicio=${dataInicio}&dataFim=${dataFim}`
      
      if (profissionalSelecionado !== 'all') {
        url += `&profissionalId=${profissionalSelecionado}`
      }

      const res = await fetch(url)
      
      if (res.ok) {
        const data = await res.json()
        setComissoes(data.comissoes || [])
        setTotalGeral(data.total_geral || 0)
      } else {
        toast.error('Erro ao carregar comissões')
      }
    } catch (error) {
      console.error('Erro ao carregar comissões:', error)
      toast.error('Erro ao carregar comissões')
    } finally {
      setLoading(false)
    }
  }

  async function carregarComissoesMesAnterior() {
    try {
      // Calcular o mês anterior
      const hoje = new Date()
      const mesAnterior = subMonths(hoje, 1)
      const inicioMesAnterior = format(startOfMonth(mesAnterior), 'yyyy-MM-dd')
      const fimMesAnterior = format(endOfMonth(mesAnterior), 'yyyy-MM-dd')
      
      let url = `/api/relatorios/comissoes?dataInicio=${inicioMesAnterior}&dataFim=${fimMesAnterior}`
      
      if (profissionalSelecionado !== 'all') {
        url += `&profissionalId=${profissionalSelecionado}`
      }

      const res = await fetch(url)
      
      if (res.ok) {
        const data = await res.json()
        setComissoesMesAnterior(data.comissoes || [])
        setTotalMesAnterior(data.total_geral || 0)
      }
    } catch (error) {
      console.error('Erro ao carregar comissões do mês anterior:', error)
    }
  }

  function obterComissaoMesAnterior(profissionalId: string): number {
    const comissao = comissoesMesAnterior.find(c => c.profissional.id === profissionalId)
    return comissao?.total_comissao || 0
  }

  function calcularVariacao(valorAtual: number, valorAnterior: number): { porcentagem: number, positivo: boolean } {
    if (valorAnterior === 0) {
      return { porcentagem: valorAtual > 0 ? 100 : 0, positivo: valorAtual > 0 }
    }
    
    const variacao = ((valorAtual - valorAnterior) / valorAnterior) * 100
    return { porcentagem: Math.abs(variacao), positivo: variacao >= 0 }
  }

  function getNomePeriodo(): string {
    switch (periodoSelecionado) {
      case 'semanal':
        return 'Últimos 7 dias'
      case 'quinzenal':
        return 'Últimos 15 dias'
      case 'mensal':
        return 'Mês atual'
      case 'mes_anterior':
        return 'Mês anterior'
      default:
        return 'Período personalizado'
    }
  }

  function formatarMoeda(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  function exportarCSV() {
    if (comissoes.length === 0) {
      toast.error('Não há dados para exportar')
      return
    }

    // Cabeçalho
    let csv = 'Profissional,Data,Cliente,Serviço,Valor Serviço,Tipo Comissão,Valor Comissão\n'

    // Dados
    comissoes.forEach(item => {
      item.servicos.forEach(servico => {
        const tipoComissao = item.profissional.commission_type === 'PERCENTAGE'
          ? `${item.profissional.commission_value}%`
          : item.profissional.commission_type === 'FIXED'
          ? 'Valor Fixo'
          : 'Sem comissão'

        csv += `"${item.profissional.nome}",`
        csv += `"${format(new Date(servico.data), 'dd/MM/yyyy', { locale: ptBR })}",`
        csv += `"${servico.cliente.nome}",`
        csv += `"${servico.servico.nome}",`
        csv += `"${formatarMoeda(servico.valor_servico)}",`
        csv += `"${tipoComissao}",`
        csv += `"${formatarMoeda(servico.valor_comissao)}"\n`
      })
    })

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `comissoes_${dataInicio}_${dataFim}.csv`
    link.click()
    
    toast.success('Relatório exportado com sucesso!')
  }

  if (loading && comissoes.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Carregando relatório...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Relatório de Comissões</h1>
        <p className="text-gray-600 mt-2">Acompanhe as comissões devidas aos profissionais • {getNomePeriodo()}</p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros e Período</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Botões de Período Rápido */}
          <div className="mb-6">
            <Label className="mb-2 block">Período</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={periodoSelecionado === 'semanal' ? 'default' : 'outline'}
                onClick={() => aplicarPeriodoPreset('semanal')}
                size="sm"
              >
                Semanal (7 dias)
              </Button>
              <Button
                variant={periodoSelecionado === 'quinzenal' ? 'default' : 'outline'}
                onClick={() => aplicarPeriodoPreset('quinzenal')}
                size="sm"
              >
                Quinzenal (15 dias)
              </Button>
              <Button
                variant={periodoSelecionado === 'mensal' ? 'default' : 'outline'}
                onClick={() => aplicarPeriodoPreset('mensal')}
                size="sm"
              >
                Mês Atual
              </Button>
              <Button
                variant={periodoSelecionado === 'mes_anterior' ? 'default' : 'outline'}
                onClick={() => aplicarPeriodoPreset('mes_anterior')}
                size="sm"
              >
                Mês Anterior
              </Button>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Filtros Detalhados */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data-inicio">Data Início</Label>
              <Input
                id="data-inicio"
                type="date"
                value={dataInicio}
                onChange={(e) => {
                  setDataInicio(e.target.value)
                  setPeriodoSelecionado('custom')
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data-fim">Data Fim</Label>
              <Input
                id="data-fim"
                type="date"
                value={dataFim}
                onChange={(e) => {
                  setDataFim(e.target.value)
                  setPeriodoSelecionado('custom')
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profissional">Profissional</Label>
              <Select
                value={profissionalSelecionado}
                onValueChange={setProfissionalSelecionado}
              >
                <SelectTrigger id="profissional">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os profissionais</SelectItem>
                  {profissionais.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={exportarCSV}
                variant="outline"
                className="w-full"
                disabled={comissoes.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Comissões</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatarMoeda(totalGeral)}
            </div>
            {periodoSelecionado === 'mensal' && totalMesAnterior > 0 && (
              <div className="mt-2 flex items-center text-sm">
                {(() => {
                  const { porcentagem, positivo } = calcularVariacao(totalGeral, totalMesAnterior)
                  return (
                    <>
                      <ArrowUpDown className={`h-3 w-3 mr-1 ${positivo ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={positivo ? 'text-green-600' : 'text-red-600'}>
                        {positivo ? '+' : '-'}{porcentagem.toFixed(1)}%
                      </span>
                      <span className="text-gray-500 ml-1">vs mês anterior</span>
                    </>
                  )
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profissionais Ativos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {comissoes.length}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              com comissões no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {comissoes.reduce((sum, item) => sum + item.total_servicos, 0)}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              serviços realizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Comissões por Profissional */}
      {comissoes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma comissão encontrada
            </h3>
            <p className="text-gray-600">
              Não há serviços concluídos com comissão no período selecionado.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {comissoes.map((item) => {
            const comissaoMesAnterior = obterComissaoMesAnterior(item.profissional.id)
            const variacao = calcularVariacao(item.total_comissao, comissaoMesAnterior)
            
            return (
              <Card key={item.profissional.id}>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandido(expandido === item.profissional.id ? null : item.profissional.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl">{item.profissional.nome}</CardTitle>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {item.total_servicos} serviços
                        </span>
                        {item.profissional.commission_type && (
                          <Badge variant="outline">
                            {item.profissional.commission_type === 'PERCENTAGE' ? (
                              <>
                                <Percent className="h-3 w-3 mr-1" />
                                {item.profissional.commission_value}%
                              </>
                            ) : (
                              <>
                                <DollarSign className="h-3 w-3 mr-1" />
                                Fixo: {formatarMoeda(item.profissional.commission_value || 0)}
                              </>
                            )}
                          </Badge>
                        )}
                        {periodoSelecionado === 'mensal' && comissaoMesAnterior > 0 && (
                          <Badge 
                            variant="outline" 
                            className={variacao.positivo ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'}
                          >
                            <ArrowUpDown className="h-3 w-3 mr-1" />
                            {variacao.positivo ? '+' : '-'}{variacao.porcentagem.toFixed(1)}% vs mês anterior
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Comissão Total</div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatarMoeda(item.total_comissao)}
                      </div>
                      {periodoSelecionado === 'mensal' && comissaoMesAnterior > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Mês anterior: {formatarMoeda(comissaoMesAnterior)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {expandido === item.profissional.id && (
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    <div className="space-y-3">
                      {item.servicos.map((servico) => (
                        <div 
                          key={servico.id}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{servico.servico.nome}</div>
                            <div className="text-sm text-gray-600">
                              {servico.cliente.nome} • {format(new Date(servico.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Valor do serviço: {formatarMoeda(servico.valor_servico)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Comissão</div>
                            <div className="font-bold text-green-600">
                              {formatarMoeda(servico.valor_comissao)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
