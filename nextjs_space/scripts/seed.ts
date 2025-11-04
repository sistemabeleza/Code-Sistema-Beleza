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

    // 4. CRIAR PROFISSIONAIS COM COMISSÃO
    console.log('💇 Criando profissionais...')
    const profissionais = await Promise.all([
      prisma.profissional.create({
        data: {
          salao_id: salao.id,
          nome: 'Maria Silva',
          telefone: '(11) 97777-7777',
          email: 'maria@salao.com',
          cpf: '11122233344',
          especialidade: 'Corte e Coloração',
          comissao_percentual: 40,
          status: 'ATIVO'
        }
      }),
      prisma.profissional.create({
        data: {
          salao_id: salao.id,
          nome: 'João Santos',
          telefone: '(11) 96666-6666',
          email: 'joao@salao.com',
          cpf: '22233344455',
          especialidade: 'Barbearia',
          comissao_percentual: 50,
          status: 'ATIVO'
        }
      })
    ])

    // 5. CRIAR SERVIÇOS COM DURAÇÃO
    console.log('✂️  Criando serviços...')
    const servicos = await Promise.all([
      prisma.servico.create({
        data: {
          salao_id: salao.id,
          nome: 'Corte Feminino',
          descricao: 'Corte de cabelo feminino com lavagem e finalização',
          preco: 80.00,
          duracao_minutos: 60,
          categoria: 'Cabelo',
          cor_agenda: '#F59E0B',
          status: 'ATIVO'
        }
      }),
      prisma.servico.create({
        data: {
          salao_id: salao.id,
          nome: 'Corte Masculino',
          descricao: 'Corte de cabelo masculino com barba',
          preco: 50.00,
          duracao_minutos: 45,
          categoria: 'Cabelo',
          cor_agenda: '#3B82F6',
          status: 'ATIVO'
        }
      }),
      prisma.servico.create({
        data: {
          salao_id: salao.id,
          nome: 'Manicure',
          descricao: 'Unha das mãos',
          preco: 35.00,
          duracao_minutos: 30,
          categoria: 'Unhas',
          cor_agenda: '#EC4899',
          status: 'ATIVO'
        }
      }),
      prisma.servico.create({
        data: {
          salao_id: salao.id,
          nome: 'Pedicure',
          descricao: 'Unha dos pés',
          preco: 40.00,
          duracao_minutos: 40,
          categoria: 'Unhas',
          cor_agenda: '#8B5CF6',
          status: 'ATIVO'
        }
      })
    ])

    // 6. CRIAR CLIENTES
    console.log('👥 Criando clientes...')
    const clientes = await Promise.all([
      prisma.cliente.create({
        data: {
          salao_id: salao.id,
          nome: 'Ana Paula',
          telefone: '(11) 95555-5555',
          email: 'ana@cliente.com',
          cpf: '33344455566',
          data_nascimento: new Date('1990-05-15'),
          status: 'ATIVO'
        }
      }),
      prisma.cliente.create({
        data: {
          salao_id: salao.id,
          nome: 'Carlos Eduardo',
          telefone: '(11) 94444-4444',
          email: 'carlos@cliente.com',
          cpf: '44455566677',
          data_nascimento: new Date('1985-08-20'),
          status: 'ATIVO'
        }
      }),
      prisma.cliente.create({
        data: {
          salao_id: salao.id,
          nome: 'Juliana Costa',
          telefone: '(11) 93333-3333',
          email: 'juliana@cliente.com',
          status: 'ATIVO'
        }
      })
    ])

    // 7. CRIAR PRODUTOS COM ESTOQUE
    console.log('📦 Criando produtos...')
    await Promise.all([
      prisma.produto.create({
        data: {
          salao_id: salao.id,
          nome: 'Shampoo Profissional',
          descricao: 'Shampoo profissional 1L',
          codigo_barras: '7891234567890',
          preco_custo: 45.00,
          preco_venda: 89.90,
          quantidade_estoque: 15,
          estoque_minimo: 5,
          categoria: 'Cabelo',
          marca: 'Loreal',
          fornecedor: 'Distribuidora Beleza Ltda',
          status: 'ATIVO'
        }
      }),
      prisma.produto.create({
        data: {
          salao_id: salao.id,
          nome: 'Condicionador Profissional',
          descricao: 'Condicionador profissional 1L',
          preco_custo: 50.00,
          preco_venda: 95.90,
          quantidade_estoque: 12,
          estoque_minimo: 5,
          categoria: 'Cabelo',
          marca: 'Loreal',
          fornecedor: 'Distribuidora Beleza Ltda',
          status: 'ATIVO'
        }
      }),
      prisma.produto.create({
        data: {
          salao_id: salao.id,
          nome: 'Esmalte Vermelho',
          descricao: 'Esmalte vermelho clássico',
          preco_custo: 8.00,
          preco_venda: 18.90,
          quantidade_estoque: 30,
          estoque_minimo: 10,
          categoria: 'Unhas',
          marca: 'Risqué',
          fornecedor: 'Distribuidora Beleza Ltda',
          status: 'ATIVO'
        }
      })
    ])

    console.log('✅ Seed concluído com sucesso!')
    console.log('\n📧 Credenciais de acesso:')
    console.log('Email: john@doe.com')
    console.log('Senha: johndoe123')
    console.log(`\n🏢 Salão: ${salao.nome}`)
    console.log(`🆔 Salão ID: ${salao.id}`)
    console.log(`\n👥 ${profissionais.length} profissionais criados`)
    console.log(`✂️  ${servicos.length} serviços criados`)
    console.log(`👥 ${clientes.length} clientes criados`)
    
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
