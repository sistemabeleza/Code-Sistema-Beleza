
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

    const { searchParams } = new URL(request.url)
    const formato = searchParams.get('formato') || 'vcard'

    // Busca todos os clientes ativos
    const clientes = await prisma.cliente.findMany({
      where: {
        salao_id: session.user.salao_id,
        status: 'ATIVO'
      },
      orderBy: {
        nome: 'asc'
      },
      select: {
        nome: true,
        telefone: true,
        email: true
      }
    })

    if (clientes.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum cliente encontrado' },
        { status: 404 }
      )
    }

    if (formato === 'csv') {
      // Gera CSV
      const csvHeader = 'Nome,Telefone,Email\n'
      const csvRows = clientes.map(cliente => 
        `"${cliente.nome}","${cliente.telefone}","${cliente.email || ''}"`
      ).join('\n')
      
      const csv = csvHeader + csvRows

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="clientes_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else {
      // Gera vCard
      const vcards = clientes.map(cliente => {
        const telefone = cliente.telefone.replace(/\D/g, '')
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${cliente.nome}`,
          `N:${cliente.nome};;;`,
          `TEL;TYPE=CELL:+55${telefone}`,
          cliente.email ? `EMAIL:${cliente.email}` : '',
          'END:VCARD'
        ].filter(Boolean).join('\r\n')
      }).join('\r\n')

      return new NextResponse(vcards, {
        headers: {
          'Content-Type': 'text/vcard; charset=utf-8',
          'Content-Disposition': `attachment; filename="clientes_${new Date().toISOString().split('T')[0]}.vcf"`
        }
      })
    }
  } catch (error) {
    console.error('Erro ao exportar clientes:', error)
    return NextResponse.json(
      { error: 'Erro ao exportar clientes' },
      { status: 500 }
    )
  }
}
