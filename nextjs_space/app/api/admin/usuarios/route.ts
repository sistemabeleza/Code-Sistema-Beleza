
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Listar todos os usuários
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const usuarios = await prisma.user.findMany({
      include: {
        salao: {
          select: {
            nome: true,
            email: true,
            telefone: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Não retornar senhas
    const usuariosLimpos = usuarios.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      tipo: u.tipo,
      status: u.status,
      telefone: u.telefone,
      cpf: u.cpf,
      salao: u.salao,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }))

    return NextResponse.json({ usuarios: usuariosLimpos })
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
  }
}

// Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()

    // Verificar se email já existe
    const usuarioExistente = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (usuarioExistente) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password || '123456', 10)

    const usuario = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        salao_id: data.salao_id,
        tipo: data.tipo || 'ADMIN',
        status: data.status || 'ATIVO',
        telefone: data.telefone || null,
        cpf: data.cpf || null,
      },
      include: {
        salao: {
          select: {
            nome: true,
            email: true,
          }
        }
      }
    })

    // Não retornar senha
    const { password, ...usuarioLimpo } = usuario

    return NextResponse.json({ usuario: usuarioLimpo })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
  }
}

// Excluir usuário
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID do usuário não informado' }, { status: 400 })
    }

    // Não permitir excluir o próprio usuário
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Você não pode excluir seu próprio usuário' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Usuário excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 })
  }
}
