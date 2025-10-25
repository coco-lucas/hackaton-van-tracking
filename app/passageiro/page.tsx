'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredAuth, clearAuth } from '@/lib/mock-api/auth/service'
import { fetchPassengerTrips } from '@/lib/mock-api/trips/service'
import type { Trip, Passenger } from '@/lib/types'
import { TripCard, TripCardSimple } from '@/components/trip-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  LogOut,
  Loader2,
  MapPin,
  Clock,
  AlertCircle,
  Navigation,
} from 'lucide-react'

export default function PassageiroPage() {
  const router = useRouter()
  const [passenger, setPassenger] = useState<Passenger | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('proximas')

  useEffect(() => {
    const loadPassengerData = async () => {
      try {
        // Get stored auth
        const auth = getStoredAuth()

        if (!auth || auth.user.role !== 'passageiro') {
          router.push('/login')
          return
        }

        setPassenger(auth.user as Passenger)

        // Fetch passenger trips
        const response = await fetchPassengerTrips(auth.user.id)

        if (response.success && response.data) {
          setTrips(response.data)
        } else {
          setError(response.error?.message || 'Erro ao carregar viagens')
        }
      } catch (err) {
        setError('Erro inesperado ao carregar dados')
        console.error('Passenger data error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPassengerData()
  }, [router])

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  const handleTripClick = (tripId: string) => {
    // TODO: Navigate to trip details/tracking page
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

  if (!passenger) {
    return null
  }

  const now = new Date()

  // Active trip (in progress today)
  const activeTrip = trips.find((trip) => {
    const tripDate = new Date(trip.dataHoraSaida)
    return (
      tripDate.toDateString() === now.toDateString() &&
      trip.status === 'em_andamento'
    )
  })

  // Today's upcoming trips
  const todayTrips = trips.filter((trip) => {
    const tripDate = new Date(trip.dataHoraSaida)
    return (
      tripDate.toDateString() === now.toDateString() &&
      tripDate > now &&
      trip.status === 'agendada'
    )
  })

  // Future trips (not today)
  const upcomingTrips = trips.filter((trip) => {
    const tripDate = new Date(trip.dataHoraSaida)
    return tripDate > now && tripDate.toDateString() !== now.toDateString()
  })

  // Past trips
  const pastTrips = trips.filter((trip) => {
    const tripDate = new Date(trip.dataHoraSaida)
    return tripDate < now || trip.status === 'concluida'
  })

  return (
    <div className="min-h-screen bg-background pb-20 safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b safe-top">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Olá, {passenger.nome.split(' ')[1] || passenger.nome.split(' ')[0]}
              </h1>
              <p className="text-xs text-muted-foreground">Minhas Viagens</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-4 space-y-6">
        {/* Active Trip Banner */}
        {activeTrip && (
          <Card className="border-primary bg-primary/5 trip-card-shadow">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Navigation className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-primary">Viagem em andamento</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    {activeTrip.origem.cidade} → {activeTrip.destino.cidade}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Motorista: {activeTrip.motorista.nome}
                  </p>
                </div>
                <Button onClick={() => handleTripClick(activeTrip.id)}>
                  Acompanhar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Tabs for Upcoming/Past Trips */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="proximas">
              Próximas ({upcomingTrips.length})
            </TabsTrigger>
            <TabsTrigger value="historico">
              Histórico ({pastTrips.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="proximas" className="mt-4 space-y-3">
            {upcomingTrips.length > 0 ? (
              upcomingTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onClick={() => handleTripClick(trip.id)}
                  showDetails
                />
              ))
            ) : (
              <Card className="trip-card-shadow">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    Nenhuma viagem próxima
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Você não possui viagens agendadas.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="historico" className="mt-4 space-y-3">
            {pastTrips.length > 0 ? (
              pastTrips.map((trip) => (
                <TripCardSimple
                  key={trip.id}
                  trip={trip}
                  onClick={() => handleTripClick(trip.id)}
                />
              ))
            ) : (
              <Card className="trip-card-shadow">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    Sem histórico
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Você ainda não realizou nenhuma viagem.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
