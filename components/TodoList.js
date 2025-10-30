'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TodoList({ userId }) {
  const [todos, setTodos] = useState([])
  const [categories, setCategories] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingTodo, setEditingTodo] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (userId) {
      fetchCategories()
      fetchTodos()
    }
  }, [userId])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select(`
          *,
          category:categories(id, name, color)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTodos(data || [])
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (e) => {
    e.preventDefault()
    if (!newCategory.trim()) return

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          user_id: userId,
          name: newCategory.trim(),
          color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color
        }])
        .select()

      if (error) throw error
      setCategories([...categories, data[0]])
      setNewCategory('')
      setShowCategoryForm(false)
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Error adding category. It may already exist.')
    }
  }

  const updateCategory = async (id, newName) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ name: newName.trim() })
        .eq('id', id)

      if (error) throw error
      setCategories(categories.map(cat => 
        cat.id === id ? { ...cat, name: newName.trim() } : cat
      ))
      setEditingCategory(null)
      await fetchTodos() // Refresh todos to show updated category
    } catch (error) {
      console.error('Error updating category:', error)
      alert('Error updating category.')
    }
  }

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category? Todos will remain but become uncategorized.')) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      setCategories(categories.filter(cat => cat.id !== id))
      await fetchTodos() // Refresh todos
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const addTodo = async (e) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    try {
      const todoData = {
        user_id: userId,
        title: newTodo.trim(),
        completed: false,
        category_id: selectedCategory || null,
        due_date: dueDate || null
      }

      const { data, error } = await supabase
        .from('todos')
        .insert([todoData])
        .select(`
          *,
          category:categories(id, name, color)
        `)

      if (error) throw error
      setTodos([data[0], ...todos])
      setNewTodo('')
      setSelectedCategory('')
      setDueDate('')
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

  const updateTodo = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await fetchTodos() // Refresh to get updated category info
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  const toggleTodo = async (id, completed) => {
    await updateTodo(id, { completed: !completed })
  }

  const deleteTodo = async (id) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) throw error
      setTodos(todos.filter(todo => todo.id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const isOverdue = (dateString) => {
    if (!dateString) return false
    return new Date(dateString) < new Date()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">To-Do List</h2>
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">To-Do List</h2>
        <button
          onClick={() => setShowCategoryForm(!showCategoryForm)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showCategoryForm ? 'Hide' : 'Manage'} Categories
        </button>
      </div>

      {/* Category Management */}
      {showCategoryForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium mb-3">Categories</h3>
          
          <form onSubmit={addCategory} className="mb-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Add
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-2">
                {editingCategory === category.id ? (
                  <>
                    <input
                      type="text"
                      defaultValue={category.name}
                      onBlur={(e) => updateCategory(category.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateCategory(category.id, e.target.value)
                        } else if (e.key === 'Escape') {
                          setEditingCategory(null)
                        }
                      }}
                      autoFocus
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </>
                ) : (
                  <>
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="flex-1 text-sm">{category.name}</span>
                    <button
                      onClick={() => setEditingCategory(category.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-gray-500">No categories yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Add Todo Form */}
      <form onSubmit={addTodo} className="mb-4">
        <div className="space-y-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add
            </button>
          </div>
        </div>
      </form>

      {/* Todo List */}
      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id, todo.completed)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 flex-shrink-0"
            />
            
            <div className="flex-1 min-w-0">
              {editingTodo === todo.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    defaultValue={todo.title}
                    onBlur={(e) => {
                      updateTodo(todo.id, { title: e.target.value })
                      setEditingTodo(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateTodo(todo.id, { title: e.target.value })
                        setEditingTodo(null)
                      } else if (e.key === 'Escape') {
                        setEditingTodo(null)
                      }
                    }}
                    autoFocus
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <div className="flex gap-2">
                    <select
                      defaultValue={todo.category_id || ''}
                      onChange={(e) => updateTodo(todo.id, { category_id: e.target.value || null })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                      <option value="">No category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      defaultValue={todo.due_date || ''}
                      onChange={(e) => updateTodo(todo.id, { due_date: e.target.value || null })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <span
                    className={`block ${
                      todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}
                  >
                    {todo.title}
                  </span>
                  <div className="flex gap-2 mt-1">
                    {todo.category && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: todo.category.color + '20',
                          color: todo.category.color
                        }}
                      >
                        {todo.category.name}
                      </span>
                    )}
                    {todo.due_date && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isOverdue(todo.due_date) && !todo.completed
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        📅 {formatDate(todo.due_date)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setEditingTodo(editingTodo === todo.id ? null : todo.id)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {editingTodo === todo.id ? 'Done' : 'Edit'}
              </button>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {todos.length === 0 && (
        <p className="text-gray-500 text-center py-8">No tasks yet. Add one above!</p>
      )}
    </div>
  )
}
