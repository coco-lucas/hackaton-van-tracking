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
  petropolis: {
    lat: -22.5050,
    lng: -43.1789,
    endereco: 'Centro Histórico de Petrópolis',
    cidade: 'Petrópolis',
  },
  nilopolis: {
    lat: -22.8078,
    lng: -43.4147,
    endereco: 'Centro de Nilópolis',
    cidade: 'Nilópolis',
  },
  novafriburgo: {
    lat: -22.2819,
    lng: -42.5311,
    endereco: 'Centro de Nova Friburgo',
    cidade: 'Nova Friburgo',
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

  // Trip 1 - Today, morning (upcoming) - passenger-1 (João Pedro)
  const trip1Date = new Date(now)
  trip1Date.setHours(7, 30, 0, 0)

  trips.push({
    id: `${driverId}-trip-1`,
    motorista: driver,
    origem: locations.teresopolis,
    destino: locations.rioDeJaneiro,
    dataHoraSaida: trip1Date.toISOString(),
    dataHoraChegadaPrevista: new Date(trip1Date.getTime() + 90 * 60000).toISOString(), // +90 min
    status: 'agendada',
    passageiros: [mockPassengers[0]], // João Pedro
    vagasDisponiveis: driver.veiculo.capacidade - 1,
    capacidadeTotal: driver.veiculo.capacidade,
    rota: {
      distancia: '87 km',
      duracao: '1h 30min',
    },
  })

  // Trip 2 - Today, afternoon return (upcoming) - Outros passageiros
  const trip2Date = new Date(now)
  trip2Date.setHours(17, 0, 0, 0)

  trips.push({
    id: `${driverId}-trip-2`,
    motorista: driver,
    origem: locations.rioDeJaneiro,
    destino: locations.teresopolis,
    dataHoraSaida: trip2Date.toISOString(),
    dataHoraChegadaPrevista: new Date(trip2Date.getTime() + 100 * 60000).toISOString(), // +100 min
    status: 'agendada',
    passageiros: [mockPassengers[1], mockPassengers[3], mockPassengers[6]], // Ana Paula, Mariana, Carlos
    vagasDisponiveis: driver.veiculo.capacidade - 3,
    capacidadeTotal: driver.veiculo.capacidade,
    rota: {
      distancia: '87 km',
      duracao: '1h 40min',
    },
  })

  // Trip 3 - Tomorrow, morning - passenger-1 (João Pedro)
  const trip3Date = new Date(now)
  trip3Date.setDate(trip3Date.getDate() + 1)
  trip3Date.setHours(7, 30, 0, 0)

  trips.push({
    id: `${driverId}-trip-3`,
    motorista: driver,
    origem: locations.teresopolis,
    destino: locations.rioDeJaneiroAlt,
    dataHoraSaida: trip3Date.toISOString(),
    dataHoraChegadaPrevista: new Date(trip3Date.getTime() + 95 * 60000).toISOString(),
    status: 'agendada',
    passageiros: [mockPassengers[0], mockPassengers[2]], // João Pedro, Roberto
    vagasDisponiveis: driver.veiculo.capacidade - 2,
    capacidadeTotal: driver.veiculo.capacidade,
    rota: {
      distancia: '92 km',
      duracao: '1h 35min',
    },
  })

  // Trip 4 - Tomorrow, afternoon - Outros passageiros
  const trip4Date = new Date(now)
  trip4Date.setDate(trip4Date.getDate() + 1)
  trip4Date.setHours(17, 30, 0, 0)

  trips.push({
    id: `${driverId}-trip-4`,
    motorista: driver,
    origem: locations.rioDeJaneiroAlt,
    destino: locations.teresopolis,
    dataHoraSaida: trip4Date.toISOString(),
    dataHoraChegadaPrevista: new Date(trip4Date.getTime() + 105 * 60000).toISOString(),
    status: 'agendada',
    passageiros: [mockPassengers[4], mockPassengers[5]], // Fernando, Beatriz
    vagasDisponiveis: driver.veiculo.capacidade - 2,
    capacidadeTotal: driver.veiculo.capacidade,
    rota: {
      distancia: '92 km',
      duracao: '1h 45min',
    },
  })

  // Trip 5 - Day after tomorrow - Outros passageiros
  const trip5Date = new Date(now)
  trip5Date.setDate(trip5Date.getDate() + 2)
  trip5Date.setHours(8, 0, 0, 0)

  trips.push({
    id: `${driverId}-trip-5`,
    motorista: driver,
    origem: locations.teresopolis,
    destino: locations.rioDeJaneiro,
    dataHoraSaida: trip5Date.toISOString(),
    dataHoraChegadaPrevista: new Date(trip5Date.getTime() + 90 * 60000).toISOString(),
    status: 'agendada',
    passageiros: [mockPassengers[1], mockPassengers[7]], // Ana Paula, Diana
    vagasDisponiveis: driver.veiculo.capacidade - 2,
    capacidadeTotal: driver.veiculo.capacidade,
    rota: {
      distancia: '87 km',
      duracao: '1h 30min',
    },
  })

  // Trip 6 - 3 days from now - passenger-1 (João Pedro)
  const trip6Date = new Date(now)
  trip6Date.setDate(trip6Date.getDate() + 3)
  trip6Date.setHours(7, 45, 0, 0)

  trips.push({
    id: `${driverId}-trip-6`,
    motorista: driver,
    origem: locations.teresopolis,
    destino: locations.rioDeJaneiroAlt,
    dataHoraSaida: trip6Date.toISOString(),
    dataHoraChegadaPrevista: new Date(trip6Date.getTime() + 95 * 60000).toISOString(),
    status: 'agendada',
    passageiros: [mockPassengers[0], mockPassengers[3]], // João Pedro, Mariana
    vagasDisponiveis: driver.veiculo.capacidade - 2,
    capacidadeTotal: driver.veiculo.capacidade,
    rota: {
      distancia: '92 km',
      duracao: '1h 35min',
    },
  })

  // Trip 7 - Past trip (yesterday morning) - completed - passenger-1 (João Pedro)
  const trip7Date = new Date(now)
  trip7Date.setDate(trip7Date.getDate() - 1)
  trip7Date.setHours(7, 30, 0, 0)

  trips.push({
    id: `${driverId}-trip-7`,
    motorista: driver,
    origem: locations.teresopolis,
    destino: locations.rioDeJaneiro,
    dataHoraSaida: trip7Date.toISOString(),
    dataHoraChegadaPrevista: new Date(trip7Date.getTime() + 90 * 60000).toISOString(),
    status: 'concluida',
    passageiros: [mockPassengers[0], mockPassengers[5]], // João Pedro, Beatriz
    vagasDisponiveis: 0,
    capacidadeTotal: driver.veiculo.capacidade,
    rota: {
      distancia: '87 km',
      duracao: '1h 30min',
    },
  })

  // Trip 8 - Past trip (2 days ago) - completed - Outros passageiros
  const trip8Date = new Date(now)
  trip8Date.setDate(trip8Date.getDate() - 2)
  trip8Date.setHours(17, 0, 0, 0)

  trips.push({
    id: `${driverId}-trip-8`,
    motorista: driver,
    origem: locations.rioDeJaneiro,
    destino: locations.teresopolis,
    dataHoraSaida: trip8Date.toISOString(),
    dataHoraChegadaPrevista: new Date(trip8Date.getTime() + 100 * 60000).toISOString(),
    status: 'concluida',
    passageiros: [mockPassengers[2], mockPassengers[4]], // Roberto, Fernando
    vagasDisponiveis: driver.veiculo.capacidade - 2,
    capacidadeTotal: driver.veiculo.capacidade,
    rota: {
      distancia: '87 km',
      duracao: '1h 40min',
    },
  })

  // Trip 9 - 4 days from now - Petrópolis route - Outros passageiros
  const trip9Date = new Date(now)
  trip9Date.setDate(trip9Date.getDate() + 4)
  trip9Date.setHours(8, 15, 0, 0)

  trips.push({
    id: `${driverId}-trip-9`,
    motorista: driver,
    origem: locations.teresopolis,
    destino: locations.petropolis,
    dataHoraSaida: trip9Date.toISOString(),
    dataHoraChegadaPrevista: new Date(trip9Date.getTime() + 50 * 60000).toISOString(),
    status: 'agendada',
    passageiros: [mockPassengers[6]], // Carlos Eduardo
    vagasDisponiveis: driver.veiculo.capacidade - 1,
    capacidadeTotal: driver.veiculo.capacidade,
    rota: {
      distancia: '45 km',
      duracao: '50 min',
    },
  })

  // Trip 10 - 5 days from now - Nova Friburgo route - passenger-1 (João Pedro)
  const trip10Date = new Date(now)
  trip10Date.setDate(trip10Date.getDate() + 5)
  trip10Date.setHours(9, 0, 0, 0)

  trips.push({
    id: `${driverId}-trip-10`,
    motorista: driver,
    origem: locations.teresopolis,
    destino: locations.novafriburgo,
    dataHoraSaida: trip10Date.toISOString(),
    dataHoraChegadaPrevista: new Date(trip10Date.getTime() + 40 * 60000).toISOString(),
    status: 'agendada',
    passageiros: [mockPassengers[0], mockPassengers[7]], // João Pedro, Diana
    vagasDisponiveis: driver.veiculo.capacidade - 2,
    capacidadeTotal: driver.veiculo.capacidade,
    rota: {
      distancia: '38 km',
      duracao: '40 min',
    },
  })

  // Trip 11 - Past trip (3 days ago) - completed - Outros passageiros
  const trip11Date = new Date(now)
  trip11Date.setDate(trip11Date.getDate() - 3)
  trip11Date.setHours(14, 30, 0, 0)

  trips.push({
    id: `${driverId}-trip-11`,
    motorista: driver,
    origem: locations.rioDeJaneiro,
    destino: locations.nilopolis,
    dataHoraSaida: trip11Date.toISOString(),
    dataHoraChegadaPrevista: new Date(trip11Date.getTime() + 35 * 60000).toISOString(),
    status: 'concluida',
    passageiros: [mockPassengers[3], mockPassengers[4]], // Mariana, Fernando
    vagasDisponiveis: driver.veiculo.capacidade - 2,
    capacidadeTotal: driver.veiculo.capacidade,
    rota: {
      distancia: '28 km',
      duracao: '35 min',
    },
  })

  // Trip 12 - Next week - Monday morning - Outros passageiros
  const trip12Date = new Date(now)
  const daysUntilMonday = (8 - trip12Date.getDay()) % 7 || 7
  trip12Date.setDate(trip12Date.getDate() + daysUntilMonday)
  trip12Date.setHours(7, 0, 0, 0)

  trips.push({
    id: `${driverId}-trip-12`,
    motorista: driver,
    origem: locations.teresopolis,
    destino: locations.rioDeJaneiro,
    dataHoraSaida: trip12Date.toISOString(),
    dataHoraChegadaPrevista: new Date(trip12Date.getTime() + 95 * 60000).toISOString(),
    status: 'agendada',
    passageiros: [mockPassengers[2], mockPassengers[5]], // Roberto, Beatriz
    vagasDisponiveis: driver.veiculo.capacidade - 2,
    capacidadeTotal: driver.veiculo.capacidade,
    rota: {
      distancia: '87 km',
      duracao: '1h 35min',
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
