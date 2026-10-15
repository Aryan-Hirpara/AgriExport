# AgriExport Connect – Comprehensive Architecture & System Audit (Phase 1)
**Date:** October 2026  
**Auditor:** Antigravity Agent  
**Repository:** `assignment-fsd` (React + Vite + Tailwind, Node.js + Express, MySQL 8, Socket.io)

---

## 1. Inventory of Fake, Hard-Coded Data & Mock Logic

### 1.1 `setTimeout`-Based Delays & Simulated Asynchronous Operations
| File Path | Line Numbers | Description of Mock Behavior |
|:---|:---|:---|
| `src/pages/public/About.jsx` | L11–L14 | Contact form submission triggers a fake `setTimeout(..., 1500)` that simulates sending a message and displays a success state without calling any backend endpoint. |
| `src/pages/farmer/AddProduce.jsx` | L70–L75 | Produce publish action uses `setTimeout(..., 1000)` around state mutation instead of awaiting real API response. |
| `src/pages/farmer/AddProduce.jsx` | L77–L79 | GPS Detection button uses `setTimeout(..., 800)` to inject hardcoded `{ village: 'Unjha', district: 'Mehsana', state: 'Gujarat' }` instead of real browser Geolocation API. |
| `src/pages/farmer/FindBuyers.jsx` | L81–L99 | Sending quote triggers `setTimeout(..., 500)` around quote submission instead of handling async promise directly. |
| `src/pages/farmer/SendQuote.jsx` | L56–L78 | Chained fake timeouts (`setTimeout(..., 1200)` and `setTimeout(..., 1400)`) before navigating and showing toast. |
| `src/pages/enterprise/SendOffer.jsx` | L103–L110 | Chained fake timeouts (`setTimeout(..., 1200)` and `setTimeout(..., 1500)`) on offer submission. |
| `src/pages/public/Login.jsx` | L54–L65 | Graceful demo fallback catches server failure and uses `setTimeout(..., 500)` to log user in with mock in-memory profile. |
| `src/pages/public/MandiPrices.jsx` | L26 | Artificial 300ms chart mount delay (`setTimeout(() => setChartVisible(true), 300)`). |
| `server/routes/mandi.js` | L7–L14, L79–L82 | **Server-side synthetic price generation:** Backend generates 90-day price history via `randWalk()` using `Math.random()`, violating the requirement for genuine public market records. |
| `server/routes/offers.js` | L299 | Generates deal codes with `Math.random()` (`DEAL-2026-${Math.floor(1000 + Math.random() * 9000)}`) instead of deterministic database sequence. |

---

### 1.2 LocalStorage Reads and Writes
| File Path | Line Numbers | Current Use | Assessment |
|:---|:---|:---|:---|
| `src/services/api.js` | L10 | `localStorage.getItem('token')` | **Legitimate:** Used solely for JWT bearer authentication. |
| `src/services/socket.js` | L8 | `localStorage.getItem('token')` | **Legitimate:** Used for Socket.io handshake authentication. |
| `src/pages/public/Login.jsx` | L33 | `localStorage.setItem('token', res.token)` | **Legitimate:** Persists auth session. |
| `src/context/AppContext.jsx` | L52, L76, L85, L137 | `localStorage.getItem('token')` / `removeItem` | **Legitimate:** Manages session lifecycle on app load and logout. No application data is stored in `localStorage`. |

---

