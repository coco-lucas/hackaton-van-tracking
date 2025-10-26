// Adapter functions to convert between frontend Trip types and backend ApiRoute types
// Currently unused - using mock data instead

import type { Trip, TripWithLocation, Driver, Passenger, Location } from '@/lib/types'

// ApiRoute type would be defined when integrating with real backend
type ApiRoute = any

/**
 * Convert ApiRoute to Trip
 * Note: This requires additional data (driver, passengers, locations) that aren't in ApiRoute
 * In a real application, you'd likely fetch this data from other endpoints
 */
export function apiRouteToTrip(
  apiRoute: ApiRoute,
  driver: Driver,
  origin: Location,
  destination: Location,
  passengers: Passenger[] = [],
  capacity: number = 4
): Trip {
  // Determine status based on route state
  // Note: For now, we'll default to 'agendada' for all routes to show them in the UI
  // The backend doesn't currently track route status explicitly
  const finalTime = apiRoute.final_time ? new Date(apiRoute.final_time) : null

  let status: Trip['status'] = 'agendada'

  // Only mark as completed if there's a final_time set
  if (finalTime) {
    status = 'concluida'
  }
  // Otherwise, keep as scheduled ('agendada')
  // In a real app, you'd have a status field in the API

  return {
    id: apiRoute.id.toString(),
    motorista: driver,
    origem: origin,
    destino: destination,
    dataHoraSaida: apiRoute.starting_time,
    dataHoraChegadaPrevista: apiRoute.final_time || new Date(
      new Date(apiRoute.starting_time).getTime() + 90 * 60000 // Default: +90 minutes
    ).toISOString(),
    status,
    passageiros: passengers,
    vagasDisponiveis: capacity - apiRoute.attendance_list.length,
    capacidadeTotal: capacity,
    rota: apiRoute.total_time ? {
      distancia: 'N/A', // Not provided by API
      duracao: apiRoute.total_time,
    } : undefined,
  }
}

/**
 * Convert ApiRoute to TripWithLocation
 */
export function apiRouteToTripWithLocation(
  apiRoute: ApiRoute,
  driver: Driver,
  origin: Location,
  destination: Location,
  passengers: Passenger[] = [],
  capacity: number = 4
): TripWithLocation {
  const baseTrip = apiRouteToTrip(apiRoute, driver, origin, destination, passengers, capacity)

  return {
    ...baseTrip,
    localizacaoAtual: apiRoute.starting_latitude && apiRoute.starting_longitude ? {
      lat: apiRoute.starting_latitude,
      lng: apiRoute.starting_longitude,
      timestamp: apiRoute.starting_time,
    } : undefined,
    tempoEstimadoChegada: apiRoute.total_time || undefined,
  }
}

/**
 * Convert Trip to ApiRoute payload for creating a new route
 * Note: This creates a simplified payload. The actual attendance_list structure
 * may need to be created by the backend API based on passenger IDs.
 */
export function tripToApiRoutePayload(trip: Trip): Partial<Omit<ApiRoute, 'id'>> {
  return {
    // Note: attendance_list should be populated by backend based on passenger IDs
    // This is a simplified representation for the payload
    attendance_list: trip.passageiros.map((p, index) => ({
      id: index + 1,
      passenger: {
        id: parseInt(p.id || '0', 10),
        username: p.nome || 'Unknown',
        cpf: p.cpf || '',
        email: '',
        groups: [1],
        phone_number: p.telefone || '',
      },
      attended: false,
    })) as any,
    starting_latitude: trip.origem.lat,
    starting_longitude: trip.origem.lng,
    final_latitude: trip.destino.lat,
    final_longitude: trip.destino.lng,
    starting_time: trip.dataHoraSaida,
    final_time: trip.status === 'concluida' ? trip.dataHoraChegadaPrevista : null,
    total_time: trip.rota?.duracao || null,
  }
}

/**
 * Helper to create a Location object from coordinates and address
 */
export function createLocation(
  lat: number,
  lng: number,
  endereco: string,
  cidade: string
): Location {
  return {
    lat,
    lng,
    endereco,
    cidade,
  }
}

/**
 * Calculate estimated arrival time based on start time and duration
 */
export function calculateArrivalTime(startTime: string, durationMinutes: number = 90): string {
  const start = new Date(startTime)
  return new Date(start.getTime() + durationMinutes * 60000).toISOString()
}

/**
 * Parse duration string (e.g., "1h 20min") to minutes
 */
export function parseDurationToMinutes(duration: string | null): number {
  if (!duration) return 0

  const hoursMatch = duration.match(/(\d+)h/)
  const minutesMatch = duration.match(/(\d+)min/)

  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0

  return hours * 60 + minutes
}

/**
 * Format minutes to duration string (e.g., 80 -> "1h 20min")
 */
export function formatMinutesToDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) {
    return `${minutes}min`
  }

  if (minutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${minutes}min`
}