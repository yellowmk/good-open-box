const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'goodobox-dev-secret';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
const allowedOrigins = NODE_ENV === 'production'
  ? ['https://goodobox.com', 'https://www.goodobox.com', process.env.FRONTEND_URL].filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:5002'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// ─── In-Memory Data ──────────────────────────────────────────────

const users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@goodobox.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
  },
  {
    id: '2',
    name: 'Tech Deals Pro',
    email: 'vendor1@goodobox.com',
    password: bcrypt.hashSync('vendor123', 10),
    role: 'vendor',
    vendorId: 'v1',
  },
  {
    id: '3',
    name: 'Home Essentials Hub',
    email: 'vendor2@goodobox.com',
    password: bcrypt.hashSync('vendor123', 10),
    role: 'vendor',
    vendorId: 'v2',
  },
  {
    id: '4',
    name: 'John Customer',
    email: 'customer@goodobox.com',
    password: bcrypt.hashSync('customer123', 10),
    role: 'customer',
  },
];

const categories = [
  { id: 'electronics', name: 'Electronics', subcategories: ['TVs', 'Laptops', 'Tablets', 'Audio', 'Phones'] },
  { id: 'home', name: 'Home & Kitchen', subcategories: ['Kitchen', 'Vacuums', 'Furniture', 'Smart Home'] },
  { id: 'sports', name: 'Sports & Outdoors', subcategories: ['Fitness', 'Camping', 'Cycling'] },
  { id: 'fashion', name: 'Fashion', subcategories: ['Men', 'Women', 'Shoes', 'Accessories'] },
  { id: 'toys', name: 'Toys & Games', subcategories: ['Board Games', 'Action Figures', 'Puzzles'] },
];

