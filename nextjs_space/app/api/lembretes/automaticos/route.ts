
import { NextResponse } from 'next/server'

// Esta API foi descontinuada - usar /api/lembretes/diarios
export async function POST() {
  return NextResponse.json(
    { error: 'Esta API foi descontinuada. Use /api/lembretes/diarios' },
    { status: 410 }
  )
}
