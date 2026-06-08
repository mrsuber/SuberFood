'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Suspense } from 'react'

interface Restaurant {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
  restaurantId: string
}

function NewMenuItemForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedLocationId = searchParams.get('location')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(preselectedLocationId || '')
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    image: '',
    price: '',
    salePrice: '',
    preparationTime: '',
    calories: '',
    spiceLevel: '',
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isKeto: false,
    isHalal: false,
    isKosher: false,
    isChefRecommended: false,
    isSeasonal: false,
    isPopular: false,
    allergens: '',
    ingredients: '',
    winePairing: '',
  })

  useEffect(() => {
    // Fetch restaurants and categories
    Promise.all([
      fetch('/api/admin/restaurants').then(r => r.json()),
      fetch('/api/admin/menu/categories').then(r => r.json()),
    ]).then(([restaurantsData, categoriesData]) => {
      if (restaurantsData.success) {
        setRestaurants(restaurantsData.restaurants)
      }
      if (categoriesData.success) {
        setCategories(categoriesData.categories)
      }
    }).catch(err => {
      console.error('Error fetching data:', err)
      setError('Failed to load restaurants and categories')
    })
  }, [])

  useEffect(() => {
    if (selectedRestaurant) {
      setFilteredCategories(categories.filter(c => c.restaurantId === selectedRestaurant))
    } else {
      setFilteredCategories([])
    }
  }, [selectedRestaurant, categories])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleRestaurantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRestaurant(e.target.value)
    setFormData(prev => ({ ...prev, categoryId: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setSaving(true)

    try {
      const response = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
          preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : null,
          calories: formData.calories ? parseInt(formData.calories) : null,
          spiceLevel: formData.spiceLevel ? parseInt(formData.spiceLevel) : null,
          allergens: formData.allergens ? formData.allergens.split(',').map(a => a.trim()) : [],
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create menu item')
      }

      const data = await response.json()
      setSuccessMessage('Menu item created successfully!')

      setTimeout(() => {
        // Redirect back to menu page, preserving location filter if present
        const redirectUrl = preselectedLocationId
          ? `/admin/menus?location=${preselectedLocationId}`
          : '/admin/menus'
        router.push(redirectUrl)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create menu item')
      setSaving(false)
    }
  }

  return (
    <div>
      <AdminHeader title="Add New Menu Item" />

      <div className="p-8 max-w-4xl">
        <Link href="/admin/menus">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
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
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Location & Category Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Restaurant Location *
                    </label>
                    <select
                      value={selectedRestaurant}
                      onChange={handleRestaurantChange}
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
                      Menu Category *
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      required
                      disabled={!selectedRestaurant}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                    >
                      <option value="">Select a category</option>
                      {filteredCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {!selectedRestaurant && (
                      <p className="text-xs text-gray-500 mt-1">Select a location first</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dish Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Grilled Herb Chicken"
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
                      placeholder="Describe the dish..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="https://example.com/dish-image.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Paste a URL to an image of this dish (optional)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="24.99"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sale Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="salePrice"
                        value={formData.salePrice}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="19.99"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prep Time (min)
                      </label>
                      <input
                        type="number"
                        name="preparationTime"
                        value={formData.preparationTime}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="25"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Nutritional Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutritional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calories
                    </label>
                    <input
                      type="number"
                      name="calories"
                      value={formData.calories}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="450"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spice Level (0-5)
                    </label>
                    <input
                      type="number"
                      name="spiceLevel"
                      value={formData.spiceLevel}
                      onChange={handleInputChange}
                      min="0"
                      max="5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergens (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="allergens"
                      value={formData.allergens}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="dairy, nuts, shellfish"
                    />
                  </div>
                </div>
              </div>

              {/* Dietary Tags */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dietary Tags</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'isVegetarian', label: 'Vegetarian' },
                    { name: 'isVegan', label: 'Vegan' },
                    { name: 'isGlutenFree', label: 'Gluten-Free' },
                    { name: 'isKeto', label: 'Keto' },
                    { name: 'isHalal', label: 'Halal' },
                    { name: 'isKosher', label: 'Kosher' },
                  ].map(({ name, label }) => (
                    <label key={name} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name={name}
                        checked={formData[name as keyof typeof formData] as boolean}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Tags */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Tags</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { name: 'isChefRecommended', label: "Chef's Recommendation" },
                    { name: 'isSeasonal', label: 'Seasonal' },
                    { name: 'isPopular', label: 'Popular' },
                    { name: 'isAvailable', label: 'Available Now' },
                  ].map(({ name, label }) => (
                    <label key={name} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name={name}
                        checked={formData[name as keyof typeof formData] as boolean}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ingredients
                    </label>
                    <textarea
                      name="ingredients"
                      value={formData.ingredients}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Chicken breast, olive oil, fresh basil..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wine Pairing Suggestion
                    </label>
                    <input
                      type="text"
                      name="winePairing"
                      value={formData.winePairing}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Pairs well with Chardonnay"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <Link href="/admin/menus">
                  <Button type="button" variant="outline" disabled={saving}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Menu Item'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function NewMenuItemPage() {
  return (
    <Suspense fallback={
      <div>
        <AdminHeader title="Add New Menu Item" />
        <div className="p-8">
          <div className="text-center text-gray-600">Loading...</div>
        </div>
      </div>
    }>
      <NewMenuItemForm />
    </Suspense>
  )
}
