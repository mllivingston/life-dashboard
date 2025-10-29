/**
 * Health Check Endpoint
 * 
 * GET /api/health
 * 
 * Returns the health status of all services:
 * - Database (Supabase)
 * - Google Calendar connection
 * - Overall system status
 * 
 * Response format:
 * {
 *   status: "healthy" | "degraded" | "down",
 *   timestamp: "2024-01-01T00:00:00.000Z",
 *   services: {
 *     database: { status: "up", latency: 15, message: "Connected" },
 *     googleCalendar: { status: "down", message: "Token expired" }
 *   },
 *   metadata: {
 *     version: "1.0.0",
 *     environment: "production"
 *   }
 * }
 */
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request) {
  const startTime = Date.now()
  
  const services = {}
  let overallStatus = 'healthy'

  // ============================================
  // 1. CHECK DATABASE (SUPABASE)
  // ============================================
  try {
    const dbStart = Date.now()
    const supabase = await createServerSupabaseClient()
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('todos')
      .select('id')
      .limit(1)
    
    const dbLatency = Date.now() - dbStart

    if (error) {
      services.database = {
        status: 'down',
        latency: dbLatency,
        message: error.message,
        error: error.code
      }
      overallStatus = 'down'
    } else {
      services.database = {
        status: 'up',
        latency: dbLatency,
        message: 'Connected'
      }
    }
  } catch (error) {
    services.database = {
      status: 'down',
      message: error.message,
      error: 'CONNECTION_FAILED'
    }
    overallStatus = 'down'
  }

  // ============================================
  // 2. CHECK AUTHENTICATION
  // ============================================
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      services.authentication = {
        status: 'down',
        message: 'Authentication service unavailable',
        error: error.message
      }
      if (overallStatus === 'healthy') overallStatus = 'degraded'
    } else {
      services.authentication = {
        status: 'up',
        message: user ? 'User authenticated' : 'No user session',
        authenticated: !!user
      }
    }
  } catch (error) {
    services.authentication = {
      status: 'down',
      message: error.message
    }
    if (overallStatus === 'healthy') overallStatus = 'degraded'
  }

  // ============================================
  // 3. CHECK GOOGLE CALENDAR TOKEN (IF USER LOGGED IN)
  // ============================================
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: tokenData, error } = await supabase
        .from('google_tokens')
        .select('expiry_date, access_token')
        .eq('user_id', user.id)
        .single()

      if (error || !tokenData) {
        services.googleCalendar = {
          status: 'disconnected',
          message: 'Calendar not connected',
          connected: false
        }
      } else {
        const expiryDate = new Date(tokenData.expiry_date)
        const isExpired = expiryDate < new Date()
        const expiresInMinutes = Math.floor((expiryDate - new Date()) / 1000 / 60)

        if (isExpired) {
          services.googleCalendar = {
            status: 'expired',
            message: 'Token expired, needs refresh',
            connected: true,
            expired: true
          }
          if (overallStatus === 'healthy') overallStatus = 'degraded'
        } else if (expiresInMinutes < 5) {
          services.googleCalendar = {
            status: 'expiring',
            message: `Token expires in ${expiresInMinutes} minutes`,
            connected: true,
            expiresInMinutes
          }
        } else {
          services.googleCalendar = {
            status: 'up',
            message: 'Connected',
            connected: true,
            expiresInMinutes
          }
        }
      }
    } else {
      services.googleCalendar = {
        status: 'n/a',
        message: 'No user authenticated',
        connected: false
      }
    }
  } catch (error) {
    services.googleCalendar = {
      status: 'error',
      message: error.message,
      connected: false
    }
    if (overallStatus === 'healthy') overallStatus = 'degraded'
  }

  // ============================================
  // 4. SYSTEM CHECKS
  // ============================================
  services.system = {
    status: 'up',
    uptime: process.uptime ? Math.floor(process.uptime()) : 'unknown',
    memory: process.memoryUsage ? {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    } : 'unknown',
    platform: process.platform || 'unknown'
  }

  // ============================================
  // 5. BUILD RESPONSE
  // ============================================
  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    responseTime: Date.now() - startTime,
    services,
    metadata: {
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'unknown',
      region: process.env.VERCEL_REGION || 'unknown'
    }
  }

  // Set appropriate HTTP status code
  const statusCode = overallStatus === 'healthy' ? 200 
                   : overallStatus === 'degraded' ? 200 
                   : 503

  // Check if request is from browser (wants HTML) or API client (wants JSON)
  const acceptHeader = request.headers.get('accept') || ''
  const wantsHtml = acceptHeader.includes('text/html')

  if (wantsHtml) {
    // Return formatted HTML page
    return new Response(generateHealthHTML(response, statusCode), {
      status: statusCode,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }

  // Return JSON for API clients
  return NextResponse.json(response, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Type': 'application/json'
    }
  })
}

