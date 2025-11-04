
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const profissionais = await prisma.profissional.findMany({
      where: {
        salao_id: session.user.salao_id,
        status: 'ATIVO'
      },
      orderBy: {
        nome: 'asc'
      },
      select: {
        id: true,
        nome: true,
        telefone: true,
        email: true,
        comissao_percentual: true
      }
    })

    return NextResponse.json(profissionais)
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar profissionais' },
      { status: 500 }
    )
  }
}
