
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
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

    const config = {
      automacao_ativa: user.salao.automacao_ativa,
      webhook_url: user.salao.webhook_url || '',
      zapi_instance_id: user.salao.zapi_instance_id || '',
      zapi_token: user.salao.zapi_token || '',
      zapi_tipo_envio: user.salao.zapi_tipo_envio || 'texto',
      zapi_delay: user.salao.zapi_delay || 2,
      zapi_enviar_confirmacao: user.salao.zapi_enviar_confirmacao ?? true,
      zapi_enviar_atualizacao: user.salao.zapi_enviar_atualizacao ?? true,
      zapi_enviar_cancelamento: user.salao.zapi_enviar_cancelamento ?? true,
      zapi_enviar_lembretes: user.salao.zapi_enviar_lembretes ?? false,
      zapi_horario_lembrete: user.salao.zapi_horario_lembrete || '09:00',
      zapi_documento_url: user.salao.zapi_documento_url || '',
      zapi_documento_nome: user.salao.zapi_documento_nome || '',
      zapi_documento_extensao: user.salao.zapi_documento_extensao || '',
      zapi_documento_descricao: user.salao.zapi_documento_descricao || '',
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Erro ao buscar configurações ZAPI:', error);
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 });
  }
}

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

    const data = await req.json();

    // Validação básica
    if (data.automacao_ativa) {
      if (!data.zapi_instance_id || !data.zapi_token) {
        return NextResponse.json(
          { error: 'Instance ID e Token são obrigatórios quando a automação está ativa' },
          { status: 400 }
        );
      }
    }

    // Atualizar no banco
    // NOTA: webhook_url agora é montado dinamicamente no webhook-utils.ts baseado no tipo de envio
    const updated = await prisma.salao.update({
      where: { id: user.salao.id },
      data: {
        automacao_ativa: data.automacao_ativa ?? false,
        zapi_instance_id: data.zapi_instance_id,
        zapi_token: data.zapi_token,
        zapi_tipo_envio: data.zapi_tipo_envio || 'texto',
        zapi_delay: data.zapi_delay || 2,
        zapi_enviar_confirmacao: data.zapi_enviar_confirmacao ?? true,
        zapi_enviar_atualizacao: data.zapi_enviar_atualizacao ?? true,
        zapi_enviar_cancelamento: data.zapi_enviar_cancelamento ?? true,
        zapi_enviar_lembretes: data.zapi_enviar_lembretes ?? false,
        zapi_horario_lembrete: data.zapi_horario_lembrete || '09:00',
        zapi_documento_url: data.zapi_documento_url,
        zapi_documento_nome: data.zapi_documento_nome,
        zapi_documento_extensao: data.zapi_documento_extensao,
        zapi_documento_descricao: data.zapi_documento_descricao,
      },
    });

    return NextResponse.json({ success: true, config: updated });
  } catch (error) {
    console.error('Erro ao salvar configurações ZAPI:', error);
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 });
  }
}
