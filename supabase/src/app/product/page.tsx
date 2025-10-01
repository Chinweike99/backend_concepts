'use client'

import { useState, useEffect } from 'react'
import ProductsTable from '@/components/ProductsTable'
import ProductForm from '@/components/ProductForm'
import { Product } from '@/index'


export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[] >([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async (productData: Partial<Product>) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })
      
      if (response.ok) {
        await fetchProducts()
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const handleUpdateProduct = async (productData: Partial<Product>) => {
    if (!editingProduct) return
    
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingProduct.id, ...productData }),
      })
      
      if (response.ok) {
        await fetchProducts()
        setEditingProduct(null)
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await fetchProducts()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
          >
            Add New Product
          </button>
        </div>

        {showForm && (
          <div className="mb-8">
            <ProductForm
              product={editingProduct || undefined}
              onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
              onCancel={() => {
                setShowForm(false)
                setEditingProduct(null)
              }}
            />
          </div>
        )}

        <ProductsTable
          products={products}
          onEdit={(product: Product) => {
            setEditingProduct(product)
            setShowForm(true)
          }}
          onDelete={handleDeleteProduct}
        />
      </div>
    </div>
  )
}