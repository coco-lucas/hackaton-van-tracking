'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SwipePassengerControl } from '@/components/swipe-passenger-control'
import { Users, CheckCircle2, XCircle } from 'lucide-react'
import type { Trip } from '@/lib/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PassageirosPageProps {
  nextTrip: Trip | undefined
  tripStarted: boolean
}

export default function PassageirosPage({ nextTrip, tripStarted }: PassageirosPageProps) {
  // State to track passenger confirmations in the current session
  const [confirmedPassengers, setConfirmedPassengers] = useState<Set<string>>(
    new Set(nextTrip?.passageiros.map(p => p.id) || [])
  )
  const [removedPassengers, setRemovedPassengers] = useState<Set<string>>(new Set())

  const handleConfirmPassenger = (passengerId: string) => {
    setConfirmedPassengers(prev => new Set([...prev, passengerId]))
    setRemovedPassengers(prev => {
      const newSet = new Set(prev)
      newSet.delete(passengerId)
      return newSet
    })
  }

  const handleRemovePassenger = (passengerId: string) => {
    setRemovedPassengers(prev => new Set([...prev, passengerId]))
    setConfirmedPassengers(prev => {
      const newSet = new Set(prev)
      newSet.delete(passengerId)
      return newSet
    })
  }

  if (!nextTrip) {
    return (
      <div className="space-y-6">
        <Card className="border">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <h3 className="mb-2 text-base font-semibold text-foreground">
              Nenhuma viagem agendada
            </h3>
            <p className="text-sm text-muted-foreground">
              Não há passageiros para gerenciar no momento
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getPassengerInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get confirmed passengers (those in the trip that haven't been removed)
  const confirmed = nextTrip.passageiros.filter(
    p => confirmedPassengers.has(p.id) && !removedPassengers.has(p.id)
  )

  // For pending - we'll show removed passengers as "pending reconsideration"
  const pending = nextTrip.passageiros.filter(
    p => removedPassengers.has(p.id) || !confirmedPassengers.has(p.id)
  )

  return (
    <div className="space-y-6">
      {/* Trip Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {nextTrip.origem.cidade} → {nextTrip.destino.cidade}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(nextTrip.dataHoraSaida), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            {tripStarted && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md">
                <div className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" />
                <span className="text-xs font-medium text-foreground">Ativa</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Confirmados</p>
              <p className="text-lg font-semibold text-foreground">{confirmed.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Pendentes</p>
              <p className="text-lg font-semibold text-foreground">{pending.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-semibold text-foreground">
                {confirmed.length}/{nextTrip.capacidadeTotal}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmed Passengers */}
      {confirmed.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Confirmados
          </h3>
          <Card>
            <CardContent className="p-3">
              <div className="space-y-2">
                {confirmed.map((passenger, idx) => (
                  <div key={passenger.id}>
                    {idx > 0 && <div className="border-t my-2" />}
                    <div className="flex items-center gap-3 py-1">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                          {getPassengerInitials(passenger.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{passenger.nome}</p>
                        <p className="text-xs text-muted-foreground">{passenger.matricula}</p>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                    {tripStarted && (
                      <div className="mt-2">
                        <SwipePassengerControl
                          onConfirm={() => handleConfirmPassenger(passenger.id)}
                          onRemove={() => handleRemovePassenger(passenger.id)}
                          passengerName={passenger.nome}
                          isConfirmed={true}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Passengers */}
      {pending.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            {tripStarted ? 'Não Confirmados' : 'Aguardando'}
          </h3>
          <Card>
            <CardContent className="p-3">
              <div className="space-y-2">
                {pending.map((passenger, idx) => {
                  const isRemoved = removedPassengers.has(passenger.id)
                  return (
                    <div key={passenger.id}>
                      {idx > 0 && <div className="border-t my-2" />}
                      <div className="flex items-center gap-3 py-1">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                            {getPassengerInitials(passenger.nome)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{passenger.nome}</p>
                          <p className="text-xs text-muted-foreground">{passenger.matricula}</p>
                        </div>
                        {isRemoved && (
                          <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </div>
                      <div className="mt-2">
                        <SwipePassengerControl
                          onConfirm={() => handleConfirmPassenger(passenger.id)}
                          onRemove={() => handleRemovePassenger(passenger.id)}
                          passengerName={passenger.nome}
                          isConfirmed={false}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state if all removed */}
      {confirmed.length === 0 && pending.length === 0 && (
        <Card className="border">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <h3 className="mb-2 text-base font-semibold text-foreground">
              Nenhum passageiro
            </h3>
            <p className="text-sm text-muted-foreground">
              Todos os passageiros foram removidos desta viagem
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
