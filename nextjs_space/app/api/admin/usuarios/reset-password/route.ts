
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Redefinir senha de usuário
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.userId || !data.newPassword) {
      return NextResponse.json({ error: 'ID e nova senha são obrigatórios' }, { status: 400 })
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(data.newPassword, 10)

    await prisma.user.update({
      where: { id: data.userId },
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
