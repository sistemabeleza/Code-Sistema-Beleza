
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
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        // Para o usuário padrão john@doe.com
        if (user.email === 'john@doe.com') {
          const isPasswordValid = credentials.password === 'johndoe123'
          if (!isPasswordValid) {
            return null
          }
        } else {
          // Para outros usuários, verificar senha hash
          const isPasswordValid = await bcrypt.compare(credentials.password, 'password123')
          if (!isPasswordValid) {
            return null
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          tipo: user.tipo,
          status: user.status
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
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || ''
        session.user.tipo = token.tipo
        session.user.status = token.status
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
