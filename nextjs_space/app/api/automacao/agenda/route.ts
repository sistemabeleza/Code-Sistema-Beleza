
/**
 * API de Consulta: Agenda do Dia
 * 
 * Endpoint somente leitura para plataformas externas consultarem agendamentos.
 * 
 * Uso: GET /api/automacao/agenda?salao_id=xxx&data=2025-11-15
 * 
 * Autenticação: Token via header Authorization ou API key via query string
 * (Nesta primeira versão, usando autenticação simples por salao_id)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const salaoId = searchParams.get('salao_id')
    const data = searchParams.get('data')

    // Validações básicas
    if (!salaoId) {
      return NextResponse.json(
        { error: 'Parâmetro salao_id é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o salão existe e tem automação ativa
    const salao = await prisma.salao.findUnique({
      where: { id: salaoId },
      select: {
        id: true,
        nome: true,
        automacao_ativa: true,
        webhook_url: true
      }
    })

    if (!salao) {
      return NextResponse.json(
        { error: 'Salão não encontrado' },
        { status: 404 }
      )
    }

    // Opcional: verificar se automação está ativa
    // (Comentado para permitir consulta mesmo sem automação configurada)
    // if (!salao.automacao_ativa) {
    //   return NextResponse.json(
    //     { error: 'Automação não está ativa para este salão' },
    //     { status: 403 }
    //   )
    // }

    // Preparar filtro de data
    let where: any = {
      salao_id: salaoId,
      status: {
        notIn: ['CANCELADO', 'NAO_COMPARECEU'] // Apenas agendamentos ativos
      }
    }

    if (data) {
      // Data específica
      const dataInicio = new Date(data)
      dataInicio.setHours(0, 0, 0, 0)
      
      const dataFim = new Date(data)
      dataFim.setHours(23, 59, 59, 999)

      where.data = {
        gte: dataInicio,
        lte: dataFim
      }
    } else {
      // Se não passar data, retorna agenda do dia atual
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      
      const fimHoje = new Date()
      fimHoje.setHours(23, 59, 59, 999)

      where.data = {
        gte: hoje,
        lte: fimHoje
      }
    }

    // Buscar agendamentos
    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            telefone: true,
            email: true
          }
        },
        profissional: {
          select: {
            id: true,
            nome: true,
            telefone: true
          }
        },
        servico: {
          select: {
            id: true,
            nome: true,
            preco: true,
            duracao_minutos: true
          }
        }
      },
      orderBy: {
        hora_inicio: 'asc'
      }
    })

    // Formatar resposta
    const agendamentosFormatados = agendamentos.map(a => ({
      id: a.id,
      data: a.data.toISOString().split('T')[0],
      hora_inicio: a.hora_inicio.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      }),
      hora_fim: a.hora_fim.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      }),
      status: a.status,
      origem: a.origem,
      valor_cobrado: typeof a.valor_cobrado === 'number' ? a.valor_cobrado : Number(a.valor_cobrado),
      observacoes: a.observacoes,
      cliente: a.cliente,
      profissional: a.profissional,
      servico: {
        ...a.servico,
        preco: typeof a.servico.preco === 'number' ? a.servico.preco : Number(a.servico.preco)
      }
    }))

    return NextResponse.json({
      salao: {
        id: salao.id,
        nome: salao.nome
      },
      data_consultada: data || new Date().toISOString().split('T')[0],
      total: agendamentosFormatados.length,
      agendamentos: agendamentosFormatados
    })
  } catch (error) {
    console.error('[API Automação] Erro ao consultar agenda:', error)
    return NextResponse.json(
      { error: 'Erro ao consultar agenda' },
      { status: 500 }
    )
  }
}
