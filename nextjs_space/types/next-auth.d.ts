
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
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    tipo: 'ADMIN' | 'GERENTE' | 'ATENDENTE'
    status: 'ATIVO' | 'INATIVO' | 'SUSPENSO'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    tipo: 'ADMIN' | 'GERENTE' | 'ATENDENTE'
    status: 'ATIVO' | 'INATIVO' | 'SUSPENSO'
  }
}
