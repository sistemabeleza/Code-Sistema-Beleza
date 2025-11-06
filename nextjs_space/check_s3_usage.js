const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkS3Usage() {
  try {
    // Verificar se existem configurações de salão com logo/foto
    const saloes = await prisma.salao.findMany({
      where: {
        OR: [
          { logo_url: { not: null } },
          { foto_capa_url: { not: null } }
        ]
      },
      select: {
        id: true,
        nome: true,
        logo_url: true,
        foto_capa_url: true
      }
    });

    console.log('Salões com fotos no S3:');
    saloes.forEach(salao => {
      console.log(`\nSalão: ${salao.nome}`);
      if (salao.logo_url) console.log(`  Logo: ${salao.logo_url}`);
      if (salao.foto_capa_url) console.log(`  Foto: ${salao.foto_capa_url}`);
    });

    if (saloes.length === 0) {
      console.log('\nNenhum salão com fotos encontrado.');
      console.log('O sistema está configurado mas ainda não tem uploads no S3.');
    }

  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkS3Usage();
