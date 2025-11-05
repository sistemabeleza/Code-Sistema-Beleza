import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Limpeza final...')

  // Manter apenas Douglas Oliver e John Doe (usuário de teste do sistema)
  const resultado = await prisma.user.deleteMany({
    where: {
      AND: [
        { email: { not: 'douglas321.site@gmail.com' } },
        { email: { not: 'john@doe.com' } }
      ]
    }
  })

  console.log(`✅ ${resultado.count} usuários de teste removidos`)

  const usuariosRestantes = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      salao: {
        select: {
          nome: true
        }
      }
    }
  })

  console.log(`\n✅ Usuários finais no sistema: ${usuariosRestantes.length}`)
  usuariosRestantes.forEach(u => {
    console.log(`  - ${u.name} (${u.email}) - Salão: ${u.salao?.nome}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
