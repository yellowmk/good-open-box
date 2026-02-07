import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import API from '../api/axios'

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-800 border-blue-200',
  processing: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  shipped: 'bg-purple-50 text-purple-800 border-purple-200',
  delivered: 'bg-green-50 text-green-800 border-green-200',
  cancelled: 'bg-red-50 text-red-800 border-red-200',
  refunded: 'bg-gray-50 text-gray-800 border-gray-200',
}

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order || res.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <Link to="/orders" className="text-blue-600 hover:text-amber-700 hover:underline">Back to orders</Link>
        </div>
      </div>
    )
  }

  const currentStep = statusSteps.indexOf(order.status)

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <nav className="text-sm text-gray-500 mb-3">
          <Link to="/" className="hover:text-amber-700 hover:underline">Your Account</Link>
          <span className="mx-1.5">/</span>
          <Link to="/orders" className="hover:text-amber-700 hover:underline">Your Orders</Link>
          <span className="mx-1.5">/</span>
          <span className="text-gray-900">Order Details</span>
        </nav>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order Details</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Ordered on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })} | Order# {order.id}
            </p>
          </div>
          <span className={`px-3 py-1 rounded border text-xs font-semibold capitalize ${statusColors[order.status] || 'bg-gray-50 text-gray-800 border-gray-200'}`}>
            {order.status}
          </span>
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
                    <span className="text-[11px] mt-1 capitalize text-gray-600">{step}</span>
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
            <h2 className="font-bold text-sm text-gray-900 mb-4 pb-3 border-b border-gray-200">Order Items</h2>
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
                    <p className="text-xs text-gray-500">Qty: {item.quantity} x ${item.price?.toFixed(2)}</p>
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
              <h2 className="font-bold text-sm text-gray-900 mb-3 pb-3 border-b border-gray-200">Payment Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span>${order.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span>{order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost?.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span>${order.tax?.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-red-700 text-lg">
                  <span>Order Total:</span>
                  <span>${order.total?.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 text-sm space-y-1">
                <p className="text-gray-600">Payment: <span className="capitalize font-medium text-gray-900">{order.paymentMethod}</span></p>
                <p className="text-gray-600">
                  Status:{' '}
                  <span className={`font-medium ${order.isPaid ? 'text-green-700' : 'text-yellow-700'}`}>
                    {order.isPaid ? 'Paid' : 'Pending'}
                  </span>
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-md border border-gray-200 p-5">
              <h2 className="font-bold text-sm text-gray-900 mb-3 pb-3 border-b border-gray-200">Shipping Address</h2>
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
                  <p className="text-sm text-gray-600">Tracking: <span className="font-medium text-blue-600">{order.trackingNumber}</span></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
