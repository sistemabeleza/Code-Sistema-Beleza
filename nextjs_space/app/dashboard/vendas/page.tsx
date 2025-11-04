
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function VendasPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-600">Registre vendas de produtos e serviços</p>
        </div>
        <Button disabled className="opacity-50 cursor-not-allowed">
          <Plus className="mr-2 h-4 w-4" />
          Em Desenvolvimento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Histórico de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sistema de Vendas em Desenvolvimento
            </h3>
            <p className="text-gray-500 mb-4">
              Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
            </p>
            <p className="text-sm text-gray-400">
              Aqui você poderá registrar vendas, consultar histórico e gerar relatórios de vendas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
