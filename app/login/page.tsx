'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { login, storeAuth } from '@/lib/mock-api/auth/service'
import Image from 'next/image'
import unifeso from '../../public/assets/unifeso.png'
import { LoginForm } from '../_components/login-form'

export default function LoginPage() {
  const router = useRouter()
  const [cpf, setCpf] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Login without specifying role - it will be auto-detected from database
      const response = await login({ cpf, senha })

      if (response.success && response.data) {
        storeAuth(response.data.user, response.data.token)

        // Redirect based on user's role from database
        const userRole = response.data.user.role

        if (userRole === 'motorista') {
          router.push('/motorista')
        } else if (userRole === 'passageiro') {
          router.push('/passageiro')
        } else if (userRole === 'admin') {
          router.push('/admin')
        }
      } else {
        setError(response.error?.message || 'Erro ao fazer login')
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background p-4 safe-top safe-bottom overflow-hidden">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex items-center justify-center rounded-2xl">
              <Image
                src={unifeso}
                alt="Unifeso Logo"
                width={100}
                height={100}
                priority
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Sistema de Monitoramento de Vans
          </p>
        </div>

        {/* Login Card */}
        <Card className="trip-card-shadow">
          <CardHeader className="pb-4">
            <CardTitle className='text-xl font-bold text-center'>Entrar</CardTitle>
            <CardDescription className='text-muted-foreground text-center'>
              Digite seu CPF e senha para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm
              cpf={cpf}
              senha={senha}
              onCpfChange={setCpf}
              onSenhaChange={setSenha}
              onSubmit={handleLogin}
              loading={loading}
              error={error}
            />
          </CardContent>
        </Card>

        {/* Demo credentials info */}
        {/* <Card className="mt-4 bg-muted/50">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-2 font-semibold">
              Credenciais de demonstração:
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><strong>Motorista:</strong> 123.456.789-09</p>
              <p><strong>Passageiro:</strong> 111.444.777-35</p>
              <p><strong>Senha:</strong> 123456</p>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}
