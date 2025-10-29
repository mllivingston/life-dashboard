'use client'

/**
 * Error Boundary Component
 * 
 * Catches React errors in child components and:
 * 1. Prevents the entire app from crashing
 * 2. Shows a fallback UI
 * 3. Logs the error for debugging
 * 
 * Usage:
 * <ErrorBoundary fallback={<CustomError />} serviceName="calendar">
 *   <Calendar />
 * </ErrorBoundary>
 */

import React from 'react'
import logger from '@/lib/logger'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: null
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    const now = Date.now()
    const { lastErrorTime, errorCount } = this.state

    // Detect error loops (same error within 5 seconds)
    const isErrorLoop = lastErrorTime && (now - lastErrorTime) < 5000
    const newErrorCount = isErrorLoop ? errorCount + 1 : 1

    this.setState({
      error,
      errorInfo,
      errorCount: newErrorCount,
      lastErrorTime: now
    })

    // Log to our logging system
    logger.error('React component error caught by ErrorBoundary', {
      service: this.props.serviceName || 'unknown',
      errorType: 'REACT_ERROR',
      componentStack: errorInfo.componentStack,
      errorMessage: error.message,
      errorName: error.name,
      stack: error.stack,
      errorCount: newErrorCount,
      isErrorLoop
    })

    // If error loop detected, show critical error
    if (newErrorCount >= 3) {
      console.error('Error loop detected! Component crashing repeatedly.')
    }

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: null
    })
  }

  render() {
    if (this.state.hasError) {
      // Error loop detected - show critical warning
      if (this.state.errorCount >= 3) {
        return (
          <ErrorFallbackCritical
            serviceName={this.props.serviceName}
            error={this.state.error}
          />
        )
      }

      // Use custom fallback if provided
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({ error: this.state.error, reset: this.handleReset })
          : this.props.fallback
      }

      // Default fallback UI
      return (
        <ErrorFallbackDefault
          serviceName={this.props.serviceName}
          error={this.state.error}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Default Error Fallback Component
 */
function ErrorFallbackDefault({ serviceName, error, onReset }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {serviceName ? `${serviceName} temporarily unavailable` : 'Something went wrong'}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              {error?.message || 'An unexpected error occurred. Our team has been notified.'}
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={onReset}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Critical Error Fallback (for error loops)
 */
function ErrorFallbackCritical({ serviceName, error }) {
  return (
    <div className="bg-red-50 rounded-lg shadow p-6 border-2 border-red-600">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-base font-semibold text-red-900">
            Critical Error
          </h3>
          <div className="mt-2 text-sm text-red-800">
            <p className="font-medium">
              {serviceName || 'This component'} has crashed multiple times.
            </p>
            <p className="mt-2">
              Please refresh the page. If the problem persists, contact support.
            </p>
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-3">
                <summary className="cursor-pointer font-medium">Error details (dev only)</summary>
                <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto max-h-40">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Specialized Error Fallback for Calendar
 */
export function CalendarErrorFallback({ error, reset }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Calendar Unavailable</h3>
        <p className="mt-1 text-sm text-gray-500">
          Unable to load your calendar events right now.
        </p>
        <div className="mt-6">
          <button
            onClick={reset}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Specialized Error Fallback for Lists
 */
export function ListErrorFallback({ listType, error, reset }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {listType || 'List'} Unavailable
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Unable to load your {listType?.toLowerCase() || 'list'} right now.
        </p>
        <div className="mt-6">
          <button
            onClick={reset}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}