const products = [
  {
    id: 'p1', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'Samsung 65" QLED 4K Smart TV', slug: 'samsung-65-qled-4k',
    description: 'Open-box Samsung QLED with Quantum HDR, smart hub, and Alexa built-in. Original packaging with minor box damage only.',
    price: 649.99, compareAtPrice: 999.99,
    category: 'Electronics', subcategory: 'TVs', brand: 'Samsung',
    condition: 'open-box', stock: 5, sku: 'SAM-QLED-65',
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1558888401-3cc1de77652d?w=800&h=800&fit=crop',
    ], tags: ['tv', 'samsung', 'qled', '4k'],
    rating: 4.6, numReviews: 24, isFeatured: true,
  },
  {
    id: 'p2', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'Apple MacBook Air M2 13"', slug: 'macbook-air-m2',
    description: 'Like-new MacBook Air M2 chip, 8GB RAM, 256GB SSD. Opened and returned, never used. Full warranty.',
    price: 849.99, compareAtPrice: 1199.00,
    category: 'Electronics', subcategory: 'Laptops', brand: 'Apple',
    condition: 'like-new', stock: 3, sku: 'APL-MBA-M2',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=800&fit=crop',
    ], tags: ['macbook', 'apple', 'laptop'],
    rating: 4.8, numReviews: 42, isFeatured: true,
  },
  {
    id: 'p3', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'Sony WH-1000XM5 Headphones', slug: 'sony-wh1000xm5',
    description: 'Open-box Sony noise-cancelling headphones. Industry-leading ANC, 30-hour battery.',
    price: 248.00, compareAtPrice: 399.99,
    category: 'Electronics', subcategory: 'Audio', brand: 'Sony',
    condition: 'open-box', stock: 12, sku: 'SONY-XM5',
    images: [
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop',
    ], tags: ['headphones', 'sony', 'wireless'],
    rating: 4.7, numReviews: 89, isFeatured: false,
  },
  {
    id: 'p4', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'iPad Pro 11" M2 Wi-Fi 128GB', slug: 'ipad-pro-m2',
    description: 'Refurbished iPad Pro with Liquid Retina display. Tested and certified, cosmetic grade A.',
    price: 549.99, compareAtPrice: 799.00,
    category: 'Electronics', subcategory: 'Tablets', brand: 'Apple',
    condition: 'refurbished', stock: 7, sku: 'APL-IPADPRO-M2',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=800&fit=crop',
    ], tags: ['ipad', 'apple', 'tablet'],
    rating: 4.5, numReviews: 31, isFeatured: false,
  },
  {
    id: 'p5', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'Bose SoundLink Flex Speaker', slug: 'bose-soundlink-flex',
    description: 'Open-box portable Bluetooth speaker. Waterproof IP67, 12-hour battery.',
    price: 99.99, compareAtPrice: 149.00,
    category: 'Electronics', subcategory: 'Audio', brand: 'Bose',
    condition: 'open-box', stock: 20, sku: 'BOSE-FLEX',
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop',
    ], tags: ['speaker', 'bose', 'bluetooth'],
    rating: 4.4, numReviews: 56, isFeatured: false,
  },
  {
    id: 'p6', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Dyson V15 Detect Vacuum', slug: 'dyson-v15-detect',
    description: 'Open-box Dyson cordless vacuum with laser dust detection. Full accessory kit included.',
    price: 449.99, compareAtPrice: 749.99,
    category: 'Home & Kitchen', subcategory: 'Vacuums', brand: 'Dyson',
    condition: 'open-box', stock: 4, sku: 'DYS-V15',
    images: [
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1527515637462-cee1395c108b?w=800&h=800&fit=crop',
    ], tags: ['vacuum', 'dyson', 'cordless'],
    rating: 4.7, numReviews: 18, isFeatured: true,
  },
  {
    id: 'p7', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'KitchenAid Artisan Stand Mixer', slug: 'kitchenaid-artisan',
    description: 'Open-box 5-quart tilt-head stand mixer in Empire Red. Unused, returned due to wrong color order.',
    price: 279.99, compareAtPrice: 449.99,
    category: 'Home & Kitchen', subcategory: 'Kitchen', brand: 'KitchenAid',
    condition: 'open-box', stock: 6, sku: 'KA-ARTISAN',
    images: [
      'https://images.unsplash.com/photo-1594385208974-2f8bb07bfab0?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&h=800&fit=crop',
    ], tags: ['mixer', 'kitchenaid', 'baking'],
    rating: 4.9, numReviews: 12, isFeatured: false,
  },
  {
    id: 'p8', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Instant Pot Duo Plus 8-Quart', slug: 'instant-pot-duo-8qt',
    description: 'Like-new 9-in-1 pressure cooker. Customer return — used once. All parts included.',
    price: 69.99, compareAtPrice: 119.99,
    category: 'Home & Kitchen', subcategory: 'Kitchen', brand: 'Instant Pot',
    condition: 'like-new', stock: 15, sku: 'IP-DUO-8',
    images: [
      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&h=800&fit=crop',
    ], tags: ['instant-pot', 'pressure-cooker', 'kitchen'],
    rating: 4.3, numReviews: 67, isFeatured: false,
  },
  {
    id: 'p9', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Nespresso Vertuo Next Coffee Machine', slug: 'nespresso-vertuo-next',
    description: 'Open-box Nespresso with Aeroccino milk frother bundle. Sealed pods sample pack included.',
    price: 129.99, compareAtPrice: 209.99,

    category: 'Home & Kitchen', subcategory: 'Kitchen', brand: 'Nespresso',
    condition: 'open-box', stock: 8, sku: 'NESP-VERTUO',
    images: [
      'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=800&fit=crop',
    ], tags: ['coffee', 'nespresso', 'espresso'],
    rating: 4.2, numReviews: 35, isFeatured: false,
  },
  {
    id: 'p10', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'iRobot Roomba j7+ Self-Emptying Vacuum', slug: 'irobot-roomba-j7plus',
    description: 'Refurbished robot vacuum with smart mapping and obstacle avoidance. 90-day warranty.',
    price: 349.99, compareAtPrice: 599.99,
    category: 'Home & Kitchen', subcategory: 'Vacuums', brand: 'iRobot',
    condition: 'refurbished', stock: 3, sku: 'IRB-J7PLUS',
    images: [
      'https://images.unsplash.com/photo-1667044855958-c4899a1490be?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1603618090561-412154b4bd1b?w=800&h=800&fit=crop',
    ], tags: ['roomba', 'robot-vacuum', 'smart-home'],
    rating: 4.5, numReviews: 22, isFeatured: true,
  },
];

