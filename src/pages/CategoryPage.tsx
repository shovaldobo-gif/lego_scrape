import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProductGrid from '@/components/ProductGrid'
import CategoryGrid from '@/components/CategoryGrid'
import type { ProductWithPrices, LegoCategory } from '@/types'
import { categoryNames } from '@/types'

// Category images/descriptions
const categoryInfo: Record<LegoCategory, { emoji: string; description: string }> = {
  'star-wars': {
    emoji: '⚔️',
    description: 'בנה את הספינות, הכלי רכב והסצנות האייקוניים מהגלקסיה הרחוקה',
  },
  'technic': {
    emoji: '⚙️',
    description: 'מודלים מכניים מתקדמים עם מנועים ופונקציות אמיתיות',
  },
  'city': {
    emoji: '🏙️',
    description: 'בנה עיר שלמה עם בניינים, כלי רכב ודמויות',
  },
  'creator': {
    emoji: '🎨',
    description: 'סטים יצירתיים עם אפשרויות בנייה מרובות',
  },
  'friends': {
    emoji: '💜',
    description: 'עולם של חברות, הרפתקאות וכיף',
  },
  'ninjago': {
    emoji: '🥷',
    description: "הצטרף לנינג'ות בקרבות אפיים",
  },
  'harry-potter': {
    emoji: '⚡',
    description: 'הקסם של הוגוורטס בקופסאות לגו',
  },
  'marvel': {
    emoji: '🦸',
    description: 'גיבורי העל האהובים מיקום מארוול',
  },
  'dc': {
    emoji: '🦇',
    description: 'באטמן, סופרמן וגיבורי DC',
  },
  'disney': {
    emoji: '🏰',
    description: 'הנסיכות, הטירות והדמויות האהובות',
  },
  'architecture': {
    emoji: '🏛️',
    description: 'בניינים מפורסמים מרחבי העולם',
  },
  'ideas': {
    emoji: '💡',
    description: 'סטים ייחודיים שנוצרו על ידי אוהדים',
  },
  'speed-champions': {
    emoji: '🏎️',
    description: 'מכוניות מירוץ אמיתיות בגרסת לגו',
  },
  'duplo': {
    emoji: '🧸',
    description: 'לגו לילדים הקטנים',
  },
  'minecraft': {
    emoji: '⛏️',
    description: 'עולמות המשחק הפופולרי בלגו',
  },
  'icons': {
    emoji: '🌟',
    description: 'סטים מיוחדים ומפוארים למבוגרים',
  },
  'botanicals': {
    emoji: '🌸',
    description: 'פרחים וצמחים מלגו',
  },
  'other': {
    emoji: '🧱',
    description: 'עוד סטים נהדרים',
  },
}

// Mock data
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
]

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>()
  const [products, setProducts] = useState<ProductWithPrices[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const categoryKey = category as LegoCategory
  const isValidCategory = categoryKey && categoryKey in categoryNames

  useEffect(() => {
    if (!isValidCategory) return

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      // Filter products by category
      const filtered = mockProducts.filter((p) => p.category === categoryKey)
      setProducts(filtered.length > 0 ? filtered : mockProducts) // Show all if no matches
      setIsLoading(false)
    }, 500)
  }, [category, isValidCategory])

  if (!isValidCategory) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">כל הקטגוריות</h1>
        <CategoryGrid />
      </div>
    )
  }

  const info = categoryInfo[categoryKey]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-lego-blue">ראשי</Link>
        <ArrowRight className="w-4 h-4" />
        <span className="text-gray-900">{categoryNames[categoryKey]}</span>
      </nav>

      {/* Category Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-4">
          <div className="text-6xl">{info.emoji}</div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{categoryNames[categoryKey]}</h1>
            <p className="text-gray-300">{info.description}</p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          {isLoading ? 'טוען...' : `${products.length} מוצרים`}
        </p>
        <select className="input py-2 w-auto">
          <option value="price-asc">מחיר: מהנמוך לגבוה</option>
          <option value="price-desc">מחיר: מהגבוה לנמוך</option>
          <option value="discount">אחוז הנחה</option>
          <option value="newest">חדשים</option>
        </select>
      </div>

      <ProductGrid products={products} isLoading={isLoading} />

      {/* Other Categories */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">קטגוריות נוספות</h2>
        <CategoryGrid
          categories={
            (Object.keys(categoryNames) as LegoCategory[]).filter(
              (c) => c !== categoryKey && c !== 'other'
            ).slice(0, 6)
          }
        />
      </section>
    </div>
  )
}
