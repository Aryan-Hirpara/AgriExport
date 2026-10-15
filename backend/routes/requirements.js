import express from 'express';
import pool from '../config/db.js';
import { verifyToken, optionalAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Helper to format a requirement row
function formatRequirement(req, quotes = []) {
  let specs = {};
  if (typeof req.specs === 'string') {
    try { specs = JSON.parse(req.specs); } catch (e) {}
  } else if (req.specs) {
    specs = req.specs;
  }

  return {
    id: `br${req.id}`,
    dbId: req.id,
    enterpriseId: `e${req.enterprise_id}`,
    enterpriseDbId: req.enterprise_id,
    enterpriseName: req.company_name || req.enterprise_name,
    buyerType: req.business_type || 'Export House',
    verified: Boolean(req.enterprise_verified),
    logo: req.enterprise_logo || '🏢',
    title: req.title,
    crop: req.crop_slug,
    cropName: req.crop_name,
    emoji: req.crop_emoji || '🌿',
    image: req.image_url || null,
    imageUrl: req.image_url || null,
    qty: Number(req.quantity),
    unit: req.unit,
    minLot: req.min_lot_size || '1 MT',
    targetPrice: Number(req.target_price),
    priceRange: req.price_range || `₹${req.target_price} / ${req.unit}`,
    destination: req.destination,
    flag: req.destination_flag || '🌐',
    urgency: req.urgency,
    urgencyLabel: req.urgency_label || 'Active Requirement',
    specs,
    deliveryTerms: req.delivery_terms,
    paymentTerms: req.payment_terms,
    deadline: req.deadline,
    notes: req.notes,
    status: req.status,
    city: req.city || 'Ahmedabad',
    phone: req.enterprise_phone || '',
    quotesCount: Number(req.quotes_count || quotes.length || 0),
    quotes,
    posted: new Date(req.created_at).toLocaleDateString(),
    createdAt: req.created_at,
  };
}

// GET /api/requirements
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { crop, urgency, destination, search, status = 'open' } = req.query;

    let query = `
      SELECT 
        br.*, c.name AS crop_name, c.slug AS crop_slug, c.emoji AS crop_emoji,
        u.name AS enterprise_name, u.avatar AS enterprise_logo, u.is_verified AS enterprise_verified, u.phone AS enterprise_phone,
        ep.company_name, ep.business_type, ep.city,
        (SELECT COUNT(*) FROM offers o WHERE o.requirement_id = br.id) AS quotes_count
      FROM buyer_requirements br
      JOIN crops c ON br.crop_id = c.id
      JOIN users u ON br.enterprise_id = u.id
      LEFT JOIN enterprise_profiles ep ON ep.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND br.status = ?';
      params.push(status);
    }

    if (crop) {
      query += ' AND (c.slug = ? OR c.name LIKE ?)';
      params.push(crop, `%${crop}%`);
    }

    if (urgency) {
      query += ' AND br.urgency = ?';
      params.push(urgency);
    }

    if (destination) {
      query += ' AND br.destination LIKE ?';
      params.push(`%${destination}%`);
    }

    if (search) {
      query += ' AND (br.title LIKE ? OR br.notes LIKE ? OR c.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY br.created_at DESC';

    const [rows] = await pool.query(query, params);

    // Fetch quotes for each requirement
    const reqIds = rows.map(r => r.id);
    let quotesByReq = {};
    if (reqIds.length > 0) {
      const [quotes] = await pool.query(
        `SELECT o.*, u.name AS farmer_name, u.phone AS farmer_phone, u.avatar AS farmer_avatar,
                u.rating AS farmer_rating, u.reviews_count AS farmer_reviews, u.is_verified AS farmer_verified,
                fp.village, fp.district, fp.land_size
         FROM offers o
         JOIN users u ON o.farmer_id = u.id
         LEFT JOIN farmer_profiles fp ON fp.user_id = u.id
         WHERE o.requirement_id IN (?)
         ORDER BY o.created_at DESC`,
        [reqIds]
      );

      quotes.forEach(q => {
        if (!quotesByReq[q.requirement_id]) quotesByReq[q.requirement_id] = [];
        
        // Privacy check: only the quoting farmer, the requirement's enterprise owner, or admin can see quote details
        const isQuotingFarmer = req.user && req.user.id === q.farmer_id;
        const isOwningEnterprise = req.user && req.user.id === q.enterprise_id;
        const isAdmin = req.user && req.user.role === 'admin';
        if (!isQuotingFarmer && !isOwningEnterprise && !isAdmin) {
          return; // Competitors cannot see other farmers' quotes
        }

        let lotSpecs = {};
        try { lotSpecs = typeof q.lot_specs === 'string' ? JSON.parse(q.lot_specs) : q.lot_specs; } catch (e) {}

        quotesByReq[q.requirement_id].push({
          id: `q${q.id}`,
          dbId: q.id,
          farmerId: `f${q.farmer_id}`,
          farmerName: q.farmer_name,
          phone: q.farmer_phone,
          avatar: q.farmer_avatar || '🧑‍🌾',
          rating: Number(q.farmer_rating),
          reviews: q.farmer_reviews,
          verified: Boolean(q.farmer_verified),
          village: q.village,
          district: q.district,
          land: q.land_size,
          qty: Number(q.quantity),
          unit: q.unit || 'ton',
          price: Number(q.offered_price),
          total: Number(q.total_amount),
          delivery: q.delivery_terms,
          payment: q.payment_terms,
          date: q.delivery_date || 'Immediate',
          notes: q.notes,
          status: q.status,
          counterPrice: q.counter_price ? Number(q.counter_price) : null,
          counterNote: q.counter_notes,
          counteredBy: q.countered_by || null,
          senderRole: q.sender_role || 'farmer',
          lotSpecs,
          dateSubmitted: new Date(q.created_at).toLocaleDateString(),
        });
      });
    }

    const formatted = rows.map(r => formatRequirement(r, quotesByReq[r.id] || []));
    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    next(err);
  }
});

// GET /api/requirements/my - Current enterprise's requirements
router.get('/my', verifyToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT br.*, c.name AS crop_name, c.slug AS crop_slug, c.emoji AS crop_emoji,
              (SELECT COUNT(*) FROM offers o WHERE o.requirement_id = br.id) AS quotes_count
       FROM buyer_requirements br
       JOIN crops c ON br.crop_id = c.id
       WHERE br.enterprise_id = ?
       ORDER BY br.created_at DESC`,
      [req.user.id]
    );

    const reqIds = rows.map(r => r.id);
    let quotesByReq = {};
    if (reqIds.length > 0) {
      const [quotes] = await pool.query(
        `SELECT o.*, u.name AS farmer_name, u.phone AS farmer_phone, u.avatar AS farmer_avatar,
                u.rating AS farmer_rating, u.reviews_count AS farmer_reviews, u.is_verified AS farmer_verified,
                fp.village, fp.district, fp.land_size
         FROM offers o
         JOIN users u ON o.farmer_id = u.id
         LEFT JOIN farmer_profiles fp ON fp.user_id = u.id
         WHERE o.requirement_id IN (?)
         ORDER BY o.created_at DESC`,
        [reqIds]
      );

      quotes.forEach(q => {
        if (!quotesByReq[q.requirement_id]) quotesByReq[q.requirement_id] = [];
        let lotSpecs = {};
        try { lotSpecs = typeof q.lot_specs === 'string' ? JSON.parse(q.lot_specs) : q.lot_specs; } catch (e) {}

        quotesByReq[q.requirement_id].push({
          id: `q${q.id}`,
          dbId: q.id,
          farmerId: `f${q.farmer_id}`,
          farmerName: q.farmer_name,
          phone: q.farmer_phone,
          avatar: q.farmer_avatar || '🧑‍🌾',
          rating: Number(q.farmer_rating),
          reviews: q.farmer_reviews,
          verified: Boolean(q.farmer_verified),
          village: q.village,
          district: q.district,
          land: q.land_size,
          qty: Number(q.quantity),
          unit: q.unit || 'ton',
          price: Number(q.offered_price),
          total: Number(q.total_amount),
          delivery: q.delivery_terms,
          payment: q.payment_terms,
          date: q.delivery_date || 'Immediate',
          notes: q.notes,
          status: q.status,
          counterPrice: q.counter_price ? Number(q.counter_price) : null,
          counterNote: q.counter_notes,
          counteredBy: q.countered_by || null,
          senderRole: q.sender_role || 'farmer',
          lotSpecs,
          dateSubmitted: new Date(q.created_at).toLocaleDateString(),
        });
      });
    }

    const formatted = rows.map(r => formatRequirement(r, quotesByReq[r.id] || []));
    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    next(err);
  }
});

