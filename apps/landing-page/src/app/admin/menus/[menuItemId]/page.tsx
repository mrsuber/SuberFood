'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { IngredientSelector } from '@/components/admin/IngredientSelector'

interface Restaurant {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
  restaurantId: string
}

interface MenuItem {
  id: string
  name: string
  categoryId: string
  description: string | null
  image: string | null
  images: string[]
  price: number
  salePrice: number | null
  preparationTime: number | null
  calories: number | null
  spiceLevel: number | null
  isAvailable: boolean
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  isKeto: boolean
  isHalal: boolean
  isKosher: boolean
  isChefRecommended: boolean
  isSeasonal: boolean
  isPopular: boolean
  allergens: string[]
  ingredients: string | null
  winePairing: string | null
  category: {
    id: string
    name: string
    restaurantId: string
    restaurant: {
      id: string
      name: string
    }
  }
  recipe?: {
    id: string
    ingredients: Array<{
      id: string
      quantity: number
      unit: string
      notes: string | null
      inventoryItem: {
        id: string
        name: string
        unit: string
      }
    }>
  }
}

interface SelectedIngredient {
  inventoryItemId: string
  name: string
  quantity: number
  unit: string
  notes?: string
}

export default function EditMenuItemPage() {
  const router = useRouter()
  const params = useParams()
  const menuItemId = params.menuItemId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState('')
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([])
  const [hasRecipe, setHasRecipe] = useState(false)

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
    // Fetch menu item, restaurants, and categories
    Promise.all([
      fetch(`/api/admin/menu/${menuItemId}`).then(r => r.json()),
      fetch('/api/admin/restaurants').then(r => r.json()),
      fetch('/api/admin/menu/categories').then(r => r.json()),
    ]).then(([menuItemData, restaurantsData, categoriesData]) => {
      if (menuItemData.success) {
        const item: MenuItem = menuItemData.menuItem
        setFormData({
          name: item.name,
          categoryId: item.categoryId,
          description: item.description || '',
          image: item.image || '',
          price: item.price.toString(),
          salePrice: item.salePrice?.toString() || '',
          preparationTime: item.preparationTime?.toString() || '',
          calories: item.calories?.toString() || '',
          spiceLevel: item.spiceLevel?.toString() || '',
          isAvailable: item.isAvailable,
          isVegetarian: item.isVegetarian,
          isVegan: item.isVegan,
          isGlutenFree: item.isGlutenFree,
          isKeto: item.isKeto,
          isHalal: item.isHalal,
          isKosher: item.isKosher,
          isChefRecommended: item.isChefRecommended,
          isSeasonal: item.isSeasonal,
          isPopular: item.isPopular,
          allergens: Array.isArray(item.allergens) ? item.allergens.join(', ') : '',
          ingredients: item.ingredients || '',
          winePairing: item.winePairing || '',
        })
        setSelectedRestaurant(item.category.restaurantId)
        setImagePreview(item.image || null)
        setGalleryImages(item.images || [])

        // Load recipe ingredients if they exist
        if (item.recipe && item.recipe.ingredients) {
          setHasRecipe(true)
          setSelectedIngredients(
            item.recipe.ingredients.map(ing => ({
              inventoryItemId: ing.inventoryItem.id,
              name: ing.inventoryItem.name,
              quantity: ing.quantity,
              unit: ing.unit,
              notes: ing.notes || '',
            }))
          )
        }
      }
      if (restaurantsData.success) {
        setRestaurants(restaurantsData.restaurants)
      }
      if (categoriesData.success) {
        setCategories(categoriesData.categories)
      }
      setLoading(false)
    }).catch(err => {
      console.error('Error fetching data:', err)
      setError('Failed to load menu item')
      setLoading(false)
    })
  }, [menuItemId])

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const result = await response.json()

      if (result.success && result.url) {
        setFormData(prev => ({ ...prev, image: result.url }))
        setImagePreview(result.url)
      } else {
        throw new Error('Upload failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
      console.error('Image upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: '' }))
    setImagePreview(null)
  }

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Validate all files
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) {
        setError('All files must be valid images')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be less than 5MB')
        return
      }
    }

    setUploadingGallery(true)
    setError(null)

    try {
      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', files[i])

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: uploadFormData,
        })

        if (!response.ok) {
          throw new Error('Failed to upload image')
        }

        const result = await response.json()
        if (result.success && result.url) {
          uploadedUrls.push(result.url)
        }
      }

      setGalleryImages(prev => [...prev, ...uploadedUrls])
    } catch (err) {
      setError('Failed to upload gallery images. Please try again.')
      console.error('Error uploading gallery images:', err)
    } finally {
      setUploadingGallery(false)
      // Reset the input
      e.target.value = ''
    }
  }

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    // Validate ingredients
    if (selectedIngredients.length === 0) {
      setError('Please add at least one ingredient from your inventory')
      return
    }

    // Validate all ingredients are selected
    const hasEmptyIngredient = selectedIngredients.some(ing => !ing.inventoryItemId || ing.quantity <= 0)
    if (hasEmptyIngredient) {
      setError('Please complete all ingredient selections and quantities')
      return
    }

    setSaving(true)

    try {
      // Step 1: Update menu item
      const response = await fetch(`/api/admin/menu/${menuItemId}`, {
        method: 'PUT',
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
          images: galleryImages,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update menu item')
      }

      // Step 2: Update or create recipe with ingredients
      const recipeMethod = hasRecipe ? 'PATCH' : 'POST'
      const recipeResponse = await fetch(`/api/admin/menu/${menuItemId}/recipe`, {
        method: recipeMethod,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          servingSize: 1,
          ingredients: selectedIngredients.map(ing => ({
            inventoryItemId: ing.inventoryItemId,
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ing.notes || '',
          })),
        }),
      })

      if (!recipeResponse.ok) {
        const data = await recipeResponse.json()
        throw new Error(data.error || 'Menu item updated but failed to update recipe')
      }

      setSuccessMessage('Menu item and recipe updated successfully!')
      setSaving(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update menu item')
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/menu/${menuItemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete menu item')
      }

      router.push('/admin/menus')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete menu item')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div>
        <AdminHeader title="Edit Menu Item" />
        <div className="p-8">
          <div className="text-center text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AdminHeader title="Edit Menu Item" />

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
                      Dish Image
                    </label>

                    {!imagePreview ? (
                      <div>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {uploading ? 'Uploading...' : 'Upload an image of this dish (max 5MB, optional)'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRemoveImage}
                          className="w-full"
                        >
                          Remove Image
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Gallery Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Images (Gallery)
                    </label>

                    <div className="space-y-3">
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryImageUpload}
                          disabled={uploadingGallery}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {uploadingGallery ? 'Uploading...' : 'Upload multiple images to show different views of the dish (max 5MB each, optional)'}
                        </p>
                      </div>

                      {/* Gallery Preview */}
                      {galleryImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {galleryImages.map((url, index) => (
                            <div key={index} className="relative group">
                              <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                                <img
                                  src={url}
                                  alt={`Gallery ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (FCFA) *
                      </label>
                      <input
                        type="number"
                        step="1"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="5000"
                      />
                      <p className="text-xs text-gray-500 mt-1">Central African CFA Franc (XAF)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sale Price (FCFA)
                      </label>
                      <input
                        type="number"
                        step="1"
                        name="salePrice"
                        value={formData.salePrice}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="4500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Discounted price (optional)</p>
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

              {/* Recipe Ingredients */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recipe Ingredients</h3>
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Important:</strong> Select ingredients from your kitchen inventory.
                    This ensures menu items only use tracked ingredients.
                  </p>
                </div>
                <IngredientSelector
                  value={selectedIngredients}
                  onChange={setSelectedIngredients}
                  restaurantId={selectedRestaurant}
                />
              </div>

              {/* Additional Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
                <div className="space-y-6">
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
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={deleting || saving}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleting ? 'Deleting...' : 'Delete Item'}
                </Button>
                <div className="flex items-center gap-4">
                  <Link href="/admin/menus">
                    <Button type="button" variant="outline" disabled={saving || deleting}>
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={saving || deleting}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
