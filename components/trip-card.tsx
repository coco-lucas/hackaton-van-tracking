import { Card, CardContent } from '@/components/ui/card'
import type { Trip } from '@/lib/types'
import { MapPin, Clock, Users, Calendar, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from './ui/badge'

interface TripCardProps {
  trip: Trip
  onClick?: () => void
  showDetails?: boolean
  className?: string
}

export function TripCard({ trip, onClick, showDetails = false, className = '' }: TripCardProps) {
  const departureDate = new Date(trip.dataHoraSaida)
  const arrivalDate = new Date(trip.dataHoraChegadaPrevista)

  const formatTime = (date: Date) => format(date, 'HH:mm', { locale: ptBR })
  const formatDate = (date: Date) => format(date, "dd 'de' MMMM", { locale: ptBR })
  const formatDateShort = (date: Date) => format(date, 'dd/MM', { locale: ptBR })

  const isToday = departureDate.toDateString() === new Date().toDateString()
  const isTomorrow = departureDate.toDateString() === new Date(Date.now() + 86400000).toDateString()

  const dateLabel = isToday ? 'Hoje' : isTomorrow ? 'Amanhã' : formatDate(departureDate)

  const statusColors = {
    agendada: 'bg-status-info/40 text-status-info border-status-info/20',
    em_andamento: 'bg-status-success/10 text-status-success border-status-success/20',
    concluida: 'bg-muted text-muted-foreground border-border',
    cancelada: 'bg-status-error/10 text-status-error border-status-error/20',
  }

  const statusLabels = {
    agendada: 'Agendada',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
    cancelada: 'Cancelada',
  }

  return (
    <Card
      className={`transition-smooth cursor-pointer ${className}`}
      onClick={onClick}
    >
      <CardContent>
        {/* Header with date and status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-bold text-muted-foreground">{dateLabel}</span>
            {!isToday && !isTomorrow && (
              <span className="text-muted-foreground">• {formatDateShort(departureDate)}</span>
            )}
          </div>
          <Badge
            variant={'default'}
            className={`${statusColors[trip.status]
              }`}
          >
            {statusLabels[trip.status]}
          </Badge>
        </div>

        {/* Route info */}
        <div className="my-4">
          {/* Origin */}
          <div className="flex items-start gap-2">
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div className="h-8 w-0.5 bg-border" />
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm font-medium text-foreground">{trip.origem.cidade}</p>
              <p className="text-xs font-bold text-muted-foreground">{formatTime(departureDate)}</p>
            </div>
          </div>

          {/* Destination */}
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{trip.destino.cidade}</p>
              <p className="text-xs font-bold text-muted-foreground">{formatTime(arrivalDate)}</p>
            </div>
          </div>
        </div>

        {/* Trip details */}
        <div className="flex items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
          {trip.rota && (
            <>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{trip.rota.duracao}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{trip.rota.distancia}</span>
              </div>
            </>
          )}
          <div className='flex flex-col gap-1 items-center'>

            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>
                {trip.passageiros.length}/{trip.capacidadeTotal}
              </span>
            </div>
            {trip.vagasDisponiveis > 0 && (
              <span className="ml-auto text-primary font-medium">
                {trip.vagasDisponiveis} {trip.vagasDisponiveis === 1 ? 'vaga' : 'vagas'}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Simplified version for passenger view
export function TripCardSimple({ trip, onClick }: TripCardProps) {
  const departureDate = new Date(trip.dataHoraSaida)

  return (
    <Card
      className="trip-card-shadow transition-smooth hover:trip-card-shadow-hover cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold">{trip.origem.cidade}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{trip.destino.cidade}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{format(departureDate, 'dd/MM • HH:mm', { locale: ptBR })}</span>
              {trip.rota && <span>{trip.rota.duracao}</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">
              {trip.motorista.nome.split(' ')[0]}
            </div>
            <div className="text-xs text-muted-foreground">{trip.motorista.veiculo.modelo}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
