
/**
 * Script para verificar e expirar assinaturas automaticamente
 * 
 * Execute este script periodicamente (ex: diariamente via cron):
 * 0 0 * * * cd /home/ubuntu/sistema_salao_beleza/nextjs_space && tsx check-subscriptions.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkExpiredSubscriptions() {
  try {
    const now = new Date()
    console.log(`[${now.toISOString()}] Verificando assinaturas expiradas...`)
    
    // Buscar todos os salões com assinatura ativa mas expirada
    const expiredSubscriptions = await prisma.salao.findMany({
      where: {
        subscription_end_date: {
          lte: now
        },
        status: 'ATIVO'
      },
      include: {
        usuarios: {
          take: 1,
          select: {
            email: true,
            name: true
          }
        }
      }
    })
    
    if (expiredSubscriptions.length === 0) {
      console.log('Nenhuma assinatura expirada encontrada.')
      return
    }
    
    console.log(`Encontradas ${expiredSubscriptions.length} assinaturas expiradas:`)
    
    // Atualizar status dos salões expirados
    for (const salao of expiredSubscriptions) {
      console.log(`- Expirando: ${salao.nome} (ID: ${salao.id})`)
      console.log(`  Email: ${salao.usuarios[0]?.email || 'N/A'}`)
      console.log(`  Plano: ${salao.plano}`)
      console.log(`  Expirou em: ${salao.subscription_end_date?.toISOString()}`)
      
      await prisma.salao.update({
        where: { id: salao.id },
        data: {
          status: 'TRIAL',
          is_trial_active: true,
          plano: 'BASICO',
          subscription_start_date: null,
          subscription_end_date: null,
          cakto_transaction_id: null
        }
      })
    }
    
    console.log(`\n✅ Processamento concluído: ${expiredSubscriptions.length} assinaturas movidas para modo teste`)
    
  } catch (error) {
    console.error('❌ Erro ao verificar assinaturas:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar
checkExpiredSubscriptions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro fatal:', error)
    process.exit(1)
  })
