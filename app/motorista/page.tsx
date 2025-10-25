'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredAuth, clearAuth } from '@/lib/mock-api/auth/service'
import { fetchUpcomingDriverTrips } from '@/lib/mock-api/trips/service'
import type { Trip, Driver } from '@/lib/types'
import { TripCard } from '@/components/trip-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Car,
  LogOut,
  Loader2,
  Calendar,
  Users,
  MapPin,
  AlertCircle,
} from 'lucide-react'

export default function MotoristaPage() {
  const router = useRouter()
  const [driver, setDriver] = useState<Driver | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDriverData = async () => {
      try {
        // Get stored auth
        const auth = getStoredAuth()

        if (!auth || auth.user.role !== 'motorista') {
          router.push('/login')
          return
        }

        setDriver(auth.user as Driver)

        // Fetch upcoming trips
        const response = await fetchUpcomingDriverTrips(auth.user.id)

        if (response.success && response.data) {
          setTrips(response.data)
        } else {
          setError(response.error?.message || 'Erro ao carregar viagens')
        }
      } catch (err) {
        setError('Erro inesperado ao carregar dados')
        console.error('Driver data error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDriverData()
  }, [router])

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  const handleTripClick = (tripId: string) => {
    // TODO: Navigate to trip details page
    console.log('Trip clicked:', tripId)
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

  if (!driver) {
    return null
  }

  const todayTrips = trips.filter((trip) => {
    const tripDate = new Date(trip.dataHoraSaida)
    const today = new Date()
    return tripDate.toDateString() === today.toDateString()
  })

  const upcomingTrips = trips.filter((trip) => {
    const tripDate = new Date(trip.dataHoraSaida)
    const today = new Date()
    return tripDate.toDateString() !== today.toDateString()
  })

  return (
    <div className="min-h-screen bg-background pb-20 safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b safe-top">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Olá, {driver.nome.split(' ')[0]}
              </h1>
              <p className="text-xs text-muted-foreground">Dashboard do Motorista</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-4 space-y-6">
        {/* Vehicle Info Card */}
        <Card className="trip-card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {driver.veiculo.modelo} {driver.veiculo.cor}
                  </p>
                  <p className="text-sm text-muted-foreground">{driver.veiculo.placa}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{driver.veiculo.capacidade} lugares</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="trip-card-shadow">
            <CardContent className="p-3 text-center">
              <div className="mb-1 flex justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-xl font-bold text-foreground">{todayTrips.length}</p>
              <p className="text-xs text-muted-foreground">Hoje</p>
            </CardContent>
          </Card>

          <Card className="trip-card-shadow">
            <CardContent className="p-3 text-center">
              <div className="mb-1 flex justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-xl font-bold text-foreground">{trips.length}</p>
              <p className="text-xs text-muted-foreground">Próximas</p>
            </CardContent>
          </Card>

          <Card className="trip-card-shadow">
            <CardContent className="p-3 text-center">
              <div className="mb-1 flex justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-xl font-bold text-foreground">
                {trips.reduce((acc, trip) => acc + trip.passageiros.length, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Passageiros</p>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-status-error/20 bg-status-error/10">
            <CardContent className="flex items-center gap-2 p-4">
              <AlertCircle className="h-5 w-5 text-status-error" />
              <p className="text-sm text-status-error">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Today's Trips */}
        {todayTrips.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Viagens de Hoje</h2>
            <div className="space-y-3">
              {todayTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onClick={() => handleTripClick(trip.id)}
                  showDetails
                />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Trips */}
        {upcomingTrips.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Próximas Viagens</h2>
            <div className="space-y-3">
              {upcomingTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onClick={() => handleTripClick(trip.id)}
                  showDetails
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
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
    </div>
  )
}
