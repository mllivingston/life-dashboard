'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GroceryList({ userId }) {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchItems()
  }, [userId])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('grocery_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching grocery items:', error)
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (e) => {
    e.preventDefault()
    if (!newItem.trim()) return

    try {
      const { data, error } = await supabase
        .from('grocery_items')
        .insert([
          {
            user_id: userId,
            name: newItem,
            purchased: false,
          },
        ])
        .select()

      if (error) throw error
      setItems([data[0], ...items])
      setNewItem('')
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  const toggleItem = async (id, purchased) => {
    try {
      const { error } = await supabase
        .from('grocery_items')
        .update({ purchased: !purchased })
        .eq('id', id)

      if (error) throw error
      setItems(items.map(item => 
        item.id === id ? { ...item, purchased: !purchased } : item
      ))
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  const deleteItem = async (id) => {
    try {
      const { error } = await supabase
        .from('grocery_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      setItems(items.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Grocery List</h2>
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Grocery List</h2>

      <form onSubmit={addItem} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add grocery item..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Add
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={item.purchased}
              onChange={() => toggleItem(item.id, item.purchased)}
              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
            <span
              className={`flex-1 ${
                item.purchased ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {item.name}
            </span>
            <button
              onClick={() => deleteItem(item.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-gray-500 text-center py-8">No items yet. Add one above!</p>
      )}
    </div>
  )
}
