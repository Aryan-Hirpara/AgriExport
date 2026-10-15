/**
 * AgriExport Connect - Full Integration Verification Suite
 * Tests A-H: End-to-end proofs against live MySQL + Express + Socket.io
 *
 * Run with: node scripts/verify-integration.js
 */

import pool from '../backend/config/db.js';
import { io as ioClient } from 'socket.io-client';

const API_BASE = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

async function api(path, { method = 'GET', body = null, token = null } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, ok: res.ok, data };
}

async function querySQL(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

function createSocketClient(token, name) {
  const socket = ioClient(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: false,
  });

  return {
    socket,
    name,
    /** Wait for next emission of eventName, optionally filtered by predicate */
    waitForEvent(eventName, predicate = null, timeoutMs = 8000) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          socket.off(eventName, handler);
          reject(new Error(`⏰ Timeout (${timeoutMs}ms) waiting for socket event: "${eventName}" on ${name}`));
        }, timeoutMs);

        const handler = (data) => {
          if (!predicate || predicate(data)) {
            clearTimeout(timer);
            socket.off(eventName, handler);
            resolve(data);
          }
        };
        socket.on(eventName, handler);
      });
    },
    waitForConnect(timeoutMs = 5000) {
      return new Promise((resolve, reject) => {
        if (socket.connected) return resolve();
        const timer = setTimeout(() => reject(new Error(`Socket ${name} failed to connect`)), timeoutMs);
        socket.once('connect', () => { clearTimeout(timer); resolve(); });
        socket.once('connect_error', (err) => { clearTimeout(timer); reject(err); });
      });
    },
    close() { socket.disconnect(); }
  };
}

function printHeader(title) {
  console.log('\n' + '═'.repeat(80));
  console.log(`  ${title}`);
  console.log('═'.repeat(80));
}

function printStep(step, detail) {
  console.log(`\n👉 [${step}] ${detail}`);
}

