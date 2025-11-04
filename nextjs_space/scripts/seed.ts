
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  try {
    // 1. CONFIGURAÇÕES DO SALÃO
    console.log('📋 Criando configurações do salão...')
    const configuracao = await prisma.configuracaoSalao.upsert({
      where: { id: 'config-padrao' },
      update: {},
      create: {
        id: 'config-padrao',
        nome_salao: 'Sistema Beleza - Salão Premium',
        cnpj: '12.345.678/0001-90',
        telefone: '(11) 99999-9999',
        email: 'contato@salaobeleza.com',
        endereco: 'Rua das Flores, 123 - Centro, São Paulo - SP',
        horario_funcionamento: 'Segunda a Sábado: 8h às 18h',
        cor_tema: '#3B82F6',
        configuracoes_json: JSON.stringify({
          tempo_intervalo_agendamento: 15,
          antecedencia_minima: 30,
          pontos_fidelidade_real: 10
        })
      }
    })

    // 2. USUÁRIOS DO SISTEMA
    console.log('👥 Criando usuários...')
    
    const senhaHash = await bcrypt.hash('johndoe123', 12)
    const senhaAdmin = await bcrypt.hash('admin123', 12)

    const usuarios = await Promise.all([
      prisma.user.upsert({
        where: { email: 'john@doe.com' },
        update: {},
        create: {
          name: 'John Doe Admin',
          email: 'john@doe.com',
          image: null,
          tipo: 'ADMIN',
          status: 'ATIVO',
          telefone: '(11) 88888-8888',
          cpf: '12345678901'
        }
      }),
      prisma.user.upsert({
        where: { email: 'admin@salao.com' },
        update: {},
        create: {
          name: 'Maria Administradora',
          email: 'admin@salao.com',
          image: null,
          tipo: 'ADMIN',
          status: 'ATIVO',
          telefone: '(11) 77777-7777',
          cpf: '98765432100'
        }
      }),
      prisma.user.upsert({
        where: { email: 'gerente@salao.com' },
        update: {},
        create: {
          name: 'Carlos Gerente',
          email: 'gerente@salao.com',
          image: null,
          tipo: 'GERENTE',
          status: 'ATIVO',
          telefone: '(11) 66666-6666',
          cpf: '11122233344'
        }
      }),
      prisma.user.upsert({
        where: { email: 'atendente@salao.com' },
        update: {},
        create: {
          name: 'Ana Atendente',
          email: 'atendente@salao.com',
          image: null,
          tipo: 'ATENDENTE',
          status: 'ATIVO',
          telefone: '(11) 55555-5555',
          cpf: '55566677788'
        }
      })
    ])

    // 3. PROFISSIONAIS
    console.log('💼 Criando profissionais...')
    const profissionais = await Promise.all([
      prisma.profissional.create({
        data: {
          nome: 'Fernanda Silva',
          telefone: '(11) 91234-5678',
          email: 'fernanda@salao.com',
          cpf: '12312312312',
          especialidade: 'Cabelos e Coloração',
          comissao_percentual: 40,
          status: 'ATIVO',
          data_contratacao: new Date('2023-01-15')
        }
      }),
      prisma.profissional.create({
        data: {
          nome: 'Juliana Santos',
          telefone: '(11) 92345-6789',
          email: 'juliana@salao.com',
          cpf: '32132132132',
          especialidade: 'Unhas e Manicure',
          comissao_percentual: 35,
          status: 'ATIVO',
          data_contratacao: new Date('2023-03-10')
        }
      }),
      prisma.profissional.create({
        data: {
          nome: 'Roberto Costa',
          telefone: '(11) 93456-7890',
          email: 'roberto@salao.com',
          cpf: '45645645645',
          especialidade: 'Barba e Bigode',
          comissao_percentual: 45,
          status: 'ATIVO',
          data_contratacao: new Date('2022-11-05')
        }
      }),
      prisma.profissional.create({
        data: {
          nome: 'Carla Mendes',
          telefone: '(11) 94567-8901',
          email: 'carla@salao.com',
          cpf: '78978978978',
          especialidade: 'Estética e Limpeza de Pele',
          comissao_percentual: 50,
          status: 'ATIVO',
          data_contratacao: new Date('2023-02-20')
        }
      })
    ])

    // 4. SERVIÇOS
    console.log('✂️ Criando serviços...')
    const servicos = await Promise.all([
      // Cabelos
      prisma.servico.create({
        data: {
          nome: 'Corte Feminino',
          descricao: 'Corte moderno e personalizado para mulheres',
          preco: 65.00,
          duracao_minutos: 60,
          categoria: 'Cabelos',
          cor_agenda: '#FF6B6B',
          status: 'ATIVO'
        }
      }),
      prisma.servico.create({
        data: {
          nome: 'Corte Masculino',
          descricao: 'Corte tradicional e moderno para homens',
          preco: 45.00,
          duracao_minutos: 45,
          categoria: 'Cabelos',
          cor_agenda: '#4ECDC4',
          status: 'ATIVO'
        }
      }),
      prisma.servico.create({
        data: {
          nome: 'Coloração',
          descricao: 'Tingimento completo ou mechas',
          preco: 120.00,
          duracao_minutos: 120,
          categoria: 'Cabelos',
          cor_agenda: '#95E1D3',
          status: 'ATIVO'
        }
      }),
      prisma.servico.create({
        data: {
          nome: 'Escova e Prancha',
          descricao: 'Escova modeladora com finalização',
          preco: 35.00,
          duracao_minutos: 45,
          categoria: 'Cabelos',
          cor_agenda: '#F38BA8',
          status: 'ATIVO'
        }
      }),
      // Unhas
      prisma.servico.create({
        data: {
          nome: 'Manicure',
          descricao: 'Cuidados completos para as unhas das mãos',
          preco: 25.00,
          duracao_minutos: 45,
          categoria: 'Unhas',
          cor_agenda: '#FFD93D',
          status: 'ATIVO'
        }
      }),
      prisma.servico.create({
        data: {
          nome: 'Pedicure',
          descricao: 'Cuidados completos para as unhas dos pés',
          preco: 30.00,
          duracao_minutos: 60,
          categoria: 'Unhas',
          cor_agenda: '#6BCF7F',
          status: 'ATIVO'
        }
      }),
      prisma.servico.create({
        data: {
          nome: 'Unhas em Gel',
          descricao: 'Alongamento e decoração com gel',
          preco: 80.00,
          duracao_minutos: 90,
          categoria: 'Unhas',
          cor_agenda: '#B19CD9',
          status: 'ATIVO'
        }
      }),
      // Estética
      prisma.servico.create({
        data: {
          nome: 'Limpeza de Pele',
          descricao: 'Limpeza profunda com extração',
          preco: 90.00,
          duracao_minutos: 75,
          categoria: 'Estética',
          cor_agenda: '#C9B037',
          status: 'ATIVO'
        }
      }),
      prisma.servico.create({
        data: {
          nome: 'Hidratação Facial',
          descricao: 'Tratamento hidratante para o rosto',
          preco: 70.00,
          duracao_minutos: 60,
          categoria: 'Estética',
          cor_agenda: '#87CEEB',
          status: 'ATIVO'
        }
      }),
      // Barba
      prisma.servico.create({
        data: {
          nome: 'Barba Completa',
          descricao: 'Corte, modelagem e tratamento da barba',
          preco: 40.00,
          duracao_minutos: 45,
          categoria: 'Barba',
          cor_agenda: '#8B4513',
          status: 'ATIVO'
        }
      })
    ])

    // 5. ASSOCIAR PROFISSIONAIS AOS SERVIÇOS
    console.log('🔗 Associando profissionais aos serviços...')
    const profissionalServicos = await Promise.all([
      // Fernanda - Cabelos
      prisma.profissionalServico.create({
        data: {
          profissional_id: profissionais[0].id,
          servico_id: servicos[0].id, // Corte Feminino
          ativo: true
        }
      }),
      prisma.profissionalServico.create({
        data: {
          profissional_id: profissionais[0].id,
          servico_id: servicos[2].id, // Coloração
          ativo: true
        }
      }),
      prisma.profissionalServico.create({
        data: {
          profissional_id: profissionais[0].id,
          servico_id: servicos[3].id, // Escova e Prancha
          ativo: true
        }
      }),
      // Juliana - Unhas
      prisma.profissionalServico.create({
        data: {
          profissional_id: profissionais[1].id,
          servico_id: servicos[4].id, // Manicure
          ativo: true
        }
      }),
      prisma.profissionalServico.create({
        data: {
          profissional_id: profissionais[1].id,
          servico_id: servicos[5].id, // Pedicure
          ativo: true
        }
      }),
      prisma.profissionalServico.create({
        data: {
          profissional_id: profissionais[1].id,
          servico_id: servicos[6].id, // Unhas em Gel
          ativo: true
        }
      }),
      // Roberto - Barba e Cabelo Masculino
      prisma.profissionalServico.create({
        data: {
          profissional_id: profissionais[2].id,
          servico_id: servicos[1].id, // Corte Masculino
          ativo: true
        }
      }),
      prisma.profissionalServico.create({
        data: {
          profissional_id: profissionais[2].id,
          servico_id: servicos[9].id, // Barba Completa
          ativo: true
        }
      }),
      // Carla - Estética
      prisma.profissionalServico.create({
        data: {
          profissional_id: profissionais[3].id,
          servico_id: servicos[7].id, // Limpeza de Pele
          ativo: true
        }
      }),
      prisma.profissionalServico.create({
        data: {
          profissional_id: profissionais[3].id,
          servico_id: servicos[8].id, // Hidratação Facial
          ativo: true
        }
      })
    ])

    // 6. CLIENTES
    console.log('👤 Criando clientes...')
    const clientes = await Promise.all([
      prisma.cliente.create({
        data: {
          nome: 'Ana Paula Silva',
          telefone: '(11) 91111-1111',
          email: 'ana.paula@email.com',
          cpf: '11111111111',
          data_nascimento: new Date('1990-05-15'),
          endereco: 'Rua A, 123 - Bairro X, São Paulo - SP',
          observacoes: 'Cliente VIP, prefere horários pela manhã',
          status: 'ATIVO'
        }
      }),
      prisma.cliente.create({
        data: {
          nome: 'Bruno Santos',
          telefone: '(11) 92222-2222',
          email: 'bruno.santos@email.com',
          cpf: '22222222222',
          data_nascimento: new Date('1985-08-22'),
          endereco: 'Av. B, 456 - Centro, São Paulo - SP',
          status: 'ATIVO'
        }
      }),
      prisma.cliente.create({
        data: {
          nome: 'Carla Oliveira',
          telefone: '(11) 93333-3333',
          email: 'carla.oliveira@email.com',
          cpf: '33333333333',
          data_nascimento: new Date('1992-12-03'),
          endereco: 'Rua C, 789 - Vila D, São Paulo - SP',
          observacoes: 'Alérgica a produtos com amônia',
          status: 'ATIVO'
        }
      }),
      prisma.cliente.create({
        data: {
          nome: 'Diego Ferreira',
          telefone: '(11) 94444-4444',
          email: 'diego.ferreira@email.com',
          cpf: '44444444444',
          data_nascimento: new Date('1988-07-18'),
          status: 'ATIVO'
        }
      }),
      prisma.cliente.create({
        data: {
          nome: 'Eduarda Lima',
          telefone: '(11) 95555-5555',
          email: 'eduarda.lima@email.com',
          cpf: '55555555555',
          data_nascimento: new Date('1995-11-30'),
          endereco: 'Praça E, 321 - Jardins, São Paulo - SP',
          status: 'ATIVO'
        }
      })
    ])

    // 7. PROGRAMA DE FIDELIDADE
    console.log('⭐ Criando programa de fidelidade...')
    const fidelidades = await Promise.all(
      clientes.slice(0, 3).map((cliente, index) =>
        prisma.fidelidadeCliente.create({
          data: {
            cliente_id: cliente.id,
            pontos_acumulados: [150, 280, 95][index],
            pontos_utilizados: [50, 120, 25][index],
            nivel: ['PRATA', 'OURO', 'BRONZE'][index],
            data_ultimo_ponto: new Date()
          }
        })
      )
    )

    // 8. PRODUTOS PARA ESTOQUE
    console.log('📦 Criando produtos...')
    const produtos = await Promise.all([
      prisma.produto.create({
        data: {
          nome: 'Shampoo Hidratante 500ml',
          descricao: 'Shampoo para cabelos secos e danificados',
          codigo_barras: '7891234567890',
          preco_custo: 15.00,
          preco_venda: 35.00,
          quantidade_estoque: 25,
          estoque_minimo: 5,
          categoria: 'Cabelos',
          marca: 'Loreal',
          fornecedor: 'Distribuidora Beleza Ltda',
          status: 'ATIVO'
        }
      }),
      prisma.produto.create({
        data: {
          nome: 'Condicionador Nutritivo 500ml',
          descricao: 'Condicionador para nutrição profunda',
          codigo_barras: '7891234567891',
          preco_custo: 18.00,
          preco_venda: 40.00,
          quantidade_estoque: 20,
          estoque_minimo: 5,
          categoria: 'Cabelos',
          marca: 'Loreal',
          fornecedor: 'Distribuidora Beleza Ltda',
          status: 'ATIVO'
        }
      }),
      prisma.produto.create({
        data: {
          nome: 'Esmalte Vermelho Clássico',
          descricao: 'Esmalte de longa duração cor vermelha',
          codigo_barras: '7891234567892',
          preco_custo: 8.00,
          preco_venda: 18.00,
          quantidade_estoque: 15,
          estoque_minimo: 3,
          categoria: 'Unhas',
          marca: 'Risqué',
          fornecedor: 'Cosméticos Distribuição SA',
          status: 'ATIVO'
        }
      }),
      prisma.produto.create({
        data: {
          nome: 'Base Facial Nude',
          descricao: 'Base líquida cobertura natural',
          codigo_barras: '7891234567893',
          preco_custo: 25.00,
          preco_venda: 55.00,
          quantidade_estoque: 10,
          estoque_minimo: 2,
          categoria: 'Maquiagem',
          marca: 'Maybelline',
          fornecedor: 'Beauty Supply Co',
          status: 'ATIVO'
        }
      }),
      prisma.produto.create({
        data: {
          nome: 'Creme Hidratante Facial 50g',
          descricao: 'Hidratante anti-idade para rosto',
          codigo_barras: '7891234567894',
          preco_custo: 30.00,
          preco_venda: 75.00,
          quantidade_estoque: 8,
          estoque_minimo: 2,
          categoria: 'Cuidados Faciais',
          marca: 'Nivea',
          fornecedor: 'Distribuidora Beleza Ltda',
          status: 'ATIVO'
        }
      })
    ])

    // 9. AGENDAMENTOS (alguns exemplos para os próximos dias)
    console.log('📅 Criando agendamentos...')
    const hoje = new Date()
    const agendamentos = await Promise.all([
      // Hoje
      prisma.agendamento.create({
        data: {
          cliente_id: clientes[0].id,
          profissional_id: profissionais[0].id,
          servico_id: servicos[0].id, // Corte Feminino
          data: hoje,
          hora_inicio: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 9, 0),
          hora_fim: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 10, 0),
          status: 'CONFIRMADO',
          valor_cobrado: 65.00,
          observacoes: 'Cliente regular, corte curto'
        }
      }),
      prisma.agendamento.create({
        data: {
          cliente_id: clientes[1].id,
          profissional_id: profissionais[2].id,
          servico_id: servicos[1].id, // Corte Masculino
          data: hoje,
          hora_inicio: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 10, 30),
          hora_fim: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 11, 15),
          status: 'AGENDADO',
          valor_cobrado: 45.00
        }
      }),
      // Amanhã
      prisma.agendamento.create({
        data: {
          cliente_id: clientes[2].id,
          profissional_id: profissionais[1].id,
          servico_id: servicos[4].id, // Manicure
          data: new Date(hoje.getTime() + 24 * 60 * 60 * 1000),
          hora_inicio: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1, 14, 0),
          hora_fim: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1, 14, 45),
          status: 'AGENDADO',
          valor_cobrado: 25.00
        }
      }),
      // Próxima semana
      prisma.agendamento.create({
        data: {
          cliente_id: clientes[3].id,
          profissional_id: profissionais[3].id,
          servico_id: servicos[7].id, // Limpeza de Pele
          data: new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000),
          hora_inicio: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 7, 15, 0),
          hora_fim: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 7, 16, 15),
          status: 'AGENDADO',
          valor_cobrado: 90.00,
          observacoes: 'Primeira vez no salão'
        }
      })
    ])

    // 10. PAGAMENTOS
    console.log('💳 Criando pagamentos...')
    const pagamentos = await Promise.all([
      prisma.pagamento.create({
        data: {
          agendamento_id: agendamentos[0].id,
          profissional_id: profissionais[0].id,
          valor: 65.00,
          forma_pagamento: 'PIX',
          status: 'PAGO',
          data_pagamento: new Date()
        }
      }),
      prisma.pagamento.create({
        data: {
          agendamento_id: agendamentos[1].id,
          profissional_id: profissionais[2].id,
          valor: 45.00,
          forma_pagamento: 'DEBITO',
          status: 'PENDENTE',
          data_vencimento: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      })
    ])

    // 11. ALGUMAS VENDAS DE PRODUTOS
    console.log('🛍️ Criando vendas...')
    const vendas = await Promise.all([
      prisma.venda.create({
        data: {
          cliente_id: clientes[0].id,
          numero_venda: 'V-2025-001',
          valor_total: 75.00,
          desconto: 5.00,
          valor_final: 70.00,
          observacoes: 'Venda casada com serviço'
        }
      }),
      prisma.venda.create({
        data: {
          cliente_id: clientes[1].id,
          numero_venda: 'V-2025-002',
          valor_total: 18.00,
          desconto: 0.00,
          valor_final: 18.00
        }
      })
    ])

    // 12. ITENS DAS VENDAS
    const itensVenda = await Promise.all([
      prisma.itemVenda.create({
        data: {
          venda_id: vendas[0].id,
          produto_id: produtos[0].id,
          quantidade: 1,
          valor_unitario: 35.00,
          desconto: 0.00,
          valor_total: 35.00
        }
      }),
      prisma.itemVenda.create({
        data: {
          venda_id: vendas[0].id,
          produto_id: produtos[1].id,
          quantidade: 1,
          valor_unitario: 40.00,
          desconto: 5.00,
          valor_total: 35.00
        }
      }),
      prisma.itemVenda.create({
        data: {
          venda_id: vendas[1].id,
          produto_id: produtos[2].id,
          quantidade: 1,
          valor_unitario: 18.00,
          desconto: 0.00,
          valor_total: 18.00
        }
      })
    ])

    // 13. PAGAMENTOS DAS VENDAS
    const pagamentosVendas = await Promise.all([
      prisma.pagamento.create({
        data: {
          venda_id: vendas[0].id,
          valor: 70.00,
          forma_pagamento: 'CREDITO',
          status: 'PAGO',
          data_pagamento: new Date(),
          parcelas: 2,
          parcela_atual: 1
        }
      }),
      prisma.pagamento.create({
        data: {
          venda_id: vendas[1].id,
          valor: 18.00,
          forma_pagamento: 'DINHEIRO',
          status: 'PAGO',
          data_pagamento: new Date()
        }
      })
    ])

    // 14. MOVIMENTAÇÕES DE ESTOQUE
    console.log('📊 Criando movimentações de estoque...')
    const movimentacoes = await Promise.all([
      prisma.movimentacaoEstoque.create({
        data: {
          produto_id: produtos[0].id,
          tipo: 'SAIDA',
          quantidade: 1,
          valor_unitario: 35.00,
          motivo: 'Venda para cliente Ana Paula'
        }
      }),
      prisma.movimentacaoEstoque.create({
        data: {
          produto_id: produtos[1].id,
          tipo: 'SAIDA',
          quantidade: 1,
          valor_unitario: 40.00,
          motivo: 'Venda para cliente Ana Paula'
        }
      }),
      prisma.movimentacaoEstoque.create({
        data: {
          produto_id: produtos[2].id,
          tipo: 'SAIDA',
          quantidade: 1,
          valor_unitario: 18.00,
          motivo: 'Venda para cliente Bruno'
        }
      })
    ])

    console.log('✅ Seed concluído com sucesso!')
    
    console.log('\n📊 RESUMO DOS DADOS CRIADOS:')
    console.log(`- ${usuarios.length} usuários`)
    console.log(`- ${profissionais.length} profissionais`)
    console.log(`- ${servicos.length} serviços`)
    console.log(`- ${clientes.length} clientes`)
    console.log(`- ${produtos.length} produtos`)
    console.log(`- ${agendamentos.length} agendamentos`)
    console.log(`- ${pagamentos.length + pagamentosVendas.length} pagamentos`)
    console.log(`- ${vendas.length} vendas`)
    console.log(`- ${fidelidades.length} programas de fidelidade`)
    console.log(`- 1 configuração do salão`)

    console.log('\n🔑 USUÁRIOS DE TESTE:')
    console.log('Admin: john@doe.com / johndoe123')
    console.log('Admin: admin@salao.com / admin123')
    console.log('Gerente: gerente@salao.com / password123')
    console.log('Atendente: atendente@salao.com / password123')

  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
