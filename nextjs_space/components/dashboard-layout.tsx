
'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Scissors, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserCheck, 
  ShoppingBag, 
  Package, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Agenda', href: '/dashboard/agenda', icon: Calendar },
  { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
  { name: 'Profissionais', href: '/dashboard/profissionais', icon: UserCheck },
  { name: 'Serviços', href: '/dashboard/servicos', icon: Scissors },
  { name: 'Produtos', href: '/dashboard/produtos', icon: Package },
  { name: 'Vendas', href: '/dashboard/vendas', icon: ShoppingBag },
  { name: 'Financeiro', href: '/dashboard/financeiro', icon: CreditCard },
  { name: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
  { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  const getUserInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getTipoUsuarioLabel = (tipo: string) => {
    switch (tipo) {
      case 'ADMIN':
        return 'Administrador'
      case 'GERENTE':
        return 'Gerente'
      case 'ATENDENTE':
        return 'Atendente'
      default:
        return tipo
    }
  }

  const getTipoUsuarioColor = (tipo: string) => {
    switch (tipo) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'GERENTE':
        return 'bg-blue-100 text-blue-800'
      case 'ATENDENTE':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex flex-col w-full max-w-xs bg-white">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Scissors className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-bold text-gray-800">{session?.user.salao_nome || 'Sistema Beleza'}</span>
              </div>
              <span className="text-xs text-gray-500 ml-10">Multi-Salão SaaS</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-white border-r border-gray-200">
        <div className="flex flex-col h-16 px-6 py-3 border-b border-gray-200 justify-center">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Scissors className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-800">{session?.user.salao_nome || 'Sistema Beleza'}</span>
          </div>
          <span className="text-xs text-gray-500 ml-11">Multi-Salão SaaS</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-400" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </div>

              <Button
                onClick={handleLogout}
                variant="ghost"
                className="flex items-center space-x-3 hover:bg-gray-100"
                title="Sair"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback>
                    {getUserInitials(session?.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-700">
                    {session?.user?.name || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session?.user?.email}
                  </p>
                </div>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
