-- Payment system: add payment tracking columns to orders and create refunds table

ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_checkout_session_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_status VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_amount DECIMAL(10,2) DEFAULT 0;

CREATE TABLE IF NOT EXISTS refunds (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL REFERENCES orders(id),
  stripe_refund_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  initiated_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
