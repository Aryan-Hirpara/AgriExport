import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

const MILESTONES = [
  { key: 'deal_signed', label: 'Deal Signed', progress: 15 },
  { key: 'advance_paid', label: 'Advance Paid', progress: 35 },
  { key: 'inspection', label: 'Quality Inspection', progress: 55 },
  { key: 'dispatched', label: 'Dispatched / In Transit', progress: 75 },
  { key: 'delivered', label: 'Delivered', progress: 90 },
  { key: 'payment_completed', label: 'Payment Completed', progress: 100 },
];

function buildTimeline(currentStatus, history = []) {
  const currentIdx = MILESTONES.findIndex(m => m.key === currentStatus);
  return MILESTONES.map((m, idx) => {
    const histEntry = history.find(h => h.to_status === m.key);
    return {
      key: m.key,
      label: m.label,
      done: idx <= currentIdx,
      active: idx === currentIdx,
      date: histEntry ? new Date(histEntry.created_at).toLocaleDateString() : '',
      note: histEntry ? histEntry.note : '',
    };
  });
}

// GET /api/deals - List deals for user
router.get('/', verifyToken, async (req, res, next) => {
  try {
    let query = `
      SELECT 
        d.*, c.name AS crop_name, c.slug AS crop_slug, c.emoji AS crop_emoji,
        f.name AS farmer_name, f.avatar AS farmer_avatar, f.phone AS farmer_phone,
        e.name AS enterprise_name, e.avatar AS enterprise_logo, e.phone AS enterprise_phone,
        ep.company_name, ep.city AS enterprise_city
      FROM deals d
      JOIN crops c ON d.crop_id = c.id
      JOIN users f ON d.farmer_id = f.id
      JOIN users e ON d.enterprise_id = e.id
      LEFT JOIN enterprise_profiles ep ON ep.user_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'farmer') {
      query += ' AND d.farmer_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'enterprise') {
      query += ' AND d.enterprise_id = ?';
      params.push(req.user.id);
    }
    // Admin sees all

    query += ' ORDER BY d.created_at DESC';

    const [rows] = await pool.query(query, params);

    const formatted = rows.map(d => ({
      id: `d${d.id}`,
      dbId: d.id,
      dealCode: d.deal_code,
      farmerId: `f${d.farmer_id}`,
      farmerName: d.farmer_name,
      farmerPhone: d.farmer_phone,
      farmerAvatar: d.farmer_avatar || '🧑‍🌾',
      enterpriseId: `e${d.enterprise_id}`,
      enterpriseName: d.company_name || d.enterprise_name,
      enterprisePhone: d.enterprise_phone,
      enterpriseLogo: d.enterprise_logo || '🏢',
      crop: d.crop_name,
      cropSlug: d.crop_slug,
      emoji: d.crop_emoji || '🌿',
      qty: `${Number(d.quantity) / (d.unit === 'ton' ? 1 : 1000)} ton`,
      quantityRaw: Number(d.quantity),
      unit: d.unit,
      price: Number(d.agreed_price),
      totalAmount: Number(d.total_amount),
      value: `₹${Number(d.total_amount).toLocaleString('en-IN')}`,
      advanceAmount: Number(d.advance_amount),
      paymentTerms: d.payment_terms,
      deliveryTerms: d.delivery_terms,
      status: d.status,
      milestoneProgress: d.milestone_progress,
      signedAt: d.signed_at,
      createdAt: d.created_at,
      timeline: buildTimeline(d.status),
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    next(err);
  }
});

// GET /api/deals/:id - Single deal with full timeline, status history, and documents
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const cleanId = String(req.params.id).replace('d', '');
    const [rows] = await pool.query(
      `SELECT 
        d.*, c.name AS crop_name, c.slug AS crop_slug, c.emoji AS crop_emoji,
        f.name AS farmer_name, f.avatar AS farmer_avatar, f.phone AS farmer_phone,
        e.name AS enterprise_name, e.avatar AS enterprise_logo, e.phone AS enterprise_phone,
        ep.company_name, ep.city AS enterprise_city
       FROM deals d
       JOIN crops c ON d.crop_id = c.id
       JOIN users f ON d.farmer_id = f.id
       JOIN users e ON d.enterprise_id = e.id
       LEFT JOIN enterprise_profiles ep ON ep.user_id = e.id
       WHERE d.id = ?`,
      [cleanId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Deal not found.' });
    }

    const d = rows[0];

    // Authorization check
    if (req.user.role !== 'admin' && req.user.id !== d.farmer_id && req.user.id !== d.enterprise_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this deal.' });
    }

    // Status history
    const [history] = await pool.query(
      `SELECT h.*, u.name AS updated_by_name, u.role AS updated_by_role
       FROM deal_status_history h
       JOIN users u ON h.updated_by = u.id
       WHERE h.deal_id = ?
       ORDER BY h.created_at ASC`,
      [cleanId]
    );

    // Documents
    const [documents] = await pool.query(
      `SELECT doc.*, u.name AS uploaded_by_name
       FROM deal_documents doc
       JOIN users u ON doc.uploaded_by = u.id
       WHERE doc.deal_id = ?
       ORDER BY doc.created_at DESC`,
      [cleanId]
    );

    const timeline = buildTimeline(d.status, history);

    res.json({
      success: true,
      data: {
        id: `d${d.id}`,
        dbId: d.id,
        dealCode: d.deal_code,
        farmerId: `f${d.farmer_id}`,
        farmerName: d.farmer_name,
        farmerPhone: d.farmer_phone,
        farmerAvatar: d.farmer_avatar || '🧑‍🌾',
        enterpriseId: `e${d.enterprise_id}`,
        enterpriseName: d.company_name || d.enterprise_name,
        enterprisePhone: d.enterprise_phone,
        enterpriseLogo: d.enterprise_logo || '🏢',
        crop: d.crop_name,
        cropSlug: d.crop_slug,
        emoji: d.crop_emoji || '🌿',
        qty: `${Number(d.quantity) / (d.unit === 'ton' ? 1 : 1000)} ton`,
        quantityRaw: Number(d.quantity),
        unit: d.unit,
        price: Number(d.agreed_price),
        totalAmount: Number(d.total_amount),
        value: `₹${Number(d.total_amount).toLocaleString('en-IN')}`,
        advanceAmount: Number(d.advance_amount),
        paymentTerms: d.payment_terms,
        deliveryTerms: d.delivery_terms,
        status: d.status,
        milestoneProgress: d.milestone_progress,
        signedAt: d.signed_at,
        timeline,
        history,
        documents,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/deals/:id/status - Update milestone status
router.post('/:id/status', verifyToken, async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const cleanId = String(req.params.id).replace('d', '');
    const { status, note } = req.body;

    const [deals] = await connection.query('SELECT * FROM deals WHERE id = ?', [cleanId]);
    if (deals.length === 0) {
      return res.status(404).json({ success: false, message: 'Deal not found.' });
    }

    const deal = deals[0];
    if (req.user.role !== 'admin' && req.user.id !== deal.farmer_id && req.user.id !== deal.enterprise_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this deal.' });
    }

    const milestone = MILESTONES.find(m => m.key === status);
    if (!milestone) {
      return res.status(400).json({ success: false, message: 'Invalid milestone status.' });
    }

    await connection.beginTransaction();

    await connection.query(
      'UPDATE deals SET status = ?, milestone_progress = ? WHERE id = ?',
      [status, milestone.progress, cleanId]
    );

    await connection.query(
      `INSERT INTO deal_status_history (deal_id, from_status, to_status, note, updated_by)
       VALUES (?, ?, ?, ?, ?)`,
      [cleanId, deal.status, status, note || `Status updated to ${milestone.label}`, req.user.id]
    );

    // Notify other party
    const notifyId = req.user.id === deal.farmer_id ? deal.enterprise_id : deal.farmer_id;
    await connection.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'Deal Milestone Updated', ?, 'deal', ?)`,
      [notifyId, `Deal #${deal.deal_code} has progressed to ${milestone.label}.`, `/farmer/deals`]
    );

    await connection.commit();

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${deal.farmer_id}`).emit('deal_status_updated', { dealId: `d${cleanId}`, status, milestoneProgress: milestone.progress });
      io.to(`user_${deal.enterprise_id}`).emit('deal_status_updated', { dealId: `d${cleanId}`, status, milestoneProgress: milestone.progress });
      io.emit('deals_updated');
      io.emit('stats_updated');
    }

    res.json({
      success: true,
      message: `Deal status updated to ${milestone.label}.`,
      status,
      milestoneProgress: milestone.progress,
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// POST /api/deals/:id/documents - Upload inspection/shipping/contract document
router.post('/:id/documents', verifyToken, upload.single('file'), async (req, res, next) => {
  try {
    const cleanId = String(req.params.id).replace('d', '');
    const { title, docType = 'contract' } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const [resInsert] = await pool.query(
      `INSERT INTO deal_documents (deal_id, title, doc_type, file_url, file_size, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cleanId, title || req.file.originalname, docType, fileUrl, req.file.size, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully.',
      documentId: resInsert.insertId,
      fileUrl,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
