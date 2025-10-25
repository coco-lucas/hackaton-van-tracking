'use client'

import { useState } from 'react'
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
import { MapPin, Clock, User, Car, Navigation, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TripDetailsDrawerProps {
  trip: Trip | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmBooking?: (tripId: string) => Promise<void>
  onStartTrip?: (tripId: string) => Promise<void>
  onCancelTrip?: (tripId: string) => Promise<void>
  isPassenger?: boolean
}

export function TripDetailsDrawer({
  trip,
  open,
  onOpenChange,
  onConfirmBooking,
  onStartTrip,
  onCancelTrip,
  isPassenger = true,
}: TripDetailsDrawerProps) {
  const [confirming, setConfirming] = useState(false)
  const [starting, setStarting] = useState(false)
  const [canceling, setCanceling] = useState(false)

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

  // Check if user is already in the trip
  const isBooked = false // In real app: trip.passageiros.some(p => p.id === currentUserId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] rounded-t-2xl p-0 flex flex-col"
      >
        {/* Drag Handle */}
        <div className="flex h-8 w-full items-center justify-center shrink-0">
          <div className="h-1.5 w-10 rounded-full bg-muted" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <SheetHeader className="text-left mb-4">
            <SheetTitle className="text-xl font-bold">
              {trip.origem.cidade} → {trip.destino.cidade}
            </SheetTitle>
            <SheetDescription>
              {departureDate} • {departureTime}
            </SheetDescription>
          </SheetHeader>

          {/* Map Placeholder */}
          <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <Navigation className="h-12 w-12 text-primary" />
              <p className="text-sm text-muted-foreground font-medium">
                Mapa da rota
              </p>
              <p className="text-xs text-muted-foreground">
                {trip.rota?.distancia} • {trip.rota?.duracao}
              </p>
            </div>
          </div>

          {/* Driver Info */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-card border rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage src={trip.motorista.foto} alt={trip.motorista.nome} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {driverInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-base font-bold text-foreground">
                  {trip.motorista.nome.split(' ')[0]} {trip.motorista.nome.split(' ')[1]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {trip.motorista.veiculo.modelo} • {trip.motorista.veiculo.placa}
                </p>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saída</p>
                <p className="text-sm font-semibold text-foreground">{departureTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Navigation className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Chegada prevista</p>
                <p className="text-sm font-semibold text-foreground">{arrivalTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vagas disponíveis</p>
                <p className="text-sm font-semibold text-foreground">
                  {trip.vagasDisponiveis} de {trip.capacidadeTotal}
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
                    className={`absolute -left-[34px] top-1.5 h-4 w-4 rounded-full border-4 border-background ${
                      stop.type === 'origem'
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
                <div className="w-full p-4 bg-primary/10 border border-primary/20 rounded-lg text-center">
                  <p className="text-sm font-semibold text-primary">
                    Você já está reservado nesta viagem
                  </p>
                </div>
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
