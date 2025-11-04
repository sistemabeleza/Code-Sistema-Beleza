
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import AgendamentoPublicoForm from './_components/AgendamentoPublicoForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: {
    slug: string
  }
}

export default async function AgendamentoPublicoPage({ params }: PageProps) {
  const { slug } = params

  const salao = await prisma.salao.findUnique({
    where: { slug },
    include: {
      servicos: {
        where: { status: 'ATIVO' },
        orderBy: { nome: 'asc' }
      },
      profissionais: {
        where: { status: 'ATIVO' },
        orderBy: { nome: 'asc' }
      }
    }
  })

  if (!salao) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AgendamentoPublicoForm salao={salao} />
    </div>
  )
}
