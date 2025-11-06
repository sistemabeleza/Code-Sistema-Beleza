
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapeamento dos links de pagamento para planos
const PAYMENT_LINKS = {
  'ac64njr_616158': 'BASICO',
  'w2y2hgj_616200': 'INTERMEDIARIO',
  '33qmtrg_616270': 'COMPLETO'
} as const

export async function POST(req: NextRequest) {
  try {
    const webhookData = await req.json()
    
    console.log('Webhook Cakto recebido:', JSON.stringify(webhookData, null, 2))
    
    // Verificar se é um evento de compra aprovada
    if (webhookData.event !== 'compra_aprovada' && webhookData.event !== 'purchase_approved') {
      return NextResponse.json({ 
        success: true, 
        message: 'Evento ignorado (não é compra aprovada)' 
      })
    }
    
    // Extrair dados importantes do webhook
    const transactionId = webhookData.data?.transaction_id || webhookData.data?.id
    const customerEmail = webhookData.customer?.email || webhookData.data?.customer?.email
    const customerName = webhookData.customer?.name || webhookData.data?.customer?.name
    const amount = webhookData.data?.amount || webhookData.data?.valor
    const offerCode = webhookData.offer?.code || webhookData.data?.offer?.code
    
    if (!transactionId || !customerEmail) {
      console.error('Webhook sem transaction_id ou email')
      return NextResponse.json({ 
        success: false, 
        error: 'Dados insuficientes no webhook' 
      }, { status: 400 })
    }
    
    // Verificar se a transação já foi processada
    const existingTransaction = await prisma.caktoTransaction.findUnique({
      where: { transaction_id: transactionId }
    })
    
    if (existingTransaction) {
      return NextResponse.json({ 
        success: true, 
        message: 'Transação já processada anteriormente' 
      })
    }
    
    // Identificar o plano com base no código da oferta ou link
    let plano: 'BASICO' | 'INTERMEDIARIO' | 'COMPLETO' = 'BASICO'
    
    for (const [linkCode, planName] of Object.entries(PAYMENT_LINKS)) {
      if (offerCode?.includes(linkCode)) {
        plano = planName as any
        break
      }
    }
    
    // Buscar o salão pelo email do usuário
    const user = await prisma.user.findUnique({
      where: { email: customerEmail },
      include: { salao: true }
    })
    
    if (!user || !user.salao) {
      console.error(`Usuário não encontrado para email: ${customerEmail}`)
      
      // Registrar a transação mesmo sem salão associado (para análise futura)
      await prisma.caktoTransaction.create({
        data: {
          salao_id: 'orphan', // Transação órfã
          transaction_id: transactionId,
          plano,
          valor: amount || 0,
          status: 'approved',
          payment_date: new Date(),
          customer_email: customerEmail,
          customer_name: customerName,
          webhook_data: JSON.stringify(webhookData)
        }
      })
      
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário não encontrado no sistema' 
      }, { status: 404 })
    }
    
    const salaoId = user.salao.id
    
    // Calcular datas de assinatura (30 dias)
    const now = new Date()
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 30)
    
    // Atualizar o salão com a assinatura ativa
    await prisma.salao.update({
      where: { id: salaoId },
      data: {
        plano,
        status: 'ATIVO',
        subscription_start_date: now,
        subscription_end_date: expirationDate,
        cakto_transaction_id: transactionId,
        is_trial_active: false // Desativa o trial ao assinar
      }
    })
    
    // Registrar a transação no histórico
    await prisma.caktoTransaction.create({
      data: {
        salao_id: salaoId,
        transaction_id: transactionId,
        plano,
        valor: amount || 0,
        status: 'approved',
        payment_date: now,
        customer_email: customerEmail,
        customer_name: customerName,
        webhook_data: JSON.stringify(webhookData)
      }
    })
    
    console.log(`Assinatura ativada para salão ${salaoId} - Plano: ${plano}`)
    
    return NextResponse.json({ 
      success: true,
      message: 'Assinatura ativada com sucesso',
      salaoId,
      plano,
      expiresAt: expirationDate.toISOString()
    })
    
  } catch (error) {
    console.error('Erro ao processar webhook Cakto:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno ao processar webhook' 
    }, { status: 500 })
  }
}
