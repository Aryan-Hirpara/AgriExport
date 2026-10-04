import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  Leaf, Bell, ChevronDown, LogOut, User, Settings,
  Menu, X, Sprout, Shield, Building2
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const { lang, setLang, t, role, user, loginAs, logout, unreadCount, notifications, markAllRead, buyerRequirements } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = location.pathname === '/';

  const publicLinks = [
    { href: '/browse', label: t('Browse Produce', 'ઉત્પાદ શોધો') },
    { href: '/enterprises', label: t('Enterprises', 'ઉદ્યોગો') },
    { href: '/mandi-prices', label: t('Mandi Prices', 'મંડી ભાવ') },
    { href: '/about', label: t('About', 'અમારા વિશે') },
  ];

  const farmerLinks = [
    { href: '/farmer/home', label: t('Dashboard', 'ડેશબોર્ડ') },
    { href: '/farmer/listings', label: t('My Listings', 'મારી ઉપજ') },
    { href: '/farmer/offers', label: t('Offers', 'ઑફર્સ') },
    { href: '/farmer/find-buyers', label: t('Buyer Demands', 'ખરીદદાર માંગ') },
    { href: '/mandi-prices', label: t('Mandi Prices', 'મંડી ભાવ') },
  ];

  const enterpriseLinks = [
    { href: '/enterprise/home', label: t('Dashboard', 'ડેશબોર્ડ') },
    { href: '/enterprise/requirements', label: t('My Requirements', 'મારી માંગણીઓ') },
    { href: '/browse', label: t('Browse Produce', 'ઉત્પાદ શોધો') },
    { href: '/enterprise/offers', label: t('My Offers', 'મારી ઑફર્સ') },
    { href: '/mandi-prices', label: t('Mandi Prices', 'મંડી ભાવ') },
  ];


  const adminLinks = [
    { href: '/admin/overview', label: t('Overview', 'ઝાંખી') },
    { href: '/admin/verification', label: t('Verifications', 'ચકાસણી') },
    { href: '/admin/users', label: t('Users', 'યૂઝર્સ') },
    { href: '/admin/complaints', label: t('Complaints', 'ફરિયાદો') },
  ];

  const navLinks = role === 'farmer' ? farmerLinks
    : role === 'enterprise' ? enterpriseLinks
    : role === 'admin' ? adminLinks
    : publicLinks;

  const logoLink = role === 'farmer' ? '/farmer/home'
    : role === 'enterprise' ? '/enterprise/home'
    : role === 'admin' ? '/admin/overview'
    : '/';

  const dashboardLink = role === 'farmer' ? '/farmer/home'
    : role === 'enterprise' ? '/enterprise/home'
    : role === 'admin' ? '/admin/overview' : null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Left: Brand Logo */}
        <div className="navbar-brand">
          <Link to={logoLink} className="nav-logo">
            <img src="/logo.png" alt="AgriExport Connect Logo" className="nav-logo-img" />
            <span>AgriExport<span style={{ color: 'var(--amber)' }}>Connect</span></span>
          </Link>
        </div>

        {/* Center: Desktop Nav Links (Replaced by Role) */}
        <div className="navbar-center-links">
          {navLinks.map(link => {
            const isActive = location.pathname === link.href ||
              (link.href !== '/' && link.href !== '/farmer/home' && link.href !== '/enterprise/home' && location.pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`nav-pill-link ${isActive ? 'active' : ''}`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="nav-link-badge">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Controls & Actions */}
        <div className="navbar-actions">
          {/* Notification Bell (if logged in) */}
          {role && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
                style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
              >
                <Bell size={18} color="var(--text-secondary)" />
                {unreadCount > 0 && (
                  <span className="counter-badge" style={{ position: 'absolute', top: -4, right: -4, fontSize: '0.65rem' }}>{unreadCount}</span>
                )}
              </button>
              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      position: 'absolute', top: 52, right: 0, width: 360,
                      background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow-lg)',
                      border: '1px solid var(--border)', overflow: 'hidden', zIndex: 200
                    }}
                  >
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '0.95rem' }}>{t('Notifications', 'સૂચનાઓ')}</span>
                      <button onClick={markAllRead} style={{ border: 'none', background: 'none', color: 'var(--green-primary)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>{t('Mark all read', 'બધા વાંચ્યા')}</button>
                    </div>
                    {notifications.slice(0, 5).map(n => (
                      <div key={n.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start', background: n.read ? '#fff' : 'var(--green-light)', cursor: 'pointer' }}>
                        <span style={{ fontSize: '1.25rem' }}>{n.icon}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>{n.text}</p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>{n.time}</span>
                        </div>
                        {!n.read && <div className="notif-dot" style={{ marginTop: 4 }} />}
                      </div>
                    ))}
                    <div style={{ padding: '12px 20px', textAlign: 'center' }}>
                      <Link to="/farmer/notifications" style={{ color: 'var(--green-primary)', fontWeight: 600, fontSize: '0.875rem' }} onClick={() => setShowNotifs(false)}>
                        {t('View all notifications →', 'બધી સૂચનાઓ જુઓ →')}
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* User Profile Menu (if logged in) or Login / Register (if public) */}
          {role ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', border: '1.5px solid var(--border)', borderRadius: 99, background: '#fff', cursor: 'pointer', height: 38 }}
              >
                <div className="avatar avatar-sm" style={{ background: role === 'admin' ? '#1e3a8a' : 'var(--green-primary)', color: '#fff', width: 28, height: 28, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 700 }}>
                  {role === 'admin' ? '🛡️' : (user?.name?.[0] || 'U')}
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {role === 'admin' ? 'Admin' : user?.name?.split(' ')[0]}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    style={{ position: 'absolute', top: 52, right: 0, width: 200, background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', overflow: 'hidden', zIndex: 200 }}
                  >
                    {dashboardLink && (
                      <Link to={dashboardLink} onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>
                        {role === 'admin' ? <Shield size={16} /> : <User size={16} />}
                        {role === 'admin' ? t('Admin Panel', 'એડમિન પેનલ') : t('Dashboard', 'ડૅશબોર્ડ')}
                      </Link>
                    )}
                    {role === 'farmer' && (
                      <Link to="/farmer/profile" onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>
                        <User size={16} /> {t('My Profile', 'મારી પ્રોફાઇલ')}
                      </Link>
                    )}
                    {role === 'enterprise' && (
                      <Link to="/enterprise/profile" onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>
                        <Building2 size={16} /> {t('Company Profile', 'કંપની પ્રોફાઇલ')}
                      </Link>
                    )}
                    <button onClick={() => { logout(); navigate('/'); setShowUserMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', width: '100%', border: 'none', background: 'none', color: 'var(--red)', fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer', borderTop: '1px solid var(--border)' }}>
                      <LogOut size={16} /> {t('Logout', 'લૉગ આઉટ')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="nav-login-btn">{t('Login', 'લૉગ ઇન')}</Link>
              <Link to="/register" className="nav-get-started-btn">{t('Get Started', 'શરૂ કરો')}</Link>
            </div>
          )}

          {/* Custom Branded Language Selector - Anchored Right */}
          <LanguageSelector variant="navbar" />
        </div>
      </div>
    </nav>
  );
}
