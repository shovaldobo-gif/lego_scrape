import { Link } from 'react-router-dom'
import { Flame, ArrowLeft, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ProductWithPrices } from '@/types'
import { stores } from '@/types'
import { formatPrice, cn } from '@/lib/utils'

interface HotDealsProps {
  deals: ProductWithPrices[]
  title?: string
  showViewAll?: boolean
}

export default function HotDeals({ deals, title = 'מבצעים חמים', showViewAll = true }: HotDealsProps) {
  if (deals.length === 0) return null

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-lego-red" />
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        {showViewAll && (
          <Link
            to="/deals"
            className="flex items-center gap-1 text-lego-blue hover:underline font-medium"
          >
            לכל המבצעים
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {deals.slice(0, 5).map((product, index) => {
          const lowestPrice = product.lowestPrice
          const discount = lowestPrice?.discountPercentage || 0
          const savings = product.savingsFromOfficial || 0

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/product/${product.sku}`}
                className="card block group"
              >
                {/* Discount Badge */}
                <div className="relative">
                  {discount > 0 && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="bg-lego-red text-white px-2 py-1 rounded-lg font-bold text-sm animate-pulse-price">
                        {discount}%- הנחה
                      </div>
                    </div>
                  )}

                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.nameHe}
                      className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="p-3">
                  {/* SKU */}
                  <span className="text-xs text-gray-500">#{product.sku}</span>

                  {/* Name */}
                  <h3 className="font-medium text-sm line-clamp-2 mt-1 group-hover:text-lego-blue transition-colors">
                    {product.nameHe}
                  </h3>

                  {/* Price */}
                  {lowestPrice && (
                    <div className="mt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-lego-red">
                          {formatPrice(lowestPrice.price)}
                        </span>
                        {lowestPrice.originalPrice && lowestPrice.originalPrice > lowestPrice.price && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(lowestPrice.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Store */}
                      <p className="text-xs text-gray-500 mt-1">
                        ב-{stores[lowestPrice.storeId]?.nameHe || lowestPrice.storeId}
                      </p>

                      {/* Savings */}
                      {savings > 0 && (
                        <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                          <TrendingDown className="w-3 h-3" />
                          <span>חסכון ₪{savings}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
