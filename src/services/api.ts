/**
 * API Service
 *
 * Handles all API calls to the backend (Supabase)
 */

import { supabase } from '@/lib/supabase'
import type {
  LegoProduct,
  ProductWithPrices,
  ProductPrice,
  PriceAlert,
  SearchFilters,
  SearchResults,
  User,
  LegoCategory,
  StoreName,
} from '@/types'

// ============================================
// PRODUCTS
// ============================================

/**
 * Search products with filters
 */
export async function searchProducts(
  filters: SearchFilters,
  page = 1,
  pageSize = 20
): Promise<SearchResults> {
  let query = supabase
    .from('products')
    .select(`
      *,
      prices (*)
    `)

  // Apply filters
  if (filters.query) {
    query = query.or(`name.ilike.%${filters.query}%,name_he.ilike.%${filters.query}%,sku.ilike.%${filters.query}%`)
  }

  if (filters.sku) {
    query = query.eq('sku', filters.sku)
  }

  if (filters.categories && filters.categories.length > 0) {
    query = query.in('category', filters.categories)
  }

  // Pagination
  const start = (page - 1) * pageSize
  query = query.range(start, start + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Search error:', error)
    throw error
  }

  // Transform data to ProductWithPrices
  const products: ProductWithPrices[] = (data || []).map(transformProduct)

  // Apply client-side filters that require price data
  let filteredProducts = products

  if (filters.minPrice) {
    filteredProducts = filteredProducts.filter(
      p => p.lowestPrice && p.lowestPrice.price >= filters.minPrice!
    )
  }

  if (filters.maxPrice) {
    filteredProducts = filteredProducts.filter(
      p => p.lowestPrice && p.lowestPrice.price <= filters.maxPrice!
    )
  }

  if (filters.inStockOnly) {
    filteredProducts = filteredProducts.filter(
      p => p.lowestPrice?.inStock
    )
  }

  if (filters.onSaleOnly) {
    filteredProducts = filteredProducts.filter(
      p => p.lowestPrice?.isOnSale
    )
  }

  if (filters.stores && filters.stores.length > 0) {
    filteredProducts = filteredProducts.filter(
      p => p.prices.some(pr => filters.stores!.includes(pr.storeId as StoreName))
    )
  }

  // Sort
  filteredProducts = sortProducts(filteredProducts, filters.sortBy)

  return {
    products: filteredProducts,
    totalCount: count || filteredProducts.length,
    page,
    pageSize,
    hasMore: filteredProducts.length === pageSize,
  }
}

/**
 * Get product by SKU
 */
