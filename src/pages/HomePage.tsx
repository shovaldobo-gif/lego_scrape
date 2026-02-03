import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, TrendingUp, Bell, ShoppingBag, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import CategoryGrid from '@/components/CategoryGrid'
import HotDeals from '@/components/HotDeals'
import ProductGrid from '@/components/ProductGrid'
import type { ProductWithPrices, LegoCategory } from '@/types'

// Mock data - will be replaced with real API calls
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
    prices: [
      {
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
    ],
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
    prices: [
      {
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
    ],
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

const popularCategories: LegoCategory[] = [
  'star-wars',
  'technic',
  'city',
  'harry-potter',
  'marvel',
  'creator',
]

export default function HomePage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-lego-yellow via-yellow-400 to-lego-orange py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              מצא את המחיר הזול ביותר ללגו בישראל
            </h1>
            <p className="text-xl text-black/80 mb-8">
              השווה מחירים בין כל החנויות וחסוך עד 40% על קופסאות לגו
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חפש לפי מק״ט (75192) או שם (מילניום פלקון)"
                  className="w-full px-6 py-4 pr-14 text-lg rounded-full border-2 border-black/20 focus:border-black focus:ring-0 outline-none shadow-lg"
                />
                <button
                  type="submit"
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  <Search className="w-6 h-6" />
                </button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 mt-10">
              {[
                { icon: ShoppingBag, label: 'מוצרים', value: '5,000+' },
                { icon: TrendingUp, label: 'חנויות', value: '9' },
                { icon: Bell, label: 'התרעות פעילות', value: '2,500+' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-2 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full"
                >
                  <stat.icon className="w-5 h-5" />
                  <span className="font-bold">{stat.value}</span>
                  <span className="text-black/70">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Hot Deals */}
        <HotDeals deals={mockDeals} />

        {/* Categories */}
        <section className="py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">קטגוריות פופולריות</h2>
            <Link
              to="/search"
              className="flex items-center gap-1 text-lego-blue hover:underline font-medium"
            >
              לכל הקטגוריות
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          <CategoryGrid categories={popularCategories} />
        </section>

        {/* Recently Added */}
        <section className="py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">נוספו לאחרונה</h2>
            <Link
              to="/search?sort=newest"
              className="flex items-center gap-1 text-lego-blue hover:underline font-medium"
            >
              לכל המוצרים
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          <ProductGrid products={mockDeals} />
        </section>

        {/* CTA Section */}
        <section className="py-12">
          <div className="bg-gradient-to-r from-lego-blue to-blue-700 rounded-2xl p-8 text-white text-center">
            <Bell className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">לא רוצה לפספס הנחות?</h2>
            <p className="text-white/80 mb-6">
              הירשם להתרעות מחיר וקבל עדכונים כשהמחיר יורד על המוצרים שאתה רוצה
            </p>
            <Link to="/alerts" className="btn-lego inline-flex items-center gap-2">
              <Bell className="w-5 h-5" />
              הרשמה להתרעות
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="py-12">
          <h2 className="text-2xl font-bold text-center mb-8">איך זה עובד?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: 'חפש מוצר',
                description: 'הזן מק״ט או שם של קופסת לגו שאתה מחפש',
                emoji: '🔍',
              },
              {
                step: 2,
                title: 'השווה מחירים',
                description: 'צפה במחירים מכל החנויות בישראל במקום אחד',
                emoji: '📊',
              },
              {
                step: 3,
                title: 'קנה בזול',
                description: 'לחץ על הלינק ועבור ישירות לחנות הזולה ביותר',
                emoji: '💰',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl mb-4">{item.emoji}</div>
                <div className="inline-flex items-center justify-center w-8 h-8 bg-lego-yellow rounded-full font-bold mb-2">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
