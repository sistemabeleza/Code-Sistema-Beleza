
import { NextRequest, NextResponse } from 'next/server'
import { downloadFile } from '@/lib/s3'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'Key é obrigatório' },
        { status: 400 }
      )
    }

    // Gerar URL assinada
    const signedUrl = await downloadFile(key)

    // Redirecionar para a URL assinada
    return NextResponse.redirect(signedUrl)
  } catch (error) {
    console.error('Erro ao fazer download:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer download do arquivo' },
      { status: 500 }
    )
  }
}
