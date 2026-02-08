const pool = require('../../config/db');

function toCat(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    subcategories: row.subcategories || [],
  };
}

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM categories ORDER BY name');
  return rows.map(toCat);
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
  return toCat(rows[0]);
}

module.exports = { findAll, findById };
