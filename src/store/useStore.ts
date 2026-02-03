import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SearchFilters, LegoCategory, StoreName, User, PriceAlert } from '@/types'

interface AppState {
  // User
  user: User | null
  setUser: (user: User | null) => void

  // Search & Filters
  searchQuery: string
  setSearchQuery: (query: string) => void
  filters: SearchFilters
  setFilters: (filters: SearchFilters) => void
  resetFilters: () => void

  // Alerts
  alerts: PriceAlert[]
  addAlert: (alert: PriceAlert) => void
  removeAlert: (alertId: string) => void
  toggleAlert: (alertId: string) => void

  // Favorites
  favorites: string[] // Product IDs
  addFavorite: (productId: string) => void
  removeFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean

  // Recently Viewed
  recentlyViewed: string[] // Product IDs
  addToRecentlyViewed: (productId: string) => void

  // UI State
  isSidebarOpen: boolean
  toggleSidebar: () => void
  isFiltersOpen: boolean
  toggleFilters: () => void
}

const defaultFilters: SearchFilters = {
  query: '',
  categories: [],
  stores: [],
  inStockOnly: true,
  onSaleOnly: false,
  sortBy: 'price-asc',
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),

      // Search & Filters
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      filters: defaultFilters,
      setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
      resetFilters: () => set({ filters: defaultFilters }),

      // Alerts
      alerts: [],
      addAlert: (alert) => set({ alerts: [...get().alerts, alert] }),
      removeAlert: (alertId) =>
        set({ alerts: get().alerts.filter((a) => a.id !== alertId) }),
      toggleAlert: (alertId) =>
        set({
          alerts: get().alerts.map((a) =>
            a.id === alertId ? { ...a, isActive: !a.isActive } : a
          ),
        }),

      // Favorites
      favorites: [],
      addFavorite: (productId) =>
        set({ favorites: [...new Set([...get().favorites, productId])] }),
      removeFavorite: (productId) =>
        set({ favorites: get().favorites.filter((id) => id !== productId) }),
      isFavorite: (productId) => get().favorites.includes(productId),

      // Recently Viewed
      recentlyViewed: [],
      addToRecentlyViewed: (productId) => {
        const current = get().recentlyViewed.filter((id) => id !== productId)
        set({ recentlyViewed: [productId, ...current].slice(0, 20) })
      },

      // UI State
      isSidebarOpen: false,
      toggleSidebar: () => set({ isSidebarOpen: !get().isSidebarOpen }),
      isFiltersOpen: false,
      toggleFilters: () => set({ isFiltersOpen: !get().isFiltersOpen }),
    }),
    {
      name: 'lego-price-comparison-storage',
      partialize: (state) => ({
        user: state.user,
        favorites: state.favorites,
        recentlyViewed: state.recentlyViewed,
        alerts: state.alerts,
      }),
    }
  )
)

// Selector hooks
export const useUser = () => useStore((state) => state.user)
export const useFilters = () => useStore((state) => state.filters)
export const useFavorites = () => useStore((state) => state.favorites)
export const useAlerts = () => useStore((state) => state.alerts)
