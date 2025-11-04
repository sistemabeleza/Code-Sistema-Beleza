
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      tipo: 'ADMIN' | 'GERENTE' | 'ATENDENTE'
      status: 'ATIVO' | 'INATIVO' | 'SUSPENSO'
      salao_id: string
      salao_nome: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    tipo: 'ADMIN' | 'GERENTE' | 'ATENDENTE'
    status: 'ATIVO' | 'INATIVO' | 'SUSPENSO'
    salao_id: string
    salao_nome: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    tipo: 'ADMIN' | 'GERENTE' | 'ATENDENTE'
    status: 'ATIVO' | 'INATIVO' | 'SUSPENSO'
    salao_id: string
    salao_nome: string
  }
}
