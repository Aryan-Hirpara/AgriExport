import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Helper
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'agriexport_super_secret_jwt_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper to get complete user details including profile
async function getFullUserDetails(userId) {
  const [users] = await pool.query(
    `SELECT id, email, phone, role, name, avatar, is_verified, rating, reviews_count, created_at
     FROM users WHERE id = ?`,
    [userId]
  );
  if (users.length === 0) return null;

  const user = users[0];

  if (user.role === 'farmer') {
    const [profiles] = await pool.query('SELECT * FROM farmer_profiles WHERE user_id = ?', [userId]);
    user.farmerProfile = profiles[0] || null;
    if (user.farmerProfile && typeof user.farmerProfile.primary_crops === 'string') {
      try {
        user.farmerProfile.primary_crops = JSON.parse(user.farmerProfile.primary_crops);
      } catch (e) {
        user.farmerProfile.primary_crops = [];
      }
    }
  } else if (user.role === 'enterprise') {
    const [profiles] = await pool.query('SELECT * FROM enterprise_profiles WHERE user_id = ?', [userId]);
    user.enterpriseProfile = profiles[0] || null;
    if (user.enterpriseProfile && typeof user.enterpriseProfile.countries_exported_to === 'string') {
      try {
        user.enterpriseProfile.countries_exported_to = JSON.parse(user.enterpriseProfile.countries_exported_to);
      } catch (e) {
        user.enterpriseProfile.countries_exported_to = [];
      }
    }
  }

  return user;
}

// -------------------------------------------------------------
// POST /api/auth/login
// -------------------------------------------------------------
router.post(
  '/login',
  [
    body('email').trim().notEmpty().withMessage('Email or phone number is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password, role } = req.body;
      const cleanIdentifier = (email || '').trim();
      const cleanPhone = cleanIdentifier.replace(/^\+91\s*/, '').replace(/\D/g, '');

      // Find user by email (case-insensitive) or phone (with or without +91 / formatting)
      let query = 'SELECT * FROM users WHERE (LOWER(email) = LOWER(?) OR phone = ?';
      const params = [cleanIdentifier, cleanIdentifier];
      if (cleanPhone && cleanPhone.length >= 10) {
        query += ' OR phone = ? OR phone LIKE ?';
        params.push(cleanPhone, `%${cleanPhone.slice(-10)}`);
      }
      query += ')';

      const [rows] = await pool.query(query, params);

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email/phone or account does not exist.',
        });
      }

      // Prioritize user matching requested role; fallback to user account found
      const user = (role ? rows.find(u => u.role === role) : null) || rows[0];

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password. Please check your credentials.',
        });
      }

      const fullUser = await getFullUserDetails(user.id);
      const token = generateToken(user);

      res.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        token,
        user: fullUser,
      });
    } catch (err) {
      next(err);
    }
  }
);

