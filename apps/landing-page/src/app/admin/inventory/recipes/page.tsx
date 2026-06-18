'use client'

import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Edit,
  ChefHat,
  Package,
  AlertCircle,
  CheckCircle,
  Search,
  Loader2,
  BookOpen,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type RecipeIngredient = {
  name: string
  quantity: number
  unit: string
  available: number
  status: 'ok' | 'low' | 'out'
}

type Recipe = {
  id: string
  menuItemName: string
  servingSize: number
  ingredients: RecipeIngredient[]
  totalCost: number
  costPerServing: number
  prepTime: number
  cookTime: number
  instructions: string
  calories: number | null
  protein: string | null
  carbs: string | null
  fat: string | null
  fiber: string | null
  sodium: string | null
  sugar: string | null
  canMake: boolean
  canMakeServings: number
}

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/recipes')
      const result = await response.json()
      if (result.success) {
        setRecipes(result.data)
      }
    } catch (error) {
      console.error('Error fetching recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecipes = recipes.filter((recipe) =>
    searchQuery === '' ||
    recipe.menuItemName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getIngredientStatusColor = (status: string) => {
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

  return (
    <div>
      <AdminHeader title="Recipes & Menu Items" />

      <div className="p-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Manage recipe ingredients and check what dishes you can make based on available stock
          </p>
          <Link href="/admin/inventory/recipes/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Recipe
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative max-w-md">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                placeholder="Search recipes or menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading recipes...</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && filteredRecipes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recipes found. Create your first recipe to get started!</p>
            </CardContent>
          </Card>
        )}

        {/* Recipes List */}
        {!loading && filteredRecipes.length > 0 && (
          <div className="space-y-6">
            {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className={recipe.canMake ? '' : 'border-yellow-200'}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      recipe.canMake ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <ChefHat className={`w-6 h-6 ${
                        recipe.canMake ? 'text-green-600' : 'text-yellow-600'
                      }`} />
                    </div>
                    <div>
                      <CardTitle>{recipe.menuItemName}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>Serves: {recipe.servingSize}</span>
                        <span>•</span>
                        <span>Prep: {recipe.prepTime}min</span>
                        <span>•</span>
                        <span>Cook: {recipe.cookTime}min</span>
                        <span>•</span>
                        <span className="font-semibold text-gray-900">
                          Cost: ${recipe.costPerServing.toFixed(2)}/serving
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {recipe.canMake ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-semibold text-green-700">Can Make</p>
                          <p className="text-xs text-green-600">Up to {recipe.canMakeServings} servings</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-semibold text-yellow-700">Missing Ingredients</p>
                          <p className="text-xs text-yellow-600">Cannot make this dish</p>
                        </div>
                      </div>
                    )}

                    <Link href={`/admin/inventory/recipes/${recipe.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Required Ingredients ({recipe.ingredients.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recipe.ingredients.map((ingredient, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-2 ${
                        ingredient.status === 'out'
                          ? 'border-red-200 bg-red-50'
                          : ingredient.status === 'low'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{ingredient.name}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Need: <span className="font-semibold">{ingredient.quantity} {ingredient.unit}</span>
                          </p>
                          <p className={`text-xs mt-1 font-semibold ${getIngredientStatusColor(ingredient.status)}`}>
                            Available: {ingredient.available} {ingredient.unit}
                          </p>
                        </div>
                        {ingredient.status === 'out' && (
                          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        )}
                        {ingredient.status === 'low' && (
                          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        )}
                        {ingredient.status === 'ok' && (
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Missing ingredients alert */}
                {!recipe.canMake && (
                  <div className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Action needed:</strong> Purchase the following ingredients to make this dish:{' '}
                      <strong>
                        {recipe.ingredients
                          .filter(i => i.status === 'out' || i.status === 'low')
                          .map(i => i.name)
                          .join(', ')}
                      </strong>
                    </p>
                  </div>
                )}

                {/* Nutritional Information */}
                {(recipe.calories || recipe.protein || recipe.carbs || recipe.fat || recipe.fiber || recipe.sodium || recipe.sugar) && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Nutritional Information (per serving)</h4>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {recipe.calories && (
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-900">{recipe.calories}</p>
                            <p className="text-xs text-green-700 mt-1">Calories</p>
                          </div>
                        )}
                        {recipe.protein && (
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-900">{recipe.protein}g</p>
                            <p className="text-xs text-green-700 mt-1">Protein</p>
                          </div>
                        )}
                        {recipe.carbs && (
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-900">{recipe.carbs}g</p>
                            <p className="text-xs text-green-700 mt-1">Carbs</p>
                          </div>
                        )}
                        {recipe.fat && (
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-900">{recipe.fat}g</p>
                            <p className="text-xs text-green-700 mt-1">Fat</p>
                          </div>
                        )}
                        {recipe.fiber && (
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-900">{recipe.fiber}g</p>
                            <p className="text-xs text-green-700 mt-1">Fiber</p>
                          </div>
                        )}
                        {recipe.sodium && (
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-900">{recipe.sodium}mg</p>
                            <p className="text-xs text-green-700 mt-1">Sodium</p>
                          </div>
                        )}
                        {recipe.sugar && (
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-900">{recipe.sugar}g</p>
                            <p className="text-xs text-green-700 mt-1">Sugar</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Cooking Instructions */}
                {recipe.instructions && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Cooking Procedure
                    </h4>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="prose prose-sm max-w-none">
                        {recipe.instructions.split('\n').filter(line => line.trim()).map((line, idx) => {
                          // Extract the step number if present
                          const match = line.match(/^(\d+\.\s*)(.*)$/)
                          if (match) {
                            return (
                              <p key={idx} className="text-gray-700 mb-2 last:mb-0">
                                <span className="font-semibold text-blue-700">{match[1]}</span>
                                {match[2]}
                              </p>
                            )
                          }
                          return (
                            <p key={idx} className="text-gray-700 mb-2 last:mb-0">
                              {line}
                            </p>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* No instructions warning */}
                {!recipe.instructions && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Cooking Procedure
                    </h4>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 italic">
                        No cooking instructions available. <Link href={`/admin/inventory/recipes/${recipe.id}/edit`} className="text-primary-600 hover:underline">Add instructions</Link> to help your chefs.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {/* Summary Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recipe Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 mb-1">Available Dishes</p>
                <p className="text-3xl font-bold text-green-900">
                  {loading ? '-' : recipes.filter(r => r.canMake).length}
                </p>
                <p className="text-xs text-green-600 mt-1">Ready to cook</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700 mb-1">Missing Ingredients</p>
                <p className="text-3xl font-bold text-yellow-900">
                  {loading ? '-' : recipes.filter(r => !r.canMake).length}
                </p>
                <p className="text-xs text-yellow-600 mt-1">Need restocking</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 mb-1">Total Recipes</p>
                <p className="text-3xl font-bold text-blue-900">
                  {loading ? '-' : recipes.length}
                </p>
                <p className="text-xs text-blue-600 mt-1">Menu items with recipes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
