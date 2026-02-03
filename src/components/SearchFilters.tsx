import { useState } from 'react'
import { X, ChevronDown, ChevronUp, Filter, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { categoryNames, stores, type LegoCategory, type StoreName, type SearchFilters } from '@/types'
import { cn } from '@/lib/utils'

interface SearchFiltersProps {
  filters: SearchFilters
  onChange: (filters: SearchFilters) => void
  onReset: () => void
  isOpen: boolean
  onToggle: () => void
  totalResults?: number
}

export default function SearchFiltersComponent({
  filters,
  onChange,
  onReset,
  isOpen,
  onToggle,
  totalResults,
}: SearchFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    stores: true,
    price: true,
    options: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleCategoryChange = (category: LegoCategory) => {
    const current = filters.categories || []
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category]
    onChange({ ...filters, categories: updated })
  }

  const handleStoreChange = (store: StoreName) => {
    const current = filters.stores || []
    const updated = current.includes(store)
      ? current.filter((s) => s !== store)
      : [...current, store]
    onChange({ ...filters, stores: updated })
  }

  const handleSortChange = (sortBy: SearchFilters['sortBy']) => {
    onChange({ ...filters, sortBy })
  }

  const activeFiltersCount =
    (filters.categories?.length || 0) +
    (filters.stores?.length || 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.onSaleOnly ? 1 : 0)

  const categories = Object.entries(categoryNames) as [LegoCategory, string][]
  const storeList = Object.values(stores).filter((s) => s.id !== 'other')

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="md:hidden fixed bottom-4 right-4 z-40 btn-lego flex items-center gap-2 shadow-lg"
      >
        <Filter className="w-5 h-5" />
        סינון
        {activeFiltersCount > 0 && (
          <span className="bg-lego-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Filters Panel */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 768) && (
          <>
            {/* Mobile Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
            />

            {/* Filters Content */}
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className={cn(
                'bg-white rounded-xl shadow-lg overflow-hidden',
                'md:sticky md:top-24',
                'fixed right-0 top-0 bottom-0 w-80 z-50 md:relative md:w-full md:z-0'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  <h3 className="font-bold">סינון ומיון</h3>
                  {totalResults !== undefined && (
                    <span className="text-sm text-gray-500">
                      ({totalResults} תוצאות)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onReset}
                    className="p-2 text-gray-500 hover:text-lego-red transition-colors"
                    title="נקה סינון"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onToggle}
                    className="md:hidden p-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium mb-2">מיון לפי</label>
                  <select
                    value={filters.sortBy || 'price-asc'}
                    onChange={(e) => handleSortChange(e.target.value as SearchFilters['sortBy'])}
                    className="input text-sm"
                  >
                    <option value="price-asc">מחיר: מהנמוך לגבוה</option>
                    <option value="price-desc">מחיר: מהגבוה לנמוך</option>
                    <option value="discount">אחוז הנחה</option>
                    <option value="name">שם</option>
                    <option value="newest">חדשים</option>
                  </select>
                </div>

                {/* Quick Options */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStockOnly || false}
                      onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
                      className="w-4 h-4 text-lego-yellow rounded focus:ring-lego-yellow"
                    />
                    <span className="text-sm">במלאי בלבד</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.onSaleOnly || false}
                      onChange={(e) => onChange({ ...filters, onSaleOnly: e.target.checked })}
                      className="w-4 h-4 text-lego-yellow rounded focus:ring-lego-yellow"
                    />
                    <span className="text-sm">במבצע בלבד</span>
                  </label>
                </div>

                {/* Price Range */}
                <div>
                  <button
                    onClick={() => toggleSection('price')}
                    className="flex items-center justify-between w-full py-2 font-medium"
                  >
                    טווח מחירים
                    {expandedSections.price ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections.price && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="number"
                        placeholder="מינימום"
                        value={filters.minPrice || ''}
                        onChange={(e) =>
                          onChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })
                        }
                        className="input text-sm flex-1"
                      />
                      <span className="self-center text-gray-400">-</span>
                      <input
                        type="number"
                        placeholder="מקסימום"
                        value={filters.maxPrice || ''}
                        onChange={(e) =>
                          onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })
                        }
                        className="input text-sm flex-1"
                      />
                    </div>
                  )}
                </div>

                {/* Categories */}
                <div>
                  <button
                    onClick={() => toggleSection('categories')}
                    className="flex items-center justify-between w-full py-2 font-medium"
                  >
                    קטגוריות
                    {expandedSections.categories ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections.categories && (
                    <div className="space-y-1 mt-2 max-h-48 overflow-y-auto">
                      {categories.map(([key, name]) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={filters.categories?.includes(key) || false}
                            onChange={() => handleCategoryChange(key)}
                            className="w-4 h-4 text-lego-yellow rounded focus:ring-lego-yellow"
                          />
                          <span className="text-sm">{name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stores */}
                <div>
                  <button
                    onClick={() => toggleSection('stores')}
                    className="flex items-center justify-between w-full py-2 font-medium"
                  >
                    חנויות
                    {expandedSections.stores ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections.stores && (
                    <div className="space-y-1 mt-2">
                      {storeList.map((store) => (
                        <label key={store.id} className="flex items-center gap-2 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={filters.stores?.includes(store.id) || false}
                            onChange={() => handleStoreChange(store.id)}
                            className="w-4 h-4 text-lego-yellow rounded focus:ring-lego-yellow"
                          />
                          <span className="text-sm">{store.nameHe}</span>
                          {store.isOfficial && (
                            <span className="text-xs bg-lego-yellow px-1 rounded">רשמי</span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Apply Button - Mobile */}
              <div className="md:hidden p-4 border-t bg-gray-50">
                <button onClick={onToggle} className="btn-lego w-full">
                  הצג תוצאות
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
