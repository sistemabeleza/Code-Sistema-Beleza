
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { enviarLembreteZAPI } from '@/lib/webhook-utils';

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

    const salao = user.salao;

    // Verificar se lembretes automáticos estão ativos
    if (!salao.automacao_ativa || !salao.zapi_enviar_lembretes) {
      return NextResponse.json({ 
        message: 'Lembretes automáticos não estão ativados',
        enviados: 0 
      });
    }

    // Buscar agendamentos do dia
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        salao_id: salao.id,
        data: {
          gte: hoje,
          lt: amanha,
        },
        status: {
          in: ['AGENDADO', 'CONFIRMADO'],
        },
      },
      include: {
        cliente: true,
        servico: true,
        profissional: true,
      },
    });

    console.log(`[Lembretes Automáticos] Encontrados ${agendamentos.length} agendamentos para hoje`);

    let enviados = 0;
    const erros: any[] = [];

    for (const agendamento of agendamentos) {
      try {
        await enviarLembreteZAPI(agendamento, salao);
        enviados++;
        console.log(`[Lembretes Automáticos] Lembrete enviado para ${agendamento.cliente.nome}`);
      } catch (error: any) {
        console.error(`[Lembretes Automáticos] Erro ao enviar para ${agendamento.cliente.nome}:`, error);
        erros.push({
          cliente: agendamento.cliente.nome,
          erro: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      total: agendamentos.length,
      enviados,
      erros: erros.length > 0 ? erros : undefined,
    });
  } catch (error: any) {
    console.error('Erro ao processar lembretes automáticos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
