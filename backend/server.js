const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const db = require('./db/queries');
const pool = require('./config/db');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'goodobox-dev-secret';
const NODE_ENV = process.env.NODE_ENV || 'development';
const PLATFORM_FEE_PERCENT = 10; // Platform takes 10% from vendor sales

// ─── DELIVERY FEE: Store location & distance helpers ────────────
const STORE_LAT = 39.333;
const STORE_LNG = -82.982;

function haversineDistance(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateDeliveryFee(miles) {
  if (miles <= 5) return 9.75;
  return Math.round((9.75 + 0.75 * (miles - 5)) * 100) / 100;
}

async function geocodeAddress(address) {
  const { street, city, state, zip } = address;
  if (!city && !state && !zip) return null;

  // Try full address first, then city+state+zip fallback
  const queries = [
    [street, city, state, zip].filter(Boolean).join(', '),
    [city, state, zip].filter(Boolean).join(', '),
  ];

  for (const q of queries) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&countrycodes=us`,
        { headers: { 'User-Agent': 'GoodOpenBox/1.0' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (err) {
      console.error('Geocoding failed:', err.message);
    }
  }
  return null;
}

// Middleware
const allowedOrigins = [
  'http://localhost:5173', 'http://localhost:5002',
  'http://localhost:5174',
  'https://goodobox.com', 'https://www.goodobox.com',
  'https://frontend-ten-xi-20.vercel.app',
  process.env.FRONTEND_URL,
  process.env.DRIVER_PWA_URL,
].filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
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
  const user = await db.users.findByEmail(email.trim());
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

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  // Always return success to prevent email enumeration
  const user = await db.users.findByEmail(email);
  if (user) {
    // Generate a reset token (expires in 1 hour)
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [resetToken, resetExpires, user.id]
    );
    // In production, send email with reset link. For now, log it.
    console.log(`[Password Reset] Token for ${email}: ${resetToken}`);
  }
  res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token and new password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  const result = await pool.query(
    'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
    [token]
  );
  if (result.rows.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }
  const hash = bcrypt.hashSync(password, 10);
  await pool.query(
    'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
    [hash, result.rows[0].id]
  );
  res.json({ success: true, message: 'Password has been reset successfully' });
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

  // Distance-based delivery fee
  let deliveryFee = 9.75; // default fallback
  const coords = await geocodeAddress(shippingAddress || {});
  if (coords) {
    const miles = haversineDistance(STORE_LAT, STORE_LNG, coords.lat, coords.lng);
    deliveryFee = calculateDeliveryFee(miles);
  }

  const total = Math.round((subtotal + tax + shippingCost + deliveryFee) * 100) / 100;

  const order = await db.orders.create({
    userId: req.user.id,
    items: orderItems,
    shippingAddress: shippingAddress || {},
    paymentMethod: paymentMethod || 'stripe',
    subtotal, tax, shippingCost, total,
  });

  // Create delivery record for this order
  try {
    await db.deliveries.create({
      orderId: order.id,
      deliveryFee,
      deliveryAddress: shippingAddress || {},
    });
  } catch (err) {
    console.error('Failed to create delivery record:', err.message);
  }

  res.status(201).json({ success: true, order });
});

// ─── STRIPE CHECKOUT SESSION ──────────────────────────────────
app.post('/api/orders/checkout-session', authenticate, async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No order items' });
  }

  const orderItems = [];
  let subtotal = 0;
  const lineItems = [];

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
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: product.name },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: item.quantity,
    });
  }

  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const shippingCost = subtotal >= 50 ? 0 : 7.99;

  // Distance-based delivery fee
  let deliveryFee = 9.75;
  const coords = await geocodeAddress(shippingAddress || {});
  if (coords) {
    const miles = haversineDistance(STORE_LAT, STORE_LNG, coords.lat, coords.lng);
    deliveryFee = calculateDeliveryFee(miles);
  }

  const total = Math.round((subtotal + tax + shippingCost + deliveryFee) * 100) / 100;

  // Create order with pending_payment status
  const order = await db.orders.create({
    userId: req.user.id,
    items: orderItems,
    shippingAddress: shippingAddress || {},
    paymentMethod: paymentMethod || 'stripe',
    subtotal, tax, shippingCost, total,
    status: 'pending_payment',
  });

  // Create delivery record
  try {
    await db.deliveries.create({
      orderId: order.id,
      deliveryFee,
      deliveryAddress: shippingAddress || {},
    });
  } catch (err) {
    console.error('Failed to create delivery record:', err.message);
  }

  // Add tax + shipping + delivery as line items
  if (tax > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Tax' },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    });
  }
  if (shippingCost > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Shipping' },
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    });
  }
  lineItems.push({
    price_data: {
      currency: 'usd',
      product_data: { name: 'Delivery Fee' },
      unit_amount: Math.round(deliveryFee * 100),
    },
    quantity: 1,
  });

  // Create Stripe Checkout Session
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      metadata: { order_id: order.id },
      success_url: `${frontendUrl}/orders/${order.id}?payment=success`,
      cancel_url: `${frontendUrl}/checkout?payment=cancelled`,
      expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
    });

    await pool.query(
      'UPDATE orders SET stripe_checkout_session_id = $1 WHERE id = $2',
      [session.id, order.id]
    );

    res.status(201).json({ success: true, sessionUrl: session.url, orderId: order.id });
  } catch (err) {
    console.error('Stripe checkout session error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create checkout session' });
  }
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

  // Auto-transfer vendor payouts when order is delivered
  if (req.body.status === 'delivered') {
    try {
      // Get vendor totals from order_items grouped by vendor
      const { rows: vendorTotals } = await pool.query(
        `SELECT oi.vendor_id, SUM(oi.price * oi.quantity) AS vendor_total
         FROM order_items oi WHERE oi.order_id = $1 GROUP BY oi.vendor_id`,
        [req.params.id]
      );
      for (const vt of vendorTotals) {
        // Skip admin vendor — revenue stays in platform account
        if (vt.vendor_id === 'admin') continue;

        // Find vendor's Stripe account
        const vendorResult = await pool.query(
          'SELECT id, stripe_account_id, stripe_onboarding_complete FROM users WHERE vendor_id = $1',
          [vt.vendor_id]
        );
        const vendor = vendorResult.rows[0];
        if (vendor && vendor.stripe_account_id && vendor.stripe_onboarding_complete) {
          const grossAmount = Number(vt.vendor_total);
          const platformFee = Math.round(grossAmount * PLATFORM_FEE_PERCENT) / 100;
          const vendorPayout = Math.round((grossAmount - platformFee) * 100) / 100;
          const amountCents = Math.round(vendorPayout * 100);
          if (amountCents > 0) {
            const transfer = await stripe.transfers.create({
              amount: amountCents,
              currency: 'usd',
              destination: vendor.stripe_account_id,
              metadata: { order_id: String(req.params.id), vendor_id: vt.vendor_id, platform_fee: platformFee.toFixed(2) },
            });
            await pool.query(
              `INSERT INTO vendor_payouts (vendor_id, order_id, amount, stripe_transfer_id, status, paid_at, payment_method, notes)
               VALUES ($1, $2, $3, $4, 'paid', NOW(), 'stripe', $5)`,
              [vt.vendor_id, req.params.id, vendorPayout, transfer.id, `Stripe transfer ${transfer.id} (${PLATFORM_FEE_PERCENT}% platform fee: $${platformFee.toFixed(2)})`]
            );
          }
        }
      }
    } catch (err) {
      console.error('Vendor auto-transfer error:', err.message);
    }
  }

  res.json({ success: true, order });
});

// ─── ORDER REFUND ────────────────────────────────────────────────
app.post('/api/orders/:id/refund', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }

  const order = await db.orders.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (!order.isPaid || !order.stripePaymentIntentId) {
    return res.status(400).json({ success: false, message: 'Order is not paid or has no payment intent' });
  }

  const maxRefundable = Math.round((order.total - order.refundedAmount) * 100) / 100;
  if (maxRefundable <= 0) {
    return res.status(400).json({ success: false, message: 'Order is already fully refunded' });
  }

  const requestedAmount = req.body.amount ? Math.round(Number(req.body.amount) * 100) / 100 : maxRefundable;
  if (requestedAmount <= 0 || requestedAmount > maxRefundable) {
    return res.status(400).json({ success: false, message: `Refund amount must be between $0.01 and $${maxRefundable.toFixed(2)}` });
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
      amount: Math.round(requestedAmount * 100),
    });

    const newRefundedAmount = Math.round((order.refundedAmount + requestedAmount) * 100) / 100;
    const refundStatus = newRefundedAmount >= order.total ? 'full' : 'partial';

    await pool.query(
      `INSERT INTO refunds (order_id, stripe_refund_id, amount, reason, status, initiated_by)
       VALUES ($1, $2, $3, $4, 'completed', $5)`,
      [order.id, refund.id, requestedAmount, req.body.reason || null, req.user.id]
    );

    await pool.query(
      `UPDATE orders SET refunded_amount = $1, refund_status = $2 WHERE id = $3`,
      [newRefundedAmount, refundStatus, order.id]
    );

    res.json({
      success: true,
      refund: {
        stripeRefundId: refund.id,
        amount: requestedAmount,
        refundStatus,
        totalRefunded: newRefundedAmount,
      },
    });
  } catch (err) {
    console.error('Refund error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to process refund' });
  }
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

// ─── VENDOR DASHBOARD STATS ─────────────────────────────────────

app.get('/api/vendors/dashboard/stats', authenticate, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  const vendorId = req.user.vendorId || 'admin';

  // Product count
  const prodCount = await pool.query(
    'SELECT COUNT(*) FROM products WHERE vendor_id = $1', [vendorId]
  );

  // Orders containing this vendor's items
  const orderStats = await pool.query(
    `SELECT o.id, o.status, o.total, o.created_at,
            SUM(oi.price * oi.quantity) AS vendor_total
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     WHERE oi.vendor_id = $1
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [vendorId]
  );

  const totalOrders = orderStats.rows.length;
  const totalRevenue = orderStats.rows.reduce((sum, r) => sum + Number(r.vendor_total), 0);
  const recentOrders = orderStats.rows.slice(0, 10).map(r => ({
    id: r.id,
    status: r.status,
    total: Number(r.vendor_total),
    createdAt: r.created_at,
  }));

  res.json({
    success: true,
    stats: {
      totalProducts: Number(prodCount.rows[0].count),
      totalOrders,
      totalRevenue,
      recentOrders,
    },
  });
});

