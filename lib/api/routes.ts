// API service for routes endpoint
// Integrates with backend API at http://127.0.0.1:8000/routes/
// Currently unused - using mock data instead

// ApiRoute type would be defined when integrating with real backend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiRoute = any

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
const ROUTES_ENDPOINT = `${API_BASE_URL}/routes/`

/**
 * Fetch all routes from the API
 */
export async function fetchRoutes(): Promise<ApiRoute[]> {
  try {
    console.log('Fetching routes from:', ROUTES_ENDPOINT)

    const response = await fetch(ROUTES_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API returned ${response.status}: ${response.statusText}`)
      console.error('Error response body:', errorText)
      // Return empty array instead of throwing to allow app to work without API
      return []
    }

    const responseText = await response.text()
    console.log('Raw response:', responseText)

    let data: ApiRoute[]
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError)
      console.error('Response was:', responseText)
      return []
    }

    console.log('Parsed data:', data)
    console.log('Number of routes:', data.length)

    return data
  } catch (error) {
    // Log error but return empty array to allow app to function
    console.error('API unavailable or connection failed:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return []
  }
}

/**
 * Fetch a single route by ID
 */
export async function fetchRouteById(id: number): Promise<ApiRoute> {
  try {
    const response = await fetch(`${ROUTES_ENDPOINT}${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch route ${id}: ${response.status} ${response.statusText}`)
    }

    const data: ApiRoute = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching route ${id}:`, error)
    throw error
  }
}

/**
 * Create a new route
 */
export async function createRoute(
  payload: Partial<Omit<ApiRoute, 'id'>>
): Promise<ApiRoute> {
  try {
    const response = await fetch(ROUTES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Failed to create route: ${response.status} ${response.statusText}`)
    }

    const data: ApiRoute = await response.json()
    return data
  } catch (error) {
    console.error('Error creating route:', error)
    throw error
  }
}

/**
 * Update an existing route
 */
export async function updateRoute(
  id: number,
  payload: Partial<Omit<ApiRoute, 'id'>>
): Promise<ApiRoute> {
  try {
    const response = await fetch(`${ROUTES_ENDPOINT}${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Failed to update route ${id}: ${response.status} ${response.statusText}`)
    }

    const data: ApiRoute = await response.json()
    return data
  } catch (error) {
    console.error(`Error updating route ${id}:`, error)
    throw error
  }
}

/**
 * Delete a route
 */
export async function deleteRoute(id: number): Promise<void> {
  try {
    const response = await fetch(`${ROUTES_ENDPOINT}${id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete route ${id}: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error(`Error deleting route ${id}:`, error)
    throw error
  }
}

/**
 * Start a route (update starting coordinates and time)
 */
export async function startRoute(
  id: number,
  startingLatitude: number,
  startingLongitude: number
): Promise<ApiRoute> {
  return updateRoute(id, {
    starting_latitude: startingLatitude,
    starting_longitude: startingLongitude,
    starting_time: new Date().toISOString(),
  })
}

/**
 * End a route (update final coordinates and time)
 */
export async function endRoute(
  id: number,
  finalLatitude: number,
  finalLongitude: number
): Promise<ApiRoute> {
  return updateRoute(id, {
    final_latitude: finalLatitude,
    final_longitude: finalLongitude,
    final_time: new Date().toISOString(),
  })
}

/**
 * Add a passenger to a route
 */
export async function addPassengerToRoute(
  routeId: number,
  passengerId: string
): Promise<ApiRoute> {
  // First, fetch the current route to get the attendance list
  const route = await fetchRouteById(routeId)

  // Check if passenger is already in the list
  const passengerIdNum = parseInt(passengerId, 10)
  const isAlreadyAdded = route.attendance_list.some(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (attendance: any) => attendance.passenger.id === passengerIdNum
  )

  if (isAlreadyAdded) {
    return route
  }

  // Note: The backend API likely handles adding passengers differently
  // This is a placeholder - you may need to call a specific endpoint
  // For now, we'll update the entire attendance list
  const updatedAttendanceList = [
    ...route.attendance_list,
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: Math.max(...route.attendance_list.map((a: any) => a.id), 0) + 1,
      passenger: {
        id: passengerIdNum,
        username: 'New Passenger',
        cpf: '',
        email: '',
        groups: [1],
        phone_number: ''
      },
      attended: false
    }
  ]

  return updateRoute(routeId, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attendance_list: updatedAttendanceList as any,
  })
}

/**
 * Remove a passenger from a route
 */
export async function removePassengerFromRoute(
  routeId: number,
  passengerId: string
): Promise<ApiRoute> {
  // First, fetch the current route to get the attendance list
  const route = await fetchRouteById(routeId)

  // Remove the passenger from the list
  const passengerIdNum = parseInt(passengerId, 10)
  const updatedAttendanceList = route.attendance_list.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (attendance: any) => attendance.passenger.id !== passengerIdNum
  )

  return updateRoute(routeId, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attendance_list: updatedAttendanceList as any,
  })
}