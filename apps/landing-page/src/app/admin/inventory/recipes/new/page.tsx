'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChefHat, ArrowRight } from 'lucide-react'
import { AdminPage, Panel, Loading, ErrorNote, EmptyState, inputClass, useAdminFetch } from '@/components/admin/ui'

// Recipes belong to a menu item (one recipe per dish) and are edited on the dish page.
export default function NewRecipePage() {
  const menu = useAdminFetch<{ menuItems: any[] }>('/api/admin/menu')
  const recipes = useAdminFetch<{ data: any[] }>('/api/admin/recipes')
  const [search, setSearch] = useState('')

  const withRecipe = new Set((recipes.data?.data || []).map((r) => r.menuItemId || r.menuItem?.id))
  const candidates = (menu.data?.menuItems || [])
    .filter((m) => !withRecipe.has(m.id))
    .filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <AdminPage
      title="Create Recipe"
      back={{ label: 'Recipes', href: '/admin/inventory/recipes' }}
      description="Each dish has one recipe that lists its ingredients, so stock is deducted automatically when the dish is ordered. Pick a dish without a recipe to add one."
    >
      {(menu.error || recipes.error) && <ErrorNote message={menu.error || recipes.error || ''} />}
      <Panel>
        <input className={inputClass} placeholder="Search dishes" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Panel>
      <Panel title={`${candidates.length} dishes without a recipe`}>
        {menu.loading || recipes.loading ? (
          <Loading />
        ) : candidates.length === 0 ? (
          <EmptyState title="Every dish has a recipe" action={{ label: 'Add a new dish', href: '/admin/menus/new' }} />
        ) : (
          <ul className="-m-6 divide-y divide-gray-100">
            {candidates.map((m) => (
              <li key={m.id}>
                <Link href={`/admin/menus/${m.id}`} className="flex items-center justify-between gap-4 px-6 py-3 text-sm hover:bg-gray-50">
                  <span className="flex items-center gap-3">
                    <ChefHat className="w-4 h-4 text-gray-400" />
                    <span>
                      <span className="font-medium text-gray-900">{m.name}</span>
                      <span className="text-gray-500"> · {m.category?.name} · {m.category?.restaurant?.name}</span>
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-primary-700">
                    Add recipe <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AdminPage>
  )
}
