import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados SaaS Multi-Tenant...')

  try {
    // 1. CRIAR SALÃO DE EXEMPLO (TENANT)
    console.log('🏢 Criando salão de exemplo...')
    const salao = await prisma.salao.upsert({
      where: { id: 'salao-demo' },
      update: {},
      create: {
        id: 'salao-demo',
        nome: 'Salão Beleza Premium',
        cnpj: '12.345.678/0001-90',
        telefone: '(11) 99999-9999',
        email: 'contato@salaobeleza.com',
        endereco: 'Rua das Flores, 123 - Centro, São Paulo - SP',
        horario_funcionamento: 'Segunda a Sábado: 8h às 18h',
        cor_tema: '#3B82F6',
        plano: 'PROFISSIONAL',
        status: 'ATIVO'
      }
    })

    // 2. CRIAR CONFIGURAÇÃO DO SALÃO
    console.log('⚙️  Criando configurações...')
    await prisma.configuracaoSalao.upsert({
      where: { salao_id: salao.id },
      update: {},
      create: {
        salao_id: salao.id,
        configuracoes_json: JSON.stringify({
          tempo_intervalo_agendamento: 15,
          antecedencia_minima: 30,
          pontos_fidelidade_real: 10
        })
      }
    })

    // 3. CRIAR USUÁRIO ADMINISTRADOR DO SALÃO
    console.log('👥 Criando usuário administrador...')
    
    const senhaHash = await bcrypt.hash('johndoe123', 12)

    await prisma.user.upsert({
      where: { email: 'john@doe.com' },
      update: {},
      create: {
        name: 'John Doe',
        email: 'john@doe.com',
        password: senhaHash,
        image: null,
        salao_id: salao.id,
        tipo: 'ADMIN',
        status: 'ATIVO',
        telefone: '(11) 88888-8888',
        cpf: '12345678901'
      }
    })

    console.log('✅ Seed concluído com sucesso!')
    console.log('\n📧 Credenciais de acesso:')
    console.log('Email: john@doe.com')
    console.log('Senha: johndoe123')
    console.log(`\n🏢 Salão: ${salao.nome}`)
    console.log(`🆔 Salão ID: ${salao.id}`)
    
  } catch (error) {
    console.error('\n❌ Erro durante o seed:', error)
    throw error
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
