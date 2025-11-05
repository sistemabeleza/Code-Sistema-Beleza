
import { PlanoSalao } from '@prisma/client'

export const PLAN_LIMITS = {
  BASICO: {
    nome: 'Básico',
    preco: 39.90,
    maxProfissionais: 2,
    descricao: 'Até 2 profissionais'
  },
  INTERMEDIARIO: {
    nome: 'Intermediário',
    preco: 49.90,
    maxProfissionais: 6,
    descricao: 'Até 6 profissionais'
  },
  COMPLETO: {
    nome: 'Completo',
    preco: 99.90,
    maxProfissionais: null, // Ilimitado
    descricao: 'Profissionais ilimitados'
  }
} as const

export function canAddProfessional(
  plano: PlanoSalao,
  currentCount: number
): { allowed: boolean; message?: string } {
  const planLimit = PLAN_LIMITS[plano]
  
  if (!planLimit) {
    return { allowed: false, message: 'Plano inválido' }
  }
  
  // Se o plano é ilimitado
  if (planLimit.maxProfissionais === null) {
    return { allowed: true }
  }
  
  // Verifica se já atingiu o limite
  if (currentCount >= planLimit.maxProfissionais) {
    return {
      allowed: false,
      message: `Limite de ${planLimit.maxProfissionais} profissionais atingido para o plano ${planLimit.nome}. Faça upgrade do seu plano para adicionar mais profissionais.`
    }
  }
  
  return { allowed: true }
}

export function getPlanLimits(plano: PlanoSalao) {
  return PLAN_LIMITS[plano]
}
