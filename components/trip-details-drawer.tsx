'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { Trip } from '@/lib/types'
import { Clock, User, Car, Navigation, Loader2, UsersRound } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Importa o mapa do motorista com rota
const DriverMapDynamic = dynamic(
  () => import('@/app/motorista/_components/DriverMap').then((m) => ({ default: m.DriverMap })),
  {
    ssr: false, loading: () => (
      <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
)

interface TripDetailsDrawerProps {
  trip: Trip | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmBooking?: (tripId: string) => Promise<void>
  onStartTrip?: (tripId: string) => Promise<void>
  onCancelTrip?: (tripId: string) => Promise<void>
  isPassenger?: boolean
  isBooked?: boolean
}

export function TripDetailsDrawer({
  trip,
  open,
  onOpenChange,
  onConfirmBooking,
  onStartTrip,
  onCancelTrip,
  isPassenger = true,
  isBooked = false,
}: TripDetailsDrawerProps) {
  const [confirming, setConfirming] = useState(false)
  const [starting, setStarting] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [showMap, setShowMap] = useState(false)

  // Delay map rendering to avoid Leaflet initialization issues
  useEffect(() => {
    if (open && trip) {
      // Longer delay to ensure drawer animation completes
      const timer = setTimeout(() => {
        setShowMap(true)
      }, 300)
      return () => {
        clearTimeout(timer)
        setShowMap(false)
      }
    } else {
      setShowMap(false)
    }
  }, [open, trip])

  if (!trip) return null

  const departureTime = format(new Date(trip.dataHoraSaida), 'HH:mm', { locale: ptBR })
  const arrivalTime = format(new Date(trip.dataHoraChegadaPrevista), 'HH:mm', { locale: ptBR })
  const departureDate = format(new Date(trip.dataHoraSaida), "dd 'de' MMMM", { locale: ptBR })

  // Get driver initials for avatar fallback
  const driverInitials = trip.motorista.nome
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Mock route stops (in real app, this would come from trip data)
  const stops = [
    { name: trip.origem.endereco, type: 'origem' as const },
    { name: trip.destino.endereco, type: 'destino' as const },
  ]

  const handleConfirm = async () => {
    if (!onConfirmBooking) return

    setConfirming(true)
    try {
      await onConfirmBooking(trip.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Error confirming booking:', error)
    } finally {
      setConfirming(false)
    }
  }

  const handleStart = async () => {
    if (!onStartTrip) return

    setStarting(true)
    try {
      await onStartTrip(trip.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Error starting trip:', error)
    } finally {
      setStarting(false)
    }
  }

  const handleCancel = async () => {
    if (!onCancelTrip) return

    setCanceling(true)
    try {
      await onCancelTrip(trip.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Error canceling trip:', error)
    } finally {
      setCanceling(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[85vh] rounded-t-2xl p-0 flex flex-col [&>button]:hidden"
      >
        {/* Drag Handle */}
        <div className="flex h-3 w-full items-center justify-center shrink-0 pt-2">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>

        {/* Content - No scroll needed */}
        <div className="px-4 pb-4 pt-2">
          <SheetHeader className="text-center mb-3">
            <SheetTitle className="text-lg font-bold">
              {trip.origem.cidade} → {trip.destino.cidade}
            </SheetTitle>
            <SheetDescription className="text-xs -mt-1">
              {departureDate} • {departureTime}
            </SheetDescription>
          </SheetHeader>

          {/* Map - Reduced height */}
          <div className="w-full h-[200px] rounded-lg overflow-hidden mb-3">
            {showMap ? (
              <DriverMapDynamic
                position={[trip.origem.lat, trip.origem.lng] as [number, number]}
                destination={[trip.destino.lat, trip.destino.lng] as [number, number]}
              />
            ) : (
              <div className="w-full h-[200px] bg-muted rounded-lg flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>

          {/* Driver Info & Details - Compact */}
          <div className="space-y-3 mb-3">
            <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={trip.motorista.foto} alt={trip.motorista.nome} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {driverInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {trip.motorista.nome.split(' ')[0]} {trip.motorista.nome.split(' ')[1]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {trip.motorista.veiculo.modelo} • {trip.motorista.veiculo.placa}
                </p>
              </div>
            </div>

            {/* Trip Stats - Compact Grid */}
            <div className="grid grid-cols-2 gap-2 px-1">
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground">Chegada:</span>
                <span className="font-semibold text-foreground">{arrivalTime}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <UsersRound className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground">Vagas:</span>
                <span className="font-semibold text-foreground">
                  {trip.vagasDisponiveis}/{trip.capacidadeTotal}
                </span>
              </div>
            </div>
          </div>

          {/* Route Stops - Compact */}
          <div className="mb-4">
            <div className="space-y-2 border-l-2 border-primary/30 ml-1 pl-4">
              {stops.map((stop, index) => (
                <div key={index} className="relative">
                  <div
                    className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-background bg-primary`}
                  />
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {stop.type === 'origem' ? 'Origem' : 'Destino'}
                    </p>
                    <p className="text-xs text-muted-foreground leading-tight">{stop.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {isPassenger ? (
            <>
              {!isBooked && (
                <Button
                  onClick={handleConfirm}
                  disabled={confirming || trip.vagasDisponiveis === 0}
                  className="w-full h-11 text-sm font-semibold"
                  size="lg"
                >
                  {confirming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirmando...
                    </>
                  ) : trip.vagasDisponiveis === 0 ? (
                    'Sem vagas disponíveis'
                  ) : (
                    'Confirmar Reserva'
                  )}
                </Button>
              )}

              {isBooked && (
                <Button
                  className="w-full h-11 text-sm font-semibold"
                  size="lg"
                  disabled
                >
                  Você já está reservado nesta viagem
                </Button>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={handleStart}
                className="w-full h-11 text-sm font-semibold"
                size="lg"
                disabled={starting || trip.status !== 'agendada'}
              >
                {starting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando viagem...
                  </>
                ) : trip.status === 'em_andamento' ? (
                  'Viagem em andamento'
                ) : trip.status === 'concluida' ? (
                  'Viagem concluída'
                ) : (
                  'Iniciar Viagem'
                )}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="w-full h-11 text-sm font-semibold border-status-error text-status-error hover:bg-status-error/10 hover:text-status-error"
                size="lg"
                disabled={canceling || trip.status !== 'agendada'}
              >
                {canceling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  'Cancelar Viagem'
                )}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
