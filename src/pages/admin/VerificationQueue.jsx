import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, ShieldX, Eye, Download, Search, X } from 'lucide-react';
import { PENDING_VERIFICATIONS } from '../../data/sampleData';
import { FadeUpItem } from '../../components/common/AnimatedComponents';

export default function VerificationQueue() {
  const { t, addToast } = useApp();
  const [queue, setQueue] = useState(PENDING_VERIFICATIONS);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filtered = queue.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || u.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleApprove = (id) => {
    setQueue(prev => prev.map(u => u.id === id ? { ...u, status: 'approved' } : u));
    setSelected(null);
    addToast(t('User verified and approved! ✓', '✓'), 'success');
  };

  const handleReject = (id) => {
    setQueue(prev => prev.map(u => u.id === id ? { ...u, status: 'rejected' } : u));
    setShowRejectModal(null);
    addToast(t('User rejected with reason.', '.'), 'warning');
  };

  const selectedUser = selected ? queue.find(u => u.id === selected) : null;

  const STATUS_BADGE = { pending: 'badge-amber', approved: 'badge-green', rejected: 'badge-red' };
  const STATUS_LABELS = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

  return (
    <div style={{ padding: '32px', height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      <FadeUpItem>
        <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>{t('Verification Queue', '.')}</h2>
        <p style={{ marginBottom: 24 }}>
          {queue.filter(u => u.status === 'pending').length} {t('users awaiting review', '.')}
        </p>
      </FadeUpItem>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="form-input" style={{ paddingLeft: 42 }} placeholder={t('Search by name...', '.')} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="chip-group">
          {['All', 'Farmer', 'Enterprise'].map(f => (
            <button key={f} className={`chip ${typeFilter === f ? 'active' : ''}`} onClick={() => setTypeFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

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
              <div style={{ fontSize: '2rem' }}>{user.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</span>
                  <span className={`badge ${STATUS_BADGE[user.status]}`} style={{ fontSize: '0.7rem' }}>{STATUS_LABELS[user.status]}</span>
                  <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>{user.type}</span>
                </div>
                <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-muted)' }}>📍 {user.village} • Applied {user.appliedAt}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {user.status === 'pending' && (
                  <>
                    <motion.button className="btn btn-primary btn-sm" whileHover={{ scale: 1.05 }} onClick={e => { e.stopPropagation(); handleApprove(user.id); }}>
                      <ShieldCheck size={14} /> {t('Approve', '.')}
                    </motion.button>
                    <motion.button className="btn btn-danger btn-sm" whileHover={{ scale: 1.05 }} onClick={e => { e.stopPropagation(); setShowRejectModal(user.id); }}>
                      <ShieldX size={14} /> {t('Reject', '.')}
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detail Panel */}
        {selectedUser && (
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }} style={{ position: 'sticky', top: 0, height: 'fit-content' }}>
            <div className="card card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ fontSize: '2.5rem' }}>{selectedUser.avatar}</div>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>{selectedUser.name}</h4>
                    <span className="badge badge-amber" style={{ marginTop: 4 }}>{selectedUser.type}</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ border: 'none', background: 'var(--border)', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ marginBottom: 20 }}>
                {[
                  { label: 'Mobile', value: selectedUser.phone },
                  { label: 'Village', value: `${selectedUser.village}, ${selectedUser.district}` },
                  { label: 'Aadhaar', value: selectedUser.aadhaar },
                  { label: selectedUser.type === 'Farmer' ? 'Land (7/12)' : 'GST', value: selectedUser.type === 'Farmer' ? selectedUser.land : selectedUser.gst },
                  { label: selectedUser.type === 'Enterprise' ? 'IEC' : 'Crops', value: selectedUser.type === 'Enterprise' ? selectedUser.iec : selectedUser.crops },
                  { label: 'Applied', value: selectedUser.appliedAt },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', width: 80, flexShrink: 0 }}>{item.label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Document Cards */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontWeight: 700, marginBottom: 12 }}>{t('Documents Submitted', '.')}</p>
                {selectedUser.docs.map((doc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-page)', borderRadius: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: '1.25rem' }}>{doc.icon}</span>
                    <span style={{ flex: 1, fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{doc.name}</span>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--green-primary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 600 }}>
                      <Eye size={14} /> View
                    </button>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {selectedUser.status === 'pending' && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-primary btn-full" onClick={() => handleApprove(selectedUser.id)}>
                    <ShieldCheck size={16} /> {t('Approve', '.')}
                  </button>
                  <button className="btn btn-danger btn-full" onClick={() => setShowRejectModal(selectedUser.id)}>
                    <ShieldX size={16} /> {t('Reject', '.')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal" initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <ShieldX size={40} color="var(--red)" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)' }}>{t('Reject Application', '.')}</h3>
                <p style={{ fontSize: '0.875rem' }}>{t('Please provide a reason for rejection. This will be sent to the applicant.', '.')}</p>
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">{t('Rejection Reason', '.')}</label>
                <textarea className="form-textarea" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder={t('e.g. Document unclear, please resubmit.', '.')} />
              </div>
              <div className="chip-group" style={{ marginBottom: 20 }}>
                {['Invalid document', 'Document unclear', 'Mismatch in details', 'Area not served yet'].map(r => (
                  <button key={r} className={`chip ${rejectReason === r ? 'active' : ''}`} onClick={() => setRejectReason(r)} style={{ fontSize: '0.8rem' }}>{r}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost btn-full" onClick={() => setShowRejectModal(null)}>{t('Cancel', '.')}</button>
                <button className="btn btn-danger btn-full" onClick={() => handleReject(showRejectModal)} disabled={!rejectReason}>{t('Reject', '.')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
