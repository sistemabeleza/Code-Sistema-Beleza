import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar um salão exemplo
  const salao = await prisma.salao.upsert({
    where: { slug: 'salao-beleza-total' },
    update: {},
    create: {
      nome: 'Beleza Total',
      telefone: '+5527999999999',
      email: 'contato@belezatotal.com.br',
      endereco: 'Rua das Flores, 123 - Centro',
      slug: 'salao-beleza-total',
      descricao: 'Salão de beleza completo com os melhores profissionais',
      cor_tema: '#E91E63',
      instagram_handle: '@belezatotal',
      whatsapp_number: '+5527999999999',
      plano: 'PROFISSIONAL',
      status: 'ATIVO'
    }
  })

  console.log('✅ Salão criado')

  // Criar usuário admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@belezatotal.com.br' },
    update: {},
    create: {
      email: 'admin@belezatotal.com.br',
      name: 'Administrador',
      password: '$2a$10$rN7YJnKwVqQzJz.5dLxqReK7q0u9QXC9.FV.qhG6XJZ5zK0LqN7Ci', // senha: admin123
      salao_id: salao.id,
      tipo: 'ADMIN',
      status: 'ATIVO'
    }
  })

  console.log('✅ Usuário admin criado')

  // Criar profissionais
  const profissionais = await Promise.all([
    prisma.profissional.create({
      data: {
        salao_id: salao.id,
        nome: 'Maria Silva',
        telefone: '+5527999888777'
      }
    }),
    prisma.profissional.create({
      data: {
        salao_id: salao.id,
        nome: 'João Santos',
        telefone: '+5527999777666'
      }
    }),
    prisma.profissional.create({
      data: {
        salao_id: salao.id,
        nome: 'Ana Costa',
        telefone: '+5527999666555'
      }
    })
  ])

  console.log('✅ Profissionais criados')

  // Criar serviços
  const servicos = await Promise.all([
    prisma.servico.create({
      data: {
        salao_id: salao.id,
        nome: 'Corte de Cabelo',
        preco: 50.00,
        duracao_minutos: 30
      }
    }),
    prisma.servico.create({
      data: {
        salao_id: salao.id,
        nome: 'Manicure',
        preco: 35.00,
        duracao_minutos: 45
      }
    }),
    prisma.servico.create({
      data: {
        salao_id: salao.id,
        nome: 'Pedicure',
        preco: 40.00,
        duracao_minutos: 45
      }
    }),
    prisma.servico.create({
      data: {
        salao_id: salao.id,
        nome: 'Hidratação',
        preco: 80.00,
        duracao_minutos: 60
      }
    }),
    prisma.servico.create({
      data: {
        salao_id: salao.id,
        nome: 'Design de Sobrancelhas',
        preco: 30.00,
        duracao_minutos: 20
      }
    })
  ])

  console.log('✅ Serviços criados')

  // Criar clientes
  const clientes = await Promise.all([
    prisma.cliente.create({
      data: {
        salao_id: salao.id,
        nome: 'Carla Mendes',
        telefone: '+5527999555444',
        status: 'ATIVO'
      }
    }),
    prisma.cliente.create({
      data: {
        salao_id: salao.id,
        nome: 'Pedro Lima',
        telefone: '+5527999444333',
        status: 'ATIVO'
      }
    })
  ])

  console.log('✅ Clientes criados')

  console.log('✅ Seed completo!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
