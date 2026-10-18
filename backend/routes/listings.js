import express from 'express';
import pool from '../config/db.js';
import { verifyToken, optionalAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// GET /api/listings - Browse listings with filters & search
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      crop,
      district,
      grade,
      organic,
      minPrice,
      maxPrice,
      search,
      status = 'active',
      page = 1,
      limit = 50,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = req.query;

    let query = `
      SELECT 
        l.id, l.farmer_id, l.crop_id, l.title, l.variety, l.quantity, l.unit,
        l.price_per_unit, l.min_order_quantity, l.location_village, l.location_district,
        l.quality_grade, l.harvest_date, l.packaging_type, l.organic_certified,
        l.lab_tested, l.attributes, l.description, l.status, l.views_count, l.created_at,
        c.name AS crop_name, c.slug AS crop_slug, c.emoji AS crop_emoji, c.image_url AS crop_image_url,
        u.name AS farmer_name, u.rating AS farmer_rating, u.reviews_count AS farmer_reviews_count,
        u.is_verified AS farmer_verified, u.avatar AS farmer_avatar,
        fp.state AS location_state,
        (SELECT COUNT(*) FROM offers o WHERE o.listing_id = l.id) AS offers_count
      FROM produce_listings l
      JOIN crops c ON l.crop_id = c.id
      JOIN users u ON l.farmer_id = u.id
      LEFT JOIN farmer_profiles fp ON l.farmer_id = fp.user_id
      WHERE 1=1
    `;

    const params = [];

    if (status && status !== 'all') {
      query += ' AND l.status = ?';
      params.push(status);
    }

    if (crop) {
      query += ' AND (c.slug = ? OR c.name LIKE ?)';
      params.push(crop, `%${crop}%`);
    }

    if (district) {
      query += ' AND l.location_district = ?';
      params.push(district);
    }

    if (grade) {
      query += ' AND l.quality_grade LIKE ?';
      params.push(`%${grade}%`);
    }

    if (organic !== undefined && organic !== '') {
      query += ' AND l.organic_certified = ?';
      params.push(organic === 'true' || organic === true ? 1 : 0);
    }

    if (minPrice) {
      query += ' AND l.price_per_unit >= ?';
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      query += ' AND l.price_per_unit <= ?';
      params.push(Number(maxPrice));
    }

    if (search) {
      query += ' AND (l.title LIKE ? OR l.description LIKE ? OR c.name LIKE ? OR l.variety LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    // Sorting
    const safeSort = ['created_at', 'price_per_unit', 'quantity'].includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY l.${safeSort} ${safeOrder}`;

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [listings] = await pool.query(query, params);

    // Fetch primary images
    const listingIds = listings.map(l => l.id);
    let imagesByListing = {};
    if (listingIds.length > 0) {
      const [images] = await pool.query(
        'SELECT listing_id, image_url, is_primary FROM listing_images WHERE listing_id IN (?)',
        [listingIds]
      );
      images.forEach(img => {
        if (!imagesByListing[img.listing_id]) imagesByListing[img.listing_id] = [];
        imagesByListing[img.listing_id].push(img.image_url);
      });
    }

    // Format listings to match frontend structure seamlessly
    const formatted = listings.map(l => {
      let attrs = {};
      if (typeof l.attributes === 'string') {
        try { attrs = JSON.parse(l.attributes); } catch (e) {}
      } else if (l.attributes) {
        attrs = l.attributes;
      }

      return {
        id: `l${l.id}`,
        dbId: l.id,
        farmerId: `f${l.farmer_id}`,
        farmerDbId: l.farmer_id,
        title: l.title || `${l.crop_name} (${l.variety || 'Export Grade'})`,
        variety: l.variety,
        crop: l.crop_slug,
        cropName: l.crop_name,
        emoji: l.crop_emoji || '🌿',
        qty: Number(l.quantity),
        quantity: Number(l.quantity),
        quantityRaw: Number(l.quantity),
        unit: l.unit || 'kg',
        price: Number(l.price_per_unit),
        pricePerUnit: Number(l.price_per_unit),
        grade: l.quality_grade,
        organic: Boolean(l.organic_certified),
        exportReady: Boolean(l.lab_tested),
        district: l.location_district,
        village: l.location_village,
        state: l.location_state || 'India',
        status: l.status,
        offers: l.offers_count || 0,
        photos: imagesByListing[l.id] && imagesByListing[l.id].length > 0 ? imagesByListing[l.id] : (l.crop_image_url ? [l.crop_image_url] : [l.crop_emoji || '🌿']),
        description: l.description,
        specs: attrs,
        farmer: {
          name: l.farmer_name,
          rating: Number(l.farmer_rating),
          reviews: l.farmer_reviews_count,
          verified: Boolean(l.farmer_verified),
          avatar: l.farmer_avatar || '🧑‍🌾',
        },
        posted: new Date(l.created_at).toLocaleDateString(),
        createdAt: l.created_at,
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      page: pageNum,
      limit: limitNum,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/listings/my - Get current logged in farmer's listings
router.get('/my', verifyToken, async (req, res, next) => {
  try {
    const [listings] = await pool.query(
      `SELECT l.*, c.name AS crop_name, c.slug AS crop_slug, c.emoji AS crop_emoji, c.image_url AS crop_image_url,
              fp.state AS location_state,
              (SELECT COUNT(*) FROM offers o WHERE o.listing_id = l.id) AS offers_count
       FROM produce_listings l
       JOIN crops c ON l.crop_id = c.id
       LEFT JOIN farmer_profiles fp ON fp.user_id = l.farmer_id
       WHERE l.farmer_id = ?
       ORDER BY l.created_at DESC`,
      [req.user.id]
    );

    // Fetch images for my listings
    const listingIds = listings.map(l => l.id);
    let imagesByListing = {};
    if (listingIds.length > 0) {
      const [images] = await pool.query(
        'SELECT listing_id, image_url, is_primary FROM listing_images WHERE listing_id IN (?)',
        [listingIds]
      );
      images.forEach(img => {
        if (!imagesByListing[img.listing_id]) imagesByListing[img.listing_id] = [];
        imagesByListing[img.listing_id].push(img.image_url);
      });
    }

    const formatted = listings.map(l => {
      let attrs = {};
      try { attrs = typeof l.attributes === 'string' ? JSON.parse(l.attributes) : l.attributes; } catch (e) {}
      return {
        id: `l${l.id}`,
        dbId: l.id,
        farmerId: `f${l.farmer_id}`,
        farmerDbId: l.farmer_id,
        farmer_id: l.farmer_id,
        title: l.title || `${l.crop_name} Produce Listing`,
        variety: l.variety || '',
        crop: l.crop_slug,
        cropName: l.crop_name,
        emoji: l.crop_emoji || '🌿',
        qty: Number(l.quantity),
        quantity: Number(l.quantity),
        quantityRaw: Number(l.quantity),
        unit: l.unit || 'kg',
        price: Number(l.price_per_unit),
        pricePerUnit: Number(l.price_per_unit),
        grade: l.quality_grade,
        organic: Boolean(l.organic_certified),
        district: l.location_district,
        village: l.location_village,
        state: l.location_state || 'India',
        status: l.status,
        offers: l.offers_count || 0,
        photos: imagesByListing[l.id]?.length > 0 ? imagesByListing[l.id] : (l.crop_image_url ? [l.crop_image_url] : [l.crop_emoji || '🌿']),
        description: l.description,
        specs: attrs,
        createdAt: l.created_at,
      };
    });

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    next(err);
  }
});

// GET /api/listings/:id - Single listing details
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const cleanId = String(req.params.id).replace('l', '');
    const [rows] = await pool.query(
      `SELECT l.*, c.name AS crop_name, c.slug AS crop_slug, c.emoji AS crop_emoji, c.image_url AS crop_image_url,
              u.name AS farmer_name, u.phone AS farmer_phone, u.rating AS farmer_rating,
              u.reviews_count AS farmer_reviews, u.is_verified AS farmer_verified, u.avatar AS farmer_avatar,
              fp.land_size, fp.experience_years, fp.state AS location_state
       FROM produce_listings l
       JOIN crops c ON l.crop_id = c.id
       JOIN users u ON l.farmer_id = u.id
       LEFT JOIN farmer_profiles fp ON fp.user_id = u.id
       WHERE l.id = ?`,
      [cleanId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    const item = rows[0];
    // Increment view count
    await pool.query('UPDATE produce_listings SET views_count = views_count + 1 WHERE id = ?', [cleanId]);

    // Images
    const [images] = await pool.query('SELECT image_url, is_primary FROM listing_images WHERE listing_id = ?', [cleanId]);

    let attrs = {};
    try { attrs = typeof item.attributes === 'string' ? JSON.parse(item.attributes) : item.attributes; } catch (e) {}

    res.json({
      success: true,
      data: {
        id: `l${item.id}`,
        dbId: item.id,
        farmerId: `f${item.farmer_id}`,
        title: item.title || `${item.crop_name} Produce Listing`,
        variety: item.variety || '',
        crop: item.crop_slug,
        cropName: item.crop_name,
        emoji: item.crop_emoji,
        qty: Number(item.quantity),
        quantity: Number(item.quantity),
        quantityRaw: Number(item.quantity),
        unit: item.unit || 'kg',
        price: Number(item.price_per_unit),
        grade: item.quality_grade,
        organic: Boolean(item.organic_certified),
        district: item.location_district,
        village: item.location_village,
        state: item.location_state || item.state || 'India',
        status: item.status,
        description: item.description,
        specs: attrs,
        photos: images.length > 0 ? images.map(i => i.image_url) : (item.crop_image_url ? [item.crop_image_url] : [item.crop_emoji || '🌿']),
        farmer: {
          name: item.farmer_name,
          phone: item.farmer_phone,
          rating: Number(item.farmer_rating),
          reviews: item.farmer_reviews,
          verified: Boolean(item.farmer_verified),
          avatar: item.farmer_avatar,
          land: item.land_size,
          experience: item.experience_years,
        },
        createdAt: item.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/listings - Create listing (Farmer only)
router.post('/', verifyToken, upload.array('images', 5), async (req, res, next) => {
  if (!req.user.is_verified) {
    return res.status(403).json({
      success: false,
      message: 'Your farmer account is awaiting admin approval. Please wait for admin verification before publishing produce listings.',
    });
  }

  const connection = await pool.getConnection();
  try {
    const {
      crop,
      cropId,
      title,
      variety,
      qty,
      quantity,
      unit = 'kg',
      price,
      pricePerUnit,
      grade,
      district,
      village,
      organic,
      description,
      specs,
    } = req.body;

    // Resolve crop_id
    let resolvedCropId = cropId;
    if (!resolvedCropId && crop) {
      const isNum = !isNaN(Number(crop)) && Number(crop) > 0;
      const [crops] = await connection.query(
        'SELECT id FROM crops WHERE id = ? OR slug = ? OR name LIKE ? LIMIT 1',
        [isNum ? Number(crop) : 0, String(crop), `%${crop}%`]
      );
      if (crops.length > 0) resolvedCropId = crops[0].id;
    }

    if (!resolvedCropId) {
      return res.status(400).json({ success: false, message: 'Valid crop must be specified.' });
    }

    const finalPrice = pricePerUnit || price || 0;
    const finalQty = qty !== undefined ? Number(qty) : (quantity !== undefined ? Number(quantity) : 100);
    const finalUnit = unit || 'kg';
    const finalTitle = title || `${variety || 'Quality'} Produce Listing`;

    let parsedSpecs = {};
    if (typeof specs === 'string') {
      try { parsedSpecs = JSON.parse(specs); } catch (e) {}
    } else if (specs) {
      parsedSpecs = specs;
    }

    await connection.beginTransaction();

    const [listingRes] = await connection.query(
      `INSERT INTO produce_listings 
        (farmer_id, crop_id, title, variety, quantity, unit, price_per_unit, location_village, location_district, quality_grade, organic_certified, lab_tested, attributes, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, ?, ?, 'active')`,
      [
        req.user.id,
        resolvedCropId,
        finalTitle,
        variety || '',
        finalQty,
        finalUnit,
        finalPrice,
        village || '',
        district || '',
        grade || 'Export Standard',
        organic === 'true' || organic === true ? 1 : 0,
        JSON.stringify(parsedSpecs),
        description || '',
      ]
    );

    const listingId = listingRes.insertId;

    // Save uploaded images if any (from req.files or JSON req.body.photos)
    let savedImages = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = `/uploads/${file.filename}`;
        await connection.query(
          'INSERT INTO listing_images (listing_id, image_url, is_primary) VALUES (?, ?, ?)',
          [listingId, imageUrl, savedImages.length === 0]
        );
        savedImages.push(imageUrl);
      }
    }

    const { photos } = req.body;
    const bodyPhotos = Array.isArray(photos) ? photos : (typeof photos === 'string' ? [photos] : []);
    for (let i = 0; i < bodyPhotos.length; i++) {
      const p = bodyPhotos[i];
      if (typeof p === 'string' && (p.startsWith('data:') || p.startsWith('http') || p.startsWith('/'))) {
        await connection.query(
          'INSERT INTO listing_images (listing_id, image_url, is_primary) VALUES (?, ?, ?)',
          [listingId, p, savedImages.length === 0]
        );
        savedImages.push(p);
      }
    }

    if (savedImages.length === 0) {
      // Default crop placeholder
      await connection.query(
        'INSERT INTO listing_images (listing_id, image_url, is_primary) VALUES (?, ?, true)',
        [listingId, `/images/crops/${crop || 'jeera'}.jpg`]
      );
    }

    await connection.commit();

    const io = req.app.get('io');
    if (io) {
      io.emit('new_listing_posted', { listingId: `l${listingId}`, cropId: resolvedCropId });
      io.emit('stats_updated');
    }

    res.status(201).json({
      success: true,
      message: 'Produce listing created successfully!',
      listingId: `l${listingId}`,
      dbId: listingId,
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// PUT /api/listings/:id - Update listing
router.put('/:id', verifyToken, async (req, res, next) => {
  try {
    const cleanId = String(req.params.id).replace('l', '');
    const [existing] = await pool.query('SELECT farmer_id FROM produce_listings WHERE id = ?', [cleanId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (existing[0].farmer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this listing.' });
    }

    const { title, variety, quantity, qty, unit, price, pricePerUnit, price_per_unit, grade, status, description, specs } = req.body;
    // Accept camelCase or snake_case price and quantity fields from frontend
    const finalPrice = pricePerUnit ?? price_per_unit ?? price;
    const finalQty = qty ?? quantity;

    await pool.query(
      `UPDATE produce_listings SET
        title = COALESCE(?, title),
        variety = COALESCE(?, variety),
        quantity = COALESCE(?, quantity),
        unit = COALESCE(?, unit),
        price_per_unit = COALESCE(?, price_per_unit),
        quality_grade = COALESCE(?, quality_grade),
        status = COALESCE(?, status),
        description = COALESCE(?, description),
        attributes = COALESCE(?, attributes),
        updated_at = NOW()
       WHERE id = ?`,
      [title, variety, finalQty ?? null, unit ?? null, finalPrice ?? null, grade, status, description, specs ? JSON.stringify(specs) : null, cleanId]
    );

    const io = req.app.get('io');
    if (io) {
      io.emit('listing_updated', { listingId: `l${cleanId}` });
      io.emit('stats_updated');
    }

    res.json({ success: true, message: 'Listing updated successfully.' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/listings/:id
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const cleanId = String(req.params.id).replace('l', '');
    const [existing] = await pool.query('SELECT farmer_id FROM produce_listings WHERE id = ?', [cleanId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (existing[0].farmer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this listing.' });
    }

    await pool.query("UPDATE produce_listings SET status = 'archived', updated_at = NOW() WHERE id = ?", [cleanId]);

    const io = req.app.get('io');
    if (io) {
      io.emit('listing_deleted', { listingId: `l${cleanId}` });
      io.emit('stats_updated');
    }

    res.json({ success: true, message: 'Listing deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
