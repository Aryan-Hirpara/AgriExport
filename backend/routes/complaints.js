import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/complaints/my
router.get('/my', verifyToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, a.name AS against_name, a.role AS against_role
       FROM complaints c
       JOIN users a ON c.against_user_id = a.id
       WHERE c.filed_by = ?
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/complaints
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { dealId, againstUserId, subject, description, category } = req.body;

    const cleanDealId = dealId ? String(dealId).replace('d', '') : null;
    const cleanAgainstId = String(againstUserId).replace(/^[fe]/, '');

    const [resInsert] = await pool.query(
      `INSERT INTO complaints (deal_id, filed_by, against_user_id, subject, description, category, status)
       VALUES (?, ?, ?, ?, ?, ?, 'open')`,
      [cleanDealId, req.user.id, cleanAgainstId, subject, description, category || 'quality']
    );

    res.status(201).json({
      success: true,
      message: 'Complaint filed successfully. Admin will review within 24-48 hours.',
      complaintId: resInsert.insertId,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
