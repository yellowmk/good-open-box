import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'

export default function AiRecommendations({ productId }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!productId) return
    setLoading(true)
    setError(false)

    API.get(`/ai/recommendations/${productId}`)
      .then((res) => {
        setProducts(res.data.products || [])
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => setLoading(false))
  }, [productId])

  if (error || (!loading && products.length === 0)) return null

  return (
    <section className="mt-6">
      <div className="bg-white rounded-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Customers who viewed this also liked
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-100 rounded-md mb-2" />
                <div className="h-3 bg-gray-100 rounded w-3/4 mb-1" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="group block"
              >
                <div className="aspect-square bg-gray-50 rounded-md overflow-hidden border border-gray-200 mb-2 group-hover:border-amber-300 transition">
                  {product.images?.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-contain p-3"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-900 group-hover:text-amber-700 line-clamp-2 leading-tight mb-1">
                  {product.name}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  ${product.price?.toFixed(2)}
                </p>
                {product.compareAtPrice && (
                  <p className="text-xs text-gray-500">
                    <span className="line-through">${product.compareAtPrice.toFixed(2)}</span>
                    <span className="text-red-600 ml-1">
                      {Math.round((1 - product.price / product.compareAtPrice) * 100)}% off
                    </span>
                  </p>
                )}
                {product.condition && (
                  <p className="text-xs text-gray-500 capitalize mt-0.5">{product.condition}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
