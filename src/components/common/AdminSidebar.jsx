import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ShieldCheck, Users, BarChart3, FileText, Settings, Sprout, LogOut,
  AlertTriangle, ArrowLeft
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';

const sidebarItems = [
  { section: 'Overview' },
  { href: '/admin/overview', icon: LayoutDashboard, label: 'Overview' },
  { section: 'Management' },
  { href: '/admin/verification', icon: ShieldCheck, label: 'Verification Queue' },
  { href: '/admin/users', icon: Users, label: 'User Directory' },
  { href: '/admin/complaints', icon: AlertTriangle, label: 'Complaints & Disputes' },
  { href: '/admin/monitoring', icon: BarChart3, label: 'Monitoring & Stats' },
  { section: 'System' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminSidebar() {
  const { t, lang, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <div className="nav-logo">
          <div style={{ width: 34, height: 34, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2, flexShrink: 0 }}>
            <img src="/logo.png" alt="AgriExport Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem' }}>
            Agri<span style={{ color: 'var(--amber)' }}>Export</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <div style={{ padding: '4px 10px', background: 'rgba(47,125,50,0.3)', borderRadius: 6, display: 'inline-block' }}>
            <span style={{ fontSize: '0.75rem', color: '#86efac', fontWeight: 700 }}>🛡️ Admin Panel</span>
          </div>
          <Link
            to="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none', padding: '4px 8px',
              background: 'rgba(255,255,255,0.08)', borderRadius: 6,
              transition: 'background 0.2s'
            }}
            title={t('Return to public website', 'મુખ્ય વેબસાઇટ પર જાઓ')}
          >
            <ArrowLeft size={12} />
            <span>{t('Live Site', 'મુખ્ય સાઇટ')}</span>
          </Link>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sidebarItems.map((item, i) => {
          if (item.section) return (
            <div key={i} className="sidebar-section">{item.section}</div>
          );
          const Icon = item.icon;
          const isActive = location.pathname === item.href || (item.href === '/admin/verification' && location.pathname === '/admin/verifications');
          return (
            <Link key={item.href} to={item.href} style={{ textDecoration: 'none' }}>
              <motion.div
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.15 }}
              >
                <Icon size={18} />
                <span>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ padding: '0 4px' }}>
          <LanguageSelector variant="sidebar" />
        </div>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="sidebar-item"
          style={{ width: '100%', border: 'none', cursor: 'pointer', color: 'rgba(255,100,100,0.85)' }}
        >
          <LogOut size={18} />
          <span>{t('Logout', 'લૉગ આઉટ')}</span>
        </button>
      </div>
    </aside>
  );
}
