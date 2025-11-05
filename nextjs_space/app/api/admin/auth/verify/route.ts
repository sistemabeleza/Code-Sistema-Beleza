
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    // Verificar se o token existe (validação simples)
    if (token && token.length === 64) {
      return NextResponse.json({ valid: true })
    }

    return NextResponse.json({ valid: false }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }
}
