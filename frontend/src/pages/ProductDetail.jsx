import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import API from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import ConditionBadge from '../components/ConditionBadge'
import AiRecommendations from '../components/AiRecommendations'

export default function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [reviewError, setReviewError] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    setLoading(true)
    API.get(`/products/${id}`)
      .then((res) => setProduct(res.data.product || res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    setReviewError('')
    try {
      await API.post(`/products/${id}/reviews`, reviewForm)
      const res = await API.get(`/products/${id}`)
      setProduct(res.data.product || res.data)
      setReviewForm({ rating: 5, comment: '' })
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review')
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <div className="grid md:grid-cols-2 gap-8 animate-pulse">
            <div className="aspect-square bg-white rounded-md border border-gray-200" />
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-20 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <Link to="/products" className="text-blue-600 hover:text-amber-700 hover:underline">Browse all products</Link>
        </div>
      </div>
    )
  }

  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-amber-700 hover:underline">Home</Link>
          <span className="mx-1.5">/</span>
          <Link to="/products" className="hover:text-amber-700 hover:underline">Products</Link>
          {product.category && (
            <>
              <span className="mx-1.5">/</span>
              <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-amber-700 hover:underline">
                {product.category}
              </Link>
            </>
          )}
          <span className="mx-1.5">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="bg-white rounded-md border border-gray-200 p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="aspect-square bg-gray-50 rounded-md overflow-hidden border border-gray-200 mb-3">
                {product.images?.length > 0 ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-contain p-6"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 ${i === selectedImage ? 'border-amber-500' : 'border-gray-200 hover:border-amber-300'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <h1 className="text-xl md:text-2xl font-medium text-gray-900 leading-snug">{product.name}</h1>
              {product.brand && (
                <p className="text-sm text-blue-600 hover:text-amber-700 mt-1">Visit the {product.brand} Store</p>
              )}

              {product.rating > 0 && (
                <div className="flex items-center gap-2 mt-2 pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-700">{product.rating.toFixed(1)}</span>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-blue-600">{product.numReviews} ratings</span>
                </div>
              )}

              <div className="mt-3">
                {discount > 0 && (
                  <span className="inline-block text-sm bg-red-600 text-white px-2 py-0.5 rounded-sm font-medium mb-1">
                    {discount}% off
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-gray-500">$</span>
                  <span className="text-3xl font-medium text-gray-900">{Math.floor(product.price)}</span>
                  <span className="text-sm text-gray-900">{(product.price % 1).toFixed(2).slice(1)}</span>
                </div>
                {product.compareAtPrice && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    List Price: <span className="line-through">${product.compareAtPrice.toFixed(2)}</span>
                  </p>
                )}
              </div>

              <div className="mt-3">
                <ConditionBadge condition={product.condition} />
              </div>

              <p className="text-sm text-gray-700 mt-4 leading-relaxed">{product.description}</p>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  {product.stock > 0 ? (
                    <span className="text-lg font-medium text-green-700">In Stock</span>
                  ) : (
                    <span className="text-lg font-medium text-red-600">Out of Stock</span>
                  )}
                </div>

                {product.stock > 0 && (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700">Qty:</label>
                      <select
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className={`w-full py-2.5 rounded-full font-medium text-sm transition ${
                        added
                          ? 'bg-green-600 text-white'
                          : 'bg-amber-400 hover:bg-amber-500 text-gray-900'
                      }`}
                    >
                      {added ? 'Added to Cart!' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => { addToCart(product, quantity); window.location.href = '/checkout' }}
                      className="w-full py-2.5 rounded-full font-medium text-sm bg-orange-500 hover:bg-orange-600 text-white transition"
                    >
                      Buy Now
                    </button>
                  </div>
                )}
              </div>

              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-200">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-6">
          <div className="bg-white rounded-md border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Customer Reviews ({product.reviews?.length || 0})
            </h2>

            {user && (
              <div className="border border-gray-200 rounded-md p-4 mb-6">
                <h3 className="font-semibold text-sm text-gray-900 mb-3">Write a customer review</h3>
                {reviewError && (
                  <p className="text-red-600 text-sm mb-3">{reviewError}</p>
                )}
                <form onSubmit={handleReview} className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Overall rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                          className={`w-8 h-8 ${n <= reviewForm.rating ? 'text-amber-400' : 'text-gray-200'}`}
                        >
                          <svg className="w-full h-full fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Your review</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      rows={3}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                      placeholder="What did you like or dislike?"
                    />
                  </div>
                  <button type="submit" className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 text-sm font-medium rounded-md transition">
                    Submit Review
                  </button>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {product.reviews?.length > 0 ? (
                product.reviews.map((review, i) => (
                  <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {(review.name || 'A')[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{review.name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, j) => (
                          <svg key={j} className={`w-3.5 h-3.5 ${j < review.rating ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      {review.createdAt && (
                        <span className="text-xs text-gray-400">
                          Reviewed on {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-6">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          </div>
        </section>

        {/* AI Recommendations */}
        <AiRecommendations productId={id} />
      </div>
    </div>
  )
}
