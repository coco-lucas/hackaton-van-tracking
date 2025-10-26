'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { getStoredAuth, clearAuth } from '@/lib/mock-api/auth/service'
import { fetchUpcomingDriverTrips } from '@/lib/mock-api/trips/service'
import type { Trip, Driver } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LogOut, Users, Route, Loader2, CheckCircle2, UserCircle } from 'lucide-react'
import { LoadingMessage } from '@/components/loading-message'
import { SwipeToConfirmButton } from '@/components/swipe-to-confirm-button'
import { ProfileDialog } from '@/components/profile-dialog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import PassageirosPage from './_components/Passageiros'

// Import DriverMap dynamically - same as passenger drawer
const DriverMapDynamic = dynamic(
  () => import('./_components/DriverMap').then((m) => ({ default: m.DriverMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
  }
)

type ActiveTab = 'viagens' | 'passageiros'

export default function MotoristaPage() {
  const router = useRouter()
  const [driver, setDriver] = useState<Driver | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('viagens')
  const [tripStarted, setTripStarted] = useState(false)
  const [tripStartTime, setTripStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [lastCompletedTrip, setLastCompletedTrip] = useState<{
    trip: Trip
    duration: number
  } | null>(null)
  const [isCompletingTrip, setIsCompletingTrip] = useState(false)

  // Carrega dados do motorista
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
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.warn('Erro ao obter localização:', err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      )
      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  // Timer for active trip
  useEffect(() => {
    if (tripStarted && tripStartTime) {
      const interval = setInterval(() => {
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - tripStartTime.getTime()) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [tripStarted, tripStartTime])

  const handleStartTrip = () => {
    setTripStarted(true)
    setTripStartTime(new Date())
    setElapsedTime(0)
  }

  const handleEndTrip = () => {
    setIsCompletingTrip(true)

    // Animação de conclusão
    setTimeout(() => {
      // Save the completed trip with its duration
      if (nextTrip && tripStartTime) {
        setLastCompletedTrip({
          trip: nextTrip,
          duration: elapsedTime,
        })
      }
      setTripStarted(false)
      setTripStartTime(null)
      setElapsedTime(0)
      setIsCompletingTrip(false)
    }, 1500)
  }

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoadingMessage message="suas viagens" />
        </div>
      </div>
    )
  }

  if (!driver) return null

  // Get the next upcoming trip
  const now = new Date()
  const nextTrip = trips.find((trip) => {
    const tripDate = new Date(trip.dataHoraSaida)
    return tripDate > now && trip.status === 'agendada'
  })

  // Get the most recent completed trip (if no lastCompletedTrip from session)
  const mostRecentCompletedTrip = !lastCompletedTrip
    ? trips
      .filter((trip) => trip.status === 'concluida')
      .sort((a, b) => new Date(b.dataHoraSaida).getTime() - new Date(a.dataHoraSaida).getTime())[0]
    : null

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b safe-top shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <ProfileDialog nome={driver.nome} cpf={driver.cpf}>
              <button className="h-9 w-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
              </button>
            </ProfileDialog>
            <div>
              <h1 className="text-base font-semibold text-foreground">
                {driver.nome.split(' ')[0]} {driver.nome.split(' ')[1] || ''}
              </h1>
              <p className="text-xs text-muted-foreground">Motorista</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-4 pb-24 space-y-6 overflow-y-auto">
        {activeTab === 'viagens' && (
          <>
            {/* Completion Animation */}
            {isCompletingTrip && (
              <Card className="border-green-600 bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center animate-pulse">
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        Finalizando Viagem...
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Processando informações da viagem
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Start Trip Button */}
            {!tripStarted && !isCompletingTrip ? (
              <Card className="border-primary/20 shadow-lg">
                <CardContent className="p-6">
                  {lastCompletedTrip && (
                    <div className="mb-4 pb-4 border-b flex items-center gap-2 text-green-600 dark:text-green-500 animate-in fade-in duration-500">
                      <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Viagem concluída</p>
                        <p className="text-xs text-muted-foreground">
                          Duração: {formatElapsedTime(lastCompletedTrip.duration)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {nextTrip ? (
                      <>
                        {/* Trip Route Header */}
                        <div className="space-y-1">
                          <h2 className="text-xl font-bold text-foreground">
                            {nextTrip.origem.cidade} → {nextTrip.destino.cidade}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Saída: {format(new Date(nextTrip.dataHoraSaida), "HH:mm", { locale: ptBR })}
                          </p>
                        </div>

                        {/* Trip Stats Grid */}
                        <div className="grid grid-cols-3 gap-3 py-3">
                          <div className="text-center p-3 rounded-lg bg-muted/50">
                            <Users className="h-5 w-5 mx-auto mb-1.5 text-primary" />
                            <p className="text-xs text-muted-foreground mb-0.5">Passageiros</p>
                            <p className="text-lg font-bold text-foreground">
                              {nextTrip.passageiros.length}
                            </p>
                          </div>

                          {nextTrip.rota && (
                            <>
                              <div className="text-center p-3 rounded-lg bg-muted/50">
                                <Route className="h-5 w-5 mx-auto mb-1.5 text-primary" />
                                <p className="text-xs text-muted-foreground mb-0.5">Distância</p>
                                <p className="text-sm font-bold text-foreground">
                                  {nextTrip.rota.distancia}
                                </p>
                              </div>
                              <div className="text-center p-3 rounded-lg bg-muted/50">
                                <svg className="h-5 w-5 mx-auto mb-1.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-xs text-muted-foreground mb-0.5">Duração</p>
                                <p className="text-sm font-bold text-foreground">
                                  {nextTrip.rota.duracao}
                                </p>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Start Button */}
                        <Button
                          className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                          size="lg"
                          onClick={() => {
                            setLastCompletedTrip(null)
                            handleStartTrip()
                          }}
                        >
                          <Route className="h-5 w-5 mr-2" />
                          Iniciar Viagem
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                          Certifique-se de que todos os passageiros estão a bordo
                        </p>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                          <Route className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-lg font-semibold text-foreground mb-1">
                          Nenhuma Viagem Agendada
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Aguarde novas viagens serem atribuídas
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {tripStarted && !isCompletingTrip ? (
              <>
                {/* GPS Map with Timer */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-base font-semibold text-foreground">Viagem em Andamento</h2>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md">
                        <div className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" />
                        <span className="text-xs font-medium text-foreground">Ativa</span>
                      </div>
                    </div>

                    {/* Timer Display */}
                    <div className="mb-3 flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Tempo decorrido</span>
                      <span className="text-xl font-semibold text-foreground font-mono">
                        {formatElapsedTime(elapsedTime)}
                      </span>
                    </div>

                    {/* Map */}
                    <div className="w-full h-[280px] rounded-md overflow-hidden border">
                      {nextTrip ? (
                        <DriverMapDynamic
                          position={[nextTrip.origem.lat, nextTrip.origem.lng]}
                          destination={[nextTrip.destino.lat, nextTrip.destino.lng]}
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <p className="text-sm text-muted-foreground">
                            Carregando mapa...
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* End Trip Button - Swipe to Confirm */}
                <SwipeToConfirmButton
                  onConfirm={handleEndTrip}
                  text="Deslize para encerrar"
                  confirmText="Encerrar Viagem"
                />
              </>
            ) : null}

            {/* Next Route */}
            <div>
              <h2 className="mb-2 text-sm font-medium text-muted-foreground">Detalhes da Viagem</h2>
              {nextTrip ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-base font-semibold text-foreground mb-0.5">
                          {nextTrip.origem.cidade} → {nextTrip.destino.cidade}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(nextTrip.dataHoraSaida), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Origem</span>
                          <span className="font-medium text-foreground text-right max-w-[60%] truncate">
                            {nextTrip.origem.endereco}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Destino</span>
                          <span className="font-medium text-foreground text-right max-w-[60%] truncate">
                            {nextTrip.destino.endereco}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Passageiros</span>
                          <span className="font-medium text-foreground">
                            {nextTrip.passageiros.length} / {nextTrip.capacidadeTotal}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-sm font-medium text-foreground mb-1">Nenhuma viagem agendada</p>
                    <p className="text-xs text-muted-foreground">Você não possui próximas viagens</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Last Trip Summary */}
            {(lastCompletedTrip || mostRecentCompletedTrip) && (
              <div>
                <h2 className="mb-2 text-sm font-medium text-muted-foreground">Última Viagem</h2>
                <Card>
                  <CardContent className="p-4">
                    {lastCompletedTrip ? (
                      <>
                        <div className="mb-3">
                          <h3 className="text-base font-semibold text-foreground mb-0.5">
                            {lastCompletedTrip.trip.origem.cidade} → {lastCompletedTrip.trip.destino.cidade}
                          </h3>
                          <p className="text-xs text-muted-foreground">Concluída agora</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <p className="text-xs text-muted-foreground mb-0.5">Duração</p>
                            <p className="text-sm font-semibold text-foreground">
                              {formatElapsedTime(lastCompletedTrip.duration)}
                            </p>
                          </div>
                          <div className="text-center py-2 border-x">
                            <p className="text-xs text-muted-foreground mb-0.5">Passageiros</p>
                            <p className="text-sm font-semibold text-foreground">
                              {lastCompletedTrip.trip.passageiros.length}
                            </p>
                          </div>
                          <div className="text-center py-2">
                            <p className="text-xs text-muted-foreground mb-0.5">Distância</p>
                            <p className="text-sm font-semibold text-foreground">
                              {lastCompletedTrip.trip.rota?.distancia || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : mostRecentCompletedTrip ? (
                      <>
                        <div className="mb-3">
                          <h3 className="text-base font-semibold text-foreground mb-0.5">
                            {mostRecentCompletedTrip.origem.cidade} → {mostRecentCompletedTrip.destino.cidade}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(mostRecentCompletedTrip.dataHoraSaida), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center py-2">
                            <p className="text-xs text-muted-foreground mb-0.5">Duração</p>
                            <p className="text-sm font-semibold text-foreground">
                              {mostRecentCompletedTrip.rota?.duracao || 'N/A'}
                            </p>
                          </div>
                          <div className="text-center py-2 border-x">
                            <p className="text-xs text-muted-foreground mb-0.5">Passageiros</p>
                            <p className="text-sm font-semibold text-foreground">
                              {mostRecentCompletedTrip.passageiros.length}
                            </p>
                          </div>
                          <div className="text-center py-2">
                            <p className="text-xs text-muted-foreground mb-0.5">Distância</p>
                            <p className="text-sm font-semibold text-foreground">
                              {mostRecentCompletedTrip.rota?.distancia || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Empty State */}
            {trips.length === 0 && !error && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <h3 className="mb-1 text-sm font-medium text-foreground">
                    Nenhuma viagem agendada
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Você não possui viagens programadas
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {activeTab === 'passageiros' && (
          <PassageirosPage
            nextTrip={nextTrip}
            tripStarted={tripStarted}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t p-2 safe-bottom shadow-lg z-20">
        <div className="flex justify-around items-center h-14">
          <button
            onClick={() => setActiveTab('viagens')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'viagens' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
          >
            <Route className="h-6 w-6" />
            <span className="text-xs font-medium">Viagens</span>
          </button>

          <button
            onClick={() => setActiveTab('passageiros')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'passageiros' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
          >
            <Users className="h-6 w-6" />
            <span className="text-xs">Passageiros</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
