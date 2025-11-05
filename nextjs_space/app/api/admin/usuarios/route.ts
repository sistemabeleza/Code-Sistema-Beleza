
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Listar todos os usuários
export async function GET(request: NextRequest) {
  try {
    const usuarios = await prisma.user.findMany({
      where: {
        // Não mostrar usuários de teste do sistema
        email: { 
          notIn: ['john@doe.com', 'testuserfrkwy803@example.com']
        }
      },
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

    return NextResponse.json(usuariosLimpos)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
  }
}

// Criar novo usuário
export async function POST(request: NextRequest) {
  try {
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

    // Criar salão primeiro
    const salao = await prisma.salao.create({
      data: {
        nome: `Salão de ${data.name}`,
        email: data.email,
        telefone: data.telefone || '',
        endereco: '',
        slug: `${data.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        status: 'ATIVO'
      }
    })

    // Criar usuário com o salão
    const usuario = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        salao_id: salao.id,
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

// Atualizar usuário
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.id) {
      return NextResponse.json({ error: 'ID do usuário não informado' }, { status: 400 })
    }

    // Verificar se email já existe em outro usuário
    if (data.email) {
      const usuarioExistente = await prisma.user.findFirst({
        where: { 
          email: data.email,
          NOT: { id: data.id }
        }
      })

      if (usuarioExistente) {
        return NextResponse.json({ error: 'Email já cadastrado em outro usuário' }, { status: 400 })
      }
    }

    const usuario = await prisma.user.update({
      where: { id: data.id },
      data: {
        name: data.name,
        email: data.email,
        tipo: data.tipo,
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
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 })
  }
}

// Excluir usuário
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID do usuário não informado' }, { status: 400 })
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
