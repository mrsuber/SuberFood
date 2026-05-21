import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit, Package, AlertCircle } from 'lucide-react'

export default function ProductsPage() {
  const products = [
    {
      id: '1',
      name: 'Organic Tomatoes',
      sku: 'PRD-001',
      category: 'Fresh Produce',
      price: 4.99,
      stock: 150,
      lowStockThreshold: 50,
      status: 'Active',
      unit: 'lb',
    },
    {
      id: '2',
      name: 'Fresh Milk (1 Gallon)',
      sku: 'PRD-002',
      category: 'Dairy',
      price: 5.49,
      stock: 25,
      lowStockThreshold: 50,
      status: 'Active',
      unit: 'gallon',
    },
    {
      id: '3',
      name: 'Grass-Fed Beef',
      sku: 'PRD-003',
      category: 'Meat',
      price: 12.99,
      stock: 80,
      lowStockThreshold: 30,
      status: 'Active',
      unit: 'lb',
    },
  ]

  return (
    <div>
      <AdminHeader title="Products & Inventory" />

      <div className="p-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">Manage product catalog and inventory</p>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>All Categories</option>
            <option>Fresh Produce</option>
            <option>Dairy</option>
            <option>Meat</option>
            <option>Seafood</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>All Products</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">SKU</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{product.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${
                            product.stock < product.lowStockThreshold
                              ? 'text-red-600'
                              : 'text-gray-900'
                          }`}>
                            {product.stock}
                          </span>
                          {product.stock < product.lowStockThreshold && (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
