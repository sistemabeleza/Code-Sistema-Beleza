'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ExternalLink, Instagram, MessageCircle, Copy, Crown, Zap, Rocket, Send, CheckCircle2, Bell } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Componente de Preview de Mensagens
function PreviewMensagens({ salaoNome, salaoTelefone }: { salaoNome: string, salaoTelefone: string }) {
  const [tipoEvento, setTipoEvento] = useState<'agendamento_criado' | 'agendamento_atualizado' | 'agendamento_cancelado' | 'agendamento_lembrete'>('agendamento_criado')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    carregarPreview()
  }, [tipoEvento, salaoNome, salaoTelefone])

  async function carregarPreview() {
    try {
      setCarregando(true)
      
      // Monta payload de exemplo
      const payload = {
        evento: tipoEvento,
        timestamp: new Date().toISOString(),
        salao: {
          nome: salaoNome || 'Seu Salão',
          telefone: salaoTelefone || '(00) 00000-0000'
        },
        agendamento: {
          id: 1,
          data: new Date().toISOString().split('T')[0],
          hora_inicio: '15:00',
          hora_fim: '16:00',
          status: 'confirmado'
        },
        cliente: {
          nome: 'Maria Silva',
          telefone: '31999999999'
        },
        servico: {
          nome: 'Corte e Escova'
        },
        profissional: {
          nome: 'Ana Paula'
        }
      }

      const res = await fetch('/api/mensagens/formatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        setMensagem(data.mensagem)
      }
    } catch (error) {
      console.error('Erro ao carregar preview:', error)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Seletor de Tipo de Evento */}
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={tipoEvento === 'agendamento_criado' ? 'default' : 'outline'}
          onClick={() => setTipoEvento('agendamento_criado')}
          className={tipoEvento === 'agendamento_criado' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          Criado
        </Button>
        <Button
          size="sm"
          variant={tipoEvento === 'agendamento_atualizado' ? 'default' : 'outline'}
          onClick={() => setTipoEvento('agendamento_atualizado')}
          className={tipoEvento === 'agendamento_atualizado' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          Atualizado
        </Button>
        <Button
          size="sm"
          variant={tipoEvento === 'agendamento_cancelado' ? 'default' : 'outline'}
          onClick={() => setTipoEvento('agendamento_cancelado')}
          className={tipoEvento === 'agendamento_cancelado' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          Cancelado
        </Button>
        <Button
          size="sm"
          variant={tipoEvento === 'agendamento_lembrete' ? 'default' : 'outline'}
          onClick={() => setTipoEvento('agendamento_lembrete')}
          className={tipoEvento === 'agendamento_lembrete' ? 'bg-purple-600 hover:bg-purple-700' : ''}
        >
          Lembrete
        </Button>
      </div>

      {/* Preview da Mensagem */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        {carregando ? (
          <div className="text-sm text-gray-500">Carregando preview...</div>
        ) : (
          <pre className="text-sm whitespace-pre-wrap font-sans text-gray-700">
            {mensagem}
          </pre>
        )}
      </div>

      <p className="text-xs text-gray-600">
        💬 Esta é a mensagem que será enviada para o cliente via WhatsApp
      </p>
    </div>
  )
}

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null)
  const [formData, setFormData] = useState({
    nome: '',
    document_type: 'CPF',
    document: '',
    telefone: '',
    email: '',
    endereco: '',
    slug: '',
    descricao: '',
    instagram_handle: '',
    whatsapp_number: '',
    timezone: 'America/Sao_Paulo'
  })

  // Estado para webhook Fiqon (simples)
  const [webhookConfig, setWebhookConfig] = useState({
    automacao_ativa: false,
    webhook_fiqon: ''
  })
  const [testando, setTestando] = useState(false)

  useEffect(() => {
    carregarConfiguracoes()
  }, [])

  async function carregarConfiguracoes() {
    try {
      setLoading(true)
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setFormData({
          nome: data.nome || '',
          document_type: data.document_type || 'CPF',
          document: data.document || '',
          telefone: data.telefone || '',
          email: data.email || '',
          endereco: data.endereco || '',
          slug: data.slug || '',
          descricao: data.descricao || '',
          instagram_handle: data.instagram_handle || '',
          whatsapp_number: data.whatsapp_number || '',
          timezone: data.timezone || 'America/Sao_Paulo'
        })
        
        // Carregar configurações webhook Fiqon
        setWebhookConfig({
          automacao_ativa: data.automacao_ativa || false,
          webhook_fiqon: data.webhook_fiqon || ''
        })
        
        // Armazenar informações de assinatura
        setSubscriptionInfo({
          plano: data.plano,
          status: data.status,
          subscription_end_date: data.subscription_end_date,
          is_trial_active: data.is_trial_active
        })
      }
    } catch (error) {
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  async function salvar() {
    if (!formData.nome || formData.nome.trim() === '') {
      toast.error('Nome do estabelecimento é obrigatório')
      return
    }

    // Validação de documento - apenas se preenchido
    if (formData.document && formData.document.trim()) {
      const cleanDoc = formData.document.replace(/\D/g, '')
      if (cleanDoc.length > 0) {
        if (formData.document_type === 'CPF' && cleanDoc.length !== 11) {
          toast.error('CPF deve ter exatamente 11 dígitos')
          return
        }
        if (formData.document_type === 'CNPJ' && cleanDoc.length !== 14) {
          toast.error('CNPJ deve ter exatamente 14 dígitos')
          return
        }
      }
    }

    try {
      setSalvando(true)
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success('Configurações salvas com sucesso!')
        const data = await res.json()
        // Atualiza o slug caso tenha sido modificado
        if (data.slug) {
          setFormData(prev => ({ ...prev, slug: data.slug }))
        }
      } else {
        const error = await res.json()
        toast.error(error.error || 'Erro ao salvar configurações')
      }
    } catch (error) {
      toast.error('Erro ao salvar configurações')
    } finally {
      setSalvando(false)
    }
  }

  function copiarLinkPublico() {
    if (!formData.slug) {
      toast.error('Configure um slug primeiro')
      return
    }
    const url = `${window.location.origin}/agendamento/${formData.slug}`
    navigator.clipboard.writeText(url)
    toast.success('Link copiado!')
  }

  async function salvarWebhook() {
    // Validações
    if (webhookConfig.automacao_ativa && (!webhookConfig.webhook_fiqon || webhookConfig.webhook_fiqon.trim() === '')) {
      toast.error('Informe a URL do webhook da Fiqon')
      return
    }

    try {
      setSalvando(true)
      
      const res = await fetch('/api/configuracoes/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          automacao_ativa: webhookConfig.automacao_ativa,
          webhook_fiqon: webhookConfig.webhook_fiqon
        })
      })

      if (res.ok) {
        toast.success('Configurações salvas com sucesso!')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar webhook:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSalvando(false)
    }
  }

  async function testarWebhook() {
    if (!webhookConfig.webhook_fiqon || webhookConfig.webhook_fiqon.trim() === '') {
      toast.error('Preencha a URL do webhook antes de testar')
      return
    }

    try {
      setTestando(true)
      
      const res = await fetch('/api/configuracoes/webhook/testar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhook_fiqon: webhookConfig.webhook_fiqon
        })
      })

      const data = await res.json()

      if (data.sucesso) {
        toast.success(data.mensagem || 'Teste enviado com sucesso!')
      } else {
        toast.error(data.mensagem || 'Erro ao testar webhook')
      }
    } catch (error) {
      console.error('Erro ao testar webhook:', error)
      toast.error('Erro ao testar webhook')
    } finally {
      setTestando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do seu negócio</p>
      </div>

      <div className="grid gap-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Dados gerais do seu negócio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Estabelecimento *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Salão de Beleza"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="docType">Tipo de Documento</Label>
                <Select 
                  value={formData.document_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, document_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPF">CPF</SelectItem>
                    <SelectItem value="CNPJ">CNPJ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="document">{formData.document_type} (opcional)</Label>
                <Input
                  id="document"
                  value={formData.document}
                  onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.value }))}
                  placeholder={formData.document_type === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contato@exemplo.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                placeholder="Rua, número, bairro, cidade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição do seu negócio para o site público"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Redes Sociais */}
        <Card>
          <CardHeader>
            <CardTitle>Redes Sociais</CardTitle>
            <CardDescription>Links para suas redes sociais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="instagram"
                    value={formData.instagram_handle}
                    onChange={(e) => setFormData(prev => ({ ...prev, instagram_handle: e.target.value }))}
                    placeholder="@seuusuario ou seuusuario"
                    className="pl-10"
                  />
                </div>
                {formData.instagram_handle && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://instagram.com/${formData.instagram_handle.replace('@', '')}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                    placeholder="+55 27 99999-9999"
                    className="pl-10"
                  />
                </div>
                {formData.whatsapp_number && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://wa.me/${formData.whatsapp_number.replace(/\D/g, '')}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Formato: +55 (código do país) + DDD + número
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Link Público */}
        <Card>
          <CardHeader>
            <CardTitle>Link de Agendamento Público</CardTitle>
            <CardDescription>Configure o link personalizado para agendamentos online</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug do Link</Label>
              <div className="flex gap-2">
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase() }))}
                  placeholder="meu-salao"
                />
                <Button variant="outline" onClick={copiarLinkPublico} disabled={!formData.slug}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {formData.slug && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <code className="text-sm flex-1">
                    {window.location.origin}/agendamento/{formData.slug}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`/agendamento/${formData.slug}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Este é o link que seus clientes usarão para fazer agendamentos online
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select 
                value={formData.timezone} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                  <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                  <SelectItem value="America/Rio_Branco">Acre (GMT-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Automação WhatsApp - Fiqon + ZAPI */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-600" />
              Automação WhatsApp (Fiqon + ZAPI)
            </CardTitle>
            <CardDescription>
              Configure o envio automático de mensagens via Fiqon/ZAPI para seus clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Toggle Ativar/Desativar */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
              <div className="space-y-1">
                <Label htmlFor="automacao-toggle" className="text-base font-medium">
                  Ativar Automação WhatsApp
                </Label>
                <p className="text-sm text-muted-foreground">
                  Envie mensagens automáticas para agendamentos, confirmações e lembretes
                </p>
              </div>
              <Switch
                id="automacao-toggle"
                checked={webhookConfig.automacao_ativa}
                onCheckedChange={(checked) => setWebhookConfig(prev => ({ ...prev, automacao_ativa: checked }))}
              />
            </div>

            {webhookConfig.automacao_ativa && (
              <>
                {/* Webhook Fiqon */}
                <div className="space-y-4 p-4 bg-white rounded-lg border border-green-200">
                  <h3 className="font-medium text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-600" />
                    Webhook da Fiqon
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="webhook-fiqon">URL do Webhook *</Label>
                    <Input
                      id="webhook-fiqon"
                      value={webhookConfig.webhook_fiqon}
                      onChange={(e) => setWebhookConfig(prev => ({ ...prev, webhook_fiqon: e.target.value }))}
                      placeholder="https://app.fiqon.com.br/webhook/seu-id"
                    />
                    <p className="text-xs text-muted-foreground">
                      Cole aqui a URL do webhook que você criou no painel da Fiqon
                    </p>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-3">
                  <Button 
                    onClick={salvarWebhook} 
                    disabled={salvando}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {salvando ? 'Salvando...' : 'Salvar Configurações'}
                  </Button>
                  
                  <Button 
                    onClick={testarWebhook} 
                    disabled={testando || !webhookConfig.webhook_fiqon}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    {testando ? 'Testando...' : 'Testar Webhook'}
                  </Button>
                </div>

                {/* Aviso */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Como funciona:</strong>
                  </p>
                  <ol className="mt-2 text-xs text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Cliente agenda → Sistema envia dados para Fiqon → Fiqon envia para ZAPI → Cliente recebe mensagem</li>
                    <li>Configure o webhook na Fiqon e cole a URL aqui</li>
                    <li>A Fiqon cuidará de enviar as mensagens via ZAPI</li>
                    <li>As credenciais da ZAPI ficam apenas na Fiqon</li>
                  </ol>
                  <p className="mt-2 text-xs text-blue-700">
                    <strong>Eventos enviados:</strong> Agendamento criado, atualizado, cancelado e lembretes diários
                  </p>
                </div>

                {/* Preview de Mensagens */}
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-md">
                  <h4 className="font-medium text-sm flex items-center gap-2 mb-3">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    Preview das Mensagens Automáticas
                  </h4>
                  <PreviewMensagens salaoNome={formData.nome} salaoTelefone={formData.telefone} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Assinatura de Planos */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              Assinatura e Planos
            </CardTitle>
            <CardDescription>
              {subscriptionInfo?.is_trial_active 
                ? 'Você está no modo teste. Escolha um plano para liberar todos os recursos.'
                : subscriptionInfo?.subscription_end_date 
                  ? `Seu plano ${subscriptionInfo.plano} expira em ${new Date(subscriptionInfo.subscription_end_date).toLocaleDateString('pt-BR')}`
                  : 'Escolha um plano para começar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Plano Básico */}
              <div className="group relative overflow-hidden rounded-lg border-2 border-purple-200 bg-white p-6 transition-all hover:border-purple-400 hover:shadow-lg">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <Zap className="h-8 w-8 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                      Básico
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900">R$ 29,90</div>
                    <div className="text-sm text-gray-500">por mês</div>
                  </div>
                  <ul className="mb-6 flex-1 space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
                      2 profissionais
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
                      Agenda online
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
                      Controle financeiro
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
                      Site grátis incluso
                    </li>
                  </ul>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                    onClick={() => window.open('https://pay.cakto.com.br/ac64njr_616158', '_blank')}
                  >
                    Assinar Plano Básico
                  </Button>
                </div>
              </div>

              {/* Plano Intermediário */}
              <div className="group relative overflow-hidden rounded-lg border-2 border-pink-300 bg-white p-6 transition-all hover:border-pink-500 hover:shadow-xl">
                <div className="absolute top-0 right-0 bg-gradient-to-br from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <Rocket className="h-8 w-8 text-pink-600" />
                    <span className="text-sm font-medium text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
                      Intermediário
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900">R$ 49,90</div>
                    <div className="text-sm text-gray-500">por mês</div>
                  </div>
                  <ul className="mb-6 flex-1 space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-pink-600"></div>
                      6 profissionais
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-pink-600"></div>
                      Tudo do plano Básico
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-pink-600"></div>
                      Controle de comissões
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-pink-600"></div>
                      Gestão de estoque
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-pink-600"></div>
                      Relatórios avançados
                    </li>
                  </ul>
                  <Button
                    className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
                    onClick={() => window.open('https://pay.cakto.com.br/w2y2hgj_616200', '_blank')}
                  >
                    Assinar Plano Intermediário
                  </Button>
                </div>
              </div>

              {/* Plano Avançado */}
              <div className="group relative overflow-hidden rounded-lg border-2 border-indigo-200 bg-white p-6 transition-all hover:border-indigo-400 hover:shadow-lg">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <Crown className="h-8 w-8 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                      Avançado
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900">R$ 99,90</div>
                    <div className="text-sm text-gray-500">por mês</div>
                  </div>
                  <ul className="mb-6 flex-1 space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-600"></div>
                      Profissionais ilimitados
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-600"></div>
                      Tudo do Intermediário
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-600"></div>
                      Múltiplas unidades
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-600"></div>
                      API de integração
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-600"></div>
                      Suporte VIP 24/7
                    </li>
                  </ul>
                  <Button
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                    onClick={() => window.open('https://pay.cakto.com.br/33qmtrg_616270', '_blank')}
                  >
                    Assinar Plano Avançado
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 text-center">
                ✨ Após o pagamento ser confirmado, sua assinatura será ativada automaticamente por 30 dias. 
                Todos os dados atuais serão mantidos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={salvar} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  )
}
