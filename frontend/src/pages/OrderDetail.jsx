import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import API from '../api/axios'
import { useCart } from '../context/CartContext'
import { translateStatus } from '../lib/translations'

const statusColors = {
  pending_payment: 'bg-orange-50 text-orange-800 border-orange-200',
  pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-800 border-blue-200',
  processing: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  shipped: 'bg-purple-50 text-purple-800 border-purple-200',
  delivered: 'bg-green-50 text-green-800 border-green-200',
  cancelled: 'bg-red-50 text-red-800 border-red-200',
  refunded: 'bg-gray-50 text-gray-800 border-gray-200',
}

const statusSteps = ['pending_payment', 'confirmed', 'processing', 'shipped', 'delivered']

export default function OrderDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()
  const [order, setOrder] = useState(null)
  const [delivery, setDelivery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    // Handle payment success redirect from Stripe
    if (searchParams.get('payment') === 'success') {
      clearCart()
      localStorage.removeItem('pendingOrderId')
      setPaymentSuccess(true)
    }

    Promise.all([
      API.get(`/orders/${id}`).catch(() => ({ data: null })),
      API.get(`/deliveries/${id}/status`).catch(() => ({ data: null })),
    ]).then(([orderRes, deliveryRes]) => {
      setOrder(orderRes.data?.order || orderRes.data)
      setDelivery(deliveryRes.data?.delivery || null)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4 py-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
          <div className="bg-white rounded-md border border-gray-200 p-6 space-y-4">
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('orderDetail.orderNotFound')}</h2>
          <Link to="/orders" className="text-blue-600 hover:text-amber-700 hover:underline">{t('orderDetail.backToOrders')}</Link>
        </div>
      </div>
    )
  }

  const currentStep = statusSteps.indexOf(order.status)

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <nav className="text-sm text-gray-500 mb-3">
          <Link to="/" className="hover:text-amber-700 hover:underline">{t('orderDetail.yourAccount')}</Link>
          <span className="mx-1.5">/</span>
          <Link to="/orders" className="hover:text-amber-700 hover:underline">{t('orderDetail.yourOrders')}</Link>
          <span className="mx-1.5">/</span>
          <span className="text-gray-900">{t('orderDetail.orderDetails')}</span>
        </nav>

        {paymentSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-4 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span><strong>Payment successful!</strong> Your order has been placed and is being processed.</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('orderDetail.orderDetails')}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {t('orderDetail.orderedOn', {
                date: new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                }),
                id: order.id,
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {order.refundStatus && (
              <span className={`px-3 py-1 rounded border text-xs font-semibold ${
                order.refundStatus === 'full' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'
              }`}>
                {order.refundStatus === 'full' ? 'Fully Refunded' : `Partially Refunded ($${order.refundedAmount?.toFixed(2)})`}
              </span>
            )}
            <span className={`px-3 py-1 rounded border text-xs font-semibold capitalize ${statusColors[order.status] || 'bg-gray-50 text-gray-800 border-gray-200'}`}>
              {order.status === 'pending_payment' ? 'Awaiting Payment' : translateStatus(t, order.status)}
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        {!['cancelled', 'refunded'].includes(order.status) && (
          <div className="bg-white rounded-md border border-gray-200 p-5 mb-4">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        i <= currentStep ? 'bg-amber-400 text-gray-900' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {i <= currentStep ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : i + 1}
                    </div>
                    <span className="text-[11px] mt-1 capitalize text-gray-600">{translateStatus(t, step)}</span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${i < currentStep ? 'bg-amber-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Order Items */}
          <div className="lg:col-span-2 bg-white rounded-md border border-gray-200 p-5">
            <h2 className="font-bold text-sm text-gray-900 mb-4 pb-3 border-b border-gray-200">{t('orderDetail.orderItems')}</h2>
            <div className="space-y-4">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-16 h-16 bg-gray-50 rounded-md overflow-hidden shrink-0 border border-gray-200">
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-full object-contain p-1" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{t('orderDetail.qty', { qty: item.quantity, price: item.price?.toFixed(2) })}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* Payment Summary */}
            <div className="bg-white rounded-md border border-gray-200 p-5">
              <h2 className="font-bold text-sm text-gray-900 mb-3 pb-3 border-b border-gray-200">{t('orderDetail.paymentSummary')}</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orderDetail.items')}</span>
                  <span>${order.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orderDetail.shipping')}</span>
                  <span>{order.shippingCost === 0 ? t('orderDetail.free') : `$${order.shippingCost?.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orderDetail.tax')}</span>
                  <span>${order.tax?.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-red-700 text-lg">
                  <span>{t('orderDetail.orderTotal')}</span>
                  <span>${order.total?.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 text-sm space-y-1">
                <p className="text-gray-600">{t('orderDetail.payment')} <span className="capitalize font-medium text-gray-900">{order.paymentMethod}</span></p>
                <p className="text-gray-600">
                  {t('orderDetail.statusLabel')}{' '}
                  <span className={`font-medium ${order.isPaid ? 'text-green-700' : 'text-yellow-700'}`}>
                    {order.isPaid ? t('orderDetail.paid') : order.status === 'pending_payment' ? 'Awaiting Payment' : t('orderDetail.pending')}
                  </span>
                </p>
                {order.paidAt && (
                  <p className="text-gray-600">Paid on{' '}
                    <span className="font-medium text-gray-900">
                      {new Date(order.paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                )}
                {order.refundedAmount > 0 && (
                  <p className="text-red-600 font-medium">
                    Refunded: ${order.refundedAmount.toFixed(2)} ({order.refundStatus === 'full' ? 'Full' : 'Partial'})
                  </p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-md border border-gray-200 p-5">
              <h2 className="font-bold text-sm text-gray-900 mb-3 pb-3 border-b border-gray-200">{t('orderDetail.shippingAddress')}</h2>
              {order.shippingAddress && (
                <div className="text-sm text-gray-600 space-y-0.5">
                  <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              )}
              {order.trackingNumber && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">{t('orderDetail.tracking')} <span className="font-medium text-blue-600">{order.trackingNumber}</span></p>
                </div>
              )}
            </div>

            {/* Delivery Status */}
            {delivery && (
              <div className="bg-white rounded-md border border-gray-200 p-5">
                <h2 className="font-bold text-sm text-gray-900 mb-3 pb-3 border-b border-gray-200">{t('orderDetail.deliveryStatus')}</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('orderDetail.statusLabel')}</span>
                    <span className={`px-2 py-0.5 text-xs rounded border font-medium capitalize ${
                      delivery.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                      delivery.status === 'en_route' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      delivery.status === 'picked_up' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      delivery.status === 'assigned' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>{delivery.status.replace('_', ' ')}</span>
                  </div>
                  {delivery.driverName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('orderDetail.driver')}</span>
                      <span className="font-medium text-gray-900">{delivery.driverName}</span>
                    </div>
                  )}
                  {delivery.pickedUpAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('orderDetail.pickedUp')}</span>
                      <span className="text-gray-900">{new Date(delivery.pickedUpAt).toLocaleString()}</span>
                    </div>
                  )}
                  {delivery.enRouteAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('orderDetail.enRoute')}</span>
                      <span className="text-gray-900">{new Date(delivery.enRouteAt).toLocaleString()}</span>
                    </div>
                  )}
                  {delivery.deliveredAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('orderDetail.deliveredAt')}</span>
                      <span className="text-gray-900">{new Date(delivery.deliveredAt).toLocaleString()}</span>
                    </div>
                  )}
                  {delivery.driverNotes && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">{t('orderDetail.driverNotes')}</p>
                      <p className="text-sm text-gray-700 mt-0.5">{delivery.driverNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
