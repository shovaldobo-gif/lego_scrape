import type { ProductWithPrices } from '@/types'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: ProductWithPrices[]
  isLoading?: boolean
}

export default function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton />
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">לא נמצאו מוצרים</h3>
        <p className="text-gray-500">נסה לשנות את הסינון או לחפש משהו אחר</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="aspect-square skeleton" />
          <div className="p-4 space-y-3">
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-6 w-full" />
            <div className="skeleton h-6 w-2/3" />
            <div className="skeleton h-8 w-1/2" />
            <div className="skeleton h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
