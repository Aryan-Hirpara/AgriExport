import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Search, ShieldCheck, ShieldX, Ban, RotateCcw, Eye } from 'lucide-react';
import { FARMERS, ENTERPRISES } from '../../data/sampleData';
import { FadeUpItem } from '../../components/common/AnimatedComponents';

export default function UserManagement() {
  const { t, addToast } = useApp();
  const [activeTab, setActiveTab] = useState('farmers');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [users, setUsers] = useState({
    farmers: FARMERS.map(f => ({ ...f, userType: 'Farmer', status: f.verified ? 'verified' : 'pending' })),
    enterprises: ENTERPRISES.map(e => ({ ...e, userType: 'Enterprise', status: e.verified ? 'verified' : 'pending' })),
  });

  const currentUsers = users[activeTab].filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || u.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const handleAction = (id, action) => {
    setUsers(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(u => u.id === id ? { ...u, status: action === 'suspend' ? 'suspended' : action === 'restore' ? 'verified' : 'verified' } : u),
    }));
    addToast(`${action === 'suspend' ? '⛔ Suspended' : '✅ Restored'}`, action === 'suspend' ? 'warning' : 'success');
  };

  const STATUS_BADGE = { verified: 'badge-green', pending: 'badge-amber', suspended: 'badge-red' };
  const STATUS_LABELS = { verified: 'Verified', pending: 'Pending', suspended: 'Suspended' };

  return (
    <div style={{ padding: '32px', height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      <FadeUpItem>
        <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>{t('User Management', '.')}</h2>
        <p style={{ marginBottom: 24 }}>{t('Manage all farmers and enterprises on the platform', '.')}</p>
      </FadeUpItem>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, background: 'var(--bg-page)', borderRadius: 12, padding: '4px', marginBottom: 24, width: 'fit-content' }}>
        {['farmers', 'enterprises'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 20px', border: 'none', cursor: 'pointer', borderRadius: 10, background: activeTab === tab ? '#fff' : 'transparent', color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s', textTransform: 'capitalize' }}>
            {tab === 'farmers' ? `🧑‍🌾 ${t('Farmers', '.')} (${users.farmers.length})` : `🏢 ${t('Enterprises', '.')} (${users.enterprises.length})`}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="form-input" style={{ paddingLeft: 42 }} placeholder={t('Search by name...', '.')} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="chip-group">
          {['All', 'Verified', 'Pending', 'Suspended'].map(s => (
            <button key={s} className={`chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}>
              {['User', 'Location', 'Joined', 'Status', 'Deals', 'Rating', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, i) => (
              <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} style={{ borderBottom: '1px solid var(--border)', background: '#fff' }}
                whileHover={{ background: 'var(--bg-page)' }}>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: '1.75rem' }}>{user.avatar || user.logo}</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.name}</span>
                        {user.status === 'verified' && <ShieldCheck size={14} color="var(--green-primary)" />}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.phone || user.gst}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.village || user.city}, {user.district}</td>
                <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.since}</td>
                <td style={{ padding: '16px 20px' }}>
                  <span className={`badge ${STATUS_BADGE[user.status]}`}>{STATUS_LABELS[user.status]}</span>
                </td>
                <td style={{ padding: '16px 20px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.deals || 0}</td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: 'var(--amber)', fontSize: '0.875rem' }}>★</span>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.rating}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" title="View Profile">
                      <Eye size={14} />
                    </button>
                    {user.status !== 'suspended' ? (
                      <button className="btn btn-danger btn-sm" onClick={() => handleAction(user.id, 'suspend')} title="Suspend">
                        <Ban size={14} />
                      </button>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => handleAction(user.id, 'restore')} title="Restore">
                        <RotateCcw size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {currentUsers.length === 0 && (
          <div className="empty-state" style={{ padding: 48 }}>
            <div className="empty-state-icon">👤</div>
            <h3>{t('No users found', '.')}</h3>
          </div>
        )}
      </div>
    </div>
  );
}
