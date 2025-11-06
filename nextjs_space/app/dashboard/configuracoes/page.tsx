'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ExternalLink, Instagram, MessageCircle, Copy, Crown, Zap, Rocket } from 'lucide-react'

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
