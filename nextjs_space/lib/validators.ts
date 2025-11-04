
/**
 * Valida CPF brasileiro
 */
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

/**
 * Valida CNPJ brasileiro
 */
export function validateCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Validação do primeiro dígito verificador
  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  const digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  // Validação do segundo dígito verificador
  size = size + 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
}

/**
 * Valida e normaliza número de WhatsApp para formato E.164
 */
export function validateAndNormalizeWhatsApp(phone: string): { valid: boolean; normalized?: string; error?: string } {
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Verifica se já começa com código de país
  let normalized = cleaned;
  
  // Se não começa com + e tem 11 dígitos (DDD + 9 dígitos), assume Brasil (+55)
  if (!phone.startsWith('+') && cleaned.length === 11) {
    normalized = `55${cleaned}`;
  }
  // Se não começa com + e tem 13 dígitos, assume que já tem código do país
  else if (!phone.startsWith('+') && cleaned.length === 13) {
    normalized = cleaned;
  }
  // Se começa com +, remove o +
  else if (phone.startsWith('+')) {
    normalized = cleaned;
  }
  
  // Validação básica de tamanho (código país + número deve ter entre 11 e 15 dígitos)
  if (normalized.length < 11 || normalized.length > 15) {
    return {
      valid: false,
      error: 'Número de WhatsApp inválido. Use o formato: +55 27 99999-9999'
    };
  }
  
  return {
    valid: true,
    normalized: `+${normalized}`
  };
}

/**
 * Formata CPF para exibição
 */
export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '');
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ para exibição
 */
export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '');
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata telefone para exibição
 */
export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  
  // Remove o código do país se for Brasil (+55)
  let number = clean;
  if (clean.startsWith('55') && clean.length === 13) {
    number = clean.substring(2);
  }
  
  // Formata (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (number.length === 11) {
    return number.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (number.length === 10) {
    return number.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

/**
 * Normaliza handle do Instagram (remove @ se houver)
 */
export function normalizeInstagramHandle(handle: string): string {
  return handle.replace(/^@/, '');
}

/**
 * Gera URL do Instagram a partir do handle
 */
export function getInstagramUrl(handle: string): string {
  const normalized = normalizeInstagramHandle(handle);
  return `https://instagram.com/${normalized}`;
}

/**
 * Gera URL do WhatsApp com mensagem padrão
 */
export function getWhatsAppUrl(phone: string, message: string = 'Olá, quero agendar'): string {
  const clean = phone.replace(/\D/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${clean}?text=${encoded}`;
}
