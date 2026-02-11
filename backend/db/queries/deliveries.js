const pool = require('../../config/db');

function toDelivery(row) {
  if (!row) return null;
  return {
    id: row.id,
    orderId: row.order_id,
    driverId: row.driver_id,
    driverName: row.driver_name || null,
    assignmentType: row.assignment_type,
    status: row.status,
    deliveryFee: Number(row.delivery_fee),
    pickupAddress: row.pickup_address || {},
    deliveryAddress: row.delivery_address || {},
    assignedAt: row.assigned_at,
    pickedUpAt: row.picked_up_at,
    enRouteAt: row.en_route_at,
    deliveredAt: row.delivered_at,
    estimatedDelivery: row.estimated_delivery,
    driverNotes: row.driver_notes,
    createdAt: row.created_at,
  };
}

async function create({ orderId, deliveryFee, pickupAddress, deliveryAddress }) {
  const { rows } = await pool.query(
    `INSERT INTO deliveries (order_id, delivery_fee, pickup_address, delivery_address)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [orderId, deliveryFee || 5.00, JSON.stringify(pickupAddress || {}), JSON.stringify(deliveryAddress || {})]
  );
  return toDelivery(rows[0]);
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT d.*, u.name AS driver_name FROM deliveries d LEFT JOIN users u ON u.id = d.driver_id WHERE d.id = $1`,
    [id]
  );
  return toDelivery(rows[0]);
}

async function findByOrderId(orderId) {
  const { rows } = await pool.query(
    `SELECT d.*, u.name AS driver_name FROM deliveries d LEFT JOIN users u ON u.id = d.driver_id WHERE d.order_id = $1`,
    [orderId]
  );
  return toDelivery(rows[0]);
}

async function findAvailable() {
  const { rows } = await pool.query(
    `SELECT d.*, u.name AS driver_name FROM deliveries d LEFT JOIN users u ON u.id = d.driver_id
     WHERE d.status = 'pending' AND d.driver_id IS NULL ORDER BY d.created_at ASC`
  );
  return rows.map(toDelivery);
}

async function findByDriver(driverId, status) {
  let query = `SELECT d.*, u.name AS driver_name FROM deliveries d LEFT JOIN users u ON u.id = d.driver_id WHERE d.driver_id = $1`;
  const params = [driverId];
  if (status) {
    query += ' AND d.status = $2';
    params.push(status);
  }
  query += ' ORDER BY d.created_at DESC';
  const { rows } = await pool.query(query, params);
  return rows.map(toDelivery);
}

async function assignDriver(deliveryId, driverId, type) {
  const { rows } = await pool.query(
    `UPDATE deliveries SET driver_id = $1, assignment_type = $2, status = 'assigned', assigned_at = NOW()
     WHERE id = $3 RETURNING *`,
    [driverId, type || 'claimed', deliveryId]
  );
  return toDelivery(rows[0]);
}

async function updateStatus(deliveryId, status, notes) {
  const timestampCol = {
    picked_up: 'picked_up_at',
    en_route: 'en_route_at',
    delivered: 'delivered_at',
  }[status];

  let query, params;
  if (timestampCol) {
    query = `UPDATE deliveries SET status = $1, ${timestampCol} = NOW(), driver_notes = COALESCE($2, driver_notes) WHERE id = $3 RETURNING *`;
    params = [status, notes || null, deliveryId];
  } else {
    query = `UPDATE deliveries SET status = $1, driver_notes = COALESCE($2, driver_notes) WHERE id = $3 RETURNING *`;
    params = [status, notes || null, deliveryId];
  }

  const { rows } = await pool.query(query, params);
  return toDelivery(rows[0]);
}

async function findAll() {
  const { rows } = await pool.query(
    `SELECT d.*, u.name AS driver_name FROM deliveries d LEFT JOIN users u ON u.id = d.driver_id ORDER BY d.created_at DESC`
  );
  return rows.map(toDelivery);
}

module.exports = { create, findById, findByOrderId, findAvailable, findByDriver, assignDriver, updateStatus, findAll };