const orders = [];
let orderCounter = 1000;

// ─── Auth Middleware ──────────────────────────────────────────────

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    req.user = users.find((u) => u.id === decoded.id);
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalid' });
  }
}

// ─── AUTH ROUTES ─────────────────────────────────────────────────

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }
  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }
  const user = {
    id: String(users.length + 1),
    name,
    email,
    password: bcrypt.hashSync(password, 10),
    role: role || 'customer',
  };
  users.push(user);
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({
    success: true, token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  const user = users.find((u) => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    success: true, token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const { password, ...user } = req.user;
  res.json({ success: true, user });
});

// ─── CATEGORIES ROUTES ───────────────────────────────────────────

app.get('/api/categories', (req, res) => {
  res.json({ success: true, categories });
});

app.get('/api/categories/:id', (req, res) => {
  const cat = categories.find((c) => c.id === req.params.id);
  if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
  const catProducts = products.filter((p) => p.category === cat.name);
  res.json({ success: true, category: cat, products: catProducts });
});

// ─── PRODUCTS ROUTES ─────────────────────────────────────────────

app.get('/api/products', (req, res) => {
  const { category, condition, vendor, brand, minPrice, maxPrice, search, sort, page = 1, limit = 20 } = req.query;
  let filtered = products.filter((p) => p.stock > 0);

  if (category) filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  if (condition) filtered = filtered.filter((p) => p.condition === condition);
  if (vendor) filtered = filtered.filter((p) => p.vendorId === vendor);
  if (brand) filtered = filtered.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  if (minPrice) filtered = filtered.filter((p) => p.price >= Number(minPrice));
  if (maxPrice) filtered = filtered.filter((p) => p.price <= Number(maxPrice));
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q))
    );
  }

  if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  else if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

  const start = (Number(page) - 1) * Number(limit);
  const paged = filtered.slice(start, start + Number(limit));

  res.json({
    success: true,
    products: paged,
    pagination: { page: Number(page), limit: Number(limit), total: filtered.length, pages: Math.ceil(filtered.length / Number(limit)) },
  });
});

app.get('/api/products/featured', (req, res) => {
  res.json({ success: true, products: products.filter((p) => p.isFeatured) });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
});

// ─── ORDERS ROUTES ───────────────────────────────────────────────

app.post('/api/orders', authenticate, (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No order items' });
  }

  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
    if (product.stock < item.quantity) {
      return res.status(400).json({ success: false, message: `${product.name} only has ${product.stock} in stock` });
    }
    product.stock -= item.quantity;
    orderItems.push({
      productId: product.id, name: product.name, price: product.price,
      quantity: item.quantity, vendorId: product.vendorId,
    });
    subtotal += product.price * item.quantity;
  }

  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const shippingCost = subtotal >= 50 ? 0 : 7.99;
  const total = Math.round((subtotal + tax + shippingCost) * 100) / 100;

  orderCounter++;
  const order = {
    id: 'GOB-' + orderCounter,
    userId: req.user.id,
    items: orderItems,
    shippingAddress: shippingAddress || {},
    paymentMethod: paymentMethod || 'stripe',
    subtotal, tax, shippingCost, total,
    status: 'pending', isPaid: false,
    createdAt: new Date().toISOString(),
  };
  orders.push(order);

  res.status(201).json({ success: true, order });
});

app.get('/api/orders', authenticate, (req, res) => {
  const userOrders = req.user.role === 'admin' ? orders : orders.filter((o) => o.userId === req.user.id);
  res.json({ success: true, orders: userOrders });
});

