import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import API from '../api/axios'
import ProductCard from '../components/ProductCard'
import { translateCategory } from '../lib/translations'

const categories = [
  { name: 'Electronics', img: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=300&fit=crop' },
  { name: 'Home & Kitchen', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop' },
  { name: 'Sports & Outdoors', img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&fit=crop' },
  { name: 'Fashion', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop' },
  { name: 'Toys & Games', img: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop' },
  { name: 'Beauty & Personal Care', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop' },
  { name: 'Automotive', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop' },
  { name: 'Office & School', img: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=300&fit=crop' },
  { name: 'Baby & Kids', img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=300&fit=crop' },
  { name: 'Patio & Garden', img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop' },
]

export default function Home() {
  const { t } = useTranslation()
  const [featured, setFeatured] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)

  const dealBanners = [
    { title: t('home.dealOpenBox'), desc: t('home.dealOpenBoxDesc'), link: '/products?condition=open-box', bg: 'bg-gradient-to-br from-amber-400 to-orange-500' },
    { title: t('home.dealLikeNew'), desc: t('home.dealLikeNewDesc'), link: '/products?condition=like-new', bg: 'bg-gradient-to-br from-emerald-400 to-teal-500' },
    { title: t('home.dealRefurbished'), desc: t('home.dealRefurbishedDesc'), link: '/products?condition=refurbished', bg: 'bg-gradient-to-br from-blue-400 to-indigo-500' },
    { title: t('home.dealFreeShipping'), desc: t('home.dealFreeShippingDesc'), link: '/products', bg: 'bg-gradient-to-br from-purple-400 to-pink-500' },
  ]

  const valueProps = [
    { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: t('home.verifiedVendors'), desc: t('home.verifiedVendorsDesc') },
    { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: t('home.easyReturns'), desc: t('home.easyReturnsDesc') },
    { icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', title: t('home.freeShipping'), desc: t('home.freeShippingDesc') },
    { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: t('home.bestPrices'), desc: t('home.bestPricesDesc') },
  ]

  useEffect(() => {
    Promise.all([
      API.get('/products/featured').catch(() => ({ data: { products: [] } })),
      API.get('/products?sort=price_asc&limit=8').catch(() => ({ data: { products: [] } })),
    ]).then(([featuredRes, dealsRes]) => {
      setFeatured(featuredRes.data.products || [])
      setDeals(dealsRes.data.products || [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="bg-gray-100">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(20,184,166,0.4),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(251,191,36,0.2),transparent_50%)]" />
        </div>
        <div className="max-w-[1400px] mx-auto px-4 py-12 md:py-16 relative">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="inline-block px-3 py-1 bg-teal-500/20 border border-teal-400/30 rounded-full text-teal-200 text-sm font-medium mb-4">
                {t('hero.badge')}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                {t('hero.titleLine1')}<br />
                <span className="text-amber-300">{t('hero.titleLine2')}</span> {t('hero.titleLine3')}
              </h1>
              <p className="text-teal-100 text-lg mb-6 max-w-lg">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="px-6 py-3 bg-amber-400 text-gray-900 rounded-md font-bold hover:bg-amber-300 transition text-sm"
                >
                  {t('hero.shopAllDeals')}
                </Link>
                <Link
                  to="/products?condition=open-box"
                  className="px-6 py-3 border border-teal-400/50 text-white rounded-md font-medium hover:bg-white/10 transition text-sm"
                >
                  {t('hero.openBoxDeals')}
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img src="/logo-full.png" alt="Good Open Box" className="h-48 w-auto drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Deal Banners */}
      <section className="max-w-[1400px] mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {dealBanners.map((b) => (
            <Link key={b.title} to={b.link} className={`${b.bg} rounded-lg p-4 text-white hover:opacity-90 transition shadow-md`}>
              <h3 className="font-bold text-sm">{b.title}</h3>
              <p className="text-white/80 text-xs mt-0.5">{b.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-[1400px] mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('home.shopByCategory')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition group"
            >
              <div className="aspect-[4/3] bg-gray-50 overflow-hidden">
                <img
                  src={cat.img}
                  alt={translateCategory(t, cat.name)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-3 text-center">
                <span className="text-sm font-medium text-gray-900">{translateCategory(t, cat.name)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-[1400px] mx-auto px-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{t('home.featuredProducts')}</h2>
          <Link to="/products" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
            {t('home.seeAllDeals')}
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-md border border-gray-200 animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-5 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Value Propositions */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {valueProps.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Deals */}
      {deals.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{t('home.bestDeals')}</h2>
            <Link to="/products?sort=price_asc" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
              {t('home.seeMore')}
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {deals.slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Sign-in Banner */}
      <section className="max-w-[1400px] mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-700">{t('home.signInBanner')}</p>
          <Link to="/login" className="inline-block mt-3 px-8 py-2 bg-amber-400 hover:bg-amber-500 text-sm font-medium rounded-md transition">
            {t('home.signInSecurely')}
          </Link>
        </div>
      </section>
    </div>
  )
}
