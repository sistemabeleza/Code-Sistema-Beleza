
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { DollarSign, TrendingUp, Users, Calendar, Download, Percent } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
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

export default function RelatorioComissoesPage() {
  const [loading, setLoading] = useState(true)
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [comissoes, setComissoes] = useState<ComissaoProfissional[]>([])
  const [totalGeral, setTotalGeral] = useState(0)
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<string>('all')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [expandido, setExpandido] = useState<string | null>(null)

  useEffect(() => {
    carregarProfissionais()
    // Definir período padrão (último mês)
    const hoje = new Date()
    const mesPassado = new Date(hoje)
    mesPassado.setMonth(mesPassado.getMonth() - 1)
    
    setDataInicio(format(mesPassado, 'yyyy-MM-dd'))
    setDataFim(format(hoje, 'yyyy-MM-dd'))
  }, [])

  useEffect(() => {
    if (dataInicio && dataFim) {
      carregarComissoes()
    }
  }, [dataInicio, dataFim, profissionalSelecionado])

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
        <p className="text-gray-600 mt-2">Acompanhe as comissões devidas aos profissionais</p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data-inicio">Data Início</Label>
              <Input
                id="data-inicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data-fim">Data Fim</Label>
              <Input
                id="data-fim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profissionais</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {comissoes.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {comissoes.reduce((sum, item) => sum + item.total_servicos, 0)}
            </div>
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
          {comissoes.map((item) => (
            <Card key={item.profissional.id}>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandido(expandido === item.profissional.id ? null : item.profissional.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">{item.profissional.nome}</CardTitle>
                    <div className="flex gap-3 mt-2 text-sm text-gray-600">
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
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Comissão Total</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatarMoeda(item.total_comissao)}
                    </div>
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
          ))}
        </div>
      )}
    </div>
  )
}
