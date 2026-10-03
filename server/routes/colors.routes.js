import { Router } from 'express';
import db from '../db/index.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', (_req, res) => {
  try {
    const colors = db.prepare('SELECT * FROM colors ORDER BY name ASC').all();
    res.json({ success: true, data: colors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateAdmin, (req, res) => {
  try {
    const { name, hex_code } = req.body;
    if (!name || !hex_code) return res.status(400).json({ error: 'Nombre y código HEX son requeridos' });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const result = db.prepare('INSERT INTO colors (name, hex_code, slug) VALUES (?, ?, ?)').run(name, hex_code, slug);
    const created = db.prepare('SELECT * FROM colors WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
