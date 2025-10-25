// Mock Trip Data
// Contains test trips for drivers and passengers

import type { Trip, TripWithLocation } from '@/lib/types'
import { mockDrivers, mockPassengers } from '../auth/data'

// Mock locations
export const locations = {
  teresopolis: {
    lat: -22.4125,
    lng: -42.9658,
    endereco: 'Campus Teresópolis',
    cidade: 'Teresópolis',
  },
  rioDeJaneiro: {
    lat: -22.9068,
    lng: -43.1729,
    endereco: 'Campus Rio de Janeiro - Rua México, 128',
    cidade: 'Rio de Janeiro',
  },
  rioDeJaneiroAlt: {
    lat: -22.9129,
    lng: -43.2003,
    endereco: 'Campus Rio de Janeiro - Av. Atlântica, 500',
    cidade: 'Rio de Janeiro',
  },
}

/**
 * Generate trips for a specific driver
 */
export const generateDriverTrips = (driverId: string): Trip[] => {
  const driver = mockDrivers.find((d) => d.id === driverId)
  if (!driver) return []

  const now = new Date()
  const trips: Trip[] = []

  // Trip 1 - Today, morning (upcoming)
  const trip1Date = new Date(now)
  trip1Date.setHours(7, 30, 0, 0)

  trips.push({
    id: 'trip-1',
    motorista: driver,
    origem: locations.teresopolis,
    destino: locations.rioDeJaneiro,
    dataHoraSaida: trip1Date.toISOString(),
    dataHoraChegadaPrevista: new Date(trip1Date.getTime() + 90 * 60000).toISOString(), // +90 min
    status: 'agendada',
    passageiros: [mockPassengers[0], mockPassengers[1], mockPassengers[2]],
    vagasDisponiveis: driver.veiculo.capacidade - 3,
    capacidadeTotal: driver.veiculo.capacidade,
    rota: {
      distancia: '87 km',
      duracao: '1h 30min',
    },
  })

  // Trip 2 - Today, afternoon return (upcoming)
  const trip2Date = new Date(now)
  trip2Date.setHours(17, 0, 0, 0)

  trips.push({
    id: 'trip-2',
    motorista: driver,
    origem: locations.rioDeJaneiro,
    destino: locations.teresopolis,
    dataHoraSaida: trip2Date.toISOString(),
    dataHoraChegadaPrevista: new Date(trip2Date.getTime() + 100 * 60000).toISOString(), // +100 min
    status: 'agendada',
    passageiros: [mockPassengers[0], mockPassengers[2], mockPassengers[3]],
    vagasDisponiveis: driver.veiculo.capacidade - 3,
    capacidadeTotal: driver.veiculo.capacidade,
    rota: {
      distancia: '87 km',
      duracao: '1h 40min',
    },
  })

  // Trip 3 - Tomorrow, morning
  const trip3Date = new Date(now)
  trip3Date.setDate(trip3Date.getDate() + 1)
  trip3Date.setHours(7, 30, 0, 0)

  trips.push({
    id: 'trip-3',
    motorista: driver,
    origem: locations.teresopolis,
    destino: locations.rioDeJaneiroAlt,
    dataHoraSaida: trip3Date.toISOString(),
    dataHoraChegadaPrevista: new Date(trip3Date.getTime() + 95 * 60000).toISOString(),
    status: 'agendada',
    passageiros: [mockPassengers[1], mockPassengers[3], mockPassengers[4]],
    vagasDisponiveis: driver.veiculo.capacidade - 3,
    capacidadeTotal: driver.veiculo.capacidade,
    rota: {
      distancia: '92 km',
      duracao: '1h 35min',
    },
  })

  // Trip 4 - Tomorrow, afternoon
  const trip4Date = new Date(now)
  trip4Date.setDate(trip4Date.getDate() + 1)
  trip4Date.setHours(17, 30, 0, 0)

  trips.push({
    id: 'trip-4',
    motorista: driver,
    origem: locations.rioDeJaneiroAlt,
    destino: locations.teresopolis,
    dataHoraSaida: trip4Date.toISOString(),
    dataHoraChegadaPrevista: new Date(trip4Date.getTime() + 105 * 60000).toISOString(),
    status: 'agendada',
    passageiros: [mockPassengers[0], mockPassengers[4]],
    vagasDisponiveis: driver.veiculo.capacidade - 2,
    capacidadeTotal: driver.veiculo.capacidade,
    rota: {
      distancia: '92 km',
      duracao: '1h 45min',
    },
  })

  // Trip 5 - Day after tomorrow
  const trip5Date = new Date(now)
  trip5Date.setDate(trip5Date.getDate() + 2)
  trip5Date.setHours(8, 0, 0, 0)

  trips.push({
    id: 'trip-5',
    motorista: driver,
    origem: locations.teresopolis,
    destino: locations.rioDeJaneiro,
    dataHoraSaida: trip5Date.toISOString(),
    dataHoraChegadaPrevista: new Date(trip5Date.getTime() + 90 * 60000).toISOString(),
    status: 'agendada',
    passageiros: [mockPassengers[2], mockPassengers[3]],
    vagasDisponiveis: driver.veiculo.capacidade - 2,
    capacidadeTotal: driver.veiculo.capacidade,
    rota: {
      distancia: '87 km',
      duracao: '1h 30min',
    },
  })

  return trips
}

/**
 * Get all trips for a driver
 */
export const getDriverTrips = (driverId: string): Trip[] => {
  return generateDriverTrips(driverId).sort((a, b) =>
    new Date(a.dataHoraSaida).getTime() - new Date(b.dataHoraSaida).getTime()
  )
}

/**
 * Get upcoming trips for a driver (future trips only)
 */
export const getUpcomingDriverTrips = (driverId: string): Trip[] => {
  const now = new Date()
  return getDriverTrips(driverId).filter(
    (trip) => new Date(trip.dataHoraSaida) > now && trip.status !== 'cancelada'
  )
}

/**
 * Get trips for a passenger
 */
export const getPassengerTrips = (passengerId: string): Trip[] => {
  const allTrips: Trip[] = []

  // Generate trips for all drivers and filter by passenger
  mockDrivers.forEach((driver) => {
    const driverTrips = getDriverTrips(driver.id)
    const passengerTrips = driverTrips.filter((trip) =>
      trip.passageiros.some((p) => p.id === passengerId)
    )
    allTrips.push(...passengerTrips)
  })

  return allTrips.sort((a, b) =>
    new Date(a.dataHoraSaida).getTime() - new Date(b.dataHoraSaida).getTime()
  )
}

/**
 * Get active trip for a driver (currently in progress)
 */
export const getActiveTrip = (driverId: string): TripWithLocation | null => {
  // For demo purposes, we'll simulate an active trip if there's one scheduled for today
  const trips = getDriverTrips(driverId)
  const now = new Date()

  const activeTrip = trips.find((trip) => {
    const tripDate = new Date(trip.dataHoraSaida)
    return (
      tripDate.toDateString() === now.toDateString() &&
      trip.status === 'agendada'
    )
  })

  if (!activeTrip) return null

  // Add simulated location data
  return {
    ...activeTrip,
    localizacaoAtual: {
      lat: -22.6597,
      lng: -43.0694,
      timestamp: new Date().toISOString(),
    },
    tempoEstimadoChegada: '45 min',
  }
}
