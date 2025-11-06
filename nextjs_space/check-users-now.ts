import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('═══════════════════════════════════════════════════')
    console.log('🔍 VERIFICAÇÃO COMPLETA DO BANCO DE DADOS')
    console.log('═══════════════════════════════════════════════════\n')
    
    // Verificar usuários
    const users = await prisma.user.findMany({
      include: {
        salao: true
      }
    })
    
    console.log(`📊 USUÁRIOS CADASTRADOS: ${users.length}\n`)
    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 ${user.name}`)
      console.log(`   📧 Email: ${user.email}`)
      console.log(`   🏢 Salão: ${user.salao?.nome || 'Sem salão'}`)
      console.log(`   📅 Cadastrado: ${user.created_at?.toLocaleDateString('pt-BR') || 'N/A'}`)
      console.log('')
    })
    
    // Verificar salões
    const saloes = await prisma.salao.findMany()
    console.log(`\n🏪 SALÕES CADASTRADOS: ${saloes.length}\n`)
    saloes.forEach((salao, index) => {
      console.log(`${index + 1}. 🏢 ${salao.nome}`)
      console.log(`   📋 Plano: ${salao.plano}`)
      console.log(`   ✅ Status: ${salao.status}`)
      console.log(`   🔗 Slug: ${salao.slug}`)
      if (salao.subscription_end_date) {
        console.log(`   ⏰ Válido até: ${new Date(salao.subscription_end_date).toLocaleDateString('pt-BR')}`)
      }
      console.log('')
    })
    
    // Verificar profissionais
    const profissionais = await prisma.profissional.findMany({
      include: {
        salao: {
          select: { nome: true }
        }
      }
    })
    console.log(`\n👨‍💼 PROFISSIONAIS: ${profissionais.length}\n`)
    
    // Verificar serviços
    const servicos = await prisma.servico.findMany({
      include: {
        salao: {
          select: { nome: true }
        }
      }
    })
    console.log(`💇 SERVIÇOS: ${servicos.length}\n`)
    
    // Verificar agendamentos
    const agendamentos = await prisma.agendamento.findMany()
    console.log(`📅 AGENDAMENTOS: ${agendamentos.length}\n`)
    
    // Verificar produtos
    const produtos = await prisma.produto.findMany()
    console.log(`🛍️ PRODUTOS: ${produtos.length}\n`)
    
    // Verificar transações Cakto
    const transactions = await prisma.caktoTransaction.findMany()
    console.log(`💳 TRANSAÇÕES CAKTO: ${transactions.length}\n`)
    
    console.log('═══════════════════════════════════════════════════')
    console.log('✅ BANCO DE DADOS ESTÁ FUNCIONANDO PERFEITAMENTE!')
    console.log('═══════════════════════════════════════════════════')
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
