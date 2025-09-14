'use client'

import { useState } from 'react'
import BookingForm from '@/components/BookingForm'
import ProductsGrid from '@/components/ProductsGrid'
import { Product } from '@/types'

export default function BookingsPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-12">Book Your Service</h1>
        
        {!selectedProduct ? (
          <>
            <p className="text-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
              Choose from our choicest range of services and products. Select one to proceed with booking.
            </p>
            <ProductsGrid onProductSelect={setSelectedProduct} />
          </>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Selected Service</h2>
              <div className="flex items-center space-x-4">
                <img
                  src={selectedProduct.image_url || '/placeholder.jpg'}
                  alt={selectedProduct.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div>
                  <h3 className="text-lg font-medium">{selectedProduct.name}</h3>
                  <p className="text-gray-600">${selectedProduct.price}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="mt-4 text-primary hover:text-primary-dark"
              >
                Change Service
              </button>
            </div>

            <BookingForm
              product={selectedProduct}
              onSuccess={() => setSelectedProduct(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}