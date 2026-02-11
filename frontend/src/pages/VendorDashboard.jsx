import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import API from '../api/axios'
import { translateStatus } from '../lib/translations'

export default function VendorDashboard() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const [stats, setStats] = useState(null)
  const [stripeStatus, setStripeStatus] = useState(null)
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stripeLoading, setStripeLoading] = useState(false)
  const [catchUpLoading, setCatchUpLoading] = useState(false)

  const fetchStripeStatus = useCallback(() => {
    API.get('/vendors/stripe/status')
      .then((res) => setStripeStatus(res.data))
      .catch(() => setStripeStatus(null))
  }, [])

  const fetchEarnings = useCallback(() => {
    API.get('/vendors/earnings')
      .then((res) => setEarnings(res.data))
      .catch(() => setEarnings(null))
  }, [])

  useEffect(() => {
    Promise.all([
      API.get('/vendors/dashboard/stats').then((res) => setStats(res.data.stats || res.data)).catch(() => setStats(null)),
      API.get('/vendors/stripe/status').then((res) => setStripeStatus(res.data)).catch(() => setStripeStatus(null)),
      API.get('/vendors/earnings').then((res) => setEarnings(res.data)).catch(() => setEarnings(null)),
    ]).finally(() => setLoading(false))
  }, [])

  // Handle Stripe return
  useEffect(() => {
    if (searchParams.get('stripe') === 'return') {
      fetchStripeStatus()
    }
  }, [searchParams, fetchStripeStatus])

  const handleStripeOnboard = async () => {
    setStripeLoading(true)
    try {
      const res = await API.post('/vendors/stripe/onboard')
      if (res.data.url) {
        window.location.href = res.data.url
      }
    } catch {
      alert('Failed to start Stripe onboarding')
    } finally {
      setStripeLoading(false)
    }
  }

  const handleStripeDashboard = async () => {
    try {
      const res = await API.post('/vendors/stripe/dashboard-link')
      if (res.data.url) {
        window.open(res.data.url, '_blank')
      }
    } catch {
      alert('Failed to open Stripe dashboard')
    }
  }

  const handleCatchUp = async () => {
    setCatchUpLoading(true)
    try {
      const res = await API.post('/vendors/stripe/catch-up')
      const { transferred, totalAmount } = res.data
      if (transferred > 0) {
        alert(`Transferred $${totalAmount.toFixed(2)} from ${transferred} order(s)`)
        fetchEarnings()
      } else {
        alert('No unpaid orders to transfer')
      }
    } catch {
      alert('Failed to process catch-up transfers')
    } finally {
      setCatchUpLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('vendor.dashboard')}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-md border border-gray-200 p-5">
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const isStripeConnected = stripeStatus?.connected
  const isStripePending = stripeStatus?.detailsSubmitted && !stripeStatus?.payoutsEnabled
  const unpaidBalance = earnings?.earnings?.unpaidBalance || 0

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{t('vendor.dashboard')}</h1>
          <Link
            to="/vendor/products"
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-md text-sm font-medium transition"
          >
            {t('vendor.manageProducts')}
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-md border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-50 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">{t('vendor.totalProducts')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-green-50 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">{t('vendor.totalOrders')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-amber-50 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">{t('vendor.totalRevenue')}</p>
                <p className="text-2xl font-bold text-gray-900">${(stats?.totalRevenue || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stripe Payouts Card */}
        <div className="bg-white rounded-md border border-gray-200 p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-purple-50 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-sm text-gray-900">Stripe Payouts</h2>
                <p className="text-xs text-gray-500">Receive payments for your sales</p>
              </div>
            </div>
            {/* Status badge */}
            {isStripeConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border font-semibold bg-green-50 text-green-700 border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Connected
              </span>
            ) : isStripePending ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border font-semibold bg-yellow-50 text-yellow-700 border-yellow-200">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                Pending
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border font-semibold bg-gray-50 text-gray-500 border-gray-200">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                Not connected
              </span>
            )}
          </div>

          {/* Connected state: show earnings + actions */}
          {isStripeConnected && (
            <div>
              <div className={`grid grid-cols-1 gap-4 mb-4 ${earnings?.earnings?.isAdmin ? 'sm:grid-cols-2' : 'sm:grid-cols-4'}`}>
                <div className="border border-gray-100 rounded-md p-3 bg-gray-50">
                  <p className="text-xs text-gray-500 uppercase font-medium">Gross Revenue</p>
                  <p className="text-lg font-bold text-gray-900">${(earnings?.earnings?.totalRevenue || 0).toFixed(2)}</p>
                </div>
                {!earnings?.earnings?.isAdmin && (
                  <div className="border border-gray-100 rounded-md p-3 bg-gray-50">
                    <p className="text-xs text-gray-500 uppercase font-medium">Platform Fee ({earnings?.earnings?.platformFeePercent || 0}%)</p>
                    <p className="text-lg font-bold text-red-600">-${(earnings?.earnings?.totalFees || 0).toFixed(2)}</p>
                  </div>
                )}
                <div className="border border-gray-100 rounded-md p-3 bg-gray-50">
                  <p className="text-xs text-gray-500 uppercase font-medium">Paid Out</p>
                  <p className="text-lg font-bold text-green-700">${(earnings?.earnings?.totalPaid || 0).toFixed(2)}</p>
                </div>
                {!earnings?.earnings?.isAdmin && (
                  <div className="border border-gray-100 rounded-md p-3 bg-gray-50">
                    <p className="text-xs text-gray-500 uppercase font-medium">Unpaid Balance</p>
                    <p className={`text-lg font-bold ${unpaidBalance > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                      ${unpaidBalance.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleStripeDashboard}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 font-medium transition"
                >
                  View Stripe Dashboard
                </button>
                {unpaidBalance > 0 && (
                  <button
                    onClick={handleCatchUp}
                    disabled={catchUpLoading}
                    className="px-4 py-2 text-sm rounded-md bg-amber-400 hover:bg-amber-500 text-gray-900 font-medium transition disabled:opacity-50"
                  >
                    {catchUpLoading ? 'Processing...' : `Transfer $${unpaidBalance.toFixed(2)}`}
                  </button>
                )}
              </div>

              {/* Payout history */}
              {earnings?.payouts?.length > 0 && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Recent Payouts</h3>
                  <div className="space-y-2">
                    {earnings.payouts.slice(0, 5).map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-sm py-1.5">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">Order #{p.orderId}</span>
                          <span className={`px-2 py-0.5 text-xs rounded border font-medium ${
                            p.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>{p.status}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">${p.amount.toFixed(2)}</span>
                          <span className="text-xs text-gray-400">{new Date(p.paidAt || p.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pending state */}
          {isStripePending && (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Your Stripe account is being reviewed. Once approved, payouts will be enabled automatically.
              </p>
              <button
                onClick={handleStripeOnboard}
                disabled={stripeLoading}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 font-medium transition disabled:opacity-50"
              >
                {stripeLoading ? 'Loading...' : 'Complete Setup'}
              </button>
            </div>
          )}

          {/* Not connected state */}
          {!isStripeConnected && !isStripePending && (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Connect your Stripe account to receive automatic payouts when your products are sold and delivered.
              </p>
              <button
                onClick={handleStripeOnboard}
                disabled={stripeLoading}
                className="px-4 py-2 text-sm rounded-md bg-amber-400 hover:bg-amber-500 text-gray-900 font-medium transition disabled:opacity-50"
              >
                {stripeLoading ? 'Loading...' : 'Set Up Payouts'}
              </button>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-md border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-bold text-sm text-gray-900">{t('vendor.recentOrders')}</h2>
          </div>
          {stats?.recentOrders?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('vendor.orderNumber')}</th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('vendor.date')}</th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('vendor.status')}</th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('vendor.total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id || order._id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-sm font-medium text-blue-600">{order.id || order.orderNumber}</td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 text-xs rounded border capitalize bg-gray-50 text-gray-700 border-gray-200">
                          {translateStatus(t, order.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-medium">${order.total?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-10 text-center text-sm text-gray-500">
              {t('vendor.noOrders')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
