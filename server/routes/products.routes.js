import { Router } from 'express';
import { ProductsService } from '../services/products.service.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Public: Get all products
router.get('/', (req, res) => {
  try {
    const { category, color, size, search, activeOnly, limit, offset } = req.query;
    const products = ProductsService.getAll({
      category,
      color,
      size,
      search,
      activeOnly: activeOnly === 'false' ? false : true,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0
    });
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all products (including inactives)
router.get('/admin/all', authenticateAdmin, (req, res) => {
  try {
    const { category, color, size, search } = req.query;
    const products = ProductsService.getAll({
      category,
      color,
      size,
      search,
      activeOnly: false,
      limit: 200
    });
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public / Admin: Get single product by slug or id
router.get('/:identifier', (req, res) => {
  try {
    const { identifier } = req.params;
    const adminMode = req.query.admin === 'true';
    const product = ProductsService.getBySlugOrId(identifier, adminMode);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Create product
router.post('/', authenticateAdmin, (req, res) => {
  try {
    const { name, description, price, category_id, active, featured, images, variants } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'El nombre y el precio son obligatorios.' });
    }

    const newProduct = ProductsService.create({
      name,
      description,
      price,
      category_id,
      active,
      featured,
      images,
      variants
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Update product
router.put('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updated = ProductsService.update(parseInt(id), req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Toggle active status
router.patch('/:id/status', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    const result = ProductsService.toggleStatus(parseInt(id), active);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Delete product
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const result = ProductsService.delete(parseInt(id));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
