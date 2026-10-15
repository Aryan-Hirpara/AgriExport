import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

const BASE_STEPS_EN = [
  { id: 1, title: 'Get IEC Code (DGFT)', desc: 'Import Export Code from DGFT online at dgft.gov.in. One-time registration, cost ~₹500. Mandatory for all exports.' },
  { id: 2, title: 'APEDA / SPICE BOARD Registration', desc: 'Register as an exporter at apeda.gov.in (horticulture/grain/spice). Required for horticultural and spice products.' },
  { id: 3, title: 'GST LUT Filing', desc: 'File Letter of Undertaking (LUT) for zero-rated export supply. Do this before shipment on the GST portal.' },
  { id: 4, title: 'Phytosanitary Certificate', desc: 'Apply at your State Agriculture Department. Valid 14 days. Required by all importing countries for plant produce.' },
  { id: 5, title: 'Quality / Lab Testing', desc: 'Get EIC (Export Inspection Council) or NABL-accredited lab test for parameters like moisture, purity, aflatoxin, MRL etc.' },
  { id: 6, title: 'Packing & Marking', desc: 'Pack as per importing country norms. Clearly mark country of origin, gross/net weight, exporter details.' },
  { id: 7, title: 'Shipping Bill on ICEGATE', desc: 'File your shipping bill online at icegate.gov.in via a licensed CHA (Customs House Agent). Nearest port: Mundra / JNPT.' },
  { id: 8, title: 'BRC / FIRC', desc: 'After payment received, get Bank Realisation Certificate (BRC) / FIRC from your bank and file with DGFT for export incentives.' },
];

// GET /api/guides
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT eg.*, c.name AS crop_name, c.slug AS crop_slug
       FROM export_guides eg
       LEFT JOIN crops c ON eg.crop_id = c.id
       ORDER BY eg.id ASC`
    );

    const formatted = rows.map(g => {
      let countries = [];
      let checklist = [];
      try { countries = typeof g.destination_countries === 'string' ? JSON.parse(g.destination_countries) : g.destination_countries; } catch (e) {}
      try { checklist = typeof g.document_checklist === 'string' ? JSON.parse(g.document_checklist) : g.document_checklist; } catch (e) {}

      return {
        id: g.id,
        slug: g.slug,
        title: g.title,
        crop: g.crop_name || g.category,
        cropId: g.crop_slug || 'all',
        country: (countries || []).join(' / ') || 'Global',
        category: g.category,
        summary: g.summary,
        certifications: checklist || [],
        tips: g.summary,
        steps: BASE_STEPS_EN,
      };
    });

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    next(err);
  }
});

// GET /api/guides/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT eg.*, c.name AS crop_name, c.slug AS crop_slug
       FROM export_guides eg
       LEFT JOIN crops c ON eg.crop_id = c.id
       WHERE eg.slug = ?`,
      [req.params.slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Export guide not found.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
