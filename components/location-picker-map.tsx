'use client'

import { useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in react-leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

interface LocationPickerMapProps {
  onLocationSelect: (location: {
    lat: number
    lng: number
    endereco: string
    cidade: string
  }) => void
  initialCenter?: [number, number]
}

interface MapClickHandlerProps {
  onLocationClick: (lat: number, lng: number) => void
}

function MapClickHandler({ onLocationClick }: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      onLocationClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function LocationPickerMap({
  onLocationSelect,
  initialCenter = [-22.9068, -43.1729], // Rio de Janeiro default
}: LocationPickerMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)

  const handleLocationClick = useCallback(
    async (lat: number, lng: number) => {
      setSelectedLocation([lat, lng])
      setIsGeocoding(true)

      try {
        // Reverse geocoding using Nominatim (OpenStreetMap)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'VanTracking/1.0', // Required by Nominatim
            },
          }
        )

        const data = await response.json()

        const address = data.address || {}
        const endereco =
          data.display_name ||
          `${address.road || ''} ${address.house_number || ''}`.trim() ||
          'Endereço não encontrado'
        const cidade =
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          'Cidade não identificada'

        onLocationSelect({
          lat,
          lng,
          endereco,
          cidade,
        })
      } catch (error) {
        console.error('Geocoding error:', error)
        // Fallback if geocoding fails
        onLocationSelect({
          lat,
          lng,
          endereco: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
          cidade: 'Localização selecionada',
        })
      } finally {
        setIsGeocoding(false)
      }
    },
    [onLocationSelect]
  )

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={initialCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapClickHandler onLocationClick={handleLocationClick} />
        {selectedLocation && <Marker position={selectedLocation} />}
      </MapContainer>

      {/* Instructions overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
        <div className="bg-card/95 backdrop-blur-sm border rounded-lg px-4 py-2 shadow-lg">
          <p className="text-sm font-medium text-center">
            {isGeocoding ? 'Buscando endereço...' : 'Clique no mapa para selecionar a localização'}
          </p>
        </div>
      </div>
    </div>
  )
}