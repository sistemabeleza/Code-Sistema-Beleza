const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'john@doe.com' },
      include: { salao: true }
    });
    
    if (!user) {
      console.log('❌ Usuário não encontrado!');
      return;
    }
    
    console.log('✅ Usuário encontrado:');
    console.log('Email:', user.email);
    console.log('Nome:', user.name);
    console.log('Salão:', user.salao?.nome);
    console.log('Plano:', user.plano);
    console.log('Ativo:', user.assinatura_ativa);
    
    // Testar a senha
    const passwordMatch = await bcrypt.compare('johndoe123', user.password);
    console.log('Senha válida:', passwordMatch ? '✅ SIM' : '❌ NÃO');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