### 1.3 Hardcoded Fallback Objects, Static Arrays & Synthetic Data
| File Path | Line Numbers | Description |
|:---|:---|:---|
| `src/pages/public/Login.jsx` | L18–L22, L68–L72 | Hardcoded credentials for demo quick login: `ramesh@unjha.com`, `ahmed@spiceexports.in`, `admin@agriexport.in`. |
| `src/pages/public/ProduceDetail.jsx` | L65–L74 | Hardcoded fallback farmer object: `{ name: 'Gujarat Farmer', rating: 5.0, reviews: 0, verified: true }` when listing farmer is not populated. |
| `src/pages/public/MandiPrices.jsx` | L46–L54 | Hardcoded fallback crop details: `{ name: 'Jeera (Cumin)', today: 318, weekAgo: 312, highest90: 345, lowest90: 290, change: 6 }`. |
| `src/pages/farmer/FarmerHome.jsx` | L12 | Hardcoded fallback for top mandi price: `{ crop: 'Jeera', today: 318, change: 6 }`. |
| `src/pages/farmer/OffersInbox.jsx` | L83–L96 | Hardcoded fallback specs and requirement terms when resolving requirement details for an offer. |
| `src/pages/farmer/OffersInbox.jsx` | L36, L44, L60 | `handleAccept`, `handleDecline`, and `handleSendCounter` only call in-memory state mutators (`updateFarmerOffer`, `deleteFarmerOffer`) and **do not call backend API endpoints**. |
| `src/pages/enterprise/MyOffers.jsx` | L48–L54 | `handleAcceptCounter` only updates in-memory state; does not invoke `api.offers.accept()`. |
| `src/pages/enterprise/MyOffers.jsx` | L83–L94 | `resolveFarmer()` returns hardcoded dummy farmer (`rating: 4.9`, `reviews: 38`, `phone: '+91 98250 88771'`). |
| `src/pages/enterprise/MyRequirements.jsx` | L84–L97 | `handleDelete` and `toggleStatus` only update in-memory state; do not call backend `api.requirements.delete` or `update`. |
| `src/pages/enterprise/EnterpriseHome.jsx` | L8–L11 | Hardcoded static chart dataset: `MINI_CHART = [{ month: 'Jun', vol: 0 }, ...]`. |
| `src/pages/enterprise/EnterpriseHome.jsx` | L59 | Static verification banner displays "Enterprise Verified ✓" regardless of `user.is_verified`. |
| `src/pages/farmer/FindBuyers.jsx` | L193 | References `{ENTERPRISES.length}` which resolves to 0 or undefined rather than live enterprise count. |
| `src/data/sampleData.js` | L1–L20 | Retains empty exports; must be eliminated or consolidated cleanly into master config. |

---

### 1.4 Placeholder Texts, Phone Numbers & Test Names
| File Path | Line Numbers | Occurrence |
|:---|:---|:---|
| `src/pages/public/Register.jsx` | L201 | Placeholder company name: `"Ahmed Spice Exports Pvt Ltd"` |
| `src/pages/public/Register.jsx` | L266 | Fallback preview name: `form.name \|\| (role === 'farmer' ? 'Ramesh Patel' : 'Ahmed Spice Exports')` |
| `src/pages/farmer/AddProduce.jsx` | L27 | Hardcoded default location coordinates: `village: 'Unjha', district: 'Mehsana'` |
| `src/pages/farmer/SendQuote.jsx` | L31–L32 | Hardcoded default delivery & payment: `'Ex-Farm Pickup'`, `'30% Advance, 70% on weight slip'` |

---

## 2. UI Actions, Buttons & Form Integration Audit

