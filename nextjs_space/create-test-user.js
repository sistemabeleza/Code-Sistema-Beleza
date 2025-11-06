
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Verificar se já existe
    const existing = await prisma.user.findUnique({
      where: { email: 'john@doe.com' }
    });
    
    if (existing) {
      console.log('✅ Usuário de teste já existe!');
      await prisma.$disconnect();
      return;
    }
    
    // Criar hash da senha
    const hashedPassword = await bcrypt.hash('johndoe123', 10);
    
    // Criar salão de teste
    const salao = await prisma.salao.create({
      data: {
        nome: 'Test Salon',
        slug: 'test-salon-temp',
        email: 'john@doe.com',
      },
    });
    
    // Criar usuário de teste
    const user = await prisma.user.create({
      data: {
        email: 'john@doe.com',
        name: 'John Doe',
        password: hashedPassword,
        salao_id: salao.id,
        plano: 'BASICO',
        assinatura_ativa: true,
        data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    
    console.log('✅ Usuário de teste criado com sucesso!');
    console.log('Email:', user.email);
    console.log('Salão ID:', salao.id);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
