import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { translateStatus, translateCondition } from '../lib/translations'
import API from '../api/axios'

const orderStatuses = ['pending_payment', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const statusColors = {
  pending_payment: 'bg-orange-50 text-orange-700 border-orange-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}

const conditionColors = {
  'open-box': 'bg-amber-50 text-amber-700 border-amber-200',
  'like-new': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'refurbished': 'bg-blue-50 text-blue-700 border-blue-200',
}

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({ products: 0, users: 0 })
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [vendors, setVendors] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [drivers, setDrivers] = useState([])
  const [applications, setApplications] = useState([])
  const [allDeliveries, setAllDeliveries] = useState([])
  const [financials, setFinancials] = useState(null)
  const [loading, setLoading] = useState(true)

  const tabs = [
    { id: 'overview', label: t('admin.overview'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
    { id: 'orders', label: t('admin.orders'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'products', label: t('admin.products'), icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { id: 'vendors', label: t('admin.vendors'), icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'drivers', label: t('admin.drivers'), icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
    { id: 'financials', label: 'Financials', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'users', label: t('admin.users'), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
  ]

  const fetchData = () => {
    Promise.all([
      API.get('/health').catch(() => ({ data: { products: 0, users: 0 } })),
      API.get('/orders').catch(() => ({ data: { orders: [] } })),
      API.get('/products?limit=100').catch(() => ({ data: { products: [] } })),
      API.get('/vendors').catch(() => ({ data: { vendors: [] } })),
      API.get('/admin/users').catch(() => ({ data: { users: [] } })),
      API.get('/admin/drivers').catch(() => ({ data: { drivers: [] } })),
      API.get('/drivers/applications').catch(() => ({ data: { applications: [] } })),
      API.get('/admin/deliveries').catch(() => ({ data: { deliveries: [] } })),
      API.get('/admin/financials').catch(() => ({ data: { financials: null } })),
    ]).then(([healthRes, ordersRes, productsRes, vendorsRes, usersRes, driversRes, appsRes, deliveriesRes, financialsRes]) => {
      setStats({ products: healthRes.data.products || 0, users: healthRes.data.users || 0 })
      setOrders(ordersRes.data.orders || ordersRes.data || [])
      setProducts(productsRes.data.products || [])
      setVendors(vendorsRes.data.vendors || vendorsRes.data || [])
      setAllUsers(usersRes.data.users || [])
      setDrivers(driversRes.data.drivers || [])
      setApplications(appsRes.data.applications || [])
      setAllDeliveries(deliveriesRes.data.deliveries || [])
      setFinancials(financialsRes.data.financials || null)
      setLoading(false)
    })
  }

  useEffect(() => { fetchData() }, [])

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus })
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch {
      alert(t('admin.failedUpdateStatus'))
    }
  }

  const approveApplication = async (id) => {
    try {
      const res = await API.put(`/drivers/applications/${id}/approve`)
      const tempPassword = res.data.tempPassword
      setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: 'approved' } : a))
      fetchData()
      if (tempPassword) {
        const app = applications.find(a => a.id === id)
        alert(`Driver approved!\n\nSend these login credentials to the driver:\n\nEmail: ${app?.email || '(see applications list)'}\nTemp Password: ${tempPassword}\n\nThey can change it via Forgot Password.`)
      }
    } catch {
      alert(t('admin.failedApproveApplication'))
    }
  }

  const rejectApplication = async (id) => {
    try {
      await API.put(`/drivers/applications/${id}/reject`)
      setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: 'rejected' } : a))
    } catch {
      alert(t('admin.failedRejectApplication'))
    }
  }

  const assignDriver = async (deliveryId, driverId) => {
    try {
      await API.post(`/admin/deliveries/${deliveryId}/assign`, { driverId: Number(driverId) })
      fetchData()
    } catch {
      alert(t('admin.failedAssignDriver'))
    }
  }

  const approveVendor = async (id) => {
    try {
      await API.put(`/vendors/${id}/approve`)
      setVendors((prev) => prev.map((v) => v.id === id ? { ...v, isApproved: true } : v))
    } catch {
      alert(t('admin.failedApprove'))
    }
  }

  const refundOrder = async (orderId) => {
    const amount = prompt('Refund amount (leave blank for full refund):')
    if (amount === null) return // cancelled
    try {
      const body = amount ? { amount: Number(amount) } : {}
      const res = await API.post(`/orders/${orderId}/refund`, body)
      alert(`Refund of $${res.data.refund.amount.toFixed(2)} processed successfully.`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process refund')
    }
  }

  const toggleFeatured = async (productId, current) => {
    try {
      await API.put(`/products/${productId}`, { isFeatured: !current })
      setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, isFeatured: !current } : p))
    } catch {
      alert(t('admin.failedUpdateProduct'))
    }
  }

  const deleteProduct = async (productId) => {
    if (!confirm(t('admin.deleteConfirm'))) return
    try {
      await API.delete(`/products/${productId}`)
      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch {
      alert(t('admin.failedDeleteProduct'))
    }
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const pendingVendors = vendors.filter((v) => !v.isApproved).length

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-md border border-gray-200 p-5 h-24" />
              ))}
            </div>
            <div className="bg-white rounded-md border border-gray-200 h-96" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard')}</h1>
            <p className="text-sm text-gray-500">{t('admin.manageMarketplace')}</p>
          </div>
          <button
            onClick={() => { setLoading(true); fetchData() }}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 font-medium transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t('admin.refresh')}
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-md border border-gray-200 border-b-0">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-700 bg-amber-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
                {tab.id === 'orders' && pendingOrders > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-bold">{pendingOrders}</span>
                )}
                {tab.id === 'vendors' && pendingVendors > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-bold">{pendingVendors}</span>
                )}
                {tab.id === 'drivers' && applications.filter(a => a.status === 'pending').length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-bold">{applications.filter(a => a.status === 'pending').length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-md border border-gray-200 border-t-0 min-h-[500px]">
          {activeTab === 'overview' && <OverviewTab t={t} stats={stats} orders={orders} totalRevenue={totalRevenue} pendingOrders={pendingOrders} vendors={vendors} products={products} />}
          {activeTab === 'orders' && <OrdersTab t={t} orders={orders} updateOrderStatus={updateOrderStatus} refundOrder={refundOrder} />}
          {activeTab === 'financials' && <FinancialsTab t={t} financials={financials} />}
          {activeTab === 'products' && <ProductsTab t={t} products={products} toggleFeatured={toggleFeatured} deleteProduct={deleteProduct} />}
          {activeTab === 'vendors' && <VendorsTab t={t} vendors={vendors} approveVendor={approveVendor} />}
          {activeTab === 'drivers' && <DriversTab t={t} drivers={drivers} applications={applications} deliveries={allDeliveries} approveApplication={approveApplication} rejectApplication={rejectApplication} assignDriver={assignDriver} />}
          {activeTab === 'users' && <UsersTab t={t} users={allUsers} />}
        </div>
      </div>
    </div>
  )
}

