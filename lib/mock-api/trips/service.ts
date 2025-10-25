// Mock Trips Service
// Handles trip-related operations with simulated delays

import { simulateDelay, createSuccessResponse, createErrorResponse, simulateError, type ApiResponse } from '../config'
import type { Trip, TripWithLocation } from '@/lib/types'
import { getDriverTrips, getUpcomingDriverTrips, getPassengerTrips, getActiveTrip } from './data'

/**
 * Fetch all trips for a driver
 */
export const fetchDriverTrips = async (driverId: string): Promise<ApiResponse<Trip[]>> => {
  await simulateDelay('normal')

  if (simulateError()) {
    return createErrorResponse('Erro ao carregar viagens', 'FETCH_ERROR')
  }

  const trips = getDriverTrips(driverId)
  return createSuccessResponse(trips)
}

/**
 * Fetch upcoming trips for a driver
 */
export const fetchUpcomingDriverTrips = async (driverId: string): Promise<ApiResponse<Trip[]>> => {
  await simulateDelay('normal')

  if (simulateError()) {
    return createErrorResponse('Erro ao carregar viagens futuras', 'FETCH_ERROR')
  }

  const trips = getUpcomingDriverTrips(driverId)
  return createSuccessResponse(trips)
}

/**
 * Fetch trips for a passenger
 */
export const fetchPassengerTrips = async (passengerId: string): Promise<ApiResponse<Trip[]>> => {
  await simulateDelay('normal')

  if (simulateError()) {
    return createErrorResponse('Erro ao carregar suas viagens', 'FETCH_ERROR')
  }

  const trips = getPassengerTrips(passengerId)
  return createSuccessResponse(trips)
}

/**
 * Fetch active trip for a driver
 */
export const fetchActiveTrip = async (driverId: string): Promise<ApiResponse<TripWithLocation | null>> => {
  await simulateDelay('fast')

  if (simulateError()) {
    return createErrorResponse('Erro ao carregar viagem ativa', 'FETCH_ERROR')
  }

  const trip = getActiveTrip(driverId)
  return createSuccessResponse(trip)
}

/**
 * Start a trip
 */
export const startTrip = async (tripId: string): Promise<ApiResponse<Trip>> => {
  await simulateDelay('normal')

  if (simulateError()) {
    return createErrorResponse('Erro ao iniciar viagem', 'START_TRIP_ERROR')
  }

  // In a real app, this would update the database
  // For now, we'll just return success
  return createSuccessResponse({
    id: tripId,
  } as Trip)
}

/**
 * End a trip
 */
export const endTrip = async (tripId: string): Promise<ApiResponse<Trip>> => {
  await simulateDelay('normal')

  if (simulateError()) {
    return createErrorResponse('Erro ao finalizar viagem', 'END_TRIP_ERROR')
  }

  return createSuccessResponse({
    id: tripId,
  } as Trip)
}

/**
 * Cancel a trip
 */
export const cancelTrip = async (tripId: string, reason?: string): Promise<ApiResponse<{ message: string }>> => {
  await simulateDelay('normal')

  if (simulateError()) {
    return createErrorResponse('Erro ao cancelar viagem', 'CANCEL_TRIP_ERROR')
  }

  return createSuccessResponse({
    message: `Viagem ${tripId} cancelada com sucesso${reason ? `: ${reason}` : ''}`,
  })
}