// ─── VENDOR STRIPE CONNECT ──────────────────────────────────────

app.post('/api/vendors/stripe/onboard', authenticate, async (req, res) => {
  if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Vendors only' });
  }
  try {
    let stripeAccountId = req.user.stripe_account_id;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: req.user.email,
        metadata: { gob_user_id: String(req.user.id), role: 'vendor' },
      });
      stripeAccountId = account.id;
      await pool.query('UPDATE users SET stripe_account_id = $1 WHERE id = $2', [stripeAccountId, req.user.id]);
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.FRONTEND_URL || 'https://goodobox.com'}/vendor?stripe=refresh`,
      return_url: `${process.env.FRONTEND_URL || 'https://goodobox.com'}/vendor?stripe=return`,
      type: 'account_onboarding',
    });

    res.json({ success: true, url: accountLink.url });
  } catch (err) {
    console.error('Vendor Stripe onboard error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to start Stripe onboarding' });
  }
});

app.get('/api/vendors/stripe/status', authenticate, async (req, res) => {
  if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Vendors only' });
  }
  const stripeAccountId = req.user.stripe_account_id;
  if (!stripeAccountId) {
    return res.json({ success: true, connected: false });
  }
  try {
    const account = await stripe.accounts.retrieve(stripeAccountId);
    const connected = account.payouts_enabled;
    if (connected && !req.user.stripe_onboarding_complete) {
      await pool.query('UPDATE users SET stripe_onboarding_complete = TRUE WHERE id = $1', [req.user.id]);
    }
    res.json({
      success: true,
      connected,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      stripeAccountId,
    });
  } catch (err) {
    console.error('Vendor Stripe status error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to check Stripe status' });
  }
});

app.post('/api/vendors/stripe/dashboard-link', authenticate, async (req, res) => {
  if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Vendors only' });
  }
  const stripeAccountId = req.user.stripe_account_id;
  if (!stripeAccountId) {
    return res.status(400).json({ success: false, message: 'No Stripe account connected' });
  }
  try {
    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
    res.json({ success: true, url: loginLink.url });
  } catch (err) {
    console.error('Vendor Stripe dashboard link error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create dashboard link' });
  }
});

app.post('/api/vendors/stripe/catch-up', authenticate, async (req, res) => {
  if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Vendors only' });
  }
  const vendorId = req.user.vendorId || 'admin';
  const stripeAccountId = req.user.stripe_account_id;
  if (!stripeAccountId || !req.user.stripe_onboarding_complete) {
    return res.status(400).json({ success: false, message: 'Stripe account not ready' });
  }
  try {
    // Find delivered orders with this vendor's items that have no vendor_payouts record
    const { rows } = await pool.query(
      `SELECT o.id AS order_id, SUM(oi.price * oi.quantity) AS vendor_total
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE oi.vendor_id = $1 AND o.status = 'delivered'
         AND NOT EXISTS (SELECT 1 FROM vendor_payouts vp WHERE vp.order_id = o.id AND vp.vendor_id = $1)
       GROUP BY o.id`,
      [vendorId]
    );
    let transferred = 0;
    let totalAmount = 0;
    for (const row of rows) {
      const grossAmount = Number(row.vendor_total);
      const platformFee = Math.round(grossAmount * PLATFORM_FEE_PERCENT) / 100;
      const vendorPayout = Math.round((grossAmount - platformFee) * 100) / 100;
      const amountCents = Math.round(vendorPayout * 100);
      if (amountCents <= 0) continue;
      const transfer = await stripe.transfers.create({
        amount: amountCents,
        currency: 'usd',
        destination: stripeAccountId,
        metadata: { order_id: String(row.order_id), vendor_id: vendorId, platform_fee: platformFee.toFixed(2) },
      });
      await pool.query(
        `INSERT INTO vendor_payouts (vendor_id, order_id, amount, stripe_transfer_id, status, paid_at, payment_method, notes)
         VALUES ($1, $2, $3, $4, 'paid', NOW(), 'stripe', $5)`,
        [vendorId, row.order_id, vendorPayout, transfer.id, `Stripe transfer ${transfer.id} (catch-up, ${PLATFORM_FEE_PERCENT}% fee: $${platformFee.toFixed(2)})`]
      );
      transferred++;
      totalAmount += vendorPayout;
    }
    res.json({ success: true, transferred, totalAmount });
  } catch (err) {
    console.error('Vendor Stripe catch-up error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to process catch-up transfers' });
  }
});

app.get('/api/vendors/earnings', authenticate, async (req, res) => {
  if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Vendors only' });
  }
  const vendorId = req.user.vendorId || 'admin';
  try {
    // Total revenue from all delivered orders
    const revenueResult = await pool.query(
      `SELECT COALESCE(SUM(oi.price * oi.quantity), 0) AS total_revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE oi.vendor_id = $1 AND o.status = 'delivered'`,
      [vendorId]
    );
    const totalRevenue = Number(revenueResult.rows[0].total_revenue);

    // Admin keeps 100% (no transfers needed), vendors get (100 - fee)%
    const isAdmin = vendorId === 'admin';
    const feePercent = isAdmin ? 0 : PLATFORM_FEE_PERCENT;
    const totalFees = isAdmin ? 0 : Math.round(totalRevenue * feePercent) / 100;
    const netRevenue = Math.round((totalRevenue - totalFees) * 100) / 100;

    // Total paid out
    const paidResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_paid
       FROM vendor_payouts WHERE vendor_id = $1 AND status = 'paid'`,
      [vendorId]
    );
    const totalPaid = Number(paidResult.rows[0].total_paid);

    // Payout history
    const { rows: payouts } = await pool.query(
      `SELECT * FROM vendor_payouts WHERE vendor_id = $1 ORDER BY created_at DESC`,
      [vendorId]
    );

    res.json({
      success: true,
      earnings: {
        totalRevenue,
        platformFeePercent: feePercent,
        totalFees,
        netRevenue,
        totalPaid,
        unpaidBalance: Math.round((netRevenue - totalPaid) * 100) / 100,
        isAdmin,
      },
      payouts: payouts.map(p => ({
        id: p.id,
        orderId: p.order_id,
        amount: Number(p.amount),
        stripeTransferId: p.stripe_transfer_id,
        status: p.status,
        paidAt: p.paid_at,
        paymentMethod: p.payment_method,
        notes: p.notes,
        createdAt: p.created_at,
      })),
    });
  } catch (err) {
    console.error('Vendor earnings error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch earnings' });
  }
});

