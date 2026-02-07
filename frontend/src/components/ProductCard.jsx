import { Link } from 'react-router-dom'
import ConditionBadge from './ConditionBadge'

export default function ProductCard({ product }) {
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0

  return (
    <Link
      to={`/products/${product.id}`}
      className="bg-white rounded-md border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden group flex flex-col"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.images?.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-sm">
            {discount}% off
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm text-gray-900 leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
          {product.name}
        </h3>

        {product.rating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-blue-600">{product.numReviews?.toLocaleString()}</span>
          </div>
        )}

        <div className="mt-1.5">
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-gray-500">$</span>
            <span className="text-xl font-medium text-gray-900">{Math.floor(product.price)}</span>
            <span className="text-xs text-gray-900">{(product.price % 1).toFixed(2).slice(1)}</span>
          </div>
          {product.compareAtPrice && (
            <div className="text-xs text-gray-500">
              List: <span className="line-through">${product.compareAtPrice.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-2">
          <ConditionBadge condition={product.condition} />
        </div>

        {product.brand && (
          <p className="text-[11px] text-gray-400 mt-1">{product.brand}</p>
        )}
      </div>
    </Link>
  )
}
