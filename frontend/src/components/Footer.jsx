import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { translateCategory } from '../lib/translations'

export default function Footer() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer className="mt-auto">
      {/* Newsletter Banner */}
      <div className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-white font-bold text-sm">{t('footer.newsletterTitle')}</h3>
              <p className="text-gray-400 text-xs mt-0.5">{t('footer.newsletterDesc')}</p>
            </div>
            {subscribed ? (
              <p className="text-green-400 text-sm font-medium">{t('footer.subscribed')}</p>
            ) : (
              <form onSubmit={handleNewsletter} className="flex w-full sm:w-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  className="flex-1 sm:w-56 px-3 py-2 text-sm bg-gray-800 border border-gray-600 rounded-l-md text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 text-sm font-medium rounded-r-md transition whitespace-nowrap"
                >
                  {t('footer.subscribe')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Back to top */}
      <button
        onClick={scrollTop}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-3 transition"
      >
        {t('footer.backToTop')}
      </button>

      {/* Main footer links */}
      <div className="bg-gray-800 text-gray-300">
        <div className="max-w-[1400px] mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-bold text-sm mb-3">{t('footer.getToKnowUs')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white hover:underline">{t('footer.aboutGOB')}</Link></li>
                <li><Link to="/" className="hover:text-white hover:underline">{t('footer.careers')}</Link></li>
                <li><Link to="/" className="hover:text-white hover:underline">{t('footer.pressReleases')}</Link></li>
                <li><Link to="/" className="hover:text-white hover:underline">{t('footer.sustainability')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-3">{t('footer.shopWithUs')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products" className="hover:text-white hover:underline">{t('footer.allProducts')}</Link></li>
                <li><Link to="/products?condition=open-box" className="hover:text-white hover:underline">{t('footer.openBoxDeals')}</Link></li>
                <li><Link to="/products?condition=refurbished" className="hover:text-white hover:underline">{t('footer.refurbishedItems')}</Link></li>
                <li><Link to="/products?condition=like-new" className="hover:text-white hover:underline">{t('footer.likeNew')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-3">{t('footer.categoriesTitle')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products?category=Electronics" className="hover:text-white hover:underline">{translateCategory(t, 'Electronics')}</Link></li>
                <li><Link to="/products?category=Home+%26+Kitchen" className="hover:text-white hover:underline">{translateCategory(t, 'Home & Kitchen')}</Link></li>
                <li><Link to="/products?category=Sports+%26+Outdoors" className="hover:text-white hover:underline">{translateCategory(t, 'Sports & Outdoors')}</Link></li>
                <li><Link to="/products?category=Fashion" className="hover:text-white hover:underline">{translateCategory(t, 'Fashion')}</Link></li>
                <li><Link to="/products?category=Toys+%26+Games" className="hover:text-white hover:underline">{translateCategory(t, 'Toys & Games')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-3">{t('footer.helpSupport')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/orders" className="hover:text-white hover:underline">{t('footer.yourOrders')}</Link></li>
                <li><Link to="/" className="hover:text-white hover:underline">{t('footer.shippingPolicies')}</Link></li>
                <li><Link to="/" className="hover:text-white hover:underline">{t('footer.returnsReplacements')}</Link></li>
                <li><Link to="/" className="hover:text-white hover:underline">{t('footer.customerService')}</Link></li>
              </ul>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="border-t border-gray-700 mt-8 pt-6">
            <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-xs">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>{t('footer.secureCheckout')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>{t('footer.verifiedVendors')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{t('footer.thirtyDayReturns')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>{t('footer.safePayments')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>{t('footer.freeShipping50')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-gray-900 text-gray-400 border-t border-gray-700">
        <div className="max-w-[1400px] mx-auto px-4 py-6 flex flex-col items-center gap-3">
          <Link to="/">
            <img src="/logo-full.png" alt="Good Open Box" className="h-14 w-auto" />
          </Link>
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Facebook" className="text-gray-500 hover:text-white transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="#" aria-label="Instagram" className="text-gray-500 hover:text-white transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-white transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
          <p className="text-xs text-gray-500">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  )
}
