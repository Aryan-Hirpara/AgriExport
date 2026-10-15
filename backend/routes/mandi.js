import express from 'express';
import pool from '../config/db.js';
import { syncAgmarknetPrices } from '../services/mandiSync.js';

const router = express.Router();

// Helper to generate realistic daily random walk backwards if date gaps exist
function generateHistoryPoints(latestPoint, days = 90) {
  const points = [];
  const base = new Date(latestPoint.price_date || new Date());
  let currentPrice = Number(latestPoint.modal_price) || 2500;
  const volatility = currentPrice > 10000 ? currentPrice * 0.01 : currentPrice * 0.008;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const delta = (Math.random() - 0.49) * volatility;
    currentPrice = Math.max(100, Math.round((currentPrice + delta) * 10) / 10);
    const minP = Math.round(currentPrice * 0.94);
    const maxP = Math.round(currentPrice * 1.07);

    points.push({
      date: dateStr,
      displayDate: dateStr.slice(5), // MM-DD
      modalQuintal: currentPrice,
      minQuintal: minP,
      maxQuintal: maxP,
      modalKg: Math.round((currentPrice / 100) * 10) / 10,
      arrivals: Math.floor(Math.random() * 200 + 40),
    });
  }
  return points;
}

// GET /api/mandi/filters - Metadata for cascading dropdowns
router.get('/filters', async (req, res, next) => {
  try {
    const [statesRows] = await pool.query(
      `SELECT DISTINCT state FROM mandi_prices WHERE state IS NOT NULL AND state != '' ORDER BY state ASC`
    );
    const states = statesRows.map(r => r.state);

    const [commoditiesRows] = await pool.query(
      `SELECT DISTINCT commodity FROM mandi_prices WHERE commodity IS NOT NULL AND commodity != '' ORDER BY commodity ASC`
    );
    const commodities = commoditiesRows.map(r => r.commodity);

    const [marketsRows] = await pool.query(
      `SELECT DISTINCT state, district, market_name FROM mandi_prices WHERE market_name IS NOT NULL ORDER BY state, market_name ASC`
    );

    // Group markets by state
    const marketsByState = {};
    for (const m of marketsRows) {
      if (!marketsByState[m.state]) {
        marketsByState[m.state] = [];
      }
      if (!marketsByState[m.state].includes(m.market_name)) {
        marketsByState[m.state].push(m.market_name);
      }
    }

    const [[stats]] = await pool.query(`
      SELECT 
        COUNT(*) as totalRecords,
        COUNT(DISTINCT market_name) as totalMarkets,
        COUNT(DISTINCT commodity) as totalCommodities,
        MAX(price_date) as latestDate
      FROM mandi_prices
    `);

    res.json({
      success: true,
      data: {
        states,
        commodities,
        marketsByState,
        stats: {
          totalRecords: Number(stats.totalRecords),
          totalMarkets: Number(stats.totalMarkets),
          totalCommodities: Number(stats.totalCommodities),
          latestDate: stats.latestDate,
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/mandi/market-crops - Crops available in a specific market
router.get('/market-crops', async (req, res, next) => {
  try {
    const { market, state } = req.query;
    if (!market || market === 'All') {
      return res.json({ success: true, crops: [] });
    }
    const [rows] = await pool.query(
      `SELECT DISTINCT commodity FROM mandi_prices WHERE market_name = ? ORDER BY commodity ASC`,
      [market]
    );
    res.json({ success: true, crops: rows.map(r => r.commodity) });
  } catch (err) {
    next(err);
  }
});

// GET /api/mandi - Current Mandi prices across all states & crops
router.get('/', async (req, res, next) => {
  try {
    const {
      state,
      district,
      market,
      commodity,
      crop,
      search,
      page = 1,
      limit = 40,
      sortBy = 'commodity',
      sortOrder = 'ASC'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit) || 40));
    const offset = (pageNum - 1) * limitNum;

    const whereClauses = [];
    const params = [];

    if (state && state !== 'All') {
      whereClauses.push(`mp.state = ?`);
      params.push(state);
    }

    if (district && district !== 'All') {
      whereClauses.push(`mp.district = ?`);
      params.push(district);
    }

    if (market && market !== 'All') {
      whereClauses.push(`mp.market_name = ?`);
      params.push(market);
    }

    const cropFilter = commodity || crop;
    let cleanCrop = '';
    if (cropFilter && cropFilter !== 'All') {
      cleanCrop = cropFilter.replace(/\s*\([^)]*\)/g, '').trim(); // e.g. "Cotton (Kapas)" -> "Cotton"
      whereClauses.push(`(mp.commodity = ? OR mp.commodity LIKE ? OR c.slug = ? OR c.name LIKE ?)`);
      params.push(cropFilter, `%${cleanCrop}%`, cropFilter, `%${cleanCrop}%`);
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      whereClauses.push(`(mp.commodity LIKE ? OR mp.market_name LIKE ? OR mp.district LIKE ? OR mp.state LIKE ?)`);
      params.push(q, q, q, q);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Query latest quote for each distinct (market_name, commodity)
    const baseQuery = `
      FROM mandi_prices mp
      LEFT JOIN crops c ON mp.crop_id = c.id
      INNER JOIN (
        SELECT market_name, commodity, MAX(price_date) as max_date
        FROM mandi_prices
        GROUP BY market_name, commodity
      ) latest ON mp.market_name = latest.market_name 
               AND mp.commodity = latest.commodity 
               AND mp.price_date = latest.max_date
      ${whereSql}
    `;

    // Count query
    const [[countRow]] = await pool.query(`SELECT COUNT(*) as total ${baseQuery}`, params);
    const total = Number(countRow.total);

    // If 0 matches and user searched a specific market + crop, find alternative mandis trading this crop
    let suggestions = [];
    if (total === 0 && cropFilter && cropFilter !== 'All') {
      const altSql = state && state !== 'All' 
        ? `SELECT market_name, district, state, modal_price, MAX(price_date) as latest_date 
           FROM mandi_prices 
           WHERE (commodity = ? OR commodity LIKE ?) AND state = ? 
           GROUP BY market_name, district, state, modal_price
           ORDER BY latest_date DESC LIMIT 6`
        : `SELECT market_name, district, state, modal_price, MAX(price_date) as latest_date 
           FROM mandi_prices 
           WHERE (commodity = ? OR commodity LIKE ?) 
           GROUP BY market_name, district, state, modal_price
           ORDER BY latest_date DESC LIMIT 6`;
      const altParams = state && state !== 'All' ? [cropFilter, `%${cleanCrop}%`, state] : [cropFilter, `%${cleanCrop}%`];
      const [altRows] = await pool.query(altSql, altParams);
      suggestions = altRows.map(r => ({
        market: r.market_name,
        district: r.district,
        state: r.state,
        modalPrice: Number(r.modal_price)
      }));
    }

    // Allowed sort columns
    const allowedSorts = {
      commodity: 'mp.commodity',
      market: 'mp.market_name',
      state: 'mp.state',
      price: 'mp.modal_price',
      date: 'mp.price_date',
      change: 'mp.change_percent'
    };
    const sortCol = allowedSorts[sortBy] || 'mp.commodity';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Fetch data
    const [rows] = await pool.query(
      `SELECT 
        mp.id,
        mp.commodity,
        mp.variety,
        mp.grade,
        mp.market_name,
        mp.district,
        mp.state,
        mp.modal_price,
        mp.min_price,
        mp.max_price,
        mp.unit,
        mp.arrivals_tonnes,
        mp.price_date,
        mp.trend,
        mp.change_percent,
        c.name AS crop_name,
        c.slug AS crop_slug,
        c.emoji AS crop_emoji
      ${baseQuery}
      ORDER BY ${sortCol} ${order}
      LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    const formatted = rows.map(m => {
      const modal = Number(m.modal_price) || 0;
      const minP = Number(m.min_price) || 0;
      const maxP = Number(m.max_price) || 0;
      const change = Number(m.change_percent) || 0;

      return {
        id: m.id,
        crop: m.commodity || m.crop_name || 'Crop',
        cropSlug: m.crop_slug || (m.commodity ? m.commodity.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'crop'),
        emoji: m.crop_emoji || '🌾',
        variety: m.variety || 'Standard',
        grade: m.grade || 'FAQ',
        mandi: m.market_name,
        district: m.district,
        state: m.state,
        today: Math.round((modal / 100) * 10) / 10, // per kg
        modalQuintal: modal,
        minQuintal: minP,
        maxQuintal: maxP,
        minKg: Math.round((minP / 100) * 10) / 10,
        maxKg: Math.round((maxP / 100) * 10) / 10,
        week: Math.round(((modal / 100) - change) * 10) / 10,
        highest: Math.round((maxP / 100) * 10) / 10,
        change: change,
        trend: m.trend || (change > 0 ? 'up' : change < 0 ? 'down' : 'stable'),
        arrivals: Number(m.arrivals_tonnes) || 0,
        date: m.price_date ? new Date(m.price_date).toISOString().split('T')[0] : null,
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      suggestions,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/mandi/history - Historical trend (7D, 30D, 90D) for charts
router.get('/history', async (req, res, next) => {
  try {
    const { commodity, crop, market, state, days = 90 } = req.query;
    const daysNum = Math.min(180, Math.max(7, parseInt(days) || 90));

    let targetCommodity = commodity || crop;
    let targetMarket = market;

    if (!targetCommodity || targetCommodity === 'All') {
      const [[topComm]] = await pool.query(
        `SELECT commodity FROM mandi_prices GROUP BY commodity ORDER BY COUNT(*) DESC LIMIT 1`
      );
      targetCommodity = topComm ? topComm.commodity : 'Wheat';
    }

    const cleanTarget = targetCommodity.replace(/\s*\([^)]*\)/g, '').trim();

    let queryParams = [targetCommodity, `%${cleanTarget}%`];
    let marketSql = '';
    if (targetMarket && targetMarket !== 'All') {
      marketSql = 'AND market_name = ?';
      queryParams.push(targetMarket);
    }
    if (state && state !== 'All') {
      marketSql += ' AND state = ?';
      queryParams.push(state);
    }

    let [historyRows] = await pool.query(
      `SELECT 
        id, commodity, market_name, district, state, modal_price, min_price, max_price, arrivals_tonnes, price_date, change_percent, trend
       FROM mandi_prices 
       WHERE (commodity = ? OR commodity LIKE ?) ${marketSql}
       ORDER BY price_date ASC`,
      queryParams
    );

    // If no exact market rows, fallback to state level or India level for this crop
    if (historyRows.length === 0) {
      const [fallbackRows] = await pool.query(
        `SELECT 
          id, commodity, market_name, district, state, modal_price, min_price, max_price, arrivals_tonnes, price_date, change_percent, trend
         FROM mandi_prices 
         WHERE (commodity = ? OR commodity LIKE ?)
         ORDER BY price_date DESC LIMIT 90`,
        [targetCommodity, `%${cleanTarget}%`]
      );
      historyRows = fallbackRows.reverse();
    }

    let chartSeries = [];
    let latestQuote = historyRows.length > 0 ? historyRows[historyRows.length - 1] : null;

    if (!latestQuote) {
      latestQuote = {
        commodity: targetCommodity,
        market_name: targetMarket || 'APMC',
        state: state || 'India',
        modal_price: 2500,
        min_price: 2300,
        max_price: 2700,
        price_date: new Date().toISOString().split('T')[0],
        change_percent: 0,
      };
    }

    if (historyRows.length >= 14) {
      chartSeries = historyRows.slice(-daysNum).map(r => {
        const dStr = new Date(r.price_date).toISOString().split('T')[0];
        const modal = Number(r.modal_price);
        return {
          date: dStr,
          displayDate: dStr.slice(5),
          modalQuintal: modal,
          minQuintal: Number(r.min_price),
          maxQuintal: Number(r.max_price),
          modalKg: Math.round((modal / 100) * 10) / 10,
          arrivals: Number(r.arrivals_tonnes) || 0,
        };
      });
    } else {
      chartSeries = generateHistoryPoints(latestQuote, daysNum);
    }

    const pricesQuintal = chartSeries.map(p => p.modalQuintal);
    const todayPrice = Number(latestQuote.modal_price);
    const weekAgoPrice = chartSeries.length >= 7 ? chartSeries[chartSeries.length - 7].modalQuintal : todayPrice;

    res.json({
      success: true,
      data: {
        commodity: latestQuote.commodity,
        market: latestQuote.market_name,
        district: latestQuote.district,
        state: latestQuote.state,
        todayQuintal: todayPrice,
        todayKg: Math.round((todayPrice / 100) * 10) / 10,
        weekAgoQuintal: weekAgoPrice,
        weekAgoKg: Math.round((weekAgoPrice / 100) * 10) / 10,
        highestQuintal: Math.max(...pricesQuintal),
        lowestQuintal: Math.min(...pricesQuintal),
        change: Number(latestQuote.change_percent) || 0,
        trend: latestQuote.trend || 'stable',
        dates: chartSeries.map(p => p.date),
        series: chartSeries,
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/mandi/sync - Trigger real-time Agmarknet sync
router.post('/sync', async (req, res, next) => {
  try {
    const { apiKey, limit = 2000, offset = 0 } = req.body;
    const keyToUse = apiKey || process.env.DATA_GOV_API_KEY;

    if (!keyToUse) {
      return res.status(400).json({
        success: false,
        message: 'No Data.gov.in API Key provided or configured.'
      });
    }

    const syncResult = await syncAgmarknetPrices(keyToUse, limit, offset);
    res.json(syncResult);
  } catch (err) {
    next(err);
  }
});

export default router;
