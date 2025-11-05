
-- Primeiro, adicionar novos valores ao enum
ALTER TYPE "PlanoSalao" ADD VALUE IF NOT EXISTS 'INTERMEDIARIO';
ALTER TYPE "PlanoSalao" ADD VALUE IF NOT EXISTS 'COMPLETO';

-- Atualizar todos os registros que usam valores antigos
UPDATE "saloes" SET "plano" = 'BASICO' WHERE "plano" IN ('PROFISSIONAL', 'PREMIUM', 'ENTERPRISE');

-- Adicionar novos campos
ALTER TABLE "saloes" ADD COLUMN IF NOT EXISTS "trial_start_date" TIMESTAMP(3);
ALTER TABLE "saloes" ADD COLUMN IF NOT EXISTS "trial_end_date" TIMESTAMP(3);
ALTER TABLE "saloes" ADD COLUMN IF NOT EXISTS "is_trial_active" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "saloes" ADD COLUMN IF NOT EXISTS "subscription_start_date" TIMESTAMP(3);