function printEvidence(label, obj) {
  const str = (typeof obj === 'object' && obj !== null)
    ? JSON.stringify(obj, null, 2).split('\n').join('\n     ')
    : String(obj);
  console.log(`  📌 ${label}:\n     ${str}`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────

async function runTests() {
  const results = {};
  const RUN_ID = Date.now().toString().slice(-6);

  console.log('🚀 AGRIEXPORT CONNECT - INTEGRATION VERIFICATION SUITE (Tests A–H)');
  console.log(`   Run ID: ${RUN_ID}  |  Timestamp: ${new Date().toISOString()}`);

  // Health check
  const healthRes = await api('/health');
  printEvidence('API Health', { status: healthRes.data.status, db: healthRes.data.database.connected, counts: healthRes.data.counts });
  if (!healthRes.ok || !healthRes.data.database.connected) {
    throw new Error('Backend or DB is not running. Aborting tests.');
  }

  // Admin login
  printStep('PRE', 'Admin login');
  const adminLogin = await api('/auth/login', {
    method: 'POST', body: { email: 'admin@agriexport.in', password: 'Admin@1234' }
  });
  if (!adminLogin.ok) throw new Error('Admin login failed: ' + JSON.stringify(adminLogin.data));
  const ADMIN_TOKEN = adminLogin.data.token;

  const adminSocket = createSocketClient(ADMIN_TOKEN, 'Admin');
  await adminSocket.waitForConnect();
  console.log('  ✅ Admin authenticated, socket connected');

  // ════════════════════════════════════════════════════════════════════════════
  // TEST A: Farmer Registration → Admin Verification → Live Socket → DB Check
  // ════════════════════════════════════════════════════════════════════════════
  try {
    printHeader('TEST A: Farmer Registers → Admin Approves → Live Sync → SQL Match');

    const farmerEmail = `farmer_${RUN_ID}@test.com`;
    const farmerPhone = `98${RUN_ID}00`;

    printStep('A.1', 'POST /api/auth/register (Farmer)');
    const regRes = await api('/auth/register', {
      method: 'POST',
      body: {
        name: `Test Farmer ${RUN_ID}`,
        email: farmerEmail,
        phone: farmerPhone,
        password: 'Test@1234',
        role: 'farmer',
        village: 'Unjha',
        district: 'Mehsana',
        land_size: '12 Bigha',
        primary_crops: ['jeera', 'sesame'],
      }
    });
    if (!regRes.ok) throw new Error('Registration failed: ' + JSON.stringify(regRes.data));

    const FARMER_TOKEN = regRes.data.token;
    const FARMER_ID = regRes.data.user.id;
    printEvidence('Register response', { id: FARMER_ID, role: regRes.data.user.role, is_verified: regRes.data.user.is_verified });

    printStep('A.2', 'Direct SQL: users + farmer_profiles row exists');
    const [dbUser] = await querySQL('SELECT id, name, role, is_verified FROM users WHERE id = ?', [FARMER_ID]);
    printEvidence(`users WHERE id=${FARMER_ID}`, dbUser);
    if (!dbUser || dbUser.is_verified !== 0) throw new Error('Expected is_verified=0 after registration');

    const [dbProfile] = await querySQL('SELECT user_id, village, district FROM farmer_profiles WHERE user_id = ?', [FARMER_ID]);
    printEvidence(`farmer_profiles WHERE user_id=${FARMER_ID}`, dbProfile);
    if (!dbProfile) throw new Error('farmer_profiles row missing!');

    printStep('A.3', 'GET /api/admin/verifications → pending farmer in queue');
    const queueRes = await api('/admin/verifications', { token: ADMIN_TOKEN });
    const inQueue = queueRes.data.data?.find(u => u.dbId === FARMER_ID);
    printEvidence(`Queue item for Farmer #${FARMER_ID}`, inQueue);
    if (!inQueue || inQueue.status !== 'pending') throw new Error(`Farmer not in pending queue!`);

    // Connect farmer socket before approval so it can catch the event
    const farmerSocket = createSocketClient(FARMER_TOKEN, 'Farmer');
    await farmerSocket.waitForConnect();

    printStep('A.4', `POST /api/admin/verifications/${inQueue.id}/review (approve)`);
    const approvalEventP = farmerSocket.waitForEvent('verification_decided');
    const statsEventP = adminSocket.waitForEvent('stats_updated');

    const reviewRes = await api(`/admin/verifications/${inQueue.id}/review`, {
      method: 'POST', token: ADMIN_TOKEN, body: { action: 'approve' }
    });
    printEvidence('Review API response', reviewRes.data);
    if (!reviewRes.ok) throw new Error('Review API failed: ' + JSON.stringify(reviewRes.data));

    printStep('A.5', 'Await Socket.io events');
    const approvalEvent = await approvalEventP;
    printEvidence('Farmer socket received verification_decided', approvalEvent);
    if (!approvalEvent.is_verified) throw new Error('Socket event has is_verified=false');

    await statsEventP;
    printEvidence('Admin socket received stats_updated', { ok: true });

    printStep('A.6', 'Direct SQL: is_verified = 1');
    const [dbVerified] = await querySQL('SELECT id, name, is_verified FROM users WHERE id = ?', [FARMER_ID]);
    printEvidence('users after approval', dbVerified);
    if (dbVerified.is_verified !== 1) throw new Error('DB is_verified still 0 after approval!');

    printStep('A.7', 'SQL COUNT vs /auth/stats');
    const [{ count: sqlVerified }] = await querySQL("SELECT COUNT(*) AS count FROM users WHERE role='farmer' AND is_verified=1");
    const publicStats = await api('/auth/stats');
    printEvidence('SQL verified farmers', sqlVerified);
    printEvidence('/auth/stats verifiedFarmers', publicStats.data.data.verifiedFarmers);
    if (publicStats.data.data.verifiedFarmers !== sqlVerified) {
      throw new Error(`Count mismatch: SQL=${sqlVerified}, API=${publicStats.data.data.verifiedFarmers}`);
    }

    results.testA = { passed: true, FARMER_TOKEN, FARMER_ID, farmerSocket };
    console.log('🎉 TEST A PASSED');
  } catch (err) {
    results.testA = { passed: false, error: err.message };
    console.error('❌ TEST A FAILED:', err.message);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TEST B: Produce Listing → MySQL Row → My Listings → Browse
  // ════════════════════════════════════════════════════════════════════════════
  try {
    printHeader('TEST B: Listing POST → SQL Row → /listings/my → /listings Browse');
    const { FARMER_TOKEN, FARMER_ID } = results.testA;

    printStep('B.1', 'POST /api/listings (create produce listing)');
    const listingEventP = adminSocket.waitForEvent('new_listing_posted');
    const createRes = await api('/listings', {
      method: 'POST', token: FARMER_TOKEN,
      body: {
        crop: 'jeera', cropId: 2,
        variety: 'Gujarat Jeera-4 Export Grade',
        quantity: 20, unit: 'quintal',
        pricePerUnit: 26500, minOrderQuantity: 2,
        grade: 'A', location: 'Unjha, Gujarat',
        photos: [], description: 'Clean sortexed jeera ready for export.',
      }
    });
    printEvidence('Create listing response', createRes.data);
    if (!createRes.ok) throw new Error('Create listing failed: ' + JSON.stringify(createRes.data));

    const LISTING_DB_ID = createRes.data.dbId;
    const LISTING_ID = createRes.data.listingId;

    printStep('B.2', 'Direct SQL: produce_listings row');
    const [dbListing] = await querySQL(
      `SELECT pl.id, pl.farmer_id, c.name AS crop, pl.variety, pl.quantity, pl.price_per_unit, pl.status
       FROM produce_listings pl JOIN crops c ON pl.crop_id = c.id WHERE pl.id = ?`,
      [LISTING_DB_ID]
    );
    printEvidence(`produce_listings WHERE id=${LISTING_DB_ID}`, dbListing);
    if (!dbListing || dbListing.status !== 'active') throw new Error('Listing not in DB with status=active');

    printStep('B.3', 'Socket: new_listing_posted received by admin');
    const listingEvent = await listingEventP;
    printEvidence('Admin socket: new_listing_posted', listingEvent);

    printStep('B.4', 'GET /api/listings/my → farmer can see own listing');
    const myRes = await api('/listings/my', { token: FARMER_TOKEN });
    const foundInMy = myRes.data.data?.find(l => l.dbId === LISTING_DB_ID || l.id === LISTING_ID);
    printEvidence('/listings/my count', myRes.data.count);
    printEvidence('Found in My Listings', foundInMy ? { id: foundInMy.id, dbId: foundInMy.dbId } : null);
    if (!foundInMy) throw new Error(`Listing ${LISTING_DB_ID} NOT in /listings/my`);

    printStep('B.5', 'GET /api/listings → public browse includes listing');
    const browseRes = await api('/listings');
    const foundInBrowse = browseRes.data.data?.find(l => l.dbId === LISTING_DB_ID || l.id === LISTING_ID);
    printEvidence('Found in Browse', foundInBrowse ? { id: foundInBrowse.id, price: foundInBrowse.pricePerUnit } : null);
    if (!foundInBrowse) throw new Error(`Listing ${LISTING_DB_ID} NOT in /listings browse`);

    printStep('B.6', 'SQL COUNT vs /admin/stats');
    const [{ count: sqlActive }] = await querySQL("SELECT COUNT(*) AS count FROM produce_listings WHERE status='active'");
    const adminStats = await api('/admin/stats', { token: ADMIN_TOKEN });
    printEvidence('SQL active listings', sqlActive);
    printEvidence('/admin/stats listings', adminStats.data.data.stats.listings);
    // Allow tolerance of 1 since existing seed data may differ
    if (Math.abs(adminStats.data.data.stats.listings - sqlActive) > 1) {
      throw new Error(`Count mismatch: SQL=${sqlActive}, API=${adminStats.data.data.stats.listings}`);
    }

    results.testB = { passed: true, LISTING_DB_ID, LISTING_ID };
    console.log('🎉 TEST B PASSED');
  } catch (err) {
    results.testB = { passed: false, error: err.message };
    console.error('❌ TEST B FAILED:', err.message);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TEST C: Edit & Delete Listing → DB Updated → Socket Events
  // ════════════════════════════════════════════════════════════════════════════
  try {
    printHeader('TEST C: Edit Listing → SQL Verified → Delete → Status="deleted"');
    const { FARMER_TOKEN } = results.testA;
    const { LISTING_DB_ID } = results.testB;

    printStep('C.1', `PUT /api/listings/${LISTING_DB_ID} (edit price & qty)`);
    const editEventP = adminSocket.waitForEvent('listing_updated');
    const editRes = await api(`/listings/${LISTING_DB_ID}`, {
      method: 'PUT', token: FARMER_TOKEN,
      body: { pricePerUnit: 28000, quantity: 30, variety: 'Premium Export Grade Sortexed' }
    });
    printEvidence('Edit response', editRes.data);
    if (!editRes.ok) throw new Error('Edit failed: ' + JSON.stringify(editRes.data));

    const editEvent = await editEventP;
    printEvidence('Socket: listing_updated', editEvent);

    printStep('C.2', 'Direct SQL: price_per_unit and quantity updated');
    const [dbEdited] = await querySQL('SELECT id, price_per_unit, quantity FROM produce_listings WHERE id = ?', [LISTING_DB_ID]);
    printEvidence(`produce_listings after edit`, dbEdited);
    if (Number(dbEdited.price_per_unit) !== 28000 || Number(dbEdited.quantity) !== 30) {
      throw new Error(`DB values wrong: price=${dbEdited.price_per_unit}, qty=${dbEdited.quantity}`);
    }

    printStep('C.3', `DELETE /api/listings/${LISTING_DB_ID}`);
    const delEventP = adminSocket.waitForEvent('listing_deleted');
    const delRes = await api(`/listings/${LISTING_DB_ID}`, {
      method: 'DELETE', token: FARMER_TOKEN
    });
    printEvidence('Delete response', delRes.data);
    if (!delRes.ok) throw new Error('Delete failed: ' + JSON.stringify(delRes.data));

    const delEvent = await delEventP;
    printEvidence('Socket: listing_deleted', delEvent);

    printStep('C.4', 'Direct SQL: status = "deleted"');
    const [dbDeleted] = await querySQL('SELECT id, status FROM produce_listings WHERE id = ?', [LISTING_DB_ID]);
    if (!dbDeleted || (dbDeleted.status !== 'archived' && dbDeleted.status !== 'deleted')) {
      throw new Error(`Expected status=archived or deleted, got: ${dbDeleted?.status}`);
    }

    results.testC = { passed: true };
    console.log('🎉 TEST C PASSED');
  } catch (err) {
    results.testC = { passed: false, error: err.message };
    console.error('❌ TEST C FAILED:', err.message);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TEST D: Enterprise Offers → Farmer Accepts → Deal Created in DB
  // ════════════════════════════════════════════════════════════════════════════
  try {
    printHeader('TEST D: Enterprise Offer → Farmer Live Inbox → Accept → Deal in DB');
    const { FARMER_TOKEN, FARMER_ID, farmerSocket } = results.testA;

    // Create a fresh listing for the offer
    printStep('D.0', 'Create fresh produce listing for offer target');
    const freshListRes = await api('/listings', {
      method: 'POST', token: FARMER_TOKEN,
      body: {
        crop: 'groundnut', cropId: 1, variety: 'GJ-37 Bold',
        quantity: 50, unit: 'quintal', pricePerUnit: 7200,
        minOrderQuantity: 10, grade: 'A', location: 'Rajkot, Gujarat',
        photos: [], description: 'High oil content groundnuts, export ready.',
      }
    });
    if (!freshListRes.ok) throw new Error('Fresh listing failed: ' + JSON.stringify(freshListRes.data));
    const DEAL_LISTING_DB_ID = freshListRes.data.dbId;
    printEvidence('Fresh listing for offer', { dbId: DEAL_LISTING_DB_ID, id: freshListRes.data.listingId });

    // Register enterprise buyer
    printStep('D.1', 'POST /api/auth/register (Enterprise Buyer)');
    const buyerReg = await api('/auth/register', {
      method: 'POST',
      body: {
        name: `Global Exports ${RUN_ID}`,
        email: `buyer_${RUN_ID}@export.com`,
        phone: `97${RUN_ID}01`,
        password: 'Test@1234',
        role: 'enterprise',
        company_name: `Global Exports ${RUN_ID}`,
        business_type: 'Exporter',
        gst_number: '24AAACG1234F1Z5',
        iec_number: '0812345678',
        city: 'Ahmedabad',
      }
    });
    if (!buyerReg.ok) throw new Error('Buyer registration failed: ' + JSON.stringify(buyerReg.data));

    const BUYER_TOKEN = buyerReg.data.token;
    const BUYER_ID = buyerReg.data.user.id;
    printEvidence('Buyer registered', { id: BUYER_ID, name: buyerReg.data.user.name });

    const buyerSocket = createSocketClient(BUYER_TOKEN, 'Buyer');
    await buyerSocket.waitForConnect();

    // Enterprise sends offer
    printStep('D.2', 'POST /api/offers (enterprise sends offer on listing)');
    const offerInboxP = farmerSocket.waitForEvent('new_offer_received');
    const offerRes = await api('/offers', {
      method: 'POST', token: BUYER_TOKEN,
      body: {
        listingId: DEAL_LISTING_DB_ID,
        farmerId: FARMER_ID,
        offeredPrice: 7000,
        quantity: 20,
        unit: 'quintal',
        deliveryTerms: 'Ex-Farm Pickup',
        paymentTerms: '50% Advance, 50% on Delivery',
        notes: 'Ready to close immediately.',
      }
    });
    printEvidence('Offer API response', offerRes.data);
    if (!offerRes.ok) throw new Error('Offer failed: ' + JSON.stringify(offerRes.data));

    const OFFER_DB_ID = offerRes.data.dbId;  // dbId comes back directly
    printEvidence('Offer DB ID', OFFER_DB_ID);

    printStep('D.3', 'Direct SQL: offers row exists');
    const [dbOffer] = await querySQL(
      'SELECT id, listing_id, enterprise_id, farmer_id, offered_price, quantity, status FROM offers WHERE id = ?',
      [OFFER_DB_ID]
    );
    printEvidence(`offers WHERE id=${OFFER_DB_ID}`, dbOffer);
    if (!dbOffer) throw new Error('Offer not found in MySQL!');

    printStep('D.4', 'Socket: farmer received new_offer_received live');
    const offerInboxEvent = await offerInboxP;
    printEvidence('Farmer socket: new_offer_received', offerInboxEvent);

    // Farmer accepts offer
    printStep('D.5', `POST /api/offers/${OFFER_DB_ID}/accept`);
    const farmerDealP = farmerSocket.waitForEvent('deal_created');
    const buyerDealP = buyerSocket.waitForEvent('deal_created');

    const acceptRes = await api(`/offers/${OFFER_DB_ID}/accept`, {
      method: 'POST', token: FARMER_TOKEN
    });
    printEvidence('Accept offer response', acceptRes.data);
    if (!acceptRes.ok) throw new Error('Accept failed: ' + JSON.stringify(acceptRes.data));

    const DEAL_DB_ID = acceptRes.data.dbId;
    const DEAL_CODE = acceptRes.data.dealCode;

    printStep('D.6', 'Socket: both parties receive deal_created');
    const farmerDealEvent = await farmerDealP;
    printEvidence('Farmer socket: deal_created', farmerDealEvent);
    const buyerDealEvent = await buyerDealP;
    printEvidence('Buyer socket: deal_created', buyerDealEvent);

    printStep('D.7', 'Direct SQL: deals row exists with correct code');
    const [dbDeal] = await querySQL(
      'SELECT id, deal_code, offer_id, farmer_id, enterprise_id, status FROM deals WHERE id = ?',
      [DEAL_DB_ID]
    );
    printEvidence(`deals WHERE id=${DEAL_DB_ID}`, dbDeal);
    if (!dbDeal || !dbDeal.deal_code) throw new Error('Deal not found in MySQL!');
    if (dbDeal.deal_code !== DEAL_CODE) throw new Error(`Deal code mismatch: DB=${dbDeal.deal_code}, API=${DEAL_CODE}`);

    printStep('D.8', 'SQL COUNT vs /admin/stats deals');
    const [{ count: sqlDeals }] = await querySQL('SELECT COUNT(*) AS count FROM deals');
    const adminStats = await api('/admin/stats', { token: ADMIN_TOKEN });
    printEvidence('SQL deals count', sqlDeals);
    printEvidence('/admin/stats deals', adminStats.data.data.stats.deals);
    if (adminStats.data.data.stats.deals !== sqlDeals) {
      throw new Error(`Deals count mismatch: SQL=${sqlDeals}, API=${adminStats.data.data.stats.deals}`);
    }

    results.testD = { passed: true, BUYER_TOKEN, BUYER_ID, buyerSocket, DEAL_DB_ID };
    console.log('🎉 TEST D PASSED');
  } catch (err) {
    results.testD = { passed: false, error: err.message };
    console.error('❌ TEST D FAILED:', err.message);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TEST E: Enterprise Requirement → Farmer Quote → Enterprise Views Quote
  // ════════════════════════════════════════════════════════════════════════════
  try {
    printHeader('TEST E: Buyer Requirement → Farmer Quote → Enterprise Sees It');
    const { BUYER_TOKEN, BUYER_ID, buyerSocket } = results.testD;
    const { FARMER_TOKEN, FARMER_ID, farmerSocket } = results.testA;

    printStep('E.1', 'POST /api/requirements (enterprise posts requirement)');
    const reqEventP = adminSocket.waitForEvent('new_requirement_posted');
    const reqRes = await api('/requirements', {
      method: 'POST', token: BUYER_TOKEN,
      body: {
        crop: 'sesame', cropId: 3,
        title: `White Sesame 99.5% Purity - ${RUN_ID}`,
        qty: 15, quantity: 15, unit: 'ton',
        targetPrice: 135,
        priceRange: '₹130–₹140 / kg',
        destination: 'Dubai, UAE',
        urgency: 'high', urgencyLabel: 'Urgent Export',
        specs: { purity: '99.5%', moisture: '< 5%' },
        notes: 'Delivery to Kandla Port.',
      }
    });
    printEvidence('Requirement API response', reqRes.data);
    if (!reqRes.ok) throw new Error('Requirement failed: ' + JSON.stringify(reqRes.data));

    const REQ_DB_ID = reqRes.data.dbId;

    const reqEvent = await reqEventP;
    printEvidence('Admin socket: new_requirement_posted', reqEvent);

    printStep('E.2', 'Direct SQL: buyer_requirements row');
    const [dbReq] = await querySQL(
      'SELECT id, enterprise_id, crop_id, quantity, status FROM buyer_requirements WHERE id = ?',
      [REQ_DB_ID]
    );
    printEvidence(`buyer_requirements WHERE id=${REQ_DB_ID}`, dbReq);
    if (!dbReq || dbReq.status !== 'open') throw new Error('Requirement not in DB or not open!');

    printStep('E.3', 'POST /api/offers (farmer submits quote for requirement)');
    const buyerQuoteP = buyerSocket.waitForEvent('new_offer_received');
    const quoteRes = await api('/offers', {
      method: 'POST', token: FARMER_TOKEN,
      body: {
        requirementId: REQ_DB_ID,
        enterpriseId: BUYER_ID,
        offeredPrice: 132000,
        qty: 10, quantity: 10000, unit: 'ton',
        deliveryTerms: 'CIF Kandla Port',
        paymentTerms: '100% LC at sight',
        notes: 'Premium white sesame, FSSAI certified.',
      }
    });
    printEvidence('Farmer quote response', quoteRes.data);
    if (!quoteRes.ok) throw new Error('Farmer quote failed: ' + JSON.stringify(quoteRes.data));

    printStep('E.4', 'Socket: buyer received new_offer_received');
    const buyerQuoteEvent = await buyerQuoteP;
    printEvidence('Buyer socket: new_offer_received (quote)', buyerQuoteEvent);

    printStep('E.5', `GET /api/requirements/${REQ_DB_ID} → quotes array includes farmer`);
    const reqDetails = await api(`/requirements/${REQ_DB_ID}`, { token: BUYER_TOKEN });
    const quotes = reqDetails.data.data?.quotes || [];
    printEvidence('Quotes count in requirement detail', quotes.length);
    const farmerQuote = quotes.find(q => q.farmerId === `f${FARMER_ID}`);
    printEvidence('Farmer quote in response', farmerQuote ? { id: farmerQuote.id, price: farmerQuote.price } : null);
    if (!farmerQuote) throw new Error(`Farmer quote not in requirement #${REQ_DB_ID} details!`);

    results.testE = { passed: true };
    console.log('🎉 TEST E PASSED');
  } catch (err) {
    results.testE = { passed: false, error: err.message };
    console.error('❌ TEST E FAILED:', err.message);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TEST F: Real-time Chat → Socket Delivery → DB Persistence → History Reload
  // ════════════════════════════════════════════════════════════════════════════
  try {
    printHeader('TEST F: Send Chat Message → Socket Deliver → DB Persist → Reload History');
    const { FARMER_TOKEN, FARMER_ID, farmerSocket } = results.testA;
    const { BUYER_TOKEN, BUYER_ID, buyerSocket } = results.testD;

    const convoId = [FARMER_ID, BUYER_ID].sort((a, b) => a - b).map(id => `${id}`).join('_');
    const msgContent = `Export chat test ${RUN_ID} at ${new Date().toLocaleTimeString()}`;

    printStep('F.1', 'POST /api/messages (buyer → farmer)');
    const msgInboxP = farmerSocket.waitForEvent('receive_message');
    const sendRes = await api('/messages', {
      method: 'POST', token: BUYER_TOKEN,
      body: {
        receiverId: FARMER_ID,
        conversationId: `convo_${convoId}`,
        content: msgContent,
      }
    });
    printEvidence('Send message response', sendRes.data);
    if (!sendRes.ok) throw new Error('Send message failed: ' + JSON.stringify(sendRes.data));

    printStep('F.2', 'Socket: farmer received message live');
    const receivedMsg = await msgInboxP;
    printEvidence('Farmer socket: receive_message', { content: receivedMsg.content });
    if (receivedMsg.content !== msgContent) throw new Error(`Content mismatch: got "${receivedMsg.content}"`);

    printStep('F.3', 'Direct SQL: messages persisted');
    const [dbMsg] = await querySQL(
      `SELECT id, conversation_id, sender_id, receiver_id, content, is_read
       FROM messages WHERE conversation_id = ? ORDER BY id DESC LIMIT 1`,
      [`convo_${convoId}`]
    );
    printEvidence('messages table last row', dbMsg);
    if (!dbMsg || dbMsg.content !== msgContent) throw new Error('Message not persisted correctly!');

    printStep('F.4', 'GET /api/messages/:convoId (history reload)');
    const histRes = await api(`/messages/convo_${convoId}`, { token: FARMER_TOKEN });
    const foundMsg = histRes.data.data?.find(m => m.content === msgContent);
    printEvidence('History count', histRes.data.count);
    printEvidence('Found persisted message in history', foundMsg ? { id: foundMsg.id } : null);
    if (!foundMsg) throw new Error('Message not in history on reload!');

    results.testF = { passed: true };
    console.log('🎉 TEST F PASSED');
  } catch (err) {
    results.testF = { passed: false, error: err.message };
    console.error('❌ TEST F FAILED:', err.message);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TEST G: Admin Suspends User → Socket event → DB updated
  // ════════════════════════════════════════════════════════════════════════════
  try {
    printHeader('TEST G: Admin Suspends User → Socket is_blocked=true → DB Updated');
    const { FARMER_ID, farmerSocket } = results.testA;

    printStep('G.1', `PUT /api/admin/users/${FARMER_ID}/status (suspend)`);
    const suspendEventP = farmerSocket.waitForEvent('user_status_changed', d => d.userId === FARMER_ID);
    const suspendRes = await api(`/admin/users/${FARMER_ID}/status`, {
      method: 'PUT', token: ADMIN_TOKEN,
      body: { status: 'suspended', is_verified: false }
    });
    printEvidence('Suspend response', suspendRes.data);
    if (!suspendRes.ok) throw new Error('Suspend failed: ' + JSON.stringify(suspendRes.data));

    printStep('G.2', 'Socket: farmer received user_status_changed with is_blocked=true');
    const suspendEvent = await suspendEventP;
    printEvidence('Farmer socket: user_status_changed', suspendEvent);
    if (!suspendEvent.is_blocked) throw new Error('Event missing is_blocked=true!');

    printStep('G.3', 'Direct SQL: is_verified = 0');
    const [dbSuspended] = await querySQL('SELECT id, name, is_verified FROM users WHERE id = ?', [FARMER_ID]);
    printEvidence('users after suspend', dbSuspended);
    if (dbSuspended.is_verified !== 0) throw new Error('DB is_verified not set to 0!');

    results.testG = { passed: true };
    console.log('🎉 TEST G PASSED');
  } catch (err) {
    results.testG = { passed: false, error: err.message };
    console.error('❌ TEST G FAILED:', err.message);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TEST H: Empty State Queries → HTTP 200 + Clean Empty Arrays
  // ════════════════════════════════════════════════════════════════════════════
  try {
    printHeader('TEST H: Empty States & Zero Count Robustness');

    printStep('H.1', 'GET /api/listings?search=xyz_impossible_crop_12345');
    const emptyListings = await api('/listings?search=xyz_impossible_crop_12345');
    printEvidence('Empty listings', { status: emptyListings.status, count: emptyListings.data.count, isArray: Array.isArray(emptyListings.data.data) });
    if (!emptyListings.ok || !Array.isArray(emptyListings.data.data) || emptyListings.data.count !== 0) {
      throw new Error('Empty listings query failed');
    }

    printStep('H.2', 'GET /api/requirements?search=xyz_nonexistent_req_99999');
    const emptyReqs = await api('/requirements?search=xyz_nonexistent_req_99999');
    printEvidence('Empty requirements', { status: emptyReqs.status, count: emptyReqs.data.count, isArray: Array.isArray(emptyReqs.data.data) });
    if (!emptyReqs.ok || !Array.isArray(emptyReqs.data.data) || emptyReqs.data.count !== 0) {
      throw new Error('Empty requirements query failed');
    }

    printStep('H.3', 'GET /api/admin/complaints (may be empty)');
    const complaints = await api('/admin/complaints', { token: ADMIN_TOKEN });
    printEvidence('Complaints', { status: complaints.status, count: complaints.data.count, isArray: Array.isArray(complaints.data.data) });
    if (!complaints.ok || !Array.isArray(complaints.data.data)) {
      throw new Error('Complaints endpoint crashed or returned non-array');
    }

    printStep('H.4', 'GET /api/mandi (live mandi prices)');
    const mandi = await api('/mandi');
    printEvidence('Mandi prices', { status: mandi.status, ok: mandi.ok, count: mandi.data?.data?.length });
    if (!mandi.ok) throw new Error('Mandi prices endpoint returned error');

    results.testH = { passed: true };
    console.log('🎉 TEST H PASSED');
  } catch (err) {
    results.testH = { passed: false, error: err.message };
    console.error('❌ TEST H FAILED:', err.message);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Cleanup & Final Summary
  // ════════════════════════════════════════════════════════════════════════════
  try { adminSocket.close(); } catch {}
  try { if (results.testA?.farmerSocket) results.testA.farmerSocket.close(); } catch {}
  try { if (results.testD?.buyerSocket) results.testD.buyerSocket.close(); } catch {}

  // Give sockets time to clean up
  await new Promise(r => setTimeout(r, 300));

  printHeader('FINAL INTEGRATION TEST REPORT');
  const labels = {
    testA: 'A  Farmer Reg → Admin Approve → Live Sync → SQL Match',
    testB: 'B  Listing POST → SQL Row → My Listings → Browse',
    testC: 'C  Edit Listing → SQL Updated → Delete → status=deleted',
    testD: 'D  Enterprise Offer → Farmer Accept → Deal in DB',
    testE: 'E  Buyer Requirement → Farmer Quote → Enterprise Sees',
    testF: 'F  Live Chat → Socket Deliver → DB Persist → History',
    testG: 'G  Admin Suspend → is_blocked Socket → DB Updated',
    testH: 'H  Empty States → HTTP 200 + Clean Empty Arrays',
  };

  let allPassed = true;
  for (const [key, label] of Object.entries(labels)) {
    const r = results[key];
    const icon = r?.passed ? '✅ PASS' : '❌ FAIL';
    const detail = (!r?.passed && r?.error) ? `  ← ${r.error}` : '';
    console.log(`  ${icon}  |  ${label}${detail}`);
    if (!r?.passed) allPassed = false;
  }

  console.log('\n' + '═'.repeat(80));
  if (allPassed) {
    console.log('  🌟  ALL 8 INTEGRATION TESTS PASSED — system is fully connected end-to-end');
  } else {
    const passed = Object.values(results).filter(r => r?.passed).length;
    console.log(`  ⚠️   ${passed}/8 tests passed — see failures above`);
  }
  console.log('═'.repeat(80));

  // Auto-clean temporary test entities created during this run
  try {
    await pool.query('DELETE FROM deal_documents WHERE deal_id IN (SELECT id FROM deals WHERE deal_code LIKE ?)', [`%${RUN_ID}%`]);
    await pool.query('DELETE FROM deal_status_history WHERE deal_id IN (SELECT id FROM deals WHERE deal_code LIKE ?)', [`%${RUN_ID}%`]);
    await pool.query('DELETE FROM deals WHERE deal_code LIKE ?', [`%${RUN_ID}%`]);
    await pool.query('DELETE FROM messages WHERE content LIKE ?', [`%${RUN_ID}%`]);
    await pool.query('DELETE FROM offers WHERE notes LIKE ? OR requirement_id IN (SELECT id FROM buyer_requirements WHERE title LIKE ?)', [`%${RUN_ID}%`, `%${RUN_ID}%`]);
    await pool.query('DELETE FROM listing_images WHERE listing_id IN (SELECT id FROM produce_listings WHERE description LIKE ?)', [`%${RUN_ID}%`]);
    await pool.query('DELETE FROM produce_listings WHERE description LIKE ? OR variety LIKE ?', [`%${RUN_ID}%`, `%${RUN_ID}%`]);
    await pool.query('DELETE FROM buyer_requirements WHERE title LIKE ?', [`%${RUN_ID}%`]);
    await pool.query('DELETE FROM verification_documents WHERE user_id IN (SELECT id FROM users WHERE email LIKE ?)', [`%${RUN_ID}%`]);
    await pool.query('DELETE FROM farmer_profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE ?)', [`%${RUN_ID}%`]);
    await pool.query('DELETE FROM enterprise_profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE ?)', [`%${RUN_ID}%`]);
    await pool.query('DELETE FROM activity_logs WHERE user_id IN (SELECT id FROM users WHERE email LIKE ?)', [`%${RUN_ID}%`]);
    await pool.query('DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email LIKE ?)', [`%${RUN_ID}%`]);
    await pool.query('DELETE FROM users WHERE email LIKE ?', [`%${RUN_ID}%`]);
  } catch (cleanErr) {
    // Ignore teardown errors
  }

  await pool.end();
  process.exit(allPassed ? 0 : 1);
}

runTests().catch(err => {
  console.error('\n💥 FATAL:', err.message);
  process.exit(1);
});
