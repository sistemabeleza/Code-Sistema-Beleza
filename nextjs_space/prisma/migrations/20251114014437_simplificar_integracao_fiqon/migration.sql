-- AlterTable: Simplificar integração Fiqon
-- Remove campos ZAPI e adiciona webhook_fiqon

-- Remover campos ZAPI antigos (se existirem)
ALTER TABLE "saloes" DROP COLUMN IF EXISTS "zapi_instance_id";
ALTER TABLE "saloes" DROP COLUMN IF EXISTS "zapi_token";
ALTER TABLE "saloes" DROP COLUMN IF EXISTS "zapi_tipo_envio";
ALTER TABLE "saloes" DROP COLUMN IF EXISTS "zapi_delay";
ALTER TABLE "saloes" DROP COLUMN IF EXISTS "zapi_enviar_confirmacao";
ALTER TABLE "saloes" DROP COLUMN IF EXISTS "zapi_enviar_atualizacao";
ALTER TABLE "saloes" DROP COLUMN IF EXISTS "zapi_enviar_cancelamento";
ALTER TABLE "saloes" DROP COLUMN IF EXISTS "zapi_enviar_lembretes";
ALTER TABLE "saloes" DROP COLUMN IF EXISTS "zapi_horario_lembrete";
ALTER TABLE "saloes" DROP COLUMN IF EXISTS "zapi_documento_url";
ALTER TABLE "saloes" DROP COLUMN IF EXISTS "zapi_documento_nome";
ALTER TABLE "saloes" DROP COLUMN IF EXISTS "zapi_documento_extensao";
ALTER TABLE "saloes" DROP COLUMN IF EXISTS "zapi_documento_descricao";

-- Adicionar campo webhook_fiqon (se não existir)
ALTER TABLE "saloes" ADD COLUMN IF NOT EXISTS "webhook_fiqon" TEXT;
