'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredAuth } from '@/lib/mock-api/auth/service'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const auth = getStoredAuth()

    if (auth) {
      // Redirect to appropriate dashboard based on role
      if (auth.user.role === 'motorista') {
        router.push('/motorista')
      } else if (auth.user.role === 'passageiro') {
        router.push('/passageiro')
      } else {
        router.push('/admin')
      }
    } else {
      // Redirect to login
      router.push('/login')
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  )
}
