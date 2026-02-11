const pool = require('../../config/db');

function toPayout(row) {
  if (!row) return null;
  return {
    id: row.id,
    driverId: row.driver_id,
    amount: Number(row.amount),
    periodStart: row.period_start,
    periodEnd: row.period_end,
    deliveryCount: row.delivery_count,
    status: row.status,
    paidAt: row.paid_at,
    paymentMethod: row.payment_method,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

async function create({ driverId, amount, periodStart, periodEnd, deliveryCount, notes }) {
  const { rows } = await pool.query(
    `INSERT INTO driver_payouts (driver_id, amount, period_start, period_end, delivery_count, notes)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [driverId, amount, periodStart, periodEnd, deliveryCount || 0, notes]
  );
  return toPayout(rows[0]);
}

async function findByDriver(driverId) {
  const { rows } = await pool.query(
    'SELECT * FROM driver_payouts WHERE driver_id = $1 ORDER BY created_at DESC',
    [driverId]
  );
  return rows.map(toPayout);
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM driver_payouts WHERE id = $1', [id]);
  return toPayout(rows[0]);
}

async function markAsPaid(id, method) {
  const { rows } = await pool.query(
    `UPDATE driver_payouts SET status = 'paid', paid_at = NOW(), payment_method = $1 WHERE id = $2 RETURNING *`,
    [method, id]
  );
  return toPayout(rows[0]);
}

async function getEarnings(driverId, periodStart, periodEnd) {
  let query = `SELECT COUNT(*) AS delivery_count, COALESCE(SUM(delivery_fee), 0) AS total_earnings
               FROM deliveries WHERE driver_id = $1 AND status = 'delivered'`;
  const params = [driverId];
  if (periodStart) {
    params.push(periodStart);
    query += ` AND delivered_at >= $${params.length}`;
  }
  if (periodEnd) {
    params.push(periodEnd);
    query += ` AND delivered_at <= $${params.length}`;
  }
  const { rows } = await pool.query(query, params);
  return {
    deliveryCount: Number(rows[0].delivery_count),
    totalEarnings: Number(rows[0].total_earnings),
  };
}

module.exports = { create, findByDriver, findById, markAsPaid, getEarnings };
