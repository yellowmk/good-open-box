const pool = require('../../config/db');

function toOrder(row, items) {
  if (!row) return null;
  return {
    id: row.id,
    userId: String(row.user_id),
    items: items || [],
    shippingAddress: row.shipping_address || {},
    paymentMethod: row.payment_method,
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    shippingCost: Number(row.shipping_cost),
    total: Number(row.total),
    status: row.status,
    isPaid: row.is_paid,
    isDelivered: row.is_delivered,
    paidAt: row.paid_at || null,
    stripePaymentIntentId: row.stripe_payment_intent_id || null,
    refundStatus: row.refund_status || null,
    refundedAmount: row.refunded_amount ? Number(row.refunded_amount) : 0,
    createdAt: row.created_at,
  };
}

function toItem(row) {
  return {
    productId: row.product_id,
    name: row.name,
    price: Number(row.price),
    quantity: row.quantity,
    vendorId: row.vendor_id,
  };
}

async function getItemsForOrder(orderId) {
  const { rows } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
  return rows.map(toItem);
}

async function create({ userId, items, shippingAddress, paymentMethod, subtotal, tax, shippingCost, total, status: initialStatus }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Decrement stock for each item
    for (const item of items) {
      const { rows } = await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING stock',
        [item.quantity, item.productId]
      );
      if (rows.length === 0) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
    }

    // Generate order ID
    const seqRes = await client.query("SELECT nextval('order_id_seq')");
    const orderId = 'GOB-' + seqRes.rows[0].nextval;

    // Insert order
    const orderStatus = initialStatus || 'pending';
    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (id, user_id, shipping_address, payment_method, subtotal, tax, shipping_cost, total, status, is_paid, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,FALSE,NOW()) RETURNING *`,
      [orderId, userId, JSON.stringify(shippingAddress || {}), paymentMethod || 'stripe', subtotal, tax, shippingCost, total, orderStatus]
    );

    // Insert order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, price, quantity, vendor_id)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [orderId, item.productId, item.name, item.price, item.quantity, item.vendorId]
      );
    }

    await client.query('COMMIT');

    const orderItems = items.map((it) => ({
      productId: it.productId,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      vendorId: it.vendorId,
    }));

    return toOrder(orderRows[0], orderItems);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function findByUser(userId) {
  const { rows } = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  const orders = [];
  for (const row of rows) {
    const items = await getItemsForOrder(row.id);
    orders.push(toOrder(row, items));
  }
  return orders;
}

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  const orders = [];
  for (const row of rows) {
    const items = await getItemsForOrder(row.id);
    orders.push(toOrder(row, items));
  }
  return orders;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
  if (!rows[0]) return null;
  const items = await getItemsForOrder(id);
  return toOrder(rows[0], items);
}

async function updateStatus(id, status) {
  const isDelivered = status === 'delivered';
  const { rows } = await pool.query(
    `UPDATE orders SET status = $1, is_delivered = CASE WHEN $2 THEN TRUE ELSE is_delivered END
     WHERE id = $3 RETURNING *`,
    [status, isDelivered, id]
  );
  if (!rows[0]) return null;
  const items = await getItemsForOrder(id);
  return toOrder(rows[0], items);
}

module.exports = { create, findByUser, findAll, findById, updateStatus };
