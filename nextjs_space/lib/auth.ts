
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            salao: true
          }
        })

        if (!user || !user.password) {
          return null
        }

        // Verificar senha com bcrypt
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isPasswordValid) {
          return null
        }

        // Verificar se usuário está ativo
        if (user.status !== 'ATIVO') {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          tipo: user.tipo,
          status: user.status,
          salao_id: user.salao_id,
          salao_nome: user.salao?.nome || ''
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tipo = (user as any).tipo
        token.status = (user as any).status
        token.salao_id = (user as any).salao_id
        token.salao_nome = (user as any).salao_nome
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || ''
        session.user.tipo = token.tipo
        session.user.status = token.status
        session.user.salao_id = token.salao_id
        session.user.salao_nome = token.salao_nome
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout'
  },
  secret: process.env.NEXTAUTH_SECRET
}
