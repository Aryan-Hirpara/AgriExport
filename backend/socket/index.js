import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export function setupSocket(io) {
  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'agriexport_super_secret_jwt_key_2026');
      const [users] = await pool.query('SELECT id, name, role, email FROM users WHERE id = ?', [decoded.id]);
      if (users.length === 0) {
        return next(new Error('User not found'));
      }

      socket.user = users[0];
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`🔌 Socket connected: User ${socket.user.name} (${userId})`);

    // Join personal user room for direct notifications
    socket.join(`user_${userId}`);

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`convo_${conversationId}`);
      console.log(`User ${userId} joined room convo_${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`convo_${conversationId}`);
    });

    // Real-time chat message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, receiverId, content, dealId, listingId } = data;
        const cleanReceiverId = String(receiverId).replace(/^[fe]/, '');
        const cleanDealId = dealId ? String(dealId).replace('d', '') : null;
        const cleanListingId = listingId ? String(listingId).replace('l', '') : null;

        const [resInsert] = await pool.query(
          `INSERT INTO messages (conversation_id, sender_id, receiver_id, deal_id, listing_id, content)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [conversationId, userId, cleanReceiverId, cleanDealId, cleanListingId, content]
        );

        const msgObj = {
          id: resInsert.insertId,
          conversation_id: conversationId,
          sender_id: userId,
          receiver_id: Number(cleanReceiverId),
          content,
          sender_name: socket.user.name,
          created_at: new Date(),
        };

        // Broadcast to conversation room and to receiver's user room
        io.to(`convo_${conversationId}`).emit('new_message', msgObj);
        io.to(`user_${cleanReceiverId}`).emit('receive_message', msgObj);
      } catch (err) {
        console.error('Socket message error:', err);
      }
    });

    // Typing indicator
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`convo_${conversationId}`).emit('user_typing', {
        userId,
        userName: socket.user.name,
        isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: User ${socket.user.name}`);
    });
  });
}