app.get('/api/orders/:id', authenticate, (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (req.user.role !== 'admin' && order.userId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  res.json({ success: true, order });
});

app.put('/api/orders/:id/status', authenticate, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  order.status = req.body.status;
  if (req.body.status === 'delivered') order.isDelivered = true;
  res.json({ success: true, order });
});

// ─── VENDOR ROUTES ──────────────────────────────────────────────

app.get('/api/vendors', authenticate, (req, res) => {
  const vendorUsers = users.filter((u) => u.role === 'vendor');
  const vendorList = vendorUsers.map((v) => ({
    id: v.id,
    vendorId: v.vendorId,
    businessName: v.name,
    contactEmail: v.email,
    isApproved: v.isApproved !== false,
    productCount: products.filter((p) => p.vendorId === v.vendorId).length,
    joinedAt: v.joinedAt || new Date().toISOString(),
  }));
  res.json({ success: true, vendors: vendorList });
});

app.put('/api/vendors/:id/approve', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  const vendor = users.find((u) => u.id === req.params.id && u.role === 'vendor');
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
  vendor.isApproved = true;
  res.json({ success: true, message: 'Vendor approved' });
});

// ─── PRODUCT MANAGEMENT ROUTES ──────────────────────────────────

app.post('/api/products', authenticate, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  const { name, description, price, compareAtPrice, category, subcategory, brand, condition, stock, images, tags } = req.body;
  if (!name || !price) return res.status(400).json({ success: false, message: 'Name and price are required' });
  const product = {
    id: 'p' + (products.length + 1),
    vendorId: req.user.vendorId || 'admin',
    vendorName: req.user.name,
    name, description: description || '', price: Number(price),
    compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
    category: category || 'Electronics', subcategory: subcategory || '',
    brand: brand || '', condition: condition || 'open-box',
    stock: stock ? Number(stock) : 1, sku: 'SKU-' + Date.now(),
    images: images || [], tags: tags || [],
    rating: 0, numReviews: 0, isFeatured: false,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  };
  products.push(product);
  res.status(201).json({ success: true, product });
});

app.put('/api/products/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  if (req.user.role === 'vendor' && product.vendorId !== req.user.vendorId) {
    return res.status(403).json({ success: false, message: 'Not your product' });
  }
  const fields = ['name', 'description', 'price', 'compareAtPrice', 'category', 'subcategory', 'brand', 'condition', 'stock', 'images', 'tags', 'isFeatured'];
  fields.forEach((f) => { if (req.body[f] !== undefined) product[f] = req.body[f]; });
  if (req.body.price) product.price = Number(req.body.price);
  if (req.body.compareAtPrice) product.compareAtPrice = Number(req.body.compareAtPrice);
  if (req.body.stock !== undefined) product.stock = Number(req.body.stock);
  res.json({ success: true, product });
});

app.delete('/api/products/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  const idx = products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });
  if (req.user.role === 'vendor' && products[idx].vendorId !== req.user.vendorId) {
    return res.status(403).json({ success: false, message: 'Not your product' });
  }
  products.splice(idx, 1);
  res.json({ success: true, message: 'Product deleted' });
});

// ─── ADMIN ROUTES ───────────────────────────────────────────────

app.get('/api/admin/users', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  const userList = users.map(({ password, ...u }) => u);
  res.json({ success: true, users: userList });
});

// ─── HEALTH CHECK ────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), products: products.length, users: users.length });
});

// ─── SERVE FRONTEND OR 404 ──────────────────────────────────────

const fs = require('fs');
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (NODE_ENV === 'production' && fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });
}

// ─── START ───────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🟢 Good Open Box API running on port ${PORT} [${NODE_ENV}]`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  if (NODE_ENV === 'production') {
    console.log(`Frontend: serving from ../frontend/dist`);
    console.log(`Domain: https://goodobox.com`);
  } else {
    console.log(`Products: http://localhost:${PORT}/api/products`);
    console.log(`\nTest login: admin@goodobox.com / admin123\n`);
  }
});
