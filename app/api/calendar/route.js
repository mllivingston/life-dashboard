export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCalendarEvents } from '@/lib/google-calendar'

export async function GET(request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Google tokens from database
    const { data: tokenData, error } = await supabase
      .from('google_tokens')
      .select('access_token, refresh_token, expiry_date')
      .eq('user_id', user.id)
      .single()

    if (error || !tokenData) {
      return NextResponse.json({ error: 'Google account not connected' }, { status: 400 })
    }

    // Fetch calendar events
    const events = await getCalendarEvents(tokenData.access_token)

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 })
  }
}
