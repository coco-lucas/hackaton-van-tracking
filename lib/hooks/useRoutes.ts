// React hook for routes API
'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  fetchRoutes,
  fetchRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  startRoute,
  endRoute,
  addPassengerToRoute,
  removePassengerFromRoute,
} from '@/lib/api/routes'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiRoute = any

export function useRoutes() {
  const [routes, setRoutes] = useState<ApiRoute[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadRoutes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchRoutes()
      setRoutes(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load routes'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRoutes()
  }, [loadRoutes])

  return {
    routes,
    loading,
    error,
    refetch: loadRoutes,
  }
}

export function useRoute(id: number | null) {
  const [route, setRoute] = useState<ApiRoute | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadRoute = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)
    try {
      const data = await fetchRouteById(id)
      setRoute(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load route'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadRoute()
  }, [loadRoute])

  return {
    route,
    loading,
    error,
    refetch: loadRoute,
  }
}

export function useRouteActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const create = useCallback(async (payload: Partial<Omit<ApiRoute, 'id'>>) => {
    setLoading(true)
    setError(null)
    try {
      const newRoute = await createRoute(payload)
      return newRoute
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create route')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const update = useCallback(async (id: number, payload: Partial<Omit<ApiRoute, 'id'>>) => {
    setLoading(true)
    setError(null)
    try {
      const updatedRoute = await updateRoute(id, payload)
      return updatedRoute
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update route')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const remove = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await deleteRoute(id)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete route')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const start = useCallback(async (id: number, lat: number, lng: number) => {
    setLoading(true)
    setError(null)
    try {
      const updatedRoute = await startRoute(id, lat, lng)
      return updatedRoute
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start route')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const end = useCallback(async (id: number, lat: number, lng: number) => {
    setLoading(true)
    setError(null)
    try {
      const updatedRoute = await endRoute(id, lat, lng)
      return updatedRoute
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to end route')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const addPassenger = useCallback(async (routeId: number, passengerId: string) => {
    setLoading(true)
    setError(null)
    try {
      const updatedRoute = await addPassengerToRoute(routeId, passengerId)
      return updatedRoute
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add passenger')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const removePassenger = useCallback(async (routeId: number, passengerId: string) => {
    setLoading(true)
    setError(null)
    try {
      const updatedRoute = await removePassengerFromRoute(routeId, passengerId)
      return updatedRoute
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to remove passenger')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    create,
    update,
    remove,
    start,
    end,
    addPassenger,
    removePassenger,
    loading,
    error,
  }
}