// ─── VENDOR ORDERS ──────────────────────────────────────────────

app.get('/api/vendor/orders', authenticate, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  const vendorId = req.user.vendorId || 'admin';

  const { rows } = await pool.query(
    `SELECT DISTINCT o.* FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     WHERE oi.vendor_id = $1
     ORDER BY o.created_at DESC`,
    [vendorId]
  );

  const orders = [];
  for (const row of rows) {
    const itemRes = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1 AND vendor_id = $2',
      [row.id, vendorId]
    );
    orders.push({
      id: row.id,
      userId: String(row.user_id),
      items: itemRes.rows.map(i => ({
        productId: i.product_id,
        name: i.name,
        price: Number(i.price),
        quantity: i.quantity,
        vendorId: i.vendor_id,
      })),
      status: row.status,
      total: Number(row.total),
      createdAt: row.created_at,
    });
  }

  res.json({ success: true, orders });
});

// ─── VENDOR PRODUCT LIST ────────────────────────────────────────

app.get('/api/vendor/products', authenticate, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  const vendorId = req.user.vendorId || 'admin';
  const result = await db.products.findWithFilters({ vendor: vendorId, limit: 100, includeOutOfStock: true });
  res.json({ success: true, products: result.products });
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

// ─── ADMIN FINANCIALS ───────────────────────────────────────────
app.get('/api/admin/financials', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  try {
    // Total revenue from paid orders
    const revenueResult = await pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total_revenue FROM orders WHERE is_paid = TRUE`
    );
    const totalRevenue = Number(revenueResult.rows[0].total_revenue);

    // Platform fees earned (10% of vendor delivered+paid sales, excluding admin products)
    const vendorSalesResult = await pool.query(
      `SELECT COALESCE(SUM(oi.price * oi.quantity), 0) AS vendor_sales
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.is_paid = TRUE AND o.status = 'delivered' AND oi.vendor_id != 'admin'`
    );
    const vendorSales = Number(vendorSalesResult.rows[0].vendor_sales);
    const platformFees = Math.round(vendorSales * PLATFORM_FEE_PERCENT) / 100;

    // Admin direct sales (products sold by admin vendor)
    const adminSalesResult = await pool.query(
      `SELECT COALESCE(SUM(oi.price * oi.quantity), 0) AS admin_sales
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.is_paid = TRUE AND oi.vendor_id = 'admin'`
    );
    const adminSales = Number(adminSalesResult.rows[0].admin_sales);

    // Total refunded
    const refundResult = await pool.query(
      `SELECT COALESCE(SUM(refunded_amount), 0) AS total_refunded FROM orders WHERE refunded_amount > 0`
    );
    const totalRefunded = Number(refundResult.rows[0].total_refunded);

    // Net revenue
    const netRevenue = Math.round((totalRevenue - totalRefunded) * 100) / 100;

    // Recent 20 paid orders as transactions
    const { rows: recentRows } = await pool.query(
      `SELECT id, total, status, is_paid, paid_at, refund_status, refunded_amount, created_at
       FROM orders WHERE is_paid = TRUE ORDER BY paid_at DESC LIMIT 20`
    );
    const recentTransactions = recentRows.map(r => ({
      orderId: r.id,
      total: Number(r.total),
      status: r.status,
      paidAt: r.paid_at,
      refundStatus: r.refund_status,
      refundedAmount: Number(r.refunded_amount || 0),
    }));

    // Monthly revenue (last 6 months)
    const { rows: monthlyRows } = await pool.query(
      `SELECT DATE_TRUNC('month', paid_at) AS month, SUM(total) AS revenue, COUNT(*) AS order_count
       FROM orders WHERE is_paid = TRUE AND paid_at >= NOW() - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', paid_at)
       ORDER BY month DESC`
    );
    const monthlyRevenue = monthlyRows.map(r => ({
      month: r.month,
      revenue: Number(r.revenue),
      orderCount: Number(r.order_count),
    }));

    res.json({
      success: true,
      financials: {
        totalRevenue,
        platformFees,
        adminSales,
        netRevenue,
        totalRefunded,
        recentTransactions,
        monthlyRevenue,
      },
    });
  } catch (err) {
    console.error('Admin financials error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch financials' });
  }
});

// ─── DRIVER APPLICATION ROUTES ──────────────────────────────────

app.post('/api/drivers/apply', async (req, res) => {
  const { name, email, phone, vehicleType, vehicleYear, vehicleMake, vehicleModel, licenseNumber, licenseState } = req.body;
  if (!name || !email || !phone || !vehicleType || !licenseNumber || !licenseState) {
    return res.status(400).json({ success: false, message: 'Name, email, phone, vehicle type, license number, and license state are required' });
  }
  const existing = await db.driverApplications.findByEmail(email);
  if (existing) {
    return res.status(400).json({ success: false, message: 'An application with this email already exists' });
  }
  const application = await db.driverApplications.create(req.body);
  res.status(201).json({ success: true, application });
});

app.get('/api/drivers/applications', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  const applications = await db.driverApplications.findAll(req.query.status);
  res.json({ success: true, applications });
});

app.put('/api/drivers/applications/:id/approve', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  const app_record = await db.driverApplications.findById(req.params.id);
  if (!app_record) return res.status(404).json({ success: false, message: 'Application not found' });

  // Approve the application
  await db.driverApplications.updateStatus(req.params.id, 'approved', req.user.id);

  // Create a driver user account with a temporary password
  const existingUser = await db.users.findByEmail(app_record.email);
  if (existingUser) {
    // Update existing user role to driver
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['driver', existingUser.id]);
    return res.json({ success: true, message: 'Application approved, existing user updated to driver role' });
  }

  const tempPassword = 'driver' + Math.random().toString(36).slice(2, 8);
  const hash = bcrypt.hashSync(tempPassword, 10);
  await db.users.create({ name: app_record.name, email: app_record.email, password: hash, role: 'driver' });

  console.log(`[Driver Approved] ${app_record.email} — temp password: ${tempPassword}`);
  res.json({ success: true, message: 'Application approved, driver account created', tempPassword });
});

app.put('/api/drivers/applications/:id/reject', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  const app_record = await db.driverApplications.findById(req.params.id);
  if (!app_record) return res.status(404).json({ success: false, message: 'Application not found' });
  await db.driverApplications.updateStatus(req.params.id, 'rejected', req.user.id);
  res.json({ success: true, message: 'Application rejected' });
});

// ─── DELIVERY ROUTES ────────────────────────────────────────────

app.get('/api/deliveries/available', authenticate, async (req, res) => {
  if (req.user.role !== 'driver' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Drivers only' });
  }
  const deliveries = await db.deliveries.findAvailable();
  res.json({ success: true, deliveries });
});

app.post('/api/deliveries/:id/claim', authenticate, async (req, res) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ success: false, message: 'Drivers only' });
  }
  const delivery = await db.deliveries.findById(req.params.id);
  if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
  if (delivery.driverId) return res.status(400).json({ success: false, message: 'Delivery already claimed' });
  const updated = await db.deliveries.assignDriver(req.params.id, req.user.id, 'claimed');
  res.json({ success: true, delivery: updated });
});

app.get('/api/deliveries/my-deliveries', authenticate, async (req, res) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ success: false, message: 'Drivers only' });
  }
  const deliveries = await db.deliveries.findByDriver(req.user.id, req.query.status);
  res.json({ success: true, deliveries });
});

app.put('/api/deliveries/:id/status', authenticate, async (req, res) => {
  if (req.user.role !== 'driver' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  const { status, notes } = req.body;
  const validStatuses = ['picked_up', 'en_route', 'delivered', 'failed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  const delivery = await db.deliveries.findById(req.params.id);
  if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
  if (req.user.role === 'driver' && delivery.driverId !== Number(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Not your delivery' });
  }
  const updated = await db.deliveries.updateStatus(req.params.id, status, notes);

  // If delivered, also update the order status and trigger Stripe transfer
  if (status === 'delivered') {
    await db.orders.updateStatus(delivery.orderId, 'delivered');

    // Auto-transfer via Stripe if driver is connected
    try {
      const driverResult = await pool.query(
        'SELECT stripe_account_id, stripe_onboarding_complete FROM users WHERE id = $1',
        [delivery.driverId]
      );
      const driver = driverResult.rows[0];
      if (driver && driver.stripe_account_id && driver.stripe_onboarding_complete) {
        const amountCents = Math.round(delivery.deliveryFee * 100);
        if (amountCents > 0) {
          const transfer = await stripe.transfers.create({
            amount: amountCents,
            currency: 'usd',
            destination: driver.stripe_account_id,
            metadata: { delivery_id: String(delivery.id), order_id: String(delivery.orderId) },
          });
          await pool.query('UPDATE deliveries SET stripe_transfer_id = $1 WHERE id = $2', [transfer.id, delivery.id]);
          const payout = await db.driverPayouts.create({
            driverId: delivery.driverId,
            amount: delivery.deliveryFee,
            periodStart: new Date(),
            periodEnd: new Date(),
            deliveryCount: 1,
            notes: `Stripe transfer ${transfer.id}`,
          });
          await db.driverPayouts.markAsPaid(payout.id, 'stripe');
        }
      }
    } catch (err) {
      console.error('Auto Stripe transfer error:', err.message);
    }
  }

  res.json({ success: true, delivery: updated });
});

app.get('/api/deliveries/:orderId/status', async (req, res) => {
  const delivery = await db.deliveries.findByOrderId(req.params.orderId);
  if (!delivery) return res.status(404).json({ success: false, message: 'No delivery found for this order' });
  res.json({ success: true, delivery });
});

// ─── ADMIN DELIVERY MANAGEMENT ─────────────────────────────────

app.get('/api/admin/deliveries', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  const deliveries = await db.deliveries.findAll();
  res.json({ success: true, deliveries });
});

app.post('/api/admin/deliveries/:id/assign', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  const { driverId } = req.body;
  if (!driverId) return res.status(400).json({ success: false, message: 'driverId is required' });
  const delivery = await db.deliveries.findById(req.params.id);
  if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
  const updated = await db.deliveries.assignDriver(req.params.id, driverId, 'admin_assigned');
  res.json({ success: true, delivery: updated });
});

app.get('/api/admin/drivers', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.joined_at, u.stripe_account_id, u.stripe_onboarding_complete,
            COUNT(d.id) FILTER (WHERE d.status = 'delivered') AS delivery_count,
            COALESCE(SUM(d.delivery_fee) FILTER (WHERE d.status = 'delivered'), 0) AS total_earnings
     FROM users u
     LEFT JOIN deliveries d ON d.driver_id = u.id
     WHERE u.role = 'driver'
     GROUP BY u.id
     ORDER BY u.id`
  );
  const drivers = rows.map(r => ({
    id: String(r.id),
    name: r.name,
    email: r.email,
    joinedAt: r.joined_at,
    deliveryCount: Number(r.delivery_count),
    totalEarnings: Number(r.total_earnings),
    stripeAccountId: r.stripe_account_id || null,
    stripeOnboardingComplete: r.stripe_onboarding_complete || false,
  }));
  res.json({ success: true, drivers });
});

