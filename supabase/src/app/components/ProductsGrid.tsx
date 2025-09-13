"use client";

import { Product } from "@/types";
import { useEffect, useState } from "react";



interface ProductsGridProps {
    onProductSelect?: (productId: string) => void
}

export default function ProductsGrid({ onProductSelect }: ProductsGridProps) {
        const [products, setProducts] = useState<Product[]>([]);
        const [loading, setLoading] = useState(true)

        useEffect(()=> {
            fetchProducts();
        }, []);

        const fetchProducts = async()=> {
            try {
                const response = await fetch('/api/products');
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error)
            }finally {
                setLoading(false)
            }
        }

        if(loading) return <div>Loading products ...</div>


        return(
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onProductSelect?.(product as any)}
        >
          <img
            src={product.image_url || '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <p className="text-2xl font-bold text-primary">${product.price}</p>
          </div>
        </div>
      ))}
    </div>
        )


}


