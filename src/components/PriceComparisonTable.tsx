import { ExternalLink, TrendingDown, Clock, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ProductPrice, StoreName } from '@/types'
import { stores } from '@/types'
import { formatPrice, formatRelativeTime, cn } from '@/lib/utils'

interface PriceComparisonTableProps {
  prices: ProductPrice[]
  officialPrice?: number
}

export default function PriceComparisonTable({ prices, officialPrice }: PriceComparisonTableProps) {
  // Sort by price (lowest first), then by stock
  const sortedPrices = [...prices].sort((a, b) => {
    if (a.inStock && !b.inStock) return -1
    if (!a.inStock && b.inStock) return 1
    return a.price - b.price
  })

  const lowestPrice = sortedPrices.find((p) => p.inStock)?.price

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="font-bold text-lg">השוואת מחירים</h3>
        <p className="text-sm text-gray-500">
          {prices.length} חנויות מציעות מוצר זה
        </p>
      </div>

      <div className="divide-y">
        {sortedPrices.map((price, index) => {
          const store = stores[price.storeId as StoreName]
          const isLowest = price.price === lowestPrice && price.inStock
          const savingsFromOfficial = officialPrice ? officialPrice - price.price : 0

          return (
            <motion.div
              key={price.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'p-4 hover:bg-gray-50 transition-colors',
                isLowest && 'bg-green-50 border-r-4 border-green-500',
                !price.inStock && 'opacity-60'
              )}
            >
              <div className="flex items-center gap-4">
                {/* Store Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {store?.logo ? (
                      <img src={store.logo} alt={store.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-lg font-bold text-gray-400">
                        {store?.name?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {store?.nameHe || price.storeId}
                      </span>
                      {store?.isOfficial && (
                        <span className="text-xs bg-lego-yellow px-1.5 py-0.5 rounded font-medium">
                          רשמי
                        </span>
                      )}
                      {isLowest && (
                        <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded font-medium">
                          הכי זול!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>עודכן {formatRelativeTime(new Date(price.lastUpdated))}</span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="text-left">
                  <div className="flex items-baseline gap-2">
                    <span className={cn(
                      'text-xl font-bold',
                      isLowest ? 'text-green-600' : 'text-gray-900'
                    )}>
                      {formatPrice(price.price)}
                    </span>
                    {price.originalPrice && price.originalPrice > price.price && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(price.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Savings */}
                  {savingsFromOfficial > 0 && !store?.isOfficial && (
                    <div className="flex items-center gap-1 text-green-600 text-xs mt-0.5">
                      <TrendingDown className="w-3 h-3" />
                      <span>חסכון של ₪{savingsFromOfficial} מהרשמי</span>
                    </div>
                  )}

                  {/* Discount Badge */}
                  {price.isOnSale && price.discountPercentage && (
                    <span className="text-xs bg-lego-red text-white px-1.5 py-0.5 rounded">
                      {price.discountPercentage}%- הנחה
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-1 w-20 justify-center">
                  {price.inStock ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">במלאי</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-500">אזל</span>
                    </>
                  )}
                </div>

                {/* Buy Button */}
                <a
                  href={price.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                    price.inStock
                      ? 'bg-lego-yellow hover:bg-yellow-400 text-black'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  )}
                  onClick={(e) => !price.inStock && e.preventDefault()}
                >
                  <span>לחנות</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary */}
      {lowestPrice && officialPrice && lowestPrice < officialPrice && (
        <div className="p-4 bg-green-50 border-t border-green-200">
          <div className="flex items-center justify-center gap-2 text-green-700">
            <TrendingDown className="w-5 h-5" />
            <span className="font-medium">
              אפשר לחסוך עד ₪{officialPrice - lowestPrice} בהשוואה לחנות הרשמית!
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
