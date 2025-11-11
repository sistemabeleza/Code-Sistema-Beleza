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

    console.log('\n📊 INFORMAÇÕES DO BANCO DE DADOS\n');
    console.log('='.repeat(50));
    console.log('\n📈 ESTATÍSTICAS GERAIS:');
    console.log(`  • Total de Salões: ${totalSaloes}`);
    console.log(`  • Total de Usuários: ${totalUsuarios}`);
    console.log(`  • Total de Clientes: ${totalClientes}`);
    console.log(`  • Total de Agendamentos: ${totalAgendamentos}`);
    console.log(`  • Total de Produtos: ${totalProdutos}`);
    console.log(`  • Total de Vendas: ${totalVendas}`);

    console.log('\n💎 DISTRIBUIÇÃO POR PLANO:');
    saloesPorPlano.forEach(plano => {
      console.log(`  • ${plano.plano}: ${plano._count} salões`);
    });

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ Consulta concluída com sucesso!\n');

  } catch (error) {
    console.error('❌ Erro ao consultar banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