### 2.1 Public Pages
| Page | UI Element / Form | Action | Current Status | Required Action in Phase 3 |
|:---|:---|:---|:---|:---|
| `Home.jsx` | "I'm a Farmer" / "I'm an Enterprise" | Navigates to `/register?role=...` | **Working** | Keep navigation. |
| `Home.jsx` | Live Stat Counters | Reads from `api.auth.getPlatformStats()` | **Working** | Verified real SQL count. |
| `Home.jsx` | Featured Produce Grid | Displays `produceListings.slice(0, 4)` | **Working** | Empty state active. |
| `Home.jsx` | Verified Exporters Grid | Displays `api.enterprises.getAll()` | **Working** | Empty state active. |
| `Login.jsx` | Sign In Form | Calls `api.auth.login()` | **Partial** | Remove demo fallback bypass; handle invalid credentials strictly. |
| `Register.jsx` | Multi-step Registration Form | Calls `api.auth.register()` | **Partial** | Stop suppressing errors; implement real Multer file upload for KYC docs. |
| `BrowseProduce.jsx` | Search, Filter Chips, Price Sort | Client-side array filtering | **Partial** | Shift filtering/sorting/pagination to server-side SQL query parameters. |
| `ProduceDetail.jsx` | "Send Offer" Button | Redirects to `/enterprise/send-offer/:id` | **Working** | Checks auth & role. |
| `Enterprises.jsx` | Search & Filter Exporters | Reads `api.enterprises.getAll()` | **Working** | Add bookmark/save button integration. |
| `MandiPrices.jsx` | 90-Day Price Trend Chart | Calls `api.mandi.getHistory()` | **Partial** | Replace backend `Math.random()` walk with real/seeded APMC records or empty state. |
| `MandiPrices.jsx` | Export Guide Checklist | Toggles local state | **Working** | Checklist state persisted or session-scoped. |
| `About.jsx` | Contact / Inquiry Form | `setTimeout` mock | **Missing** | Wire to complaints/inquiry backend endpoint or remove fake feedback loop. |

---

### 2.2 Farmer Portal
| Page | UI Element / Form | Action | Current Status | Required Action in Phase 3 |
|:---|:---|:---|:---|:---|
| `FarmerHome.jsx` | Quick Stats Cards | Computes from `useApp()` arrays | **Working** | Connect to real-time socket updates. |
| `AddProduce.jsx` | 6-Step Produce Upload Form | Calls `api.listings.create()` via `addProduceListing` | **Partial** | Remove `setTimeout`; upload real photos via Multer; validate attributes schema. |
| `AddProduce.jsx` | "Detect Location" Button | Fake `setTimeout` to Unjha | **Missing** | Implement `navigator.geolocation` or genuine district selector. |
| `MyListings.jsx` | Listings Tab (Active/Sold/Draft) | Filters all listings | **Bug** | Filter strictly by `l.farmer_id === user.id`. Currently shows all platform listings. |
| `MyListings.jsx` | "Edit Listing" Modal & Save | Calls `updateProduceListing` | **Working** | Syncs with `PUT /api/listings/:id`. |
| `MyListings.jsx` | "Delete Listing" Modal & Confirm | Calls `deleteProduceListing` | **Working** | Syncs with `DELETE /api/listings/:id`. |
| `FindBuyers.jsx` | Browse Buyer Demands | Reads `buyerRequirements` | **Working** | Paginate & filter via server SQL query. |
| `FindBuyers.jsx` | Quick "Send Quote" Modal | Calls `submitQuoteToRequirement` | **Partial** | Remove `setTimeout(..., 500)`; ensure database transaction creates offer. |
| `SendQuote.jsx` | Dedicated Quote Form | Calls `submitQuoteToRequirement` | **Partial** | Remove chained `setTimeout`; ensure quote writes to MySQL `offers`. |
| `OffersInbox.jsx` | Tab Selector (New, Countered, Accepted) | In-memory filter | **Working** | Reads from `api.offers.getFarmerOffers()`. |
| `OffersInbox.jsx` | "Accept Offer" Button | In-memory state mutation | **Critical Gap** | Must call `POST /api/offers/:id/accept` to execute SQL deal creation transaction. |
| `OffersInbox.jsx` | "Decline Offer" Button | In-memory deletion | **Critical Gap** | Must call `POST /api/offers/:id/reject`. |
| `OffersInbox.jsx` | "Send Counter" Modal | In-memory state update | **Critical Gap** | Must call `POST /api/offers/:id/counter`. |
| `FarmerProfile.jsx` | Edit Profile Fields & Save | Updates local state | **Partial** | Call `PUT /api/auth/profile` to persist farmer changes to MySQL. |
| `Chat.jsx` | Message Send Button | Calls `api.messages.sendMessage` | **Working** | Complete socket listener integration for instant incoming bubbles. |
| `Notifications.jsx` | "Mark All Read" Button | Calls `api.notifications.markAllRead` | **Working** | Updates MySQL `notifications.is_read = true`. |
| `Notifications.jsx` | Report Problem Form | Calls `api.complaints.create` | **Working** | Writes complaint to MySQL. |

