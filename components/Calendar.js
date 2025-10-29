'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import logger, { createServiceLogger } from '@/lib/logger'

// Create service-specific logger
const calendarLogger = createServiceLogger('google-calendar')

export default function Calendar({ userId }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    checkGoogleConnection()
  }, [userId])

  const checkGoogleConnection = async () => {
    try {
      calendarLogger.info('Checking Google Calendar connection')
      
      const { data, error } = await supabase
        .from('google_tokens')
        .select('access_token')
        .eq('user_id', userId)
        .single()

      if (data && !error) {
        setConnected(true)
        fetchCalendarEvents()
      } else {
        calendarLogger.info('Google Calendar not connected', { userId })
        setLoading(false)
      }
    } catch (err) {
      calendarLogger.error('Failed to check Google connection', {
        errorType: 'CONNECTION_CHECK_FAILED',
        error: err.message,
        userId
      })
      setLoading(false)
    }
  }

  const fetchCalendarEvents = async () => {
    try {
      calendarLogger.info('Fetching calendar events')
      
      const response = await fetch('/api/calendar')
      const data = await response.json()

      if (response.ok) {
        setEvents(data.events || [])
        setError(null)
        calendarLogger.info('Calendar events fetched successfully', { 
          eventCount: data.events?.length || 0 
        })
      } else {
        setError(data.error)
        calendarLogger.error('Failed to fetch calendar events', {
          errorType: 'API_ERROR',
          statusCode: response.status,
          error: data.error
        })
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch calendar events'
      setError(errorMessage)
      calendarLogger.error(errorMessage, {
        errorType: 'FETCH_ERROR',
        error: err.message,
        stack: err.stack
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConnectGoogle = async () => {
    try {
      calendarLogger.info('Initiating Google Calendar connection')
      
      const response = await fetch('/api/auth/google')
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        const errorMessage = 'Failed to generate Google auth URL'
        setError(errorMessage)
        calendarLogger.error(errorMessage, {
          errorType: 'AUTH_URL_GENERATION_FAILED'
        })
      }
    } catch (err) {
      const errorMessage = 'Failed to connect to Google'
      setError(errorMessage)
      calendarLogger.error(errorMessage, {
        errorType: 'CONNECTION_ERROR',
        error: err.message
      })
    }
  }

  const formatEventTime = (dateTime) => {
    if (!dateTime) return ''
    const date = new Date(dateTime)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const isToday = (dateTime) => {
    if (!dateTime) return false
    const eventDate = new Date(dateTime)
    const today = new Date()
    return eventDate.toDateString() === today.toDateString()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Calendar</h2>
        <p className="text-gray-500">Loading calendar...</p>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Google Calendar</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Connect your Google Calendar to view your events</p>
          <button
            onClick={handleConnectGoogle}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Connect Google Calendar
          </button>
        </div>
      </div>
    )
  }

  const todayEvents = events.filter(event => isToday(event.start?.dateTime || event.start?.date))
  const upcomingEvents = events.filter(event => !isToday(event.start?.dateTime || event.start?.date))

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Google Calendar</h2>
        <button
          onClick={fetchCalendarEvents}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Today's Events */}
      {todayEvents.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Today</h3>
          <div className="space-y-3">
            {todayEvents.map((event) => (
              <div key={event.id} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
                <div className="font-medium text-gray-900">{event.summary}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {formatEventTime(event.start?.dateTime || event.start?.date)}
                </div>
                {event.location && (
                  <div className="text-sm text-gray-500 mt-1">📍 {event.location}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">This Week</h3>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-4 border border-gray-200 rounded hover:bg-gray-50">
                <div className="font-medium text-gray-900">{event.summary}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {formatEventTime(event.start?.dateTime || event.start?.date)}
                </div>
                {event.location && (
                  <div className="text-sm text-gray-500 mt-1">📍 {event.location}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <p className="text-gray-500 text-center py-8">No events in the next 7 days</p>
      )}
    </div>
  )
}