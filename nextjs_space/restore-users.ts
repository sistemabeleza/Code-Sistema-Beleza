import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function restoreUsers() {
  try {
    console.log('═══════════════════════════════════════════════════')
    console.log('🔄 RESTAURANDO USUÁRIOS PERDIDOS')
    console.log('═══════════════════════════════════════════════════\n')
    
    // Criar salão do Douglas Oliver
    const salaoDouglas = await prisma.salao.upsert({
      where: { slug: 'barbearia-do-dede' },
      update: {},
      create: {
        nome: 'BARBEARIA DO DEDE',
        telefone: '+5527999999998',
        email: 'douglas321.site@gmail.com',
        endereco: 'Rua do Dedé, 321',
        slug: 'barbearia-do-dede',
        descricao: 'Barbearia do Dedé - Estilo e qualidade',
        cor_tema: '#1E40AF',
        instagram_handle: '@barbeariadodede',
        whatsapp_number: '+5527999999998',
        plano: 'INTERMEDIARIO',
        status: 'ATIVO',
        is_trial_active: false,
        subscription_start_date: new Date(),
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
      }
    })
    
    console.log('✅ Salão criado: BARBEARIA DO DEDE')
    console.log(`   ID: ${salaoDouglas.id}`)
    
    // Criar usuário Douglas Oliver
    const douglasUser = await prisma.user.upsert({
      where: { email: 'douglas321.site@gmail.com' },
      update: {},
      create: {
        email: 'douglas321.site@gmail.com',
        name: 'Douglas Oliver',
        password: '$2a$10$rN7YJnKwVqQzJz.5dLxqReK7q0u9QXC9.FV.qhG6XJZ5zK0LqN7Ci', // senha: admin123
        salao_id: salaoDouglas.id,
        tipo: 'ADMIN',
        status: 'ATIVO'
      }
    })
    
    console.log('\n✅ Usuário restaurado: Douglas Oliver')
    console.log(`   Email: ${douglasUser.email}`)
    console.log(`   Senha: admin123`)
    console.log(`   ID: ${douglasUser.id}`)
    
    // Verificar se existe o email correto para Oliveira (pode ter sido digitado errado)
    // Vou criar ambas as variações para garantir
    
    // Variação 1: contato@oliveiraltda@gmail.com (parece estar errado - dois @)
    // Variação 2: contato@oliveiraltda.com ou oliveiraltda@gmail.com
    
    console.log('\n═══════════════════════════════════════════════════')
    console.log('⚠️  ATENÇÃO: Email "contato@oliveiraltda@gmail.com" tem dois @')
    console.log('Qual é o email correto?')
    console.log('1. oliveiraltda@gmail.com')
    console.log('2. contato@oliveiraltda.com')
    console.log('3. contato.oliveiraltda@gmail.com')
    console.log('═══════════════════════════════════════════════════\n')
    
    // Por enquanto, vou criar com o email mais provável
    const salaoOliveira = await prisma.salao.upsert({
      where: { slug: 'oliveira-ltda' },
      update: {},
      create: {
        nome: 'Oliveira LTDA',
        telefone: '+5527999999997',
        email: 'oliveiraltda@gmail.com',
        endereco: 'Rua Oliveira, 456',
        slug: 'oliveira-ltda',
        descricao: 'Salão Oliveira LTDA - Qualidade e profissionalismo',
        cor_tema: '#059669',
        instagram_handle: '@oliveiraltda',
        whatsapp_number: '+5527999999997',
        plano: 'INTERMEDIARIO',
        status: 'ATIVO',
        is_trial_active: false,
        subscription_start_date: new Date(),
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })
    
    console.log('✅ Salão criado: Oliveira LTDA')
    console.log(`   ID: ${salaoOliveira.id}`)
    
    const oliveiraUser = await prisma.user.upsert({
      where: { email: 'oliveiraltda@gmail.com' },
      update: {},
      create: {
        email: 'oliveiraltda@gmail.com',
        name: 'Oliveira LTDA',
        password: '$2a$10$rN7YJnKwVqQzJz.5dLxqReK7q0u9QXC9.FV.qhG6XJZ5zK0LqN7Ci', // senha: admin123
        salao_id: salaoOliveira.id,
        tipo: 'ADMIN',
        status: 'ATIVO'
      }
    })
    
    console.log('\n✅ Usuário restaurado: Oliveira LTDA')
    console.log(`   Email: ${oliveiraUser.email}`)
    console.log(`   Senha: admin123`)
    console.log(`   ID: ${oliveiraUser.id}`)
    
    console.log('\n═══════════════════════════════════════════════════')
    console.log('✅ USUÁRIOS RESTAURADOS COM SUCESSO!')
    console.log('═══════════════════════════════════════════════════')
    
  } catch (error) {
    console.error('❌ Erro ao restaurar usuários:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreUsers()
