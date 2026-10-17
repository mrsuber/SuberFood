'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { AdminPage, Panel, Loading, ErrorNote, EmptyState, Field, inputClass, PrimaryButton, useAdminFetch, sendJson } from '@/components/admin/ui'

export default function MenuCategoryPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, loading, error, reload } = useAdminFetch<{ category: any }>(`/api/admin/menu/categories/${id}`)
  const [form, setForm] = useState({ name: '', description: '', displayOrder: '0', isActive: true })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const category = data?.category

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name,
        description: category.description || '',
        displayOrder: String(category.displayOrder ?? 0),
        isActive: category.isActive,
      })
    }
  }, [category])

  if (loading && !category) return <AdminPage title="Menu category"><Loading /></AdminPage>
  if (error || !category)
    return (
      <AdminPage title="Menu category" back={{ label: 'Categories', href: '/admin/menus/categories' }}>
        <ErrorNote message={error || 'Category not found'} />
      </AdminPage>
    )

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    try {
      await sendJson(`/api/admin/menu/categories/${id}`, 'PATCH', form)
      reload()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!confirm(`Delete the "${category.name}" category?`)) return
    try {
      await sendJson(`/api/admin/menu/categories/${id}`, 'DELETE')
      router.push('/admin/menus/categories')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <AdminPage
      title={category.name}
      back={{ label: 'Categories', href: '/admin/menus/categories' }}
      description={`${category.restaurant?.name} · ${category.restaurant?.city}`}
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Edit category">
          <form onSubmit={save} className="space-y-4">
            <Field label="Name" required>
              <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Description">
              <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Display order" hint="Lower numbers appear first on the menu">
              <input type="number" className={inputClass} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Visible on the menu
            </label>
            {saveError && <ErrorNote message={saveError} />}
            <div className="flex gap-3">
              <PrimaryButton type="submit" loading={saving}>Save</PrimaryButton>
              <button type="button" onClick={remove} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                Delete category
              </button>
            </div>
          </form>
        </Panel>
        <Panel title={`${category.items.length} dishes`}>
          {category.items.length === 0 ? (
            <EmptyState title="No dishes in this category" action={{ label: 'Add a dish', href: '/admin/menus/new' }} />
          ) : (
            <ul className="-m-6 divide-y divide-gray-100">
              {category.items.map((i: any) => (
                <li key={i.id}>
                  <Link href={`/admin/menus/${i.id}`} className="flex justify-between px-6 py-3 text-sm hover:bg-gray-50">
                    <span className={i.isAvailable ? 'text-gray-900 font-medium' : 'text-gray-400 line-through'}>{i.name}</span>
                    <span className="text-gray-500">{Math.round(i.price).toLocaleString('fr-FR')} XAF</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AdminPage>
  )
}
