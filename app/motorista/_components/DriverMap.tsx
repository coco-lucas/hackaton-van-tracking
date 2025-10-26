'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import 'leaflet-routing-machine'

interface DriverMapProps {
  position: [number, number]
  destination?: [number, number]
}

function Routing({ position, destination }: { position: [number, number]; destination?: [number, number] }) {
  const map = useMap()
  const routingControlRef = useRef<L.Routing.Control | null>(null)

  useEffect(() => {
    if (!map) return

    // Remove controle anterior se existir
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current)
    }

    // Use destination if provided, otherwise default to São Paulo
    const destCoords = destination || [-23.5505, -46.6333]

    // Cria novo controle de rota
    const control = L.Routing.control({
      waypoints: [
        L.latLng(position[0], position[1]), // ponto inicial
        L.latLng(destCoords[0], destCoords[1]) // destino
      ],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      lineOptions: {
        // added required properties to satisfy LineOptions type
        extendToWaypoints: true,
        missingRouteTolerance: 1,
        styles: [{ color: '#3b82f6', weight: 5, opacity: 1 }]
      },
      createMarker: (i: number, wp: any) =>
        L.marker(wp.latLng, {
          icon: L.icon({
            iconUrl:
              i === 0
                ? 'https://cdn-icons-png.flaticon.com/512/684/684908.png'
                : 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            iconSize: [32, 32]
          })
        }),
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      show: false // Oculta o painel de instruções
    } as any).addTo(map)

    routingControlRef.current = control

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current)
      }
    }
  }, [map, position, destination])

  return null
}

export function DriverMap({ position, destination }: DriverMapProps) {
  // Calculate center point between origin and destination
  const center: [number, number] = destination
    ? [(position[0] + destination[0]) / 2, (position[1] + destination[1]) / 2]
    : position

  return (
    <MapContainer
      center={center}
      zoom={9}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Routing position={position} destination={destination} />
    </MapContainer>
  )
}
