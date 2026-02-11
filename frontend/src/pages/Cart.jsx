import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { translateCondition } from '../lib/translations'

export default function Cart() {
  const { t } = useTranslation()
  const { items, updateQuantity, removeFromCart, subtotal } = useCart()

  const tax = subtotal * 0.08
  const shipping = subtotal >= 50 ? 0 : subtotal > 0 ? 7.99 : 0
  const total = subtotal + tax + shipping

  if (items.length === 0) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-md border border-gray-200 py-16 px-4">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('cart.emptyTitle')}</h2>
            <p className="text-sm text-gray-500 mb-6">{t('cart.emptySubtitle')}</p>
            <Link to="/products" className="inline-block px-6 py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-md text-sm font-medium transition">
              {t('cart.shopDeals')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Cart items */}
          <div className="flex-1">
            <div className="bg-white rounded-md border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 pb-4 border-b border-gray-200">{t('cart.shoppingCart')}</h1>
              <p className="text-sm text-gray-500 text-right pb-2 pt-2">{t('cart.price')}</p>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.product.id} className="py-4 flex gap-4">
                    <div className="w-44 h-44 bg-gray-50 rounded-md overflow-hidden shrink-0 border border-gray-200">
                      {item.product.images?.length > 0 ? (
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-4">
                        <div>
                          <Link to={`/products/${item.product.id}`} className="text-sm font-medium text-gray-900 hover:text-amber-700 line-clamp-2">
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-green-700 mt-1">{t('cart.inStock')}</p>
                          <p className="text-xs text-gray-500 capitalize mt-0.5">{t('cart.conditionLabel', { condition: translateCondition(t, item.product.condition) })}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-lg font-bold text-gray-900">${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-sm text-gray-600 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-sm border-x border-gray-300 bg-gray-50">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-sm text-gray-600 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-blue-600 hover:text-amber-700 text-sm hover:underline"
                        >
                          {t('cart.delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-right pt-4 border-t border-gray-200">
                <span className="text-lg">
                  {t('cart.subtotalItems', { count: items.reduce((s, i) => s + i.quantity, 0) })} <span className="font-bold">${subtotal.toFixed(2)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-md border border-gray-200 p-5">
              {subtotal > 0 && subtotal < 50 && (
                <p className="text-xs text-green-700 mb-3">
                  {t('cart.addMore', { amount: (50 - subtotal).toFixed(2) })}
                </p>
              )}
              {subtotal >= 50 && (
                <p className="text-xs text-green-700 mb-3">
                  {t('cart.qualifiesFreeShipping')}
                </p>
              )}
              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.subtotal')}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.taxEst')}</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.shipping')}</span>
                  <span>{shipping === 0 ? t('cart.free') : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold">
                  <span>{t('cart.total')}</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="block w-full py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 text-center rounded-full text-sm font-medium transition"
              >
                {t('cart.proceedToCheckout')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
