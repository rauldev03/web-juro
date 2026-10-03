import { Router } from 'express';
import { AuthService } from '../services/auth.service.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const data = AuthService.login(email, password);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

router.get('/me', authenticateAdmin, (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router;
