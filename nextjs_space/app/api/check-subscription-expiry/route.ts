
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const now = new Date()
    
    // Buscar todos os salões com assinatura ativa mas expirada
    const expiredSubscriptions = await prisma.salao.findMany({
      where: {
        subscription_end_date: {
          lte: now
        },
        status: 'ATIVO'
      }
    })
    
    console.log(`Verificando assinaturas expiradas: ${expiredSubscriptions.length} encontradas`)
    
    // Atualizar status dos salões expirados para modo trial
    const updatePromises = expiredSubscriptions.map(salao => 
      prisma.salao.update({
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
    )
    
    await Promise.all(updatePromises)
    
    return NextResponse.json({
      success: true,
      message: `${expiredSubscriptions.length} assinaturas expiradas processadas`,
      expiredCount: expiredSubscriptions.length,
      checkedAt: now.toISOString()
    })
    
  } catch (error) {
    console.error('Erro ao verificar assinaturas expiradas:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao verificar assinaturas'
    }, { status: 500 })
  }
}

// Endpoint também disponível via POST para triggers externos
export async function POST() {
  return GET()
}
