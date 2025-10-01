'use client'

import { useState } from 'react'
import { Product } from '@/index'

interface ProductFormProps {
  product?: Product
  onSubmit: (data: Partial<Product>) => Promise<void>
  onCancel: () => void
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    image_url: product?.image_url || '',
    category: product?.category || '',
    is_active: product?.is_active ?? true,
  })
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const { url } = await response.json()
      setFormData(prev => ({ ...prev, image_url: url }))
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label className="block text-sm font-medium mb-1">Product Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Price</label>
        <input
          type="number"
          // step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
          className="w-full px-3 py-2 border rounded-md"
        />
        {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
        {formData.image_url && (
          <img src={formData.image_url} alt="Preview" className="w-32 h-32 object-cover mt-2 rounded" />
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="mr-2"
        />
        <label className="text-sm font-medium">Active</label>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
        >
          {product ? 'Update' : 'Create'} Product
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}