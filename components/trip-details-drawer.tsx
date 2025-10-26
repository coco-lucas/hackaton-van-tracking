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
        className="h-[75vh] rounded-t-2xl p-0! flex flex-col [&>button]:hidden"
      >
        {/* Drag Handle */}
        <div className="flex h-4 w-full items-center justify-center shrink-0">
          <div className="mt-4 h-1.5 w-10 rounded-full bg-muted" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <SheetHeader className="text-center -mt-2">
            <SheetTitle className="text-xl font-bold">
              {trip.origem.cidade} → {trip.destino.cidade}
            </SheetTitle>
            <SheetDescription className='-mt-2'>
              {departureDate} • {departureTime}
            </SheetDescription>
          </SheetHeader>

          {/* Map */}
          <div className="w-full h-[300px] rounded-lg overflow-hidden mb-4">
            {showMap ? (
              <DriverMapDynamic
                position={[trip.origem.lat, trip.origem.lng] as [number, number]}
                destination={[trip.destino.lat, trip.destino.lng] as [number, number]}
              />
            ) : (
              <div className="w-full h-[300px] bg-muted rounded-lg flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>

          {/* Driver Info */}
          <div className="-mt-4 flex flex-row items-start justify-start">
            <div className='flex flex-row p-4 items-center'>

              <Avatar className="h-16 w-16">
                <AvatarImage src={trip.motorista.foto} alt={trip.motorista.nome} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {driverInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start gap-1">
                <p className="text-base font-bold text-foreground text-center">
                  {trip.motorista.nome.split(' ')[0]} {trip.motorista.nome.split(' ')[1]}
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  {trip.motorista.veiculo.modelo} • {trip.motorista.veiculo.placa}
                </p>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className='mb-4  justify-between items-center'>
            <div className="flex flex-row items-center justify-between gap-1 px-4 py-1">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <div className='flex flex-row gap-1'>
                <p className="text-sm text-muted-foreground">Chegada prevista: </p>
                <p className="text-sm font-semibold text-foreground">{arrivalTime}</p>
              </div>
              <div className="flex flex-row items-center justify-center gap-1">
                <UsersRound className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className='flex items-center gap-1'>
                <p className="text-sm text-muted-foreground">Vagas:</p>
                <p className="text-sm font-semibold text-foreground">
                  {trip.vagasDisponiveis} <span className='font-normal text-muted-foreground text-xs'> / </span> {trip.capacidadeTotal}
                </p>
              </div>
            </div>
          </div>

          {/* Route Stops */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-foreground mb-3">Paradas</h3>
            <div className="space-y-3 border-l-2 border-primary/50 ml-2 pl-6">
              {stops.map((stop, index) => (
                <div key={index} className="relative">
                  <div
                    className={`absolute -left-[34px] top-1.5 h-4 w-4 rounded-full border-4 border-background ${stop.type === 'origem'
                      ? 'bg-primary'
                      : 'bg-primary'
                      }`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {stop.type === 'origem' ? 'Origem' : 'Destino'}
                    </p>
                    <p className="text-xs text-muted-foreground">{stop.name}</p>
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
                  className="w-full h-12 text-base font-bold"
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
                  className="w-full h-12 text-base font-bold"
                  size="lg"
                  disabled
                >
                  Você já está reservado nesta viagem
                </Button>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleStart}
                className="w-full h-12 text-base font-bold"
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
                className="w-full h-12 text-base font-bold border-status-error text-status-error hover:bg-status-error/10 hover:text-status-error"
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
