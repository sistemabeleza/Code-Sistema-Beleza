const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('johndoe123', 10);
    
    const user = await prisma.user.update({
      where: { email: 'john@doe.com' },
      data: {
        password: hashedPassword,
      },
    });
    
    console.log('✅ Senha do usuário atualizada com sucesso!');
    console.log('Email:', user.email);
    
    // Testar a senha
    const passwordMatch = await bcrypt.compare('johndoe123', user.password);
    console.log('Senha válida:', passwordMatch ? '✅ SIM' : '❌ NÃO');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateTestUser();
