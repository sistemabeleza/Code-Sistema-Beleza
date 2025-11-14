
import { NextResponse } from 'next/server'

// Esta API foi descontinuada - usar /api/configuracoes/webhook/testar
export async function POST() {
  return NextResponse.json(
    { error: 'Esta API foi descontinuada. Use /api/configuracoes/webhook/testar' },
    { status: 410 }
  )
}
