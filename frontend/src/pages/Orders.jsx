import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/orders')
      .then((res) => setOrders(res.data.orders || res.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h1>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-md border border-gray-200 p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/4 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <nav className="text-sm text-gray-500 mb-3">
          <Link to="/" className="hover:text-amber-700 hover:underline">Your Account</Link>
          <span className="mx-1.5">/</span>
          <span className="text-gray-900">Your Orders</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-md border border-gray-200 text-center py-16 px-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-sm text-gray-500 mb-4">Looking for something? Start shopping to place your first order.</p>
            <Link to="/products" className="inline-block px-6 py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-md text-sm font-medium transition">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-md border border-gray-200 overflow-hidden">
                {/* Order header */}
                <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <span className="text-gray-500 uppercase text-xs">Order placed</span>
                      <p className="text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 uppercase text-xs">Total</span>
                      <p className="text-gray-900 font-bold">${order.total?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 uppercase text-xs">Order #</span>
                    <p className="text-blue-600">{order.id}</p>
                  </div>
                </div>

                {/* Order body */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded border text-xs font-semibold capitalize ${statusColors[order.status] || 'bg-gray-50 text-gray-800 border-gray-200'}`}>
                        {order.status}
                      </span>
                    </div>
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-sm text-blue-600 hover:text-amber-700 hover:underline"
                    >
                      View order details
                    </Link>
                  </div>
                  <div className="flex gap-2 overflow-x-auto">
                    {order.items?.slice(0, 5).map((item, i) => (
                      <div key={i} className="w-16 h-16 bg-gray-50 rounded-md overflow-hidden shrink-0 border border-gray-200">
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
                    ))}
                    {order.items?.length > 5 && (
                      <div className="w-16 h-16 bg-gray-50 rounded-md flex items-center justify-center text-xs text-gray-500 border border-gray-200">
                        +{order.items.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
