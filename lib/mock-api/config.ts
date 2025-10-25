// Mock API Configuration
// Simulates real API behavior with delays and error handling

export const MOCK_CONFIG = {
  // Simulated network delays (in milliseconds)
  delays: {
    fast: 300,      // Quick operations (login, logout)
    normal: 600,    // Standard operations (fetching trips)
    slow: 1200,     // Complex operations (creating trip)
    websocket: 100, // Real-time updates simulation
  },

  // Error simulation (percentage 0-100)
  errorRate: 0, // Set to 0 for MVP, can be increased for testing

  // Enable/disable console logs for debugging
  debug: true,
}

/**
 * Simulates network delay
 */
export const simulateDelay = (delayType: keyof typeof MOCK_CONFIG.delays = 'normal'): Promise<void> => {
  const delay = MOCK_CONFIG.delays[delayType]

  if (MOCK_CONFIG.debug) {
    console.log(`[Mock API] Simulating ${delayType} delay (${delay}ms)`)
  }

  return new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * Simulates random API errors for testing
 */
export const simulateError = (): boolean => {
  if (MOCK_CONFIG.errorRate === 0) return false
  return Math.random() * 100 < MOCK_CONFIG.errorRate
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
  }
  timestamp: string
}

/**
 * Creates a successful API response
 */
export const createSuccessResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
})

/**
 * Creates an error API response
 */
export const createErrorResponse = (message: string, code: string = 'UNKNOWN_ERROR'): ApiResponse<never> => ({
  success: false,
  error: { message, code },
  timestamp: new Date().toISOString(),
})
