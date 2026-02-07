const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([User.deleteMany(), Vendor.deleteMany(), Product.deleteMany()]);
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@goodopenbox.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
    });

    // Create vendor users
    const vendorUser1 = await User.create({
      name: 'Tech Deals Pro',
      email: 'vendor1@goodopenbox.com',
      password: 'vendor123',
      role: 'vendor',
      isVerified: true,
    });

    const vendorUser2 = await User.create({
      name: 'Home Essentials Hub',
      email: 'vendor2@goodopenbox.com',
      password: 'vendor123',
      role: 'vendor',
      isVerified: true,
    });

    // Create customer
    await User.create({
      name: 'John Customer',
      email: 'customer@goodopenbox.com',
      password: 'customer123',
      role: 'customer',
      isVerified: true,
    });

    // Create vendors
    const vendor1 = await Vendor.create({
      user: vendorUser1._id,
      businessName: 'Tech Deals Pro',
      description: 'Premium open-box electronics at unbeatable prices',
      contactEmail: 'vendor1@goodopenbox.com',
      isApproved: true,
      rating: 4.5,
    });

    const vendor2 = await Vendor.create({
      user: vendorUser2._id,
      businessName: 'Home Essentials Hub',
      description: 'Quality home goods, appliances, and furniture — open-box savings',
      contactEmail: 'vendor2@goodopenbox.com',
      isApproved: true,
      rating: 4.3,
    });

    // Link vendors to users
    await User.findByIdAndUpdate(vendorUser1._id, { vendor: vendor1._id });
    await User.findByIdAndUpdate(vendorUser2._id, { vendor: vendor2._id });

    // Create products
    const products = [
      {
        vendor: vendor1._id,
        name: 'Samsung 65" QLED 4K Smart TV',
        description: 'Open-box Samsung QLED with Quantum HDR, smart hub, and Alexa built-in. Original packaging with minor box damage only.',
        price: 649.99,
        compareAtPrice: 999.99,
        category: 'Electronics',
        subcategory: 'TVs',
        brand: 'Samsung',
        condition: 'open-box',
        stock: 5,
        sku: 'SAM-QLED-65',
        tags: ['tv', 'samsung', 'qled', '4k', 'smart-tv'],
        isFeatured: true,
      },
      {
        vendor: vendor1._id,
        name: 'Apple MacBook Air M2 13"',
        description: 'Like-new MacBook Air M2 chip, 8GB RAM, 256GB SSD. Opened and returned, never used. Full warranty.',
        price: 849.99,
        compareAtPrice: 1199.00,
        category: 'Electronics',
        subcategory: 'Laptops',
        brand: 'Apple',
        condition: 'like-new',
        stock: 3,
        sku: 'APL-MBA-M2',
        tags: ['macbook', 'apple', 'laptop', 'm2'],
        isFeatured: true,
      },
      {
        vendor: vendor1._id,
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Open-box Sony noise-cancelling headphones. Industry-leading ANC, 30-hour battery. All accessories included.',
        price: 248.00,
        compareAtPrice: 399.99,
        category: 'Electronics',
        subcategory: 'Audio',
        brand: 'Sony',
        condition: 'open-box',
        stock: 12,
        sku: 'SONY-XM5',
        tags: ['headphones', 'sony', 'noise-cancelling', 'wireless'],
      },
      {
        vendor: vendor1._id,
        name: 'iPad Pro 11" M2 Wi-Fi 128GB',
        description: 'Refurbished iPad Pro with Liquid Retina display. Tested and certified, cosmetic grade A.',
        price: 549.99,
        compareAtPrice: 799.00,
        category: 'Electronics',
        subcategory: 'Tablets',
        brand: 'Apple',
        condition: 'refurbished',
        stock: 7,
        sku: 'APL-IPADPRO-M2',
        tags: ['ipad', 'apple', 'tablet', 'm2'],
      },
      {
        vendor: vendor1._id,
        name: 'Bose SoundLink Flex Speaker',
        description: 'Open-box portable Bluetooth speaker. Waterproof IP67, 12-hour battery. Box opened for inspection only.',
        price: 99.99,
        compareAtPrice: 149.00,
        category: 'Electronics',
        subcategory: 'Audio',
        brand: 'Bose',
        condition: 'open-box',
        stock: 20,
        sku: 'BOSE-FLEX',
        tags: ['speaker', 'bose', 'bluetooth', 'portable'],
      },
      {
        vendor: vendor2._id,
        name: 'Dyson V15 Detect Vacuum',
        description: 'Open-box Dyson cordless vacuum with laser dust detection. Full accessory kit included. Tested and working perfectly.',
        price: 449.99,
        compareAtPrice: 749.99,
        category: 'Home',
        subcategory: 'Vacuums',
        brand: 'Dyson',
        condition: 'open-box',
        stock: 4,
        sku: 'DYS-V15',
        tags: ['vacuum', 'dyson', 'cordless', 'home'],
        isFeatured: true,
      },
      {
        vendor: vendor2._id,
        name: 'KitchenAid Artisan Stand Mixer',
        description: 'Open-box 5-quart tilt-head stand mixer in Empire Red. Unused, returned due to wrong color order.',
        price: 279.99,
        compareAtPrice: 449.99,
        category: 'Home',
        subcategory: 'Kitchen',
        brand: 'KitchenAid',
        condition: 'open-box',
        stock: 6,
        sku: 'KA-ARTISAN',
        tags: ['mixer', 'kitchenaid', 'kitchen', 'baking'],
      },
      {
        vendor: vendor2._id,
        name: 'Instant Pot Duo Plus 8-Quart',
        description: 'Like-new 9-in-1 pressure cooker. Customer return — used once. All parts and manual included.',
        price: 69.99,
        compareAtPrice: 119.99,
        category: 'Home',
        subcategory: 'Kitchen',
        brand: 'Instant Pot',
        condition: 'like-new',
        stock: 15,
        sku: 'IP-DUO-8',
        tags: ['instant-pot', 'pressure-cooker', 'kitchen'],
      },
      {
        vendor: vendor2._id,
        name: 'Nespresso Vertuo Next Coffee Machine',
        description: 'Open-box Nespresso with Aeroccino milk frother bundle. Sealed pods sample pack included.',
        price: 129.99,
        compareAtPrice: 209.99,
        category: 'Home',
        subcategory: 'Kitchen',
        brand: 'Nespresso',
        condition: 'open-box',
        stock: 8,
        sku: 'NESP-VERTUO',
        tags: ['coffee', 'nespresso', 'kitchen', 'espresso'],
      },
      {
        vendor: vendor2._id,
        name: 'iRobot Roomba j7+ Self-Emptying Vacuum',
        description: 'Refurbished robot vacuum with smart mapping and obstacle avoidance. Clean base included. 90-day warranty.',
        price: 349.99,
        compareAtPrice: 599.99,
        category: 'Home',
        subcategory: 'Vacuums',
        brand: 'iRobot',
        condition: 'refurbished',
        stock: 3,
        sku: 'IRB-J7PLUS',
        tags: ['roomba', 'robot-vacuum', 'irobot', 'smart-home'],
        isFeatured: true,
      },
    ];

    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);

    console.log('\n--- Seed Complete ---');
    console.log('Admin:    admin@goodopenbox.com / admin123');
    console.log('Vendor 1: vendor1@goodopenbox.com / vendor123');
    console.log('Vendor 2: vendor2@goodopenbox.com / vendor123');
    console.log('Customer: customer@goodopenbox.com / customer123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
