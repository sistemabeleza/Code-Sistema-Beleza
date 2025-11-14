
import { NextResponse } from 'next/server'

// Esta API foi descontinuada - usar /api/configuracoes/webhook
export async function GET() {
  return NextResponse.json(
    { error: 'Esta API foi descontinuada. Use /api/configuracoes/webhook' },
    { status: 410 }
  )
}

export async function POST() {
  return NextResponse.json(
    { error: 'Esta API foi descontinuada. Use /api/configuracoes/webhook' },
    { status: 410 }
  )
}
