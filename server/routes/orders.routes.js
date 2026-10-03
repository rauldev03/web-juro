import { Router } from 'express';
import { OrdersService } from '../services/orders.service.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Public: Create order (validates stock, reduces variant stock, generates WhatsApp message)
router.post('/', (req, res) => {
  try {
    const { customer_name, customer_phone, customer_email, customer_address, items, notes, payment_method } = req.body;
    const result = OrdersService.createOrder({
      customer_name,
      customer_phone,
      customer_email,
      customer_address,
      items,
      notes,
      payment_method
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Get all orders
router.get('/', authenticateAdmin, (_req, res) => {
  try {
    const orders = OrdersService.getAllOrders();
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
