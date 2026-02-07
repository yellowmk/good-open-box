import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import API from '../api/axios'
import ProductCard from '../components/ProductCard'

const conditionOptions = [
  { value: '', label: 'All Conditions' },
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'open-box', label: 'Open Box' },
  { value: 'refurbished', label: 'Refurbished' },
  { value: 'used', label: 'Used' },
]

const sortOptions = [
  { value: '', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Avg. Customer Review' },
  { value: 'name', label: 'Name: A-Z' },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const category = searchParams.get('category') || ''
  const condition = searchParams.get('condition') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

  useEffect(() => {
    API.get('/categories').then((res) => {
      setCategories(res.data.categories || res.data || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page, limit: 16 }
    if (category) params.category = category
    if (condition) params.condition = condition
    if (search) params.search = search
    if (sort) params.sort = sort
    if (minPrice) params.minPrice = minPrice
    if (maxPrice) params.maxPrice = maxPrice

    API.get('/products', { params })
      .then((res) => {
        setProducts(res.data.products || [])
        setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 })
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [category, condition, search, sort, page, minPrice, maxPrice])

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    setSearchParams(params)
  }

  const setPage = (p) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', p.toString())
    setSearchParams(params)
    window.scrollTo({ top: 0 })
  }

  const clearFilters = () => setSearchParams({})

  const hasFilters = category || condition || minPrice || maxPrice || search

  const FilterSidebar = () => (
    <div className="space-y-5">
      {/* Category */}
      <div>
        <h3 className="font-bold text-sm text-gray-900 mb-2">Department</h3>
        <ul className="space-y-1">
          <li>
            <button onClick={() => updateFilter('category', '')} className={`text-sm hover:text-amber-700 ${!category ? 'font-bold text-amber-700' : 'text-gray-700'}`}>
              All Departments
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.name || cat}>
              <button
                onClick={() => updateFilter('category', cat.name || cat)}
                className={`text-sm hover:text-amber-700 ${category === (cat.name || cat) ? 'font-bold text-amber-700' : 'text-gray-700'}`}
              >
                {cat.name || cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Condition */}
      <div>
        <h3 className="font-bold text-sm text-gray-900 mb-2">Condition</h3>
        <ul className="space-y-1">
          {conditionOptions.map((opt) => (
            <li key={opt.value}>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-amber-700">
                <input
                  type="radio"
                  name="condition"
                  checked={condition === opt.value}
                  onChange={() => updateFilter('condition', opt.value)}
                  className="accent-amber-500"
                />
                {opt.label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div>
        <h3 className="font-bold text-sm text-gray-900 mb-2">Price</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <span className="px-2 text-xs text-gray-400 bg-gray-50">$</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => updateFilter('minPrice', e.target.value)}
              className="w-16 px-1 py-1.5 text-sm focus:outline-none"
            />
          </div>
          <span className="text-gray-400 text-xs">to</span>
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <span className="px-2 text-xs text-gray-400 bg-gray-50">$</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
              className="w-16 px-1 py-1.5 text-sm focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {['Under $100', '$100–$300', '$300–$500', '$500+'].map((label, i) => {
            const ranges = [['', '100'], ['100', '300'], ['300', '500'], ['500', '']]
            return (
              <button
                key={label}
                onClick={() => { updateFilter('minPrice', ranges[i][0]); updateFilter('maxPrice', ranges[i][1]) }}
                className="text-xs text-blue-600 hover:text-amber-700 hover:underline"
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {hasFilters && (
        <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-3">
          <Link to="/" className="hover:text-amber-700 hover:underline">Home</Link>
          <span className="mx-1.5">/</span>
          {category ? (
            <>
              <Link to="/products" className="hover:text-amber-700 hover:underline">Products</Link>
              <span className="mx-1.5">/</span>
              <span className="text-gray-900">{category}</span>
            </>
          ) : (
            <span className="text-gray-900">All Products</span>
          )}
        </nav>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {search ? `Results for "${search}"` : category || 'All Products'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {pagination.total > 0 ? `1-${Math.min(products.length, pagination.total)} of ${pagination.total} results` : 'No results'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setFiltersOpen(!filtersOpen)} className="md:hidden text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white">
              Filters
            </button>
            <select
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>Sort by: {opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-56 shrink-0 hidden md:block">
            <div className="bg-white rounded-md border border-gray-200 p-4">
              <FilterSidebar />
            </div>
          </aside>

          {/* Mobile filter drawer */}
          {filtersOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">Filters</h2>
                  <button onClick={() => setFiltersOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <FilterSidebar />
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
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
            ) : products.length === 0 ? (
              <div className="bg-white rounded-md border border-gray-200 text-center py-16 px-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-sm text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">Clear all filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {pagination.pages > 1 && (
                  <div className="flex justify-center mt-6 gap-1">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-1.5 text-sm border rounded-md ${
                          page === i + 1
                            ? 'border-amber-500 bg-amber-50 text-amber-700 font-medium'
                            : 'border-gray-300 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= pagination.pages}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
