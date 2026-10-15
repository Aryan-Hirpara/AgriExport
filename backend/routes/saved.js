import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/saved
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const [saved] = await pool.query(
      'SELECT item_type, item_id FROM saved_items WHERE user_id = ?',
      [req.user.id]
    );

    const listingIds = saved.filter(s => s.item_type === 'listing').map(s => s.item_id);
    const reqIds = saved.filter(s => s.item_type === 'requirement').map(s => s.item_id);

    let savedListings = [];
    if (listingIds.length > 0) {
      const [listings] = await pool.query(
        `SELECT l.*, c.name AS crop_name, c.slug AS crop_slug, c.emoji AS crop_emoji,
                u.name AS farmer_name, u.avatar AS farmer_avatar
         FROM produce_listings l
         JOIN crops c ON l.crop_id = c.id
         JOIN users u ON l.farmer_id = u.id
         WHERE l.id IN (?)`,
        [listingIds]
      );
      savedListings = listings.map(l => ({
        id: `l${l.id}`,
        dbId: l.id,
        crop: l.crop_slug,
        cropName: l.crop_name,
        price: Number(l.price_per_unit),
        grade: l.quality_grade,
        district: l.location_district,
        farmer: { name: l.farmer_name, avatar: l.farmer_avatar },
      }));
    }

    let savedRequirements = [];
    if (reqIds.length > 0) {
      const [requirements] = await pool.query(
        `SELECT br.*, c.name AS crop_name, c.slug AS crop_slug,
                u.name AS enterprise_name, u.avatar AS enterprise_logo
         FROM buyer_requirements br
         JOIN crops c ON br.crop_id = c.id
         JOIN users u ON br.enterprise_id = u.id
         WHERE br.id IN (?)`,
        [reqIds]
      );
      savedRequirements = requirements.map(r => ({
        id: `br${r.id}`,
        dbId: r.id,
        title: r.title,
        crop: r.crop_slug,
        cropName: r.crop_name,
        targetPrice: Number(r.target_price),
        enterpriseName: r.enterprise_name,
      }));
    }

    res.json({
      success: true,
      data: {
        listings: savedListings,
        requirements: savedRequirements,
        listingIds: listingIds.map(id => `l${id}`),
        requirementIds: reqIds.map(id => `br${id}`),
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/saved/toggle
router.post('/toggle', verifyToken, async (req, res, next) => {
  try {
    const { itemType, itemId } = req.body;
    const cleanId = String(itemId).replace(/^[lbr]+/, '');

    const [existing] = await pool.query(
      'SELECT id FROM saved_items WHERE user_id = ? AND item_type = ? AND item_id = ?',
      [req.user.id, itemType, cleanId]
    );

    if (existing.length > 0) {
      await pool.query('DELETE FROM saved_items WHERE id = ?', [existing[0].id]);
      return res.json({ success: true, saved: false, message: 'Item removed from saved.' });
    } else {
      await pool.query(
        'INSERT INTO saved_items (user_id, item_type, item_id) VALUES (?, ?, ?)',
        [req.user.id, itemType, cleanId]
      );
      return res.json({ success: true, saved: true, message: 'Item saved successfully.' });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
