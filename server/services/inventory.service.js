import db from '../db/index.js';

export class InventoryService {
  /**
   * Get all product variants for inventory management
   */
  static getInventory({ search, colorId, sizeId, status, lowStockThreshold = 5 }) {
    let query = `
      SELECT 
        pv.id as variant_id,
        pv.product_id,
        pv.color_id,
        pv.size_id,
        pv.stock,
        p.name as product_name,
        p.slug as product_slug,
        p.price as product_price,
        p.active as product_active,
        c.name as color_name,
        c.hex_code as color_hex,
        c.slug as color_slug,
        s.name as size_name,
        s.sort_order as size_sort,
        (
          SELECT image_url 
          FROM product_images 
          WHERE product_id = p.id 
          ORDER BY is_primary DESC, sort_order ASC 
          LIMIT 1
        ) as primary_image
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      JOIN colors c ON pv.color_id = c.id
      JOIN sizes s ON pv.size_id = s.id
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND (p.name LIKE ? OR c.name LIKE ? OR s.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (colorId && colorId !== 'all') {
      query += ` AND pv.color_id = ?`;
      params.push(parseInt(colorId));
    }

    if (sizeId && sizeId !== 'all') {
      query += ` AND pv.size_id = ?`;
      params.push(parseInt(sizeId));
    }

    if (status === 'out_of_stock') {
      query += ` AND pv.stock <= 0`;
    } else if (status === 'low_stock') {
      query += ` AND pv.stock > 0 AND pv.stock <= ?`;
      params.push(parseInt(lowStockThreshold));
    } else if (status === 'in_stock') {
      query += ` AND pv.stock > ?`;
      params.push(parseInt(lowStockThreshold));
    }

    query += ` ORDER BY p.name ASC, c.name ASC, s.sort_order ASC`;

    const variants = db.prepare(query).all(...params);

    return variants.map(v => ({
      ...v,
      status: v.stock <= 0 ? 'out_of_stock' : (v.stock <= lowStockThreshold ? 'low_stock' : 'in_stock')
    }));
  }

  /**
   * Update stock for a specific variant
   */
  static updateStock(variantId, newStock) {
    const stockVal = Math.max(0, parseInt(newStock) || 0);

    const result = db.prepare(`
      UPDATE product_variants
      SET stock = ?
      WHERE id = ?
    `).run(stockVal, variantId);

    if (result.changes === 0) {
      throw new Error('Variante no encontrada');
    }

    const updated = db.prepare(`
      SELECT 
        pv.id as variant_id,
        pv.product_id,
        pv.stock,
        p.name as product_name,
        c.name as color_name,
        s.name as size_name
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      JOIN colors c ON pv.color_id = c.id
      JOIN sizes s ON pv.size_id = s.id
      WHERE pv.id = ?
    `).get(variantId);

    return updated;
  }

  /**
   * Get Admin dashboard metrics & KPIs
   */
  static getDashboardStats() {
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const activeProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE active = 1').get().count;
    const totalStock = db.prepare('SELECT COALESCE(SUM(stock), 0) as total FROM product_variants').get().total;
    const lowStockCount = db.prepare('SELECT COUNT(*) as count FROM product_variants WHERE stock > 0 AND stock <= 5').get().count;
    const outOfStockCount = db.prepare('SELECT COUNT(*) as count FROM product_variants WHERE stock <= 0').get().count;
    const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;

    // Recent products
    const recentProducts = db.prepare(`
      SELECT 
        p.id, 
        p.name, 
        p.price, 
        p.active, 
        p.created_at,
        c.name as category_name,
        COALESCE(SUM(pv.stock), 0) as total_stock,
        (
          SELECT image_url 
          FROM product_images 
          WHERE product_id = p.id 
          ORDER BY is_primary DESC, sort_order ASC 
          LIMIT 1
        ) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `).all();

    // Critical low stock variants
    const lowStockVariants = db.prepare(`
      SELECT 
        pv.id as variant_id,
        pv.stock,
        p.name as product_name,
        c.name as color_name,
        s.name as size_name
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      JOIN colors c ON pv.color_id = c.id
      JOIN sizes s ON pv.size_id = s.id
      WHERE pv.stock <= 5
      ORDER BY pv.stock ASC
      LIMIT 6
    `).all();

    return {
      totalProducts,
      activeProducts,
      totalStock,
      lowStockCount,
      outOfStockCount,
      totalCategories,
      totalOrders,
      recentProducts,
      lowStockVariants
    };
  }
}
