import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, ShieldX, Search, X, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';
import { FadeUpItem } from '../../components/common/AnimatedComponents';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

export default function VerificationQueue() {
  const navigate = useNavigate();
  const { addToast, impersonateUser } = useApp();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.admin.getVerifications();
      if (res?.data) {
        setQueue(res.data);
        if (selected && !res.data.some(u => u.id === selected)) {
          setSelected(null);
        }
      }
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        addToast('Session expired. Please log in as admin.', 'error');
        navigate('/login');
        return;
      }
      console.error('Failed to load verifications:', err);
      setError(err.message || 'Failed to load verification queue from database');
    } finally {
      setLoading(false);
    }
  }, [addToast, navigate, selected]);

  useEffect(() => {
    fetchQueue();

    const socket = getSocket();
    if (socket) {
      socket.on('new_user_registered', fetchQueue);
      socket.on('user_status_changed', fetchQueue);
      socket.on('user_deleted', fetchQueue);
    }

    return () => {
      if (socket) {
        socket.off('new_user_registered', fetchQueue);
        socket.off('user_status_changed', fetchQueue);
        socket.off('user_deleted', fetchQueue);
      }
    };
  }, [fetchQueue]);

  const filtered = queue.filter(u => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || u.type === typeFilter;
    const matchStatus = statusFilter === 'All' || u.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchType && matchStatus;
  });

  const handleApprove = async (id) => {
    try {
      await api.admin.reviewVerification(id, 'approve');
      setQueue(prev => prev.map(u => u.id === id ? { ...u, status: 'approved' } : u));
      addToast('User verified and approved! ✓ You can now open their dashboard to post items or requirements.', 'success');
    } catch (err) {
      addToast(err.message || 'Approval failed', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.admin.reviewVerification(id, 'reject');
      setQueue(prev => prev.map(u => u.id === id ? { ...u, status: 'rejected' } : u));
      setShowRejectModal(null);
      addToast('User rejected with reason.', 'warning');
    } catch (err) {
      addToast(err.message || 'Rejection failed', 'error');
    }
  };

  const handleOpenDashboard = async (targetUser) => {
    try {
      const cleanId = String(targetUser.dbId || targetUser.id).replace(/^[a-z]+/i, '');
      addToast(`Switching to ${targetUser.name}'s account...`, 'info');
      const userObj = await impersonateUser(cleanId);
      if (userObj.role === 'farmer') {
        navigate('/farmer/add-produce');
        addToast(`Switched to farmer ${targetUser.name}! Post produce directly.`, 'success');
      } else if (userObj.role === 'enterprise') {
        navigate('/enterprise/post-requirement');
        addToast(`Switched to enterprise ${targetUser.name}! Post procurement requirement directly.`, 'success');
      } else {
        navigate('/');
      }
    } catch (err) {
      addToast(err.message || 'Failed to open user dashboard', 'error');
    }
  };

  const selectedUser = selected ? queue.find(u => u.id === selected) : null;

  const STATUS_BADGE = { pending: 'badge-amber', approved: 'badge-green', rejected: 'badge-red' };
  const STATUS_LABELS = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

  return (
    <div style={{ padding: '32px', height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      <FadeUpItem>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 4 }}>Verification Queue</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {queue.filter(u => u.status === 'pending').length} users awaiting review • {queue.filter(u => u.status === 'approved').length} verified
              </p>
            </div>
          </div>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={fetchQueue}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh Queue'}</span>
          </button>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#991B1B', fontSize: '0.875rem' }}>
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchQueue}>Retry</button>
          </div>
        )}
      </FadeUpItem>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="form-input" style={{ paddingLeft: 42 }} placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div className="chip-group">
            {['All', 'Farmer', 'Enterprise'].map(f => (
              <button key={f} className={`chip ${typeFilter === f ? 'active' : ''}`} onClick={() => setTypeFilter(f)}>{f}</button>
            ))}
          </div>
          <div className="chip-group">
            {['All', 'Pending', 'Approved'].map(s => (
              <button key={s} className={`chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          Loading verification requests...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card card-body" style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--text-muted)' }}>
          <ShieldCheck size={48} color="var(--green-primary)" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
          <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: 8 }}>
            No Pending Verifications
          </h4>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            All registered users are up to date. New registration requests will appear here for admin review.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 1fr' : '1fr', gap: 20 }}>
          {/* Queue */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(user.id === selected ? null : user.id)}
                style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '16px 20px', background: '#fff', borderRadius: 14, border: `1.5px solid ${selected === user.id ? 'var(--green-primary)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                {/* Circular applicant image */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'var(--green-light)',
                    border: '2px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    flexShrink: 0,
                  }}
                >
                  {typeof user.avatar === 'string' && (user.avatar.startsWith('data:') || user.avatar.startsWith('http') || user.avatar.startsWith('/')) ? (
                    <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    user.avatar || (user.type === 'Farmer' ? '🧑‍🌾' : '🏢')
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</span>
                    <span className={`badge ${STATUS_BADGE[user.status] || 'badge-amber'}`} style={{ fontSize: '0.7rem' }}>{STATUS_LABELS[user.status] || user.status}</span>
                    <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>{user.type}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-muted)' }}>
                    📍 {user.village || user.district || user.city || 'Gujarat'} • Registered {user.appliedAt}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {user.status === 'pending' ? (
                    <>
                      <motion.button className="btn btn-primary btn-sm" whileHover={{ scale: 1.05 }} onClick={e => { e.stopPropagation(); handleApprove(user.id); }}>
                        <ShieldCheck size={14} /> Approve
                      </motion.button>
                      <motion.button className="btn btn-danger btn-sm" whileHover={{ scale: 1.05 }} onClick={e => { e.stopPropagation(); setShowRejectModal(user.id); }}>
                        <ShieldX size={14} /> Reject
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      className="btn btn-sm"
                      whileHover={{ scale: 1.05 }}
                      onClick={e => { e.stopPropagation(); handleOpenDashboard(user); }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        background: '#E8F5E9',
                        color: 'var(--green-primary)',
                        border: '1px solid #A5D6A7',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        padding: '6px 12px',
                      }}
                      title={`Open ${user.name}'s Dashboard`}
                    >
                      <ExternalLink size={13} /> Open Dashboard
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detail Panel */}
          {selectedUser && (
            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }} style={{ position: 'sticky', top: 0, height: 'fit-content' }}>
              <div className="card card-body">
                {/* Header with Circular Profile Photo */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div
                      style={{
                        width: 76,
                        height: 76,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: 'var(--green-light)',
                        border: '3px solid var(--green-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        boxShadow: '0 4px 14px rgba(46, 125, 50, 0.15)',
                        flexShrink: 0,
                      }}
                    >
                      {typeof selectedUser.avatar === 'string' && (selectedUser.avatar.startsWith('data:') || selectedUser.avatar.startsWith('http') || selectedUser.avatar.startsWith('/')) ? (
                        <img src={selectedUser.avatar} alt={selectedUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        selectedUser.avatar || (selectedUser.type === 'Farmer' ? '🧑‍🌾' : '🏢')
                      )}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 4px', fontSize: '1.25rem' }}>{selectedUser.name}</h3>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span className="badge badge-gray" style={{ fontSize: '0.72rem' }}>{selectedUser.type}</span>
                        <span className={`badge ${STATUS_BADGE[selectedUser.status] || 'badge-amber'}`} style={{ fontSize: '0.72rem' }}>
                          {STATUS_LABELS[selectedUser.status] || selectedUser.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ border: 'none', background: 'var(--border)', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={16} />
                  </button>
                </div>

                {/* Registration Details Block - Only fields present in register form */}
                <div style={{ background: 'var(--bg-page)', borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 14px' }}>
                    Submitted Registration Details
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Full Name</span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selectedUser.name}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mobile Number</span>
                      <strong className="notranslate" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selectedUser.phone || 'N/A'}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email Address</span>
                      <strong className="notranslate" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selectedUser.email || 'N/A'}</strong>
                    </div>

                    {selectedUser.type === 'Farmer' ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Village</span>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selectedUser.village || 'N/A'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>District</span>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selectedUser.district || 'Gujarat'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Land Size</span>
                          <strong className="notranslate" style={{ fontSize: '0.9rem', color: 'var(--green-primary)' }}>{selectedUser.land || 'N/A'}</strong>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Company</span>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selectedUser.company || selectedUser.name}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>GST Number</span>
                          <strong className="notranslate" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selectedUser.gst || 'N/A'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>IEC Code</span>
                          <strong className="notranslate" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selectedUser.iec || 'N/A'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>City</span>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selectedUser.city || 'Gujarat'}</strong>
                        </div>
                      </>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 2 }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered On</span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{selectedUser.appliedAt}</strong>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedUser.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-primary btn-full" onClick={() => handleApprove(selectedUser.id)}>
                      <ShieldCheck size={16} /> Approve & Verify
                    </button>
                    <button className="btn btn-danger btn-full" onClick={() => setShowRejectModal(selectedUser.id)}>
                      <ShieldX size={16} /> Reject
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ textAlign: 'center', padding: '4px 0' }}>
                      <span className="badge badge-green" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                        ✓ Account Verified & Approved
                      </span>
                    </div>
                    <button
                      className="btn btn-primary btn-full"
                      onClick={() => handleOpenDashboard(selectedUser)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '12px 20px',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        boxShadow: 'var(--shadow-md)',
                      }}
                    >
                      <ExternalLink size={17} /> Open {selectedUser.type} Dashboard & Post {selectedUser.type === 'Farmer' ? 'Produce' : 'Requirement'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal" initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <ShieldX size={40} color="var(--red)" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)' }}>Reject Application</h3>
                <p style={{ fontSize: '0.875rem' }}>Please provide a reason for rejection. This will be sent to the applicant.</p>
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Rejection Reason</label>
                <textarea className="form-textarea" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Document unclear, please resubmit." />
              </div>
              <div className="chip-group" style={{ marginBottom: 20 }}>
                {['Invalid document', 'Document unclear', 'Mismatch in details', 'Area not served yet'].map(r => (
                  <button key={r} className={`chip ${rejectReason === r ? 'active' : ''}`} onClick={() => setRejectReason(r)} style={{ fontSize: '0.8rem' }}>{r}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost btn-full" onClick={() => setShowRejectModal(null)}>Cancel</button>
                <button className="btn btn-danger btn-full" onClick={() => handleReject(showRejectModal)} disabled={!rejectReason}>Reject</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
