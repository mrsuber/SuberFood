'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Navigation,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DeliveryZoneArea {
  id: string
  areaName: string
}

interface DeliveryZone {
  id: string
  name: string
  description: string | null
  deliveryFee: number
  isActive: boolean
  areas: DeliveryZoneArea[]
  createdAt: string
  updatedAt: string
}

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Create/Edit modal state
  const [zoneDialog, setZoneDialog] = useState(false)
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null)
  const [zoneData, setZoneData] = useState({
    name: '',
    description: '',
    deliveryFee: '',
    areas: [] as string[],
    isActive: true,
  })
  const [areaInput, setAreaInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchZones()
  }, [])

  const fetchZones = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/delivery-zones')
      const data = await response.json()

      if (data.success) {
        setZones(data.data)
      }
    } catch (error) {
      console.error('Error fetching zones:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingZone(null)
    setZoneData({
      name: '',
      description: '',
      deliveryFee: '',
      areas: [],
      isActive: true,
    })
    setAreaInput('')
    setZoneDialog(true)
  }

  const openEditDialog = (zone: DeliveryZone) => {
    setEditingZone(zone)
    setZoneData({
      name: zone.name,
      description: zone.description || '',
      deliveryFee: zone.deliveryFee.toString(),
      areas: zone.areas.map(a => a.areaName),
      isActive: zone.isActive,
    })
    setAreaInput('')
    setZoneDialog(true)
  }

  const handleAddArea = () => {
    if (!areaInput.trim()) return

    const trimmedArea = areaInput.trim()
    if (!zoneData.areas.includes(trimmedArea)) {
      setZoneData({
        ...zoneData,
        areas: [...zoneData.areas, trimmedArea],
      })
    }
    setAreaInput('')
  }

  const handleRemoveArea = (area: string) => {
    setZoneData({
      ...zoneData,
      areas: zoneData.areas.filter(a => a !== area),
    })
  }

  const handleSave = async () => {
    if (!zoneData.name || !zoneData.deliveryFee) {
      alert('Name and delivery fee are required')
      return
    }

    if (parseFloat(zoneData.deliveryFee) < 0) {
      alert('Delivery fee cannot be negative')
      return
    }

    setSaving(true)

    try {
      const url = editingZone
        ? `/api/admin/delivery-zones/${editingZone.id}`
        : '/api/admin/delivery-zones'

      const method = editingZone ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: zoneData.name,
          description: zoneData.description || null,
          deliveryFee: parseFloat(zoneData.deliveryFee),
          areas: zoneData.areas,
          isActive: zoneData.isActive,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(editingZone ? 'Zone updated successfully' : 'Zone created successfully')
        setZoneDialog(false)
        fetchZones()
      } else {
        alert(data.message || 'Failed to save zone')
      }
    } catch (error) {
      console.error('Error saving zone:', error)
      alert('Failed to save zone')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery zone?')) {
      return
    }

    setDeletingId(id)

    try {
      const response = await fetch(`/api/admin/delivery-zones/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setZones(zones.filter(z => z.id !== id))
        alert('Zone deleted successfully')
      } else {
        alert(data.message || 'Failed to delete zone')
      }
    } catch (error) {
      console.error('Error deleting zone:', error)
      alert('Failed to delete zone')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <AdminHeader title="Delivery Zones" />

      <div className="p-8">
        {/* Header Actions */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Delivery Zones</h2>
            <p className="text-gray-600 mt-1">{zones.length} zones configured</p>
          </div>
          <Button onClick={openCreateDialog} className="bg-[#15803D] hover:bg-[#166534]">
            <Plus className="h-4 w-4 mr-2" />
            Add Zone
          </Button>
        </div>

        {/* Zones List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15803D] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading zones...</p>
          </div>
        ) : zones.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No delivery zones</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first delivery zone</p>
              <Button onClick={openCreateDialog} className="bg-[#15803D] hover:bg-[#166534]">
                <Plus className="h-4 w-4 mr-2" />
                Add Zone
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {zones.map((zone) => (
              <Card key={zone.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{zone.name}</h3>
                        <Badge className={zone.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {zone.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      {zone.description && (
                        <p className="text-sm text-gray-600 mb-3">{zone.description}</p>
                      )}

                      <div className="flex items-center gap-6 mb-3">
                        <div>
                          <p className="text-xs text-gray-600">Delivery Fee</p>
                          <p className="font-semibold text-gray-900">
                            {parseFloat(zone.deliveryFee.toString()).toLocaleString()} XAF
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Areas</p>
                          <p className="font-semibold text-gray-900">
                            {zone.areas.length} {zone.areas.length === 1 ? 'area' : 'areas'}
                          </p>
                        </div>
                      </div>

                      {/* Areas List */}
                      {zone.areas.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {zone.areas.map((area) => (
                            <Badge key={area.id} variant="outline" className="border-blue-600 text-blue-600">
                              <Navigation className="h-3 w-3 mr-1" />
                              {area.areaName}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(zone)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(zone.id)}
                        disabled={deletingId === zone.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === zone.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-red-600"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={zoneDialog} onOpenChange={setZoneDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingZone ? 'Edit Delivery Zone' : 'Create Delivery Zone'}</DialogTitle>
            <DialogDescription>
              {editingZone ? 'Update delivery zone details' : 'Add a new delivery zone with areas and pricing'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={zoneData.name}
                onChange={(e) => setZoneData({ ...zoneData, name: e.target.value })}
                placeholder="e.g., Buea Town"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                value={zoneData.description}
                onChange={(e) => setZoneData({ ...zoneData, description: e.target.value })}
                placeholder="Brief description of the zone"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
              />
            </div>

            {/* Delivery Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Fee (XAF) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={zoneData.deliveryFee}
                onChange={(e) => setZoneData({ ...zoneData, deliveryFee: e.target.value })}
                placeholder="e.g., 500"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                required
              />
            </div>

            {/* Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Areas
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddArea())}
                  placeholder="e.g., Molyko, Great Soppo"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                />
                <Button type="button" onClick={handleAddArea} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {zoneData.areas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {zoneData.areas.map((area, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="border-blue-600 text-blue-600 cursor-pointer hover:bg-blue-50"
                      onClick={() => handleRemoveArea(area)}
                    >
                      {area}
                      <span className="ml-2 text-red-500">×</span>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Press Enter or click + to add areas. Click area to remove.</p>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={zoneData.isActive}
                onChange={(e) => setZoneData({ ...zoneData, isActive: e.target.checked })}
                className="h-4 w-4 text-[#15803D] border-gray-300 rounded focus:ring-[#15803D]"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active (visible to customers)
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setZoneDialog(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-[#15803D] hover:bg-[#166534]"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : editingZone ? (
                'Update Zone'
              ) : (
                'Create Zone'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
