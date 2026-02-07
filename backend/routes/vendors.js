const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// POST /api/vendors/apply — apply to become a vendor
router.post('/apply', protect, async (req, res) => {
  try {
    const existingVendor = await Vendor.findOne({ user: req.user._id });
    if (existingVendor) {
      return res.status(400).json({ success: false, message: 'Vendor application already exists' });
    }

    const vendor = await Vendor.create({
      user: req.user._id,
      businessName: req.body.businessName,
      description: req.body.description,
      contactEmail: req.body.contactEmail || req.user.email,
      contactPhone: req.body.contactPhone,
      address: req.body.address,
      paypalEmail: req.body.paypalEmail,
    });

    await User.findByIdAndUpdate(req.user._id, { role: 'vendor', vendor: vendor._id });

    res.status(201).json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/vendors — list all approved vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find({ isApproved: true, isActive: true })
      .select('businessName slug logo description rating totalSales');
    res.json({ success: true, vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/vendors/:id — vendor profile + products
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('user', 'name avatar');
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    const products = await Product.find({ vendor: vendor._id, isActive: true }).sort({ createdAt: -1 });

    res.json({ success: true, vendor, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/vendors/dashboard/stats — vendor dashboard
router.get('/dashboard/stats', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' });

    const [productCount, orders, recentOrders] = await Promise.all([
      Product.countDocuments({ vendor: vendor._id }),
      Order.find({ 'items.vendor': vendor._id }),
      Order.find({ 'items.vendor': vendor._id }).sort({ createdAt: -1 }).limit(10).populate('user', 'name email'),
    ]);

    const totalRevenue = orders.reduce((sum, order) => {
      const vendorItems = order.items.filter((item) => item.vendor.toString() === vendor._id.toString());
      return sum + vendorItems.reduce((s, item) => s + item.price * item.quantity, 0);
    }, 0);

    res.json({
      success: true,
      stats: {
        totalProducts: productCount,
        totalOrders: orders.length,
        totalRevenue,
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/vendors/:id — update vendor profile
router.put('/:id', protect, authorize('vendor', 'admin'), async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    if (req.user.role === 'vendor' && vendor.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, vendor: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/vendors/:id/approve — admin only
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.json({ success: true, vendor, message: 'Vendor approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
