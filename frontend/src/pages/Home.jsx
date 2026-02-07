import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'
import ProductCard from '../components/ProductCard'

const categories = [
  { name: 'Electronics', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop', color: 'from-blue-500/10' },
  { name: 'Home & Kitchen', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', color: 'from-amber-500/10' },
  { name: 'Sports & Outdoors', img: 'https://images.unsplash.com/photo-1461896836934-bd45ba8e6de8?w=300&h=300&fit=crop', color: 'from-green-500/10' },
  { name: 'Fashion', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=300&fit=crop', color: 'from-pink-500/10' },
  { name: 'Toys & Games', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=300&fit=crop', color: 'from-purple-500/10' },
]

const dealBanners = [
  { title: 'Open Box Deals', desc: 'Up to 70% off retail', link: '/products?condition=open-box', bg: 'bg-gradient-to-br from-amber-400 to-orange-500' },
  { title: 'Like-New Finds', desc: 'Barely used, huge savings', link: '/products?condition=like-new', bg: 'bg-gradient-to-br from-emerald-400 to-teal-500' },
  { title: 'Refurbished Tech', desc: 'Certified & warranty included', link: '/products?condition=refurbished', bg: 'bg-gradient-to-br from-blue-400 to-indigo-500' },
  { title: 'Free Shipping', desc: 'On orders over $50', link: '/products', bg: 'bg-gradient-to-br from-purple-400 to-pink-500' },
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)

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
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,191,36,0.3),transparent_50%)]" />
        </div>
        <div className="max-w-[1400px] mx-auto px-4 py-12 md:py-16 relative">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-sm font-medium mb-4">
                Trusted Open Box Marketplace
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                Save Big on<br />
                <span className="text-amber-400">Open Box</span> Products
              </h1>
              <p className="text-gray-300 text-lg mb-6 max-w-lg">
                Discover incredible deals on open box, refurbished, and like-new items from verified vendors. Same quality, fraction of the price.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="px-6 py-3 bg-amber-400 text-gray-900 rounded-md font-bold hover:bg-amber-300 transition text-sm"
                >
                  Shop All Deals
                </Link>
                <Link
                  to="/products?condition=open-box"
                  className="px-6 py-3 border border-gray-500 text-white rounded-md font-medium hover:bg-white/10 transition text-sm"
                >
                  Open Box Deals
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Shop by Category</h2>
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
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-3 text-center">
                <span className="text-sm font-medium text-gray-900">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-[1400px] mx-auto px-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
            See all deals
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
            {[
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Verified Vendors', desc: 'Every seller is vetted' },
              { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: 'Easy Returns', desc: '30-day return policy' },
              { icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', title: 'Free Shipping', desc: 'On orders over $50' },
              { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Best Prices', desc: 'Save up to 70%' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <h2 className="text-xl font-bold text-gray-900">Best Deals Under $500</h2>
            <Link to="/products?sort=price_asc" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
              See more
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
          <p className="text-gray-700">Sign in for the best experience</p>
          <Link to="/login" className="inline-block mt-3 px-8 py-2 bg-amber-400 hover:bg-amber-500 text-sm font-medium rounded-md transition">
            Sign in securely
          </Link>
        </div>
      </section>
    </div>
  )
}
