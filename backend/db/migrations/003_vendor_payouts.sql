-- Vendor payouts via Stripe Connect
CREATE TABLE IF NOT EXISTS vendor_payouts (
  id SERIAL PRIMARY KEY,
  vendor_id VARCHAR(50) NOT NULL,
  order_id VARCHAR(50) REFERENCES orders(id),
  amount DECIMAL(10,2) NOT NULL,
  stripe_transfer_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  paid_at TIMESTAMP,
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
