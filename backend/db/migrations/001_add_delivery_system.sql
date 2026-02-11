-- Good Open Box — Delivery System Migration
-- Run with: psql good_open_box < db/migrations/001_add_delivery_system.sql

-- ─── Driver Applications ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS driver_applications (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  email          VARCHAR(255) NOT NULL UNIQUE,
  phone          VARCHAR(50) NOT NULL,
  vehicle_type   VARCHAR(50) NOT NULL,
  vehicle_year   INTEGER,
  vehicle_make   VARCHAR(100),
  vehicle_model  VARCHAR(100),
  license_number VARCHAR(100) NOT NULL,
  license_state  VARCHAR(10) NOT NULL,
  status         VARCHAR(20) NOT NULL DEFAULT 'pending',
  notes          TEXT,
  applied_at     TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at    TIMESTAMPTZ,
  reviewed_by    INTEGER REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_driver_applications_email ON driver_applications (email);
CREATE INDEX IF NOT EXISTS idx_driver_applications_status ON driver_applications (status);

-- ─── Deliveries ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deliveries (
  id                 SERIAL PRIMARY KEY,
  order_id           VARCHAR(50) NOT NULL UNIQUE REFERENCES orders(id),
  driver_id          INTEGER REFERENCES users(id),
  assignment_type    VARCHAR(20),
  status             VARCHAR(20) NOT NULL DEFAULT 'pending',
  delivery_fee       NUMERIC(10,2) DEFAULT 5.00,
  pickup_address     JSONB DEFAULT '{}',
  delivery_address   JSONB DEFAULT '{}',
  assigned_at        TIMESTAMPTZ,
  picked_up_at       TIMESTAMPTZ,
  en_route_at        TIMESTAMPTZ,
  delivered_at       TIMESTAMPTZ,
  estimated_delivery TIMESTAMPTZ,
  driver_notes       TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries (order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver_id ON deliveries (driver_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries (status);

-- ─── Driver Payouts ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS driver_payouts (
  id              SERIAL PRIMARY KEY,
  driver_id       INTEGER NOT NULL REFERENCES users(id),
  amount          NUMERIC(10,2) NOT NULL,
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  delivery_count  INTEGER DEFAULT 0,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',
  paid_at         TIMESTAMPTZ,
  payment_method  VARCHAR(50),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_payouts_driver_id ON driver_payouts (driver_id);

-- ─── Modify Orders Table ─────────────────────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS requires_delivery BOOLEAN DEFAULT TRUE;
