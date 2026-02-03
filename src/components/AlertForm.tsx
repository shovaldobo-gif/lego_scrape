import { useState } from 'react'
import { Bell, Mail, DollarSign, Tag, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import type { LegoCategory, PriceAlert, LegoProduct } from '@/types'
import { categoryNames } from '@/types'
import { useStore } from '@/store/useStore'
import { isValidEmail, cn } from '@/lib/utils'

interface AlertFormProps {
  product?: LegoProduct
  onClose?: () => void
}

export default function AlertForm({ product, onClose }: AlertFormProps) {
  const { user, addAlert } = useStore()
  const [email, setEmail] = useState(user?.email || '')
  const [targetPrice, setTargetPrice] = useState('')
  const [notifyOnAnyDiscount, setNotifyOnAnyDiscount] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<LegoCategory | ''>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !isValidEmail(email)) {
      toast.error('נא להזין כתובת אימייל תקינה')
      return
    }

    if (!product && !selectedCategory) {
      toast.error('נא לבחור מוצר או קטגוריה')
      return
    }

    setIsSubmitting(true)

    try {
      const newAlert: PriceAlert = {
        id: `alert-${Date.now()}`,
        userId: user?.id || `guest-${email}`,
        productId: product?.id,
        category: selectedCategory || undefined,
        targetPrice: targetPrice ? Number(targetPrice) : undefined,
        notifyOnAnyDiscount,
        isActive: true,
        createdAt: new Date(),
      }

      addAlert(newAlert)
      toast.success('ההתרעה נוספה בהצלחה! נעדכן אותך כשיהיו שינויי מחיר.')
      onClose?.()
    } catch (error) {
      toast.error('שגיאה ביצירת ההתרעה')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md w-full mx-auto"
    >
      {/* Header */}
      <div className="bg-lego-yellow p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6" />
          <h3 className="font-bold text-lg">הוסף התרעת מחיר</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Product Info */}
        {product && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <img
              src={product.imageUrl}
              alt={product.nameHe}
              className="w-16 h-16 object-contain"
            />
            <div>
              <p className="font-medium">{product.nameHe}</p>
              <p className="text-sm text-gray-500">#{product.sku}</p>
            </div>
          </div>
        )}

        {/* Category Selection (if no product) */}
        {!product && (
          <div>
            <label className="block text-sm font-medium mb-2">
              <Tag className="w-4 h-4 inline ml-1" />
              קטגוריה
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as LegoCategory)}
              className="input"
            >
              <option value="">בחר קטגוריה</option>
              {(Object.entries(categoryNames) as [LegoCategory, string][]).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Mail className="w-4 h-4 inline ml-1" />
            אימייל לעדכונים
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="input"
            dir="ltr"
            required
          />
        </div>

        {/* Target Price */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <DollarSign className="w-4 h-4 inline ml-1" />
            מחיר יעד (אופציונלי)
          </label>
          <div className="relative">
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="למשל: 500"
              className="input pr-8"
              min="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">₪</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            תקבל התרעה כשהמחיר יירד מתחת למחיר הזה
          </p>
        </div>

        {/* Notify on any discount */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={notifyOnAnyDiscount}
            onChange={(e) => setNotifyOnAnyDiscount(e.target.checked)}
            className="w-4 h-4 text-lego-yellow rounded focus:ring-lego-yellow"
          />
          <span className="text-sm">עדכן אותי על כל הנחה או מבצע</span>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'btn-lego w-full flex items-center justify-center gap-2',
            isSubmitting && 'opacity-70 cursor-not-allowed'
          )}
        >
          {isSubmitting ? (
            <span>שומר...</span>
          ) : (
            <>
              <Bell className="w-5 h-5" />
              <span>הפעל התרעה</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          לא נשלח לך ספאם. רק עדכונים על שינויי מחיר.
        </p>
      </form>
    </motion.div>
  )
}
