export const dynamic = 'force-dynamic'


import { NextResponse } from 'next/server'
import { getOAuth2Client } from '@/lib/google-calendar'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  try {
    const oauth2Client = getOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)
    
    // Store tokens in Supabase
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Store or update Google tokens
    await supabase
      .from('google_tokens')
      .upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        updated_at: new Date().toISOString(),
      })

    return NextResponse.redirect(new URL('/?google_connected=true', request.url))
  } catch (error) {
    console.error('Error during Google OAuth callback:', error)
    return NextResponse.redirect(new URL('/?error=oauth_failed', request.url))
  }
}
