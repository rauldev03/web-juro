import db from '../db/index.js';

export class ProductsService {
  /**
   * Get all products with filters, sorting, and variant aggregates.
   */
  static getAll({ category, color, size, search, activeOnly = true, limit = 50, offset = 0 }) {
    let query = `
      SELECT 
        p.id, 
        p.name, 
        p.slug, 
        p.description, 
        p.price, 
        p.category_id, 
        p.active, 
        p.featured,
        p.created_at,
        p.updated_at,
        c.name as category_name,
        c.slug as category_slug,
        COALESCE(SUM(pv.stock), 0) as total_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE 1=1
    `;

    const params = [];

    if (activeOnly) {
      query += ` AND p.active = 1`;
    }

    if (category && category !== 'all') {
      query += ` AND c.slug = ?`;
      params.push(category);
    }

    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (color && color !== 'all') {
      query += ` AND p.id IN (
        SELECT pv2.product_id 
        FROM product_variants pv2 
        JOIN colors col ON pv2.color_id = col.id 
        WHERE col.slug = ? AND pv2.stock > 0
      )`;
      params.push(color);
    }

    if (size && size !== 'all') {
      query += ` AND p.id IN (
        SELECT pv3.product_id 
        FROM product_variants pv3 
        JOIN sizes sz ON pv3.size_id = sz.id 
        WHERE sz.name = ? AND pv3.stock > 0
      )`;
      params.push(size);
    }

    query += ` GROUP BY p.id ORDER BY p.featured DESC, p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const products = db.prepare(query).all(...params);

    // Fetch images and variant summary for each product
    const result = products.map(product => {
      const images = db.prepare(`
        SELECT id, image_url, is_primary, sort_order
        FROM product_images
        WHERE product_id = ?
        ORDER BY is_primary DESC, sort_order ASC, id ASC
      `).all(product.id);

      const colors = db.prepare(`
        SELECT DISTINCT c.id, c.name, c.hex_code, c.slug
        FROM product_variants pv
        JOIN colors c ON pv.color_id = c.id
        WHERE pv.product_id = ?
      `).all(product.id);

      const sizes = db.prepare(`
        SELECT DISTINCT s.id, s.name, s.sort_order
        FROM product_variants pv
        JOIN sizes s ON pv.size_id = s.id
        WHERE pv.product_id = ?
        ORDER BY s.sort_order ASC
      `).all(product.id);

      const primaryImage = images.find(img => img.is_primary === 1)?.image_url || images[0]?.image_url || '/images/products/polo-black-essential.jpg';

      return {
        ...product,
        primary_image: primaryImage,
        images,
        colors,
        sizes
      };
    });

    return result;
  }

  /**
   * Get single product by slug or id with full details, all images, and variant matrix
   */
  static getBySlugOrId(identifier, adminMode = false) {
    let product;
    if (isNaN(identifier)) {
      let q = `
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.slug = ?
      `;
      if (!adminMode) q += ` AND p.active = 1`;
      product = db.prepare(q).get(identifier);
    } else {
      let q = `
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `;
      if (!adminMode) q += ` AND p.active = 1`;
      product = db.prepare(q).get(identifier);
    }

    if (!product) return null;

    // Get all images
    const images = db.prepare(`
      SELECT id, image_url, is_primary, sort_order
      FROM product_images
      WHERE product_id = ?
      ORDER BY is_primary DESC, sort_order ASC, id ASC
    `).all(product.id);

    // Get all variants with full joined color and size information
    const variants = db.prepare(`
      SELECT 
        pv.id as variant_id,
        pv.product_id,
        pv.color_id,
        pv.size_id,
        pv.stock,
        c.name as color_name,
        c.hex_code as color_hex,
        c.slug as color_slug,
        s.name as size_name,
        s.sort_order as size_sort
      FROM product_variants pv
      JOIN colors c ON pv.color_id = c.id
      JOIN sizes s ON pv.size_id = s.id
      WHERE pv.product_id = ?
      ORDER BY c.id ASC, s.sort_order ASC
    `).all(product.id);

    // Unique colors available
    const colorsMap = new Map();
    variants.forEach(v => {
      if (!colorsMap.has(v.color_id)) {
        colorsMap.set(v.color_id, {
          id: v.color_id,
          name: v.color_name,
          hex_code: v.color_hex,
          slug: v.color_slug
        });
      }
    });

    // Unique sizes available
    const sizesMap = new Map();
    variants.forEach(v => {
      if (!sizesMap.has(v.size_id)) {
        sizesMap.set(v.size_id, {
          id: v.size_id,
          name: v.size_name,
          sort_order: v.size_sort
        });
      }
    });

    const totalStock = variants.reduce((acc, curr) => acc + curr.stock, 0);

    return {
      ...product,
      primary_image: images.find(img => img.is_primary === 1)?.image_url || images[0]?.image_url || '/images/products/polo-black-essential.jpg',
      images,
      variants,
      colors: Array.from(colorsMap.values()),
      sizes: Array.from(sizesMap.values()).sort((a, b) => a.sort_order - b.sort_order),
      total_stock: totalStock
    };
  }

  /**
   * Helper to generate a unique slug
   */
  static generateSlug(name, existingId = null) {
    let slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) slug = 'polo-' + Date.now();

    let finalSlug = slug;
    let counter = 1;
    while (true) {
      const row = db.prepare('SELECT id FROM products WHERE slug = ?').get(finalSlug);
      if (!row || (existingId && row.id === Number(existingId))) {
        break;
      }
      finalSlug = `${slug}-${counter}`;
      counter++;
    }
    return finalSlug;
  }

  /**
   * Create Product + Images + Variant Matrix
   */
  static create({ name, description, price, category_id, active = 1, featured = 0, images = [], variants = [] }) {
    const slug = this.generateSlug(name);

    const result = db.prepare(`
      INSERT INTO products (name, slug, description, price, category_id, active, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      slug,
      description || '',
      parseFloat(price),
      category_id ? parseInt(category_id) : null,
      active ? 1 : 0,
      featured ? 1 : 0
    );

    const productId = result.lastInsertRowid;

    // Insert images
    if (images && images.length > 0) {
      images.forEach((img, idx) => {
        db.prepare(`
          INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
          VALUES (?, ?, ?, ?)
        `).run(
          productId,
          img.image_url || img.url || img,
          img.is_primary ? 1 : (idx === 0 ? 1 : 0),
          img.sort_order !== undefined ? img.sort_order : idx
        );
      });
    }

    // Insert variants
    if (variants && variants.length > 0) {
      for (const v of variants) {
        if (v.color_id && v.size_id) {
          db.prepare(`
            INSERT INTO product_variants (product_id, color_id, size_id, stock)
            VALUES (?, ?, ?, ?)
          `).run(
            productId,
            parseInt(v.color_id),
            parseInt(v.size_id),
            parseInt(v.stock) || 0
          );
        }
      }
    }

    return this.getBySlugOrId(productId, true);
  }