// ─── DRIVER DASHBOARD & EARNINGS ────────────────────────────────

app.get('/api/drivers/dashboard', authenticate, async (req, res) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ success: false, message: 'Drivers only' });
  }
  const allDeliveries = await db.deliveries.findByDriver(req.user.id);
  const earnings = await db.driverPayouts.getEarnings(req.user.id);
  const active = allDeliveries.filter(d => !['delivered', 'failed'].includes(d.status));

  // Today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDeliveries = allDeliveries.filter(d => d.status === 'delivered' && new Date(d.deliveredAt) >= today);
  const todayEarnings = todayDeliveries.reduce((sum, d) => sum + d.deliveryFee, 0);

  res.json({
    success: true,
    dashboard: {
      todayDeliveries: todayDeliveries.length,
      todayEarnings,
      totalDeliveries: earnings.deliveryCount,
      totalEarnings: earnings.totalEarnings,
      activeDeliveries: active.length,
      active,
    },
  });
});

app.get('/api/drivers/earnings', authenticate, async (req, res) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ success: false, message: 'Drivers only' });
  }
  const earnings = await db.driverPayouts.getEarnings(req.user.id);
  const payouts = await db.driverPayouts.findByDriver(req.user.id);
  res.json({ success: true, earnings, payouts });
});

