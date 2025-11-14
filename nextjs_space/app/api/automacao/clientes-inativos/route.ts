
import { NextResponse } from 'next/server'

// Esta API foi descontinuada
export async function GET() {
  return NextResponse.json(
    { error: 'Esta API foi descontinuada' },
    { status: 410 }
  )
}