// GET /api/requirements/:id
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const cleanId = String(req.params.id).replace('br', '');
    const [rows] = await pool.query(
      `SELECT 
        br.*, c.name AS crop_name, c.slug AS crop_slug, c.emoji AS crop_emoji,
        u.name AS enterprise_name, u.avatar AS enterprise_logo, u.is_verified AS enterprise_verified, u.phone AS enterprise_phone,
        ep.company_name, ep.business_type, ep.city
       FROM buyer_requirements br
       JOIN crops c ON br.crop_id = c.id
       JOIN users u ON br.enterprise_id = u.id
       LEFT JOIN enterprise_profiles ep ON ep.user_id = u.id
       WHERE br.id = ?`,
      [cleanId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Requirement not found.' });
    }

    // Fetch quotes
    const [quotes] = await pool.query(
      `SELECT o.*, u.name AS farmer_name, u.phone AS farmer_phone, u.avatar AS farmer_avatar,
              u.rating AS farmer_rating, u.reviews_count AS farmer_reviews, u.is_verified AS farmer_verified,
              fp.village, fp.district, fp.land_size
       FROM offers o
       JOIN users u ON o.farmer_id = u.id
       LEFT JOIN farmer_profiles fp ON fp.user_id = u.id
       WHERE o.requirement_id = ?
       ORDER BY o.created_at DESC`,
      [cleanId]
    );

    const isOwningEnterprise = req.user && req.user.id === rows[0].enterprise_id;
    const isAdmin = req.user && req.user.role === 'admin';
    const visibleQuotes = quotes.filter(q => {
      if (isOwningEnterprise || isAdmin) return true;
      if (req.user && req.user.id === q.farmer_id) return true;
      return false;
    });

    const formattedQuotes = visibleQuotes.map(q => {
      let lotSpecs = {};
      try { lotSpecs = typeof q.lot_specs === 'string' ? JSON.parse(q.lot_specs) : q.lot_specs; } catch (e) {}
      return {
        id: `q${q.id}`,
        dbId: q.id,
        farmerId: `f${q.farmer_id}`,
        farmerName: q.farmer_name,
        phone: q.farmer_phone,
        avatar: q.farmer_avatar || '🧑‍🌾',
        rating: Number(q.farmer_rating),
        reviews: q.farmer_reviews,
        verified: Boolean(q.farmer_verified),
        village: q.village,
        district: q.district,
        land: q.land_size,
        qty: Number(q.quantity),
        unit: q.unit || 'ton',
        price: Number(q.offered_price),
        total: Number(q.total_amount),
        delivery: q.delivery_terms,
        payment: q.payment_terms,
        date: q.delivery_date || 'Immediate',
        notes: q.notes,
        status: q.status,
        counterPrice: q.counter_price ? Number(q.counter_price) : null,
        counterNote: q.counter_notes,
        counteredBy: q.countered_by || null,
        senderRole: q.sender_role || 'farmer',
        lotSpecs,
        dateSubmitted: new Date(q.created_at).toLocaleDateString(),
      };
    });

    res.json({ success: true, data: formatRequirement(rows[0], formattedQuotes) });
  } catch (err) {
    next(err);
  }
});

