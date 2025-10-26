'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, MapPin } from 'lucide-react'
import { createTrip } from '@/lib/mock-api/trips/service'
import type { CreateTripPayload } from '@/lib/types'

// Import map picker dynamically to avoid SSR issues
const LocationPickerMap = dynamic(
  () => import('./location-picker-map').then((m) => ({ default: m.LocationPickerMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
  }
)

interface CreateTripFormProps {
  driverId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onTripCreated?: () => void
}

interface LocationData {
  lat: number
  lng: number
  endereco: string
  cidade: string
}

export function CreateTripForm({
  driverId,
  open,
  onOpenChange,
  onTripCreated,
}: CreateTripFormProps) {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [pickingLocation, setPickingLocation] = useState<'origem' | 'destino' | null>(null)

  // Form state
  const [origem, setOrigem] = useState<LocationData | null>(null)
  const [destino, setDestino] = useState<LocationData | null>(null)
  const [departureDate, setDepartureDate] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const [passengerIds, setPassengerIds] = useState('')

  const handleLocationSelect = (location: LocationData) => {
    if (pickingLocation === 'origem') {
      setOrigem(location)
    } else if (pickingLocation === 'destino') {
      setDestino(location)
    }
    setPickingLocation(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!origem || !destino) {
      setError('Selecione origem e destino')
      return
    }

    if (!departureDate || !departureTime) {
      setError('Informe data e horário de saída')
      return
    }

    setCreating(true)

    try {
      const dataHoraSaida = new Date(`${departureDate}T${departureTime}`).toISOString()
      const passageirosIds = passengerIds
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0)

      const payload: CreateTripPayload = {
        motoristaId: driverId,
        origem,
        destino,
        dataHoraSaida,
        passageirosIds,
      }

      const response = await createTrip(payload)

      if (response.success) {
        onOpenChange(false)
        onTripCreated?.()
        // Reset form
        setOrigem(null)
        setDestino(null)
        setDepartureDate('')
        setDepartureTime('')
        setPassengerIds('')
      } else {
        setError(response.error?.message || 'Erro ao criar viagem')
      }
    } catch (err) {
      setError('Erro inesperado ao criar viagem')
      console.error('Create trip error:', err)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl p-0 flex flex-col">
        {/* Drag Handle */}
        <div className="flex h-8 w-full items-center justify-center shrink-0">
          <div className="h-1.5 w-10 rounded-full bg-muted" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <SheetHeader className="text-left mb-4">
            <SheetTitle className="text-xl font-bold">Criar Nova Viagem</SheetTitle>
            <SheetDescription>
              Selecione origem, destino e horário da viagem
            </SheetDescription>
          </SheetHeader>

          {pickingLocation ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Selecione {pickingLocation === 'origem' ? 'a Origem' : 'o Destino'}
                </h3>
                <Button variant="ghost" onClick={() => setPickingLocation(null)}>
                  Cancelar
                </Button>
              </div>
              <div className="h-[500px] rounded-lg overflow-hidden">
                <LocationPickerMap onLocationSelect={handleLocationSelect} />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Origin Selection */}
              <div className="space-y-2">
                <Label>Origem</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-auto flex items-start justify-start p-3"
                  onClick={() => setPickingLocation('origem')}
                >
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                  <div className="text-left">
                    {origem ? (
                      <>
                        <p className="font-semibold text-sm">{origem.cidade}</p>
                        <p className="text-xs text-muted-foreground">{origem.endereco}</p>
                        <p className="text-xs text-muted-foreground">
                          {origem.lat.toFixed(6)}, {origem.lng.toFixed(6)}
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Clique para selecionar no mapa</p>
                    )}
                  </div>
                </Button>
              </div>

              {/* Destination Selection */}
              <div className="space-y-2">
                <Label>Destino</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-auto flex items-start justify-start p-3"
                  onClick={() => setPickingLocation('destino')}
                >
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                  <div className="text-left">
                    {destino ? (
                      <>
                        <p className="font-semibold text-sm">{destino.cidade}</p>
                        <p className="text-xs text-muted-foreground">{destino.endereco}</p>
                        <p className="text-xs text-muted-foreground">
                          {destino.lat.toFixed(6)}, {destino.lng.toFixed(6)}
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Clique para selecionar no mapa</p>
                    )}
                  </div>
                </Button>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Input
                    id="time"
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Passenger IDs (comma-separated) */}
              <div className="space-y-2">
                <Label htmlFor="passengers">IDs dos Passageiros (separados por vírgula)</Label>
                <Input
                  id="passengers"
                  type="text"
                  placeholder="pass-1, pass-2, pass-3"
                  value={passengerIds}
                  onChange={(e) => setPassengerIds(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Opcional: adicione passageiros à viagem
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-lg">
                  <p className="text-sm text-status-error">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-bold"
                disabled={creating || !origem || !destino}
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando viagem...
                  </>
                ) : (
                  'Criar Viagem'
                )}
              </Button>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}