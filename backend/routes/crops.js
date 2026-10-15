import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/crops
router.get('/', async (req, res, next) => {
  try {
    const [crops] = await pool.query(
      `SELECT id, slug, name, gujarati_name, scientific_name, emoji, image_url,
              default_unit, indicative_price, export_grade, description, attributes_schema
       FROM crops WHERE is_active = true ORDER BY id ASC`
    );

    const formatted = crops.map(c => {
      let attrs = null;
      if (typeof c.attributes_schema === 'string') {
        try { attrs = JSON.parse(c.attributes_schema); } catch (e) {}
      } else {
        attrs = c.attributes_schema;
      }
      return { ...c, attributes_schema: attrs };
    });

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    next(err);
  }
});

// GET /api/crops/:idOrSlug
router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isNum = !isNaN(idOrSlug);

    const query = isNum
      ? 'SELECT * FROM crops WHERE id = ?'
      : 'SELECT * FROM crops WHERE slug = ?';

    const [rows] = await pool.query(query, [idOrSlug]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Crop not found.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