// POST /api/requirements - Create requirement (Enterprise only)
router.post('/', verifyToken, async (req, res, next) => {
  if (!req.user.is_verified) {
    return res.status(403).json({
      success: false,
      message: 'Your enterprise account is awaiting admin approval. Please wait for admin verification before posting procurement requirements.',
    });
  }

  try {
    const {
      crop,
      cropId,
      title,
      qty,
      quantity,
      unit = 'ton',
      targetPrice,
      priceRange,
      destination,
      flag,
      urgency,
      urgencyLabel,
      specs,
      deliveryTerms,
      paymentTerms,
      deadline,
      notes,
      image,
      imageUrl,
      image_url,
      photo,
    } = req.body;

    let resolvedCropId = cropId;
    if (!resolvedCropId && crop) {
      const isNum = !isNaN(Number(crop)) && Number(crop) > 0;
      const [crops] = await pool.query(
        'SELECT id FROM crops WHERE id = ? OR slug = ? OR name LIKE ? LIMIT 1',
        [isNum ? Number(crop) : 0, String(crop), `%${crop}%`]
      );
      if (crops.length > 0) resolvedCropId = crops[0].id;
    }

    if (!resolvedCropId) {
      return res.status(400).json({ success: false, message: 'Valid crop must be specified.' });
    }

    const finalQty = quantity || qty || 10;
    const finalPrice = targetPrice || 100;
    const finalImage = image || imageUrl || image_url || photo || null;

    const VALID_URGENCY = ['urgent', 'high-volume', 'active', 'standard'];
    const safeUrgency = VALID_URGENCY.includes(urgency) ? urgency : (urgency === 'high' ? 'urgent' : 'active');

    const [resInsert] = await pool.query(
      `INSERT INTO buyer_requirements
        (enterprise_id, crop_id, title, quantity, unit, target_price, price_range, destination, destination_flag, urgency, urgency_label, specs, delivery_terms, payment_terms, deadline, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [
        req.user.id,
        resolvedCropId,
        title || 'Requirement for Agricultural Produce',
        finalQty,
        unit,
        finalPrice,
        priceRange || `₹${finalPrice} / ${unit}`,
        destination || 'India',
        flag || '🌐',
        safeUrgency,
        urgencyLabel || 'Active Demand',
        specs ? JSON.stringify(specs) : null,
        deliveryTerms || '',
        paymentTerms || '',
        deadline || null,
        notes || '',
      ]
    );

    const io = req.app.get('io');
    if (io) {
      io.emit('new_requirement_posted', { requirementId: `br${resInsert.insertId}`, cropId: resolvedCropId });
      io.emit('stats_updated');
    }

    res.status(201).json({
      success: true,
      message: 'Buyer requirement posted successfully!',
      requirementId: `br${resInsert.insertId}`,
      dbId: resInsert.insertId,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/requirements/:id
// Enterprise or admin can delete a requirement; cascades deletion to related offers and bookmarks
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const cleanId = String(req.params.id).replace('br', '');
    const [existing] = await pool.query('SELECT enterprise_id FROM buyer_requirements WHERE id = ?', [cleanId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Requirement not found.' });
    }

    if (existing[0].enterprise_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this requirement.' });
    }

    await pool.query('DELETE FROM buyer_requirements WHERE id = ?', [cleanId]);

    const io = req.app.get('io');
    if (io) {
      io.emit('requirement_deleted', { requirementId: `br${cleanId}` });
      io.emit('stats_updated');
    }

    res.json({ success: true, message: 'Requirement and all associated quotes deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;

