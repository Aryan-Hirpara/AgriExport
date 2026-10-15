import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );

    const [unread] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false',
      [req.user.id]
    );

    const formatted = rows.map(n => {
      let icon = '🔔';
      if (n.type === 'offer') icon = '💼';
      else if (n.type === 'deal') icon = '🤝';
      else if (n.type === 'verify') icon = '✅';
      else if (n.type === 'price') icon = '📈';

      return {
        id: `n${n.id}`,
        dbId: n.id,
        type: n.type,
        icon,
        title: n.title,
        text: n.message,
        message: n.message,
        link: n.link,
        read: Boolean(n.is_read),
        time: new Date(n.created_at).toLocaleDateString(),
        createdAt: n.created_at,
      };
    });

    res.json({
      success: true,
      unreadCount: unread[0].count,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', verifyToken, async (req, res, next) => {
  try {
    const cleanId = String(req.params.id).replace('n', '');
    await pool.query('UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?', [cleanId, req.user.id]);
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', verifyToken, async (req, res, next) => {
  try {
    await pool.query('UPDATE notifications SET is_read = true WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
});

export default router;