// -------------------------------------------------------------
// POST /api/auth/register
// -------------------------------------------------------------
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Full name is required'),
    body('role').isIn(['farmer', 'enterprise']).withMessage('Role must be either farmer or enterprise'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
  ],
  async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorList = errors.array();
        const firstMsg = errorList[0]?.msg || 'Validation failed';
        return res.status(400).json({ 
          success: false, 
          message: firstMsg, 
          errors: errorList 
        });
      }

      const {
        name,
        email,
        phone,
        password,
        role,
        avatar,
        // Farmer specific
        village,
        district,
        land_size,
        primary_crops,
        // Enterprise specific
        company_name,
        business_type,
        gst_number,
        iec_number,
        city,
      } = req.body;

      // Check if user already exists
      const [existing] = await connection.query(
        'SELECT id FROM users WHERE (email = ? AND email IS NOT NULL) OR phone = ?',
        [email || null, phone]
      );
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email or phone number already exists.',
        });
      }

      await connection.beginTransaction();

      const passwordHash = await bcrypt.hash(password, 10);
      const [userRes] = await connection.query(
        `INSERT INTO users (email, phone, password_hash, role, name, avatar, is_verified)
         VALUES (?, ?, ?, ?, ?, ?, false)`,
        [email || null, phone, passwordHash, role, name, avatar || (role === 'farmer' ? '🧑‍🌾' : '🏢')]
      );

      const userId = userRes.insertId;

      if (role === 'farmer') {
        await connection.query(
          `INSERT INTO farmer_profiles (user_id, village, district, land_size, primary_crops)
           VALUES (?, ?, ?, ?, ?)`,
          [userId, village || '', district || '', land_size || '', JSON.stringify(primary_crops || [])]
        );
      } else if (role === 'enterprise') {
        const VALID_BTYPE = ['Exporter', 'Trader', 'Processor', 'Manufacturer'];
        const safeBusinessType = VALID_BTYPE.includes(business_type) ? business_type : 'Exporter';
        await connection.query(
          `INSERT INTO enterprise_profiles (user_id, company_name, business_type, gst_number, iec_number, city)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, company_name || name, safeBusinessType, gst_number || '', iec_number || '', city || '']
        );
      }

      await connection.commit();

      const fullUser = await getFullUserDetails(userId);
      const token = generateToken(fullUser);

      const io = req.app.get('io');
      if (io) {
        io.emit('new_user_registered', { role: fullUser.role, id: fullUser.id, name: fullUser.name });
        io.emit('stats_updated');
      }

      res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to AgriExport Connect.',
        token,
        user: fullUser,
      });
    } catch (err) {
      await connection.rollback();
      next(err);
    } finally {
      connection.release();
    }
  }
);

// -------------------------------------------------------------
// GET /api/auth/me
// -------------------------------------------------------------
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const fullUser = await getFullUserDetails(req.user.id);
    if (!fullUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user: fullUser });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// PUT /api/auth/profile
// -------------------------------------------------------------
router.put('/profile', verifyToken, async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { name, email, phone, avatar, ...roleFields } = req.body;
    await connection.beginTransaction();

    await connection.query(
      'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), phone = COALESCE(?, phone), avatar = COALESCE(?, avatar) WHERE id = ?',
      [name, email, phone, avatar, req.user.id]
    );

    if (req.user.role === 'farmer') {
      const { village, district, land_size, bank_account_number, ifsc_code, upi_id } = roleFields;
      await connection.query(
        `UPDATE farmer_profiles SET
          village = COALESCE(?, village),
          district = COALESCE(?, district),
          land_size = COALESCE(?, land_size),
          bank_account_number = COALESCE(?, bank_account_number),
          ifsc_code = COALESCE(?, ifsc_code),
          upi_id = COALESCE(?, upi_id)
         WHERE user_id = ?`,
        [village, district, land_size, bank_account_number, ifsc_code, upi_id, req.user.id]
      );
    } else if (req.user.role === 'enterprise') {
      const { company_name, business_type, gst_number, iec_number, city, min_order_mt, website } = roleFields;
      await connection.query(
        `UPDATE enterprise_profiles SET
          company_name = COALESCE(?, company_name),
          business_type = COALESCE(?, business_type),
          gst_number = COALESCE(?, gst_number),
          iec_number = COALESCE(?, iec_number),
          city = COALESCE(?, city),
          min_order_mt = COALESCE(?, min_order_mt),
          website = COALESCE(?, website)
         WHERE user_id = ?`,
        [company_name, business_type, gst_number, iec_number, city, min_order_mt, website, req.user.id]
      );
    }

    await connection.commit();
    const updatedUser = await getFullUserDetails(req.user.id);

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// -------------------------------------------------------------
// POST /api/auth/change-password
// -------------------------------------------------------------
router.post(
  '/change-password',
  verifyToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;
      const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password does not match.' });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

      res.json({ success: true, message: 'Password updated successfully.' });
    } catch (err) {
      next(err);
    }
  }
);

// -------------------------------------------------------------
// GET /api/auth/enterprises (Public directory)
// -------------------------------------------------------------
router.get('/enterprises', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.phone, u.avatar, u.is_verified, u.rating, u.reviews_count,
              ep.company_name, ep.business_type, ep.city, ep.state, ep.country,
              ep.gst_number, ep.iec_number, ep.min_order_mt, ep.countries_exported_to
       FROM users u
       LEFT JOIN enterprise_profiles ep ON u.id = ep.user_id
       WHERE u.role = 'enterprise'
       ORDER BY u.is_verified DESC, u.rating DESC`
    );

    const COUNTRY_FLAGS = {
      'India': '🇮🇳',
      'UAE': '🇦🇪',
      'Saudi Arabia': '🇸🇦',
      'UK': '🇬🇧',
      'USA': '🇺🇸',
      'Vietnam': '🇻🇳',
      'Indonesia': '🇮🇩',
      'Canada': '🇨🇦',
      'Germany': '🇩🇪',
      'Bangladesh': '🇧🇩',
      'Japan': '🇯🇵',
      'South Korea': '🇰🇷',
      'China': '🇨🇳',
      'Qatar': '🇶🇦',
      'Sri Lanka': '🇱🇰',
      'Netherlands': '🇳🇱',
      'France': '🇫🇷',
    };

    const formatted = rows.map(e => {
      let countries = [];
      try {
        countries = typeof e.countries_exported_to === 'string'
          ? JSON.parse(e.countries_exported_to)
          : (e.countries_exported_to || []);
      } catch (err) {}

      const countryList = Array.isArray(countries) && countries.length > 0 ? countries : ['India', 'UAE'];
      const flags = countryList.map(c => COUNTRY_FLAGS[c] || '🌍').slice(0, 4);

      return {
        id: `e${e.id}`,
        dbId: e.id,
        name: e.company_name || e.name,
        type: e.business_type || 'Exporter',
        city: e.city || 'Gujarat',
        country: e.country || 'India',
        countries: countryList,
        flags: flags.length > 0 ? flags : ['🇮🇳', '🇦🇪'],
        crops: ['jeera', 'sesame'],
        minOrder: e.min_order_mt ? (String(e.min_order_mt).includes('MT') ? String(e.min_order_mt) : `${e.min_order_mt} MT`) : '5 MT',
        gst: e.gst_number || '',
        iec: e.iec_number || '',
        rating: Number(e.rating || 5.0),
        reviews: Number(e.reviews_count || 0),
        verified: Boolean(e.is_verified),
        logo: e.avatar || '🏢',
        since: '2024',
      };
    });

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// GET /api/auth/farmers (Public directory)
// -------------------------------------------------------------
router.get('/farmers', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.phone, u.avatar, u.is_verified, u.rating, u.reviews_count,
              fp.village, fp.district, fp.state, fp.land_size, fp.primary_crops
       FROM users u
       LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
       WHERE u.role = 'farmer'
       ORDER BY u.is_verified DESC, u.rating DESC`
    );

    const formatted = rows.map(f => {
      let crops = [];
      try {
        crops = typeof f.primary_crops === 'string'
          ? JSON.parse(f.primary_crops)
          : (f.primary_crops || []);
      } catch (err) {}

      return {
        id: `f${f.id}`,
        dbId: f.id,
        name: f.name,
        village: f.village || '',
        district: f.district || '',
        state: f.state || 'Gujarat',
        phone: f.phone,
        land: f.land_size ? `${f.land_size} bigha` : '',
        crops: Array.isArray(crops) ? crops : [],
        rating: Number(f.rating || 5.0),
        reviews: Number(f.reviews_count || 0),
        verified: Boolean(f.is_verified),
        avatar: f.avatar || '🧑‍🌾',
        since: '2024',
      };
    });

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// GET /api/auth/stats (Public platform statistics)
// -------------------------------------------------------------
router.get('/stats', async (req, res, next) => {
  try {
    const [[farmers]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'farmer'");
    const [[enterprises]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'enterprise'");
    const [[verifiedFarmers]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'farmer' AND is_verified = 1");
    const [[verifiedEnterprises]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'enterprise' AND is_verified = 1");
    const [[listings]] = await pool.query("SELECT COUNT(*) AS count FROM produce_listings WHERE status = 'active'");
    const [[deals]] = await pool.query("SELECT COUNT(*) AS count FROM deals WHERE status IN ('completed', 'deal_signed', 'quality_approved', 'in_transit')");

    res.json({
      success: true,
      data: {
        farmers: Number(farmers.count || 0),
        enterprises: Number(enterprises.count || 0),
        verifiedFarmers: Number(verifiedFarmers.count || 0),
        verifiedEnterprises: Number(verifiedEnterprises.count || 0),
        listings: Number(listings.count || 0),
        deals: Number(deals.count || 0),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
