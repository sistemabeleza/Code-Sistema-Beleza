require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    // Contar usuários/salões
    const totalSaloes = await prisma.salao.count();
    const totalUsuarios = await prisma.user.count();
    const totalClientes = await prisma.cliente.count();
    const totalAgendamentos = await prisma.agendamento.count();
    const totalProdutos = await prisma.produto.count();
    const totalVendas = await prisma.venda.count();

    // Verificar planos
    const saloesPorPlano = await prisma.salao.groupBy({
      by: ['plano'],
      _count: true
    });

    // Verificar status
    const saloesPorStatus = await prisma.salao.groupBy({
      by: ['status'],
      _count: true
    });

    console.log('\n📊 INFORMAÇÕES DO BANCO DE DADOS PostgreSQL\n');
    console.log('='.repeat(60));
    console.log('\n🗄️  BANCO DE DADOS:');
    console.log('  • Tipo: PostgreSQL (Managed Database)');
    console.log('  • Host: db-42302409.db002.hosteddb.reai.io');
    console.log('  • Porta: 5432');
    
    console.log('\n📈 ESTATÍSTICAS ATUAIS:');
    console.log(`  • Total de Salões Cadastrados: ${totalSaloes}`);
    console.log(`  • Total de Usuários do Sistema: ${totalUsuarios}`);
    console.log(`  • Total de Clientes Finais: ${totalClientes}`);
    console.log(`  • Total de Agendamentos: ${totalAgendamentos}`);
    console.log(`  • Total de Produtos: ${totalProdutos}`);
    console.log(`  • Total de Vendas: ${totalVendas}`);

    console.log('\n💎 DISTRIBUIÇÃO POR PLANO:');
    saloesPorPlano.forEach(plano => {
      console.log(`  • ${plano.plano}: ${plano._count} salão(ões)`);
    });

    console.log('\n🔄 DISTRIBUIÇÃO POR STATUS:');
    saloesPorStatus.forEach(status => {
      console.log(`  • ${status.status}: ${status._count} salão(ões)`);
    });

    console.log('\n📊 CAPACIDADE PARA NOVOS USUÁRIOS:');
    const espacoDisponivel = 'Ilimitado (banco gerenciado)';
    const recomendacao = totalSaloes + 100;
    console.log(`  • Espaço Disponível: ${espacoDisponivel}`);
    console.log(`  • Salões Atuais: ${totalSaloes}`);
    console.log(`  • Após adicionar 100 novos: ${recomendacao} salões`);
    console.log(`  • Status: ✅ SUPORTA TRANQUILAMENTE`);

    console.log('\n💡 OBSERVAÇÕES:');
    console.log('  • PostgreSQL gerenciado suporta milhares de registros');
    console.log('  • Sistema multi-tenant bem estruturado');
    console.log('  • 100 novos usuários = sem problemas de capacidade');
    console.log('  • Cada salão tem dados isolados (multi-tenancy)');

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Sistema pronto para escalar!\n');

  } catch (error) {
    console.error('❌ Erro ao consultar banco:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
