import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed...')

  // Limpar dados existentes (cuidado em produção!)
  await prisma.$executeRaw`TRUNCATE TABLE "users", "saloes", "profissionais", "servicos", "clientes", "agendamentos", "produtos" CASCADE`

  // Criar Salão com todas as configurações
  const salao = await prisma.salao.create({
    data: {
      nome: 'Salão Beleza Total',
      document_type: 'CNPJ',
      document: '12345678901234',
      telefone: '+5527999887766',
      email: 'contato@belezatotal.com.br',
      endereco: 'Rua das Flores, 123 - Centro - Vitória/ES',
      slug: 'beleza-total',
      descricao: 'O melhor salão de beleza da região! Especializado em cortes, coloração, manicure e estética.',
      cor_tema: '#E91E63',
      instagram_handle: 'belezatotal',
      whatsapp_number: '+5527999887766',
      timezone: 'America/Sao_Paulo',
      status: 'ATIVO',
      plano: 'PREMIUM',
    }
  })

  console.log('✅ Salão criado:', salao.nome)

  // Criar usuários
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const hashedPasswordTest = await bcrypt.hash('johndoe123', 10)
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@belezatotal.com.br',
      name: 'Administrador',
      password: hashedPassword,
      salao_id: salao.id,
      tipo: 'ADMIN',
      status: 'ATIVO',
    }
  })

  // Usuário de teste para validação
  const testUser = await prisma.user.create({
    data: {
      email: 'john@doe.com',
      name: 'John Doe',
      password: hashedPasswordTest,
      salao_id: salao.id,
      tipo: 'ADMIN',
      status: 'ATIVO',
    }
  })

  console.log('✅ Usuários criados:', adminUser.email, testUser.email)

  // Criar Serviços
  const servicos = await Promise.all([
    prisma.servico.create({
      data: {
        salao_id: salao.id,
        nome: 'Corte Feminino',
        descricao: 'Corte e finalização com escova',
        preco: 80.00,
        duracao_minutos: 60,
        categoria: 'Cabelo',
        status: 'ATIVO',
      }
    }),
    prisma.servico.create({
      data: {
        salao_id: salao.id,
        nome: 'Corte Masculino',
        descricao: 'Corte e acabamento',
        preco: 45.00,
        duracao_minutos: 30,
        categoria: 'Cabelo',
        status: 'ATIVO',
      }
    }),
    prisma.servico.create({
      data: {
        salao_id: salao.id,
        nome: 'Coloração Completa',
        descricao: 'Coloração com produtos de alta qualidade',
        preco: 200.00,
        duracao_minutos: 120,
        categoria: 'Cabelo',
        status: 'ATIVO',
      }
    }),
    prisma.servico.create({
      data: {
        salao_id: salao.id,
        nome: 'Manicure',
        descricao: 'Unhas das mãos com esmaltação',
        preco: 35.00,
        duracao_minutos: 45,
        categoria: 'Unhas',
        status: 'ATIVO',
      }
    }),
    prisma.servico.create({
      data: {
        salao_id: salao.id,
        nome: 'Pedicure',
        descricao: 'Unhas dos pés com esmaltação',
        preco: 40.00,
        duracao_minutos: 50,
        categoria: 'Unhas',
        status: 'ATIVO',
      }
    }),
    prisma.servico.create({
      data: {
        salao_id: salao.id,
        nome: 'Design de Sobrancelhas',
        descricao: 'Design e coloração de sobrancelhas',
        preco: 30.00,
        duracao_minutos: 30,
        categoria: 'Estética',
        status: 'ATIVO',
      }
    }),
    prisma.servico.create({
      data: {
        salao_id: salao.id,
        nome: 'Maquiagem',
        descricao: 'Maquiagem profissional para eventos',
        preco: 150.00,
        duracao_minutos: 90,
        categoria: 'Estética',
        status: 'ATIVO',
      }
    }),
  ])

  console.log('✅ Serviços criados:', servicos.length)

  // Horários de trabalho padrão
  const workHours = JSON.stringify({
    mon: [{ start: '09:00', end: '18:00' }],
    tue: [{ start: '09:00', end: '18:00' }],
    wed: [{ start: '09:00', end: '18:00' }],
    thu: [{ start: '09:00', end: '18:00' }],
    fri: [{ start: '09:00', end: '19:00' }],
    sat: [{ start: '09:00', end: '14:00' }]
  })

  const breaks = JSON.stringify([
    { start: '12:00', end: '13:00' }
  ])

  const daysOff = JSON.stringify([])

  // Criar Profissionais
  const profissionais = await Promise.all([
    prisma.profissional.create({
      data: {
        salao_id: salao.id,
        nome: 'Maria Silva',
        telefone: '+5527999111222',
        email: 'maria@belezatotal.com.br',
        especialidade: 'Cabeleireira',
        bio: 'Especialista em cortes e coloração com 10 anos de experiência',
        comissao_percentual: 40,
        status: 'ATIVO',
        work_hours: workHours,
        breaks: breaks,
        days_off: daysOff,
      }
    }),
    prisma.profissional.create({
      data: {
        salao_id: salao.id,
        nome: 'João Santos',
        telefone: '+5527999333444',
        email: 'joao@belezatotal.com.br',
        especialidade: 'Barbeiro',
        bio: 'Especializado em cortes masculinos e barbearia',
        comissao_percentual: 35,
        status: 'ATIVO',
        work_hours: workHours,
        breaks: breaks,
        days_off: daysOff,
      }
    }),
    prisma.profissional.create({
      data: {
        salao_id: salao.id,
        nome: 'Ana Costa',
        telefone: '+5527999555666',
        email: 'ana@belezatotal.com.br',
        especialidade: 'Manicure e Pedicure',
        bio: 'Especialista em nail art e cuidados com as unhas',
        comissao_percentual: 30,
        status: 'ATIVO',
        work_hours: workHours,
        breaks: breaks,
        days_off: daysOff,
      }
    }),
    prisma.profissional.create({
      data: {
        salao_id: salao.id,
        nome: 'Paula Oliveira',
        telefone: '+5527999777888',
        email: 'paula@belezatotal.com.br',
        especialidade: 'Maquiadora e Esteticista',
        bio: 'Especializada em maquiagem para noivas e eventos',
        comissao_percentual: 45,
        status: 'ATIVO',
        work_hours: workHours,
        breaks: breaks,
        days_off: daysOff,
      }
    }),
  ])

  console.log('✅ Profissionais criados:', profissionais.length)

  // Associar profissionais aos serviços
  await Promise.all([
    // Maria Silva - Cortes e coloração
    prisma.profissionalServico.create({
      data: {
        profissional_id: profissionais[0].id,
        servico_id: servicos[0].id, // Corte Feminino
      }
    }),
    prisma.profissionalServico.create({
      data: {
        profissional_id: profissionais[0].id,
        servico_id: servicos[2].id, // Coloração
      }
    }),
    // João Santos - Cortes masculinos
    prisma.profissionalServico.create({
      data: {
        profissional_id: profissionais[1].id,
        servico_id: servicos[1].id, // Corte Masculino
      }
    }),
    // Ana Costa - Manicure e Pedicure
    prisma.profissionalServico.create({
      data: {
        profissional_id: profissionais[2].id,
        servico_id: servicos[3].id, // Manicure
      }
    }),
    prisma.profissionalServico.create({
      data: {
        profissional_id: profissionais[2].id,
        servico_id: servicos[4].id, // Pedicure
      }
    }),
    // Paula Oliveira - Estética e Maquiagem
    prisma.profissionalServico.create({
      data: {
        profissional_id: profissionais[3].id,
        servico_id: servicos[5].id, // Design de Sobrancelhas
      }
    }),
    prisma.profissionalServico.create({
      data: {
        profissional_id: profissionais[3].id,
        servico_id: servicos[6].id, // Maquiagem
      }
    }),
  ])

  console.log('✅ Serviços associados aos profissionais')

  // Criar alguns clientes de exemplo
  const clientes = await Promise.all([
    prisma.cliente.create({
      data: {
        salao_id: salao.id,
        nome: 'Carla Mendes',
        telefone: '+5527988111222',
        email: 'carla@email.com',
        status: 'ATIVO',
      }
    }),
    prisma.cliente.create({
      data: {
        salao_id: salao.id,
        nome: 'Pedro Alves',
        telefone: '+5527988333444',
        email: 'pedro@email.com',
        status: 'ATIVO',
      }
    }),
    prisma.cliente.create({
      data: {
        salao_id: salao.id,
        nome: 'Juliana Rocha',
        telefone: '+5527988555666',
        email: 'juliana@email.com',
        status: 'ATIVO',
      }
    }),
  ])

  console.log('✅ Clientes criados:', clientes.length)

  // Criar alguns produtos
  const produtos = await Promise.all([
    prisma.produto.create({
      data: {
        salao_id: salao.id,
        nome: 'Shampoo Profissional',
        descricao: 'Shampoo para cabelos tratados',
        preco_custo: 25.00,
        preco_venda: 50.00,
        quantidade_estoque: 20,
        estoque_minimo: 5,
        categoria: 'Cabelo',
        status: 'ATIVO',
      }
    }),
    prisma.produto.create({
      data: {
        salao_id: salao.id,
        nome: 'Esmalte Premium',
        descricao: 'Esmalte de longa duração',
        preco_custo: 8.00,
        preco_venda: 15.00,
        quantidade_estoque: 50,
        estoque_minimo: 10,
        categoria: 'Unhas',
        status: 'ATIVO',
      }
    }),
    prisma.produto.create({
      data: {
        salao_id: salao.id,
        nome: 'Máscara Capilar',
        descricao: 'Máscara hidratante intensiva',
        preco_custo: 35.00,
        preco_venda: 70.00,
        quantidade_estoque: 15,
        estoque_minimo: 5,
        categoria: 'Cabelo',
        status: 'ATIVO',
      }
    }),
  ])

  console.log('✅ Produtos criados:', produtos.length)

  // Criar alguns agendamentos de exemplo
  const amanha = new Date()
  amanha.setDate(amanha.getDate() + 1)
  amanha.setHours(10, 0, 0, 0)

  const agendamentos = await Promise.all([
    prisma.agendamento.create({
      data: {
        salao_id: salao.id,
        cliente_id: clientes[0].id,
        profissional_id: profissionais[0].id,
        servico_id: servicos[0].id, // Corte Feminino
        data: amanha,
        hora_inicio: amanha,
        hora_fim: new Date(amanha.getTime() + 60 * 60 * 1000), // +1h
        status: 'AGENDADO',
        origem: 'SITE',
        valor_cobrado: 80.00,
      }
    }),
    prisma.agendamento.create({
      data: {
        salao_id: salao.id,
        cliente_id: clientes[1].id,
        profissional_id: profissionais[1].id,
        servico_id: servicos[1].id, // Corte Masculino
        data: new Date(amanha.getTime() + 2 * 60 * 60 * 1000),
        hora_inicio: new Date(amanha.getTime() + 2 * 60 * 60 * 1000),
        hora_fim: new Date(amanha.getTime() + 2.5 * 60 * 60 * 1000), // +30min
        status: 'AGENDADO',
        origem: 'MANUAL',
        valor_cobrado: 45.00,
      }
    }),
  ])

  console.log('✅ Agendamentos criados:', agendamentos.length)

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('\n📋 Informações de acesso:')
  console.log('   Email: admin@belezatotal.com.br')
  console.log('   Senha: admin123')
  console.log('\n🔗 Link público de agendamento:')
  console.log('   /agendamento/beleza-total')
  console.log('\n📱 Redes sociais configuradas:')
  console.log('   Instagram: @belezatotal')
  console.log('   WhatsApp: +55 27 99988-7766')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Erro no seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
