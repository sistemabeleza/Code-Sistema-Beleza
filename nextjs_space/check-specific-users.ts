import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function checkSpecificUsers() {
  try {
    console.log('═══════════════════════════════════════════════════')
    console.log('🔍 BUSCANDO USUÁRIOS ESPECÍFICOS')
    console.log('═══════════════════════════════════════════════════\n')
    
    // Buscar TODOS os usuários
    const allUsers = await prisma.user.findMany({
      include: {
        salao: true
      }
    })
    
    console.log(`📊 TOTAL DE USUÁRIOS NO BANCO: ${allUsers.length}\n`)
    
    // Listar todos os emails
    console.log('📧 TODOS OS EMAILS CADASTRADOS:\n')
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   Nome: ${user.name}`)
      console.log(`   Salão: ${user.salao?.nome || 'Sem salão'}`)
      console.log(`   ID: ${user.id}`)
      console.log('')
    })
    
    // Buscar especificamente os usuários mencionados
    console.log('\n═══════════════════════════════════════════════════')
    console.log('🔍 PROCURANDO EMAILS ESPECÍFICOS:')
    console.log('═══════════════════════════════════════════════════\n')
    
    const email1 = 'douglas321.site@gmail.com'
    const email2 = 'contato@oliveiraltda@gmail.com'
    
    const user1 = await prisma.user.findUnique({
      where: { email: email1 },
      include: { salao: true }
    })
    
    const user2 = await prisma.user.findUnique({
      where: { email: email2 },
      include: { salao: true }
    })
    
    if (user1) {
      console.log(`✅ ENCONTRADO: ${email1}`)
      console.log(`   Nome: ${user1.name}`)
      console.log(`   Salão: ${user1.salao?.nome || 'Sem salão'}`)
      console.log(`   ID: ${user1.id}\n`)
    } else {
      console.log(`❌ NÃO ENCONTRADO: ${email1}\n`)
    }
    
    if (user2) {
      console.log(`✅ ENCONTRADO: ${email2}`)
      console.log(`   Nome: ${user2.name}`)
      console.log(`   Salão: ${user2.salao?.nome || 'Sem salão'}`)
      console.log(`   ID: ${user2.id}\n`)
    } else {
      console.log(`❌ NÃO ENCONTRADO: ${email2}\n`)
    }
    
    // Verificar variações dos emails (caso haja erro de digitação)
    console.log('\n═══════════════════════════════════════════════════')
    console.log('🔍 PROCURANDO VARIAÇÕES DOS EMAILS:')
    console.log('═══════════════════════════════════════════════════\n')
    
    const similarUsers = allUsers.filter(u => 
      u.email.includes('douglas') || 
      u.email.includes('oliveira') ||
      u.email.includes('321') ||
      u.email.includes('ltda')
    )
    
    if (similarUsers.length > 0) {
      console.log('📧 Emails similares encontrados:')
      similarUsers.forEach(u => {
        console.log(`   - ${u.email}`)
      })
    } else {
      console.log('❌ Nenhum email similar encontrado')
    }
    
    // Verificar todos os salões
    console.log('\n═══════════════════════════════════════════════════')
    console.log('🏪 TODOS OS SALÕES:')
    console.log('═══════════════════════════════════════════════════\n')
    
    const allSaloes = await prisma.salao.findMany()
    allSaloes.forEach((salao, index) => {
      console.log(`${index + 1}. ${salao.nome}`)
      console.log(`   ID: ${salao.id}`)
      console.log(`   Plano: ${salao.plano}`)
      console.log(`   Status: ${salao.status}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSpecificUsers()
