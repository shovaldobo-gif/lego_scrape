import { useState } from 'react'
import { Bell, Trash2, ToggleLeft, ToggleRight, Plus, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import AlertForm from '@/components/AlertForm'
import { useStore } from '@/store/useStore'
import { categoryNames } from '@/types'
import { formatPrice, formatDate, cn } from '@/lib/utils'

export default function AlertsPage() {
  const { alerts, removeAlert, toggleAlert } = useStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [email, setEmail] = useState('')

  const handleDeleteAlert = (alertId: string) => {
    removeAlert(alertId)
    toast.success('ההתרעה נמחקה')
  }

  const handleToggleAlert = (alertId: string) => {
    toggleAlert(alertId)
    const alert = alerts.find((a) => a.id === alertId)
    toast.success(alert?.isActive ? 'ההתרעה כובתה' : 'ההתרעה הופעלה')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 bg-lego-blue text-white px-6 py-3 rounded-full mb-4">
          <Bell className="w-6 h-6" />
          <span className="font-bold text-xl">התרעות מחיר</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">לא מפספסים הנחות</h1>
        <p className="text-gray-600">
          הגדר התרעות וקבל עדכון כשהמחיר יורד
        </p>
      </motion.div>

      {/* Email Signup - if no alerts yet */}
      {alerts.length === 0 && !showAddForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto bg-gradient-to-br from-lego-yellow to-yellow-400 rounded-2xl p-8 text-center mb-8"
        >
          <Bell className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">עדיין אין לך התרעות</h2>
          <p className="text-black/70 mb-6">
            התחל לעקוב אחרי מוצרים שאתה רוצה ותקבל התרעה כשהמחיר יירד
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-lego-blue inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            הוסף התרעה ראשונה
          </button>
        </motion.div>
      )}

      {/* Add Alert Button */}
      {alerts.length > 0 && !showAddForm && (
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">{alerts.length} התרעות פעילות</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-lego inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            הוסף התרעה
          </button>
        </div>
      )}

      {/* Alerts List */}
      <div className="max-w-2xl mx-auto space-y-4">
        <AnimatePresence>
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'bg-white rounded-xl shadow-md p-4 border-r-4',
                alert.isActive ? 'border-green-500' : 'border-gray-300'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  'p-3 rounded-lg',
                  alert.isActive ? 'bg-green-100' : 'bg-gray-100'
                )}>
                  <Bell className={cn(
                    'w-6 h-6',
                    alert.isActive ? 'text-green-600' : 'text-gray-400'
                  )} />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {alert.productId ? (
                      <span className="font-bold">מוצר #{alert.productId}</span>
                    ) : alert.category ? (
                      <span className="font-bold">קטגוריה: {categoryNames[alert.category]}</span>
                    ) : (
                      <span className="font-bold">התרעה כללית</span>
                    )}
                    {!alert.isActive && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                        מושבתת
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-500 space-y-1">
                    {alert.targetPrice && (
                      <p>מחיר יעד: {formatPrice(alert.targetPrice)}</p>
                    )}
                    {alert.notifyOnAnyDiscount && (
                      <p>התרעה על כל הנחה</p>
                    )}
                    <p>נוצר: {formatDate(new Date(alert.createdAt))}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAlert(alert.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={alert.isActive ? 'כבה התרעה' : 'הפעל התרעה'}
                  >
                    {alert.isActive ? (
                      <ToggleRight className="w-6 h-6 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                    title="מחק התרעה"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Alert Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <AlertForm onClose={() => setShowAddForm(false)} />
        </div>
      )}

      {/* How it works */}
      <section className="mt-16 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">איך ההתרעות עובדות?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: 1,
              title: 'בחר מוצר',
              description: 'חפש מוצר ספציפי או בחר קטגוריה',
              emoji: '🔍',
            },
            {
              step: 2,
              title: 'הגדר התרעה',
              description: 'קבע מחיר יעד או התרעה על כל הנחה',
              emoji: '⚙️',
            },
            {
              step: 3,
              title: 'קבל עדכון',
              description: 'נשלח לך מייל כשהמחיר יירד',
              emoji: '📧',
            },
          ].map((item) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl mb-3">{item.emoji}</div>
              <h3 className="font-bold mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
