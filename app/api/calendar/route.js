export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getValidGoogleToken } from '@/lib/google-token-refresh'

export async function GET(request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get valid token (automatically refreshes if needed)
    const accessToken = await getValidGoogleToken(user.id)

    // Set up Google Calendar API
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Get events for the next 7 days
    const timeMin = new Date()
    const timeMax = new Date()
    timeMax.setDate(timeMax.getDate() + 7)

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    })

    return NextResponse.json({
      events: response.data.items || [],
      connected: true
    })
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    
    // If it's still an auth error after refresh attempt, user needs to reconnect
    if (error.code === 401 || error.message?.includes('Invalid Credentials')) {
      return NextResponse.json({
        error: 'Calendar disconnected. Please reconnect your Google Calendar.',
        connected: false,
        needsReconnect: true
      }, { status: 401 })
    }

    return NextResponse.json({
      error: 'Failed to fetch calendar events',
      details: error.message
    }, { status: 500 })
  }
}