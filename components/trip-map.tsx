'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Trip } from '@/lib/types'

// Fix for default marker icons in react-leaflet
if (typeof window !== 'undefined') {
  Reflect.deleteProperty(L.Icon.Default.prototype, '_getIconUrl')
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

interface TripMapProps {
  trip: Trip
}

interface RoutingProps {
  origin: [number, number]
  destination: [number, number]
}

// Component to render the route using OSRM API
function RouteLayer({ origin, destination }: RoutingProps) {
  const map = useMap()
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([])

  useEffect(() => {
    if (!map) return

    let mounted = true

    // Wait for map to be ready
    const whenReady = () => {
      // Fetch route from OSRM API
      const fetchRoute = async () => {
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`

          const response = await fetch(url, {
            signal: AbortSignal.timeout(5000), // 5 second timeout
          })

          if (!mounted) return

          if (!response.ok) {
            // Log but don't throw - just use fallback
            console.warn(`OSRM API unavailable (${response.status}), using straight line fallback`)
            setRouteCoordinates([origin, destination])
            return
          }

          const contentType = response.headers.get('content-type')
          if (!contentType || !contentType.includes('application/json')) {
            console.warn('OSRM response is not JSON, using straight line fallback')
            setRouteCoordinates([origin, destination])
            return
          }

          const data = await response.json()

          if (!mounted) return

          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const coordinates = data.routes[0].geometry.coordinates.map(
              (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
            )

            setRouteCoordinates(coordinates)

            // Fit bounds to show the entire route
            setTimeout(() => {
              if (!mounted) return
              try {
                const bounds = L.latLngBounds(coordinates)
                map.fitBounds(bounds, { padding: [50, 50] })
              } catch (e) {
                console.error('Error fitting bounds:', e)
              }
            }, 100)
          } else {
            // Fallback to straight line
            setRouteCoordinates([origin, destination])
          }
        } catch (error) {
          if (!mounted) return

          // More friendly error logging
          if (error instanceof Error) {
            if (error.name === 'TimeoutError') {
              console.warn('OSRM API timeout, using straight line fallback')
            } else {
              console.warn('OSRM API error, using straight line fallback:', error.message)
            }
          } else {
            console.warn('Error fetching route, using straight line fallback')
          }

          // Fallback to straight line if route fetch fails
          setRouteCoordinates([origin, destination])
        }
      }

      fetchRoute()
    }

    if (map.getContainer()) {
      map.whenReady(whenReady)
    }

    return () => {
      mounted = false
    }
  }, [map, origin, destination])

  if (routeCoordinates.length === 0) {
    return null
  }

  // Use straight line style if only 2 points (fallback), otherwise use route style
  const isStraightLine = routeCoordinates.length === 2

  return (
    <Polyline
      positions={routeCoordinates}
      color="#4CAF50"
      weight={4}
      opacity={isStraightLine ? 0.7 : 0.8}
      dashArray={isStraightLine ? '10, 10' : undefined}
    />
  )
}

export function TripMap({ trip }: TripMapProps) {
  const origin: [number, number] = [trip.origem.lat, trip.origem.lng]
  const destination: [number, number] = [trip.destino.lat, trip.destino.lng]

  // Calculate center point between origin and destination
  const center: [number, number] = [
    (origin[0] + destination[0]) / 2,
    (origin[1] + destination[1]) / 2,
  ]

  // Use trip ID as key to force remount when trip changes
  return (
    <MapContainer
      key={trip.id}
      center={center}
      zoom={20}
      scrollWheelZoom={false}
      style={{ height: '60%', width: '100%', borderRadius: '12px' }}
      className="z-0 max-h-3/5! overflow-hidden"
      whenReady={() => {
        // Map is ready
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        className='hidden!'
      />

      {/* Route between origin and destination using OSRM */}
      <RouteLayer origin={origin} destination={destination} />

      <Marker position={origin}>
        <Popup>
          <strong>Origem</strong><br />
          {trip.origem.cidade}
        </Popup>
      </Marker>
      <Marker position={destination}>
        <Popup>
          <strong>Destino</strong><br />
          {trip.destino.cidade}
        </Popup>
      </Marker>
    </MapContainer>
  )
}