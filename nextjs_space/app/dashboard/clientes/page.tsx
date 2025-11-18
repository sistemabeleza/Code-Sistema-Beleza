'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, Download, MessageCircle, Phone, Mail, Calendar, TrendingUp, FileDown, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Cliente {
  id: string
  nome: string
  telefone: string
  email: string | null
  total_agendamentos: number
  ultimo_agendamento: {
    data: Date
    hora_inicio: Date
    status: string
  } | null
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [exportando, setExportando] = useState(false)

  useEffect(() => {
    carregarClientes()
  }, [])

  async function carregarClientes() {
    try {
      setLoading(true)
      const res = await fetch('/api/clientes')
      const data = await res.json()

      if (res.ok) {
        setClientes(data)
      } else {
        toast.error(data.error || 'Erro ao carregar clientes')
      }
    } catch (error) {
      toast.error('Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  async function exportarContatos(formato: 'vcard' | 'csv') {
    try {
      setExportando(true)
      const res = await fetch(`/api/clientes/exportar?formato=${formato}`)
      
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = formato === 'vcard' 
          ? `clientes_${new Date().toISOString().split('T')[0]}.vcf`
          : `clientes_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        toast.success(`Contatos exportados em ${formato.toUpperCase()}!`)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao exportar contatos')
      }
    } catch (error) {
      toast.error('Erro ao exportar contatos')
    } finally {
      setExportando(false)
    }
  }

  function abrirWhatsApp(cliente: Cliente) {
    const telefone = cliente.telefone.replace(/\D/g, '')
    const nomeCliente = cliente.nome.split(' ')[0] // Primeiro nome
    
    let mensagem = `Olá ${nomeCliente}! 👋`
    
    if (cliente.ultimo_agendamento) {
      const dataAgendamento = new Date(cliente.ultimo_agendamento.data)
      const horaAgendamento = new Date(cliente.ultimo_agendamento.hora_inicio)
      
      const dataFormatada = dataAgendamento.toLocaleDateString('pt-BR')
      const horaFormatada = horaAgendamento.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
      
      if (cliente.ultimo_agendamento.status === 'AGENDADO' || cliente.ultimo_agendamento.status === 'CONFIRMADO') {
        mensagem += `\n\nLembrando do seu agendamento em ${dataFormatada} às ${horaFormatada}! ⏰\n\nEstamos te esperando! 💈✨`
      } else {
        mensagem += `\n\nQue tal agendar um novo horário? Estamos com horários disponíveis! 📅`
      }
    } else {
      mensagem += `\n\nQue tal agendar um horário? Estamos te esperando! 💈✨`
    }

    const whatsappUrl = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`
    window.open(whatsappUrl, '_blank')
  }

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone.includes(searchTerm) ||
    (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">
            {clientes.length} {clientes.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={exportando || clientes.length === 0}>
              {exportando ? (
                <>Exportando...</>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Contatos
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => exportarContatos('vcard')}>
              <Phone className="mr-2 h-4 w-4" />
              Exportar como vCard (.vcf)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportarContatos('csv')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar como CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientes.length}</div>
            <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientes.reduce((acc, c) => acc + c.total_agendamentos, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Histórico completo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média por Cliente</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientes.length > 0
                ? (clientes.reduce((acc, c) => acc + c.total_agendamentos, 0) / clientes.length).toFixed(1)
                : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Agendamentos/cliente</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Lista de Clientes
          </CardTitle>
          <CardDescription>
            Clientes centralizados automaticamente dos agendamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Buscar por nome, telefone ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />

            {clientesFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Tente buscar com outros termos'
                    : 'Os clientes aparecerão automaticamente após o primeiro agendamento'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {clientesFiltrados.map((cliente) => (
                  <Card key={cliente.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {/* Nome e Badge */}
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-lg">{cliente.nome}</h3>
                          <Badge variant={cliente.total_agendamentos > 5 ? 'default' : 'secondary'}>
                            {cliente.total_agendamentos} {cliente.total_agendamentos === 1 ? 'visita' : 'visitas'}
                          </Badge>
                        </div>

                        {/* Contatos */}
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{cliente.telefone}</span>
                          </div>
                          {cliente.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span className="truncate">{cliente.email}</span>
                            </div>
                          )}
                        </div>

                        {/* Último Agendamento */}
                        {cliente.ultimo_agendamento && (
                          <div className="pt-2 border-t text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Último agendamento:</span>
                            </div>
                            <div className="mt-1">
                              {new Date(cliente.ultimo_agendamento.data).toLocaleDateString('pt-BR')}
                              {' às '}
                              {new Date(cliente.ultimo_agendamento.hora_inicio).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        )}

                        {/* Botão WhatsApp */}
                        <Button
                          onClick={() => abrirWhatsApp(cliente)}
                          className="w-full"
                          variant="outline"
                          size="sm"
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Enviar WhatsApp
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
