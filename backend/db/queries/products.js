const pool = require('../../config/db');

function toProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    vendorId: row.vendor_id,
    vendorName: row.vendor_name,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : null,
    category: row.category,
    subcategory: row.subcategory,
    brand: row.brand,
    condition: row.condition,
    stock: row.stock,
    sku: row.sku,
    images: row.images || [],
    tags: row.tags || [],
    rating: Number(row.rating),
    numReviews: row.num_reviews,
    isFeatured: row.is_featured,
  };
}

async function findWithFilters({ category, condition, vendor, brand, minPrice, maxPrice, search, sort, page = 1, limit = 20, includeOutOfStock = false }) {
  const conditions = includeOutOfStock ? [] : ['stock > 0'];
  const params = [];
  let i = 1;

  if (category) {
    conditions.push(`LOWER(category) = LOWER($${i++})`);
    params.push(category);
  }
  if (condition) {
    conditions.push(`condition = $${i++}`);
    params.push(condition);
  }
  if (vendor) {
    conditions.push(`vendor_id = $${i++}`);
    params.push(vendor);
  }
  if (brand) {
    conditions.push(`LOWER(brand) = LOWER($${i++})`);
    params.push(brand);
  }
  if (minPrice) {
    conditions.push(`price >= $${i++}`);
    params.push(Number(minPrice));
  }
  if (maxPrice) {
    conditions.push(`price <= $${i++}`);
    params.push(Number(maxPrice));
  }
  if (search) {
    conditions.push(`(name ILIKE $${i} OR description ILIKE $${i} OR EXISTS (SELECT 1 FROM unnest(tags) t WHERE t ILIKE $${i}))`);
    params.push(`%${search}%`);
    i++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy = 'ORDER BY id';
  if (sort === 'price_asc') orderBy = 'ORDER BY price ASC';
  else if (sort === 'price_desc') orderBy = 'ORDER BY price DESC';
  else if (sort === 'rating') orderBy = 'ORDER BY rating DESC';
  else if (sort === 'name') orderBy = 'ORDER BY name ASC';

  const pg = Number(page);
  const lim = Number(limit);
  const offset = (pg - 1) * lim;

  const countQuery = `SELECT COUNT(*) FROM products ${where}`;
  const dataQuery = `SELECT * FROM products ${where} ${orderBy} LIMIT $${i++} OFFSET $${i++}`;

  const [countRes, dataRes] = await Promise.all([
    pool.query(countQuery, params),
    pool.query(dataQuery, [...params, lim, offset]),
  ]);

  const total = Number(countRes.rows[0].count);
  return {
    products: dataRes.rows.map(toProduct),
    pagination: { page: pg, limit: lim, total, pages: Math.ceil(total / lim) },
  };
}

async function findFeatured() {
  const { rows } = await pool.query('SELECT * FROM products WHERE is_featured = TRUE ORDER BY id');
  return rows.map(toProduct);
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return toProduct(rows[0]);
}

async function findByCategory(categoryName) {
  const { rows } = await pool.query('SELECT * FROM products WHERE category = $1 ORDER BY id', [categoryName]);
  return rows.map(toProduct);
}

async function create(data) {
  const nextId = await pool.query("SELECT nextval('product_id_seq')");
  const id = 'p' + nextId.rows[0].nextval;
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const { rows } = await pool.query(
    `INSERT INTO products (id, vendor_id, vendor_name, name, slug, description, price, compare_at_price,
       category, subcategory, brand, condition, stock, sku, images, tags, rating, num_reviews, is_featured)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *`,
    [
      id, data.vendorId, data.vendorName, data.name, slug, data.description || '',
      Number(data.price), data.compareAtPrice ? Number(data.compareAtPrice) : null,
      data.category || 'Electronics', data.subcategory || '', data.brand || '',
      data.condition || 'open-box', data.stock != null ? Number(data.stock) : 1,
      'SKU-' + Date.now(), data.images || [], data.tags || [], 0, 0, false,
    ]
  );
  return toProduct(rows[0]);
}

async function update(id, fields) {
  const setClauses = [];
  const params = [];
  let i = 1;

  const mapping = {
    name: 'name', description: 'description', price: 'price',
    compareAtPrice: 'compare_at_price', category: 'category',
    subcategory: 'subcategory', brand: 'brand', condition: 'condition',
    stock: 'stock', images: 'images', tags: 'tags', isFeatured: 'is_featured',
  };

  for (const [jsKey, dbCol] of Object.entries(mapping)) {
    if (fields[jsKey] !== undefined) {
      let val = fields[jsKey];
      if (['price', 'compareAtPrice', 'stock'].includes(jsKey)) val = Number(val);
      setClauses.push(`${dbCol} = $${i++}`);
      params.push(val);
    }
  }

  if (setClauses.length === 0) {
    return findById(id);
  }

  params.push(id);
  const { rows } = await pool.query(
    `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
    params
  );
  return toProduct(rows[0]);
}

async function remove(id) {
  await pool.query('DELETE FROM products WHERE id = $1', [id]);
}

async function decrementStock(id, quantity) {
  const { rows } = await pool.query(
    `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING *`,
    [quantity, id]
  );
  return toProduct(rows[0]);
}

async function countByVendor(vendorId) {
  const { rows } = await pool.query('SELECT COUNT(*) FROM products WHERE vendor_id = $1', [vendorId]);
  return Number(rows[0].count);
}

async function findByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `SELECT * FROM products WHERE id IN (${placeholders})`,
    ids
  );
  return rows.map(toProduct);
}

async function findAllCompact() {
  const { rows } = await pool.query(
    'SELECT id, name, category, subcategory, brand, condition, price, rating, tags FROM products WHERE stock > 0 ORDER BY id'
  );
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    category: r.category,
    subcategory: r.subcategory,
    brand: r.brand,
    condition: r.condition,
    price: Number(r.price),
    rating: Number(r.rating),
    tags: r.tags || [],
  }));
}

module.exports = { findWithFilters, findFeatured, findById, findByCategory, create, update, remove, decrementStock, countByVendor, findByIds, findAllCompact };
