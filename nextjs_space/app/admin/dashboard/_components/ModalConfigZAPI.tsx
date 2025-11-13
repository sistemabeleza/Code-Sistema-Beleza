
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, MessageSquare, FileText, Settings, AlertCircle } from 'lucide-react'

interface ModalConfigZAPIProps {
  aberto: boolean
  salaoId: string | null
  salaoNome: string
  onFechar: () => void
  onSucesso: () => void
}

export function ModalConfigZAPI({ aberto, salaoId, salaoNome, onFechar, onSucesso }: ModalConfigZAPIProps) {
  const [salvando, setSalvando] = useState(false)
  const [testando, setTestando] = useState(false)
  const [config, setConfig] = useState({
    automacao_ativa: false,
    webhook_url: '',
    zapi_tipo_envio: 'texto',
    zapi_delay: 2,
    zapi_enviar_confirmacao: true,
    zapi_enviar_atualizacao: true,
    zapi_enviar_cancelamento: true,
    zapi_documento_url: '',
    zapi_documento_nome: '',
    zapi_documento_extensao: '',
    zapi_documento_descricao: ''
  })

  useEffect(() => {
    if (aberto && salaoId) {
      carregarConfiguracao()
    }
  }, [aberto, salaoId])

  const carregarConfiguracao = async () => {
    try {
      const response = await fetch(`/api/admin/webhook?salaoId=${salaoId}`)
      if (!response.ok) throw new Error('Erro ao carregar configuração')
      
      const data = await response.json()
      setConfig({
        automacao_ativa: data.automacao_ativa || false,
        webhook_url: data.webhook_url || '',
        zapi_tipo_envio: data.zapi_tipo_envio || 'texto',
        zapi_delay: data.zapi_delay || 2,
        zapi_enviar_confirmacao: data.zapi_enviar_confirmacao ?? true,
        zapi_enviar_atualizacao: data.zapi_enviar_atualizacao ?? true,
        zapi_enviar_cancelamento: data.zapi_enviar_cancelamento ?? true,
        zapi_documento_url: data.zapi_documento_url || '',
        zapi_documento_nome: data.zapi_documento_nome || '',
        zapi_documento_extensao: data.zapi_documento_extensao || '',
        zapi_documento_descricao: data.zapi_documento_descricao || ''
      })
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
      toast.error('Erro ao carregar configurações')
    }
  }

  const handleSalvar = async () => {
    if (config.automacao_ativa && !config.webhook_url) {
      toast.error('URL do webhook é obrigatória quando a automação está ativa')
      return
    }

    // Validar URL
    if (config.automacao_ativa) {
      try {
        new URL(config.webhook_url)
      } catch {
        toast.error('URL do webhook inválida')
        return
      }
    }

    // Validar delay (1-15 segundos)
    if (config.zapi_delay < 1 || config.zapi_delay > 15) {
      toast.error('O atraso deve estar entre 1 e 15 segundos')
      return
    }

    setSalvando(true)

    try {
      const response = await fetch('/api/admin/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salaoId,
          ...config
        })
      })

      if (!response.ok) throw new Error('Erro ao salvar configuração')

      toast.success('✓ Configuração salva com sucesso!')
      onSucesso()
      onFechar()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar configuração')
    } finally {
      setSalvando(false)
    }
  }

  const handleTestar = async () => {
    if (!config.webhook_url) {
      toast.error('Configure a URL do webhook primeiro')
      return
    }

    setTestando(true)

    try {
      const response = await fetch('/api/admin/webhook/testar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salaoId,
          webhook_url: config.webhook_url,
          tipo_envio: config.zapi_tipo_envio,
          delay: config.zapi_delay,
          documento_url: config.zapi_documento_url,
          documento_nome: config.zapi_documento_nome,
          documento_extensao: config.zapi_documento_extensao,
          documento_descricao: config.zapi_documento_descricao
        })
      })

      const result = await response.json()

      if (result.sucesso) {
        toast.success('✓ ' + result.mensagem)
      } else {
        toast.error('✗ ' + result.mensagem)
      }
    } catch (error) {
      console.error('Erro ao testar webhook:', error)
      toast.error('Erro ao testar webhook')
    } finally {
      setTestando(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            Configuração ZAPI/Fiqon - {salaoNome}
          </DialogTitle>
          <DialogDescription>
            Configure as notificações automáticas via WhatsApp para os agendamentos
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basico" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basico">
              <Settings className="h-4 w-4 mr-2" />
              Básico
            </TabsTrigger>
            <TabsTrigger value="mensagens">
              <MessageSquare className="h-4 w-4 mr-2" />
              Mensagens
            </TabsTrigger>
            <TabsTrigger value="documento">
              <FileText className="h-4 w-4 mr-2" />
              Documento
            </TabsTrigger>
          </TabsList>

          {/* Aba Básico */}
          <TabsContent value="basico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configurações Gerais</CardTitle>
                <CardDescription>
                  Ative e configure a URL do webhook da ZAPI/Fiqon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ativação */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Webhook Ativo</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar envio automático de notificações WhatsApp
                    </p>
                  </div>
                  <Switch
                    checked={config.automacao_ativa}
                    onCheckedChange={(checked) => 
                      setConfig({ ...config, automacao_ativa: checked })
                    }
                  />
                </div>

                {/* URL do Webhook */}
                <div className="space-y-2">
                  <Label htmlFor="webhook_url">
                    URL do Webhook ZAPI *
                  </Label>
                  <Input
                    id="webhook_url"
                    type="url"
                    placeholder="https://api.z-api.io/instances/SEU_TOKEN/token/SEU_INSTANCE/send-text"
                    value={config.webhook_url}
                    onChange={(e) => setConfig({ ...config, webhook_url: e.target.value })}
                    disabled={!config.automacao_ativa}
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole aqui a URL fornecida pela ZAPI/Fiqon para envio de mensagens
                  </p>
                </div>

                {/* Tipo de Envio */}
                <div className="space-y-2">
                  <Label htmlFor="tipo_envio">Tipo de Envio</Label>
                  <Select
                    value={config.zapi_tipo_envio}
                    onValueChange={(value) => setConfig({ ...config, zapi_tipo_envio: value })}
                    disabled={!config.automacao_ativa}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="texto">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Apenas Texto
                        </div>
                      </SelectItem>
                      <SelectItem value="documento">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Texto + Documento
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Delay */}
                <div className="space-y-2">
                  <Label htmlFor="delay">Atraso no Envio (segundos)</Label>
                  <Input
                    id="delay"
                    type="number"
                    min="1"
                    max="15"
                    value={config.zapi_delay}
                    onChange={(e) => setConfig({ ...config, zapi_delay: parseInt(e.target.value) || 2 })}
                    disabled={!config.automacao_ativa}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tempo de espera antes de enviar a mensagem (1 a 15 segundos)
                  </p>
                </div>

                {/* Botão de Teste */}
                <Button
                  onClick={handleTestar}
                  disabled={!config.webhook_url || testando}
                  variant="outline"
                  className="w-full"
                >
                  {testando ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando Teste...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Testar Webhook
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Mensagens */}
          <TabsContent value="mensagens" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Eventos de Notificação</CardTitle>
                <CardDescription>
                  Escolha quais eventos devem enviar notificações ao cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Confirmação de Agendamento */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">✅ Confirmação de Agendamento</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar mensagem quando um novo agendamento for criado
                    </p>
                  </div>
                  <Switch
                    checked={config.zapi_enviar_confirmacao}
                    onCheckedChange={(checked) => 
                      setConfig({ ...config, zapi_enviar_confirmacao: checked })
                    }
                    disabled={!config.automacao_ativa}
                  />
                </div>

                {/* Atualização de Agendamento */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">🔄 Atualização de Agendamento</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar mensagem quando um agendamento for alterado
                    </p>
                  </div>
                  <Switch
                    checked={config.zapi_enviar_atualizacao}
                    onCheckedChange={(checked) => 
                      setConfig({ ...config, zapi_enviar_atualizacao: checked })
                    }
                    disabled={!config.automacao_ativa}
                  />
                </div>

                {/* Cancelamento de Agendamento */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">❌ Cancelamento de Agendamento</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar mensagem quando um agendamento for cancelado
                    </p>
                  </div>
                  <Switch
                    checked={config.zapi_enviar_cancelamento}
                    onCheckedChange={(checked) => 
                      setConfig({ ...config, zapi_enviar_cancelamento: checked })
                    }
                    disabled={!config.automacao_ativa}
                  />
                </div>

                {/* Aviso */}
                <div className="flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <strong>Mensagens Personalizadas:</strong> As mensagens incluem automaticamente nome do cliente, data/horário, serviço, profissional e observações do agendamento.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Documento */}
          <TabsContent value="documento" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Envio de Documento (Opcional)</CardTitle>
                <CardDescription>
                  Configure um documento PDF/imagem para ser enviado junto com as mensagens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* URL do Documento */}
                <div className="space-y-2">
                  <Label htmlFor="documento_url">URL do Documento</Label>
                  <Input
                    id="documento_url"
                    type="url"
                    placeholder="https://exemplo.com/comprovante.pdf"
                    value={config.zapi_documento_url}
                    onChange={(e) => setConfig({ ...config, zapi_documento_url: e.target.value })}
                    disabled={!config.automacao_ativa || config.zapi_tipo_envio === 'texto'}
                  />
                  <p className="text-xs text-muted-foreground">
                    URL pública do documento ou imagem (formato: .pdf, .docx, .jpg, .png)
                  </p>
                </div>

                {/* Nome do Arquivo */}
                <div className="space-y-2">
                  <Label htmlFor="documento_nome">Nome do Arquivo</Label>
                  <Input
                    id="documento_nome"
                    type="text"
                    placeholder="Comprovante de Agendamento"
                    value={config.zapi_documento_nome}
                    onChange={(e) => setConfig({ ...config, zapi_documento_nome: e.target.value })}
                    disabled={!config.automacao_ativa || config.zapi_tipo_envio === 'texto'}
                  />
                </div>

                {/* Extensão */}
                <div className="space-y-2">
                  <Label htmlFor="documento_extensao">Extensão do Arquivo</Label>
                  <Select
                    value={config.zapi_documento_extensao}
                    onValueChange={(value) => setConfig({ ...config, zapi_documento_extensao: value })}
                    disabled={!config.automacao_ativa || config.zapi_tipo_envio === 'texto'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a extensão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=".pdf">PDF (.pdf)</SelectItem>
                      <SelectItem value=".docx">Word (.docx)</SelectItem>
                      <SelectItem value=".jpg">Imagem JPG (.jpg)</SelectItem>
                      <SelectItem value=".png">Imagem PNG (.png)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Descrição/Caption */}
                <div className="space-y-2">
                  <Label htmlFor="documento_descricao">Descrição do Documento</Label>
                  <Textarea
                    id="documento_descricao"
                    placeholder="Seu comprovante de agendamento"
                    value={config.zapi_documento_descricao}
                    onChange={(e) => setConfig({ ...config, zapi_documento_descricao: e.target.value })}
                    rows={3}
                    disabled={!config.automacao_ativa || config.zapi_tipo_envio === 'texto'}
                  />
                  <p className="text-xs text-muted-foreground">
                    Texto que aparecerá como legenda do documento no WhatsApp
                  </p>
                </div>

                {/* Aviso */}
                {config.zapi_tipo_envio === 'texto' && (
                  <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-900">
                      <strong>Modo Texto Ativo:</strong> Altere o "Tipo de Envio" para "Texto + Documento" na aba Básico para habilitar o envio de documentos.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={salvando}>
            {salvando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
