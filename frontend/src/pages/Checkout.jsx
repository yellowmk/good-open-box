import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import API from '../api/axios'
import { useCart } from '../context/CartContext'

export default function Checkout() {
  const { t } = useTranslation()
  const { items, subtotal, clearCart, updateQuantity, removeFromCart } = useCart()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(searchParams.get('payment') === 'cancelled' ? 'Payment was cancelled. Your cart is still intact — try again when ready.' : '')
  const [address, setAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  })
  const [paymentMethod, setPaymentMethod] = useState('stripe')
  const [deliveryFee, setDeliveryFee] = useState(null)
  const [deliveryMiles, setDeliveryMiles] = useState(null)
  const [feeLoading, setFeeLoading] = useState(false)
  const debounceRef = useRef(null)

  const hasStockIssue = items.some((item) => item.product.stock != null && item.quantity > item.product.stock)
  const tax = subtotal * 0.08
  const shipping = subtotal >= 50 ? 0 : 7.99
  const total = deliveryFee != null ? subtotal + tax + shipping + deliveryFee : null

  // Fetch delivery fee when address fields are filled
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const { street, city, state, zip } = address
    if (!street || !city || !state || !zip) {
      setDeliveryFee(null)
      setDeliveryMiles(null)
      return
    }

    setFeeLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ street, city, state, zip })
        const res = await API.get(`/delivery-fee?${params}`)
        setDeliveryFee(res.data.fee)
        setDeliveryMiles(res.data.miles)
      } catch {
        // Fallback to base fee if API fails
        setDeliveryFee(9.75)
        setDeliveryMiles(null)
      } finally {
        setFeeLoading(false)
      }
    }, 500)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [address.street, address.city, address.state, address.zip])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }))

      const res = await API.post('/orders/checkout-session', {
        items: orderItems,
        shippingAddress: address,
        paymentMethod: 'stripe',
      })

      // Save order ID so we can reference it after redirect
      localStorage.setItem('pendingOrderId', res.data.orderId)
      // Redirect to Stripe Checkout
      window.location.href = res.data.sessionUrl
    } catch (err) {
      setError(err.response?.data?.message || t('checkout.failedToPlace'))
      setLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  const feeDisplay = () => {
    if (feeLoading) {
      return <span className="text-gray-400 text-xs">{t('checkout.calculatingFee')}</span>
    }
    if (deliveryFee == null) {
      return <span className="text-gray-400 text-xs">{t('checkout.enterAddressForFee')}</span>
    }
    return (
      <span>
        ${deliveryFee.toFixed(2)}
        {deliveryMiles != null && (
          <span className="text-gray-400 text-xs ml-1">({t('checkout.miles', { miles: deliveryMiles })})</span>
        )}
      </span>
    )
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t('checkout.checkout')}</h1>
          <span className="text-sm text-gray-500">{items.reduce((s, i) => s + i.quantity, 0)} {t('checkout.items')}</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-4">
              {/* Shipping Address */}
              <div className="bg-white rounded-md border border-gray-200 p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  {t('checkout.shippingAddress')}
                </h2>
                <div className="grid gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">{t('checkout.fullName')}</label>
                    <input
                      type="text"
                      required
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">{t('checkout.address')}</label>
                    <input
                      type="text"
                      required
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                      placeholder={t('checkout.addressPlaceholder')}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">{t('checkout.city')}</label>
                      <input
                        type="text"
                        required
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">{t('checkout.state')}</label>
                      <input
                        type="text"
                        required
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">{t('checkout.zip')}</label>
                      <input
                        type="text"
                        required
                        value={address.zip}
                        onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-md border border-gray-200 p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  {t('checkout.paymentMethod')}
                </h2>
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                  <svg className="w-5 h-5 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Secure checkout powered by Stripe</p>
                    <p className="text-xs text-gray-500">You'll be redirected to Stripe's secure payment page</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-md border border-gray-200 p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  {t('checkout.reviewItems')}
                </h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id}>
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gray-50 rounded-md overflow-hidden shrink-0 border border-gray-200">
                          {item.product.images?.length > 0 ? (
                            <img src={item.product.images[0]} alt="" className="w-full h-full object-contain p-1" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">{t('checkout.noImg')}</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{item.product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              type="button"
                              onClick={() => item.quantity <= 1 ? removeFromCart(item.product.id) : updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 text-xs"
                            >
                              {item.quantity <= 1 ? '✕' : '−'}
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              disabled={item.product.stock != null && item.quantity >= item.product.stock}
                              className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-xs text-red-500 hover:text-red-700 ml-1"
                            >
                              {t('checkout.remove') || 'Remove'}
                            </button>
                          </div>
                        </div>
                        <span className="text-sm font-bold shrink-0">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                      {item.product.stock != null && item.quantity > item.product.stock && (
                        <p className="text-xs text-red-600 mt-1 ml-[68px]">
                          Only {item.product.stock} in stock — please reduce quantity
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white rounded-md border border-gray-200 p-5 sticky top-4">
                <button
                  type="submit"
                  disabled={loading || hasStockIssue || deliveryFee == null || feeLoading}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-full text-sm font-medium transition disabled:opacity-50 mb-4"
                >
                  {loading ? 'Redirecting to payment...' : 'Proceed to Payment'}
                </button>
                <p className="text-xs text-gray-500 mb-4">
                  {t('checkout.placeOrderTerms')}
                </p>
                <div className="border-t border-gray-200 pt-3">
                  <h3 className="font-bold text-sm text-gray-900 mb-2">{t('checkout.orderSummary')}</h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('checkout.itemsLabel')}</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('checkout.shipping')}</span>
                      <span>{shipping === 0 ? t('checkout.free') : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('checkout.taxEst')}</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('checkout.deliveryFee')}</span>
                      {feeDisplay()}
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-red-700 text-lg">
                      <span>{t('checkout.orderTotal')}</span>
                      <span>{total != null ? `$${total.toFixed(2)}` : '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
