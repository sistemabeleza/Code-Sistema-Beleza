
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { salaoId, plano } = body

    if (!salaoId || !plano) {
      return NextResponse.json(
        { error: 'ID do salão e plano são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar se o plano é válido
    const planosValidos = ['BASICO', 'INTERMEDIARIO', 'COMPLETO']
    if (!planosValidos.includes(plano)) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    // Atualizar o plano do salão
    const salaoAtualizado = await prisma.salao.update({
      where: { id: salaoId },
      data: { plano: plano as any }
    })

    return NextResponse.json({
      success: true,
      salao: {
        id: salaoAtualizado.id,
        nome: salaoAtualizado.nome,
        plano: salaoAtualizado.plano
      }
    })
  } catch (error) {
    console.error('Erro ao alterar plano:', error)
    return NextResponse.json(
      { error: 'Erro ao alterar plano' },
      { status: 500 }
    )
  }
}
