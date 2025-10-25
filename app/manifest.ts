import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Professor Van Monitor',
    short_name: 'Van Monitor',
    description: 'Sistema de monitoramento e coordenação de viagens de vans universitárias',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7cc896', // Brand primary green
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['travel', 'navigation', 'productivity'],
    screenshots: [],
  }
}
