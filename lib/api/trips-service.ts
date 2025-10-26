// Service to fetch trips from the real API
// This replaces the mock API calls with real API integration

import type { Trip, Driver, Passenger } from "@/lib/types";
import { fetchRoutes, fetchRouteById } from "./routes";
import { apiRouteToTrip } from "./adapters";

/**
 * Check if API is available
 */
export async function checkApiStatus(): Promise<boolean> {
  try {
    await fetchRoutes();
    return true; // API is available (even if it returns empty array)
  } catch (error) {
    return false; // API is not available
  }
}

/**
 * Fetch all trips from the API and convert to Trip objects
 */
export async function fetchAllTrips(): Promise<Trip[]> {
  try {
    const apiRoutes = await fetchRoutes();

    console.log("API Routes fetched:", apiRoutes);

    // If no routes, return empty array (could be API offline or no data)
    if (!apiRoutes || apiRoutes.length === 0) {
      console.log("No routes found from API");
      return [];
    }

    // Convert ApiRoute to Trip using actual API data
    const trips: Trip[] = apiRoutes
      .filter((route) => {
        // Skip routes without a driver
        if (!route.driver) {
          console.log(`Skipping route ${route.id} - no driver assigned`);
          return false;
        }
        return true;
      })
      .map((route) => {
        console.log("Processing route:", route);

        // Convert API driver to frontend Driver type
        // At this point, we know driver exists due to filter above
        const apiDriver = route.driver!;
        const driver: Driver = {
          id: apiDriver.id.toString(),
          nome: apiDriver.username,
          cpf: apiDriver.cpf,
          telefone: apiDriver.phone_number,
          role: "motorista",
          cnh: apiDriver.cpf, // Use CPF as CNH placeholder
          veiculo: {
            id: `vehicle-${apiDriver.id}`,
            placa: "N/A", // Not provided by API
            modelo: "Van",
            cor: "N/A",
            capacidade: 4,
            ano: new Date().getFullYear(),
          },
        };

        // Origin and destination from API coordinates
        const origin = {
          lat: route.starting_latitude || -23.5505,
          lng: route.starting_longitude || -46.6333,
          endereco: `Origem (${route.starting_latitude?.toFixed(
            4
          )}, ${route.starting_longitude?.toFixed(4)})`,
          cidade: "Teresópolis",
        };

        const destination = {
          lat: route.final_latitude || -23.5629,
          lng: route.final_longitude || -46.6544,
          endereco: `Destino (${route.final_latitude?.toFixed(
            4
          )}, ${route.final_longitude?.toFixed(4)})`,
          cidade: "Rio de Janeiro",
        };

        // Convert API attendance list to frontend Passenger array
        const passengers: Passenger[] = route.attendance_list.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (attendance: any) => ({
            id: attendance.passenger.id.toString(),
            nome: attendance.passenger.username,
            cpf: attendance.passenger.cpf,
            telefone: attendance.passenger.phone_number,
            role: "passageiro",
            matricula: attendance.passenger.id.toString(),
          })
        );

        console.log("Passengers extracted:", passengers);

        const trip = apiRouteToTrip(
          route,
          driver,
          origin,
          destination,
          passengers,
          4
        );
        console.log("Trip created:", trip);

        return trip;
      });

    console.log("All trips processed:", trips);
    return trips;
  } catch (error) {
    console.error("Error fetching trips from API:", error);
    // Return empty array instead of throwing to avoid breaking the UI
    return [];
  }
}

/**
 * Fetch trips for a specific passenger
 */
export async function fetchTripsForPassenger(
  passengerId: string
): Promise<Trip[]> {
  try {
    const allTrips = await fetchAllTrips();

    console.log(`Filtering trips for passenger ID: ${passengerId}`);
    console.log("All trips before filtering:", allTrips.length);

    // Filter trips where passenger is in attendance list
    const filteredTrips = allTrips.filter((trip) => {
      const hasPassenger = trip.passageiros.some((p) => {
        console.log(
          `Comparing passenger ${
            p.id
          } (${typeof p.id}) with ${passengerId} (${typeof passengerId})`
        );
        return p.id === passengerId;
      });
      console.log(
        `Trip ${trip.id} has passenger ${passengerId}: ${hasPassenger}`
      );
      return hasPassenger;
    });

    console.log("Filtered trips:", filteredTrips.length);
    return filteredTrips;
  } catch (error) {
    console.error("Error fetching passenger trips:", error);
    return [];
  }
}

/**
 * Fetch trips for a specific driver
 */
export async function fetchTripsForDriver(driverId: string): Promise<Trip[]> {
  try {
    const allTrips = await fetchAllTrips();

    // Filter trips where driver matches
    // Note: In real app, the API would have a driver field
    return allTrips.filter((trip) => trip.motorista.id === driverId);
  } catch (error) {
    console.error("Error fetching driver trips:", error);
    return [];
  }
}

/**
 * Fetch a single trip by ID
 */
export async function fetchTripById(tripId: string): Promise<Trip | null> {
  try {
    const routeId = parseInt(tripId, 10);
    const apiRoute = await fetchRouteById(routeId);

    // Convert API driver to frontend Driver type
    const driver: Driver = {
      id: apiRoute?.driver?.id.toString(),
      nome: apiRoute?.driver?.username,
      cpf: apiRoute?.driver?.cpf,
      telefone: apiRoute?.driver?.phone_number,
      role: "motorista",
      cnh: "00000000000", // Not provided by API
      veiculo: {
        id: "vehicle-1",
        placa: "ABC-1234",
        modelo: "Van",
        cor: "Branco",
        capacidade: 4,
        ano: 2020,
      },
    };

    const origin = {
      lat: apiRoute.starting_latitude || -23.5505,
      lng: apiRoute.starting_longitude || -46.6333,
      endereco: "Origem da Rota",
      cidade: "São Paulo",
    };

    const destination = {
      lat: apiRoute.final_latitude || -23.5629,
      lng: apiRoute.final_longitude || -46.6544,
      endereco: "Destino da Rota",
      cidade: "São Paulo",
    };

    // Convert API attendance list to frontend Passenger array
    const passengers: Passenger[] = apiRoute.attendance_list.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (attendance: any) => ({
        id: attendance.passenger.id.toString(),
        nome: attendance.passenger.username,
        cpf: attendance.passenger.cpf,
        telefone: attendance.passenger.phone_number,
        role: "passageiro",
        matricula: "000000", // Not provided by API
      })
    );

    return apiRouteToTrip(apiRoute, driver, origin, destination, passengers, 4);
  } catch (error) {
    console.error("Error fetching trip by ID:", error);
    return null;
  }
}
