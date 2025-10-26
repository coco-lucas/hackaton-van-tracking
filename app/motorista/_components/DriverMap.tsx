'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import 'leaflet-routing-machine'

interface DriverMapProps {
  position: [number, number]
}

function Routing({ position }: { position: [number, number] }) {
  const map = useMap()
  const routingControlRef = useRef<L.Routing.Control | null>(null)

  useEffect(() => {
    if (!map) return

    // Remove controle anterior se existir
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current)
    }

    // Cria novo controle de rota
    const control = L.Routing.control({
      waypoints: [
        L.latLng(position[0], position[1]), // ponto inicial
        L.latLng(-23.5505, -46.6333) // São Paulo
      ],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      lineOptions: {
        styles: [{ color: '#3b82f6', weight: 5, opacity: 1 }]
      },
      createMarker: (i, wp) =>
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
      showAlternatives: false
    }).addTo(map)

    routingControlRef.current = control

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current)
      }
    }
  }, [map, position])

  return null
}

export function DriverMap({ position }: DriverMapProps) {
  return (
    <MapContainer
      center={position}
      zoom={8}
      scrollWheelZoom={false}
      style={{ height: '400px', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={position}>
        <Popup>Você está aqui 🚗</Popup>
      </Marker>
      <Routing position={position} />
    </MapContainer>
  )
}
