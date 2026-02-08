import { useState, useEffect } from 'react'
import API from '../api/axios'
import ConditionBadge from '../components/ConditionBadge'
import ImageUpload from '../components/ImageUpload'

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  compareAtPrice: '',
  category: 'Electronics',
  condition: 'open-box',
  stock: '',
  brand: '',
  tags: '',
  images: [],
}

export default function VendorProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchProducts = () => {
    setLoading(true)
    API.get('/products?vendor=me&limit=100')
      .then((res) => setProducts(res.data.products || []))
      .catch(() => {
        API.get('/products?limit=100')
          .then((res) => setProducts(res.data.products || []))
          .catch(() => setProducts([]))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  const openCreate = () => {
    setForm(emptyProduct)
    setEditId(null)
    setShowForm(true)
    setError('')
  }

  const openEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice || '',
      category: product.category,
      condition: product.condition,
      stock: product.stock,
      brand: product.brand || '',
      tags: product.tags?.join(', ') || '',
      images: product.images || [],
    })
    setEditId(product.id)
    setShowForm(true)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
        stock: parseInt(form.stock),
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        images: form.images || [],
      }
      if (editId) {
        await API.put(`/products/${editId}`, payload)
      } else {
        await API.post('/products', payload)
      }
      setShowForm(false)
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await API.delete(`/products/${id}`)
      fetchProducts()
    } catch {
      alert('Failed to delete product')
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-md text-sm font-medium transition"
          >
            + Add Product
          </button>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-md border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">
                  {editId ? 'Edit Product' : 'New Product'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Compare at Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.compareAtPrice}
                      onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                    >
                      <option>Electronics</option>
                      <option>Home & Kitchen</option>
                      <option>Sports & Outdoors</option>
                      <option>Fashion</option>
                      <option>Toys & Games</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Condition</label>
                    <select
                      value={form.condition}
                      onChange={(e) => setForm({ ...form, condition: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="new">New</option>
                      <option value="like-new">Like New</option>
                      <option value="open-box">Open Box</option>
                      <option value="refurbished">Refurbished</option>
                      <option value="used">Used</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Stock</label>
                    <input
                      type="number"
                      required
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Brand</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <ImageUpload
                  images={form.images}
                  onChange={(imgs) => setForm({ ...form, images: imgs })}
                />
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="e.g. electronics, sale, featured"
                  />
                </div>
                <div className="flex gap-3 pt-3 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-md text-sm font-medium transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editId ? 'Update Product' : 'Create Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Table */}
        {loading ? (
          <div className="bg-white rounded-md border border-gray-200 p-10 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-md border border-gray-200 p-10 text-center">
            <p className="text-gray-500 mb-1">No products yet</p>
            <p className="text-sm text-gray-400">Click "Add Product" to create your first listing.</p>
          </div>
        ) : (
          <div className="bg-white rounded-md border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-md overflow-hidden shrink-0 border border-gray-200">
                          {product.images?.length > 0 ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-contain p-0.5" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm">${product.price.toFixed(2)}</td>
                    <td className="px-5 py-3"><ConditionBadge condition={product.condition} /></td>
                    <td className="px-5 py-3 text-sm">{product.stock}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => openEdit(product)}
                          className="text-blue-600 hover:text-amber-700 text-sm hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800 text-sm hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