app.get('/api/drivers/payouts', authenticate, async (req, res) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ success: false, message: 'Drivers only' });
  }
  const payouts = await db.driverPayouts.findByDriver(req.user.id);
  res.json({ success: true, payouts });
});

// ─── AI ROUTES ──────────────────────────────────────────────────

const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes(authenticate));

// ─── STRIPE CONNECT ROUTES ──────────────────────────

app.post('/api/drivers/stripe/onboard', authenticate, async (req, res) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ success: false, message: 'Drivers only' });
  }
  try {
    let stripeAccountId = req.user.stripe_account_id;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: req.user.email,
        metadata: { gob_user_id: String(req.user.id) },
      });
      stripeAccountId = account.id;
      await pool.query('UPDATE users SET stripe_account_id = $1 WHERE id = $2', [stripeAccountId, req.user.id]);
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.DRIVER_PWA_URL || 'https://good-open-box-drivers.vercel.app'}/?stripe=refresh`,
      return_url: `${process.env.DRIVER_PWA_URL || 'https://good-open-box-drivers.vercel.app'}/?stripe=return`,
      type: 'account_onboarding',
    });

    res.json({ success: true, url: accountLink.url });
  } catch (err) {
    console.error('Stripe onboard error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to start Stripe onboarding' });
  }
});

app.get('/api/drivers/stripe/status', authenticate, async (req, res) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ success: false, message: 'Drivers only' });
  }
  const stripeAccountId = req.user.stripe_account_id;
  if (!stripeAccountId) {
    return res.json({ success: true, connected: false });
  }
  try {
    const account = await stripe.accounts.retrieve(stripeAccountId);
    const connected = account.payouts_enabled;
    if (connected && !req.user.stripe_onboarding_complete) {
      await pool.query('UPDATE users SET stripe_onboarding_complete = TRUE WHERE id = $1', [req.user.id]);
    }
    res.json({
      success: true,
      connected,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      stripeAccountId,
    });
  } catch (err) {
    console.error('Stripe status error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to check Stripe status' });
  }
});

app.post('/api/drivers/stripe/dashboard-link', authenticate, async (req, res) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ success: false, message: 'Drivers only' });
  }
  const stripeAccountId = req.user.stripe_account_id;
  if (!stripeAccountId) {
    return res.status(400).json({ success: false, message: 'No Stripe account connected' });
  }
  try {
    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
    res.json({ success: true, url: loginLink.url });
  } catch (err) {
    console.error('Stripe dashboard link error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create dashboard link' });
  }
});

app.post('/api/drivers/stripe/catch-up', authenticate, async (req, res) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ success: false, message: 'Drivers only' });
  }
  const stripeAccountId = req.user.stripe_account_id;
  if (!stripeAccountId || !req.user.stripe_onboarding_complete) {
    return res.status(400).json({ success: false, message: 'Stripe account not ready' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT * FROM deliveries WHERE driver_id = $1 AND status = 'delivered' AND stripe_transfer_id IS NULL`,
      [req.user.id]
    );
    let transferred = 0;
    let totalAmount = 0;
    for (const del of rows) {
      const amountCents = Math.round(Number(del.delivery_fee) * 100);
      if (amountCents <= 0) continue;
      const transfer = await stripe.transfers.create({
        amount: amountCents,
        currency: 'usd',
        destination: stripeAccountId,
        metadata: { delivery_id: String(del.id), order_id: String(del.order_id) },
      });
      await pool.query('UPDATE deliveries SET stripe_transfer_id = $1 WHERE id = $2', [transfer.id, del.id]);
      await db.driverPayouts.create({
        driverId: req.user.id,
        amount: Number(del.delivery_fee),
        periodStart: del.delivered_at || del.created_at,
        periodEnd: del.delivered_at || del.created_at,
        deliveryCount: 1,
        notes: `Stripe transfer ${transfer.id} (catch-up)`,
      });
      await db.driverPayouts.markAsPaid(
        (await pool.query('SELECT id FROM driver_payouts WHERE driver_id = $1 ORDER BY id DESC LIMIT 1', [req.user.id])).rows[0].id,
        'stripe'
      );
      transferred++;
      totalAmount += Number(del.delivery_fee);
    }
    res.json({ success: true, transferred, totalAmount });
  } catch (err) {
    console.error('Stripe catch-up error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to process catch-up transfers' });
  }
});

