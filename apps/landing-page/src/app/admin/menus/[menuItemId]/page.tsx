'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
} from 'lucide-react'
import Image from 'next/image'

type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  salePrice: number | null
  image: string | null
  gallery: string[]
  isAvailable: boolean
  category: {
    id: string
    name: string
  }
  recipe: {
    id: string
    name: string
    servingSize: number
    prepTime: number | null
    cookTime: number | null
    instructions: string | null
    ingredients: Array<{
      id: string
      inventoryItemId: string
      quantity: number
      unit: string
      notes: string | null
      inventoryItem: {
        id: string
        name: string
        unit: string
        rawStock: number
        wipStock: number
        isCompound: boolean
      }
    }>
  } | null
}

type InventoryItem = {
  id: string
  name: string
  category: string
  unit: string
  rawStock: number
  wipStock: number
  isCompound: boolean
}

export default function DishManagementPage() {
  const params = useParams()
  const router = useRouter()
  const menuItemId = params.menuItemId as string

  const [menuItem, setMenuItem] = useState<MenuItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('details')

  // Form states
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(0)
  const [salePrice, setSalePrice] = useState<number | null>(null)
  const [image, setImage] = useState<string | null>(null)
  const [gallery, setGallery] = useState<string[]>([])
  const [isAvailable, setIsAvailable] = useState(true)

  // Recipe states
  const [recipeName, setRecipeName] = useState('')
  const [servingSize, setServingSize] = useState(1)
  const [prepTime, setPrepTime] = useState<number | null>(null)
  const [cookTime, setCookTime] = useState<number | null>(null)
  const [instructions, setInstructions] = useState('')
  const [recipeIngredients, setRecipeIngredients] = useState<Array<{
    inventoryItemId: string
    quantity: number
    unit: string
    notes: string
  }>>([])

  // Available inventory items
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])

  // Availability check
  const [availabilityStatus, setAvailabilityStatus] = useState<any>(null)

  useEffect(() => {
    fetchMenuItem()
    fetchInventoryItems()
  }, [menuItemId])

  const fetchMenuItem = async () => {
    try {
      const response = await fetch(`/api/admin/menu/${menuItemId}`)
      const data = await response.json()

      if (data.success) {
        const item = data.data
        setMenuItem(item)

        // Set form values
        setName(item.name)
        setDescription(item.description || '')
        setPrice(item.price)
        setSalePrice(item.salePrice)
        setImage(item.image)
        setGallery(item.gallery || [])
        setIsAvailable(item.isAvailable)

        // Set recipe values if exists
        if (item.recipe) {
          setRecipeName(item.recipe.name)
          setServingSize(item.recipe.servingSize)
          setPrepTime(item.recipe.prepTime)
          setCookTime(item.recipe.cookTime)
          setInstructions(item.recipe.instructions || '')
          setRecipeIngredients(
            item.recipe.ingredients.map((ing: any) => ({
              inventoryItemId: ing.inventoryItemId,
              quantity: ing.quantity,
              unit: ing.unit,
              notes: ing.notes || '',
            }))
          )

          // Fetch availability status
          fetchAvailability(item.recipe.id)
        }
      }
    } catch (error) {
      console.error('Error fetching menu item:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch('/api/inventory/items')
      const data = await response.json()
      if (data.success) {
        setInventoryItems(data.data)
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error)
    }
  }

  const fetchAvailability = async (recipeId: string) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/availability`)
      const data = await response.json()
      if (data.success) {
        setAvailabilityStatus(data.data)
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
    }
  }

  const handleSaveDetails = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/menu/${menuItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price,
          salePrice,
          image,
          gallery,
          isAvailable,
        }),
      })

      if (response.ok) {
        alert('Dish details saved successfully!')
        fetchMenuItem()
      }
    } catch (error) {
      console.error('Error saving dish details:', error)
      alert('Failed to save dish details')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveRecipe = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/menu/${menuItemId}/recipe`, {
        method: menuItem?.recipe ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: recipeName,
          servingSize,
          prepTime,
          cookTime,
          instructions,
          ingredients: recipeIngredients,
        }),
      })

      if (response.ok) {
        alert('Recipe saved successfully!')
        fetchMenuItem()
      }
    } catch (error) {
      console.error('Error saving recipe:', error)
      alert('Failed to save recipe')
    } finally {
      setSaving(false)
    }
  }

  const addIngredient = () => {
    setRecipeIngredients([
      ...recipeIngredients,
      { inventoryItemId: '', quantity: 0, unit: '', notes: '' },
    ])
  }

  const removeIngredient = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...recipeIngredients]
    updated[index] = { ...updated[index], [field]: value }
    setRecipeIngredients(updated)
  }

  const addToGallery = (url: string) => {
    if (url && !gallery.includes(url)) {
      setGallery([...gallery, url])
    }
  }

  const removeFromGallery = (url: string) => {
    setGallery(gallery.filter((img) => img !== url))
  }

  if (loading) {
    return (
      <div>
        <AdminHeader title="Loading..." />
        <div className="p-8 text-center">Loading dish details...</div>
      </div>
    )
  }

  if (!menuItem) {
    return (
      <div>
        <AdminHeader title="Not Found" />
        <div className="p-8 text-center">Dish not found</div>
      </div>
    )
  }

  return (
    <div>
      <AdminHeader title={`Manage: ${menuItem.name}`} />

      <div className="p-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </Button>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details">Dish Details</TabsTrigger>
            <TabsTrigger value="recipe">Recipe & Ingredients</TabsTrigger>
            <TabsTrigger value="availability">Availability Status</TabsTrigger>
          </TabsList>

          {/* Dish Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Dish Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Dish Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price ($)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Sale Price ($)</label>
                    <input
                      type="number"
                      value={salePrice || ''}
                      onChange={(e) => setSalePrice(e.target.value ? Number(e.target.value) : null)}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Main Image */}
                <div>
                  <label className="block text-sm font-medium mb-2">Main Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={image || ''}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  {image && (
                    <div className="mt-4 relative w-full h-64">
                      <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Gallery */}
                <div>
                  <label className="block text-sm font-medium mb-2">Image Gallery</label>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      id="gallery-input"
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById('gallery-input') as HTMLInputElement
                        addToGallery(input.value)
                        input.value = ''
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Gallery
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {gallery.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <div className="relative w-full h-32">
                          <Image
                            src={url}
                            alt={`Gallery image`}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <button
                          onClick={() => removeFromGallery(url)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability Toggle */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Available on public menu</span>
                  </label>
                </div>

                <Button onClick={handleSaveDetails} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Dish Details'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recipe Tab */}
          <TabsContent value="recipe">
            <Card>
              <CardHeader>
                <CardTitle>Recipe & Ingredients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recipe Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Recipe Name</label>
                  <input
                    type="text"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Serving Size and Times */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Serving Size</label>
                    <input
                      type="number"
                      value={servingSize}
                      onChange={(e) => setServingSize(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Prep Time (min)</label>
                    <input
                      type="number"
                      value={prepTime || ''}
                      onChange={(e) => setPrepTime(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cook Time (min)</label>
                    <input
                      type="number"
                      value={cookTime || ''}
                      onChange={(e) => setCookTime(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium">Ingredients</label>
                    <Button variant="outline" size="sm" onClick={addIngredient}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Ingredient
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {recipeIngredients.map((ingredient, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <select
                          value={ingredient.inventoryItemId}
                          onChange={(e) => {
                            const item = inventoryItems.find((i) => i.id === e.target.value)
                            updateIngredient(idx, 'inventoryItemId', e.target.value)
                            if (item) {
                              updateIngredient(idx, 'unit', item.unit)
                            }
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select ingredient...</option>
                          {inventoryItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} ({item.rawStock} {item.unit} available)
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredient(idx, 'quantity', Number(e.target.value))}
                          placeholder="Quantity"
                          step="0.01"
                          className="w-24 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={ingredient.unit}
                          onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                          placeholder="Unit"
                          className="w-24 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={ingredient.notes}
                          onChange={(e) => updateIngredient(idx, 'notes', e.target.value)}
                          placeholder="Notes (optional)"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIngredient(idx)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium mb-2">Cooking Instructions</label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={8}
                    placeholder="1. Step one"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                </div>

                <Button onClick={handleSaveRecipe} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Recipe'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Availability Status</CardTitle>
              </CardHeader>
              <CardContent>
                {!menuItem.recipe ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No recipe configured for this dish</p>
                    <p className="text-sm text-gray-500">
                      Create a recipe in the Recipe tab to enable inventory tracking.
                    </p>
                  </div>
                ) : availabilityStatus ? (
                  <div className="space-y-6">
                    {/* Overall Status */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">Current Status</h3>
                          <p className="text-sm text-gray-600">Based on current inventory levels</p>
                        </div>
                        <div>
                          {availabilityStatus.available ? (
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                              <CheckCircle className="w-5 h-5" />
                              In Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold">
                              <XCircle className="w-5 h-5" />
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Max Servings Available</p>
                          <p className="text-3xl font-bold text-gray-900">{availabilityStatus.maxServings}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Recipe Serving Size</p>
                          <p className="text-3xl font-bold text-gray-900">{menuItem.recipe.servingSize}</p>
                        </div>
                      </div>
                    </div>

                    {/* Missing Ingredients */}
                    {availabilityStatus.missing && availabilityStatus.missing.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <h3 className="text-lg font-semibold">Missing Ingredients</h3>
                        </div>
                        <div className="space-y-2">
                          {availabilityStatus.missing.map((item: any, idx: number) => (
                            <div key={idx} className="bg-red-50 p-4 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">{item.name}</p>
                                  <p className="text-sm text-gray-600">
                                    Need: {item.need} {item.unit} | Have: {item.have} {item.unit}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-red-600 font-semibold">
                                    Short by {(item.need - item.have).toFixed(2)} {item.unit}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All Ingredients Status */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">All Ingredients</h3>
                      <div className="space-y-2">
                        {menuItem.recipe.ingredients.map((ingredient) => {
                          const available = ingredient.inventoryItem.isCompound
                            ? ingredient.inventoryItem.wipStock
                            : ingredient.inventoryItem.rawStock
                          const sufficient = available >= ingredient.quantity

                          return (
                            <div
                              key={ingredient.id}
                              className={`p-4 rounded-lg ${
                                sufficient ? 'bg-green-50' : 'bg-yellow-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {ingredient.inventoryItem.name}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Required: {ingredient.quantity} {ingredient.unit}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold">
                                    Available: {available} {ingredient.unit}
                                  </p>
                                  {sufficient ? (
                                    <span className="text-xs text-green-600">✓ Sufficient</span>
                                  ) : (
                                    <span className="text-xs text-red-600">✗ Insufficient</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">Loading availability status...</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
