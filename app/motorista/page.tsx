'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getStoredAuth, clearAuth } from '@/lib/mock-api/auth/service'
import { fetchUpcomingDriverTrips } from '@/lib/mock-api/trips/service'
import type { Trip, Driver } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Car, LogOut, Loader2, Calendar, Users, MessageSquare, Route } from 'lucide-react'

// Tipagem para o mapa
interface DriverMapProps {
  position: [number, number]
}

// Importa dinamicamente
const DriverMap = dynamic<DriverMapProps>(
  () => import('./_components/DriverMap').then((m) => m.DriverMap),
  { ssr: false }
)

export default function MotoristaPage() {
  const router = useRouter()
  const [driver, setDriver] = useState<Driver | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [position, setPosition] = useState<[number, number] | null>(null)

  useEffect(() => {
    const loadDriverData = async () => {
      try {
        const auth = getStoredAuth()
        if (!auth || auth.user.role !== 'motorista') {
          router.push('/login')
          return
        }

        setDriver(auth.user as Driver)
        const response = await fetchUpcomingDriverTrips(auth.user.id)
        if (response.success && response.data) {
          setTrips(response.data)
        } else {
          setError(response.error?.message || 'Erro ao carregar viagens')
        }
      } catch {
        setError('Erro inesperado ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    loadDriverData()
  }, [router])

  // Rastreamento GPS em tempo real
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude])
        },
        (err) => {
          console.warn('Erro ao obter localização:', err)
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      )
      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!driver) return null

  return (
    <div className="min-h-screen bg-background pb-20 safe-bottom">
      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-card border-b safe-top">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Olá, {driver.nome.split(' ')[0]}
              </h1>
              <p className="text-xs text-muted-foreground">
                Teresópolis - São Paulo
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* CONTEÚDO */}
      <div className="container mx-auto p-4 space-y-6">
        {/* MAPA GPS */}
        <Card className="trip-card-shadow">
          <CardContent className="p-4">
            <h2 className="font-semibold mb-2 flex items-center gap-2">
              GPS <Route className="h-4 w-4" />
            </h2>
            {position ? (
              <DriverMap position={position} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Obtendo localização...
              </p>
            )}
          </CardContent>
        </Card>

        {/* INFORMAÇÕES */}
        <h3>Tempo de Viagem: 2:05h</h3>

        {/* PRÓXIMA ROTA */}
        <div className="grid grid-cols-1 gap-1 h-70">
          <Card className="trip-card-shadow">
            <CardContent className="p-3 text-center">
              <div className="mb-1 flex justify-center">
                <Route />
              </div>
              <p className="text-xl font-bold text-foreground">ROTA</p>
              <p className="text-xs text-muted-foreground">Próxima Viagem</p>
            </CardContent>
          </Card>
        </div>

        {/* ESTADO VAZIO */}
        {trips.length === 0 && !error && (
          <Card className="trip-card-shadow">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Nenhuma viagem agendada
              </h3>
              <p className="text-sm text-muted-foreground">
                Você não possui viagens programadas no momento.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* RODAPÉ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t p-2">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => router.push('/motorista/passageiros')}
            className="flex flex-col items-center text-muted-foreground hover:text-primary transition"
          >
            <Users className="h-6 w-6" />
            <span className="text-xs">Passageiros</span>
          </button>

          <button
            onClick={() => router.push('/motorista')}
            className="flex flex-col items-center text-primary"
          >
            <Car className="h-7 w-7" />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => router.push('/motorista/mensagens')}
            className="flex flex-col items-center text-muted-foreground hover:text-primary transition"
          >
            <MessageSquare className="h-6 w-6" />
            <span className="text-xs">Mensagens</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
