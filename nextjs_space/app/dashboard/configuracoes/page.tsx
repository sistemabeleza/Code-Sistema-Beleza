'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ExternalLink, Instagram, MessageCircle, Copy } from 'lucide-react'

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
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
      </div>

      <div className="flex justify-end">
        <Button onClick={salvar} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  )
}
