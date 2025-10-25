'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import 'leaflet-routing-machine'

interface DriverMapProps {
  position: [number, number]
}

interface RoutingProps {
  position: [number, number]
}

// Componente interno para adicionar rota ao mapa
function Routing({ position }: RoutingProps) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    // Remove rota antiga
    const existing = map._controlContainers?.routingControl
    if (existing) map.removeControl(existing)

    const control = L.Routing.control({
      waypoints: [
        L.latLng(position[0], position[1]),
        L.latLng(-22.9068, -43.1729) // Rio de Janeiro
      ],
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
      fitSelectedRoutes: true
    }).addTo(map)

    return () => {
      map.removeControl(control)
    }
  }, [map, position])

  return null
}

export function DriverMap({ position }: DriverMapProps) {
  return (
    <MapContainer
      center={position}
      zoom={6}
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

      {/* Adiciona a rota usando o componente interno */}
      <Routing position={position} />
    </MapContainer>
  )
}
