import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/reviews/user/:userId
router.get('/user/:userId', async (req, res, next) => {
  try {
    const cleanId = String(req.params.userId).replace(/^[fe]/, '');
    const [rows] = await pool.query(
      `SELECT r.*, u.name AS reviewer_name, u.avatar AS reviewer_avatar, u.role AS reviewer_role
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.reviewee_id = ?
       ORDER BY r.created_at DESC`,
      [cleanId]
    );

    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/reviews
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { dealId, revieweeId, rating, comment } = req.body;

    const cleanDealId = String(dealId).replace('d', '');
    const cleanRevieweeId = String(revieweeId).replace(/^[fe]/, '');

    const [resInsert] = await pool.query(
      'INSERT INTO reviews (deal_id, reviewer_id, reviewee_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [cleanDealId, req.user.id, cleanRevieweeId, Number(rating), comment]
    );

    // Update reviewee rating & reviews_count
    const [avg] = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE reviewee_id = ?',
      [cleanRevieweeId]
    );

    await pool.query(
      'UPDATE users SET rating = ?, reviews_count = ? WHERE id = ?',
      [avg[0].avg_rating || 5.0, avg[0].count, cleanRevieweeId]
    );

    res.status(201).json({ success: true, message: 'Review submitted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
