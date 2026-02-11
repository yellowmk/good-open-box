const pool = require('../../config/db');

function toApplication(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    vehicleType: row.vehicle_type,
    vehicleYear: row.vehicle_year,
    vehicleMake: row.vehicle_make,
    vehicleModel: row.vehicle_model,
    licenseNumber: row.license_number,
    licenseState: row.license_state,
    status: row.status,
    notes: row.notes,
    appliedAt: row.applied_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
  };
}

async function create({ name, email, phone, vehicleType, vehicleYear, vehicleMake, vehicleModel, licenseNumber, licenseState }) {
  const { rows } = await pool.query(
    `INSERT INTO driver_applications (name, email, phone, vehicle_type, vehicle_year, vehicle_make, vehicle_model, license_number, license_state)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [name, email, phone, vehicleType, vehicleYear, vehicleMake, vehicleModel, licenseNumber, licenseState]
  );
  return toApplication(rows[0]);
}

async function findAll(status) {
  let query = 'SELECT * FROM driver_applications';
  const params = [];
  if (status) {
    query += ' WHERE status = $1';
    params.push(status);
  }
  query += ' ORDER BY applied_at DESC';
  const { rows } = await pool.query(query, params);
  return rows.map(toApplication);
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM driver_applications WHERE id = $1', [id]);
  return toApplication(rows[0]);
}

async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM driver_applications WHERE email = $1', [email]);
  return toApplication(rows[0]);
}

async function updateStatus(id, status, reviewedBy) {
  const { rows } = await pool.query(
    `UPDATE driver_applications SET status = $1, reviewed_at = NOW(), reviewed_by = $2 WHERE id = $3 RETURNING *`,
    [status, reviewedBy, id]
  );
  return toApplication(rows[0]);
}

module.exports = { create, findAll, findById, findByEmail, updateStatus };
