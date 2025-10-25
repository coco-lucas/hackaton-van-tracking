import { z } from 'zod'

/**
 * Validates Brazilian CPF
 * Accepts formats: 000.000.000-00 or 00000000000
 */
export const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/

/**
 * Validates and calculates CPF check digits
 */
export function validateCPF(cpf: string): boolean {
  // Remove formatting
  const cleanCPF = cpf.replace(/[^\d]/g, '')

  // Check length
  if (cleanCPF.length !== 11) return false

  // Check for known invalid CPFs (all same digits)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false

  // Validate first check digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let checkDigit = 11 - (sum % 11)
  if (checkDigit >= 10) checkDigit = 0
  if (checkDigit !== parseInt(cleanCPF.charAt(9))) return false

  // Validate second check digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  checkDigit = 11 - (sum % 11)
  if (checkDigit >= 10) checkDigit = 0
  if (checkDigit !== parseInt(cleanCPF.charAt(10))) return false

  return true
}

/**
 * Format CPF to 000.000.000-00
 */
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/[^\d]/g, '')
  if (cleanCPF.length !== 11) return cpf

  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Remove CPF formatting
 */
export function cleanCPF(cpf: string): string {
  return cpf.replace(/[^\d]/g, '')
}

/**
 * Zod schema for CPF validation
 */
export const cpfSchema = z
  .string()
  .min(11, 'CPF deve ter 11 dígitos')
  .regex(cpfRegex, 'CPF inválido')
  .refine(validateCPF, {
    message: 'CPF inválido',
  })

/**
 * Zod schema for login form
 * Role is now auto-detected from database
 */
export const loginSchema = z.object({
  cpf: cpfSchema,
  senha: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(50, 'Senha deve ter no máximo 50 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Validates login credentials
 */
export function validateLoginCredentials(data: unknown) {
  return loginSchema.safeParse(data)
}
