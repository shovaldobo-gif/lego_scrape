import { Link } from 'react-router-dom'
import { Heart, ExternalLink, TrendingDown, Store } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ProductWithPrices } from '@/types'
import { stores, categoryNames } from '@/types'
import { useStore } from '@/store/useStore'
import { formatPrice, calculateDiscount, cn } from '@/lib/utils'

interface ProductCardProps {
  product: ProductWithPrices
  showCompare?: boolean
}

export default function ProductCard({ product, showCompare = true }: ProductCardProps) {
  const { favorites, addFavorite, removeFavorite, isFavorite } = useStore()
  const isLiked = isFavorite(product.id)

  const lowestPrice = product.lowestPrice
  const officialPrice = product.officialPrice
  const savings = product.savingsFromOfficial

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isLiked) {
      removeFavorite(product.id)
    } else {
      addFavorite(product.id)
    }
  }

  const handleBuyClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card group"
    >
      <Link to={`/product/${product.sku}`} className="block">
        {/* Image Section */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.nameHe}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {lowestPrice?.isOnSale && lowestPrice.discountPercentage && (
              <span className="badge badge-sale">
                {lowestPrice.discountPercentage}%- הנחה
              </span>
            )}
            {savings && savings > 0 && (
              <span className="badge bg-green-500 text-white flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                חסוך ₪{savings}
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className={cn(
              'absolute top-2 left-2 p-2 rounded-full bg-white shadow-md transition-all',
              'hover:scale-110 active:scale-95',
              isLiked ? 'text-lego-red' : 'text-gray-400 hover:text-lego-red'
            )}
          >
            <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
          </button>

          {/* SKU Badge */}
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            #{product.sku}
          </span>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Category */}
          <span className="text-xs text-gray-500 font-medium">
            {categoryNames[product.category]}
          </span>

          {/* Title */}
          <h3 className="font-bold text-lg mt-1 mb-2 line-clamp-2 group-hover:text-lego-blue transition-colors">
            {product.nameHe}
          </h3>

          {/* Price Section */}
          <div className="space-y-2">
            {lowestPrice ? (
              <div className="flex items-baseline gap-2">
                <span className="price-tag">
                  {formatPrice(lowestPrice.price)}
                </span>
                {lowestPrice.originalPrice && lowestPrice.originalPrice > lowestPrice.price && (
                  <span className="price-original">
                    {formatPrice(lowestPrice.originalPrice)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-500">מחיר לא זמין</span>
            )}

            {/* Official Price Comparison */}
            {officialPrice && lowestPrice && officialPrice.price > lowestPrice.price && (
              <p className="text-sm text-gray-500">
                בלגו רשמי: {formatPrice(officialPrice.price)}
              </p>
            )}
          </div>

          {/* Store Info */}
          {lowestPrice && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {stores[lowestPrice.storeId]?.nameHe || lowestPrice.storeId}
                </span>
              </div>
              <span className={cn(
                'text-xs font-medium',
                lowestPrice.inStock ? 'text-green-600' : 'text-red-500'
              )}>
                {lowestPrice.inStock ? 'במלאי' : 'אזל'}
              </span>
            </div>
          )}

          {/* Actions */}
          {showCompare && lowestPrice && (
            <div className="flex gap-2 mt-3">
              <Link
                to={`/product/${product.sku}`}
                className="flex-1 btn-lego text-center text-sm py-2"
              >
                השווה מחירים ({product.prices.length})
              </Link>
              <button
                onClick={(e) => handleBuyClick(e, lowestPrice.url)}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                title="עבור לחנות"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
