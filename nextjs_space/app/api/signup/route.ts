
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Suporte para ambos os formatos (novo e legado para testes)
    const nomeSalao = body.nomeSalao || (body.firstName && body.lastName ? `Salão ${body.firstName} ${body.lastName}` : null)
    const nome = body.nome || (body.firstName && body.lastName ? `${body.firstName} ${body.lastName}` : null)
    const email = body.email
    const senha = body.senha || body.password
    const plano = body.plano || 'BASICO'

    // Validações
    if (!nomeSalao || !nome || !email || !senha) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 12)

    // Criar salão e usuário em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Calcular datas do trial (30 dias)
      const trialStartDate = new Date()
      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + 30)
      
      // 1. Criar o salão
      const salao = await tx.salao.create({
        data: {
          nome: nomeSalao,
          plano: plano as any, // BASICO, INTERMEDIARIO ou COMPLETO
          status: 'ATIVO',
          is_trial_active: true,
          trial_start_date: trialStartDate,
          trial_end_date: trialEndDate
        }
      })

      // 2. Criar configuração do salão
      await tx.configuracaoSalao.create({
        data: {
          salao_id: salao.id,
          configuracoes_json: JSON.stringify({
            tempo_intervalo_agendamento: 30,
            antecedencia_minima: 60,
            pontos_fidelidade_real: 10
          })
        }
      })

      // 3. Criar usuário administrador vinculado ao salão
      const user = await tx.user.create({
        data: {
          name: nome,
          email,
          password: hashedPassword,
          salao_id: salao.id,
          tipo: 'ADMIN',
          status: 'ATIVO'
        }
      })

      return { salao, user }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        tipo: result.user.tipo
      },
      salao: {
        id: result.salao.id,
        nome: result.salao.nome
      }
    })
  } catch (error) {
    console.error('Erro no signup:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta. Tente novamente.' },
      { status: 500 }
    )
  }
}
