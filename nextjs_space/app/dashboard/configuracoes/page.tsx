import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ConfiguracoesForm from './_components/ConfiguracoesForm'

export const dynamic = 'force-dynamic'

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações do Salão</h1>
        <p className="text-gray-600">Configure os dados do seu salão e personalize o link de agendamento</p>
      </div>

      <ConfiguracoesForm />
    </div>
  )
}