---

### 2.3 Enterprise Portal
| Page | UI Element / Form | Action | Current Status | Required Action in Phase 3 |
|:---|:---|:---|:---|:---|
| `EnterpriseHome.jsx` | Welcome & Overview Stats | Computes from `useApp()` | **Working** | Connect to live socket events. |
| `EnterpriseHome.jsx` | Verification Badge | Hardcoded "Verified ✓" | **Bug** | Check `user.is_verified`. Show "Pending Verification" if unverified. |
| `PostRequirement.jsx` | Buyer Requirement Form | Calls `api.requirements.create` | **Working** | Writes requirement and specs JSON to MySQL. Remove `setTimeout`. |
| `MyRequirements.jsx` | Requirements Tabs & Listing | Reads `buyerRequirements` | **Working** | Filters by current enterprise. |
| `MyRequirements.jsx` | "Close / Re-activate" Button | In-memory mutation | **Critical Gap** | Call `PUT /api/requirements/:id` with `{ status: 'closed' }`. |
| `MyRequirements.jsx` | "Delete Requirement" Button | In-memory deletion | **Critical Gap** | Call `DELETE /api/requirements/:id`. |
| `MyRequirements.jsx` | "Accept Farmer Quote" Button | Calls `acceptQuoteOnRequirement` | **Working** | Calls `POST /api/offers/:id/accept` to auto-create deal in MySQL. |
| `MyRequirements.jsx` | "Counter Quote" Modal | Calls `counterQuoteOnRequirement` | **Working** | Calls `POST /api/offers/:id/counter`. |
| `SendOffer.jsx` | Send Offer on Produce Listing | Calls `addEnterpriseOffer` | **Partial** | Remove chained `setTimeout`; ensure enterprise is verified before sending. |
| `MyOffers.jsx` | Tabs (Pending, Countered, Accepted, etc.) | Reads `enterpriseOffers` | **Working** | Populates from `api.offers.getEnterpriseOffers()`. |
| `MyOffers.jsx` | "Withdraw Offer" Button | Calls `withdrawEnterpriseOffer` | **Working** | Calls `POST /api/offers/:id/withdraw`. |
| `MyOffers.jsx` | "Accept Counter" Button | In-memory state mutation | **Critical Gap** | Must call `POST /api/offers/:id/accept` to create deal in MySQL. |
| `EnterpriseProfile.jsx` | Edit Company Attributes & Save | In-memory state mutation | **Partial** | Call `PUT /api/auth/profile` to persist to `enterprise_profiles`. |

---

### 2.4 Admin Portal
| Page | UI Element / Form | Action | Current Status | Required Action in Phase 3 |
|:---|:---|:---|:---|:---|
| `AdminOverview.jsx` | Overview Metric Cards & Charts | Calls `api.admin.getStats()` | **Working** | 100% live SQL counts from database. |
| `VerificationQueue.jsx` | "Approve" User KYC | Calls `api.admin.reviewVerification(..., 'approve')` | **Working** | Updates `users.is_verified = true` in MySQL. |
| `VerificationQueue.jsx` | "Reject" User KYC with Reason | Calls `api.admin.reviewVerification(..., 'reject')` | **Working** | Updates user record and sends notification. |
| `UserManagement.jsx` | Filter / Search Registered Users | Calls `api.admin.getUsers()` | **Working** | Displays real joined users and profiles. |
| `UserManagement.jsx` | "Suspend / Restore" User Button | Calls `api.admin.updateUserStatus()` | **Partial** | Implement real `user_blocked` socket event to instantly log out suspended user. |
| `Complaints.jsx` | Filter Dispute Cases | Calls `api.admin.getComplaints()` | **Working** | Reads dispute records from MySQL. |
| `Complaints.jsx` | "Investigate / Resolve" Complaint | Calls `api.admin.resolveComplaint()` | **Working** | Persists admin notes and marks resolved in MySQL. |
| *Missing Admin UI* | Master Data Crops CRUD | None | **Missing** | Build UI & API for creating/updating crop commodities. |
| *Missing Admin UI* | Deals Monitoring & CSV Export | None | **Missing** | Build UI & API for viewing all deals and downloading CSV reports. |
| *Missing Admin UI* | Broadcast Announcements | None | **Missing** | Build UI & API for publishing announcements to `announcements` table. |

