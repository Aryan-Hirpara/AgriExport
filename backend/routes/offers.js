import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to format an offer
function formatOffer(o) {
  let specs = {};
  try { specs = typeof o.lot_specs === 'string' ? JSON.parse(o.lot_specs) : o.lot_specs; } catch (e) {}

  return {
    id: `o${o.id}`,
    dbId: o.id,
    listingId: o.listing_id ? `l${o.listing_id}` : null,
    listingDbId: o.listing_id,
    requirementId: o.requirement_id ? `br${o.requirement_id}` : null,
    requirementDbId: o.requirement_id,
    enterpriseId: `e${o.enterprise_id}`,
    enterpriseDbId: o.enterprise_id,
    enterpriseName: o.enterprise_name,
    buyerType: o.business_type || 'Export House',
    city: o.city || 'Ahmedabad',
    phone: o.enterprise_phone || '',
    rating: Number(o.enterprise_rating || 4.5),
    reviews: o.enterprise_reviews || 10,
    farmerId: `f${o.farmer_id}`,
    farmerDbId: o.farmer_id,
    farmerName: o.farmer_name || 'Farmer',
    farmerPhone: o.farmer_phone || '',
    farmerRating: Number(o.farmer_rating || 4.8),
    farmerReviews: o.farmer_reviews || 0,
    village: o.village || '',
    district: o.district || '',
    senderRole: o.sender_role || 'enterprise',
    crop: o.crop_slug,
    cropName: o.crop_name,
    emoji: o.crop_emoji || '🌿',
    grade: o.grade || 'Standard',
    offeredPrice: Number(o.offered_price),
    expectedPrice: Number(o.expected_price || o.req_target_price || o.offered_price),
    qty: Number(o.quantity),
    quantity: Number(o.quantity),
    quantityRaw: Number(o.quantity),
    unit: o.unit || 'ton',
    totalAmount: Number(o.total_amount),
    deliveryTerms: o.delivery_terms,
    paymentTerms: o.payment_terms,
    validity: o.validity_date,
    destination: o.destination || 'UAE (Dubai)',
    flag: o.flag || '🇦🇪',
    message: o.notes,
    status: o.status,
    counterPrice: o.counter_price ? Number(o.counter_price) : null,
    counterNote: o.counter_notes,
    counteredBy: o.countered_by || null,
    specs,
    requirementTitle: o.req_title,
    requirementTargetPrice: o.req_target_price ? Number(o.req_target_price) : null,
    requirementNotes: o.req_notes,
    sentAt: new Date(o.created_at).toLocaleDateString(),
    createdAt: o.created_at,
  };
}

// GET /api/offers/farmer - Offers for farmer
router.get('/farmer', verifyToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        o.*, c.name AS crop_name, c.slug AS crop_slug, c.emoji AS crop_emoji,
        u.name AS enterprise_name, u.phone AS enterprise_phone, u.rating AS enterprise_rating, u.reviews_count AS enterprise_reviews,
        ep.company_name, ep.business_type, ep.city,
        fu.name AS farmer_name, fu.phone AS farmer_phone,
        pl.price_per_unit AS expected_price, pl.quality_grade AS grade,
        br.title AS req_title, br.target_price AS req_target_price, br.notes AS req_notes,
        br.destination, br.destination_flag AS flag
       FROM offers o
       LEFT JOIN produce_listings pl ON o.listing_id = pl.id
       LEFT JOIN buyer_requirements br ON o.requirement_id = br.id
       LEFT JOIN crops c ON (pl.crop_id = c.id OR br.crop_id = c.id)
       JOIN users u ON o.enterprise_id = u.id
       LEFT JOIN enterprise_profiles ep ON ep.user_id = u.id
       LEFT JOIN users fu ON o.farmer_id = fu.id
       WHERE o.farmer_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    const formatted = rows.map(formatOffer);
    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    next(err);
  }
});

