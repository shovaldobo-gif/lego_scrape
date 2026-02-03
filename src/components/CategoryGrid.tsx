import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { categoryNames, type LegoCategory } from '@/types'

interface CategoryGridProps {
  categories?: LegoCategory[]
  compact?: boolean
}

// Category images/emojis mapping
const categoryImages: Record<LegoCategory, { emoji: string; color: string }> = {
  'star-wars': { emoji: '⚔️', color: 'bg-gray-900' },
  'technic': { emoji: '⚙️', color: 'bg-orange-500' },
  'city': { emoji: '🏙️', color: 'bg-blue-500' },
  'creator': { emoji: '🎨', color: 'bg-green-500' },
  'friends': { emoji: '💜', color: 'bg-purple-500' },
  'ninjago': { emoji: '🥷', color: 'bg-red-600' },
  'harry-potter': { emoji: '⚡', color: 'bg-amber-700' },
  'marvel': { emoji: '🦸', color: 'bg-red-500' },
  'dc': { emoji: '🦇', color: 'bg-blue-900' },
  'disney': { emoji: '🏰', color: 'bg-pink-400' },
  'architecture': { emoji: '🏛️', color: 'bg-gray-600' },
  'ideas': { emoji: '💡', color: 'bg-yellow-500' },
  'speed-champions': { emoji: '🏎️', color: 'bg-red-600' },
  'duplo': { emoji: '🧸', color: 'bg-green-400' },
  'minecraft': { emoji: '⛏️', color: 'bg-emerald-600' },
  'icons': { emoji: '🌟', color: 'bg-indigo-600' },
  'botanicals': { emoji: '🌸', color: 'bg-pink-500' },
  'other': { emoji: '🧱', color: 'bg-gray-400' },
}

const allCategories = Object.keys(categoryNames) as LegoCategory[]

export default function CategoryGrid({ categories = allCategories, compact = false }: CategoryGridProps) {
  return (
    <div className={compact
      ? 'flex flex-wrap gap-2'
      : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'
    }>
      {categories.map((category, index) => {
        const { emoji, color } = categoryImages[category]

        if (compact) {
          return (
            <Link
              key={category}
              to={`/category/${category}`}
              className="category-chip"
            >
              <span className="ml-1">{emoji}</span>
              {categoryNames[category]}
            </Link>
          )
        }

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={`/category/${category}`}
              className="block group"
            >
              <div className={`${color} rounded-xl p-6 text-white text-center transition-transform group-hover:scale-105 group-hover:shadow-lg`}>
                <div className="text-4xl mb-2">{emoji}</div>
                <h3 className="font-bold">{categoryNames[category]}</h3>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
