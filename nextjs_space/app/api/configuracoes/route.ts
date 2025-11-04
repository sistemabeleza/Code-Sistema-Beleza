// Este arquivo foi substituído por /api/settings/route.ts
// Mantido para compatibilidade, mas redireciona para o novo endpoint

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/api/settings', request.url))
}

export async function PUT(request: NextRequest) {
  return NextResponse.redirect(new URL('/api/settings', request.url))
}