// GET /api/offers/enterprise - Offers for enterprise
router.get('/enterprise', verifyToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        o.*, c.name AS crop_name, c.slug AS crop_slug, c.emoji AS crop_emoji,
        u.name AS farmer_name, u.phone AS farmer_phone, u.rating AS farmer_rating, u.reviews_count AS farmer_reviews,
        fp.village, fp.district,
        eu.name AS enterprise_name, eu.phone AS enterprise_phone,
        ep.company_name, ep.business_type, ep.city,
        pl.price_per_unit AS expected_price, pl.quality_grade AS grade,
        br.title AS req_title, br.target_price AS req_target_price, br.notes AS req_notes,
        br.destination, br.destination_flag AS flag
       FROM offers o
       LEFT JOIN produce_listings pl ON o.listing_id = pl.id
       LEFT JOIN buyer_requirements br ON o.requirement_id = br.id
       LEFT JOIN crops c ON (pl.crop_id = c.id OR br.crop_id = c.id)
       JOIN users u ON o.farmer_id = u.id
       LEFT JOIN farmer_profiles fp ON fp.user_id = u.id
       LEFT JOIN users eu ON o.enterprise_id = eu.id
       LEFT JOIN enterprise_profiles ep ON ep.user_id = eu.id
       WHERE o.enterprise_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    const formatted = rows.map(formatOffer);
    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    next(err);
  }
});

