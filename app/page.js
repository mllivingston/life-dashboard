'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Calendar from '@/components/Calendar'
import TodoList from '@/components/TodoList'
import GroceryList from '@/components/GroceryList'
import ErrorBoundary, { CalendarErrorFallback, ListErrorFallback } from '@/components/ErrorBoundary'
import logger from '@/lib/logger'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          logger.info('User loaded dashboard', { userId: user.id })
        }
      } catch (error) {
        logger.error('Failed to get user', {
          service: 'auth',
          error: error.message
        })
      } finally {
        setLoading(false)
      }
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    try {
      logger.info('User signing out', { userId: user?.id })
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      logger.error('Sign out failed', {
        service: 'auth',
        error: error.message
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Life Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section - Wrapped in Error Boundary */}
          <div className="lg:col-span-2">
            <ErrorBoundary 
              serviceName="Calendar" 
              fallback={CalendarErrorFallback}
            >
              <Calendar userId={user?.id} />
            </ErrorBoundary>
          </div>

          {/* Lists Section - Each wrapped in separate Error Boundaries */}
          <div className="space-y-6">
            <ErrorBoundary 
              serviceName="To-Do List"
              fallback={({ error, reset }) => (
                <ListErrorFallback listType="To-Do List" error={error} reset={reset} />
              )}
            >
              <TodoList userId={user?.id} />
            </ErrorBoundary>

            <ErrorBoundary 
              serviceName="Grocery List"
              fallback={({ error, reset }) => (
                <ListErrorFallback listType="Grocery List" error={error} reset={reset} />
              )}
            >
              <GroceryList userId={user?.id} />
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  )
}