import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { ShieldX, ShieldCheck, Eye, Search, AlertCircle } from 'lucide-react';
import { FadeUpItem } from '../../components/common/AnimatedComponents';
import api from '../../services/api';

const STATUS_BADGE = { open: 'badge-red', investigating: 'badge-amber', resolved: 'badge-green' };
const SEV_BADGE = { high: 'badge-red', medium: 'badge-amber', low: 'badge-blue' };

export default function Complaints() {
  const { addToast } = useApp();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchComplaints = () => {
    setLoading(true);
    api.admin.getComplaints()
      .then(res => {
        if (res?.data) {
          const formatted = res.data.map(c => ({
            id: c.id,
            reporter: c.filed_by_name || 'User',
            against: c.against_name || 'Counterparty',
            type: `${c.filed_by_role === 'farmer' ? 'Farmer' : 'Enterprise'} vs ${c.against_role === 'farmer' ? 'Farmer' : 'Enterprise'}`,
            reason: c.subject || c.reason || 'Trade dispute',
            status: c.status || 'open',
            date: new Date(c.created_at).toLocaleDateString(),
            severity: c.severity || 'medium',
            desc: c.description || 'No description provided.',
          }));
          setComplaints(formatted);
        }
      })
      .catch(err => console.error('Failed to load complaints:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filtered = complaints.filter(c => statusFilter === 'All' || c.status === statusFilter.toLowerCase());
  const selectedComplaint = selected ? complaints.find(c => c.id === selected) : null;

  const handleAction = async (id, action) => {
    try {
      await api.admin.resolveComplaint(id, {
        status: action,
        resolutionNotes: adminNote || `Marked as ${action} by administrator.`,
      });
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: action } : c));
      setSelected(null);
      setAdminNote('');
      addToast(action === 'resolved' ? 'Complaint resolved!' : 'Status updated', 'success');
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    }
  };

  return (
    <div style={{ padding: '32px', height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      <FadeUpItem>
        <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>Complaint Management</h2>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            {complaints.filter(c => c.status === 'open').length} open complaints
          </p>
          <div className="chip-group">
            {['All', 'Open', 'Investigating', 'Resolved'].map(s => (
              <button key={s} className={`chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                {s} ({complaints.filter(c => s === 'All' || c.status === s.toLowerCase()).length})
              </button>
            ))}
          </div>
        </div>
      </FadeUpItem>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
          Loading dispute records...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card card-body" style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--text-muted)' }}>
          <ShieldCheck size={48} color="var(--green-primary)" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
          <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: 8 }}>
            No Complaints Found
          </h4>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            There are no complaints under this status. All trade deals are operating dispute-free.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedComplaint ? '1fr 1fr' : '1fr', gap: 20 }}>
          {/* Complaints List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(c.id === selected ? null : c.id)}
                style={{ padding: '18px 20px', background: '#fff', borderRadius: 14, border: `1.5px solid ${selected === c.id ? 'var(--green-primary)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className={`badge ${STATUS_BADGE[c.status] || 'badge-gray'}`} style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>{c.status}</span>
                    <span className={`badge ${SEV_BADGE[c.severity] || 'badge-gray'}`} style={{ fontSize: '0.7rem' }}>{c.severity} severity</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.date}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.reporter}</span>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <span style={{ fontWeight: 700, color: 'var(--red)' }}>{c.against}</span>
                </div>
                <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-secondary)' }}>📋 {c.reason} • {c.type}</p>
              </motion.div>
            ))}
          </div>

          {/* Detail Panel */}
          {selectedComplaint && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}>
              <div className="card card-body">
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  <span className={`badge ${STATUS_BADGE[selectedComplaint.status] || 'badge-gray'}`}>{selectedComplaint.status}</span>
                  <span className={`badge ${SEV_BADGE[selectedComplaint.severity] || 'badge-gray'}`}>{selectedComplaint.severity}</span>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12, padding: '12px', background: '#FEF2F2', borderRadius: 10 }}>
                    <span>📢</span>
                    <div>
                      <p style={{ fontWeight: 700, margin: 0, fontSize: '0.875rem', color: '#991B1B' }}>Reporter</p>
                      <p style={{ margin: 0, color: '#991B1B', fontSize: '0.875rem' }}>{selectedComplaint.reporter}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, padding: '12px', background: '#F9FAFB', borderRadius: 10 }}>
                    <span>⚠️</span>
                    <div>
                      <p style={{ fontWeight: 700, margin: 0, fontSize: '0.875rem' }}>Against</p>
                      <p style={{ margin: 0, fontSize: '0.875rem' }}>{selectedComplaint.against}</p>
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontWeight: 700, marginBottom: 8 }}>Complaint Details</p>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.7, background: 'var(--bg-page)', padding: '14px', borderRadius: 10 }}>{selectedComplaint.desc}</p>
                </div>
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Admin Note / Resolution</label>
                  <textarea className="form-textarea" rows={3} value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Add notes or resolution details..." />
                </div>
                {selectedComplaint.status !== 'resolved' && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-secondary btn-full" onClick={() => handleAction(selectedComplaint.id, 'investigating')}>
                      🔍 Investigating
                    </button>
                    <button className="btn btn-primary btn-full" onClick={() => handleAction(selectedComplaint.id, 'resolved')}>
                      <ShieldCheck size={16} /> Resolve
                    </button>
                  </div>
                )}
                {selectedComplaint.status === 'resolved' && (
                  <div style={{ background: 'var(--green-light)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                    <p style={{ fontWeight: 700, color: 'var(--green-primary)', margin: 0 }}>✅ Complaint Resolved</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
