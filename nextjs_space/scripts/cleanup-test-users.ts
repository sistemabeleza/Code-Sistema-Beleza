import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Limpando usuários de teste...')

  try {
    // Buscar o Douglas Oliver
    const douglas = await prisma.user.findUnique({
      where: { email: 'douglas321.site@gmail.com' }
    })

    if (!douglas) {
      console.log('❌ Usuário Douglas Oliver não encontrado!')
      return
    }

    console.log('✅ Douglas Oliver encontrado:', douglas.name, douglas.email)

    // Buscar todos os usuários
    const todosUsuarios = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    console.log(`\n📊 Total de usuários antes da limpeza: ${todosUsuarios.length}`)

    // Deletar todos os usuários EXCETO o Douglas Oliver
    const resultado = await prisma.user.deleteMany({
      where: {
        NOT: {
          email: 'douglas321.site@gmail.com'
        }
      }
    })

    console.log(`\n🗑️  ${resultado.count} usuários de teste removidos`)

    // Verificar usuários restantes
    const usuariosRestantes = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        salao: {
          select: {
            nome: true
          }
        }
      }
    })

    console.log(`\n✅ Usuários restantes no sistema: ${usuariosRestantes.length}`)
    usuariosRestantes.forEach(u => {
      console.log(`  - ${u.name} (${u.email}) - Salão: ${u.salao?.nome}`)
    })

    console.log('\n✨ Limpeza concluída com sucesso!')

  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
