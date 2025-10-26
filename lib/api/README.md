# API de Rotas - Documentação de Integração

Esta documentação descreve como usar a integração com a API de rotas em `http://127.0.0.1:8000/routes/`.

## Schema da API

```typescript
interface ApiRoute {
  id: number;
  attendance_list: string[]; // Lista de IDs dos passageiros
  starting_latitude: number | null;
  starting_longitude: number | null;
  final_latitude: number | null;
  final_longitude: number | null;
  starting_time: string; // ISO timestamp
  final_time: string | null; // ISO timestamp
  total_time: string | null; // Duração (ex: "1h 20min")
}
```

## Configuração

### Variável de Ambiente

Crie ou atualize o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## Uso

### 1. Usando Funções Diretas da API

```typescript
import { fetchRoutes, createRoute, updateRoute } from '@/lib/api/routes'

// Buscar todas as rotas
const routes = await fetchRoutes()

// Buscar uma rota específica
const route = await fetchRouteById(1)

// Criar uma nova rota
const newRoute = await createRoute({
  attendance_list: [],
  starting_latitude: -23.5505,
  starting_longitude: -46.6333,
  final_latitude: -23.5629,
  final_longitude: -46.6544,
  starting_time: new Date().toISOString(),
})

// Atualizar uma rota
const updated = await updateRoute(1, {
  final_time: new Date().toISOString(),
})

// Iniciar uma rota
const started = await startRoute(1, -23.5505, -46.6333)

// Finalizar uma rota
const ended = await endRoute(1, -23.5629, -46.6544)

// Adicionar passageiro
const withPassenger = await addPassengerToRoute(1, 'passenger-id-123')

// Remover passageiro
const withoutPassenger = await removePassengerFromRoute(1, 'passenger-id-123')
```

### 2. Usando Hooks React

```typescript
'use client'

import { useRoutes, useRoute, useRouteActions } from '@/lib/hooks/useRoutes'

function MyComponent() {
  // Listar todas as rotas
  const { routes, loading, error, refetch } = useRoutes()

  // Obter uma rota específica
  const { route, loading: routeLoading } = useRoute(1)

  // Ações de rotas
  const {
    create,
    update,
    remove,
    start,
    end,
    addPassenger,
    removePassenger,
    loading: actionLoading,
  } = useRouteActions()

  const handleCreateRoute = async () => {
    try {
      const newRoute = await create({
        attendance_list: [],
        starting_latitude: -23.5505,
        starting_longitude: -46.6333,
        final_latitude: -23.5629,
        final_longitude: -46.6544,
        starting_time: new Date().toISOString(),
      })
      console.log('Route created:', newRoute)
      refetch() // Recarregar lista de rotas
    } catch (error) {
      console.error('Failed to create route:', error)
    }
  }

  const handleStartRoute = async (routeId: number) => {
    // Obter coordenadas atuais (exemplo)
    const lat = -23.5505
    const lng = -46.6333

    try {
      const updatedRoute = await start(routeId, lat, lng)
      console.log('Route started:', updatedRoute)
    } catch (error) {
      console.error('Failed to start route:', error)
    }
  }

  return (
    <div>
      {loading ? (
        <p>Carregando rotas...</p>
      ) : error ? (
        <p>Erro: {error.message}</p>
      ) : (
        <ul>
          {routes.map((route) => (
            <li key={route.id}>
              Rota #{route.id} - {route.attendance_list.length} passageiros
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### 3. Convertendo entre Trip e ApiRoute

Use os adaptadores para converter entre os tipos do frontend (`Trip`) e backend (`ApiRoute`):

```typescript
import {
  apiRouteToTrip,
  tripToApiRoutePayload,
  createLocation,
} from '@/lib/api/adapters'

// Converter ApiRoute para Trip
const apiRoute = await fetchRouteById(1)

const driver = {
  /* dados do motorista */
}
const origin = createLocation(-23.5505, -46.6333, 'Rua A, 123', 'São Paulo')
const destination = createLocation(
  -23.5629,
  -46.6544,
  'Rua B, 456',
  'São Paulo'
)
const passengers = [
  /* lista de passageiros */
]

const trip = apiRouteToTrip(apiRoute, driver, origin, destination, passengers, 4)

// Converter Trip para ApiRoute payload
const routePayload = tripToApiRoutePayload(trip)
const newRoute = await createRoute(routePayload)
```

## Exemplo Completo: Componente de Viagem

```typescript
'use client'

import { useState } from 'react'
import { useRouteActions } from '@/lib/hooks/useRoutes'
import { Button } from '@/components/ui/button'

interface TripComponentProps {
  routeId: number
  passengerId: string
}

function TripComponent({ routeId, passengerId }: TripComponentProps) {
  const { addPassenger, removePassenger, start, end, loading } =
    useRouteActions()
  const [isBooked, setIsBooked] = useState(false)

  const handleBooking = async () => {
    try {
      await addPassenger(routeId, passengerId)
      setIsBooked(true)
      alert('Reserva confirmada!')
    } catch (error) {
      alert('Erro ao confirmar reserva')
    }
  }

  const handleCancelBooking = async () => {
    try {
      await removePassenger(routeId, passengerId)
      setIsBooked(false)
      alert('Reserva cancelada!')
    } catch (error) {
      alert('Erro ao cancelar reserva')
    }
  }

  const handleStartTrip = async () => {
    // Obter localização atual do navegador
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        await start(routeId, position.coords.latitude, position.coords.longitude)
        alert('Viagem iniciada!')
      } catch (error) {
        alert('Erro ao iniciar viagem')
      }
    })
  }

  const handleEndTrip = async () => {
    // Obter localização atual do navegador
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        await end(routeId, position.coords.latitude, position.coords.longitude)
        alert('Viagem finalizada!')
      } catch (error) {
        alert('Erro ao finalizar viagem')
      }
    })
  }

  return (
    <div>
      {!isBooked ? (
        <Button onClick={handleBooking} disabled={loading}>
          {loading ? 'Confirmando...' : 'Confirmar Reserva'}
        </Button>
      ) : (
        <>
          <Button onClick={handleCancelBooking} disabled={loading}>
            {loading ? 'Cancelando...' : 'Cancelar Reserva'}
          </Button>
          <Button onClick={handleStartTrip} disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar Viagem'}
          </Button>
          <Button onClick={handleEndTrip} disabled={loading}>
            {loading ? 'Finalizando...' : 'Finalizar Viagem'}
          </Button>
        </>
      )}
    </div>
  )
}
```

## Tratamento de Erros

Todas as funções podem lançar erros. Sempre use try/catch:

```typescript
try {
  const route = await fetchRouteById(1)
} catch (error) {
  if (error instanceof Error) {
    console.error('Erro:', error.message)
  }
}
```

## Estrutura de Arquivos

```
lib/
├── api/
│   ├── routes.ts        # Funções de API
│   ├── adapters.ts      # Conversores de tipos
│   ├── index.ts         # Exports
│   └── README.md        # Esta documentação
├── hooks/
│   └── useRoutes.ts     # Hooks React
└── types/
    └── index.ts         # Definições de tipos (ApiRoute, Trip, etc.)
```

## Próximos Passos

1. Configure a variável de ambiente `NEXT_PUBLIC_API_URL`
2. Certifique-se de que a API está rodando em `http://127.0.0.1:8000`
3. Use os hooks ou funções diretas conforme necessário
4. Trate erros adequadamente
5. Considere adicionar autenticação/autorização nas requisições se necessário