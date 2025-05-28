// Production configuration
export const CONFIG = {
  // API Configuration
  API: {
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 2,
    RATE_LIMIT_BUFFER: 100, // ms buffer for rate limits
  },

  // Cache Configuration
  CACHE: {
    ENABLED: true,
    CLEAR_ON_STARTUP: true,
  },

  // Feature Flags
  FEATURES: {
    EXPORT_ENABLED: true,
    BATCH_LOADING_INDICATOR: true,
    SEARCH_HIGHLIGHTING: true,
  },

  // Performance
  PERFORMANCE: {
    INITIAL_MATCH_COUNT: 10,
    PAGINATION_SIZE: 10,
    BATCH_SIZE: 5,
  },

  // Development vs Production
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
}

// Utility function for conditional logging
export function devLog(...args: any[]) {
  if (CONFIG.IS_DEVELOPMENT) {
    console.log(...args)
  }
}

export function devError(...args: any[]) {
  if (CONFIG.IS_DEVELOPMENT) {
    console.error(...args)
  }
}

// Production-safe error reporting
export function reportError(error: Error, context?: string) {
  if (CONFIG.IS_PRODUCTION) {
    // In production, you might want to send to an error reporting service
    // like Sentry, LogRocket, etc.
    // For now, we'll just silently handle it
    return
  }

  console.error(`Error${context ? ` in ${context}` : ""}:`, error)
}
