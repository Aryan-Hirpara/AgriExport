import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set.');
}


const router = express.Router();

// Require admin role for all admin routes
router.use(verifyToken, requireRole('admin'));

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [[farmers]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'farmer'");
    const [[enterprises]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'enterprise'");
    const [[listings]] = await pool.query("SELECT COUNT(*) AS count FROM produce_listings WHERE status = 'active'");
    const [[offers]] = await pool.query('SELECT COUNT(*) AS count FROM offers');
    const [[deals]] = await pool.query('SELECT COUNT(*) AS count FROM deals');
    const [[pendingVerifications]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE is_verified = false AND role != 'admin'");
    const [[openComplaints]] = await pool.query("SELECT COUNT(*) AS count FROM complaints WHERE status = 'open'");

    const stats = {
      farmers: Number(farmers.count || 0),
      enterprises: Number(enterprises.count || 0),
      listings: Number(listings.count || 0),
      offers: Number(offers.count || 0),
      deals: Number(deals.count || 0),
      pendingVerifications: Number(pendingVerifications.count || 0),
      openComplaints: Number(openComplaints.count || 0),
    };

    // Deals by status from real MySQL data
    const [dealStatusRows] = await pool.query(
      `SELECT status, COUNT(*) as count FROM deals GROUP BY status`
    );
    const dealsByStatus = [
      { name: 'Completed', value: 0, color: '#2F7D32' },
      { name: 'In Transit', value: 0, color: '#F9A825' },
      { name: 'Accepted', value: 0, color: '#1565C0' },
      { name: 'Pending', value: 0, color: '#9CA3AF' },
    ];
    dealStatusRows.forEach(r => {
      const match = dealsByStatus.find(d => d.name.toLowerCase().replace(' ', '_') === r.status);
      if (match) match.value = Number(r.count || 0);
    });

    // Top crops by listing count from real crops & listings
    const [topCropsRows] = await pool.query(
      `SELECT c.name as crop, COUNT(p.id) as value
       FROM crops c
       LEFT JOIN produce_listings p ON c.id = p.crop_id
       GROUP BY c.id, c.name
       ORDER BY value DESC, c.name ASC
       LIMIT 8`
    );

    const charts = {
      userGrowth: [
        { month: 'May', farmers: 0, enterprises: 0 },
        { month: 'Jun', farmers: 0, enterprises: 0 },
        { month: 'Jul', farmers: 0, enterprises: 0 },
        { month: 'Aug', farmers: 0, enterprises: 0 },
        { month: 'Sep', farmers: 0, enterprises: 0 },
        { month: 'Oct', farmers: Number(farmers.count || 0), enterprises: Number(enterprises.count || 0) },
      ],
      dealsByStatus,
      topCrops: topCropsRows.map(r => ({ crop: r.crop, value: Number(r.value || 0) })),
    };

    const liveCounters = [
      { label: 'Farmers Registered', value: stats.farmers, suffix: '+' },
      { label: 'Verified Enterprises', value: stats.enterprises, suffix: '+' },
      { label: 'Active Listings', value: stats.listings, suffix: '+' },
      { label: 'Deals Completed', value: stats.deals, suffix: '+' },
    ];

    res.json({
      success: true,
      data: {
        stats,
        charts,
        liveCounters,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/verifications - Pending user approvals
router.get('/verifications', async (req, res, next) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.avatar, u.is_verified, u.created_at,
              fp.village, fp.district, fp.land_size,
              ep.company_name, ep.gst_number, ep.iec_number, ep.city
       FROM users u
       LEFT JOIN farmer_profiles fp ON fp.user_id = u.id
       LEFT JOIN enterprise_profiles ep ON ep.user_id = u.id
       WHERE u.role != 'admin'
       ORDER BY u.is_verified ASC, u.created_at DESC`
    );

    const formatted = users.map(u => ({
      id: `pv${u.id}`,
      dbId: u.id,
      name: u.name,
      email: u.email || 'N/A',
      phone: u.phone,
      role: u.role,
      type: u.role === 'farmer' ? 'Farmer' : 'Enterprise',
      avatar: u.avatar || (u.role === 'farmer' ? '🧑‍🌾' : '🏢'),
      // Farmer specific
      village: u.village || 'N/A',
      district: u.district || 'N/A',
      land: u.land_size || 'N/A',
      // Enterprise specific
      company: u.company_name || u.name,
      gst: u.gst_number || 'N/A',
      iec: u.iec_number || 'N/A',
      city: u.city || 'N/A',
      status: u.is_verified ? 'approved' : 'pending',
      appliedAt: new Date(u.created_at).toLocaleDateString(),
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/verifications/:id/review
router.post('/verifications/:id/review', async (req, res, next) => {
  try {
    const cleanId = String(req.params.id).replace('pv', '');
    const { action } = req.body; // 'approve' or 'reject'

    const isVerified = action === 'approve';
    await pool.query('UPDATE users SET is_verified = ? WHERE id = ?', [isVerified, cleanId]);

    // Send notification
    const notifMsg = isVerified
      ? 'Congratulations! Your account verification has been approved by the AgriExport Admin.'
      : 'Your verification submission was reviewed and rejected. Please update your documents.';

    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (?, 'Verification Status Update', ?, 'verify')`,
      [cleanId, notifMsg]
    );

    // Emit live Socket.io events
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${cleanId}`).emit('verification_decided', {
        userId: Number(cleanId),
        is_verified: isVerified,
      });
      io.to(`user_${cleanId}`).emit('new_notification', {
        id: Date.now(),
        user_id: Number(cleanId),
        title: 'Verification Status Update',
        message: notifMsg,
        type: 'verify',
        created_at: new Date(),
      });
      io.emit('user_status_changed', { userId: Number(cleanId), is_verified: isVerified });
      io.emit('stats_updated');
    }

    res.json({
      success: true,
      message: `User ${isVerified ? 'verified' : 'rejected'} successfully.`,
      status: isVerified ? 'approved' : 'rejected',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/complaints
router.get('/complaints', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, 
              f.name AS filed_by_name, f.role AS filed_by_role,
              a.name AS against_name, a.role AS against_role
       FROM complaints c
       JOIN users f ON c.filed_by = f.id
       JOIN users a ON c.against_user_id = a.id
       ORDER BY c.created_at DESC`
    );

    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/complaints/:id/resolve
router.post('/complaints/:id/resolve', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolutionNotes, status = 'resolved' } = req.body;

    await pool.query(
      `UPDATE complaints SET 
        status = ?, 
        resolution_notes = ?, 
        resolved_by = ? 
       WHERE id = ?`,
      [status, resolutionNotes, req.user.id, id]
    );

    res.json({ success: true, message: 'Complaint resolved successfully.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const { role } = req.query;
    let query = `
      SELECT u.id, u.email, u.phone, u.role, u.name, u.avatar, u.is_verified, u.rating, u.created_at,
             fp.village, fp.district,
             ep.company_name, ep.city, ep.gst_number,
             (SELECT COUNT(*) FROM deals d WHERE d.farmer_id = u.id OR d.enterprise_id = u.id) AS deals_count
      FROM users u
      LEFT JOIN farmer_profiles fp ON fp.user_id = u.id
      LEFT JOIN enterprise_profiles ep ON ep.user_id = u.id
      WHERE u.role != 'admin'
    `;
    const params = [];
    if (role) {
      query += ' AND u.role = ?';
      params.push(role);
    }
    query += ' ORDER BY u.created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const cleanId = String(id).replace(/^[fe]/, '');
    const { status, is_verified } = req.body;

    const updates = [];
    const params = [];

    if (is_verified !== undefined) {
      updates.push('is_verified = ?');
      params.push(Boolean(is_verified));
    } else if (status === 'suspended') {
      updates.push('is_verified = ?');
      params.push(false);
    }

    if (updates.length > 0) {
      params.push(cleanId);
      await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const io = req.app.get('io');
    if (io) {
      const isBlocked = status === 'suspended' || status === 'blocked';
      io.to(`user_${cleanId}`).emit('user_status_changed', {
        userId: Number(cleanId),
        is_verified: is_verified !== undefined ? Boolean(is_verified) : (status === 'suspended' ? false : undefined),
        status,
        is_blocked: isBlocked,
      });
      io.emit('user_status_changed', {
        userId: Number(cleanId),
        is_verified: is_verified !== undefined ? Boolean(is_verified) : (status === 'suspended' ? false : undefined),
        status,
        is_blocked: isBlocked,
      });
      io.emit('stats_updated');
    }

    res.json({ success: true, message: 'User status updated successfully.' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/users/:id
// Permanently deletes a user and cascades deletion to all listings, requirements, offers, deals, etc.
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const cleanId = String(id).replace(/^[fe]/, '');

    const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [cleanId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found in database.' });
    }

    const targetUser = rows[0];

    // Protection: do not allow deleting admin accounts or self
    if (targetUser.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete platform administrator accounts.' });
    }

    if (Number(cleanId) === req.user.id) {
      return res.status(403).json({ success: false, message: 'Administrators cannot delete their own active account.' });
    }

    // Clean up any polymorphic saved items referencing listings or requirements of this user
    if (targetUser.role === 'farmer') {
      await pool.query(
        `DELETE FROM saved_items WHERE item_type = 'listing' AND item_id IN (SELECT id FROM produce_listings WHERE farmer_id = ?)`,
        [cleanId]
      );
    } else if (targetUser.role === 'enterprise') {
      await pool.query(
        `DELETE FROM saved_items WHERE item_type = 'requirement' AND item_id IN (SELECT id FROM buyer_requirements WHERE enterprise_id = ?)`,
        [cleanId]
      );
    }

    // Execute cascade deletion directly in database
    await pool.query('DELETE FROM users WHERE id = ?', [cleanId]);

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${cleanId}`).emit('account_deleted', {
        userId: Number(cleanId),
        message: 'Your account and all associated data have been deleted by the platform administrator.',
      });
      io.emit('user_deleted', { userId: Number(cleanId), role: targetUser.role });
      io.emit('stats_updated');
    }

    res.json({
      success: true,
      message: `${targetUser.role === 'farmer' ? 'Farmer' : 'Enterprise'} "${targetUser.name}" and all associated listings, requirements, deals, and records have been deleted permanently.`,
      deletedUserId: Number(cleanId),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/impersonate/:userId
// Allows admin to open verified user's dashboard and post produce or requirements on their behalf
router.post('/impersonate/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const cleanId = String(userId).replace(/^[a-z]+/i, '');

    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.phone, u.role, u.name, u.avatar, u.is_verified, u.rating, u.reviews_count
       FROM users u WHERE u.id = ?`,
      [cleanId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found in database.' });
    }

    const targetUser = rows[0];

    let farmerProfile = null;
    let enterpriseProfile = null;
    if (targetUser.role === 'farmer') {
      const [fps] = await pool.query('SELECT * FROM farmer_profiles WHERE user_id = ?', [targetUser.id]);
      if (fps.length > 0) farmerProfile = fps[0];
    } else if (targetUser.role === 'enterprise') {
      const [eps] = await pool.query('SELECT * FROM enterprise_profiles WHERE user_id = ?', [targetUser.id]);
      if (eps.length > 0) enterpriseProfile = eps[0];
    }

    const token = jwt.sign(
      { id: targetUser.id, role: targetUser.role, email: targetUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        ...targetUser,
        farmerProfile,
        enterpriseProfile,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
