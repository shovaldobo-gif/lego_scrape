import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Heart,
  Bell,
  Share2,
  ArrowRight,
  Package,
  Calendar,
  Users,
  ExternalLink,
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import PriceComparisonTable from '@/components/PriceComparisonTable'
import AlertForm from '@/components/AlertForm'
import { useStore } from '@/store/useStore'
import type { ProductWithPrices } from '@/types'
import { categoryNames } from '@/types'
import { formatPrice, cn } from '@/lib/utils'

// Mock data - will be replaced with real API calls
const mockProduct: ProductWithPrices = {
  id: '1',
  sku: '75192',
  name: 'Millennium Falcon',
  nameHe: 'מילניום פלקון',
  category: 'star-wars',
  description: 'הסט הגדול והמפורט ביותר של ספינת מילניום פלקון מסדרת מלחמת הכוכבים. כולל 7,541 חלקים ו-4 דמויות מיניפיגר.',
  pieceCount: 7541,
  minAge: 16,
  releaseYear: 2017,
  imageUrl: 'https://www.lego.com/cdn/cs/set/assets/blt5b9a78ce4dfd0dca/75192.png',
  images: [
    'https://www.lego.com/cdn/cs/set/assets/blt5b9a78ce4dfd0dca/75192.png',
    'https://www.lego.com/cdn/cs/set/assets/blt5b9a78ce4dfd0dca/75192_alt1.png',
    'https://www.lego.com/cdn/cs/set/assets/blt5b9a78ce4dfd0dca/75192_alt2.png',
  ],
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
    {
      id: 'p2',
      productId: '1',
      storeId: 'lego-official',
      price: 3499,
      currency: 'ILS',
      inStock: true,
      url: 'https://www.lego.com/he-il/product/millennium-falcon-75192',
      lastUpdated: new Date(),
      isOnSale: false,
    },
    {
      id: 'p3',
      productId: '1',
      storeId: 'bug',
      price: 2899,
      originalPrice: 3299,
      currency: 'ILS',
      inStock: true,
      url: 'https://www.bug.co.il/75192',
      lastUpdated: new Date(),
      isOnSale: true,
      discountPercentage: 12,
    },
    {
      id: 'p4',
      productId: '1',
      storeId: 'ivory',
      price: 3199,
      currency: 'ILS',
      inStock: false,
      url: 'https://www.ivory.co.il/75192',
      lastUpdated: new Date(),
      isOnSale: false,
    },
    {
      id: 'p5',
      productId: '1',
      storeId: 'toys-r-us',
      price: 3099,
      originalPrice: 3499,
      currency: 'ILS',
      inStock: true,
      url: 'https://www.toysrus.co.il/75192',
      lastUpdated: new Date(),
      isOnSale: true,
      discountPercentage: 11,
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
  officialPrice: {
    id: 'p2',
    productId: '1',
    storeId: 'lego-official',
    price: 3499,
    currency: 'ILS',
    inStock: true,
    url: 'https://www.lego.com/he-il/product/millennium-falcon-75192',
    lastUpdated: new Date(),
    isOnSale: false,
  },
  savingsFromOfficial: 700,
}

export default function ProductPage() {
  const { sku } = useParams<{ sku: string }>()
  const [product, setProduct] = useState<ProductWithPrices | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showAlertForm, setShowAlertForm] = useState(false)

  const { favorites, addFavorite, removeFavorite, isFavorite, addToRecentlyViewed } = useStore()
  const isLiked = product ? isFavorite(product.id) : false

  useEffect(() => {
    // Simulate API call
    setIsLoading(true)
    setTimeout(() => {
      setProduct(mockProduct)
      setIsLoading(false)
      // Add to recently viewed
      addToRecentlyViewed(mockProduct.id)
    }, 500)
  }, [sku])

  const handleFavoriteClick = () => {
    if (!product) return
    if (isLiked) {
      removeFavorite(product.id)
      toast.success('הוסר מהמועדפים')
    } else {
      addFavorite(product.id)
      toast.success('נוסף למועדפים')
    }
  }

  const handleShare = async () => {
    if (!product) return
    try {
      await navigator.share({
        title: product.nameHe,
        text: `צפה במחירים של ${product.nameHe} (#${product.sku})`,
        url: window.location.href,
      })
    } catch {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('הקישור הועתק!')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="skeleton h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="skeleton aspect-square rounded-xl" />
            <div className="space-y-4">
              <div className="skeleton h-10 w-3/4" />
              <div className="skeleton h-6 w-1/2" />
              <div className="skeleton h-20 w-full" />
              <div className="skeleton h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold mb-2">המוצר לא נמצא</h1>
        <p className="text-gray-600 mb-4">לא מצאנו מוצר עם מק״ט {sku}</p>
        <Link to="/search" className="btn-lego">
          חזרה לחיפוש
        </Link>
      </div>
    )
  }

  const officialPrice = product.officialPrice?.price
  const lowestPrice = product.lowestPrice

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-lego-blue">ראשי</Link>
        <ArrowRight className="w-4 h-4" />
        <Link to={`/category/${product.category}`} className="hover:text-lego-blue">
          {categoryNames[product.category]}
        </Link>
        <ArrowRight className="w-4 h-4" />
        <span className="text-gray-900">{product.nameHe}</span>
      </nav>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="aspect-square bg-gray-100 p-8">
              <img
                src={product.images?.[selectedImage] || product.imageUrl}
                alt={product.nameHe}
                className="w-full h-full object-contain"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors',
                      selectedImage === index ? 'border-lego-yellow' : 'border-transparent'
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Category & SKU */}
          <div className="flex items-center gap-2">
            <Link
              to={`/category/${product.category}`}
              className="badge bg-gray-100 text-gray-700 hover:bg-lego-yellow transition-colors"
            >
              {categoryNames[product.category]}
            </Link>
            <span className="text-gray-500">#{product.sku}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold">{product.nameHe}</h1>
          <p className="text-gray-500">{product.name}</p>

          {/* Price Summary */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
            <div className="flex items-baseline gap-4">
              <span className="text-sm text-gray-600">המחיר הזול ביותר:</span>
              <span className="text-4xl font-bold text-green-600">
                {lowestPrice ? formatPrice(lowestPrice.price) : 'לא זמין'}
              </span>
            </div>
            {officialPrice && lowestPrice && officialPrice > lowestPrice.price && (
              <p className="mt-2 text-green-700">
                חסכון של ₪{officialPrice - lowestPrice.price} מהחנות הרשמית!
              </p>
            )}
            {lowestPrice && (
              <a
                href={lowestPrice.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-lego mt-4 inline-flex items-center gap-2"
              >
                קנה עכשיו
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleFavoriteClick}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors',
                isLiked
                  ? 'border-lego-red bg-red-50 text-lego-red'
                  : 'border-gray-200 hover:border-lego-red hover:text-lego-red'
              )}
            >
              <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
              {isLiked ? 'במועדפים' : 'הוסף למועדפים'}
            </button>
            <button
              onClick={() => setShowAlertForm(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-lego-blue hover:text-lego-blue transition-colors"
            >
              <Bell className="w-5 h-5" />
              התרעת מחיר
            </button>
            <button
              onClick={handleShare}
              className="p-3 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-4">
            {product.pieceCount && (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Package className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-2xl font-bold">{product.pieceCount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">חלקים</p>
              </div>
            )}
            {product.minAge && (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-2xl font-bold">{product.minAge}+</p>
                <p className="text-sm text-gray-500">גיל מומלץ</p>
              </div>
            )}
            {product.releaseYear && (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-2xl font-bold">{product.releaseYear}</p>
                <p className="text-sm text-gray-500">שנת יציאה</p>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="font-bold mb-2">תיאור</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Price Comparison Table */}
      <section>
        <h2 className="text-2xl font-bold mb-6">השוואת מחירים</h2>
        <PriceComparisonTable
          prices={product.prices}
          officialPrice={officialPrice}
        />
      </section>

      {/* Alert Form Modal */}
      {showAlertForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <AlertForm product={product} onClose={() => setShowAlertForm(false)} />
        </div>
      )}
    </div>
  )
}
