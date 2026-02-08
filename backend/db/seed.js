const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = require('../config/db');

async function seed() {
  console.log('Seeding database...\n');

  // Run schema.sql
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('Schema created.');

  // ─── Users ──────────────────────────────────────────────────────
  const users = [
    { name: 'Admin User', email: 'admin@goodobox.com', password: 'admin123', role: 'admin', vendor_id: null },
    { name: 'Tech Deals Pro', email: 'vendor1@goodobox.com', password: 'vendor123', role: 'vendor', vendor_id: 'v1' },
    { name: 'Home Essentials Hub', email: 'vendor2@goodobox.com', password: 'vendor123', role: 'vendor', vendor_id: 'v2' },
    { name: 'John Customer', email: 'customer@goodobox.com', password: 'customer123', role: 'customer', vendor_id: null },
  ];

  for (const u of users) {
    const hash = bcrypt.hashSync(u.password, 10);
    await pool.query(
      `INSERT INTO users (name, email, password, role, vendor_id) VALUES ($1,$2,$3,$4,$5)`,
      [u.name, u.email, hash, u.role, u.vendor_id]
    );
  }
  console.log(`Inserted ${users.length} users.`);

  // ─── Categories ─────────────────────────────────────────────────
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

  for (const c of categories) {
    await pool.query(
      `INSERT INTO categories (id, name, subcategories) VALUES ($1,$2,$3)`,
      [c.id, c.name, c.subcategories]
    );
  }
  console.log(`Inserted ${categories.length} categories.`);

  // ─── Products ───────────────────────────────────────────────────
  const products = [
    {
      id: 'p1', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'Samsung 65" QLED 4K Smart TV', slug: 'samsung-65-qled-4k',
      description: 'Open-box Samsung QLED with Quantum HDR, smart hub, and Alexa built-in. Original packaging with minor box damage only.',
      price: 649.99, compare_at_price: 999.99,
      category: 'Electronics', subcategory: 'TVs', brand: 'Samsung',
      condition: 'open-box', stock: 5, sku: 'SAM-QLED-65',
      images: [
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1558888401-3cc1de77652d?w=800&h=800&fit=crop',
      ], tags: ['tv', 'samsung', 'qled', '4k'],
      rating: 4.6, num_reviews: 24, is_featured: true,
    },
    {
      id: 'p2', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'Apple MacBook Air M2 13"', slug: 'macbook-air-m2',
      description: 'Like-new MacBook Air M2 chip, 8GB RAM, 256GB SSD. Opened and returned, never used. Full warranty.',
      price: 849.99, compare_at_price: 1199.00,
      category: 'Electronics', subcategory: 'Laptops', brand: 'Apple',
      condition: 'like-new', stock: 3, sku: 'APL-MBA-M2',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=800&fit=crop',
      ], tags: ['macbook', 'apple', 'laptop'],
      rating: 4.8, num_reviews: 42, is_featured: true,
    },
    {
      id: 'p3', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'Sony WH-1000XM5 Headphones', slug: 'sony-wh1000xm5',
      description: 'Open-box Sony noise-cancelling headphones. Industry-leading ANC, 30-hour battery.',
      price: 248.00, compare_at_price: 399.99,
      category: 'Electronics', subcategory: 'Audio', brand: 'Sony',
      condition: 'open-box', stock: 12, sku: 'SONY-XM5',
      images: [
        'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop',
      ], tags: ['headphones', 'sony', 'wireless'],
      rating: 4.7, num_reviews: 89, is_featured: false,
    },
    {
      id: 'p4', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'iPad Pro 11" M2 Wi-Fi 128GB', slug: 'ipad-pro-m2',
      description: 'Refurbished iPad Pro with Liquid Retina display. Tested and certified, cosmetic grade A.',
      price: 549.99, compare_at_price: 799.00,
      category: 'Electronics', subcategory: 'Tablets', brand: 'Apple',
      condition: 'refurbished', stock: 7, sku: 'APL-IPADPRO-M2',
      images: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=800&fit=crop',
      ], tags: ['ipad', 'apple', 'tablet'],
      rating: 4.5, num_reviews: 31, is_featured: false,
    },
    {
      id: 'p5', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'Bose SoundLink Flex Speaker', slug: 'bose-soundlink-flex',
      description: 'Open-box portable Bluetooth speaker. Waterproof IP67, 12-hour battery.',
      price: 99.99, compare_at_price: 149.00,
      category: 'Electronics', subcategory: 'Audio', brand: 'Bose',
      condition: 'open-box', stock: 20, sku: 'BOSE-FLEX',
      images: [
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop',
      ], tags: ['speaker', 'bose', 'bluetooth'],
      rating: 4.4, num_reviews: 56, is_featured: false,
    },
    {
      id: 'p6', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Dyson V15 Detect Vacuum', slug: 'dyson-v15-detect',
      description: 'Open-box Dyson cordless vacuum with laser dust detection. Full accessory kit included.',
      price: 449.99, compare_at_price: 749.99,
      category: 'Home & Kitchen', subcategory: 'Vacuums', brand: 'Dyson',
      condition: 'open-box', stock: 4, sku: 'DYS-V15',
      images: [
        'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1527515637462-cee1395c108b?w=800&h=800&fit=crop',
      ], tags: ['vacuum', 'dyson', 'cordless'],
      rating: 4.7, num_reviews: 18, is_featured: true,
    },
    {
      id: 'p7', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'KitchenAid Artisan Stand Mixer', slug: 'kitchenaid-artisan',
      description: 'Open-box 5-quart tilt-head stand mixer in Empire Red. Unused, returned due to wrong color order.',
      price: 279.99, compare_at_price: 449.99,
      category: 'Home & Kitchen', subcategory: 'Kitchen', brand: 'KitchenAid',
      condition: 'open-box', stock: 6, sku: 'KA-ARTISAN',
      images: [
        'https://images.unsplash.com/photo-1594385208974-2f8bb07bfab0?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&h=800&fit=crop',
      ], tags: ['mixer', 'kitchenaid', 'baking'],
      rating: 4.9, num_reviews: 12, is_featured: false,
    },
    {
      id: 'p8', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Instant Pot Duo Plus 8-Quart', slug: 'instant-pot-duo-8qt',
      description: 'Like-new 9-in-1 pressure cooker. Customer return — used once. All parts included.',
      price: 69.99, compare_at_price: 119.99,
      category: 'Home & Kitchen', subcategory: 'Kitchen', brand: 'Instant Pot',
      condition: 'like-new', stock: 15, sku: 'IP-DUO-8',
      images: [
        'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&h=800&fit=crop',
      ], tags: ['instant-pot', 'pressure-cooker', 'kitchen'],
      rating: 4.3, num_reviews: 67, is_featured: false,
    },
    {
      id: 'p9', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Nespresso Vertuo Next Coffee Machine', slug: 'nespresso-vertuo-next',
      description: 'Open-box Nespresso with Aeroccino milk frother bundle. Sealed pods sample pack included.',
      price: 129.99, compare_at_price: 209.99,
      category: 'Home & Kitchen', subcategory: 'Kitchen', brand: 'Nespresso',
      condition: 'open-box', stock: 8, sku: 'NESP-VERTUO',
      images: [
        'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=800&fit=crop',
      ], tags: ['coffee', 'nespresso', 'espresso'],
      rating: 4.2, num_reviews: 35, is_featured: false,
    },
    {
      id: 'p10', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'iRobot Roomba j7+ Self-Emptying Vacuum', slug: 'irobot-roomba-j7plus',
      description: 'Refurbished robot vacuum with smart mapping and obstacle avoidance. 90-day warranty.',
      price: 349.99, compare_at_price: 599.99,
      category: 'Home & Kitchen', subcategory: 'Vacuums', brand: 'iRobot',
      condition: 'refurbished', stock: 3, sku: 'IRB-J7PLUS',
      images: [
        'https://images.unsplash.com/photo-1667044855958-c4a0462d0975?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1603618090561-412154b4bd1b?w=800&h=800&fit=crop',
      ], tags: ['roomba', 'robot-vacuum', 'smart-home'],
      rating: 4.5, num_reviews: 22, is_featured: true,
    },
    {
      id: 'p11', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'AirPods Pro 2nd Generation', slug: 'airpods-pro-2',
      description: 'Open-box AirPods Pro with active noise cancellation, adaptive transparency, and MagSafe charging case. Sealed tips included.',
      price: 179.99, compare_at_price: 249.00,
      category: 'Electronics', subcategory: 'Audio', brand: 'Apple',
      condition: 'open-box', stock: 18, sku: 'APL-APP2',
      images: [
        'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1588423771073-b8903fde1c68?w=800&h=800&fit=crop',
      ], tags: ['airpods', 'apple', 'earbuds', 'wireless'],
      rating: 4.8, num_reviews: 156, is_featured: true,
    },
    {
      id: 'p12', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'Nintendo Switch OLED Model', slug: 'nintendo-switch-oled',
      description: 'Like-new Nintendo Switch OLED with vibrant 7-inch screen. Includes dock, Joy-Cons, and all cables. Customer return — played twice.',
      price: 289.99, compare_at_price: 349.99,
      category: 'Electronics', subcategory: 'Gaming', brand: 'Nintendo',
      condition: 'like-new', stock: 6, sku: 'NIN-SWOLED',
      images: [
        'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&h=800&fit=crop',
      ], tags: ['nintendo', 'switch', 'gaming', 'console'],
      rating: 4.7, num_reviews: 73, is_featured: false,
    },
    {
      id: 'p13', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'Samsung Galaxy Watch 6 Classic', slug: 'galaxy-watch-6',
      description: 'Refurbished Samsung smartwatch with rotating bezel, health monitoring, GPS. Certified grade A, 90-day warranty.',
      price: 219.99, compare_at_price: 399.99,
      category: 'Electronics', subcategory: 'Phones', brand: 'Samsung',
      condition: 'refurbished', stock: 9, sku: 'SAM-GW6C',
      images: [
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop',
      ], tags: ['smartwatch', 'samsung', 'galaxy', 'wearable'],
      rating: 4.4, num_reviews: 38, is_featured: false,
    },
    {
      id: 'p14', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'Dell 27" 4K USB-C Monitor', slug: 'dell-27-4k-monitor',
      description: 'Open-box Dell UltraSharp 4K monitor with USB-C connectivity, 60W charging, and factory-calibrated colors. Perfect for productivity.',
      price: 379.99, compare_at_price: 619.99,
      category: 'Electronics', subcategory: 'Monitors', brand: 'Dell',
      condition: 'open-box', stock: 4, sku: 'DEL-U2723QE',
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=800&h=800&fit=crop',
      ], tags: ['monitor', 'dell', '4k', 'usb-c'],
      rating: 4.6, num_reviews: 27, is_featured: false,
    },
    {
      id: 'p15', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'Canon EOS R50 Mirrorless Camera', slug: 'canon-eos-r50',
      description: 'Like-new Canon mirrorless camera with 18-45mm kit lens. 24.2MP, 4K video, Wi-Fi. Opened for testing only.',
      price: 549.99, compare_at_price: 799.99,
      category: 'Electronics', subcategory: 'Cameras', brand: 'Canon',
      condition: 'like-new', stock: 3, sku: 'CAN-EOSR50',
      images: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=800&fit=crop',
      ], tags: ['camera', 'canon', 'mirrorless', 'photography'],
      rating: 4.7, num_reviews: 19, is_featured: false,
    },
    {
      id: 'p16', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Ninja Foodi 10-in-1 Air Fryer', slug: 'ninja-foodi-air-fryer',
      description: 'Open-box Ninja air fryer with dual zone technology. Air fry, roast, bake, dehydrate, and more. Never used.',
      price: 149.99, compare_at_price: 229.99,
      category: 'Home & Kitchen', subcategory: 'Kitchen', brand: 'Ninja',
      condition: 'open-box', stock: 11, sku: 'NIN-FOODI10',
      images: [
        'https://images.unsplash.com/photo-1648398677511-e03f46859fb8?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=800&fit=crop',
      ], tags: ['air-fryer', 'ninja', 'kitchen'],
      rating: 4.6, num_reviews: 84, is_featured: false,
    },
    {
      id: 'p17', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Philips Hue Starter Kit (4 Bulbs)', slug: 'philips-hue-starter',
      description: 'Open-box smart lighting kit with Bridge and 4 color-changing bulbs. Works with Alexa, Google, Apple HomeKit.',
      price: 129.99, compare_at_price: 199.99,
      category: 'Home & Kitchen', subcategory: 'Smart Home', brand: 'Philips',
      condition: 'open-box', stock: 7, sku: 'PHI-HUE4',
      images: [
        'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1565814329452-e1432bc73c05?w=800&h=800&fit=crop',
      ], tags: ['smart-home', 'philips', 'hue', 'lighting'],
      rating: 4.5, num_reviews: 45, is_featured: false,
    },
    {
      id: 'p18', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Breville Barista Express Espresso Machine', slug: 'breville-barista-express',
      description: 'Like-new espresso machine with built-in grinder. Dose-control grinding, digital temperature control. Customer return.',
      price: 499.99, compare_at_price: 749.99,
      category: 'Home & Kitchen', subcategory: 'Kitchen', brand: 'Breville',
      condition: 'like-new', stock: 2, sku: 'BRV-BARISTA',
      images: [
        'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1587080413959-06b859fb107d?w=800&h=800&fit=crop',
      ], tags: ['espresso', 'breville', 'coffee', 'grinder'],
      rating: 4.8, num_reviews: 33, is_featured: true,
    },
    {
      id: 'p19', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'Peloton Bike Mat & Weights Bundle', slug: 'peloton-bike-accessories',
      description: 'Open-box Peloton accessories: premium bike mat, 2lb and 3lb weight sets. Perfect condition, unused.',
      price: 89.99, compare_at_price: 159.99,
      category: 'Sports & Outdoors', subcategory: 'Fitness', brand: 'Peloton',
      condition: 'open-box', stock: 14, sku: 'PEL-BUNDLE',
      images: [
        'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=800&fit=crop',
      ], tags: ['fitness', 'peloton', 'weights', 'workout'],
      rating: 4.3, num_reviews: 21, is_featured: false,
    },
    {
      id: 'p20', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'Garmin Forerunner 265 GPS Watch', slug: 'garmin-forerunner-265',
      description: 'Refurbished Garmin running watch with AMOLED display, GPS, heart rate, training metrics. Certified refurbished with warranty.',
      price: 299.99, compare_at_price: 449.99,
      category: 'Sports & Outdoors', subcategory: 'Fitness', brand: 'Garmin',
      condition: 'refurbished', stock: 5, sku: 'GAR-FR265',
      images: [
        'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1510017803434-a899b57ae1d7?w=800&h=800&fit=crop',
      ], tags: ['garmin', 'running', 'gps', 'fitness-watch'],
      rating: 4.7, num_reviews: 52, is_featured: true,
    },
    {
      id: 'p21', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'YETI Tundra 45 Cooler', slug: 'yeti-tundra-45',
      description: 'Open-box YETI hard cooler. Rotomolded, bear-proof, keeps ice for days. Cosmetic scratch on lid — fully functional.',
      price: 219.99, compare_at_price: 325.00,
      category: 'Sports & Outdoors', subcategory: 'Camping', brand: 'YETI',
      condition: 'open-box', stock: 3, sku: 'YETI-T45',
      images: [
        'https://images.unsplash.com/photo-1576014131795-8fedb24c709e?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=800&fit=crop',
      ], tags: ['yeti', 'cooler', 'camping', 'outdoor'],
      rating: 4.9, num_reviews: 15, is_featured: false,
    },
    {
      id: 'p22', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'Hydro Flask 32oz Wide Mouth', slug: 'hydro-flask-32oz',
      description: 'Like-new insulated water bottle. TempShield double-wall vacuum insulation. Returned — wrong color.',
      price: 29.99, compare_at_price: 44.95,
      category: 'Sports & Outdoors', subcategory: 'Fitness', brand: 'Hydro Flask',
      condition: 'like-new', stock: 25, sku: 'HF-32WM',
      images: [
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&h=800&fit=crop',
      ], tags: ['water-bottle', 'hydro-flask', 'insulated'],
      rating: 4.6, num_reviews: 89, is_featured: false,
    },
    {
      id: 'p23', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Ray-Ban Wayfarer Classic Sunglasses', slug: 'rayban-wayfarer',
      description: 'Open-box Ray-Ban Wayfarer with polarized lenses. Original case and cleaning cloth included. Tried on, never worn outside.',
      price: 109.99, compare_at_price: 163.00,
      category: 'Fashion', subcategory: 'Accessories', brand: 'Ray-Ban',
      condition: 'open-box', stock: 8, sku: 'RB-WAYFARER',
      images: [
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=800&fit=crop',
      ], tags: ['sunglasses', 'rayban', 'wayfarer', 'polarized'],
      rating: 4.8, num_reviews: 64, is_featured: false,
    },
    {
      id: 'p24', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Nike Air Max 270 Sneakers', slug: 'nike-air-max-270',
      description: "Like-new Nike Air Max 270 in Black/White. Tried on indoors only. Original box and tags. Men's size 10.",
      price: 89.99, compare_at_price: 150.00,
      category: 'Fashion', subcategory: 'Shoes', brand: 'Nike',
      condition: 'like-new', stock: 4, sku: 'NIK-AM270',
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop',
      ], tags: ['nike', 'sneakers', 'air-max', 'shoes'],
      rating: 4.5, num_reviews: 41, is_featured: true,
    },
    {
      id: 'p25', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'Herschel Supply Retreat Backpack', slug: 'herschel-retreat-backpack',
      description: 'Open-box Herschel backpack with 15" laptop sleeve. Classic design, reinforced bottom. Tag still attached.',
      price: 59.99, compare_at_price: 99.99,
      category: 'Fashion', subcategory: 'Accessories', brand: 'Herschel',
      condition: 'open-box', stock: 10, sku: 'HER-RETREAT',
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=800&h=800&fit=crop',
      ], tags: ['backpack', 'herschel', 'bag', 'laptop'],
      rating: 4.4, num_reviews: 37, is_featured: false,
    },
    {
      id: 'p26', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Casio G-Shock GA2100 Watch', slug: 'casio-gshock-ga2100',
      description: 'Open-box Casio G-Shock "CasiOak" in matte black. Carbon core guard, 200m water resistance. Never worn.',
      price: 69.99, compare_at_price: 99.99,
      category: 'Fashion', subcategory: 'Accessories', brand: 'Casio',
      condition: 'open-box', stock: 6, sku: 'CAS-GA2100',
      images: [
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&h=800&fit=crop',
      ], tags: ['watch', 'casio', 'g-shock', 'digital'],
      rating: 4.6, num_reviews: 28, is_featured: false,
    },
    {
      id: 'p27', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'LEGO Technic Porsche 911 GT3 RS', slug: 'lego-technic-porsche',
      description: 'Open-box LEGO Technic set #42056. 2,704 pieces, all bags sealed inside. Box has shelf wear only.',
      price: 289.99, compare_at_price: 449.99,
      category: 'Toys & Games', subcategory: 'Building Sets', brand: 'LEGO',
      condition: 'open-box', stock: 2, sku: 'LEGO-42056',
      images: [
        'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1560961911-ba7ef651a56c?w=800&h=800&fit=crop',
      ], tags: ['lego', 'technic', 'porsche', 'building'],
      rating: 4.9, num_reviews: 47, is_featured: true,
    },
    {
      id: 'p28', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Board Game Bundle: Catan + Ticket to Ride', slug: 'board-game-bundle',
      description: 'Like-new board game bundle. Settlers of Catan and Ticket to Ride. Played once each — all pieces verified complete.',
      price: 49.99, compare_at_price: 89.98,
      category: 'Toys & Games', subcategory: 'Board Games', brand: 'Various',
      condition: 'like-new', stock: 8, sku: 'BG-BUNDLE1',
      images: [
        'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800&h=800&fit=crop',
      ], tags: ['board-game', 'catan', 'ticket-to-ride', 'family'],
      rating: 4.7, num_reviews: 23, is_featured: false,
    },
    {
      id: 'p29', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'DJI Mini 3 Pro Drone', slug: 'dji-mini-3-pro',
      description: 'Refurbished DJI Mini 3 Pro with 4K camera, obstacle avoidance, 34-min flight time. Certified by DJI with 6-month warranty.',
      price: 579.99, compare_at_price: 859.00,
      category: 'Electronics', subcategory: 'Cameras', brand: 'DJI',
      condition: 'refurbished', stock: 3, sku: 'DJI-MINI3P',
      images: [
        'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=800&h=800&fit=crop',
      ], tags: ['drone', 'dji', '4k', 'camera'],
      rating: 4.6, num_reviews: 31, is_featured: false,
    },
    {
      id: 'p30', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Le Creuset Dutch Oven 5.5 Qt', slug: 'le-creuset-dutch-oven',
      description: 'Open-box Le Creuset enameled cast iron dutch oven in Flame Orange. Unused, returned gift. Lifetime warranty applies.',
      price: 249.99, compare_at_price: 419.99,
      category: 'Home & Kitchen', subcategory: 'Kitchen', brand: 'Le Creuset',
      condition: 'open-box', stock: 3, sku: 'LC-DO55',
      images: [
        'https://images.unsplash.com/photo-1585442245772-b9f7b8fa8f08?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&h=800&fit=crop',
      ], tags: ['dutch-oven', 'le-creuset', 'cast-iron', 'cooking'],
      rating: 4.9, num_reviews: 16, is_featured: false,
    },
    {
      id: 'p31', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Dyson Airwrap Complete Styler', slug: 'dyson-airwrap',
      description: 'Open-box Dyson Airwrap multi-styler with all attachments. Barrels, brushes, and pre-styling dryer included. Used once for demo.',
      price: 399.99, compare_at_price: 599.99,
      category: 'Beauty & Personal Care', subcategory: 'Hair Care', brand: 'Dyson',
      condition: 'open-box', stock: 2, sku: 'DYS-AIRWRAP',
      images: [
        'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop',
      ], tags: ['dyson', 'airwrap', 'hair-styler', 'beauty'],
      rating: 4.7, num_reviews: 89, is_featured: true,
    },
    {
      id: 'p32', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Oral-B iO Series 9 Electric Toothbrush', slug: 'oral-b-io9',
      description: 'Like-new Oral-B iO Series 9 with AI tracking, magnetic charger, and travel case. Opened, never used. Sealed brush heads.',
      price: 179.99, compare_at_price: 299.99,
      category: 'Beauty & Personal Care', subcategory: 'Tools', brand: 'Oral-B',
      condition: 'like-new', stock: 7, sku: 'OB-IO9',
      images: [
        'https://images.unsplash.com/photo-1559591937-fe1e5e4ebb74?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=800&fit=crop',
      ], tags: ['toothbrush', 'oral-b', 'electric', 'dental'],
      rating: 4.5, num_reviews: 42, is_featured: false,
    },
    {
      id: 'p33', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'Theragun Elite Massage Gun', slug: 'theragun-elite',
      description: 'Refurbished Theragun Elite with 5 attachments, OLED screen, QuietForce technology. Certified refurbished with 1-year warranty.',
      price: 249.99, compare_at_price: 399.00,
      category: 'Beauty & Personal Care', subcategory: 'Tools', brand: 'Therabody',
      condition: 'refurbished', stock: 5, sku: 'TG-ELITE',
      images: [
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&h=800&fit=crop',
      ], tags: ['massage-gun', 'theragun', 'recovery', 'wellness'],
      rating: 4.6, num_reviews: 58, is_featured: false,
    },
    {
      id: 'p34', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'Garmin DriveSmart 76 GPS Navigator', slug: 'garmin-drivesmart-76',
      description: 'Open-box Garmin 7-inch GPS with traffic alerts, Bluetooth calling, and voice assistant. Full North America maps preloaded.',
      price: 219.99, compare_at_price: 329.99,
      category: 'Automotive', subcategory: 'Car Electronics', brand: 'Garmin',
      condition: 'open-box', stock: 4, sku: 'GAR-DS76',
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=800&fit=crop',
      ], tags: ['gps', 'garmin', 'navigation', 'car'],
      rating: 4.4, num_reviews: 33, is_featured: false,
    },
    {
      id: 'p35', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'VIOFO A129 Pro Duo Dash Cam', slug: 'viofo-a129-dashcam',
      description: 'Like-new dual dash cam with 4K front and 1080p rear. GPS, Wi-Fi, parking mode. All mounts and cables included.',
      price: 159.99, compare_at_price: 249.99,
      category: 'Automotive', subcategory: 'Car Electronics', brand: 'VIOFO',
      condition: 'like-new', stock: 6, sku: 'VIO-A129P',
      images: [
        'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&h=800&fit=crop',
      ], tags: ['dash-cam', 'viofo', '4k', 'car-camera'],
      rating: 4.5, num_reviews: 27, is_featured: false,
    },
    {
      id: 'p36', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Milwaukee M18 Cordless Impact Driver Kit', slug: 'milwaukee-m18-impact',
      description: 'Open-box Milwaukee 1/4" hex impact driver with 2 batteries, charger, and case. Professional grade, never used on a job.',
      price: 149.99, compare_at_price: 229.00,
      category: 'Automotive', subcategory: 'Tools & Equipment', brand: 'Milwaukee',
      condition: 'open-box', stock: 3, sku: 'MIL-M18ID',
      images: [
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1581147060310-8e02caad3f7e?w=800&h=800&fit=crop',
      ], tags: ['drill', 'milwaukee', 'cordless', 'power-tools'],
      rating: 4.8, num_reviews: 71, is_featured: true,
    },
    {
      id: 'p37', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'Herman Miller Aeron Chair Size B', slug: 'herman-miller-aeron',
      description: 'Refurbished Herman Miller Aeron with PostureFit SL, fully adjustable arms. Grade A condition, 12-year warranty honored.',
      price: 749.99, compare_at_price: 1395.00,
      category: 'Office & School', subcategory: 'Desks & Chairs', brand: 'Herman Miller',
      condition: 'refurbished', stock: 2, sku: 'HM-AERON-B',
      images: [
        'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1596079890744-c1a0462d0975?w=800&h=800&fit=crop',
      ], tags: ['office-chair', 'herman-miller', 'aeron', 'ergonomic'],
      rating: 4.9, num_reviews: 156, is_featured: true,
    },
    {
      id: 'p38', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'HP LaserJet Pro MFP M234dw Printer', slug: 'hp-laserjet-m234',
      description: 'Open-box HP wireless laser printer with scanner, copier, auto duplex. Setup toner cartridge included.',
      price: 149.99, compare_at_price: 229.99,
      category: 'Office & School', subcategory: 'Printers', brand: 'HP',
      condition: 'open-box', stock: 5, sku: 'HP-LJM234',
      images: [
        'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1563199284-752b7b17578d?w=800&h=800&fit=crop',
      ], tags: ['printer', 'hp', 'laser', 'wireless'],
      rating: 4.3, num_reviews: 44, is_featured: false,
    },
    {
      id: 'p39', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'FlexiSpot E7 Standing Desk Frame', slug: 'flexispot-e7-desk',
      description: 'Like-new electric standing desk frame (no top). Dual motor, 3 memory presets, 48-80" width range. Returned — wrong size ordered.',
      price: 349.99, compare_at_price: 499.99,
      category: 'Office & School', subcategory: 'Desks & Chairs', brand: 'FlexiSpot',
      condition: 'like-new', stock: 3, sku: 'FS-E7',
      images: [
        'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&h=800&fit=crop',
      ], tags: ['standing-desk', 'flexispot', 'ergonomic', 'electric'],
      rating: 4.7, num_reviews: 38, is_featured: false,
    },
    {
      id: 'p40', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'UPPAbaby VISTA V2 Stroller', slug: 'uppababy-vista-v2',
      description: 'Open-box UPPAbaby VISTA V2 in Gregory Blue. Full-size stroller with bassinet, toddler seat, and bumper bar. Display model.',
      price: 649.99, compare_at_price: 999.99,
      category: 'Baby & Kids', subcategory: 'Strollers', brand: 'UPPAbaby',
      condition: 'open-box', stock: 1, sku: 'UPP-VISTAV2',
      images: [
        'https://images.unsplash.com/photo-1566004100477-7b7da1ce5581?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&h=800&fit=crop',
      ], tags: ['stroller', 'uppababy', 'vista', 'baby'],
      rating: 4.8, num_reviews: 22, is_featured: false,
    },
    {
      id: 'p41', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Graco 4Ever DLX Car Seat', slug: 'graco-4ever-dlx',
      description: 'Like-new 4-in-1 car seat: rear-facing, forward-facing, highback booster, backless booster. Used for one trip, cleaned and sanitized.',
      price: 199.99, compare_at_price: 329.99,
      category: 'Baby & Kids', subcategory: 'Car Seats', brand: 'Graco',
      condition: 'like-new', stock: 3, sku: 'GRC-4EVRDLX',
      images: [
        'https://images.unsplash.com/photo-1590698933947-a202b069a861?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=800&fit=crop',
      ], tags: ['car-seat', 'graco', '4-in-1', 'baby-safety'],
      rating: 4.6, num_reviews: 35, is_featured: false,
    },
    {
      id: 'p42', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Baby Brezza Formula Pro Advanced', slug: 'baby-brezza-formula',
      description: 'Open-box automatic formula maker. Warms water, mixes formula to perfect temperature. All parts sealed in original packaging.',
      price: 139.99, compare_at_price: 224.99,
      category: 'Baby & Kids', subcategory: 'Feeding', brand: 'Baby Brezza',
      condition: 'open-box', stock: 4, sku: 'BB-FORMPRO',
      images: [
        'https://images.unsplash.com/photo-1584839404428-2b3be91c96f5?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=800&fit=crop',
      ], tags: ['formula-maker', 'baby-brezza', 'feeding', 'baby'],
      rating: 4.4, num_reviews: 28, is_featured: false,
    },
    {
      id: 'p43', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Weber Spirit II E-310 Gas Grill', slug: 'weber-spirit-e310',
      description: 'Open-box Weber 3-burner gas grill with porcelain-enameled lid, GS4 grilling system. Assembled, never fired. Box damaged in shipping.',
      price: 379.99, compare_at_price: 549.00,
      category: 'Patio & Garden', subcategory: 'Grills', brand: 'Weber',
      condition: 'open-box', stock: 2, sku: 'WEB-SPIRIT310',
      images: [
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1529543544282-ea75407407db?w=800&h=800&fit=crop',
      ], tags: ['grill', 'weber', 'gas', 'bbq'],
      rating: 4.7, num_reviews: 45, is_featured: true,
    },
    {
      id: 'p44', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'EGO Power+ 56V Lawn Mower', slug: 'ego-56v-mower',
      description: 'Refurbished EGO 21" self-propelled cordless mower with 7.5Ah battery and rapid charger. Certified refurbished, 3-year warranty.',
      price: 399.99, compare_at_price: 649.00,
      category: 'Patio & Garden', subcategory: 'Tools', brand: 'EGO',
      condition: 'refurbished', stock: 2, sku: 'EGO-LM2135SP',
      images: [
        'https://images.unsplash.com/photo-1590856029826-c7a73142bbcd?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop',
      ], tags: ['lawn-mower', 'ego', 'cordless', 'battery'],
      rating: 4.5, num_reviews: 32, is_featured: false,
    },
    {
      id: 'p45', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Keter Outdoor Storage Deck Box 150 Gal', slug: 'keter-deck-box-150',
      description: 'Like-new resin outdoor storage box. Waterproof, lockable, doubles as bench seating. Assembled once then returned.',
      price: 99.99, compare_at_price: 169.99,
      category: 'Patio & Garden', subcategory: 'Furniture', brand: 'Keter',
      condition: 'like-new', stock: 5, sku: 'KET-DB150',
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop',
      ], tags: ['storage', 'deck-box', 'outdoor', 'patio'],
      rating: 4.3, num_reviews: 19, is_featured: false,
    },
    {
      id: 'p46', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'Sony PlayStation 5 Slim Digital Edition', slug: 'ps5-slim-digital',
      description: 'Like-new PS5 Slim Digital Edition. Opened, updated firmware, played for 2 hours. Includes DualSense controller and all cables.',
      price: 349.99, compare_at_price: 449.99,
      category: 'Electronics', subcategory: 'Gaming', brand: 'Sony',
      condition: 'like-new', stock: 2, sku: 'SONY-PS5SD',
      images: [
        'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&h=800&fit=crop',
      ], tags: ['playstation', 'ps5', 'gaming', 'console', 'sony'],
      rating: 4.9, num_reviews: 134, is_featured: true,
    },
    {
      id: 'p47', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'Sonos Beam Gen 2 Soundbar', slug: 'sonos-beam-gen2',
      description: 'Open-box Sonos Beam with Dolby Atmos, HDMI eARC, voice control. Compact smart soundbar for any TV.',
      price: 329.99, compare_at_price: 499.00,
      category: 'Electronics', subcategory: 'Audio', brand: 'Sonos',
      condition: 'open-box', stock: 4, sku: 'SONOS-BEAM2',
      images: [
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&h=800&fit=crop',
      ], tags: ['soundbar', 'sonos', 'dolby-atmos', 'speaker'],
      rating: 4.6, num_reviews: 67, is_featured: false,
    },
    {
      id: 'p48', vendor_id: 'v1', vendor_name: 'Tech Deals Pro',
      name: 'Logitech MX Master 3S Mouse', slug: 'logitech-mx-master-3s',
      description: 'Open-box Logitech MX Master 3S wireless mouse. 8K DPI, quiet clicks, MagSpeed scroll, USB-C. Works on any surface.',
      price: 69.99, compare_at_price: 99.99,
      category: 'Electronics', subcategory: 'Accessories', brand: 'Logitech',
      condition: 'open-box', stock: 15, sku: 'LOG-MXM3S',
      images: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&h=800&fit=crop',
      ], tags: ['mouse', 'logitech', 'wireless', 'ergonomic'],
      rating: 4.8, num_reviews: 203, is_featured: false,
    },
    {
      id: 'p49', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Vitamix E310 Explorian Blender', slug: 'vitamix-e310',
      description: 'Refurbished Vitamix with variable speed control, 48oz container. Aircraft-grade stainless steel blades. Certified reconditioned with warranty.',
      price: 249.99, compare_at_price: 349.95,
      category: 'Home & Kitchen', subcategory: 'Kitchen', brand: 'Vitamix',
      condition: 'refurbished', stock: 4, sku: 'VTX-E310',
      images: [
        'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&h=800&fit=crop',
      ], tags: ['blender', 'vitamix', 'smoothie', 'kitchen'],
      rating: 4.7, num_reviews: 92, is_featured: false,
    },
    {
      id: 'p50', vendor_id: 'v2', vendor_name: 'Home Essentials Hub',
      name: 'Casper Original Mattress Queen', slug: 'casper-original-queen',
      description: 'Like-new Casper foam mattress, queen size. 30-night trial return — slept on fewer than 10 nights. Professionally cleaned and sanitized.',
      price: 599.99, compare_at_price: 1095.00,
      category: 'Home & Kitchen', subcategory: 'Bedding', brand: 'Casper',
      condition: 'like-new', stock: 1, sku: 'CSP-ORIGQ',
      images: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=800&fit=crop',
      ], tags: ['mattress', 'casper', 'queen', 'foam', 'bedroom'],
      rating: 4.4, num_reviews: 18, is_featured: false,
    },
  ];

  for (const p of products) {
    await pool.query(
      `INSERT INTO products (id, vendor_id, vendor_name, name, slug, description, price, compare_at_price,
         category, subcategory, brand, condition, stock, sku, images, tags, rating, num_reviews, is_featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
      [
        p.id, p.vendor_id, p.vendor_name, p.name, p.slug, p.description,
        p.price, p.compare_at_price, p.category, p.subcategory, p.brand,
        p.condition, p.stock, p.sku, p.images, p.tags, p.rating, p.num_reviews, p.is_featured,
      ]
    );
  }
  console.log(`Inserted ${products.length} products.`);

  // Verify
  const userCount = await pool.query('SELECT COUNT(*) FROM users');
  const prodCount = await pool.query('SELECT COUNT(*) FROM products');
  const catCount = await pool.query('SELECT COUNT(*) FROM categories');
  console.log(`\nVerification: ${userCount.rows[0].count} users, ${prodCount.rows[0].count} products, ${catCount.rows[0].count} categories`);
  console.log('Seed complete!\n');

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
