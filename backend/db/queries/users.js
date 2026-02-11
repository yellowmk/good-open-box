const pool = require('../../config/db');

function toUser(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role,
    vendorId: row.vendor_id || undefined,
    isApproved: row.is_approved,
    joinedAt: row.joined_at,
    stripe_account_id: row.stripe_account_id || null,
    stripe_onboarding_complete: row.stripe_onboarding_complete || false,
  };
}

function toUserSafe(row) {
  const u = toUser(row);
  if (!u) return null;
  delete u.password;
  return u;
}

async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return toUser(rows[0]);
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return toUser(rows[0]);
}

async function create({ name, email, password, role }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, email, password, role || 'customer']
  );
  return toUser(rows[0]);
}

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM users ORDER BY id');
  return rows.map(toUserSafe);
}

async function findVendors() {
  const { rows } = await pool.query(
    `SELECT u.*, COUNT(p.id) AS product_count
     FROM users u
     LEFT JOIN products p ON p.vendor_id = u.vendor_id
     WHERE u.role = 'vendor'
     GROUP BY u.id
     ORDER BY u.id`,
  );
  return rows.map((r) => ({
    id: String(r.id),
    vendorId: r.vendor_id,
    businessName: r.name,
    contactEmail: r.email,
    isApproved: r.is_approved !== false,
    productCount: Number(r.product_count),
    joinedAt: r.joined_at || new Date().toISOString(),
    stripeAccountId: r.stripe_account_id || null,
    stripeOnboardingComplete: r.stripe_onboarding_complete || false,
  }));
}

async function approveVendor(id) {
  const { rows } = await pool.query(
    `UPDATE users SET is_approved = TRUE WHERE id = $1 AND role = 'vendor' RETURNING *`,
    [id]
  );
  return rows[0] ? toUser(rows[0]) : null;
}

module.exports = { findByEmail, findById, create, findAll, findVendors, approveVendor };
