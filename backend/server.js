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
  { id: 'electronics', name: 'Electronics', subcategories: ['TVs', 'Laptops', 'Tablets', 'Audio', 'Phones', 'Cameras', 'Gaming', 'Monitors'] },
  { id: 'home', name: 'Home & Kitchen', subcategories: ['Kitchen', 'Vacuums', 'Furniture', 'Smart Home', 'Bedding', 'Decor'] },
  { id: 'sports', name: 'Sports & Outdoors', subcategories: ['Fitness', 'Camping', 'Cycling', 'Running', 'Water Sports'] },
  { id: 'fashion', name: 'Fashion', subcategories: ['Men', 'Women', 'Shoes', 'Accessories', 'Watches', 'Bags'] },
  { id: 'toys', name: 'Toys & Games', subcategories: ['Board Games', 'Action Figures', 'Puzzles', 'Building Sets', 'Outdoor Toys'] },
  { id: 'beauty', name: 'Beauty & Personal Care', subcategories: ['Skincare', 'Hair Care', 'Fragrances', 'Makeup', 'Tools'] },
  { id: 'automotive', name: 'Automotive', subcategories: ['Car Electronics', 'Tools & Equipment', 'Interior', 'Exterior', 'Parts'] },
  { id: 'office', name: 'Office & School', subcategories: ['Desks & Chairs', 'Printers', 'Supplies', 'Organization', 'Backpacks'] },
  { id: 'baby', name: 'Baby & Kids', subcategories: ['Strollers', 'Car Seats', 'Nursery', 'Feeding', 'Toys'] },
  { id: 'garden', name: 'Patio & Garden', subcategories: ['Furniture', 'Grills', 'Planters', 'Lighting', 'Tools'] },
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
  // ─── Electronics (more) ───
  {
    id: 'p11', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'AirPods Pro 2nd Generation', slug: 'airpods-pro-2',
    description: 'Open-box AirPods Pro with active noise cancellation, adaptive transparency, and MagSafe charging case. Sealed tips included.',
    price: 179.99, compareAtPrice: 249.00,
    category: 'Electronics', subcategory: 'Audio', brand: 'Apple',
    condition: 'open-box', stock: 18, sku: 'APL-APP2',
    images: [
      'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1588423771073-b8903fde1c68?w=800&h=800&fit=crop',
    ], tags: ['airpods', 'apple', 'earbuds', 'wireless'],
    rating: 4.8, numReviews: 156, isFeatured: true,
  },
  {
    id: 'p12', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'Nintendo Switch OLED Model', slug: 'nintendo-switch-oled',
    description: 'Like-new Nintendo Switch OLED with vibrant 7-inch screen. Includes dock, Joy-Cons, and all cables. Customer return — played twice.',
    price: 289.99, compareAtPrice: 349.99,
    category: 'Electronics', subcategory: 'Gaming', brand: 'Nintendo',
    condition: 'like-new', stock: 6, sku: 'NIN-SWOLED',
    images: [
      'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&h=800&fit=crop',
    ], tags: ['nintendo', 'switch', 'gaming', 'console'],
    rating: 4.7, numReviews: 73, isFeatured: false,
  },
  {
    id: 'p13', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'Samsung Galaxy Watch 6 Classic', slug: 'galaxy-watch-6',
    description: 'Refurbished Samsung smartwatch with rotating bezel, health monitoring, GPS. Certified grade A, 90-day warranty.',
    price: 219.99, compareAtPrice: 399.99,
    category: 'Electronics', subcategory: 'Phones', brand: 'Samsung',
    condition: 'refurbished', stock: 9, sku: 'SAM-GW6C',
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop',
    ], tags: ['smartwatch', 'samsung', 'galaxy', 'wearable'],
    rating: 4.4, numReviews: 38, isFeatured: false,
  },
  {
    id: 'p14', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'Dell 27" 4K USB-C Monitor', slug: 'dell-27-4k-monitor',
    description: 'Open-box Dell UltraSharp 4K monitor with USB-C connectivity, 60W charging, and factory-calibrated colors. Perfect for productivity.',
    price: 379.99, compareAtPrice: 619.99,
    category: 'Electronics', subcategory: 'Monitors', brand: 'Dell',
    condition: 'open-box', stock: 4, sku: 'DEL-U2723QE',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=800&h=800&fit=crop',
    ], tags: ['monitor', 'dell', '4k', 'usb-c'],
    rating: 4.6, numReviews: 27, isFeatured: false,
  },
  {
    id: 'p15', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'Canon EOS R50 Mirrorless Camera', slug: 'canon-eos-r50',
    description: 'Like-new Canon mirrorless camera with 18-45mm kit lens. 24.2MP, 4K video, Wi-Fi. Opened for testing only.',
    price: 549.99, compareAtPrice: 799.99,
    category: 'Electronics', subcategory: 'Cameras', brand: 'Canon',
    condition: 'like-new', stock: 3, sku: 'CAN-EOSR50',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=800&fit=crop',
    ], tags: ['camera', 'canon', 'mirrorless', 'photography'],
    rating: 4.7, numReviews: 19, isFeatured: false,
  },
  // ─── Home & Kitchen (more) ───
  {
    id: 'p16', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Ninja Foodi 10-in-1 Air Fryer', slug: 'ninja-foodi-air-fryer',
    description: 'Open-box Ninja air fryer with dual zone technology. Air fry, roast, bake, dehydrate, and more. Never used.',
    price: 149.99, compareAtPrice: 229.99,
    category: 'Home & Kitchen', subcategory: 'Kitchen', brand: 'Ninja',
    condition: 'open-box', stock: 11, sku: 'NIN-FOODI10',
    images: [
      'https://images.unsplash.com/photo-1648398677511-e03f46859fb8?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=800&fit=crop',
    ], tags: ['air-fryer', 'ninja', 'kitchen'],
    rating: 4.6, numReviews: 84, isFeatured: false,
  },
  {
    id: 'p17', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Philips Hue Starter Kit (4 Bulbs)', slug: 'philips-hue-starter',
    description: 'Open-box smart lighting kit with Bridge and 4 color-changing bulbs. Works with Alexa, Google, Apple HomeKit.',
    price: 129.99, compareAtPrice: 199.99,
    category: 'Home & Kitchen', subcategory: 'Smart Home', brand: 'Philips',
    condition: 'open-box', stock: 7, sku: 'PHI-HUE4',
    images: [
      'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1565814329452-e1432bc73c05?w=800&h=800&fit=crop',
    ], tags: ['smart-home', 'philips', 'hue', 'lighting'],
    rating: 4.5, numReviews: 45, isFeatured: false,
  },
  {
    id: 'p18', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Breville Barista Express Espresso Machine', slug: 'breville-barista-express',
    description: 'Like-new espresso machine with built-in grinder. Dose-control grinding, digital temperature control. Customer return.',
    price: 499.99, compareAtPrice: 749.99,
    category: 'Home & Kitchen', subcategory: 'Kitchen', brand: 'Breville',
    condition: 'like-new', stock: 2, sku: 'BRV-BARISTA',
    images: [
      'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1587080413959-06b859fb107d?w=800&h=800&fit=crop',
    ], tags: ['espresso', 'breville', 'coffee', 'grinder'],
    rating: 4.8, numReviews: 33, isFeatured: true,
  },
  // ─── Sports & Outdoors ───
  {
    id: 'p19', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'Peloton Bike Mat & Weights Bundle', slug: 'peloton-bike-accessories',
    description: 'Open-box Peloton accessories: premium bike mat, 2lb and 3lb weight sets. Perfect condition, unused.',
    price: 89.99, compareAtPrice: 159.99,
    category: 'Sports & Outdoors', subcategory: 'Fitness', brand: 'Peloton',
    condition: 'open-box', stock: 14, sku: 'PEL-BUNDLE',
    images: [
      'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=800&fit=crop',
    ], tags: ['fitness', 'peloton', 'weights', 'workout'],
    rating: 4.3, numReviews: 21, isFeatured: false,
  },
  {
    id: 'p20', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'Garmin Forerunner 265 GPS Watch', slug: 'garmin-forerunner-265',
    description: 'Refurbished Garmin running watch with AMOLED display, GPS, heart rate, training metrics. Certified refurbished with warranty.',
    price: 299.99, compareAtPrice: 449.99,
    category: 'Sports & Outdoors', subcategory: 'Fitness', brand: 'Garmin',
    condition: 'refurbished', stock: 5, sku: 'GAR-FR265',
    images: [
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1510017803434-a899b57ae1d7?w=800&h=800&fit=crop',
    ], tags: ['garmin', 'running', 'gps', 'fitness-watch'],
    rating: 4.7, numReviews: 52, isFeatured: true,
  },
  {
    id: 'p21', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'YETI Tundra 45 Cooler', slug: 'yeti-tundra-45',
    description: 'Open-box YETI hard cooler. Rotomolded, bear-proof, keeps ice for days. Cosmetic scratch on lid — fully functional.',
    price: 219.99, compareAtPrice: 325.00,
    category: 'Sports & Outdoors', subcategory: 'Camping', brand: 'YETI',
    condition: 'open-box', stock: 3, sku: 'YETI-T45',
    images: [
      'https://images.unsplash.com/photo-1576014131795-8fedb24c709e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=800&fit=crop',
    ], tags: ['yeti', 'cooler', 'camping', 'outdoor'],
    rating: 4.9, numReviews: 15, isFeatured: false,
  },
  {
    id: 'p22', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'Hydro Flask 32oz Wide Mouth', slug: 'hydro-flask-32oz',
    description: 'Like-new insulated water bottle. TempShield double-wall vacuum insulation. Returned — wrong color.',
    price: 29.99, compareAtPrice: 44.95,
    category: 'Sports & Outdoors', subcategory: 'Fitness', brand: 'Hydro Flask',
    condition: 'like-new', stock: 25, sku: 'HF-32WM',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&h=800&fit=crop',
    ], tags: ['water-bottle', 'hydro-flask', 'insulated'],
    rating: 4.6, numReviews: 89, isFeatured: false,
  },
  // ─── Fashion ───
  {
    id: 'p23', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Ray-Ban Wayfarer Classic Sunglasses', slug: 'rayban-wayfarer',
    description: 'Open-box Ray-Ban Wayfarer with polarized lenses. Original case and cleaning cloth included. Tried on, never worn outside.',
    price: 109.99, compareAtPrice: 163.00,
    category: 'Fashion', subcategory: 'Accessories', brand: 'Ray-Ban',
    condition: 'open-box', stock: 8, sku: 'RB-WAYFARER',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=800&fit=crop',
    ], tags: ['sunglasses', 'rayban', 'wayfarer', 'polarized'],
    rating: 4.8, numReviews: 64, isFeatured: false,
  },
  {
    id: 'p24', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Nike Air Max 270 Sneakers', slug: 'nike-air-max-270',
    description: 'Like-new Nike Air Max 270 in Black/White. Tried on indoors only. Original box and tags. Men\'s size 10.',
    price: 89.99, compareAtPrice: 150.00,
    category: 'Fashion', subcategory: 'Shoes', brand: 'Nike',
    condition: 'like-new', stock: 4, sku: 'NIK-AM270',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop',
    ], tags: ['nike', 'sneakers', 'air-max', 'shoes'],
    rating: 4.5, numReviews: 41, isFeatured: true,
  },
  {
    id: 'p25', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'Herschel Supply Retreat Backpack', slug: 'herschel-retreat-backpack',
    description: 'Open-box Herschel backpack with 15" laptop sleeve. Classic design, reinforced bottom. Tag still attached.',
    price: 59.99, compareAtPrice: 99.99,
    category: 'Fashion', subcategory: 'Accessories', brand: 'Herschel',
    condition: 'open-box', stock: 10, sku: 'HER-RETREAT',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=800&h=800&fit=crop',
    ], tags: ['backpack', 'herschel', 'bag', 'laptop'],
    rating: 4.4, numReviews: 37, isFeatured: false,
  },
  {
    id: 'p26', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Casio G-Shock GA2100 Watch', slug: 'casio-gshock-ga2100',
    description: 'Open-box Casio G-Shock "CasiOak" in matte black. Carbon core guard, 200m water resistance. Never worn.',
    price: 69.99, compareAtPrice: 99.99,
    category: 'Fashion', subcategory: 'Accessories', brand: 'Casio',
    condition: 'open-box', stock: 6, sku: 'CAS-GA2100',
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&h=800&fit=crop',
    ], tags: ['watch', 'casio', 'g-shock', 'digital'],
    rating: 4.6, numReviews: 28, isFeatured: false,
  },
  // ─── Toys & Games ───
  {
    id: 'p27', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'LEGO Technic Porsche 911 GT3 RS', slug: 'lego-technic-porsche',
    description: 'Open-box LEGO Technic set #42056. 2,704 pieces, all bags sealed inside. Box has shelf wear only.',
    price: 289.99, compareAtPrice: 449.99,
    category: 'Toys & Games', subcategory: 'Building Sets', brand: 'LEGO',
    condition: 'open-box', stock: 2, sku: 'LEGO-42056',
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1560961911-ba7ef651a56c?w=800&h=800&fit=crop',
    ], tags: ['lego', 'technic', 'porsche', 'building'],
    rating: 4.9, numReviews: 47, isFeatured: true,
  },
  {
    id: 'p28', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Board Game Bundle: Catan + Ticket to Ride', slug: 'board-game-bundle',
    description: 'Like-new board game bundle. Settlers of Catan and Ticket to Ride. Played once each — all pieces verified complete.',
    price: 49.99, compareAtPrice: 89.98,
    category: 'Toys & Games', subcategory: 'Board Games', brand: 'Various',
    condition: 'like-new', stock: 8, sku: 'BG-BUNDLE1',
    images: [
      'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800&h=800&fit=crop',
    ], tags: ['board-game', 'catan', 'ticket-to-ride', 'family'],
    rating: 4.7, numReviews: 23, isFeatured: false,
  },
  {
    id: 'p29', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'DJI Mini 3 Pro Drone', slug: 'dji-mini-3-pro',
    description: 'Refurbished DJI Mini 3 Pro with 4K camera, obstacle avoidance, 34-min flight time. Certified by DJI with 6-month warranty.',
    price: 579.99, compareAtPrice: 859.00,
    category: 'Electronics', subcategory: 'Cameras', brand: 'DJI',
    condition: 'refurbished', stock: 3, sku: 'DJI-MINI3P',
    images: [
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=800&h=800&fit=crop',
    ], tags: ['drone', 'dji', '4k', 'camera'],
    rating: 4.6, numReviews: 31, isFeatured: false,
  },
  {
    id: 'p30', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Le Creuset Dutch Oven 5.5 Qt', slug: 'le-creuset-dutch-oven',
    description: 'Open-box Le Creuset enameled cast iron dutch oven in Flame Orange. Unused, returned gift. Lifetime warranty applies.',
    price: 249.99, compareAtPrice: 419.99,
    category: 'Home & Kitchen', subcategory: 'Kitchen', brand: 'Le Creuset',
    condition: 'open-box', stock: 3, sku: 'LC-DO55',
    images: [
      'https://images.unsplash.com/photo-1585442245772-b9f7b8fa8f08?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&h=800&fit=crop',
    ], tags: ['dutch-oven', 'le-creuset', 'cast-iron', 'cooking'],
    rating: 4.9, numReviews: 16, isFeatured: false,
  },
  // ─── Beauty & Personal Care ───
  {
    id: 'p31', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Dyson Airwrap Complete Styler', slug: 'dyson-airwrap',
    description: 'Open-box Dyson Airwrap multi-styler with all attachments. Barrels, brushes, and pre-styling dryer included. Used once for demo.',
    price: 399.99, compareAtPrice: 599.99,
    category: 'Beauty & Personal Care', subcategory: 'Hair Care', brand: 'Dyson',
    condition: 'open-box', stock: 2, sku: 'DYS-AIRWRAP',
    images: [
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop',
    ], tags: ['dyson', 'airwrap', 'hair-styler', 'beauty'],
    rating: 4.7, numReviews: 89, isFeatured: true,
  },
  {
    id: 'p32', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Oral-B iO Series 9 Electric Toothbrush', slug: 'oral-b-io9',
    description: 'Like-new Oral-B iO Series 9 with AI tracking, magnetic charger, and travel case. Opened, never used. Sealed brush heads.',
    price: 179.99, compareAtPrice: 299.99,
    category: 'Beauty & Personal Care', subcategory: 'Tools', brand: 'Oral-B',
    condition: 'like-new', stock: 7, sku: 'OB-IO9',
    images: [
      'https://images.unsplash.com/photo-1559591937-fe1e5e4ebb74?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=800&fit=crop',
    ], tags: ['toothbrush', 'oral-b', 'electric', 'dental'],
    rating: 4.5, numReviews: 42, isFeatured: false,
  },
  {
    id: 'p33', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'Theragun Elite Massage Gun', slug: 'theragun-elite',
    description: 'Refurbished Theragun Elite with 5 attachments, OLED screen, QuietForce technology. Certified refurbished with 1-year warranty.',
    price: 249.99, compareAtPrice: 399.00,
    category: 'Beauty & Personal Care', subcategory: 'Tools', brand: 'Therabody',
    condition: 'refurbished', stock: 5, sku: 'TG-ELITE',
    images: [
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&h=800&fit=crop',
    ], tags: ['massage-gun', 'theragun', 'recovery', 'wellness'],
    rating: 4.6, numReviews: 58, isFeatured: false,
  },
  // ─── Automotive ───
  {
    id: 'p34', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'Garmin DriveSmart 76 GPS Navigator', slug: 'garmin-drivesmart-76',
    description: 'Open-box Garmin 7-inch GPS with traffic alerts, Bluetooth calling, and voice assistant. Full North America maps preloaded.',
    price: 219.99, compareAtPrice: 329.99,
    category: 'Automotive', subcategory: 'Car Electronics', brand: 'Garmin',
    condition: 'open-box', stock: 4, sku: 'GAR-DS76',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=800&fit=crop',
    ], tags: ['gps', 'garmin', 'navigation', 'car'],
    rating: 4.4, numReviews: 33, isFeatured: false,
  },
  {
    id: 'p35', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'VIOFO A129 Pro Duo Dash Cam', slug: 'viofo-a129-dashcam',
    description: 'Like-new dual dash cam with 4K front and 1080p rear. GPS, Wi-Fi, parking mode. All mounts and cables included.',
    price: 159.99, compareAtPrice: 249.99,
    category: 'Automotive', subcategory: 'Car Electronics', brand: 'VIOFO',
    condition: 'like-new', stock: 6, sku: 'VIO-A129P',
    images: [
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&h=800&fit=crop',
    ], tags: ['dash-cam', 'viofo', '4k', 'car-camera'],
    rating: 4.5, numReviews: 27, isFeatured: false,
  },
  {
    id: 'p36', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Milwaukee M18 Cordless Impact Driver Kit', slug: 'milwaukee-m18-impact',
    description: 'Open-box Milwaukee 1/4" hex impact driver with 2 batteries, charger, and case. Professional grade, never used on a job.',
    price: 149.99, compareAtPrice: 229.00,
    category: 'Automotive', subcategory: 'Tools & Equipment', brand: 'Milwaukee',
    condition: 'open-box', stock: 3, sku: 'MIL-M18ID',
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1581147060310-8e02caad3f7e?w=800&h=800&fit=crop',
    ], tags: ['drill', 'milwaukee', 'cordless', 'power-tools'],
    rating: 4.8, numReviews: 71, isFeatured: true,
  },
  // ─── Office & School ───
  {
    id: 'p37', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'Herman Miller Aeron Chair Size B', slug: 'herman-miller-aeron',
    description: 'Refurbished Herman Miller Aeron with PostureFit SL, fully adjustable arms. Grade A condition, 12-year warranty honored.',
    price: 749.99, compareAtPrice: 1395.00,
    category: 'Office & School', subcategory: 'Desks & Chairs', brand: 'Herman Miller',
    condition: 'refurbished', stock: 2, sku: 'HM-AERON-B',
    images: [
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1596079890744-c1a0462d0975?w=800&h=800&fit=crop',
    ], tags: ['office-chair', 'herman-miller', 'aeron', 'ergonomic'],
    rating: 4.9, numReviews: 156, isFeatured: true,
  },
  {
    id: 'p38', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'HP LaserJet Pro MFP M234dw Printer', slug: 'hp-laserjet-m234',
    description: 'Open-box HP wireless laser printer with scanner, copier, auto duplex. Setup toner cartridge included.',
    price: 149.99, compareAtPrice: 229.99,
    category: 'Office & School', subcategory: 'Printers', brand: 'HP',
    condition: 'open-box', stock: 5, sku: 'HP-LJM234',
    images: [
      'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1563199284-752b7b17578d?w=800&h=800&fit=crop',
    ], tags: ['printer', 'hp', 'laser', 'wireless'],
    rating: 4.3, numReviews: 44, isFeatured: false,
  },
  {
    id: 'p39', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'FlexiSpot E7 Standing Desk Frame', slug: 'flexispot-e7-desk',
    description: 'Like-new electric standing desk frame (no top). Dual motor, 3 memory presets, 48-80" width range. Returned — wrong size ordered.',
    price: 349.99, compareAtPrice: 499.99,
    category: 'Office & School', subcategory: 'Desks & Chairs', brand: 'FlexiSpot',
    condition: 'like-new', stock: 3, sku: 'FS-E7',
    images: [
      'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&h=800&fit=crop',
    ], tags: ['standing-desk', 'flexispot', 'ergonomic', 'electric'],
    rating: 4.7, numReviews: 38, isFeatured: false,
  },
  // ─── Baby & Kids ───
  {
    id: 'p40', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'UPPAbaby VISTA V2 Stroller', slug: 'uppababy-vista-v2',
    description: 'Open-box UPPAbaby VISTA V2 in Gregory Blue. Full-size stroller with bassinet, toddler seat, and bumper bar. Display model.',
    price: 649.99, compareAtPrice: 999.99,
    category: 'Baby & Kids', subcategory: 'Strollers', brand: 'UPPAbaby',
    condition: 'open-box', stock: 1, sku: 'UPP-VISTAV2',
    images: [
      'https://images.unsplash.com/photo-1566004100477-7b7da1ce5581?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&h=800&fit=crop',
    ], tags: ['stroller', 'uppababy', 'vista', 'baby'],
    rating: 4.8, numReviews: 22, isFeatured: false,
  },
  {
    id: 'p41', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Graco 4Ever DLX Car Seat', slug: 'graco-4ever-dlx',
    description: 'Like-new 4-in-1 car seat: rear-facing, forward-facing, highback booster, backless booster. Used for one trip, cleaned and sanitized.',
    price: 199.99, compareAtPrice: 329.99,
    category: 'Baby & Kids', subcategory: 'Car Seats', brand: 'Graco',
    condition: 'like-new', stock: 3, sku: 'GRC-4EVRDLX',
    images: [
      'https://images.unsplash.com/photo-1590698933947-a202b069a861?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=800&fit=crop',
    ], tags: ['car-seat', 'graco', '4-in-1', 'baby-safety'],
    rating: 4.6, numReviews: 35, isFeatured: false,
  },
  {
    id: 'p42', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Baby Brezza Formula Pro Advanced', slug: 'baby-brezza-formula',
    description: 'Open-box automatic formula maker. Warms water, mixes formula to perfect temperature. All parts sealed in original packaging.',
    price: 139.99, compareAtPrice: 224.99,
    category: 'Baby & Kids', subcategory: 'Feeding', brand: 'Baby Brezza',
    condition: 'open-box', stock: 4, sku: 'BB-FORMPRO',
    images: [
      'https://images.unsplash.com/photo-1584839404428-2b3be91c96f5?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=800&fit=crop',
    ], tags: ['formula-maker', 'baby-brezza', 'feeding', 'baby'],
    rating: 4.4, numReviews: 28, isFeatured: false,
  },
  // ─── Patio & Garden ───
  {
    id: 'p43', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Weber Spirit II E-310 Gas Grill', slug: 'weber-spirit-e310',
    description: 'Open-box Weber 3-burner gas grill with porcelain-enameled lid, GS4 grilling system. Assembled, never fired. Box damaged in shipping.',
    price: 379.99, compareAtPrice: 549.00,
    category: 'Patio & Garden', subcategory: 'Grills', brand: 'Weber',
    condition: 'open-box', stock: 2, sku: 'WEB-SPIRIT310',
    images: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1529543544282-ea75407407db?w=800&h=800&fit=crop',
    ], tags: ['grill', 'weber', 'gas', 'bbq'],
    rating: 4.7, numReviews: 45, isFeatured: true,
  },
  {
    id: 'p44', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'EGO Power+ 56V Lawn Mower', slug: 'ego-56v-mower',
    description: 'Refurbished EGO 21" self-propelled cordless mower with 7.5Ah battery and rapid charger. Certified refurbished, 3-year warranty.',
    price: 399.99, compareAtPrice: 649.00,
    category: 'Patio & Garden', subcategory: 'Tools', brand: 'EGO',
    condition: 'refurbished', stock: 2, sku: 'EGO-LM2135SP',
    images: [
      'https://images.unsplash.com/photo-1590856029826-c7a73142bbcd?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop',
    ], tags: ['lawn-mower', 'ego', 'cordless', 'battery'],
    rating: 4.5, numReviews: 32, isFeatured: false,
  },
  {
    id: 'p45', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Keter Outdoor Storage Deck Box 150 Gal', slug: 'keter-deck-box-150',
    description: 'Like-new resin outdoor storage box. Waterproof, lockable, doubles as bench seating. Assembled once then returned.',
    price: 99.99, compareAtPrice: 169.99,
    category: 'Patio & Garden', subcategory: 'Furniture', brand: 'Keter',
    condition: 'like-new', stock: 5, sku: 'KET-DB150',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop',
    ], tags: ['storage', 'deck-box', 'outdoor', 'patio'],
    rating: 4.3, numReviews: 19, isFeatured: false,
  },
  // ─── More Electronics ───
  {
    id: 'p46', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'Sony PlayStation 5 Slim Digital Edition', slug: 'ps5-slim-digital',
    description: 'Like-new PS5 Slim Digital Edition. Opened, updated firmware, played for 2 hours. Includes DualSense controller and all cables.',
    price: 349.99, compareAtPrice: 449.99,
    category: 'Electronics', subcategory: 'Gaming', brand: 'Sony',
    condition: 'like-new', stock: 2, sku: 'SONY-PS5SD',
    images: [
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&h=800&fit=crop',
    ], tags: ['playstation', 'ps5', 'gaming', 'console', 'sony'],
    rating: 4.9, numReviews: 134, isFeatured: true,
  },
  {
    id: 'p47', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'Sonos Beam Gen 2 Soundbar', slug: 'sonos-beam-gen2',
    description: 'Open-box Sonos Beam with Dolby Atmos, HDMI eARC, voice control. Compact smart soundbar for any TV.',
    price: 329.99, compareAtPrice: 499.00,
    category: 'Electronics', subcategory: 'Audio', brand: 'Sonos',
    condition: 'open-box', stock: 4, sku: 'SONOS-BEAM2',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&h=800&fit=crop',
    ], tags: ['soundbar', 'sonos', 'dolby-atmos', 'speaker'],
    rating: 4.6, numReviews: 67, isFeatured: false,
  },
  {
    id: 'p48', vendorId: 'v1', vendorName: 'Tech Deals Pro',
    name: 'Logitech MX Master 3S Mouse', slug: 'logitech-mx-master-3s',
    description: 'Open-box Logitech MX Master 3S wireless mouse. 8K DPI, quiet clicks, MagSpeed scroll, USB-C. Works on any surface.',
    price: 69.99, compareAtPrice: 99.99,
    category: 'Electronics', subcategory: 'Accessories', brand: 'Logitech',
    condition: 'open-box', stock: 15, sku: 'LOG-MXM3S',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&h=800&fit=crop',
    ], tags: ['mouse', 'logitech', 'wireless', 'ergonomic'],
    rating: 4.8, numReviews: 203, isFeatured: false,
  },
  // ─── More Home & Kitchen ───
  {
    id: 'p49', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Vitamix E310 Explorian Blender', slug: 'vitamix-e310',
    description: 'Refurbished Vitamix with variable speed control, 48oz container. Aircraft-grade stainless steel blades. Certified reconditioned with warranty.',
    price: 249.99, compareAtPrice: 349.95,
    category: 'Home & Kitchen', subcategory: 'Kitchen', brand: 'Vitamix',
    condition: 'refurbished', stock: 4, sku: 'VTX-E310',
    images: [
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&h=800&fit=crop',
    ], tags: ['blender', 'vitamix', 'smoothie', 'kitchen'],
    rating: 4.7, numReviews: 92, isFeatured: false,
  },
  {
    id: 'p50', vendorId: 'v2', vendorName: 'Home Essentials Hub',
    name: 'Casper Original Mattress Queen', slug: 'casper-original-queen',
    description: 'Like-new Casper foam mattress, queen size. 30-night trial return — slept on fewer than 10 nights. Professionally cleaned and sanitized.',
    price: 599.99, compareAtPrice: 1095.00,
    category: 'Home & Kitchen', subcategory: 'Bedding', brand: 'Casper',
    condition: 'like-new', stock: 1, sku: 'CSP-ORIGQ',
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=800&fit=crop',
    ], tags: ['mattress', 'casper', 'queen', 'foam', 'bedroom'],
    rating: 4.4, numReviews: 18, isFeatured: false,
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
