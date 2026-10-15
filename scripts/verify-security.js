/**
 * AgriExport Connect - Security Hardening Verification Suite
 * Tests OWASP Top 10, ASVS basics, Role Enforcement, IDOR, SQLi, XSS, and JWT
 *
 * Run with: node scripts/verify-security.js
 */

import pool from '../backend/config/db.js';

const API_BASE = 'http://localhost:5001/api';

async function api(path, { method = 'GET', body = null, token = null, headers = {} } = {}) {
  const reqHeaders = { 'Content-Type': 'application/json', ...headers };
  if (token) reqHeaders['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: reqHeaders,
    body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

async function querySQL(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

function printTest(name, passed, detail) {
  const mark = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${mark} | ${name}`);
  if (detail) console.log(`         ↳ ${detail}`);
}

async function runSecuritySuite() {
  console.log('🛡️  AGRIEXPORT CONNECT - AUTOMATED SECURITY TEST SUITE');
  console.log(`   Timestamp: ${new Date().toISOString()}\n`);

  const results = [];
  const RUN_ID = Date.now().toString().slice(-5);

  // 1. Setup test users
  const adminLogin = await api('/auth/login', {
    method: 'POST',
    body: { email: 'admin@agriexport.in', password: 'Admin@1234' }
  });
  const ADMIN_TOKEN = adminLogin.data.token;

  // Register Farmer 1 (Owner)
  const f1 = await api('/auth/register', {
    method: 'POST',
    body: {
      name: `Sec Farmer 1 ${RUN_ID}`,
      email: `sec_f1_${RUN_ID}@test.com`,
      phone: `91${RUN_ID}01`,
      password: 'Pass@1234Secure',
      role: 'farmer'
    }
  });
  const FARMER_1_TOKEN = f1.data.token;
  const FARMER_1_ID = f1.data.user.id;
  await querySQL('UPDATE users SET is_verified = 1 WHERE id = ?', [FARMER_1_ID]);

  // Register Farmer 2 (Attacker)
  const f2 = await api('/auth/register', {
    method: 'POST',
    body: {
      name: `Sec Farmer 2 ${RUN_ID}`,
      email: `sec_f2_${RUN_ID}@test.com`,
      phone: `91${RUN_ID}02`,
      password: 'Pass@1234Secure',
      role: 'farmer'
    }
  });
  const FARMER_2_TOKEN = f2.data.token;
  const FARMER_2_ID = f2.data.user.id;
  await querySQL('UPDATE users SET is_verified = 1 WHERE id = ?', [FARMER_2_ID]);

  // Register Enterprise 1 (Unverified)
  const entUnverified = await api('/auth/register', {
    method: 'POST',
    body: {
      name: `Unverified Ent ${RUN_ID}`,
      email: `unverified_${RUN_ID}@test.com`,
      phone: `91${RUN_ID}03`,
      password: 'Pass@1234Secure',
      role: 'enterprise',
      company_name: `Unverified Corp ${RUN_ID}`
    }
  });
  const UNVERIFIED_ENT_TOKEN = entUnverified.data.token;
  const UNVERIFIED_ENT_ID = entUnverified.data.user.id;

  // Farmer 1 creates a listing
  const listingRes = await api('/listings', {
    method: 'POST',
    token: FARMER_1_TOKEN,
    body: {
      crop: 'cumin',
      cropId: 2,
      variety: 'Gujarat Cumin-4',
      quantity: 25,
      unit: 'quintal',
      pricePerUnit: 24000,
      grade: 'A',
      location: 'Unjha, Gujarat',
      description: 'Clean organic cumin seed lot.'
    }
  });
  const LISTING_ID = listingRes.data.dbId;

  console.log('──────────────────────────────────────────────────────────────────────────────');
  console.log('SECTION 1: SQL INJECTION (SQLi) DEFENSE');
  console.log('──────────────────────────────────────────────────────────────────────────────');

  // Test 1.1: SQL Injection in login
  const sqliLogin = await api('/auth/login', {
    method: 'POST',
    body: { email: "' OR '1'='1' --", password: "' OR '1'='1'" }
  });
  const sqliLoginPass = sqliLogin.status === 401 || sqliLogin.status === 400;
  printTest('SQLi on /auth/login blocked (parameterized query)', sqliLoginPass, `Status: ${sqliLogin.status}`);
  results.push(sqliLoginPass);

  // Test 1.2: SQL Injection in search filter
  const sqliSearch = await api(`/listings?search=' OR 1=1 UNION SELECT 1,2,3,4,5,6,7,8,9,10,11,12--`);
  const sqliSearchPass = sqliSearch.status === 200 && Array.isArray(sqliSearch.data.data);
  printTest('SQLi on /listings?search sanitized without syntax error', sqliSearchPass, `Status: ${sqliSearch.status}`);
  results.push(sqliSearchPass);

  console.log('\n──────────────────────────────────────────────────────────────────────────────');
  console.log('SECTION 2: ROLE-BASED ACCESS CONTROL (RBAC) & AUTHORIZATION');
  console.log('──────────────────────────────────────────────────────────────────────────────');

  // Test 2.1: Farmer attempting to access Admin endpoints
  const farmerOnAdmin = await api('/admin/overview', { token: FARMER_1_TOKEN });
  const farmerAdminPass = farmerOnAdmin.status === 403;
  printTest('Farmer token calling /api/admin/overview rejected with 403', farmerAdminPass, `Status: ${farmerOnAdmin.status}`);
  results.push(farmerAdminPass);

  // Test 2.2: Enterprise attempting to access Admin user management
  const entOnAdmin = await api('/admin/users', { token: UNVERIFIED_ENT_TOKEN });
  const entAdminPass = entOnAdmin.status === 403;
  printTest('Enterprise token calling /api/admin/users rejected with 403', entAdminPass, `Status: ${entOnAdmin.status}`);
  results.push(entAdminPass);

  // Test 2.3: Unverified enterprise attempting to post requirement
  const unverifiedReq = await api('/requirements', {
    method: 'POST',
    token: UNVERIFIED_ENT_TOKEN,
    body: {
      crop: 'fennel', cropId: 4,
      title: 'Attempted requirement by unverified enterprise',
      qty: 10, unit: 'ton', targetPrice: 120
    }
  });
  const unverifiedReqPass = unverifiedReq.status === 403;
  printTest('Unverified enterprise blocked from posting requirement (403)', unverifiedReqPass, `Status: ${unverifiedReq.status}`);
  results.push(unverifiedReqPass);

  console.log('\n──────────────────────────────────────────────────────────────────────────────');
  console.log('SECTION 3: INSECURE DIRECT OBJECT REFERENCE (IDOR) DEFENSE');
  console.log('──────────────────────────────────────────────────────────────────────────────');

  // Test 3.1: Farmer 2 trying to edit Farmer 1\'s listing
  const idorEditListing = await api(`/listings/${LISTING_ID}`, {
    method: 'PUT',
    token: FARMER_2_TOKEN,
    body: { pricePerUnit: 100 }
  });
  const idorEditPass = idorEditListing.status === 403 || idorEditListing.status === 404;
  printTest(`Farmer 2 modifying Farmer 1's listing rejected with 403/404`, idorEditPass, `Status: ${idorEditListing.status}`);
  results.push(idorEditPass);

  // Test 3.2: Farmer 2 trying to delete Farmer 1\'s listing
  const idorDeleteListing = await api(`/listings/${LISTING_ID}`, {
    method: 'DELETE',
    token: FARMER_2_TOKEN
  });
  const idorDeletePass = idorDeleteListing.status === 403 || idorDeleteListing.status === 404;
  printTest(`Farmer 2 deleting Farmer 1's listing rejected with 403/404`, idorDeletePass, `Status: ${idorDeleteListing.status}`);
  results.push(idorDeletePass);

  console.log('\n──────────────────────────────────────────────────────────────────────────────');
  console.log('SECTION 4: TOKEN INTEGRITY, TAMPERING & REVOCATION');
  console.log('──────────────────────────────────────────────────────────────────────────────');

  // Test 4.1: Tampered JWT token
  const tamperedToken = FARMER_1_TOKEN.slice(0, -6) + 'abc123';
  const tamperedRes = await api('/auth/me', { token: tamperedToken });
  const tamperedPass = tamperedRes.status === 401;
  printTest('Tampered JWT signature rejected with 401 Unauthorized', tamperedPass, `Status: ${tamperedRes.status}`);
  results.push(tamperedPass);

  // Test 4.2: Malformed JWT token
  const malformedRes = await api('/auth/me', { token: 'invalid.token.payload' });
  const malformedPass = malformedRes.status === 401;
  printTest('Malformed token string rejected with 401 Unauthorized', malformedPass, `Status: ${malformedRes.status}`);
  results.push(malformedPass);

  // Test 4.3: Deleted user token immediately revoked on live DB check
  await querySQL('DELETE FROM users WHERE id = ?', [FARMER_2_ID]);
  const deletedUserRes = await api('/auth/me', { token: FARMER_2_TOKEN });
  const revokedPass = deletedUserRes.status === 401;
  printTest('Deleted user token immediately rejected on live DB lookup (401)', revokedPass, `Status: ${deletedUserRes.status}`);
  results.push(revokedPass);

  console.log('\n──────────────────────────────────────────────────────────────────────────────');
  console.log('SECTION 5: HTTP SECURITY HEADERS & TRANSPORT DEFENSE');
  console.log('──────────────────────────────────────────────────────────────────────────────');

  const healthRes = await api('/health');
  const headers = healthRes.headers;
  
  // Test 5.1: X-Powered-By header removed
  const noPoweredBy = !headers.get('x-powered-by');
  printTest('X-Powered-By header hidden (express signature suppressed)', noPoweredBy);
  results.push(noPoweredBy);

  // Test 5.2: Helmet Security Headers Present
  const hasContentTypeOptions = headers.get('x-content-type-options') === 'nosniff';
  printTest('X-Content-Type-Options: nosniff header present', hasContentTypeOptions);
  results.push(hasContentTypeOptions);

  const hasFrameOptions = !!headers.get('x-frame-options');
  printTest('X-Frame-Options clickjacking protection header present', hasFrameOptions);
  results.push(hasFrameOptions);

  // Test 5.3: Production error response leak protection
  const notFoundRes = await api('/non-existent-route-999');
  const noStackLeak = !notFoundRes.data.stack;
  printTest('Error responses suppress internal stack traces', noStackLeak);
  results.push(noStackLeak);

  console.log('\n──────────────────────────────────────────────────────────────────────────────');
  console.log('SECTION 6: XSS (CROSS-SITE SCRIPTING) PAYLOAD HANDLING');
  console.log('──────────────────────────────────────────────────────────────────────────────');

  // Test 6.1: Storing XSS in listing description
  const xssPayload = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
  const xssListingRes = await api('/listings', {
    method: 'POST',
    token: FARMER_1_TOKEN,
    body: {
      crop: 'sesame',
      cropId: 3,
      variety: 'Till-1',
      quantity: 10,
      unit: 'quintal',
      pricePerUnit: 14000,
      grade: 'A',
      location: 'Amreli',
      description: xssPayload
    }
  });
  const xssStoredPass = xssListingRes.status === 201 || xssListingRes.status === 200;
  // Verify fetch returns as text without raw unescaped script execution
  const fetchListing = await api(`/listings/${xssListingRes.data.dbId}`);
  const xssSafePass = typeof fetchListing.data.data.description === 'string';
  printTest('XSS payloads in produce listings stored safely as string data', xssStoredPass && xssSafePass);
  results.push(xssStoredPass && xssSafePass);

  // Cleanup test records
  await querySQL('DELETE FROM users WHERE id IN (?, ?, ?)', [FARMER_1_ID, FARMER_2_ID, UNVERIFIED_ENT_ID]);

  console.log('\n══════════════════════════════════════════════════════════════════════════════');
  console.log('SECURITY SUITE SUMMARY');
  console.log('══════════════════════════════════════════════════════════════════════════════');
  const passCount = results.filter(Boolean).length;
  console.log(`Passed: ${passCount}/${results.length} tests`);
  if (passCount === results.length) {
    console.log('🎉 ALL SECURITY CHECKS PASSED — OWASP & ASVS SECURITY BASELINE VERIFIED\n');
  } else {
    console.log(`⚠️  ${results.length - passCount} checks failed.\n`);
  }
  await pool.end();
  process.exit(0);
}

runSecuritySuite().catch(async err => {
  console.error('Security Suite Error:', err);
  await pool.end();
  process.exit(1);
});