/* ───── Overview Tab ───── */
function OverviewTab({ t, stats, orders, totalRevenue, pendingOrders, vendors, products }) {
  const statCards = [
    { label: t('admin.totalRevenue'), value: `$${totalRevenue.toFixed(2)}`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-green-50', color: 'text-green-600' },
    { label: t('admin.totalOrders'), value: orders.length, sub: t('admin.pendingLabel', { count: pendingOrders }), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: t('admin.products'), value: stats.products, sub: t('admin.lowStock', { count: products.filter(p => p.stock <= 3).length }), icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: t('admin.users'), value: stats.users, sub: t('admin.vendorsCount', { count: vendors.length }), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', bg: 'bg-purple-50', color: 'text-purple-600' },
  ]

  return (
    <div className="p-5 space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="border border-gray-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 ${s.bg} rounded-md flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${s.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                {s.sub && <p className="text-xs text-gray-400">{s.sub}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="border border-gray-200 rounded-md">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">{t('admin.recentOrders')}</h3>
            <span className="text-xs text-gray-400">{t('admin.totalLabel', { count: orders.length })}</span>
          </div>
          {orders.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <Link to={`/orders/${order.id}`} className="text-sm font-medium text-blue-600 hover:underline">{order.id}</Link>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-xs rounded border font-medium ${statusColors[order.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                      {translateStatus(t, order.status)}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">${order.total?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-10 text-center text-sm text-gray-400">{t('admin.noOrders')}</div>
          )}
        </div>

        {/* Low Stock & Top Products */}
        <div className="border border-gray-200 rounded-md">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-bold text-sm text-gray-900">{t('admin.productInventory')}</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {products.sort((a, b) => a.stock - b.stock).slice(0, 6).map((p) => (
              <div key={p.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.vendorName}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-sm font-semibold text-gray-900">${p.price}</span>
                  <span className={`px-2 py-0.5 text-xs rounded border font-medium ${
                    p.stock <= 3 ? 'bg-red-50 text-red-700 border-red-200' :
                    p.stock <= 10 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-green-50 text-green-700 border-green-200'
                  }`}>
                    {t('admin.inStock', { count: p.stock })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───── Orders Tab ───── */
function OrdersTab({ t, orders, updateOrderStatus, refundOrder }) {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div className="p-5">
      {/* Filter Bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-sm text-gray-500 font-medium">{t('admin.filter')}</span>
        {['all', ...orderStatuses].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 text-xs rounded-full border font-medium transition ${
              filter === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {s === 'all' ? t('admin.all') : translateStatus(t, s)} {s !== 'all' && `(${orders.filter((o) => o.status === s).length})`}
            {s === 'all' && `(${orders.length})`}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="overflow-x-auto border border-gray-200 rounded-md">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.orderID')}</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.date')}</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.itemsCol')}</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.total')}</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.status')}</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/orders/${order.id}`} className="text-sm font-medium text-blue-600 hover:underline">{order.id}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{t('admin.itemsCount', { count: order.items?.length || 0 })}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">${order.total?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded border font-medium ${statusColors[order.status] || ''}`}>
                      {translateStatus(t, order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                      >
                        {orderStatuses.map((s) => (
                          <option key={s} value={s}>{s === 'pending_payment' ? 'Awaiting Payment' : translateStatus(t, s)}</option>
                        ))}
                      </select>
                      {order.isPaid && (!order.refundStatus || order.refundStatus !== 'full') && (
                        <button
                          onClick={() => refundOrder(order.id)}
                          className="text-xs text-red-600 hover:text-red-800 hover:underline font-medium whitespace-nowrap"
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm font-medium">{t('admin.noOrdersFound')}</p>
          <p className="text-xs mt-1">{t('admin.ordersWillAppear')}</p>
        </div>
      )}
    </div>
  )
}

/* ───── Products Tab ───── */
function ProductsTab({ t, products, toggleFeatured, deleteProduct }) {
  const [search, setSearch] = useState('')
  const filtered = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.vendorName?.toLowerCase().includes(search.toLowerCase()))
    : products

  return (
    <div className="p-5">
      {/* Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={t('admin.searchProducts')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <span className="text-sm text-gray-500">{t('admin.productsCount', { count: filtered.length })}</span>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-md">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.product')}</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.vendor')}</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.price')}</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.condition')}</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.stock')}</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.rating')}</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.featured')}</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link to={`/products/${p.id}`} className="text-sm font-medium text-blue-600 hover:underline">{p.name}</Link>
                  <p className="text-xs text-gray-400">{p.category}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.vendorName}</td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-gray-900">${p.price}</span>
                  {p.compareAtPrice && (
                    <span className="text-xs text-gray-400 line-through ml-1">${p.compareAtPrice}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs rounded border font-medium ${conditionColors[p.condition] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    {translateCondition(t, p.condition)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${p.stock <= 3 ? 'text-red-600' : p.stock <= 10 ? 'text-yellow-600' : 'text-gray-900'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs text-gray-600">{p.rating} ({p.numReviews})</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleFeatured(p.id, p.isFeatured)}
                    className={`w-8 h-5 rounded-full transition relative ${p.isFeatured ? 'bg-amber-400' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${p.isFeatured ? 'left-3.5' : 'left-0.5'}`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="text-xs text-red-600 hover:text-red-800 hover:underline font-medium"
                  >
                    {t('admin.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ───── Vendors Tab ───── */
function VendorsTab({ t, vendors, approveVendor }) {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900">{t('admin.registeredVendors', { count: vendors.length })}</h3>
      </div>

      {vendors.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="border border-gray-200 rounded-md p-4 hover:border-gray-300 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600">
                      {vendor.businessName?.charAt(0) || 'V'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{vendor.businessName}</h4>
                    <p className="text-xs text-gray-500">{vendor.contactEmail}</p>
                  </div>
                </div>
                {vendor.isApproved ? (
                  <span className="px-2.5 py-1 text-xs rounded border bg-green-50 text-green-700 border-green-200 font-semibold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('admin.approved')}
                  </span>
                ) : (
                  <button
                    onClick={() => approveVendor(vendor.id)}
                    className="px-3 py-1.5 text-xs rounded-md bg-amber-400 hover:bg-amber-500 text-gray-900 font-medium transition"
                  >
                    {t('admin.approve')}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="text-xs text-gray-600">{t('admin.productsLabel', { count: vendor.productCount || 0 })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-600">ID: {vendor.vendorId || vendor.id}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {vendor.stripeOnboardingComplete ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border font-medium bg-green-50 text-green-700 border-green-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Stripe
                    </span>
                  ) : vendor.stripeAccountId ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border font-medium bg-yellow-50 text-yellow-700 border-yellow-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                      Stripe
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border font-medium bg-gray-50 text-gray-500 border-gray-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      Stripe
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-sm font-medium">{t('admin.noVendors')}</p>
        </div>
      )}
    </div>
  )
}

/* ───── Drivers Tab ───── */
const deliveryStatusColors = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  picked_up: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  en_route: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
}

function DriversTab({ t, drivers, applications, deliveries, approveApplication, rejectApplication, assignDriver }) {
  const [subTab, setSubTab] = useState('active')
  const pendingApps = applications.filter(a => a.status === 'pending')

  return (
    <div className="p-5">
      {/* Sub-tabs */}
      <div className="flex items-center gap-2 mb-4">
        {[
          { id: 'active', label: t('admin.activeDrivers') },
          { id: 'applications', label: t('admin.applications'), badge: pendingApps.length },
          { id: 'deliveries', label: t('admin.allDeliveries') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`px-4 py-1.5 text-xs rounded-full border font-medium transition ${
              subTab === tab.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            {tab.badge > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-bold">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Active Drivers */}
      {subTab === 'active' && (
        drivers.length > 0 ? (
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.driverName')}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.emailCol')}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.deliveries')}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.earnings')}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Stripe</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.joined')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-amber-700">{driver.name?.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{driver.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{driver.email}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{driver.deliveryCount}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-700">${driver.totalEarnings.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {driver.stripeOnboardingComplete ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border font-medium bg-green-50 text-green-700 border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Connected
                        </span>
                      ) : driver.stripeAccountId ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border font-medium bg-yellow-50 text-yellow-700 border-yellow-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border font-medium bg-gray-50 text-gray-500 border-gray-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Not set up
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(driver.joinedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm font-medium">{t('admin.noDrivers')}</p>
          </div>
        )
      )}

      {/* Applications */}
      {subTab === 'applications' && (
        applications.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {applications.map((app) => (
              <div key={app.id} className="border border-gray-200 rounded-md p-4 hover:border-gray-300 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{app.name}</h4>
                    <p className="text-xs text-gray-500">{app.email} &middot; {app.phone}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded border font-medium capitalize ${
                    app.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    app.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}>{app.status}</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1 mb-3">
                  <p><span className="font-medium">{t('admin.vehicle')}:</span> {app.vehicleYear} {app.vehicleMake} {app.vehicleModel} ({app.vehicleType})</p>
                  <p><span className="font-medium">{t('admin.license')}:</span> {app.licenseNumber} ({app.licenseState})</p>
                  <p><span className="font-medium">{t('admin.applied')}:</span> {new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
                {app.status === 'pending' && (
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => approveApplication(app.id)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-md bg-green-500 hover:bg-green-600 text-white font-medium transition"
                    >
                      {t('admin.approve')}
                    </button>
                    <button
                      onClick={() => rejectApplication(app.id)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-md bg-red-500 hover:bg-red-600 text-white font-medium transition"
                    >
                      {t('admin.reject')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm font-medium">{t('admin.noApplications')}</p>
          </div>
        )
      )}

      {/* All Deliveries */}
      {subTab === 'deliveries' && (
        deliveries.length > 0 ? (
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.orderID')}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.driver')}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.status')}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.type')}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.fee')}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deliveries.map((del) => (
                  <tr key={del.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link to={`/orders/${del.orderId}`} className="text-sm font-medium text-blue-600 hover:underline">{del.orderId}</Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{del.driverName || <span className="text-gray-400 italic">{t('admin.unassigned')}</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded border font-medium ${deliveryStatusColors[del.status] || ''}`}>
                        {del.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{del.assignmentType || '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">${del.deliveryFee?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {!del.driverId && drivers.length > 0 && (
                        <select
                          defaultValue=""
                          onChange={(e) => { if (e.target.value) assignDriver(del.id, e.target.value) }}
                          className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                        >
                          <option value="">{t('admin.assignDriver')}</option>
                          {drivers.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm font-medium">{t('admin.noDeliveries')}</p>
          </div>
        )
      )}
    </div>
  )
}

/* ───── Financials Tab ───── */
function FinancialsTab({ t, financials }) {
  if (!financials) {
    return (
      <div className="p-5 text-center py-16 text-gray-400">
        <p className="text-sm font-medium">No financial data available yet</p>
        <p className="text-xs mt-1">Financials will appear once orders are paid via Stripe</p>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Revenue', value: `$${financials.totalRevenue.toFixed(2)}`, bg: 'bg-green-50', color: 'text-green-600', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Platform Fees (10%)', value: `$${financials.platformFees.toFixed(2)}`, bg: 'bg-blue-50', color: 'text-blue-600', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { label: 'Admin Direct Sales', value: `$${financials.adminSales.toFixed(2)}`, bg: 'bg-amber-50', color: 'text-amber-600', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'Net Revenue', value: `$${financials.netRevenue.toFixed(2)}`, bg: 'bg-emerald-50', color: 'text-emerald-600', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { label: 'Total Refunded', value: `$${financials.totalRefunded.toFixed(2)}`, bg: 'bg-red-50', color: 'text-red-600', icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6' },
  ]

  return (
    <div className="p-5 space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="border border-gray-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${s.bg} rounded-md flex items-center justify-center shrink-0`}>
                <svg className={`w-5 h-5 ${s.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-medium leading-tight">{s.label}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Revenue */}
      {financials.monthlyRevenue?.length > 0 && (
        <div className="border border-gray-200 rounded-md">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-bold text-sm text-gray-900">Monthly Revenue (Last 6 Months)</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {financials.monthlyRevenue.map((m) => (
              <div key={m.month} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                <span className="text-sm text-gray-700">
                  {new Date(m.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">{m.orderCount} orders</span>
                  <span className="text-sm font-bold text-gray-900">${m.revenue.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {financials.recentTransactions?.length > 0 && (
        <div className="border border-gray-200 rounded-md">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-bold text-sm text-gray-900">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Refund</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {financials.recentTransactions.map((tx) => (
                  <tr key={tx.orderId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{tx.orderId}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {tx.paidAt ? new Date(tx.paidAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">${tx.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded border font-medium ${statusColors[tx.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {tx.refundedAmount > 0 ? (
                        <span className="text-red-600 font-medium">
                          -${tx.refundedAmount.toFixed(2)} ({tx.refundStatus})
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ───── Users Tab ───── */
function UsersTab({ t, users }) {
  const roleColors = {
    admin: 'bg-red-50 text-red-700 border-red-200',
    vendor: 'bg-blue-50 text-blue-700 border-blue-200',
    driver: 'bg-amber-50 text-amber-700 border-amber-200',
    customer: 'bg-gray-50 text-gray-700 border-gray-200',
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900">{t('admin.usersCount', { count: users.length })}</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> {users.filter(u => u.role === 'admin').length} {t('admin.adminRole')}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> {users.filter(u => u.role === 'vendor').length} {t('admin.vendorsRole')}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400" /> {users.filter(u => u.role === 'customer').length} {t('admin.customersRole')}</span>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-md">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.user')}</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.emailCol')}</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.role')}</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.id')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600">{user.name?.charAt(0)}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs rounded border capitalize font-medium ${roleColors[user.role] || ''}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 font-mono">{user.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
