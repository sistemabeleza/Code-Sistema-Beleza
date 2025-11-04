
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { searchParams } = new URL(request.url)
    const servicoId = searchParams.get('servico_id')

    // Busca o salão pelo slug
    const salao = await prisma.salao.findUnique({
      where: {
        slug: slug,
        status: 'ATIVO'
      },
      select: {
        id: true
      }
    })

    if (!salao) {
      return NextResponse.json(
        { error: 'Salão não encontrado' },
        { status: 404 }
      )
    }

    // Se foi passado um serviço, busca apenas profissionais que atendem esse serviço
    if (servicoId) {
      const profissionaisServico = await prisma.profissionalServico.findMany({
        where: {
          servico_id: servicoId,
          profissional: {
            salao_id: salao.id,
            status: 'ATIVO'
          }
        },
        include: {
          profissional: {
            select: {
              id: true,
              nome: true,
              bio: true,
              foto: true,
              especialidade: true
            }
          }
        }
      })

      const profissionais = profissionaisServico.map(ps => ps.profissional)
      return NextResponse.json(profissionais)
    }

    // Senão, busca todos os profissionais ativos
    const profissionais = await prisma.profissional.findMany({
      where: {
        salao_id: salao.id,
        status: 'ATIVO'
      },
      orderBy: {
        nome: 'asc'
      },
      select: {
        id: true,
        nome: true,
        bio: true,
        foto: true,
        especialidade: true
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
