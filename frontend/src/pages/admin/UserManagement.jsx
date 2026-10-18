import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Search, ShieldCheck, Ban, RotateCcw, Eye, RefreshCw, AlertTriangle, Trash2 } from 'lucide-react';
import { FadeUpItem } from '../../components/common/AnimatedComponents';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

export default function UserManagement() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState('farmers');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState({
    farmers: [],
    enterprises: [],
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.admin.getUsers();
      if (res?.data) {
        const raw = res.data;
        const farmers = raw.filter(u => u.role === 'farmer').map(f => ({
          id: f.id,
          name: f.name,
          phone: f.phone,
          avatar: f.avatar || '🧑‍🌾',
          village: f.village || '',
          district: f.district || f.state || 'India',
          since: new Date(f.created_at).toLocaleDateString(),
          status: f.is_verified ? 'verified' : 'pending',
          deals: f.deals_count || 0,
          rating: f.rating ? Number(f.rating).toFixed(1) : '5.0',
          userType: 'Farmer',
        }));
        const enterprises = raw.filter(u => u.role === 'enterprise').map(e => ({
          id: e.id,
          name: e.company_name || e.name,
          phone: e.phone,
          gst: e.gst_number || '',
          avatar: e.avatar || '🏢',
          city: e.city || 'India',
          district: e.city || e.state || 'India',
          since: new Date(e.created_at).toLocaleDateString(),
          status: e.is_verified ? 'verified' : 'pending',
          deals: e.deals_count || 0,
          rating: e.rating ? Number(e.rating).toFixed(1) : '5.0',
          userType: 'Enterprise',
        }));
        setUsers({ farmers, enterprises });
      }
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        addToast('Session expired. Please log in as admin.', 'error');
        navigate('/login');
        return;
      }
      console.error('Failed to load users:', err);
      setError(err.message || 'Failed to load user directory from database');
    } finally {
      setLoading(false);
    }
  }, [addToast, navigate]);

  useEffect(() => {
    fetchUsers();

    const socket = getSocket();
    if (socket) {
      socket.on('new_user_registered', fetchUsers);
      socket.on('user_status_changed', fetchUsers);
      socket.on('user_deleted', fetchUsers);
    }

    return () => {
      if (socket) {
        socket.off('new_user_registered', fetchUsers);
        socket.off('user_status_changed', fetchUsers);
        socket.off('user_deleted', fetchUsers);
      }
    };
  }, [fetchUsers]);

  const currentUsers = (users[activeTab] || []).filter(u => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || u.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const handleAction = async (id, action) => {
    try {
      const isVerified = action === 'restore';
      await api.admin.updateUserStatus(id, { is_verified: isVerified, status: action === 'suspend' ? 'suspended' : 'active' });
      setUsers(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].map(u => u.id === id ? { ...u, status: action === 'suspend' ? 'suspended' : 'verified' } : u),
      }));
      addToast(`${action === 'suspend' ? '⛔ Suspended' : '✅ Verified / Restored'}`, action === 'suspend' ? 'warning' : 'success');
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmMessage = `⚠️ Are you sure you want to permanently delete ${user.userType} "${user.name}"?\n\nThis will internally remove all entries:\n• Produce listings & images\n• Buyer requirements\n• Quotes, offers & counter-offers\n• Deals, documents & status logs\n• Messages, reviews & complaints\n\nThis action cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);
      const res = await api.admin.deleteUser(user.id);
      addToast(res.message || `Deleted ${user.name} and all associated data.`, 'success');
      setUsers(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(u => u.id !== user.id),
      }));
    } catch (err) {
      addToast(err.message || 'Failed to delete user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const STATUS_BADGE = { verified: 'badge-green', pending: 'badge-amber', suspended: 'badge-red' };
  const STATUS_LABELS = { verified: 'Verified', pending: 'Pending', suspended: 'Suspended' };

  return (
    <div style={{ padding: '32px', height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      <FadeUpItem>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 4 }}>User Management</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Manage all live registered farmers and enterprises from MySQL</p>
            </div>
          </div>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={fetchUsers}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh Users'}</span>
          </button>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#991B1B', fontSize: '0.875rem' }}>
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchUsers}>Retry</button>
          </div>
        )}
      </FadeUpItem>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, background: 'var(--bg-page)', borderRadius: 12, padding: '4px', marginBottom: 24, width: 'fit-content' }}>
        {['farmers', 'enterprises'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            style={{ 
              padding: '8px 20px', 
              border: 'none', 
              cursor: 'pointer', 
              borderRadius: 10, 
              background: activeTab === tab ? '#fff' : 'transparent', 
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)', 
              fontWeight: 600, 
              boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none', 
              transition: 'all 0.2s', 
              textTransform: 'capitalize' 
            }}
          >
            {tab === 'farmers' ? `🧑‍🌾 Farmers (${users.farmers.length})` : `🏢 Enterprises (${users.enterprises.length})`}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="form-input" style={{ paddingLeft: 42 }} placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="chip-group">
          {['All', 'Verified', 'Pending', 'Suspended'].map(s => (
            <button key={s} className={`chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading platform users...
          </div>
        ) : (
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
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          background: 'var(--green-light)',
                          border: '1.5px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: '1.4rem',
                        }}
                      >
                        {user.avatar && (user.avatar.startsWith('data:') || user.avatar.startsWith('http') || user.avatar.startsWith('/')) ? (
                          <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          user.avatar || user.logo || (activeTab === 'farmers' ? '🧑‍🌾' : '🏢')
                        )}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.name}</span>
                          {user.status === 'verified' && <ShieldCheck size={14} color="var(--green-primary)" />}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.phone || user.gst || 'No contact'}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {[user.village || user.city, user.district].filter(Boolean).join(', ') || 'India'}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.since}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span className={`badge ${STATUS_BADGE[user.status] || 'badge-gray'}`}>
                      {STATUS_LABELS[user.status] || user.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.deals || 0}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: 'var(--amber)', fontSize: '0.875rem' }}>★</span>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.rating}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button className="btn btn-ghost btn-sm" title="View Profile" onClick={() => addToast(`User ID #${user.id}: ${user.name}`, 'info')}>
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
                      <button
                        className="btn btn-sm"
                        style={{
                          background: '#FEE2E2',
                          color: '#DC2626',
                          border: '1px solid #FCA5A5',
                          padding: '4px 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onClick={() => handleDeleteUser(user)}
                        title={`Permanently delete ${user.name} and all data`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && currentUsers.length === 0 && (
          <div className="empty-state" style={{ padding: 48, textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ fontSize: '2.5rem', marginBottom: 12 }}>👤</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 4 }}>No {activeTab} found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No users match the selected filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
