
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function ProdutosPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Controle seu estoque de produtos</p>
        </div>
        <Button disabled className="opacity-50 cursor-not-allowed">
          <Plus className="mr-2 h-4 w-4" />
          Em Desenvolvimento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Controle de Estoque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Controle de Produtos em Desenvolvimento
            </h3>
            <p className="text-gray-500 mb-4">
              Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
            </p>
            <p className="text-sm text-gray-400">
              Aqui você poderá gerenciar produtos, controlar estoque e configurar alertas de reposição.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
