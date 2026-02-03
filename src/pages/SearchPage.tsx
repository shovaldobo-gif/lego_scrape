import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import ProductGrid from '@/components/ProductGrid'
import SearchFiltersComponent from '@/components/SearchFilters'
import type { SearchFilters, ProductWithPrices } from '@/types'
import { useStore } from '@/store/useStore'

// Mock data - will be replaced with real API calls
const mockProducts: ProductWithPrices[] = [
  {
    id: '1',
    sku: '75192',
    name: 'Millennium Falcon',
    nameHe: 'מילניום פלקון',
    category: 'star-wars',
    imageUrl: 'https://www.lego.com/cdn/cs/set/assets/blt5b9a78ce4dfd0dca/75192.png',
    isRetired: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    prices: [
      {
        id: 'p1',
        productId: '1',
        storeId: 'ksp',
        price: 2799,
        originalPrice: 3499,
        currency: 'ILS',
        inStock: true,
        url: 'https://ksp.co.il/web/item/75192',
        lastUpdated: new Date(),
        isOnSale: true,
        discountPercentage: 20,
      },
    ],
    lowestPrice: {
      id: 'p1',
      productId: '1',
      storeId: 'ksp',
      price: 2799,
      originalPrice: 3499,
      currency: 'ILS',
      inStock: true,
      url: 'https://ksp.co.il/web/item/75192',
      lastUpdated: new Date(),
      isOnSale: true,
      discountPercentage: 20,
    },
    savingsFromOfficial: 700,
  },
  // Add more mock products...
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { filters, setFilters, resetFilters, isFiltersOpen, toggleFilters } = useStore()

  const [products, setProducts] = useState<ProductWithPrices[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  // Load products on mount and when filters change
  useEffect(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts)
      setIsLoading(false)
    }, 500)
  }, [filters, searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams({ q: searchQuery })
    setFilters({ ...filters, query: searchQuery })
  }

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש לפי מק״ט או שם..."
              className="input text-lg pr-12 pl-14"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <button
              type="submit"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-lego-yellow rounded-lg hover:bg-yellow-400 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>

        {searchQuery && (
          <p className="text-center mt-4 text-gray-600">
            תוצאות חיפוש עבור: <strong>"{searchQuery}"</strong>
          </p>
        )}
      </div>

      {/* Main Layout */}
      <div className="flex gap-8">
        {/* Filters Sidebar - Desktop */}
        <aside className="hidden md:block w-72 flex-shrink-0">
          <SearchFiltersComponent
            filters={filters}
            onChange={handleFilterChange}
            onReset={resetFilters}
            isOpen={true}
            onToggle={toggleFilters}
            totalResults={products.length}
          />
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {isLoading ? 'טוען...' : `${products.length} מוצרים נמצאו`}
            </p>

            {/* Mobile Filter Toggle */}
            <button
              onClick={toggleFilters}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg"
            >
              <SlidersHorizontal className="w-5 h-5" />
              סינון
            </button>
          </div>

          {/* Product Grid */}
          <ProductGrid products={products} isLoading={isLoading} />

          {/* Load More */}
          {products.length > 0 && !isLoading && (
            <div className="text-center mt-8">
              <button className="btn-lego">טען עוד מוצרים</button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters */}
      <SearchFiltersComponent
        filters={filters}
        onChange={handleFilterChange}
        onReset={resetFilters}
        isOpen={isFiltersOpen}
        onToggle={toggleFilters}
        totalResults={products.length}
      />
    </div>
  )
}