// POST /api/offers - Create offer on a listing (by enterprise) OR quote on a requirement (by farmer)
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const {
      listingId,
      requirementId,
      farmerId,
      enterpriseId,
      offeredPrice,
      price,
      qty,
      quantity,
      unit = 'kg',
      deliveryTerms,
      delivery,
      paymentTerms,
      payment,
      validityDate,
      deliveryDate,
      message,
      notes,
      lotSpecs,
      specs,
    } = req.body;

    const cleanListingId = listingId ? String(listingId).replace('l', '') : null;
    const cleanReqId = requirementId ? String(requirementId).replace('br', '') : null;

    let targetFarmerId = farmerId ? String(farmerId).replace('f', '') : null;
    let targetEnterpriseId = enterpriseId ? String(enterpriseId).replace('e', '') : null;

    // Determine sender role
    const senderRole = req.user.role === 'farmer' ? 'farmer' : 'enterprise';

    if (senderRole === 'enterprise') {
      targetEnterpriseId = req.user.id;
      // If farmer not specified, resolve from listing
      if (!targetFarmerId && cleanListingId) {
        const [pl] = await pool.query('SELECT farmer_id FROM produce_listings WHERE id = ?', [cleanListingId]);
        if (pl.length > 0) targetFarmerId = pl[0].farmer_id;
      }
    } else {
      // Farmer sending quote
      targetFarmerId = req.user.id;
      // If enterprise not specified, resolve from requirement
      if (!targetEnterpriseId && cleanReqId) {
        const [br] = await pool.query('SELECT enterprise_id FROM buyer_requirements WHERE id = ?', [cleanReqId]);
        if (br.length > 0) targetEnterpriseId = br[0].enterprise_id;
      }
    }

    if (!targetFarmerId || !targetEnterpriseId) {
      return res.status(400).json({ success: false, message: 'Could not resolve farmer and enterprise.' });
    }

    const finalPrice = Number(offeredPrice || price || 0);
    const finalQty = Number(quantity || qty || 1);
    const multiplier = unit === 'ton' ? 1000 : unit === 'quintal' ? 100 : 1;
    const totalAmount = Number(req.body.total || req.body.totalAmount) || (finalPrice * finalQty * multiplier);

    const [resInsert] = await pool.query(
      `INSERT INTO offers
        (listing_id, requirement_id, enterprise_id, farmer_id, sender_role, offered_price, quantity, unit, total_amount, delivery_terms, payment_terms, validity_date, delivery_date, notes, lot_specs, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        cleanListingId,
        cleanReqId,
        targetEnterpriseId,
        targetFarmerId,
        senderRole,
        finalPrice,
        finalQty,
        unit,
        totalAmount,
        deliveryTerms || delivery || 'Ex-Farm Pickup',
        paymentTerms || payment || '50% advance, 50% on delivery',
        validityDate || null,
        deliveryDate || 'Immediate',
        message || notes || '',
        lotSpecs || specs ? JSON.stringify(lotSpecs || specs) : null,
      ]
    );

    // Create in-app notification for recipient
    const recipientId = senderRole === 'enterprise' ? targetFarmerId : targetEnterpriseId;
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'New Offer Received', ?, 'offer', ?)`,
      [
        recipientId,
        `${req.user.name} sent a new offer/quote of ₹${finalPrice} / ${unit}`,
        senderRole === 'enterprise' ? '/farmer/offers' : '/enterprise/offers',
      ]
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${recipientId}`).emit('new_offer_received', {
        offerId: `o${resInsert.insertId}`,
        senderName: req.user.name,
      });
      io.emit('stats_updated');
    }

    res.status(201).json({
      success: true,
      message: 'Offer submitted successfully!',
      offerId: `o${resInsert.insertId}`,
      dbId: resInsert.insertId,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/offers/:id/counter - Counter an offer
router.post('/:id/counter', verifyToken, async (req, res, next) => {
  try {
    const cleanId = String(req.params.id).replace(/^[oq]/, '');
    const { counterPrice, counterNote } = req.body;

    const [offers] = await pool.query('SELECT * FROM offers WHERE id = ?', [cleanId]);
    if (offers.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    const offer = offers[0];
    const isFarmer = req.user.id === offer.farmer_id;
    const isEnterprise = req.user.id === offer.enterprise_id;

    if (!isFarmer && !isEnterprise && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to counter this offer.' });
    }

    await pool.query(
      `UPDATE offers SET 
        status = 'countered',
        counter_price = ?,
        counter_notes = ?,
        countered_by = ?
       WHERE id = ?`,
      [counterPrice, counterNote || '', isFarmer ? 'farmer' : 'enterprise', cleanId]
    );

    // Notify other party
    const notifyId = isFarmer ? offer.enterprise_id : offer.farmer_id;
    const destLink = isFarmer ? '/enterprise/offers' : '/farmer/offers';
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'Offer Countered', ?, 'offer', ?)`,
      [notifyId, `${req.user.name} countered with ₹${counterPrice}`, destLink]
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${notifyId}`).emit('offer_countered', {
        offerId: `o${cleanId}`,
        counterPrice: Number(counterPrice),
        counterNote: counterNote || '',
        counteredBy: isFarmer ? 'farmer' : 'enterprise',
      });
      io.emit('offer_countered', {
        offerId: `o${cleanId}`,
        counterPrice: Number(counterPrice),
        counterNote: counterNote || '',
        counteredBy: isFarmer ? 'farmer' : 'enterprise',
      });
      io.emit('offer_updated', { offerId: `o${cleanId}` });
      io.emit('stats_updated');
    }

    res.json({
      success: true,
      message: 'Counter offer submitted successfully.',
      counterPrice: Number(counterPrice),
      counteredBy: isFarmer ? 'farmer' : 'enterprise',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/offers/:id/accept - Accept offer -> Auto-creates a Deal!
router.post('/:id/accept', verifyToken, async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const cleanId = String(req.params.id).replace(/^[oq]/, '');
    const [offers] = await connection.query(
      `SELECT o.*, pl.crop_id AS listing_crop_id, br.crop_id AS req_crop_id
       FROM offers o
       LEFT JOIN produce_listings pl ON o.listing_id = pl.id
       LEFT JOIN buyer_requirements br ON o.requirement_id = br.id
       WHERE o.id = ?`,
      [cleanId]
    );

    if (offers.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    const offer = offers[0];
    const isFarmer = req.user.id === offer.farmer_id;
    const isEnterprise = req.user.id === offer.enterprise_id;

    if (!isFarmer && !isEnterprise && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to accept this offer.' });
    }

    await connection.beginTransaction();

    // 1. Update offer status to accepted
    await connection.query("UPDATE offers SET status = 'accepted' WHERE id = ?", [cleanId]);

    // 1b. If offer is for a produce listing, mark it as 'sold' and close competing offers
    if (offer.listing_id) {
      await connection.query("UPDATE produce_listings SET status = 'sold' WHERE id = ?", [offer.listing_id]);
      await connection.query(
        "UPDATE offers SET status = 'rejected', notes = CONCAT(IFNULL(notes,''), ' [Closed: Produce lot sold]') WHERE listing_id = ? AND id != ? AND status IN ('new', 'countered')",
        [offer.listing_id, cleanId]
      );
    }

    // 1c. If offer is for a buyer requirement, mark it as 'fulfilled' and close competing quotes
    if (offer.requirement_id) {
      await connection.query("UPDATE buyer_requirements SET status = 'fulfilled' WHERE id = ?", [offer.requirement_id]);
      await connection.query(
        "UPDATE offers SET status = 'rejected', notes = CONCAT(IFNULL(notes,''), ' [Closed: Requirement fulfilled]') WHERE requirement_id = ? AND id != ? AND status IN ('new', 'countered')",
        [offer.requirement_id, cleanId]
      );
    }

    // 2. Resolve crop_id
    const resolvedCropId = offer.listing_crop_id || offer.req_crop_id || 1;
    const finalPrice = offer.counter_price ? Number(offer.counter_price) : Number(offer.offered_price);
    const totalAmount = finalPrice * Number(offer.quantity);
    const advanceAmount = totalAmount * 0.3; // 30% standard advance

    // 3. Generate unique deal code
    const dealCode = `DEAL-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Create Deal
    const [dealRes] = await connection.query(
      `INSERT INTO deals 
        (deal_code, offer_id, listing_id, requirement_id, farmer_id, enterprise_id, crop_id, quantity, unit, agreed_price, total_amount, advance_amount, payment_terms, delivery_terms, status, milestone_progress)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'deal_signed', 15)`,
      [
        dealCode,
        offer.id,
        offer.listing_id,
        offer.requirement_id,
        offer.farmer_id,
        offer.enterprise_id,
        resolvedCropId,
        offer.quantity,
        offer.unit,
        finalPrice,
        totalAmount,
        advanceAmount,
        offer.payment_terms || '30% Advance, 70% on Delivery',
        offer.delivery_terms || 'Farm Pickup',
      ]
    );

    const dealId = dealRes.insertId;

    // 5. Add initial history entry
    await connection.query(
      `INSERT INTO deal_status_history (deal_id, from_status, to_status, note, updated_by)
       VALUES (?, 'offer_accepted', 'deal_signed', 'Deal contract automatically generated upon offer acceptance.', ?)`,
      [dealId, req.user.id]
    );

    // 6. Notify both users
    const notifyId = isFarmer ? offer.enterprise_id : offer.farmer_id;
    const dealLink = isFarmer ? '/enterprise/offers' : '/farmer/offers';
    await connection.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'Offer Accepted! Deal Generated', ?, 'deal', ?)`,
      [notifyId, `Congratulations! Offer accepted. Deal #${dealCode} has been created.`, dealLink]
    );

    await connection.commit();

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${offer.farmer_id}`).emit('deal_created', { dealId: `d${dealId}`, dealCode });
      io.to(`user_${offer.enterprise_id}`).emit('deal_created', { dealId: `d${dealId}`, dealCode });
      io.emit('deals_updated');
      io.emit('offer_updated', { offerId: `o${cleanId}` });
      io.emit('offers_updated');
      io.emit('listings_updated');
      io.emit('listing_updated', { listingId: offer.listing_id ? `l${offer.listing_id}` : null });
      io.emit('requirements_updated');
      io.emit('requirement_updated', { requirementId: offer.requirement_id ? `br${offer.requirement_id}` : null });
      io.emit('stats_updated');
    }

    res.json({
      success: true,
      message: `Offer accepted! Deal #${dealCode} successfully created.`,
      dealId: `d${dealId}`,
      dbId: dealId,
      dealCode,
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// POST /api/offers/:id/reject
router.post('/:id/reject', verifyToken, async (req, res, next) => {
  try {
    const cleanId = String(req.params.id).replace(/^[oq]/, '');
    const [offers] = await pool.query('SELECT farmer_id, enterprise_id FROM offers WHERE id = ?', [cleanId]);
    await pool.query("UPDATE offers SET status = 'rejected' WHERE id = ?", [cleanId]);

    const io = req.app.get('io');
    if (io && offers.length > 0) {
      io.to(`user_${offers[0].farmer_id}`).emit('offer_rejected', { offerId: `o${cleanId}` });
      io.to(`user_${offers[0].enterprise_id}`).emit('offer_rejected', { offerId: `o${cleanId}` });
      io.emit('offer_updated', { offerId: `o${cleanId}` });
      io.emit('stats_updated');
    }

    res.json({ success: true, message: 'Offer rejected.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/offers/:id/withdraw
router.post('/:id/withdraw', verifyToken, async (req, res, next) => {
  try {
    const cleanId = String(req.params.id).replace(/^[oq]/, '');
    const [offers] = await pool.query('SELECT farmer_id, enterprise_id FROM offers WHERE id = ?', [cleanId]);
    await pool.query("UPDATE offers SET status = 'withdrawn' WHERE id = ?", [cleanId]);

    const io = req.app.get('io');
    if (io && offers.length > 0) {
      io.to(`user_${offers[0].farmer_id}`).emit('offer_withdrawn', { offerId: `o${cleanId}` });
      io.to(`user_${offers[0].enterprise_id}`).emit('offer_withdrawn', { offerId: `o${cleanId}` });
      io.emit('offer_updated', { offerId: `o${cleanId}` });
      io.emit('stats_updated');
    }

    res.json({ success: true, message: 'Offer withdrawn successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
