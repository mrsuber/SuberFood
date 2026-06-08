'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

interface Restaurant {
  id: string
  name: string
}

function NewCategoryForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedRestaurantId = searchParams.get('restaurantId')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])

  const [formData, setFormData] = useState({
    name: '',
    restaurantId: preselectedRestaurantId || '',
    description: '',
    isActive: true,
  })

  useEffect(() => {
    // Fetch restaurants
    fetch('/api/admin/restaurants')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setRestaurants(data.restaurants)
        }
      })
      .catch(err => {
        console.error('Error fetching restaurants:', err)
        setError('Failed to load restaurants')
      })
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setSaving(true)

    try {
      const response = await fetch('/api/admin/menu/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create category')
      }

      const data = await response.json()
      setSuccessMessage('Category created successfully!')

      setTimeout(() => {
        router.push('/admin/menus/categories')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
      setSaving(false)
    }
  }

  return (
    <div>
      <AdminHeader title="Add New Category" />

      <div className="p-8 max-w-2xl">
        <Link href="/admin/menus/categories">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
        </Link>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {successMessage}
          </div>
        )}

        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Location *
                </label>
                <select
                  name="restaurantId"
                  value={formData.restaurantId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select a location</option>
                  {restaurants.map(restaurant => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Appetizers, Main Courses, Desserts"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Brief description of this category..."
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active (visible to customers)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <Link href="/admin/menus/categories">
                  <Button type="button" variant="outline" disabled={saving}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Category'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function NewCategoryPage() {
  return (
    <Suspense fallback={
      <div>
        <AdminHeader title="Add New Category" />
        <div className="p-8">
          <div className="text-center text-gray-600">Loading...</div>
        </div>
      </div>
    }>
      <NewCategoryForm />
    </Suspense>
  )
}
