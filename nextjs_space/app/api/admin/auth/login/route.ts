
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const ADMIN_EMAIL = 'sistemabeleza.contato@gmail.com'
const ADMIN_PASSWORD = 'Dg124578@'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validar credenciais
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Gerar token simples
      const token = crypto.randomBytes(32).toString('hex')
      
      return NextResponse.json({ 
        success: true,
        token,
        message: 'Login realizado com sucesso'
      })
    }

    return NextResponse.json(
      { error: 'Email ou senha incorretos' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Erro no login admin:', error)
    return NextResponse.json(
      { error: 'Erro ao processar login' },
      { status: 500 }
    )
  }
}