export async function getProductBySku(sku: string): Promise<ProductWithPrices | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      prices (*)
    `)
    .eq('sku', sku)
    .single()

  if (error || !data) {
    return null
  }

  return transformProduct(data)
}

/**
 * Get hot deals
 */
export async function getHotDeals(limit = 10): Promise<ProductWithPrices[]> {
  const { data, error } = await supabase
    .from('hot_deals')
    .select('*')
    .limit(limit)

  if (error || !data) {
    return []
  }

  // Transform and return
  return data.map((deal: { product_id: string }) => ({
    ...deal,
    id: deal.product_id,
  })) as ProductWithPrices[]
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  category: LegoCategory,
  page = 1,
  pageSize = 20
): Promise<SearchResults> {
  return searchProducts({ categories: [category] }, page, pageSize)
}

// ============================================
// ALERTS
// ============================================

/**
 * Create a price alert
 */
export async function createAlert(alert: Omit<PriceAlert, 'id' | 'createdAt'>): Promise<PriceAlert> {
  const { data, error } = await supabase
    .from('alerts')
    .insert({
      user_id: alert.userId,
      product_id: alert.productId,
      category: alert.category,
      target_price: alert.targetPrice,
      notify_on_any_discount: alert.notifyOnAnyDiscount,
      is_active: alert.isActive,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return {
    id: data.id,
    userId: data.user_id,
    productId: data.product_id,
    category: data.category,
    targetPrice: data.target_price,
    notifyOnAnyDiscount: data.notify_on_any_discount,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
    lastTriggered: data.last_triggered ? new Date(data.last_triggered) : undefined,
  }
}

/**
 * Get user's alerts
 */
export async function getUserAlerts(userId: string): Promise<PriceAlert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    return []
  }

  return data.map(transformAlert)
}

/**
 * Delete an alert
 */
export async function deleteAlert(alertId: string): Promise<void> {
  const { error } = await supabase
    .from('alerts')
    .delete()
    .eq('id', alertId)

  if (error) {
    throw error
  }
}

/**
 * Toggle alert active status
 */
export async function toggleAlertStatus(alertId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('alerts')
    .update({ is_active: isActive })
    .eq('id', alertId)

  if (error) {
    throw error
  }
}

// ============================================
// USERS
// ============================================

/**
 * Create or get user by email
 */
export async function getOrCreateUser(email: string, name?: string): Promise<User> {
  // Check if user exists
  const { data: existing } = await supabase
    .from('users')
    .select()
    .eq('email', email)
    .single()

  if (existing) {
    return {
      id: existing.id,
      email: existing.email,
      name: existing.name,
      createdAt: new Date(existing.created_at),
    }
  }

  // Create new user
  const { data, error } = await supabase
    .from('users')
    .insert({ email, name })
    .select()
    .single()

  if (error) {
    throw error
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    createdAt: new Date(data.created_at),
  }
}

// ============================================
// PRICE HISTORY
// ============================================

/**
 * Get price history for a product
 */
export async function getPriceHistory(
  productId: string,
  storeId?: StoreName,
  days = 30
): Promise<{ date: Date; price: number; storeId: string }[]> {
  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - days)

  let query = supabase
    .from('price_history')
    .select('*')
    .eq('product_id', productId)
    .gte('recorded_at', fromDate.toISOString())
    .order('recorded_at', { ascending: true })

  if (storeId) {
    query = query.eq('store_id', storeId)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data.map((record: { recorded_at: string; price: number; store_id: string }) => ({
    date: new Date(record.recorded_at),
    price: record.price,
    storeId: record.store_id,
  }))
}

// ============================================
// HELPERS
// ============================================

function transformProduct(data: Record<string, unknown>): ProductWithPrices {
  const prices: ProductPrice[] = (data.prices as Record<string, unknown>[] || []).map((p) => ({
    id: p.id as string,
    productId: p.product_id as string,
    storeId: p.store_id as StoreName,
    price: p.price as number,
    originalPrice: p.original_price as number | undefined,
    currency: (p.currency as 'ILS' | 'USD') || 'ILS',
    inStock: p.in_stock as boolean,
    url: p.url as string,
    lastUpdated: new Date(p.last_updated as string),
    isOnSale: p.is_on_sale as boolean,
    discountPercentage: p.discount_percentage as number | undefined,
  }))

  // Find lowest and official prices
  const inStockPrices = prices.filter(p => p.inStock)
  const lowestPrice = inStockPrices.length > 0
    ? inStockPrices.reduce((min, p) => p.price < min.price ? p : min)
    : undefined

  const officialPrice = prices.find(p => p.storeId === 'lego-official')

  const savingsFromOfficial = officialPrice && lowestPrice
    ? Math.max(0, officialPrice.price - lowestPrice.price)
    : undefined

  return {
    id: data.id as string,
    sku: data.sku as string,
    name: data.name as string,
    nameHe: data.name_he as string,
    category: data.category as LegoCategory,
    description: data.description as string | undefined,
    pieceCount: data.piece_count as number | undefined,
    minAge: data.min_age as number | undefined,
    imageUrl: data.image_url as string,
    images: data.images as string[] | undefined,
    releaseYear: data.release_year as number | undefined,
    isRetired: data.is_retired as boolean,
    createdAt: new Date(data.created_at as string),
    updatedAt: new Date(data.updated_at as string),
    prices,
    lowestPrice,
    officialPrice,
    savingsFromOfficial,
  }
}

function transformAlert(data: Record<string, unknown>): PriceAlert {
  return {
    id: data.id as string,
    userId: data.user_id as string,
    productId: data.product_id as string | undefined,
    category: data.category as LegoCategory | undefined,
    targetPrice: data.target_price as number | undefined,
    notifyOnAnyDiscount: data.notify_on_any_discount as boolean,
    isActive: data.is_active as boolean,
    createdAt: new Date(data.created_at as string),
    lastTriggered: data.last_triggered ? new Date(data.last_triggered as string) : undefined,
  }
}

function sortProducts(
  products: ProductWithPrices[],
  sortBy?: SearchFilters['sortBy']
): ProductWithPrices[] {
  const sorted = [...products]

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) =>
        (a.lowestPrice?.price || Infinity) - (b.lowestPrice?.price || Infinity)
      )
    case 'price-desc':
      return sorted.sort((a, b) =>
        (b.lowestPrice?.price || 0) - (a.lowestPrice?.price || 0)
      )
    case 'discount':
      return sorted.sort((a, b) =>
        (b.lowestPrice?.discountPercentage || 0) - (a.lowestPrice?.discountPercentage || 0)
      )
    case 'name':
      return sorted.sort((a, b) => a.nameHe.localeCompare(b.nameHe, 'he'))
    case 'newest':
      return sorted.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    default:
      return sorted
  }
}
