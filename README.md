# AgriExport Connect – Full Stack Platform

AgriExport Connect is a digital agricultural marketplace and contract export platform connecting Gujarat farmers with national and global export enterprises.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Recharts, Socket.io Client
- **Backend**: Node.js, Express, Socket.io (real-time chat & notifications), Multer (file uploads), bcryptjs, jsonwebtoken, express-validator, helmet, cors, rate limiting, node-cron
- **Database**: MySQL 8 / 26 (`agriexport_connect`), mysql2 with connection pooling, parameterized queries only
- **Authentication**: JWT Bearer token + Role-Based Access Control (RBAC) (`farmer`, `enterprise`, `admin`)

---

## ⚡ Quick Start

### 📁 Project Structure
```text
assignment-fsd/
├── frontend/               # React 19 + Vite Frontend SPA
│   ├── src/                # Components, pages, context, services
│   ├── public/             # Static public assets & images
│   └── package.json        # Frontend scripts & dependencies
├── backend/                # Node.js + Express + MySQL Backend Server
│   ├── routes/             # REST API routes
│   ├── services/           # Business logic & Agmarknet sync engine
│   ├── database/           # MySQL schemas and setup
│   └── package.json        # Backend scripts & dependencies
└── package.json            # Monorepo workspace runner
```

### 1. Database Setup
Ensure MySQL server is running on your system:
```bash
# Run database setup (creates schema + seed data)
npm run db:setup
```

### 2. Running Frontend & Backend

**Option A — Run Both Concurrently (from Root Directory):**
```bash
npm run dev
```

**Option B — Run Separately:**
```bash
# In Terminal 1 (Backend on port 5001):
cd backend
npm run dev

# In Terminal 2 (Frontend on port 5173):
cd frontend
npm run dev
```
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001/api](http://localhost:5001/api)
- **API Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Farmer** | `ramesh@unjha.com` | `demo1234` | Ramesh Patel (Unjha, Mehsana) |
| **Enterprise** | `ahmed@spiceexports.in` | `demo1234` | Ahmed Spice Exports (Ahmedabad) |
| **Admin** | `admin@agriexport.in` | `Admin@1234` | Platform Administrator & Verifier |

---

## 🗄️ Database Tables (22 Tables)

1. `users` – User accounts, passwords (bcrypt), roles, ratings
2. `farmer_profiles` – Land size, primary crops, bank info, experience
3. `enterprise_profiles` – Company info, GST, IEC, export destinations
4. `verification_documents` – Aadhaar, 7/12 land records, GST/IEC certificates
5. `crops` – 12 master crops with quality grades & indicative prices
6. `produce_listings` – Farmer crop listings with quantity, price, grade, attributes
7. `listing_images` – Uploaded photos for produce listings
8. `buyer_requirements` – Enterprise purchase demands with target prices and specs
9. `offers` – Quotations, counter-offers, accept/reject status
10. `deals` – Converted agreements tracking milestones from signed to delivered
11. `deal_status_history` – Audit trail for every milestone transition
12. `deal_documents` – Contracts, APEDA lab reports, invoices, bills of lading
13. `messages` – Real-time chat messages between buyers and farmers
14. `reviews` – Completed deal ratings and feedback
15. `notifications` – In-app alerts for offers, milestones, and price shifts
16. `saved_items` – User bookmarks for listings and requirements
17. `saved_searches` – Saved search queries
18. `complaints` – Dispute resolution tickets
19. `mandi_prices` – APMC prices with trends across Gujarat markets
20. `export_guides` – Country compliance manuals & document checklists
21. `announcements` – Platform broadcast bulletins
22. `activity_logs` – Security and administrative audit trail

---

## 🔌 API Routes Summary

- `POST /api/auth/login` – Login & get JWT token
- `POST /api/auth/register` – Register farmer or enterprise
- `GET  /api/auth/me` – Current profile details
- `GET  /api/crops` – List crops with attributes
- `GET  /api/listings` – Browse & filter produce listings
- `POST /api/listings` – Create listing with image upload
- `GET  /api/requirements` – Buyer requirements & quotes
- `POST /api/requirements` – Post buying requirement
- `POST /api/offers` – Send offer / submit quote
- `POST /api/offers/:id/counter` – Counter an offer
- `POST /api/offers/:id/accept` – Accept offer (auto-creates deal)
- `GET  /api/deals` – Deals tracking with milestone progress
- `POST /api/deals/:id/status` – Update deal milestone
- `POST /api/deals/:id/documents` – Upload deal contract/inspection report
- `GET  /api/messages/:convoId` – Chat conversation messages
- `POST /api/messages` – Send chat message (real-time via Socket.io)
- `GET  /api/mandi` – APMC live market prices & 90-day history
- `GET  /api/guides` – Export protocols & APEDA documentation
- `GET  /api/admin/stats` – Dynamic analytics dashboard
- `POST /api/admin/verifications/:id/review` – Approve/reject user documents