// Stripe webhook
app.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      await pool.query(
        `UPDATE orders SET is_paid = TRUE, paid_at = NOW(), status = 'confirmed',
         stripe_payment_intent_id = $1 WHERE id = $2`,
        [session.payment_intent, orderId]
      );
      console.log(`[Stripe] Payment completed for order ${orderId}`);
    }
  } else if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      // Restore stock for cancelled checkout
      const { rows: orderItems } = await pool.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1', [orderId]
      );
      for (const item of orderItems) {
        await pool.query(
          'UPDATE products SET stock = stock + $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }
      await pool.query(
        `UPDATE orders SET status = 'cancelled' WHERE id = $1`, [orderId]
      );
      console.log(`[Stripe] Checkout expired, stock restored for order ${orderId}`);
    }
  } else if (event.type === 'account.updated') {
    const account = event.data.object;
    if (account.payouts_enabled) {
      await pool.query(
        'UPDATE users SET stripe_onboarding_complete = TRUE WHERE stripe_account_id = $1',
        [account.id]
      );
      console.log(`[Stripe] Payouts enabled for account ${account.id}`);
    }
  } else if (event.type === 'transfer.failed') {
    const transfer = event.data.object;
    console.error(`[Stripe] Transfer failed: ${transfer.id}`, transfer.metadata);
  }

  res.json({ received: true });
});

// ─── DELIVERY FEE ENDPOINT ──────────────────────────────────────

app.get('/api/delivery-fee', async (req, res) => {
  const { street, city, state, zip } = req.query;
  if (!street || !city || !state || !zip) {
    return res.status(400).json({ success: false, message: 'street, city, state, and zip are required' });
  }
  const coords = await geocodeAddress({ street, city, state, zip });
  if (!coords) {
    return res.json({ success: true, fee: 9.75, miles: null, breakdown: 'Base fee (address could not be verified)' });
  }
  const miles = haversineDistance(STORE_LAT, STORE_LNG, coords.lat, coords.lng);
  const fee = calculateDeliveryFee(miles);
  const roundedMiles = Math.round(miles * 10) / 10;
  const breakdown = miles <= 5
    ? `$9.75 base (${roundedMiles} mi)`
    : `$9.75 base + $${(0.75 * (miles - 5)).toFixed(2)} (${roundedMiles} mi × $0.75/mi over 5 mi)`;
  res.json({ success: true, fee, miles: roundedMiles, breakdown });
});

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
