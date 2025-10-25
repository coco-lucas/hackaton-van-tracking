'use client'

import { useState } from 'react'
import { LoadingMessage } from "@/components/loading-message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cleanCPF, validateCPF } from '@/lib/validations/auth'

interface LoginFormProps {
  cpf: string
  senha: string
  onCpfChange: (cpf: string) => void
  onSenhaChange: (senha: string) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  error: string
}

export function LoginForm({
  cpf,
  senha,
  onCpfChange,
  onSenhaChange,
  onSubmit,
  loading,
  error,
}: LoginFormProps) {
  const [cpfError, setCpfError] = useState('')
  const [senhaError, setSenhaError] = useState('')
  const [touched, setTouched] = useState({ cpf: false, senha: false })

  const handleCpfChange = (value: string) => {
    // Remove non-digits
    const cleaned = cleanCPF(value)

    // Limit to 11 digits
    if (cleaned.length <= 11) {
      // Format CPF as user types
      const formatted = formatCPFInput(cleaned)
      onCpfChange(formatted)

      // Clear error when user starts typing
      if (touched.cpf && cpfError) {
        setCpfError('')
      }
    }
  }

  const formatCPFInput = (value: string): string => {
    if (value.length === 0) return ''
    if (value.length <= 3) return value
    if (value.length <= 6) return `${value.slice(0, 3)}.${value.slice(3)}`
    if (value.length <= 9) return `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`
    return `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`
  }

  const handleCpfBlur = () => {
    setTouched({ ...touched, cpf: true })

    if (!cpf) {
      setCpfError('CPF é obrigatório')
      return
    }

    const cleaned = cleanCPF(cpf)

    if (cleaned.length !== 11) {
      setCpfError('CPF deve ter 11 dígitos')
      return
    }

    if (!validateCPF(cpf)) {
      setCpfError('CPF inválido')
      return
    }

    setCpfError('')
  }

  const handleSenhaBlur = () => {
    setTouched({ ...touched, senha: true })

    if (!senha) {
      setSenhaError('Senha é obrigatória')
      return
    }

    if (senha.length < 6) {
      setSenhaError('Senha deve ter no mínimo 6 caracteres')
      return
    }

    setSenhaError('')
  }

  const isFormValid = () => {
    return cpf &&
           senha &&
           !cpfError &&
           !senhaError &&
           cleanCPF(cpf).length === 11 &&
           validateCPF(cpf) &&
           senha.length >= 6
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cpf">CPF</Label>
        <Input
          id="cpf"
          type="text"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(e) => handleCpfChange(e.target.value)}
          onBlur={handleCpfBlur}
          required
          disabled={loading}
          maxLength={14} // Formatted CPF length
          className={cpfError && touched.cpf ? 'border-destructive' : ''}
        />
        {cpfError && touched.cpf && (
          <p className="text-xs text-destructive">{cpfError}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          type="password"
          placeholder="••••••"
          value={senha}
          onChange={(e) => onSenhaChange(e.target.value)}
          onBlur={handleSenhaBlur}
          required
          disabled={loading}
          className={senhaError && touched.senha ? 'border-destructive' : ''}
        />
        {senhaError && touched.senha && (
          <p className="text-xs text-destructive">{senhaError}</p>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={loading || !isFormValid()}
      >
        {loading ? (
          <>
            <LoadingMessage customText="Entrando" />
          </>
        ) : (
          'Entrar'
        )}
      </Button>
    </form>
  )
}
