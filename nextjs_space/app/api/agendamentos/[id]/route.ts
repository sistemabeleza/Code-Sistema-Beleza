
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()

    // Verificar se o agendamento pertence ao salão
    const agendamento = await prisma.agendamento.findFirst({
      where: {
        id,
        salao_id: session.user.salao_id
      }
    })

    if (!agendamento) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    const agendamentoAtualizado = await prisma.agendamento.update({
      where: { id },
      data: body,
      include: {
        cliente: true,
        profissional: true,
        servico: true
      }
    })

    return NextResponse.json({
      success: true,
      agendamento: agendamentoAtualizado,
      message: 'Agendamento atualizado com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar agendamento' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.salao_id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id } = params

    // Verificar se o agendamento pertence ao salão
    const agendamento = await prisma.agendamento.findFirst({
      where: {
        id,
        salao_id: session.user.salao_id
      }
    })

    if (!agendamento) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    await prisma.agendamento.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Agendamento excluído com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir agendamento' },
      { status: 500 }
    )
  }
}
