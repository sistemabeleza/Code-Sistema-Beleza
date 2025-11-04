
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { 
  Save, 
  Upload, 
  Building2, 
  Image as ImageIcon, 
  Link2, 
  Loader2,
  Check,
  Copy,
  ExternalLink
} from 'lucide-react'
import Image from 'next/image'

interface SalaoConfig {
  id: string
  nome: string
  cnpj?: string
  telefone?: string
  email?: string
  endereco?: string
  horario_funcionamento?: string
  descricao?: string
  logo?: string
  foto_1?: string
  foto_2?: string
  slug?: string
  cor_tema?: string
}

export default function ConfiguracoesForm() {
  const [config, setConfig] = useState<SalaoConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFoto1, setUploadingFoto1] = useState(false)
  const [uploadingFoto2, setUploadingFoto2] = useState(false)
  const [linkCopiado, setLinkCopiado] = useState(false)

  useEffect(() => {
    carregarConfiguracoes()
  }, [])

  const carregarConfiguracoes = async () => {
    try {
      const res = await fetch('/api/configuracoes')
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
      } else {
        toast.error('Erro ao carregar configurações')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (
    file: File,
    tipo: 'logo' | 'foto_1' | 'foto_2'
  ) => {
    const setUploading = 
      tipo === 'logo' ? setUploadingLogo :
      tipo === 'foto_1' ? setUploadingFoto1 :
      setUploadingFoto2

    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok && data.cloud_storage_path) {
        setConfig(prev => prev ? {
          ...prev,
          [tipo]: data.cloud_storage_path
        } : null)
        toast.success('Imagem enviada com sucesso!')
      } else {
        toast.error(data.error || 'Erro ao fazer upload')
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao fazer upload da imagem')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return

    // Validar slug
    if (config.slug && !/^[a-z0-9-]+$/.test(config.slug)) {
      toast.error('Link personalizado deve conter apenas letras minúsculas, números e hífens')
      return
    }

    setSaving(true)
    
    try {
      const res = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Configurações salvas com sucesso!')
        setConfig(data.salao)
      } else {
        toast.error(data.error || 'Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const copiarLink = () => {
    if (config?.slug) {
      const link = `${window.location.origin}/agendamento/${config.slug}`
      navigator.clipboard.writeText(link)
      setLinkCopiado(true)
      toast.success('Link copiado para a área de transferência!')
      setTimeout(() => setLinkCopiado(false), 2000)
    }
  }

  const abrirLink = () => {
    if (config?.slug) {
      const link = `${window.location.origin}/agendamento/${config.slug}`
      window.open(link, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Erro ao carregar configurações</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dados do Salão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            Dados do Salão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Salão*</Label>
              <Input
                id="nome"
                value={config.nome || ''}
                onChange={(e) => setConfig({ ...config, nome: e.target.value })}
                placeholder="Ex: Salão Beleza Premium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={config.cnpj || ''}
                onChange={(e) => setConfig({ ...config, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={config.telefone || ''}
                onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
                placeholder="(11) 98888-8888"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={config.email || ''}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                placeholder="contato@salao.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={config.endereco || ''}
              onChange={(e) => setConfig({ ...config, endereco: e.target.value })}
              placeholder="Rua, número, bairro, cidade - UF"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horario">Horário de Funcionamento</Label>
            <Input
              id="horario"
              value={config.horario_funcionamento || ''}
              onChange={(e) => setConfig({ ...config, horario_funcionamento: e.target.value })}
              placeholder="Ex: Seg-Sex: 9h-18h | Sáb: 9h-15h"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={config.descricao || ''}
              onChange={(e) => setConfig({ ...config, descricao: e.target.value })}
              placeholder="Descreva seu salão para os clientes..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logo e Fotos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ImageIcon className="mr-2 h-5 w-5" />
            Logo e Fotos do Salão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo do Salão</Label>
            <div className="flex items-start gap-4">
              {config.logo && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={`/api/download?key=${encodeURIComponent(config.logo)}`}
                    alt="Logo"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(file, 'logo')
                  }}
                  disabled={uploadingLogo}
                  className="mb-2"
                />
                <p className="text-sm text-gray-500">
                  Formato: JPG, PNG ou WEBP | Tamanho máximo: 5MB
                </p>
                {uploadingLogo && (
                  <div className="flex items-center gap-2 mt-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Enviando...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Foto 1 */}
          <div className="space-y-2">
            <Label>Foto 1 do Salão</Label>
            <div className="flex items-start gap-4">
              {config.foto_1 && (
                <div className="relative w-48 aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={`/api/download?key=${encodeURIComponent(config.foto_1)}`}
                    alt="Foto 1"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(file, 'foto_1')
                  }}
                  disabled={uploadingFoto1}
                  className="mb-2"
                />
                {uploadingFoto1 && (
                  <div className="flex items-center gap-2 mt-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Enviando...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Foto 2 */}
          <div className="space-y-2">
            <Label>Foto 2 do Salão</Label>
            <div className="flex items-start gap-4">
              {config.foto_2 && (
                <div className="relative w-48 aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={`/api/download?key=${encodeURIComponent(config.foto_2)}`}
                    alt="Foto 2"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(file, 'foto_2')
                  }}
                  disabled={uploadingFoto2}
                  className="mb-2"
                />
                {uploadingFoto2 && (
                  <div className="flex items-center gap-2 mt-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Enviando...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Link de Agendamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link2 className="mr-2 h-5 w-5" />
            Link Personalizado de Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Link Personalizado</Label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {window.location.origin}/agendamento/
                </span>
                <Input
                  id="slug"
                  value={config.slug || ''}
                  onChange={(e) => setConfig({ ...config, slug: e.target.value.toLowerCase() })}
                  placeholder="meu-salao"
                  className="flex-1"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Use apenas letras minúsculas, números e hífens (ex: salao-beleza-2024)
            </p>
          </div>

          {config.slug && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
              <p className="text-sm font-medium text-blue-900">
                Seu link de agendamento:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-white rounded border text-sm">
                  {window.location.origin}/agendamento/{config.slug}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copiarLink}
                  className="shrink-0"
                >
                  {linkCopiado ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={abrirLink}
                  className="shrink-0"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Abrir
                </Button>
              </div>
              <p className="text-xs text-blue-700">
                Compartilhe este link com seus clientes para que eles possam fazer agendamentos online!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
