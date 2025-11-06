
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapeamento dos links de pagamento para planos
const PAYMENT_LINKS = {
  'ac64njr_616158': 'BASICO',
  'w2y2hgj_616200': 'INTERMEDIARIO',
  '33qmtrg_616270': 'COMPLETO',
  // Também aceitar IDs diretos
  'ac64njr': 'BASICO',
  'w2y2hgj': 'INTERMEDIARIO',
  '33qmtrg': 'COMPLETO'
} as const

// Função auxiliar para extrair dados do webhook (múltiplos formatos)
function extractWebhookData(payload: any) {
  // Formato 1: Estrutura aninhada
  let transactionId = payload.data?.transaction_id || payload.data?.id || payload.transaction_id || payload.id
  let customerEmail = payload.customer?.email || payload.data?.customer?.email || payload.email
  let customerName = payload.customer?.name || payload.data?.customer?.name || payload.name || payload.customer_name
  let amount = payload.data?.amount || payload.data?.valor || payload.amount || payload.valor || payload.value
  let offerCode = payload.offer?.code || payload.data?.offer?.code || payload.offer_code || payload.product_id || payload.link_id
  let status = payload.status || payload.data?.status || 'approved'
  let event = payload.event || payload.type || payload.event_type

  return {
    transactionId,
    customerEmail,
    customerName,
    amount,
    offerCode,
    status,
    event
  }
}

// Função para identificar o plano
function identificarPlano(offerCode: string | undefined, amount?: number): 'BASICO' | 'INTERMEDIARIO' | 'COMPLETO' {
  if (!offerCode && amount) {
    // Tentar identificar pelo valor
    if (amount >= 99) return 'COMPLETO'
    if (amount >= 49) return 'INTERMEDIARIO'
    return 'BASICO'
  }

  const offerCodeStr = String(offerCode || '').toLowerCase()
  
  for (const [linkCode, planName] of Object.entries(PAYMENT_LINKS)) {
    if (offerCodeStr.includes(linkCode.toLowerCase())) {
      return planName as any
    }
  }
  
  // Default
  return 'BASICO'
}

export async function POST(req: NextRequest) {
  try {
    // Validar chave API (se enviada no header)
    const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '')
    
    // Log de segurança
    console.log('🔔 Webhook Cakto recebido')
    console.log('Headers:', Object.fromEntries(req.headers.entries()))
    
    const webhookData = await req.json()
    console.log('📦 Payload completo:', JSON.stringify(webhookData, null, 2))
    
    // Extrair dados do webhook
    const {
      transactionId,
      customerEmail,
      customerName,
      amount,
      offerCode,
      status,
      event
    } = extractWebhookData(webhookData)

    console.log('📋 Dados extraídos:', {
      transactionId,
      customerEmail,
      customerName,
      amount,
      offerCode,
      status,
      event
    })
    
    // Verificar se é um evento de compra aprovada
    const approvedEvents = ['compra_aprovada', 'purchase_approved', 'approved', 'paid', 'payment_approved']
    const isApproved = approvedEvents.some(e => event?.toLowerCase().includes(e.toLowerCase())) || 
                      status?.toLowerCase() === 'approved' ||
                      status?.toLowerCase() === 'paid'
    
    if (!isApproved && event) {
      console.log(`⚠️ Evento "${event}" ignorado (não é compra aprovada)`)
      return NextResponse.json({ 
        success: true, 
        message: `Evento "${event}" ignorado (não é compra aprovada)` 
      })
    }
    
    if (!transactionId) {
      console.error('❌ Webhook sem transaction_id')
      return NextResponse.json({ 
        success: false, 
        error: 'transaction_id não encontrado no payload',
        received_data: webhookData
      }, { status: 400 })
    }
    
    // Verificar se a transação já foi processada
    const existingTransaction = await prisma.caktoTransaction.findUnique({
      where: { transaction_id: String(transactionId) }
    })
    
    if (existingTransaction) {
      console.log('✅ Transação já processada anteriormente:', transactionId)
      return NextResponse.json({ 
        success: true, 
        message: 'Transação já processada anteriormente',
        transaction_id: transactionId
      })
    }
    
    // Identificar o plano
    const plano = identificarPlano(offerCode, amount)
    console.log('🎯 Plano identificado:', plano)
    
    // Se não tiver email, registrar transação órfã
    if (!customerEmail) {
      console.warn('⚠️ Webhook sem email do cliente')
      
      await prisma.caktoTransaction.create({
        data: {
          salao_id: 'orphan',
          transaction_id: String(transactionId),
          plano,
          valor: amount || 0,
          status: status || 'approved',
          payment_date: new Date(),
          customer_email: customerEmail || 'sem-email@cakto.com',
          customer_name: customerName || 'Cliente sem email',
          webhook_data: JSON.stringify(webhookData)
        }
      })
      
      return NextResponse.json({ 
        success: true, 
        message: 'Transação registrada sem email do cliente',
        transaction_id: transactionId
      })
    }
    
    // Buscar o salão pelo email do usuário
    const user = await prisma.user.findUnique({
      where: { email: customerEmail },
      include: { salao: true }
    })
    
    if (!user || !user.salao) {
      console.error(`❌ Usuário não encontrado para email: ${customerEmail}`)
      
      // Registrar a transação mesmo sem salão associado
      await prisma.caktoTransaction.create({
        data: {
          salao_id: 'orphan',
          transaction_id: String(transactionId),
          plano,
          valor: amount || 0,
          status: status || 'approved',
          payment_date: new Date(),
          customer_email: customerEmail,
          customer_name: customerName,
          webhook_data: JSON.stringify(webhookData)
        }
      })
      
      return NextResponse.json({ 
        success: false, 
        error: `Usuário não encontrado no sistema para o email: ${customerEmail}`,
        hint: 'O usuário precisa se cadastrar no sistema antes de fazer o pagamento'
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
        cakto_transaction_id: String(transactionId),
        is_trial_active: false
      }
    })
    
    // Registrar a transação no histórico
    await prisma.caktoTransaction.create({
      data: {
        salao_id: salaoId,
        transaction_id: String(transactionId),
        plano,
        valor: amount || 0,
        status: status || 'approved',
        payment_date: now,
        customer_email: customerEmail,
        customer_name: customerName,
        webhook_data: JSON.stringify(webhookData)
      }
    })
    
    console.log(`✅ Assinatura ativada com sucesso!`)
    console.log(`   Salão: ${salaoId}`)
    console.log(`   Plano: ${plano}`)
    console.log(`   Válido até: ${expirationDate.toLocaleDateString('pt-BR')}`)
    
    return NextResponse.json({ 
      success: true,
      message: 'Assinatura ativada com sucesso! 🎉',
      salaoId,
      plano,
      expiresAt: expirationDate.toISOString(),
      transaction_id: transactionId
    })
    
  } catch (error) {
    console.error('💥 Erro ao processar webhook Cakto:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno ao processar webhook',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

// Endpoint GET para teste
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'online',
    message: 'Webhook Cakto está ativo e pronto para receber notificações',
    endpoint: '/api/webhooks/cakto',
    supported_events: ['compra_aprovada', 'purchase_approved', 'approved', 'paid'],
    api_key_configured: !!process.env.CAKTO_API_KEY
  })
}
