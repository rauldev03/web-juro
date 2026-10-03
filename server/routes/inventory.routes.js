import { Router } from 'express';
import { InventoryService } from '../services/inventory.service.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Admin: Get dashboard metrics
router.get('/stats', authenticateAdmin, (_req, res) => {
  try {
    const stats = InventoryService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get inventory variants
router.get('/', authenticateAdmin, (req, res) => {
  try {
    const { search, colorId, sizeId, status, threshold } = req.query;
    const inventory = InventoryService.getInventory({
      search,
      colorId,
      sizeId,
      status,
      lowStockThreshold: threshold ? parseInt(threshold) : 5
    });
    res.json({ success: true, count: inventory.length, data: inventory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update stock for specific variant
router.patch('/variant/:variantId', authenticateAdmin, (req, res) => {
  try {
    const { variantId } = req.params;
    const { stock } = req.body;
    if (stock === undefined) return res.status(400).json({ error: 'Stock requerido' });

    const updated = InventoryService.updateStock(parseInt(variantId), stock);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
