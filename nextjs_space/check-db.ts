import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Verificando banco de dados...\n')
    
    // Verificar usuários
    const users = await prisma.user.findMany({
      include: {
        salao: true
      }
    })
    
    console.log(`✅ Total de usuários: ${users.length}`)
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Salão: ${user.salao?.nome || 'Sem salão'}`)
    })
    
    // Verificar salões
    const saloes = await prisma.salao.findMany()
    console.log(`\n✅ Total de salões: ${saloes.length}`)
    saloes.forEach(salao => {
      console.log(`   - ${salao.nome} - Plano: ${salao.plano} - Status: ${salao.status}`)
    })
    
    // Verificar agendamentos
    const agendamentos = await prisma.agendamento.findMany()
    console.log(`\n✅ Total de agendamentos: ${agendamentos.length}`)
    
    // Verificar profissionais
    const profissionais = await prisma.professional.findMany()
    console.log(`\n✅ Total de profissionais: ${profissionais.length}`)
    
    // Verificar serviços
    const servicos = await prisma.service.findMany()
    console.log(`\n✅ Total de serviços: ${servicos.length}`)
    
    // Verificar transações Cakto
    const transactions = await prisma.caktoTransaction.findMany()
    console.log(`\n✅ Total de transações Cakto: ${transactions.length}`)
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
