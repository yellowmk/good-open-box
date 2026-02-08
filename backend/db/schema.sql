-- Good Open Box — PostgreSQL Schema
-- Run with: psql good_open_box < db/schema.sql

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP SEQUENCE IF EXISTS product_id_seq;
DROP SEQUENCE IF EXISTS order_id_seq;

-- ─── Users ──────────────────────────────────────────────────────────
CREATE TABLE users (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(255) NOT NULL,
  email     VARCHAR(255) NOT NULL UNIQUE,
  password  VARCHAR(255) NOT NULL,
  role      VARCHAR(20)  NOT NULL DEFAULT 'customer',
  vendor_id VARCHAR(50),
  is_approved BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email     ON users (email);
CREATE INDEX idx_users_vendor_id ON users (vendor_id);

-- ─── Categories ─────────────────────────────────────────────────────
CREATE TABLE categories (
  id             VARCHAR(50) PRIMARY KEY,
  name           VARCHAR(255) NOT NULL UNIQUE,
  subcategories  TEXT[] DEFAULT '{}'
);

-- ─── Products ───────────────────────────────────────────────────────
CREATE SEQUENCE product_id_seq START WITH 51;

CREATE TABLE products (
  id               VARCHAR(50) PRIMARY KEY,
  vendor_id        VARCHAR(50) NOT NULL,
  vendor_name      VARCHAR(255) NOT NULL,
  name             VARCHAR(500) NOT NULL,
  slug             VARCHAR(500),
  description      TEXT DEFAULT '',
  price            NUMERIC(10,2) NOT NULL,
  compare_at_price NUMERIC(10,2),
  category         VARCHAR(255),
  subcategory      VARCHAR(255) DEFAULT '',
  brand            VARCHAR(255) DEFAULT '',
  condition        VARCHAR(50) DEFAULT 'open-box',
  stock            INTEGER DEFAULT 0,
  sku              VARCHAR(100),
  images           TEXT[] DEFAULT '{}',
  tags             TEXT[] DEFAULT '{}',
  rating           NUMERIC(3,1) DEFAULT 0,
  num_reviews      INTEGER DEFAULT 0,
  is_featured      BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_products_vendor_id   ON products (vendor_id);
CREATE INDEX idx_products_category    ON products (category);
CREATE INDEX idx_products_condition   ON products (condition);
CREATE INDEX idx_products_price       ON products (price);
CREATE INDEX idx_products_stock       ON products (stock);
CREATE INDEX idx_products_is_featured ON products (is_featured);

-- ─── Orders ─────────────────────────────────────────────────────────
CREATE SEQUENCE order_id_seq START WITH 1001;

CREATE TABLE orders (
  id               VARCHAR(50) PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id),
  shipping_address JSONB DEFAULT '{}',
  payment_method   VARCHAR(50) DEFAULT 'stripe',
  subtotal         NUMERIC(10,2) NOT NULL,
  tax              NUMERIC(10,2) DEFAULT 0,
  shipping_cost    NUMERIC(10,2) DEFAULT 0,
  total            NUMERIC(10,2) NOT NULL,
  status           VARCHAR(50) DEFAULT 'pending',
  is_paid          BOOLEAN DEFAULT FALSE,
  is_delivered     BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders (user_id);

-- ─── Order Items ────────────────────────────────────────────────────
CREATE TABLE order_items (
  id         SERIAL PRIMARY KEY,
  order_id   VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(50) NOT NULL,
  name       VARCHAR(500) NOT NULL,
  price      NUMERIC(10,2) NOT NULL,
  quantity   INTEGER NOT NULL DEFAULT 1,
  vendor_id  VARCHAR(50)
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);
