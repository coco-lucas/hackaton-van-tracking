import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Trip } from '@/lib/types'
import { MapPin, Clock, Users, Navigation } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface UpcomingTripCardProps {
  trip: Trip
  onClick: () => void
}

export function UpcomingTripCard({ trip, onClick }: UpcomingTripCardProps) {
  const departureTime = format(new Date(trip.dataHoraSaida), 'HH:mm', { locale: ptBR })
  const departureDate = new Date(trip.dataHoraSaida)
  const now = new Date()

  const isToday = departureDate.toDateString() === now.toDateString()
  const isTomorrow = departureDate.toDateString() === new Date(now.getTime() + 86400000).toDateString()

  const dateLabel = isToday ? 'Hoje' : isTomorrow ? 'Amanhã' : format(departureDate, 'dd/MM', { locale: ptBR })

  return (
    <Card
      className="trip-card-shadow transition-smooth hover:trip-card-shadow-hover cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-stretch justify-between gap-4">
          {/* Trip Info */}
          <div className="flex-[2] flex flex-col gap-3">
            {/* Route */}
            <div className="flex flex-col gap-1">
              <p className="text-base font-bold text-foreground leading-tight">
                {trip.origem.cidade} → {trip.destino.cidade}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-primary">
                  {dateLabel}, {departureTime}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>
                  {trip.vagasDisponiveis === 0
                    ? 'Sem vagas'
                    : `${trip.vagasDisponiveis} ${trip.vagasDisponiveis === 1 ? 'vaga' : 'vagas'}`}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <Button
              variant={trip.vagasDisponiveis === 0 ? 'outline' : 'default'}
              size="sm"
              className="w-fit"
              disabled={trip.vagasDisponiveis === 0}
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
            >
              {trip.vagasDisponiveis === 0 ? 'Lotado' : 'Reservar'}
            </Button>
          </div>

          {/* Map Thumbnail */}
          <div className="flex-1 w-24 min-w-[96px]">
            <div className="w-full h-full aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
              <Navigation className="h-8 w-8 text-primary relative z-10" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
