import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== VERIFICANDO USUÁRIOS NO BANCO ===\n');
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      tipo: true,
      status: true,
      salao_id: true,
    }
  });
  
  console.log(`Total de usuários: ${users.length}\n`);
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name || 'Sem nome'}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Tipo: ${user.tipo}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Salão ID: ${user.salao_id || 'N/A'}`);
    console.log('');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
