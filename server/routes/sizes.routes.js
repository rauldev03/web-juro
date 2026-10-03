import { Router } from 'express';
import db from '../db/index.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', (_req, res) => {
  try {
    const sizes = db.prepare('SELECT * FROM sizes ORDER BY sort_order ASC').all();
    res.json({ success: true, data: sizes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateAdmin, (req, res) => {
  try {
    const { name, sort_order } = req.body;
    if (!name) return res.status(400).json({ error: 'Nombre de la talla es requerido' });
    const result = db.prepare('INSERT INTO sizes (name, sort_order) VALUES (?, ?)').run(name.trim().toUpperCase(), sort_order || 0);
    const created = db.prepare('SELECT * FROM sizes WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
