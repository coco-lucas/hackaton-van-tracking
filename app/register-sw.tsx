'use client'

import { useEffect } from 'react'

export function RegisterServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registrado com sucesso:', registration)

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('Nova versão disponível! Recarregue para atualizar.')
                  // You can show a toast/notification here
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('Erro ao registrar Service Worker:', error)
        })
    }
  }, [])

  return null
}
