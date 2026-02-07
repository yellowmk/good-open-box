const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: [true, 'Business name is required'], trim: true },
  slug: { type: String, unique: true },
  description: { type: String },
  logo: { type: String, default: '' },
  banner: { type: String, default: '' },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: { type: String, default: 'US' },
  },
  commissionRate: { type: Number, default: 10, min: 0, max: 100 },
  stripeAccountId: { type: String },
  paypalEmail: { type: String },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
}, { timestamps: true });

vendorSchema.pre('save', function (next) {
  this.slug = this.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  next();
});

module.exports = mongoose.model('Vendor', vendorSchema);
