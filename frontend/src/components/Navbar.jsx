import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { translateCategory, translateCondition } from '../lib/translations'
import LanguageSwitcher from './LanguageSwitcher'

const categories = [
  'Electronics', 'Home & Kitchen', 'Sports & Outdoors', 'Fashion', 'Toys & Games',
  'Beauty & Personal Care', 'Automotive', 'Office & School', 'Baby & Kids', 'Patio & Garden',
]

const conditions = [
  { labelKey: 'conditions.openBoxDeals', value: 'open-box' },
  { labelKey: 'conditions.like-new', value: 'like-new' },
  { labelKey: 'conditions.refurbished', value: 'refurbished' },
]

export default function Navbar() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Main Header Bar */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center h-14 gap-4">
          {/* Logo */}
          <Link to="/" className="shrink-0 hover:opacity-90 transition">
            <img src="/logo-full.png" alt="Good Open Box" className="h-12 w-auto object-contain" />
          </Link>

          {/* Deliver to */}
          <div className="hidden lg:flex items-center gap-1 text-gray-300 hover:text-white cursor-pointer shrink-0 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="leading-tight">
              <div className="text-[11px] text-gray-400">{t('nav.deliverTo')}</div>
              <div className="text-sm font-bold">{t('nav.unitedStates')}</div>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 flex">
            <input
              type="text"
              placeholder={t('nav.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 bg-white text-gray-900 text-sm rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-400 min-w-0"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-amber-400 hover:bg-amber-500 rounded-r-md transition"
            >
              <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Account */}
          {user ? (
            <div className="relative group shrink-0">
              <button className="hidden md:flex flex-col items-start hover:ring-1 hover:ring-white rounded px-2 py-1 text-sm leading-tight">
                <span className="text-[11px] text-gray-300">{t('nav.hello', { name: user.name.split(' ')[0] })}</span>
                <span className="font-bold text-sm flex items-center gap-0.5">
                  {t('nav.account')}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div className="absolute right-0 mt-0 w-56 bg-white rounded-md shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-3 border-b">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Link to="/orders" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700">{t('nav.myOrders')}</Link>
                {user.role === 'vendor' && (
                  <>
                    <Link to="/vendor/dashboard" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700">{t('nav.vendorDashboard')}</Link>
                    <Link to="/vendor/products" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700">{t('nav.myProducts')}</Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700">{t('nav.adminDashboard')}</Link>
                )}
                <div className="border-t">
                  <button
                    onClick={() => { logout(); navigate('/') }}
                    className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                  >
                    {t('nav.signOut')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="hidden md:flex flex-col items-start hover:ring-1 hover:ring-white rounded px-2 py-1 shrink-0 text-sm leading-tight">
              <span className="text-[11px] text-gray-300">{t('nav.helloSignIn')}</span>
              <span className="font-bold">{t('nav.account')}</span>
            </Link>
          )}

          {/* Orders */}
          <Link to="/orders" className="hidden md:flex flex-col items-start hover:ring-1 hover:ring-white rounded px-2 py-1 shrink-0 text-sm leading-tight">
            <span className="text-[11px] text-gray-300">{t('nav.returns')}</span>
            <span className="font-bold">{t('nav.andOrders')}</span>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="flex items-end gap-1 hover:ring-1 hover:ring-white rounded px-2 py-1 shrink-0 relative">
            <div className="relative">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-amber-400 font-bold text-sm">
                {cartCount}
              </span>
            </div>
            <span className="font-bold text-sm hidden sm:block">{t('nav.cart')}</span>
          </Link>

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white ml-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Sub-nav Category Bar */}
      <div className="bg-gray-800 text-white text-sm hidden md:block">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center gap-1 h-10 overflow-x-auto">
          <Link to="/products" className="px-3 py-1 hover:ring-1 hover:ring-white rounded whitespace-nowrap font-medium">
            {t('nav.allProducts')}
          </Link>
          <span className="text-gray-600">|</span>
          {conditions.map((c) => (
            <Link
              key={c.value}
              to={`/products?condition=${c.value}`}
              className="px-3 py-1 hover:ring-1 hover:ring-white rounded whitespace-nowrap"
            >
              {t(c.labelKey)}
            </Link>
          ))}
          <span className="text-gray-600">|</span>
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/products?category=${encodeURIComponent(cat)}`}
              className="px-3 py-1 hover:ring-1 hover:ring-white rounded whitespace-nowrap"
            >
              {translateCategory(t, cat)}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b shadow-lg">
          <form onSubmit={handleSearch} className="flex p-3">
            <input
              type="text"
              placeholder={t('nav.searchMobilePlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <button type="submit" className="px-3 py-2 bg-amber-400 rounded-r-md text-sm font-medium">{t('nav.search')}</button>
          </form>
          <div className="pb-3 px-3 space-y-0.5">
            <Link to="/products" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded font-medium">{t('nav.allProducts')}</Link>
            {conditions.map((c) => (
              <Link key={c.value} to={`/products?condition=${c.value}`} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">{t(c.labelKey)}</Link>
            ))}
            <div className="border-t my-2" />
            <div className="px-3 py-2">
              <LanguageSwitcher mobile />
            </div>
            <div className="border-t my-2" />
            <Link to="/cart" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded font-medium">{t('nav.cartCount', { count: cartCount })}</Link>
            {user ? (
              <>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">{t('nav.myOrders')}</Link>
                {user.role === 'vendor' && (
                  <Link to="/vendor/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">{t('nav.vendorDashboard')}</Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">{t('nav.adminDashboard')}</Link>
                )}
                <button onClick={() => { logout(); navigate('/'); setMobileOpen(false) }} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 rounded">{t('nav.signOut')}</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded font-medium">{t('nav.signIn')}</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-amber-600 hover:bg-gray-100 rounded">{t('nav.createAccount')}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
