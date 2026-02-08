const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const db = require('./db/queries');
const pool = require('./config/db');

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

// ─── Auth Middleware ──────────────────────────────────────────────

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    req.user = await db.users.findById(decoded.id);
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalid' });
  }
}

// ─── AUTH ROUTES ─────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }
  const existing = await db.users.findByEmail(email);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }
  const hash = bcrypt.hashSync(password, 10);
  const user = await db.users.create({ name, email, password: hash, role: role || 'customer' });
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({
    success: true, token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  const user = await db.users.findByEmail(email);
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

app.get('/api/categories', async (req, res) => {
  const categories = await db.categories.findAll();
  res.json({ success: true, categories });
});

app.get('/api/categories/:id', async (req, res) => {
  const cat = await db.categories.findById(req.params.id);
  if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
  const catProducts = await db.products.findByCategory(cat.name);
  res.json({ success: true, category: cat, products: catProducts });
});

// ─── PRODUCTS ROUTES ─────────────────────────────────────────────

app.get('/api/products', async (req, res) => {
  const result = await db.products.findWithFilters(req.query);
  res.json({ success: true, products: result.products, pagination: result.pagination });
});

app.get('/api/products/featured', async (req, res) => {
  const products = await db.products.findFeatured();
  res.json({ success: true, products });
});

app.get('/api/products/:id', async (req, res) => {
  const product = await db.products.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
});

// ─── ORDERS ROUTES ───────────────────────────────────────────────

app.post('/api/orders', authenticate, async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No order items' });
  }

  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await db.products.findById(item.productId);
    if (!product) return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
    if (product.stock < item.quantity) {
      return res.status(400).json({ success: false, message: `${product.name} only has ${product.stock} in stock` });
    }
    orderItems.push({
      productId: product.id, name: product.name, price: product.price,
      quantity: item.quantity, vendorId: product.vendorId,
    });
    subtotal += product.price * item.quantity;
  }

  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const shippingCost = subtotal >= 50 ? 0 : 7.99;
  const total = Math.round((subtotal + tax + shippingCost) * 100) / 100;

  const order = await db.orders.create({
    userId: req.user.id,
    items: orderItems,
    shippingAddress: shippingAddress || {},
    paymentMethod: paymentMethod || 'stripe',
    subtotal, tax, shippingCost, total,
  });

  res.status(201).json({ success: true, order });
});

app.get('/api/orders', authenticate, async (req, res) => {
  const orders = req.user.role === 'admin'
    ? await db.orders.findAll()
    : await db.orders.findByUser(req.user.id);
  res.json({ success: true, orders });
});

app.get('/api/orders/:id', authenticate, async (req, res) => {
  const order = await db.orders.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (req.user.role !== 'admin' && order.userId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  res.json({ success: true, order });
});

app.put('/api/orders/:id/status', authenticate, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  const order = await db.orders.updateStatus(req.params.id, req.body.status);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
});

// ─── VENDOR ROUTES ──────────────────────────────────────────────

app.get('/api/vendors', authenticate, async (req, res) => {
  const vendors = await db.users.findVendors();
  res.json({ success: true, vendors });
});

app.put('/api/vendors/:id/approve', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  const vendor = await db.users.approveVendor(req.params.id);
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
  res.json({ success: true, message: 'Vendor approved' });
});

// ─── PRODUCT MANAGEMENT ROUTES ──────────────────────────────────

app.post('/api/products', authenticate, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  const { name, description, price, compareAtPrice, category, subcategory, brand, condition, stock, images, tags } = req.body;
  if (!name || !price) return res.status(400).json({ success: false, message: 'Name and price are required' });
  const product = await db.products.create({
    vendorId: req.user.vendorId || 'admin',
    vendorName: req.user.name,
    name, description, price, compareAtPrice, category, subcategory, brand, condition, stock, images, tags,
  });
  res.status(201).json({ success: true, product });
});

app.put('/api/products/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  const product = await db.products.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  if (req.user.role === 'vendor' && product.vendorId !== req.user.vendorId) {
    return res.status(403).json({ success: false, message: 'Not your product' });
  }
  const updated = await db.products.update(req.params.id, req.body);
  res.json({ success: true, product: updated });
});

app.delete('/api/products/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  const product = await db.products.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  if (req.user.role === 'vendor' && product.vendorId !== req.user.vendorId) {
    return res.status(403).json({ success: false, message: 'Not your product' });
  }
  await db.products.remove(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
});

// ─── ADMIN ROUTES ───────────────────────────────────────────────

app.get('/api/admin/users', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  const users = await db.users.findAll();
  res.json({ success: true, users });
});

// ─── AI ROUTES ──────────────────────────────────────────────────

const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes(authenticate));

// ─── HEALTH CHECK ────────────────────────────────────────────────

app.get('/api/health', async (req, res) => {
  const prodCount = await pool.query('SELECT COUNT(*) FROM products');
  const userCount = await pool.query('SELECT COUNT(*) FROM users');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    products: Number(prodCount.rows[0].count),
    users: Number(userCount.rows[0].count),
  });
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
