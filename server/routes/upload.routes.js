import { Router } from 'express';
import { upload } from '../middleware/upload.middleware.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Upload multiple images
router.post('/multiple', authenticateAdmin, upload.array('images', 8), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se subieron imágenes.' });
    }

    const fileUrls = req.files.map((file, idx) => ({
      image_url: `/uploads/${file.filename}`,
      is_primary: idx === 0 ? 1 : 0,
      sort_order: idx,
      original_name: file.originalname,
      size: file.size
    }));

    res.json({ success: true, data: fileUrls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload single image
router.post('/single', authenticateAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen.' });
    }

    res.json({
      success: true,
      data: {
        image_url: `/uploads/${req.file.filename}`,
        original_name: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