/**
 * Generate HTML for health check page
 */
function generateHealthHTML(data, statusCode) {
  const statusColor = data.status === 'healthy' ? '#10b981' 
                    : data.status === 'degraded' ? '#f59e0b' 
                    : '#ef4444'
  
  const statusEmoji = data.status === 'healthy' ? '✅' 
                     : data.status === 'degraded' ? '⚠️' 
                     : '❌'

  const servicesHTML = Object.entries(data.services).map(([name, service]) => {
    const serviceStatus = service.status === 'up' || service.status === 'connected' ? 'up' : 'down'
    const serviceColor = serviceStatus === 'up' ? '#10b981' : '#ef4444'
    const serviceEmoji = serviceStatus === 'up' ? '✅' : '❌'
    
    return `
      <div style="background: white; border-radius: 8px; padding: 16px; border-left: 4px solid ${serviceColor};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 600; text-transform: capitalize;">
            ${serviceEmoji} ${name.replace(/([A-Z])/g, ' $1').trim()}
          </h3>
          <span style="background: ${serviceColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
            ${service.status.toUpperCase()}
          </span>
        </div>
        <div style="font-size: 14px; color: #666;">
          ${service.message || 'No message'}
        </div>
        ${service.latency ? `<div style="font-size: 12px; color: #999; margin-top: 4px;">Latency: ${service.latency}ms</div>` : ''}
        ${service.expiresInMinutes ? `<div style="font-size: 12px; color: #999; margin-top: 4px;">Token expires in ${service.expiresInMinutes} minutes</div>` : ''}
        ${service.uptime ? `<div style="font-size: 12px; color: #999; margin-top: 4px;">Uptime: ${service.uptime}s</div>` : ''}
      </div>
    `
  }).join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Health Check - Life Dashboard</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      background: white;
      border-radius: 12px;
      padding: 32px;
      margin-bottom: 24px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: ${statusColor};
      color: white;
      padding: 12px 24px;
      border-radius: 24px;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    .timestamp {
      color: #666;
      font-size: 14px;
    }
    .metadata {
      display: flex;
      gap: 16px;
      margin-top: 16px;
      font-size: 14px;
      color: #666;
    }
    .metadata span {
      background: #f3f4f6;
      padding: 4px 12px;
      border-radius: 6px;
    }
    .services {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      color: white;
      font-size: 14px;
    }
    .refresh-btn {
      background: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      color: #667eea;
      margin-top: 16px;
      transition: transform 0.2s;
    }
    .refresh-btn:hover {
      transform: scale(1.05);
    }
    .json-toggle {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid white;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      margin-top: 16px;
    }
    .json-data {
      display: none;
      background: #1a1a1a;
      color: #00ff00;
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      white-space: pre;
    }
    .json-data.show {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="font-size: 32px; margin-bottom: 8px;">System Health Check</h1>
      <div class="status-badge">
        ${statusEmoji} ${data.status.toUpperCase()}
      </div>
      <div class="timestamp">
        Last checked: ${new Date(data.timestamp).toLocaleString()}
      </div>
      <div class="metadata">
        <span>⚡ Response: ${data.responseTime}ms</span>
        <span>🌍 Environment: ${data.metadata.environment}</span>
        <span>📦 Version: ${data.metadata.version}</span>
      </div>
      <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>
      <button class="json-toggle" onclick="toggleJSON()">{ } View Raw JSON</button>
      <div class="json-data" id="jsonData">${JSON.stringify(data, null, 2)}</div>
    </div>

    <div class="services">
      ${servicesHTML}
    </div>

    <div class="footer">
      <p>Life Dashboard Health Monitor</p>
      <p style="margin-top: 8px; font-size: 12px; opacity: 0.8;">
        Status Code: ${statusCode} | Auto-refresh every 30s
      </p>
    </div>
  </div>

  <script>
    function toggleJSON() {
      const jsonData = document.getElementById('jsonData');
      jsonData.classList.toggle('show');
    }

    // Auto-refresh every 30 seconds
    setTimeout(() => location.reload(), 30000);
  </script>
</body>
</html>
  `
}

/**
 * Helper endpoint for quick status check
 * GET /api/health/ping
 */
export async function HEAD(request) {
  return new NextResponse(null, { status: 200 })
}