/**
 * Google Token Refresh Utility
 * Automatically refreshes expired Google OAuth tokens
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Refresh an expired Google access token
 * @param {string} userId - User ID
 * @param {string} refreshToken - Google refresh token
 * @returns {Promise<{accessToken: string, expiryDate: Date}>}
 */
export async function refreshGoogleToken(userId, refreshToken) {
  const tokenEndpoint = 'https://oauth2.googleapis.com/token'
  
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  })

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Token refresh failed: ${error.error_description || error.error}`)
    }

    const data = await response.json()
    
    // Calculate expiry date (tokens typically last 1 hour)
    const expiryDate = new Date()
    expiryDate.setSeconds(expiryDate.getSeconds() + data.expires_in)

    // Update database with new token
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('google_tokens')
      .update({
        access_token: data.access_token,
        expiry_date: expiryDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (updateError) {
      throw new Error(`Failed to update token in database: ${updateError.message}`)
    }

    return {
      accessToken: data.access_token,
      expiryDate
    }
  } catch (error) {
    console.error('Error refreshing Google token:', error)
    throw error
  }
}

/**
 * Get a valid Google access token (refreshes if needed)
 * @param {string} userId - User ID
 * @returns {Promise<string>} Valid access token
 */
export async function getValidGoogleToken(userId) {
  const supabase = createClient()
  
  // Get current token from database
  const { data: tokenData, error } = await supabase
    .from('google_tokens')
    .select('access_token, refresh_token, expiry_date')
    .eq('user_id', userId)
    .single()

  if (error || !tokenData) {
    throw new Error('No Google token found. Please reconnect your calendar.')
  }

  // Check if token is expired or about to expire (within 5 minutes)
  const expiryDate = new Date(tokenData.expiry_date)
  const now = new Date()
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

  if (expiryDate <= fiveMinutesFromNow) {
    // Token is expired or expiring soon - refresh it
    console.log('Token expired or expiring soon, refreshing...')
    const refreshed = await refreshGoogleToken(userId, tokenData.refresh_token)
    return refreshed.accessToken
  }

  // Token is still valid
  return tokenData.access_token
}