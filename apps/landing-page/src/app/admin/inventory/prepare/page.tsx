'use client'

import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ChefHat,
  Package,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Thermometer,
  Loader2,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type IngredientInput = {
  id: string
  name: string
  quantity: number
  unit: string
  available: number
  notes?: string
  status: 'ok' | 'low' | 'out'
}

type PreparationRecipe = {
  id: string
  name: string
  outputQuantity: number
  outputUnit: string
  prepTime: number
  shelfLifeDays: number
  instructions: string
  storageLocation: string
  currentStock: number
  wipStock: number
  inputs: IngredientInput[]
  canPrepare: boolean
  maxBatches: number
}

export default function PreparePage() {
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null)
  const [batchQuantity, setBatchQuantity] = useState(1)
  const [recipes, setRecipes] = useState<PreparationRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [preparing, setPreparing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch preparation recipes from API
  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/inventory/prepare')
      const result = await response.json()

      if (result.success) {
        setRecipes(result.data)
      } else {
        setError(result.error || 'Failed to load recipes')
      }
    } catch (err) {
      setError('Failed to connect to server')
      console.error('Error fetching recipes:', err)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for fallback - will be replaced with API
  const mockRecipes: PreparationRecipe[] = [
    {
      id: '1',
      name: 'Pre-boiled Salted Beans',
      outputQuantity: 2.5,
      outputUnit: 'KG',
      prepTime: 120,
      shelfLifeDays: 90,
      instructions: '1. Rinse beans thoroughly\n2. Soak in water for 8 hours\n3. Drain and add fresh water\n4. Add salt\n5. Boil for 90 minutes until tender\n6. Drain and cool\n7. Store in freezer',
      storageLocation: 'Freezer 1',
      currentStock: 0,
      wipStock: 0,
      inputs: [
        {
          id: 'i1',
          name: 'Dry Beans',
          quantity: 2,
          unit: 'KG',
          available: 10,
          notes: 'Soaked overnight',
          status: 'ok',
        },
        {
          id: 'i2',
          name: 'Table Salt',
          quantity: 50,
          unit: 'G',
          available: 1000,
          notes: 'Add during boiling',
          status: 'ok',
        },
      ],
      canPrepare: true,
      maxBatches: 5, // Limited by beans (10 / 2 = 5)
    },
  ]

  const getInputStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'text-green-600'
      case 'low':
        return 'text-yellow-600'
      case 'out':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const handlePrepare = async (recipeId: string) => {
    try {
      setPreparing(true)
      setError(null)

      const response = await fetch('/api/inventory/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preparationRecipeId: recipeId,
          batchQuantity,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Show success message
        alert(`✅ ${result.message}\n\nBatch Number: ${result.data.batchNumber}\nQuantity: ${result.data.quantityProduced}`)

        // Reset selection
        setSelectedRecipe(null)
        setBatchQuantity(1)

        // Refresh recipes to show updated stock
        await fetchRecipes()
      } else {
        setError(result.error || 'Failed to prepare batch')
        if (result.details) {
          console.error('Preparation error details:', result.details)
          alert(`❌ Error: ${result.error}\n\n${Array.isArray(result.details) ? result.details.join('\n') : result.details}`)
        }
      }
    } catch (err) {
      const errorMsg = 'Failed to prepare batch'
      setError(errorMsg)
      console.error('Error preparing batch:', err)
      alert(`❌ ${errorMsg}`)
    } finally {
      setPreparing(false)
    }
  }

  return (
    <div>
      <AdminHeader title="Bulk Preparation" />

      <div className="p-8">
        {/* Header Info */}
        <div className="mb-6">
          <p className="text-gray-600">
            Prepare compound ingredients in bulk. Raw ingredients will be moved to WIP (Work In Progress) state.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchRecipes} className="ml-auto">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading preparation recipes...</p>
            </CardContent>
          </Card>
        )}

        {/* Preparation Recipes */}
        {!loading && recipes.length > 0 && (
          <div className="space-y-6">
          {recipes.map((recipe) => {
            const selected = selectedRecipe === recipe.id
            const totalOutput = recipe.outputQuantity * batchQuantity
            const willProduceTooMuch = totalOutput > 10 // Example threshold

            return (
              <Card key={recipe.id} className={selected ? 'border-primary-500 border-2' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        recipe.canPrepare ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <ChefHat className={`w-6 h-6 ${
                          recipe.canPrepare ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="mb-2">{recipe.name}</CardTitle>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span>Produces: {recipe.outputQuantity} {recipe.outputUnit}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Prep: {recipe.prepTime} min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Thermometer className="w-4 h-4" />
                            <span>Shelf: {recipe.shelfLifeDays} days</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span>Location: {recipe.storageLocation}</span>
                          </div>
                        </div>

                        {/* Current Stock */}
                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <span className="text-gray-600">Current Stock:</span>
                          <span className="font-semibold text-gray-900">
                            {recipe.currentStock} {recipe.outputUnit} raw
                          </span>
                          {recipe.wipStock > 0 && (
                            <span className="font-semibold text-yellow-600">
                              {recipe.wipStock} {recipe.outputUnit} WIP
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {recipe.canPrepare ? (
                      <Button
                        onClick={() => setSelectedRecipe(selected ? null : recipe.id)}
                        variant={selected ? 'default' : 'outline'}
                      >
                        {selected ? 'Selected' : 'Select Recipe'}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-sm font-semibold text-red-700">Cannot Prepare</p>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Required Ingredients */}
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Required Ingredients ({recipe.inputs.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {recipe.inputs.map((input) => (
                      <div
                        key={input.id}
                        className={`p-3 rounded-lg border-2 ${
                          input.status === 'out'
                            ? 'border-red-200 bg-red-50'
                            : input.status === 'low'
                            ? 'border-yellow-200 bg-yellow-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{input.name}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Need: <span className="font-semibold">{input.quantity} {input.unit}</span> per batch
                            </p>
                            <p className={`text-xs mt-1 font-semibold ${getInputStatusColor(input.status)}`}>
                              Available: {input.available} {input.unit}
                            </p>
                            {input.notes && (
                              <p className="text-xs text-gray-500 mt-1 italic">{input.notes}</p>
                            )}
                          </div>
                          {input.status === 'ok' && (
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Preparation Form - Only show when selected */}
                  {selected && (
                    <>
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Preparation Details</h4>

                        {/* Batch Quantity Selector */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Number of Batches
                          </label>
                          <div className="flex items-center gap-4">
                            <input
                              type="number"
                              min="1"
                              max={recipe.maxBatches}
                              value={batchQuantity}
                              onChange={(e) => setBatchQuantity(Math.max(1, Math.min(recipe.maxBatches, parseInt(e.target.value) || 1)))}
                              className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <span className="text-sm text-gray-600">
                              (max {recipe.maxBatches} batches available)
                            </span>
                          </div>
                        </div>

                        {/* Calculation Summary */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <h5 className="font-semibold text-gray-900 mb-2">Preparation Summary</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700">Will produce:</span>
                              <span className="font-semibold text-gray-900">
                                {totalOutput} {recipe.outputUnit}
                              </span>
                            </div>
                            <div className="border-t border-blue-200 pt-2 mt-2">
                              <p className="font-semibold text-gray-900 mb-2">Ingredients to be used:</p>
                              {recipe.inputs.map((input) => (
                                <div key={input.id} className="flex items-center justify-between py-1">
                                  <span className="text-gray-700">{input.name}:</span>
                                  <div className="text-right">
                                    <span className="font-semibold text-gray-900">
                                      -{input.quantity * batchQuantity} {input.unit}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-2">
                                      (from raw stock)
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="border-t border-blue-200 pt-2 mt-2">
                              <div className="flex items-center gap-2">
                                <ArrowRight className="w-4 h-4 text-blue-600" />
                                <span className="text-gray-700">
                                  Raw stock will decrease, WIP stock will increase
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Instructions */}
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-900 mb-2">Preparation Instructions</h5>
                          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line">
                            {recipe.instructions}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handlePrepare(recipe.id)}
                            className="flex-1"
                            disabled={!recipe.canPrepare || preparing}
                          >
                            {preparing ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Preparing...
                              </>
                            ) : (
                              <>
                                <ChefHat className="w-4 h-4 mr-2" />
                                Start Preparation ({batchQuantity} {batchQuantity === 1 ? 'Batch' : 'Batches'})
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedRecipe(null)}
                            disabled={preparing}
                          >
                            Cancel
                          </Button>
                        </div>

                        {willProduceTooMuch && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              <strong>Warning:</strong> This will produce {totalOutput} {recipe.outputUnit},
                              which may exceed storage capacity. Consider reducing batch quantity.
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}
          </div>
        )}

        {/* No recipes available */}
        {!loading && recipes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Preparation Recipes Available</h3>
              <p className="text-gray-600 mb-4">
                Create compound ingredients and their preparation recipes to get started.
              </p>
              <Link href="/admin/inventory/new">
                <Button>
                  <Package className="w-4 h-4 mr-2" />
                  Add Compound Ingredient
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How Bulk Preparation Works</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>Select a preparation recipe and choose how many batches to make</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>Raw ingredients will be deducted from RAW stock and moved to WIP (Work In Progress)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>A preparation batch will be created to track exactly what ingredients were used</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">4.</span>
                    <span>When customers order dishes using this ingredient, WIP will move to CONSUMED proportionally</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
