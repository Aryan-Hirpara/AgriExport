import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/common/Navbar';
import AdminSidebar from './components/common/AdminSidebar';
import ToastManager from './components/common/ToastManager';


// ── Public Pages ──────────────────────────────────────────────
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import ForgotPassword from './pages/public/ForgotPassword';
import Register from './pages/public/Register';
import BrowseProduce from './pages/public/BrowseProduce';
import ProduceDetail from './pages/public/ProduceDetail';
import Enterprises from './pages/public/Enterprises';
import MandiPrices from './pages/public/MandiPrices';
import About from './pages/public/About';

// ── Farmer Pages ──────────────────────────────────────────────
import FarmerHome from './pages/farmer/FarmerHome';
import AddProduce from './pages/farmer/AddProduce';
import MyListings from './pages/farmer/MyListings';
import OffersInbox from './pages/farmer/OffersInbox';
import Chat from './pages/farmer/Chat';
import FindBuyers from './pages/farmer/FindBuyers';
import FarmerProfile from './pages/farmer/FarmerProfile';
import Notifications from './pages/farmer/Notifications';
import RequirementDetail from './pages/farmer/RequirementDetail';
import SendQuote from './pages/farmer/SendQuote';

// ── Enterprise Pages ──────────────────────────────────────────
import EnterpriseHome from './pages/enterprise/EnterpriseHome';
import SendOffer from './pages/enterprise/SendOffer';
import MyOffers from './pages/enterprise/MyOffers';
import MyRequirements from './pages/enterprise/MyRequirements';
import PostRequirement from './pages/enterprise/PostRequirement';
import EnterpriseProfile from './pages/enterprise/EnterpriseProfile';

import AdminOverview from './pages/admin/AdminOverview';
import VerificationQueue from './pages/admin/VerificationQueue';
import UserManagement from './pages/admin/UserManagement';
import Complaints from './pages/admin/Complaints';
import SystemCheck from './pages/admin/SystemCheck';



// Layout: public pages with navbar
function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <ToastManager />
    </>
  );
}

// Layout: farmer / enterprise pages with unified navbar
function AppLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <ToastManager />
    </>
  );
}

// Layout: admin pages with sidebar
function AdminLayout() {
  const { role, user } = useApp();
  const navigate = useNavigate();

  const isAdmin = role === 'admin';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <main style={{ flex: 1, marginLeft: 240, overflowY: 'auto' }}>
        {!isAdmin && (
          <div style={{
            background: '#FFFBEB',
            borderBottom: '1px solid #FCD34D',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.875rem',
            color: '#92400E',
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <div>
                <strong>Admin Privileges Required:</strong> Current session is{' '}
                <span className="badge badge-amber" style={{ textTransform: 'capitalize' }}>
                  {user?.name || role || 'Not Logged In'}
                </span>
                . Backend live stats and verification tools require Administrator role.
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.8rem', padding: '6px 16px' }}
            >
              🔑 Login as Admin
            </button>
          </div>
        )}
        <Outlet />
      </main>
      <ToastManager />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={<BrowseProduce />} />
        <Route path="/demands" element={<FindBuyers />} />
        <Route path="/produce/:id" element={<ProduceDetail />} />
        <Route path="/requirement/:id" element={<RequirementDetail />} />
        <Route path="/enterprises" element={<Enterprises />} />
        <Route path="/mandi-prices" element={<MandiPrices />} />
        <Route path="/about" element={<About />} />
      </Route>

      {/* Farmer */}
      <Route element={<AppLayout />}>
        <Route path="/farmer/home" element={<FarmerHome />} />
        <Route path="/farmer/add-produce" element={<AddProduce />} />
        <Route path="/farmer/listings" element={<MyListings />} />
        <Route path="/farmer/offers" element={<OffersInbox />} />
        <Route path="/farmer/chat" element={<Chat />} />
        <Route path="/farmer/find-buyers" element={<FindBuyers />} />
        <Route path="/farmer/requirement/:id" element={<RequirementDetail />} />
        <Route path="/farmer/send-quote/:id" element={<SendQuote />} />
        <Route path="/farmer/profile" element={<FarmerProfile />} />
        <Route path="/farmer/notifications" element={<Notifications />} />
      </Route>

      {/* Enterprise */}
      <Route element={<AppLayout />}>
        <Route path="/enterprise/home" element={<EnterpriseHome />} />
        <Route path="/enterprise/requirements" element={<MyRequirements />} />
        <Route path="/enterprise/post-requirement" element={<PostRequirement />} />
        <Route path="/enterprise/send-offer/:listingId" element={<SendOffer />} />
        <Route path="/enterprise/offers" element={<MyOffers />} />
        <Route path="/enterprise/profile" element={<EnterpriseProfile />} />
      </Route>


      {/* Admin */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminOverview />} />
        <Route path="/admin/overview" element={<AdminOverview />} />
        <Route path="/admin/verification" element={<VerificationQueue />} />
        <Route path="/admin/verifications" element={<VerificationQueue />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/complaints" element={<Complaints />} />
        <Route path="/admin/system-check" element={<SystemCheck />} />
        <Route path="/admin/monitoring" element={<AdminOverview />} />
        <Route path="/admin/content" element={<UserManagement />} />
        <Route path="/admin/settings" element={<AdminOverview />} />
      </Route>

      {/* Default fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
