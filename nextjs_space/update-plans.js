const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function updatePlans() {
  try {
    // Atualizar todos os salões para usar o plano BASICO
    const result = await prisma.$executeRaw`
      UPDATE saloes 
      SET plano = 'BASICO'::text
      WHERE plano NOT IN ('BASICO');
    `;
    
    console.log(`Atualizados ${result} salões para o plano BASICO`);
    
  } catch (error) {
    console.error('Erro ao atualizar planos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePlans();