---

## 3. End-to-End Integration Matrix

| # | Feature / Flow | Frontend Screen | Backend API Endpoint | MySQL Table(s) Changed | Real-Time Socket Event | Current Integration Status |
|:---|:---|:---|:---|:---|:---|:---|
| **1** | **Farmer Registration & KYC** | `/register?role=farmer` | `POST /api/auth/register` | `users`, `farmer_profiles`, `verification_documents` | `new_notification` | **Working** (KYC file upload needs multipart form wiring) |
| **2** | **Enterprise Registration & KYC** | `/register?role=enterprise` | `POST /api/auth/register` | `users`, `enterprise_profiles`, `verification_documents` | `new_notification` | **Working** |
| **3** | **Admin Verification Queue** | `/admin/verification` | `GET /api/admin/verifications`<br>`POST /api/admin/verifications/:id/review` | `users`, `verification_documents`, `notifications` | `verification_decided` | **Working** |
| **4** | **Post Produce Listing** | `/farmer/add-produce` | `POST /api/listings` | `produce_listings`, `listing_images` | `new_listing` | **Working** (Multer image upload needs full hookup) |
| **5** | **Browse & Search Produce** | `/browse` | `GET /api/listings` | `produce_listings`, `crops`, `users` | `listing_updated` | **Partial** (Move search/filter parameters to SQL query) |
| **6** | **Produce Detail & Inquiries** | `/produce/:id` | `GET /api/listings/:id` | `produce_listings` (increments `views_count`) | — | **Working** |
| **7** | **Post Buyer Requirement** | `/enterprise/post-requirement` | `POST /api/requirements` | `buyer_requirements` | `new_requirement` | **Working** |
| **8** | **Browse Buyer Demands** | `/farmer/find-buyers` | `GET /api/requirements` | `buyer_requirements`, `crops`, `enterprise_profiles` | — | **Working** |
| **9** | **Farmer Submits Quote** | `/farmer/send-quote/:id` | `POST /api/offers` | `offers`, `notifications` | `new_quote` | **Working** (Remove UI `setTimeout` wrappers) |
| **10** | **Enterprise Sends Offer on Listing** | `/enterprise/send-offer/:id` | `POST /api/offers` | `offers`, `notifications` | `new_offer` | **Working** (Enforce `is_verified` guard) |
| **11** | **Negotiate / Counter Offer** | `/farmer/offers`<br>`/enterprise/offers` | `POST /api/offers/:id/counter` | `offers`, `notifications` | `offer_updated` | **Partial** (Wire UI handlers in `OffersInbox` directly to API) |
| **12** | **Accept Offer & Create Deal** | `/farmer/offers`<br>`/enterprise/requirements` | `POST /api/offers/:id/accept` | **Transaction:** `offers`, `deals`, `deal_status_history`, `produce_listings`, `notifications` | `deal_created` | **Partial** (Backend transaction is built; frontend UI buttons must invoke it) |
| **13** | **Deal Timeline & Milestones** | `/farmer/deals` *(Route to add)*<br>`/enterprise/deals` | `GET /api/deals`<br>`POST /api/deals/:id/status` | `deals`, `deal_status_history`, `notifications` | `deal_status_changed` | **Backend Ready / Frontend Screen Missing** |
| **14** | **Deal Document Uploads** | `/deals/:id` *(Route to add)* | `POST /api/deals/:id/documents` | `deal_documents` | `deal_status_changed` | **Backend Ready / Frontend Screen Missing** |
| **15** | **Real-Time Peer Chat** | `/farmer/chat`<br>`/enterprise/chat` | `GET /api/messages/conversations`<br>`GET /api/messages/:id`<br>`POST /api/messages` | `messages` | `new_message`, `receive_message`, `typing` | **Working** |
| **16** | **Trade Reviews & Ratings** | `/deals/:id/review` *(To add)* | `POST /api/reviews`<br>`GET /api/reviews/user/:id` | `reviews`, `users` (`rating`, `reviews_count`) | — | **Backend Ready / Modal to attach on Deal Completion** |
| **17** | **Saved Listings & Searches** | Listing cards / Demands | `GET /api/saved`<br>`POST /api/saved/toggle` | `saved_items`, `saved_searches` | — | **Backend Ready / Bookmark icon buttons to connect in UI** |
| **18** | **Dispute Complaints** | `/farmer/notifications`<br>`/admin/complaints` | `POST /api/complaints`<br>`GET /api/admin/complaints`<br>`POST /api/admin/complaints/:id/resolve` | `complaints`, `notifications` | `new_notification` | **Working** |
| **19** | **User Suspension / Ban** | `/admin/users` | `PUT /api/admin/users/:id/status` | `users` (`is_verified` / active status) | `user_blocked` | **Partial** (Needs `user_blocked` event to auto-log out client) |
| **20** | **Admin Platform Stats** | `/admin/overview` | `GET /api/admin/stats` | Live SQL aggregations | `dashboard_stats_changed` | **Working** |
| **21** | **Master Data (Crops) CRUD** | `/admin/crops` *(To add)* | `POST/PUT/DELETE /api/crops` | `crops` | — | **Backend routes needed** |
| **22** | **Announcements Broadcast** | Admin announcement banner | `POST /api/admin/announcements`<br>`GET /api/announcements` | `announcements` | `announcement_created` | **Backend schema exists, routes & banner needed** |

