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

  // Estado para configurações ZAPI
  const [zapiConfig, setZapiConfig] = useState({
    automacao_ativa: false,
    zapi_instancia: '',
    zapi_token: '',
    zapi_tipo_envio: 'texto',
    zapi_delay: 2,
    zapi_enviar_confirmacao: true,
    zapi_enviar_atualizacao: true,
    zapi_enviar_cancelamento: true,
    zapi_enviar_lembretes: false,
    zapi_horario_lembrete: '09:00',
    zapi_documento_url: '',
    zapi_documento_nome: '',
    zapi_documento_extensao: '.pdf',
    zapi_documento_descricao: ''
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
        
        // Carregar configurações ZAPI
        // Extrair instância e token da webhook_url se existir
        let instancia = ''
        let token = ''
        if (data.webhook_url && data.webhook_url.includes('z-api.io')) {
          const match = data.webhook_url.match(/instances\/([^/]+)\/token\/([^/]+)/)
          if (match) {
            instancia = match[1]
            token = match[2]
          }
        }
        
        setZapiConfig({
          automacao_ativa: data.automacao_ativa || false,
          zapi_instancia: data.zapi_instance_id || instancia,
          zapi_token: data.zapi_token || token,
          zapi_tipo_envio: data.zapi_tipo_envio || 'texto',
          zapi_delay: data.zapi_delay || 2,
          zapi_enviar_confirmacao: data.zapi_enviar_confirmacao !== false,
          zapi_enviar_atualizacao: data.zapi_enviar_atualizacao !== false,
          zapi_enviar_cancelamento: data.zapi_enviar_cancelamento !== false,
          zapi_enviar_lembretes: data.zapi_enviar_lembretes || false,
          zapi_horario_lembrete: data.zapi_horario_lembrete || '09:00',
          zapi_documento_url: data.zapi_documento_url || '',
          zapi_documento_nome: data.zapi_documento_nome || '',
          zapi_documento_extensao: data.zapi_documento_extensao || '.pdf',
          zapi_documento_descricao: data.zapi_documento_descricao || ''
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

  async function salvarZapi() {
    // Validações
    if (zapiConfig.automacao_ativa) {
      if (!zapiConfig.zapi_instancia || zapiConfig.zapi_instancia.trim() === '') {
        toast.error('Informe a Instância da ZAPI')
        return
      }
      if (!zapiConfig.zapi_token || zapiConfig.zapi_token.trim() === '') {
        toast.error('Informe o Token da ZAPI')
        return
      }
      
      // Se for envio com documento, validar URL do documento
      if (zapiConfig.zapi_tipo_envio === 'documento' && (!zapiConfig.zapi_documento_url || zapiConfig.zapi_documento_url.trim() === '')) {
        toast.error('Informe a URL do documento para envio')
        return
      }
    }

    try {
      setSalvando(true)
      
      // Construir a webhook_url no formato correto da ZAPI
      const endpoint = zapiConfig.zapi_tipo_envio === 'documento' ? 'send-document' : 'send-text'
      const webhook_url = zapiConfig.automacao_ativa && zapiConfig.zapi_instancia && zapiConfig.zapi_token
        ? `https://api.z-api.io/instances/${zapiConfig.zapi_instancia}/token/${zapiConfig.zapi_token}/${endpoint}`
        : null

      const payload = {
        automacao_ativa: zapiConfig.automacao_ativa,
        webhook_url: webhook_url,
        zapi_instance_id: zapiConfig.zapi_instancia,
        zapi_token: zapiConfig.zapi_token,
        zapi_tipo_envio: zapiConfig.zapi_tipo_envio,
        zapi_delay: zapiConfig.zapi_delay,
        zapi_enviar_confirmacao: zapiConfig.zapi_enviar_confirmacao,
        zapi_enviar_atualizacao: zapiConfig.zapi_enviar_atualizacao,
        zapi_enviar_cancelamento: zapiConfig.zapi_enviar_cancelamento,
        zapi_enviar_lembretes: zapiConfig.zapi_enviar_lembretes,
        zapi_horario_lembrete: zapiConfig.zapi_horario_lembrete,
        zapi_documento_url: zapiConfig.zapi_documento_url,
        zapi_documento_nome: zapiConfig.zapi_documento_nome,
        zapi_documento_extensao: zapiConfig.zapi_documento_extensao,
        zapi_documento_descricao: zapiConfig.zapi_documento_descricao
      }

      const res = await fetch('/api/configuracoes/zapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success('Configurações ZAPI salvas com sucesso!')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Erro ao salvar configurações ZAPI')
      }
    } catch (error) {
      console.error('Erro ao salvar ZAPI:', error)
      toast.error('Erro ao salvar configurações ZAPI')
    } finally {
      setSalvando(false)
    }
  }

  async function testarZapi() {
    if (!zapiConfig.zapi_instancia || !zapiConfig.zapi_token) {
      toast.error('Preencha a Instância e o Token antes de testar')
      return
    }

    try {
      setTestando(true)
      
      // Primeiro salvar as configurações
      await salvarZapi()
      
      // Depois testar
      const res = await fetch('/api/configuracoes/zapi/testar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instance_id: zapiConfig.zapi_instancia,
          token: zapiConfig.zapi_token,
          tipo_envio: zapiConfig.zapi_tipo_envio,
          documento_url: zapiConfig.zapi_documento_url,
          phone: '5511999999999' // Telefone de teste
        })
      })

      const data = await res.json()

      if (data.success) {
        toast.success(data.message || 'Teste enviado com sucesso! Verifique o WhatsApp.')
      } else {
        toast.error(data.error || 'Erro ao testar webhook')
      }
    } catch (error) {
      console.error('Erro ao testar ZAPI:', error)
      toast.error('Erro ao testar conexão com ZAPI')
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

        {/* Automação WhatsApp - ZAPI */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-600" />
              Automação WhatsApp (ZAPI)
            </CardTitle>
            <CardDescription>
              Configure o envio automático de mensagens via WhatsApp para seus clientes
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
                  Envie mensagens automáticas quando houver novos agendamentos
                </p>
              </div>
              <Switch
                id="automacao-toggle"
                checked={zapiConfig.automacao_ativa}
                onCheckedChange={(checked) => setZapiConfig(prev => ({ ...prev, automacao_ativa: checked }))}
              />
            </div>

            {zapiConfig.automacao_ativa && (
              <>
                {/* Credenciais ZAPI */}
                <div className="space-y-4 p-4 bg-white rounded-lg border border-green-200">
                  <h3 className="font-medium text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Credenciais da ZAPI
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zapi-instancia">Instância ZAPI *</Label>
                    <Input
                      id="zapi-instancia"
                      value={zapiConfig.zapi_instancia}
                      onChange={(e) => setZapiConfig(prev => ({ ...prev, zapi_instancia: e.target.value }))}
                      placeholder="Ex: 3BA2DA29C1B66"
                    />
                    <p className="text-xs text-muted-foreground">
                      Encontre sua instância no painel da ZAPI (ID da instância)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zapi-token">Token ZAPI *</Label>
                    <Input
                      id="zapi-token"
                      value={zapiConfig.zapi_token}
                      onChange={(e) => setZapiConfig(prev => ({ ...prev, zapi_token: e.target.value }))}
                      placeholder="Ex: F176a0a87a57d4bfa9a36354435766896S"
                      type="password"
                    />
                    <p className="text-xs text-muted-foreground">
                      Token de autenticação da sua instância ZAPI
                    </p>
                  </div>

                  {/* URL Gerada */}
                  {zapiConfig.zapi_instancia && zapiConfig.zapi_token && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-xs font-medium text-green-800 mb-1">URL Webhook Gerada:</p>
                      <code className="text-xs text-green-700 break-all">
                        https://api.z-api.io/instances/{zapiConfig.zapi_instancia}/token/{zapiConfig.zapi_token}/send-text
                      </code>
                    </div>
                  )}
                </div>

                {/* Tipo de Envio */}
                <div className="space-y-4 p-4 bg-white rounded-lg border border-green-200">
                  <h3 className="font-medium text-sm flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    Configurações de Mensagem
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="tipo-envio">Tipo de Envio</Label>
                    <Select 
                      value={zapiConfig.zapi_tipo_envio} 
                      onValueChange={(value) => setZapiConfig(prev => ({ ...prev, zapi_tipo_envio: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="texto">Apenas Texto</SelectItem>
                        <SelectItem value="documento">Texto + Documento (PDF, etc)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zapi-delay">Atraso de Envio (segundos)</Label>
                    <Input
                      id="zapi-delay"
                      type="number"
                      min="1"
                      max="15"
                      value={zapiConfig.zapi_delay}
                      onChange={(e) => setZapiConfig(prev => ({ ...prev, zapi_delay: parseInt(e.target.value) || 2 }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Tempo de espera antes de enviar a mensagem (1-15 segundos)
                    </p>
                  </div>

                  {/* Opções de Notificação */}
                  <div className="space-y-3">
                    <Label>Enviar notificações para:</Label>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enviar-confirmacao"
                        checked={zapiConfig.zapi_enviar_confirmacao}
                        onCheckedChange={(checked) => setZapiConfig(prev => ({ ...prev, zapi_enviar_confirmacao: checked as boolean }))}
                      />
                      <label
                        htmlFor="enviar-confirmacao"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Novos agendamentos (confirmação)
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enviar-atualizacao"
                        checked={zapiConfig.zapi_enviar_atualizacao}
                        onCheckedChange={(checked) => setZapiConfig(prev => ({ ...prev, zapi_enviar_atualizacao: checked as boolean }))}
                      />
                      <label
                        htmlFor="enviar-atualizacao"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Atualizações de agendamento
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enviar-cancelamento"
                        checked={zapiConfig.zapi_enviar_cancelamento}
                        onCheckedChange={(checked) => setZapiConfig(prev => ({ ...prev, zapi_enviar_cancelamento: checked as boolean }))}
                      />
                      <label
                        htmlFor="enviar-cancelamento"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Cancelamentos de agendamento
                      </label>
                    </div>
                  </div>
                </div>

                {/* Lembretes Automáticos */}
                <div className="space-y-4 p-4 bg-white rounded-lg border border-green-200">
                  <h3 className="font-medium text-sm flex items-center gap-2">
                    <Bell className="h-4 w-4 text-green-600" />
                    Lembretes Automáticos do Dia
                  </h3>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enviar-lembretes"
                      checked={zapiConfig.zapi_enviar_lembretes}
                      onCheckedChange={(checked) => setZapiConfig(prev => ({ ...prev, zapi_enviar_lembretes: checked as boolean }))}
                    />
                    <label
                      htmlFor="enviar-lembretes"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Enviar lembretes automáticos dos agendamentos do dia
                    </label>
                  </div>

                  {zapiConfig.zapi_enviar_lembretes && (
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="horario-lembrete">Horário de Envio</Label>
                      <Input
                        id="horario-lembrete"
                        type="time"
                        value={zapiConfig.zapi_horario_lembrete}
                        onChange={(e) => setZapiConfig(prev => ({ ...prev, zapi_horario_lembrete: e.target.value }))}
                        className="w-40"
                      />
                      <p className="text-xs text-muted-foreground">
                        📅 Os lembretes serão enviados automaticamente neste horário para todos os agendamentos do dia
                      </p>
                    </div>
                  )}
                </div>

                {/* Configurações de Documento (se tipo_envio = documento) */}
                {zapiConfig.zapi_tipo_envio === 'documento' && (
                  <div className="space-y-4 p-4 bg-white rounded-lg border border-green-200">
                    <h3 className="font-medium text-sm flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-green-600" />
                      Configurações do Documento
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="doc-url">URL do Documento *</Label>
                      <Input
                        id="doc-url"
                        value={zapiConfig.zapi_documento_url}
                        onChange={(e) => setZapiConfig(prev => ({ ...prev, zapi_documento_url: e.target.value }))}
                        placeholder="https://exemplo.com/documento.pdf"
                      />
                      <p className="text-xs text-muted-foreground">
                        URL pública do documento a ser enviado junto com a mensagem
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="doc-nome">Nome do Arquivo</Label>
                        <Input
                          id="doc-nome"
                          value={zapiConfig.zapi_documento_nome}
                          onChange={(e) => setZapiConfig(prev => ({ ...prev, zapi_documento_nome: e.target.value }))}
                          placeholder="Comprovante"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="doc-extensao">Extensão</Label>
                        <Select 
                          value={zapiConfig.zapi_documento_extensao} 
                          onValueChange={(value) => setZapiConfig(prev => ({ ...prev, zapi_documento_extensao: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value=".pdf">.pdf</SelectItem>
                            <SelectItem value=".docx">.docx</SelectItem>
                            <SelectItem value=".jpg">.jpg</SelectItem>
                            <SelectItem value=".png">.png</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doc-descricao">Descrição/Caption</Label>
                      <Textarea
                        id="doc-descricao"
                        value={zapiConfig.zapi_documento_descricao}
                        onChange={(e) => setZapiConfig(prev => ({ ...prev, zapi_documento_descricao: e.target.value }))}
                        placeholder="Descrição do documento..."
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="flex gap-3">
                  <Button 
                    onClick={salvarZapi} 
                    disabled={salvando}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {salvando ? 'Salvando...' : 'Salvar Configurações ZAPI'}
                  </Button>
                  
                  <Button 
                    onClick={testarZapi} 
                    disabled={testando || !zapiConfig.zapi_instancia || !zapiConfig.zapi_token}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    {testando ? 'Testando...' : 'Testar Conexão'}
                  </Button>
                </div>

                {/* Aviso */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Como obter suas credenciais ZAPI:</strong>
                  </p>
                  <ol className="mt-2 text-xs text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Acesse o painel da ZAPI (https://api.z-api.io)</li>
                    <li>Vá em "Instâncias" e selecione sua instância</li>
                    <li>Copie o ID da Instância e o Token</li>
                    <li>Cole aqui nos campos acima e clique em "Salvar"</li>
                  </ol>
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
