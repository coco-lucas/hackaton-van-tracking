// Mock Booking Service
// Handles trip booking operations

import { simulateDelay, createSuccessResponse, createErrorResponse, simulateError, type ApiResponse } from '../config'

export interface BookingConfirmation {
  tripId: string
  passengerId: string
  confirmedAt: string
  bookingId: string
}

/**
 * Confirm a booking for a trip
 */
export const confirmBooking = async (
  tripId: string,
  passengerId: string
): Promise<ApiResponse<BookingConfirmation>> => {
  await simulateDelay('normal')

  if (simulateError()) {
    return createErrorResponse('Erro ao confirmar reserva', 'BOOKING_ERROR')
  }

  // Generate booking ID
  const bookingId = `booking_${tripId}_${passengerId}_${Date.now()}`

  const confirmation: BookingConfirmation = {
    tripId,
    passengerId,
    confirmedAt: new Date().toISOString(),
    bookingId,
  }

  return createSuccessResponse(confirmation)
}

/**
 * Cancel a booking
 */
export const cancelBooking = async (
  bookingId: string
): Promise<ApiResponse<{ message: string }>> => {
  await simulateDelay('normal')

  if (simulateError()) {
    return createErrorResponse('Erro ao cancelar reserva', 'CANCEL_BOOKING_ERROR')
  }

  return createSuccessResponse({
    message: 'Reserva cancelada com sucesso',
  })
}

/**
 * Get user's bookings
 */
export const getUserBookings = async (
  userId: string
): Promise<ApiResponse<BookingConfirmation[]>> => {
  await simulateDelay('normal')

  if (simulateError()) {
    return createErrorResponse('Erro ao buscar reservas', 'FETCH_BOOKINGS_ERROR')
  }

  // In a real app, this would query the database
  // For now, return empty array
  return createSuccessResponse([])
}