---

## 4. Key Gaps & Strategic Roadmap for Execution

1. **Phase 2 (Remove All Dummy Data):**
   - Clean out all remaining `setTimeout` delays in `About.jsx`, `AddProduce.jsx`, `SendQuote.jsx`, `SendOffer.jsx`, `FindBuyers.jsx`.
   - In `server/routes/mandi.js`, replace synthetic `randWalk()` Math.random generation with genuine seed records or empty fallback.
   - Enforce clean Loading Skeleton, Empty State with CTA button, and Error State with Retry across every page.
   - Create `npm run reset:db` (cleans test data while preserving 12 master crops, export guides, and admin) and `npm run seed:demo` (scripted database seeder for presentations).

2. **Phase 3 (Full Frontend-to-Backend Integration):**
   - Build unified Axios client with JWT interceptor and global error/toast handlers.
   - Wire TanStack React Query for declarative data fetching, caching, and instant cache invalidation upon mutations.
   - Build the dedicated Deal Tracking Screen (`/farmer/deals`, `/enterprise/deals`, `/deals/:id`) so accepted offers transition into full lifecycle deals (milestone progress, document upload, status history).
   - Hook up missing action buttons (`OffersInbox` Accept/Counter/Reject, `MyRequirements` Close/Delete, Bookmark saved items).
   - Wire all 15 Socket.io real-time broadcast events so screens update simultaneously without refresh.
   - Enforce backend role permissions & unverified user restrictions.

3. **Phase 4 (Quality & Testing Pass):**
   - Implement end-to-end integration automated tests (registration, groundnut Bold listing with JSON attributes, offer negotiation transaction, completed deal + review, socket chat, admin ban).
   - Verify responsive layout at 360px, 768px, and 1280px.
   - Run production lint and build validation.

4. **Phase 5 (Documentation & Handover):**
   - Complete `/docs/API.md`, `/docs/REALTIME.md`, `/docs/INTEGRATION_MATRIX.md`, and update `README.md`.
