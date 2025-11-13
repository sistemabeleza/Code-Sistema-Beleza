
/**
 * API de Consulta: Clientes Inativos
 * 
 * Endpoint somente leitura para identificar clientes que não agendam há X dias.
 * Útil para campanhas de reativação.
 * 
 * Uso: GET /api/automacao/clientes-inativos?salao_id=xxx&dias=15
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
    const diasParam = searchParams.get('dias')

    // Validações básicas
    if (!salaoId) {
      return NextResponse.json(
        { error: 'Parâmetro salao_id é obrigatório' },
        { status: 400 }
      )
    }

    // Dias padrão: 15
    const dias = diasParam ? parseInt(diasParam) : 15

    if (isNaN(dias) || dias < 1) {
      return NextResponse.json(
        { error: 'Parâmetro dias deve ser um número positivo' },
        { status: 400 }
      )
    }

    // Verificar se o salão existe
    const salao = await prisma.salao.findUnique({
      where: { id: salaoId },
      select: {
        id: true,
        nome: true,
        automacao_ativa: true
      }
    })

    if (!salao) {
      return NextResponse.json(
        { error: 'Salão não encontrado' },
        { status: 404 }
      )
    }

    // Calcular data limite (X dias atrás)
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - dias)

    // Buscar todos os clientes ativos do salão
    const todosClientes = await prisma.cliente.findMany({
      where: {
        salao_id: salaoId,
        status: 'ATIVO'
      },
      select: {
        id: true,
        nome: true,
        telefone: true,
        email: true,
        data_cadastro: true,
        agendamentos: {
          where: {
            status: {
              notIn: ['CANCELADO']
            }
          },
          orderBy: {
            data: 'desc'
          },
          take: 1, // Apenas o último agendamento
          select: {
            id: true,
            data: true,
            status: true
          }
        }
      }
    })

    // Filtrar clientes inativos
    const clientesInativos = todosClientes.filter(cliente => {
      // Se nunca agendou
      if (cliente.agendamentos.length === 0) {
        // Verificar se o cadastro é mais antigo que X dias
        return cliente.data_cadastro < dataLimite
      }

      // Se já agendou, verificar se o último agendamento foi há mais de X dias
      const ultimoAgendamento = cliente.agendamentos[0]
      return ultimoAgendamento.data < dataLimite
    })

    // Formatar resposta
    const clientesFormatados = clientesInativos.map(cliente => {
      const ultimoAgendamento = cliente.agendamentos[0]
      const diasInativo = ultimoAgendamento
        ? Math.floor((Date.now() - ultimoAgendamento.data.getTime()) / (1000 * 60 * 60 * 24))
        : Math.floor((Date.now() - cliente.data_cadastro.getTime()) / (1000 * 60 * 60 * 24))

      return {
        id: cliente.id,
        nome: cliente.nome,
        telefone: cliente.telefone,
        email: cliente.email,
        data_cadastro: cliente.data_cadastro.toISOString().split('T')[0],
        ultimo_agendamento: ultimoAgendamento ? {
          id: ultimoAgendamento.id,
          data: ultimoAgendamento.data.toISOString().split('T')[0],
          status: ultimoAgendamento.status
        } : null,
        dias_inativo: diasInativo,
        nunca_agendou: cliente.agendamentos.length === 0
      }
    })

    // Ordenar por dias inativo (mais tempo primeiro)
    clientesFormatados.sort((a, b) => b.dias_inativo - a.dias_inativo)

    return NextResponse.json({
      salao: {
        id: salao.id,
        nome: salao.nome
      },
      parametros: {
        dias_minimos: dias,
        data_limite: dataLimite.toISOString().split('T')[0]
      },
      total: clientesFormatados.length,
      clientes: clientesFormatados
    })
  } catch (error) {
    console.error('[API Automação] Erro ao consultar clientes inativos:', error)
    return NextResponse.json(
      { error: 'Erro ao consultar clientes inativos' },
      { status: 500 }
    )
  }
}