  /**
   * Update Product + Images + Variant Matrix
   */
  static update(id, { name, description, price, category_id, active, featured, images, variants }) {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Producto no encontrado');
    }

    const newSlug = name && name !== existing.name ? this.generateSlug(name, id) : existing.slug;

    db.prepare(`
      UPDATE products
      SET name = COALESCE(?, name),
          slug = COALESCE(?, slug),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          category_id = ?,
          active = COALESCE(?, active),
          featured = COALESCE(?, featured),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name ? name.trim() : null,
      newSlug,
      description !== undefined ? description : null,
      price !== undefined ? parseFloat(price) : null,
      category_id !== undefined ? (category_id ? parseInt(category_id) : null) : existing.category_id,
      active !== undefined ? (active ? 1 : 0) : null,
      featured !== undefined ? (featured ? 1 : 0) : null,
      id
    );

    // Update images if provided
    if (images !== undefined && Array.isArray(images)) {
      db.prepare('DELETE FROM product_images WHERE product_id = ?').run(id);
      images.forEach((img, idx) => {
        db.prepare(`
          INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
          VALUES (?, ?, ?, ?)
        `).run(
          id,
          img.image_url || img.url || img,
          img.is_primary ? 1 : (idx === 0 ? 1 : 0),
          img.sort_order !== undefined ? img.sort_order : idx
        );
      });
    }

    // Update variants matrix if provided
    if (variants !== undefined && Array.isArray(variants)) {
      db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(id);
      for (const v of variants) {
        if (v.color_id && v.size_id) {
          db.prepare(`
            INSERT INTO product_variants (product_id, color_id, size_id, stock)
            VALUES (?, ?, ?, ?)
          `).run(
            id,
            parseInt(v.color_id),
            parseInt(v.size_id),
            parseInt(v.stock) || 0
          );
        }
      }
    }

    return this.getBySlugOrId(id, true);
  }

  /**
   * Toggle product active status
   */
  static toggleStatus(id, active) {
    db.prepare(`
      UPDATE products
      SET active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(active ? 1 : 0, id);

    return { success: true, id, active: active ? 1 : 0 };
  }

  /**
   * Delete product
   */
  static delete(id) {
    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Producto no encontrado');
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return { success: true, message: 'Producto eliminado correctamente' };
  }
}
