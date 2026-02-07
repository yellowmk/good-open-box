import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'

const tabs = [
  { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
  { id: 'orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { id: 'vendors', label: 'Vendors', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
]

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
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
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({ products: 0, users: 0 })
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [vendors, setVendors] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = () => {
    Promise.all([
      API.get('/health').catch(() => ({ data: { products: 0, users: 0 } })),
      API.get('/orders').catch(() => ({ data: { orders: [] } })),
      API.get('/products?limit=100').catch(() => ({ data: { products: [] } })),
      API.get('/vendors').catch(() => ({ data: { vendors: [] } })),
      API.get('/admin/users').catch(() => ({ data: { users: [] } })),
    ]).then(([healthRes, ordersRes, productsRes, vendorsRes, usersRes]) => {
      setStats({ products: healthRes.data.products || 0, users: healthRes.data.users || 0 })
      setOrders(ordersRes.data.orders || ordersRes.data || [])
      setProducts(productsRes.data.products || [])
      setVendors(vendorsRes.data.vendors || vendorsRes.data || [])
      setAllUsers(usersRes.data.users || [])
      setLoading(false)
    })
  }

  useEffect(() => { fetchData() }, [])

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus })
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch {
      alert('Failed to update order status')
    }
  }

  const approveVendor = async (id) => {
    try {
      await API.put(`/vendors/${id}/approve`)
      setVendors((prev) => prev.map((v) => v.id === id ? { ...v, isApproved: true } : v))
    } catch {
      alert('Failed to approve vendor')
    }
  }

  const toggleFeatured = async (productId, current) => {
    try {
      await API.put(`/products/${productId}`, { isFeatured: !current })
      setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, isFeatured: !current } : p))
    } catch {
      alert('Failed to update product')
    }
  }

  const deleteProduct = async (productId) => {
    if (!confirm('Delete this product?')) return
    try {
      await API.delete(`/products/${productId}`)
      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch {
      alert('Failed to delete product')
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
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Manage your marketplace</p>
          </div>
          <button
            onClick={() => { setLoading(true); fetchData() }}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 font-medium transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
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
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-md border border-gray-200 border-t-0 min-h-[500px]">
          {activeTab === 'overview' && <OverviewTab stats={stats} orders={orders} totalRevenue={totalRevenue} pendingOrders={pendingOrders} vendors={vendors} products={products} />}
          {activeTab === 'orders' && <OrdersTab orders={orders} updateOrderStatus={updateOrderStatus} />}
          {activeTab === 'products' && <ProductsTab products={products} toggleFeatured={toggleFeatured} deleteProduct={deleteProduct} />}
          {activeTab === 'vendors' && <VendorsTab vendors={vendors} approveVendor={approveVendor} />}
          {activeTab === 'users' && <UsersTab users={allUsers} />}
        </div>
      </div>
    </div>
  )
}

/* ───── Overview Tab ───── */
function OverviewTab({ stats, orders, totalRevenue, pendingOrders, vendors, products }) {
  const statCards = [
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-green-50', color: 'text-green-600' },
    { label: 'Total Orders', value: orders.length, sub: `${pendingOrders} pending`, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Products', value: stats.products, sub: `${products.filter(p => p.stock <= 3).length} low stock`, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: 'Users', value: stats.users, sub: `${vendors.length} vendors`, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', bg: 'bg-purple-50', color: 'text-purple-600' },
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
            <h3 className="font-bold text-sm text-gray-900">Recent Orders</h3>
            <span className="text-xs text-gray-400">{orders.length} total</span>
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
                    <span className={`px-2 py-0.5 text-xs rounded border capitalize font-medium ${statusColors[order.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">${order.total?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-10 text-center text-sm text-gray-400">No orders yet</div>
          )}
        </div>

        {/* Low Stock & Top Products */}
        <div className="border border-gray-200 rounded-md">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-bold text-sm text-gray-900">Product Inventory</h3>
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
                    {p.stock} in stock
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
function OrdersTab({ orders, updateOrderStatus }) {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div className="p-5">
      {/* Filter Bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-sm text-gray-500 font-medium">Filter:</span>
        {['all', ...orderStatuses].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 text-xs rounded-full border font-medium capitalize transition ${
              filter === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {s} {s !== 'all' && `(${orders.filter((o) => o.status === s).length})`}
            {s === 'all' && `(${orders.length})`}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="overflow-x-auto border border-gray-200 rounded-md">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/orders/${order.id}`} className="text-sm font-medium text-blue-600 hover:underline">{order.id}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.items?.length || 0} items</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">${order.total?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded border capitalize font-medium ${statusColors[order.status] || ''}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    >
                      {orderStatuses.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
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
          <p className="text-sm font-medium">No orders found</p>
          <p className="text-xs mt-1">Orders will appear here once customers start purchasing</p>
        </div>
      )}
    </div>
  )
}

/* ───── Products Tab ───── */
function ProductsTab({ products, toggleFeatured, deleteProduct }) {
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
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <span className="text-sm text-gray-500">{filtered.length} products</span>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-md">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                  <span className={`px-2 py-0.5 text-xs rounded border capitalize font-medium ${conditionColors[p.condition] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    {p.condition}
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
                    Delete
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
function VendorsTab({ vendors, approveVendor }) {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900">{vendors.length} Registered Vendors</h3>
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
                    Approved
                  </span>
                ) : (
                  <button
                    onClick={() => approveVendor(vendor.id)}
                    className="px-3 py-1.5 text-xs rounded-md bg-amber-400 hover:bg-amber-500 text-gray-900 font-medium transition"
                  >
                    Approve
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="text-xs text-gray-600">{vendor.productCount || 0} products</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-600">ID: {vendor.vendorId || vendor.id}</span>
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
          <p className="text-sm font-medium">No vendors registered</p>
        </div>
      )}
    </div>
  )
}

/* ───── Users Tab ───── */
function UsersTab({ users }) {
  const roleColors = {
    admin: 'bg-red-50 text-red-700 border-red-200',
    vendor: 'bg-blue-50 text-blue-700 border-blue-200',
    customer: 'bg-gray-50 text-gray-700 border-gray-200',
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900">{users.length} Users</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> {users.filter(u => u.role === 'admin').length} Admin</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> {users.filter(u => u.role === 'vendor').length} Vendors</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400" /> {users.filter(u => u.role === 'customer').length} Customers</span>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-md">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
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
