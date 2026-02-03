import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price in ILS
export function formatPrice(price: number, currency: 'ILS' | 'USD' = 'ILS'): string {
  if (currency === 'USD') {
    return `$${price.toFixed(2)}`
  }
  return `₪${price.toLocaleString('he-IL')}`
}

// Calculate discount percentage
export function calculateDiscount(original: number, current: number): number {
  if (original <= 0) return 0
  return Math.round(((original - current) / original) * 100)
}

// Format date in Hebrew
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

// Format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'עכשיו'
  if (diffMins < 60) return `לפני ${diffMins} דקות`
  if (diffHours < 24) return `לפני ${diffHours} שעות`
  if (diffDays < 7) return `לפני ${diffDays} ימים`
  return formatDate(date)
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Generate product URL slug
export function generateSlug(sku: string, name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50)
  return `${sku}-${slug}`
}

// Parse SKU from URL
export function parseSkuFromUrl(url: string): string | null {
  const match = url.match(/(\d{4,6})/)
  return match ? match[1] : null
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Get lowest price from array
export function getLowestPrice(prices: { price: number; inStock: boolean }[]): number | null {
  const inStockPrices = prices.filter(p => p.inStock)
  if (inStockPrices.length === 0) return null
  return Math.min(...inStockPrices.map(p => p.price))
}

// Get official LEGO price
export function getOfficialPrice(prices: { storeId: string; price: number }[]): number | null {
  const official = prices.find(p => p.storeId === 'lego-official')
  return official ? official.price : null
}

// Calculate savings from official price
export function calculateSavings(currentPrice: number, officialPrice: number | null): number {
  if (!officialPrice || officialPrice <= currentPrice) return 0
  return officialPrice - currentPrice
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Storage helpers
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.error('Failed to save to localStorage')
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch {
      console.error('Failed to remove from localStorage')
    }
  },
}
