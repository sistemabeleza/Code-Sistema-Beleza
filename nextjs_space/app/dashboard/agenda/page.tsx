import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AgendaView from './_components/AgendaView'

export const dynamic = 'force-dynamic'

export default async function AgendaPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <p className="text-gray-600">Gerencie os agendamentos do salão</p>
      </div>

      <AgendaView />
    </div>
  )
}
