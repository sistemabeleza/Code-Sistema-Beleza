
// Tipos do sistema baseados no schema Prisma

export type TipoUsuario = 'ADMIN' | 'GERENTE' | 'ATENDENTE'
export type StatusUsuario = 'ATIVO' | 'INATIVO' | 'SUSPENSO'
export type StatusCliente = 'ATIVO' | 'INATIVO' | 'BLOQUEADO'
export type StatusProfissional = 'ATIVO' | 'INATIVO' | 'FERIAS' | 'LICENCA'
export type StatusServico = 'ATIVO' | 'INATIVO'
export type StatusAgendamento = 'AGENDADO' | 'CONFIRMADO' | 'EM_ANDAMENTO' | 'REALIZADO' | 'CANCELADO' | 'NAO_COMPARECEU'
export type FormaPagamento = 'DINHEIRO' | 'PIX' | 'DEBITO' | 'CREDITO' | 'BOLETO'
export type StatusPagamento = 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'ESTORNADO'
export type StatusProduto = 'ATIVO' | 'INATIVO' | 'DESCONTINUADO'
export type TipoMovimentacao = 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'PERDA'

export interface Usuario {
  id: string
  name?: string | null
  email: string
  tipo: TipoUsuario
  status: StatusUsuario
  telefone?: string | null
  cpf?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Cliente {
  id: string
  nome: string
  telefone: string
  email?: string | null
  cpf?: string | null
  data_nascimento?: Date | null
  endereco?: string | null
  observacoes?: string | null
  status: StatusCliente
  foto?: string | null
  data_cadastro: Date
  data_atualizacao: Date
}

export interface Profissional {
  id: string
  nome: string
  telefone: string
  email?: string | null
  cpf?: string | null
  especialidade?: string | null
  comissao_percentual: number
  status: StatusProfissional
  foto?: string | null
  data_contratacao?: Date | null
  data_cadastro: Date
  data_atualizacao: Date
}

export interface Servico {
  id: string
  nome: string
  descricao?: string | null
  preco: number
  duracao_minutos: number
  categoria?: string | null
  cor_agenda?: string | null
  status: StatusServico
  data_cadastro: Date
  data_atualizacao: Date
}

export interface Agendamento {
  id: string
  cliente_id: string
  profissional_id: string
  servico_id: string
  data: Date
  hora_inicio: Date
  hora_fim: Date
  status: StatusAgendamento
  observacoes?: string | null
  valor_cobrado?: number | null
  desconto?: number | null
  data_criacao: Date
  data_atualizacao: Date
  cliente?: Cliente
  profissional?: Profissional
  servico?: Servico
}

export interface Produto {
  id: string
  nome: string
  descricao?: string | null
  codigo_barras?: string | null
  preco_custo: number
  preco_venda: number
  quantidade_estoque: number
  estoque_minimo: number
  categoria?: string | null
  marca?: string | null
  fornecedor?: string | null
  foto?: string | null
  status: StatusProduto
  data_cadastro: Date
  data_atualizacao: Date
}

export interface Pagamento {
  id: string
  agendamento_id?: string | null
  venda_id?: string | null
  profissional_id?: string | null
  valor: number
  forma_pagamento: FormaPagamento
  status: StatusPagamento
  data_pagamento?: Date | null
  data_vencimento?: Date | null
  observacoes?: string | null
  parcelas: number
  parcela_atual: number
  data_criacao: Date
  data_atualizacao: Date
}

// Tipos para relatórios e dashboards
export interface ResumoFinanceiro {
  receita_total: number
  receita_hoje: number
  receita_mes: number
  agendamentos_hoje: number
  clientes_total: number
  servicos_realizados_mes: number
}

export interface ServicoMaisVendido {
  nome: string
  quantidade: number
  receita: number
  categoria: string
}

export interface ProfissionalDesempenho {
  nome: string
  servicos_realizados: number
  receita_gerada: number
  comissao_total: number
}
