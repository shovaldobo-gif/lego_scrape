import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Search, Bell, Heart, Menu, X, Flame, Tag } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

export default function Header() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { favorites, alerts } = useStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const navLinks = [
    { href: '/deals', label: 'מבצעים', icon: Flame },
    { href: '/category/star-wars', label: 'קטגוריות', icon: Tag },
    { href: '/alerts', label: 'התרעות', icon: Bell, badge: alerts.length },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Top banner */}
      <div className="bg-lego-red text-white text-center py-2 text-sm">
        <span className="font-medium">מצא את המחירים הזולים ביותר ללגו בישראל!</span>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-lego-yellow rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold">🧱</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-lego-black leading-tight">לגו ישראל</h1>
              <p className="text-xs text-gray-500">השוואת מחירים</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="חפש מק״ט או שם מוצר..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pr-12"
              />
              <button
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-lego-yellow rounded-lg hover:bg-yellow-400 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="relative flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
                {link.badge ? (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-lego-red text-white text-xs rounded-full flex items-center justify-center">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            ))}
            <Link
              to="/favorites"
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Heart className={cn('w-6 h-6', favorites.length > 0 && 'fill-lego-red text-lego-red')} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-lego-red text-white text-xs rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Search Bar - Mobile */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="חפש מק״ט או שם מוצר..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pr-4 pl-12"
            />
            <button
              type="submit"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-lego-yellow rounded-lg"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
                {link.badge ? (
                  <span className="mr-auto bg-lego-red text-white text-xs px-2 py-1 rounded-full">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            ))}
            <Link
              to="/favorites"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
            >
              <Heart className="w-5 h-5" />
              <span className="font-medium">מועדפים</span>
              {favorites.length > 0 && (
                <span className="mr-auto bg-lego-red text-white text-xs px-2 py-1 rounded-full">
                  {favorites.length}
                </span>
              )}
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
