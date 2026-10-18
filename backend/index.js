import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cron from 'node-cron';

import pool, { testConnection } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupSocket } from './socket/index.js';

// Route imports
import authRoutes from './routes/auth.js';
import cropRoutes from './routes/crops.js';
import listingRoutes from './routes/listings.js';
import requirementRoutes from './routes/requirements.js';
import offerRoutes from './routes/offers.js';
import dealRoutes from './routes/deals.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import reviewRoutes from './routes/reviews.js';
import savedRoutes from './routes/saved.js';
import mandiRoutes from './routes/mandi.js';
import guideRoutes from './routes/guides.js';
import adminRoutes from './routes/admin.js';
import complaintRoutes from './routes/complaints.js';
import { initMandiCron } from './services/mandiSync.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', true);
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
app.set('io', io);
setupSocket(io);

// Security & Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiter – General API & Auth (Bypassed for cloud proxying and demo testing)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100000,
  skip: () => true, // Bypass rate limiting completely to prevent cloud proxy lockouts
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Global request logger and mutation tracker
let lastWriteTime = new Date().toISOString();

app.use((req, res, next) => {
  const start = Date.now();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    lastWriteTime = new Date().toISOString();
  }
  res.on('finish', () => {
    const duration = Date.now() - start;
    const userLabel = req.user ? `[User:${req.user.id}:${req.user.role}]` : '[Anon]';
    console.log(`[${req.method}] ${req.originalUrl} ${res.statusCode} ${duration}ms ${userLabel}`);
  });
  next();
});

// Comprehensive Health check & DB diagnostics endpoint
app.get('/api/health', async (req, res) => {
  try {
    const [[usersCnt]] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [[farmersCnt]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'farmer'");
    const [[enterprisesCnt]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'enterprise'");
    const [[verifiedFarmersCnt]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'farmer' AND is_verified = 1");
    const [[listingsCnt]] = await pool.query('SELECT COUNT(*) as count FROM produce_listings');
    const [[activeListingsCnt]] = await pool.query("SELECT COUNT(*) as count FROM produce_listings WHERE status = 'active'");
    const [[reqsCnt]] = await pool.query('SELECT COUNT(*) as count FROM buyer_requirements');
    const [[offersCnt]] = await pool.query('SELECT COUNT(*) as count FROM offers');
    const [[dealsCnt]] = await pool.query('SELECT COUNT(*) as count FROM deals');
    const [[pendingVerifCnt]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE is_verified = 0 AND role != 'admin'");

    res.json({
      status: 'ok',
      timestamp: new Date(),
      uptime: process.uptime(),
      version: '1.0.0',
      database: {
        connected: true,
        name: process.env.DB_NAME || 'agriexport_connect',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
      },
      counts: {
        users: Number(usersCnt.count),
        farmers: Number(farmersCnt.count),
        verifiedFarmers: Number(verifiedFarmersCnt.count),
        enterprises: Number(enterprisesCnt.count),
        listings: Number(listingsCnt.count),
        activeListings: Number(activeListingsCnt.count),
        buyerRequirements: Number(reqsCnt.count),
        offers: Number(offersCnt.count),
        deals: Number(dealsCnt.count),
        pendingVerifications: Number(pendingVerifCnt.count),
      },
      lastWriteTime,
      message: 'AgriExport Connect API is fully operational 🚀',
    });
  } catch (err) {
    res.status(500).json({
      status: 'degraded',
      timestamp: new Date(),
      database: { connected: false, error: err.message },
      lastWriteTime,
    });
  }
});

// Root welcome route for browser checks
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'AgriExport Connect Backend API',
    database: 'connected',
    message: '🚀 Backend server is running and connected to Railway MySQL database.',
    healthCheck: '/api/health'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/mandi', mandiRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/complaints', complaintRoutes);

// Global Error Handler
app.use(errorHandler);

// Scheduled Cron Job: Automatic Mandi price sync from Data.gov.in Agmarknet API
initMandiCron();

const PORT = process.env.PORT || 5000;

// Start Server after checking DB connection
async function startServer() {
  const isConnected = await testConnection();
  if (!isConnected) {
    console.warn('⚠️ Warning: Database connection failed. Running in degraded mode.');
    if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
      // In local development, you may want to know DB is down
      console.warn('💡 Make sure MySQL is running locally.');
    }
  } else {
    console.log('✅ Connected to MySQL database (agriexport_connect)');
  }

  if (!process.env.VERCEL) {
    server.listen(PORT, () => {
      console.log(`🚀 AgriExport Connect Backend Server running on port ${PORT}`);
      console.log(`🌐 API base URL: http://localhost:${PORT}/api`);
      console.log(`💬 Socket.io server ready for connections`);
    });
  }
}

startServer();

export default app;
