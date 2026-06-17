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

interface Recipe {
  id: string
  name: string
  menuItemName: string
  instructions?: string
  prepTime?: number
  ingredients?: Array<{
    inventoryItemId: string
    inventoryItem: {
      name: string
      unit: string
    }
    quantity: number
    unit: string
    notes?: string
  }>
}

interface SelectedIngredient {
  inventoryItemId: string
  name: string
  quantity: number
  unit: string
  notes?: string
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
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(preselectedLocationId || '')
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [loadingRecipe, setLoadingRecipe] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    recipeId: '',
    description: '',
    image: '',
    price: '',
    salePrice: '',
    preparationTime: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sodium: '',
    sugar: '',
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
    // Fetch restaurants, categories, and recipes
    Promise.all([
      fetch('/api/admin/restaurants').then(r => r.json()),
      fetch('/api/admin/menu/categories').then(r => r.json()),
      fetch('/api/admin/recipes').then(r => r.json()),
    ]).then(([restaurantsData, categoriesData, recipesData]) => {
      if (restaurantsData.success) {
        setRestaurants(restaurantsData.restaurants)
      }
      if (categoriesData.success) {
        setCategories(categoriesData.categories)
      }
      if (recipesData.success) {
        setRecipes(recipesData.data)
      }
    }).catch(err => {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
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

  const handleRecipeSelection = async (recipeId: string) => {
    if (!recipeId) {
      setSelectedRecipe(null)
      setFormData(prev => ({ ...prev, name: '', recipeId: '', preparationTime: '' }))
      setSelectedIngredients([])
      return
    }

    setLoadingRecipe(true)
    setError(null)

    try {
      // Fetch full recipe details including ingredients
      const response = await fetch(`/api/admin/recipes?id=${recipeId}`)
      if (!response.ok) throw new Error('Failed to fetch recipe details')

      const data = await response.json()
      if (!data.success || !data.data || data.data.length === 0) {
        throw new Error('Recipe not found')
      }

      const recipe = data.data.find((r: Recipe) => r.id === recipeId)
      if (!recipe) throw new Error('Recipe not found')

      setSelectedRecipe(recipe)

      // Auto-fill form with recipe data
      setFormData(prev => ({
        ...prev,
        name: recipe.name,
        recipeId: recipe.id,
        preparationTime: recipe.prepTime?.toString() || '',
      }))

      // Set ingredients from recipe (for display purposes)
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        const formattedIngredients = recipe.ingredients.map(ing => ({
          inventoryItemId: ing.inventoryItemId,
          name: ing.inventoryItem.name,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes,
        }))
        setSelectedIngredients(formattedIngredients)
      }
    } catch (err) {
      console.error('Error loading recipe:', err)
      setError('Failed to load recipe details. Please try again.')
      setSelectedRecipe(null)
    } finally {
      setLoadingRecipe(false)
    }
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

    // Validate recipe is selected
    if (!formData.recipeId || !selectedRecipe) {
      setError('Please select a recipe from the dropdown')
      return
    }

    setSaving(true)

    try {
      // Build nutrition info object
      const nutritionInfo = (formData.protein || formData.carbs || formData.fat || formData.fiber || formData.sodium || formData.sugar) ? {
        protein: formData.protein || null,
        carbs: formData.carbs || null,
        fat: formData.fat || null,
        fiber: formData.fiber || null,
        sodium: formData.sodium || null,
        sugar: formData.sugar || null,
      } : null

      // Step 1: Create menu item
      const menuResponse = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          categoryId: formData.categoryId,
          description: formData.description,
          image: formData.image,
          images: galleryImages,
          price: parseFloat(formData.price),
          salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
          preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : null,
          calories: formData.calories ? parseInt(formData.calories) : null,
          nutritionInfo,
          spiceLevel: formData.spiceLevel ? parseInt(formData.spiceLevel) : null,
          allergens: formData.allergens ? formData.allergens.split(',').map(a => a.trim()) : [],
          isAvailable: formData.isAvailable,
          isVegetarian: formData.isVegetarian,
          isVegan: formData.isVegan,
          isGlutenFree: formData.isGlutenFree,
          isKeto: formData.isKeto,
          isHalal: formData.isHalal,
          isKosher: formData.isKosher,
          isChefRecommended: formData.isChefRecommended,
          isSeasonal: formData.isSeasonal,
          isPopular: formData.isPopular,
          winePairing: formData.winePairing,
        }),
      })

      if (!menuResponse.ok) {
        const data = await menuResponse.json()
        throw new Error(data.error || 'Failed to create menu item')
      }

      const menuData = await menuResponse.json()
      const menuItemId = menuData.menuItem.id

      // Step 2: Create recipe with ingredients from selected recipe (as a template)
      const recipeResponse = await fetch(`/api/admin/menu/${menuItemId}/recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          servingSize: 1,
          instructions: selectedRecipe?.instructions || '',
          prepTime: selectedRecipe?.prepTime || null,
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
        throw new Error(data.error || 'Menu item created but failed to add recipe. Please add ingredients manually.')
      }

      setSuccessMessage('Menu item created successfully!')

      setTimeout(() => {
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
              {/* Recipe Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Recipe</h3>
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Important:</strong> Select an existing recipe from your kitchen.
                    The dish name, ingredients, and cooking procedure will be automatically filled from the recipe.
                    You only need to add menu-specific details like pricing, category, and images.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipe *
                  </label>
                  <select
                    value={formData.recipeId}
                    onChange={(e) => handleRecipeSelection(e.target.value)}
                    required
                    disabled={loadingRecipe}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                  >
                    <option value="">Select a recipe</option>
                    {recipes.map(recipe => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </option>
                    ))}
                  </select>
                  {loadingRecipe && (
                    <p className="text-xs text-blue-600 mt-1">Loading recipe details...</p>
                  )}
                </div>

                {/* Show recipe ingredients when loaded */}
                {selectedRecipe && selectedIngredients.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Recipe Ingredients:</h4>
                    <ul className="space-y-2">
                      {selectedIngredients.map((ing, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          {ing.name} - {ing.quantity} {ing.unit}
                          {ing.notes && <span className="text-gray-500">({ing.notes})</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Show cooking procedure when loaded */}
                {selectedRecipe && selectedRecipe.instructions && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Cooking Procedure:</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedRecipe.instructions}</p>
                  </div>
                )}
              </div>

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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Menu Item Details</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dish Name (from recipe) *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      readOnly
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      placeholder="Select a recipe first"
                    />
                    <p className="text-xs text-gray-500 mt-1">The dish name is automatically filled from the selected recipe</p>
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
                <p className="text-sm text-gray-600 mb-4">Enter nutrition information per serving</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      Protein (g)
                    </label>
                    <input
                      type="text"
                      name="protein"
                      value={formData.protein}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="28"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carbs (g)
                    </label>
                    <input
                      type="text"
                      name="carbs"
                      value={formData.carbs}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="42"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fat (g)
                    </label>
                    <input
                      type="text"
                      name="fat"
                      value={formData.fat}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="18"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fiber (g)
                    </label>
                    <input
                      type="text"
                      name="fiber"
                      value={formData.fiber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="6"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sodium (mg)
                    </label>
                    <input
                      type="text"
                      name="sodium"
                      value={formData.sodium}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="680"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sugar (g)
                    </label>
                    <input
                      type="text"
                      name="sugar"
                      value={formData.sugar}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="8"
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

                  <div className="md:col-span-3">
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
