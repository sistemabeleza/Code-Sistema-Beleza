
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { salao: true },
    });

    if (!user || !user.salao) {
      return NextResponse.json({ error: 'Usuário ou salão não encontrado' }, { status: 404 });
    }

    const { instance_id, token, tipo_envio, documento_url, phone } = await req.json();

    if (!instance_id || !token) {
      return NextResponse.json(
        { error: 'Instance ID e Token são obrigatórios' },
        { status: 400 }
      );
    }

    const phoneTest = phone || '5511999999999'; // Telefone padrão de teste

    // Construir URL e payload baseado no tipo
    let url = '';
    let payload = {};

    if (tipo_envio === 'documento' && documento_url) {
      url = `https://api.z-api.io/instances/${instance_id}/token/${token}/send-document/${phoneTest}`;
      payload = {
        phone: phoneTest,
        document: documento_url,
        fileName: 'teste-agendamento.pdf',
        caption: '🔔 Teste de Lembrete de Agendamento - Sistema Beleza',
      };
    } else {
      url = `https://api.z-api.io/instances/${instance_id}/token/${token}/send-text`;
      payload = {
        phone: phoneTest,
        message: '✅ Teste de Conexão ZAPI\n\n🔔 Seu sistema de lembretes está configurado corretamente!\n\n📱 Sistema Beleza',
      };
    }

    console.log('[ZAPI Test] URL:', url);
    console.log('[ZAPI Test] Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': token,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    const result = await response.json();

    console.log('[ZAPI Test] Response:', result);

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Erro ao testar conexão ZAPI',
        details: result,
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      message: 'Mensagem de teste enviada com sucesso!',
      details: result,
    });
  } catch (error: any) {
    console.error('Erro ao testar ZAPI:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro ao testar conexão',
    }, { status: 500 });
  }
}
