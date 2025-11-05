
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Redefinir senha de usuário
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()

    if (!data.id || !data.new_password) {
      return NextResponse.json({ error: 'ID e nova senha são obrigatórios' }, { status: 400 })
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(data.new_password, 10)

    await prisma.user.update({
      where: { id: data.id },
      data: {
        password: hashedPassword,
      },
    })

    return NextResponse.json({ message: 'Senha redefinida com sucesso' })
  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    return NextResponse.json({ error: 'Erro ao redefinir senha' }, { status: 500 })
  }
}
