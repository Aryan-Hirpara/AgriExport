import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/messages/conversations
router.get('/conversations', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT 
        m.conversation_id,
        m.content AS last_message,
        m.created_at AS last_message_time,
        m.sender_id,
        m.receiver_id,
        u.id AS other_user_id,
        u.name AS other_user_name,
        u.avatar AS other_user_avatar,
        u.role AS other_user_role,
        (SELECT COUNT(*) FROM messages unread 
         WHERE unread.conversation_id = m.conversation_id 
           AND unread.receiver_id = ? 
           AND unread.is_read = false) AS unread_count
      FROM messages m
      JOIN (
        SELECT conversation_id, MAX(id) AS max_id
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY conversation_id
      ) latest ON m.id = latest.max_id
      JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
      ORDER BY m.created_at DESC`,
      [userId, userId, userId, userId]
    );

    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/messages/:conversationId
router.get('/:conversationId', verifyToken, async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const [messages] = await pool.query(
      `SELECT m.*, u.name AS sender_name, u.avatar AS sender_avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [conversationId]
    );

    // Auto mark received messages as read
    await pool.query(
      'UPDATE messages SET is_read = true WHERE conversation_id = ? AND receiver_id = ?',
      [conversationId, req.user.id]
    );

    res.json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    next(err);
  }
});

// POST /api/messages
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { receiverId, conversationId, dealId, listingId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ success: false, message: 'Receiver and content are required.' });
    }

    const cleanReceiverId = String(receiverId).replace(/^[fe]/, '');
    const cleanDealId = dealId ? String(dealId).replace('d', '') : null;
    const cleanListingId = listingId ? String(listingId).replace('l', '') : null;

    // Standardize conversation ID if not provided
    const sortedIds = [req.user.id, Number(cleanReceiverId)].sort((a, b) => a - b);
    const finalConvoId = conversationId || `convo_${sortedIds[0]}_${sortedIds[1]}`;

    const [resInsert] = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, receiver_id, deal_id, listing_id, content)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [finalConvoId, req.user.id, cleanReceiverId, cleanDealId, cleanListingId, content]
    );

    const messageObj = {
      id: resInsert.insertId,
      conversation_id: finalConvoId,
      sender_id: req.user.id,
      receiver_id: Number(cleanReceiverId),
      deal_id: cleanDealId,
      listing_id: cleanListingId,
      content,
      is_read: false,
      sender_name: req.user.name,
      sender_avatar: req.user.avatar,
      created_at: new Date(),
    };

    // Emit live message via Socket.io if available on req.app
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${cleanReceiverId}`).emit('receive_message', messageObj);
      io.to(`convo_${finalConvoId}`).emit('receive_message', messageObj);
    }

    res.status(201).json({ success: true, data: messageObj });
  } catch (err) {
    next(err);
  }
});

export default router;
