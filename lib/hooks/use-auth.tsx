'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { User } from '@/lib/types'
import { getStoredAuth, clearAuth, logout as apiLogout } from '@/lib/mock-api/auth/service'

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for stored auth on mount
    const storedAuth = getStoredAuth()

    if (storedAuth) {
      setUser(storedAuth.user)
    } else {
      // Only redirect to login if not already on login page
      if (pathname !== '/login' && pathname !== '/') {
        router.push('/login')
      }
    }

    setLoading(false)
  }, [pathname, router])

  const logout = async () => {
    setLoading(true)
    await apiLogout()
    clearAuth()
    setUser(null)
    router.push('/login')
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Hook to protect routes - redirects to login if not authenticated
 */
export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  return { user, loading }
}

/**
 * Hook to protect routes by role
 */
export function useRequireRole(allowedRoles: Array<User['role']>) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'motorista') {
          router.push('/motorista')
        } else if (user.role === 'passageiro') {
          router.push('/passageiro')
        } else {
          router.push('/admin')
        }
      }
    }
  }, [user, loading, allowedRoles, router])

  return { user, loading }
}
