
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Scissors, Calendar, Users, ShoppingBag, TrendingUp, Star, Check } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.replace('/dashboard')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (session) {
    return null // Redirect will handle navigation
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Sistema Beleza</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/admin">
                <Button variant="outline" className="border-gray-600 text-gray-600 hover:bg-gray-50">
                  Admin
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Entrar
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Criar Conta Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-12 mx-4">
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            Gestão Completa para seu
            <span className="text-blue-600 block">Salão de Beleza</span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Sistema profissional para gerenciar agendamentos, clientes, profissionais, 
            vendas e relatórios do seu salão de beleza, barbearia ou clínica estética.
          </p>

          <div className="flex items-center justify-center space-x-4">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                Criar Conta Grátis
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-8 py-6">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Funcionalidades Principais
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Agenda Inteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Gerencie agendamentos por profissional, evite conflitos e 
                otimize o tempo do seu salão.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Gestão de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Cadastro completo, histórico de atendimentos e programa 
                de fidelidade para seus clientes.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Controle de Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Gerencie produtos, vendas e controle de estoque com 
                alertas de reposição automáticos.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <CardTitle>Relatórios Financeiros</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Acompanhe receitas, comissões e performance com 
                relatórios detalhados e gráficos.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Gestão de Profissionais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Controle agenda individual, comissões e desempenho 
                de cada profissional.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Sistema Completo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Tudo que você precisa para gerenciar seu salão em 
                uma plataforma única e integrada.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Pronto para Revolucionar seu Salão?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Crie sua conta gratuita em segundos e comece a gerenciar seu salão hoje mesmo!
          </p>
          
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="text-blue-600 hover:text-blue-700">
              Começar Gratuitamente
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Scissors className="h-5 w-5 text-white" />
            </div>
            <h4 className="text-xl font-bold">Sistema Beleza</h4>
          </div>
          <p className="text-gray-400">
            © 2025 Sistema Beleza. Gestão profissional para salões de beleza.
          </p>
        </div>
      </footer>
    </div>
  )
}
