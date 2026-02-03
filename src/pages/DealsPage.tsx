import { useState, useEffect } from 'react'
import { Flame, TrendingDown, Filter, ArrowDown } from 'lucide-react'
import { motion } from 'framer-motion'
import ProductCard from '@/components/ProductCard'
import type { ProductWithPrices } from '@/types'

// Mock data
const mockDeals: ProductWithPrices[] = [
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
    prices: [],
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
  {
    id: '2',
    sku: '42143',
    name: 'Ferrari Daytona SP3',
    nameHe: 'פרארי דייטונה SP3',
    category: 'technic',
    imageUrl: 'https://www.lego.com/cdn/cs/set/assets/blt1bdced7ee89be31c/42143.png',
    isRetired: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    prices: [],
    lowestPrice: {
      id: 'p3',
      productId: '2',
      storeId: 'bug',
      price: 1549,
      originalPrice: 1799,
      currency: 'ILS',
      inStock: true,
      url: 'https://www.bug.co.il/42143',
      lastUpdated: new Date(),
      isOnSale: true,
      discountPercentage: 14,
    },
    savingsFromOfficial: 250,
  },
  {
    id: '3',
    sku: '76419',
    name: 'Hogwarts Castle',
    nameHe: 'טירת הוגוורטס',
    category: 'harry-potter',
    imageUrl: 'https://www.lego.com/cdn/cs/set/assets/blt5b97e37c8d8f5f57/76419.png',
    isRetired: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    prices: [],
    lowestPrice: {
      id: 'p4',
      productId: '3',
      storeId: 'ivory',
      price: 599,
      originalPrice: 749,
      currency: 'ILS',
      inStock: true,
      url: 'https://www.ivory.co.il/76419',
      lastUpdated: new Date(),
      isOnSale: true,
      discountPercentage: 20,
    },
    savingsFromOfficial: 150,
  },
]

type SortOption = 'discount' | 'savings' | 'price'

export default function DealsPage() {
  const [deals, setDeals] = useState<ProductWithPrices[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('discount')

  useEffect(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      const sortedDeals = [...mockDeals].sort((a, b) => {
        switch (sortBy) {
          case 'discount':
            return (b.lowestPrice?.discountPercentage || 0) - (a.lowestPrice?.discountPercentage || 0)
          case 'savings':
            return (b.savingsFromOfficial || 0) - (a.savingsFromOfficial || 0)
          case 'price':
            return (a.lowestPrice?.price || 0) - (b.lowestPrice?.price || 0)
          default:
            return 0
        }
      })
      setDeals(sortedDeals)
      setIsLoading(false)
    }, 500)
  }, [sortBy])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 bg-lego-red text-white px-6 py-3 rounded-full mb-4">
          <Flame className="w-6 h-6 animate-pulse" />
          <span className="font-bold text-xl">מבצעים חמים</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">ההנחות הטובות ביותר</h1>
        <p className="text-gray-600">
          כל המוצרים שזולים יותר מהחנות הרשמית של לגו
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: TrendingDown, label: 'חסכון ממוצע', value: '₪342' },
          { icon: Flame, label: 'מבצעים פעילים', value: `${deals.length}` },
          { icon: ArrowDown, label: 'הנחה מקסימלית', value: '40%' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md p-4 text-center"
          >
            <stat.icon className="w-8 h-8 mx-auto mb-2 text-lego-red" />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Sort Options */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">{deals.length} מוצרים במבצע</p>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="input py-2 w-auto"
          >
            <option value="discount">אחוז הנחה</option>
            <option value="savings">סכום חסכון</option>
            <option value="price">מחיר</option>
          </select>
        </div>
      </div>

      {/* Deals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="aspect-square skeleton" />
              <div className="p-4 space-y-3">
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-6 w-full" />
                <div className="skeleton h-8 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {deals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && deals.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-xl font-bold mb-2">אין מבצעים כרגע</h3>
          <p className="text-gray-500">בדוק שוב מאוחר יותר</p>
        </div>
      )}
    </div>
  )
}
