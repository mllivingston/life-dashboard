/**
 * Structured Logging Utility for Life Dashboard
 * 
 * Features:
 * - Log levels: error, warn, info, debug
 * - Automatic context enrichment (user, session, timestamp)
 * - Writes to console (development) and Supabase (production)
 * - Request tracing with unique IDs
 * - Structured data for easy querying
 * 
 * Usage:
 * import logger from '@/lib/logger'
 * 
 * logger.error('Calendar API failed', { 
 *   service: 'google-calendar',
 *   endpoint: '/api/calendar'
 * })
 */

import { createClient } from '@/lib/supabase/client'

// Log levels (lower number = higher priority)
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
}

// Current log level (set via environment or default to info)
const CURRENT_LOG_LEVEL = process.env.NEXT_PUBLIC_LOG_LEVEL || 'info'

// Should we write to database?
const ENABLE_DB_LOGGING = process.env.NEXT_PUBLIC_ENABLE_DB_LOGGING !== 'false'

class Logger {
  constructor() {
    this.supabase = null
    this.sessionId = this.generateSessionId()
    this.requestId = null
  }

  /**
   * Initialize Supabase client (lazy loading)
   */
  getSupabase() {
    if (!this.supabase && typeof window !== 'undefined') {
      try {
        this.supabase = createClient()
      } catch (error) {
        console.error('Failed to initialize Supabase for logging:', error)
      }
    }
    return this.supabase
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      let sessionId = sessionStorage.getItem('logger_session_id')
      if (!sessionId) {
        sessionId = this.generateId()
        sessionStorage.setItem('logger_session_id', sessionId)
      }
      return sessionId
    }
    return this.generateId()
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get current user context
   */
  async getUserContext() {
    const supabase = this.getSupabase()
    if (!supabase) return null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user ? { userId: user.id, email: user.email } : null
    } catch (error) {
      return null
    }
  }

  /**
   * Get browser context
   */
  getBrowserContext() {
    if (typeof window === 'undefined') return {}

    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
  }

  /**
   * Should we log this level?
   */
  shouldLog(level) {
    return LOG_LEVELS[level] <= LOG_LEVELS[CURRENT_LOG_LEVEL]
  }

  /**
   * Format log entry for console
   */
  formatConsoleLog(level, message, data) {
    const timestamp = new Date().toISOString()
    const emoji = {
      error: '❌',
      warn: '⚠️',
      info: 'ℹ️',
      debug: '🐛'
    }[level] || '📝'

    return {
      timestamp,
      emoji,
      level: level.toUpperCase(),
      message,
      data
    }
  }

  /**
   * Write log to console
   */
  logToConsole(level, message, data) {
    const formatted = this.formatConsoleLog(level, message, data)
    
    const style = {
      error: 'color: #ef4444; font-weight: bold',
      warn: 'color: #f59e0b; font-weight: bold',
      info: 'color: #3b82f6',
      debug: 'color: #6b7280'
    }[level] || ''

    console[level === 'debug' ? 'log' : level](
      `%c${formatted.emoji} [${formatted.level}] ${formatted.timestamp}`,
      style,
      message,
      data || ''
    )
  }

  /**
   * Write log to Supabase
   */
  async logToDatabase(level, message, data = {}) {
    if (!ENABLE_DB_LOGGING) return

    const supabase = this.getSupabase()
    if (!supabase) return

    try {
      const userContext = await this.getUserContext()
      const browserContext = this.getBrowserContext()

      const logEntry = {
        level,
        service: data.service || 'system',
        error_type: data.errorType || data.error_type,
        message,
        stack_trace: data.stack || data.stackTrace,
        error_code: data.code || data.errorCode,
        user_id: userContext?.userId,
        session_id: this.sessionId,
        request_context: {
          ...browserContext,
          requestId: this.requestId || this.generateId(),
          timestamp: new Date().toISOString()
        },
        metadata: {
          ...data,
          environment: process.env.NODE_ENV,
          version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
        }
      }

      const { error } = await supabase
        .from('error_logs')
        .insert([logEntry])

      if (error) {
        console.error('Failed to write log to database:', error)
      }
    } catch (error) {
      console.error('Error in logToDatabase:', error)
    }
  }

  /**
   * Main logging method
   */
  async log(level, message, data = {}) {
    if (!this.shouldLog(level)) return

    // Always log to console
    this.logToConsole(level, message, data)

    // Log to database for errors and warnings
    if (level === 'error' || level === 'warn') {
      await this.logToDatabase(level, message, data)
    }
  }

  /**
   * Public API
   */
  error(message, data = {}) {
    return this.log('error', message, { ...data, service: data.service || 'system' })
  }

  warn(message, data = {}) {
    return this.log('warn', message, { ...data, service: data.service || 'system' })
  }

  info(message, data = {}) {
    return this.log('info', message, data)
  }

  debug(message, data = {}) {
    return this.log('debug', message, data)
  }

  /**
   * Set request ID for tracking
   */
  setRequestId(id) {
    this.requestId = id
    return this
  }

  /**
   * Create child logger for specific service
   */
  child(service) {
    const childLogger = new Logger()
    childLogger.service = service
    childLogger.sessionId = this.sessionId
    return childLogger
  }

  /**
   * Log with automatic service context
   */
  async logWithService(level, message, data = {}) {
    return this.log(level, message, {
      ...data,
      service: this.service || data.service || 'system'
    })
  }

  // Convenience methods for child loggers
  errorWithService(message, data = {}) {
    return this.logWithService('error', message, data)
  }

  warnWithService(message, data = {}) {
    return this.logWithService('warn', message, data)
  }
}

// Create singleton instance
const logger = new Logger()

// Export for use throughout the app
export default logger

/**
 * Helper function to log caught errors
 * 
 * Usage:
 * try {
 *   // some code
 * } catch (error) {
 *   logError(error, { service: 'calendar', context: 'fetchEvents' })
 * }
 */
export function logError(error, additionalData = {}) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...additionalData
  }

  logger.error(error.message, errorData)
}

/**
 * Helper to create service-specific logger
 * 
 * Usage:
 * const calendarLogger = createServiceLogger('google-calendar')
 * calendarLogger.error('Token refresh failed')
 */
export function createServiceLogger(service) {
  return logger.child(service)
}

/**
 * Express/Next.js middleware for request logging
 * 
 * Usage in API route:
 * export async function GET(request) {
 *   const requestId = logRequest(request)
 *   // ... your code
 * }
 */
export function logRequest(request) {
  const requestId = logger.generateId()
  logger.setRequestId(requestId)

  logger.info('Request received', {
    requestId,
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers)
  })

  return requestId
}

/**
 * Log response
 */
export function logResponse(requestId, status, data = {}) {
  logger.info('Response sent', {
    requestId,
    status,
    ...data
  })
}