import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { ShieldX, ShieldCheck, Eye, Search } from 'lucide-react';
import { FadeUpItem } from '../../components/common/AnimatedComponents';

const COMPLAINTS = [
  { id: 'c1', reporter: 'Ramesh Patel', against: 'Fast Trade Agro', type: 'Farmer vs Enterprise', reason: 'Did not pay', status: 'open', date: '28 Sep 2026', severity: 'high', desc: 'Enterprise agreed to ₹315/kg for 5 ton jeera but transferred only ₹308/kg after pickup. Difference of ₹35,000 unpaid.' },
  { id: 'c2', reporter: 'Ahmed Spice Exports', against: 'Bhavesh Patel', type: 'Enterprise vs Farmer', reason: 'Low quality product', status: 'investigating', date: '27 Sep 2026', severity: 'medium', desc: 'Farmer claimed Grade A jeera but delivered Grade B. Quality reports submitted.' },
  { id: 'c3', reporter: 'Karsan Solanki', against: 'Global Agri Corp', type: 'Farmer vs Enterprise', reason: 'Fraudulent listing', status: 'resolved', date: '20 Sep 2026', severity: 'low', desc: 'Enterprise listed as having IEC certificate but showed no valid certificate during deal.' },
];

const STATUS_BADGE = { open: 'badge-red', investigating: 'badge-amber', resolved: 'badge-green' };
const SEV_BADGE = { high: 'badge-red', medium: 'badge-amber', low: 'badge-blue' };

export default function Complaints() {
  const { addToast } = useApp();
  const [complaints, setComplaints] = useState(COMPLAINTS);
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = complaints.filter(c => statusFilter === 'All' || c.status === statusFilter.toLowerCase());
  const selectedComplaint = selected ? complaints.find(c => c.id === selected) : null;

  const handleAction = (id, action) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: action } : c));
    setSelected(null);
    addToast(action === 'resolved' ? 'Complaint resolved!' : 'Status updated', 'success');
  };

  return (
    <div style={{ padding: '32px', height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      <FadeUpItem>
        <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>Complaint Management</h2>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          <p style={{ margin: 0 }}>{complaints.filter(c => c.status === 'open').length} open complaints</p>
          <div className="chip-group">
            {['All', 'Open', 'Investigating', 'Resolved'].map(s => (
              <button key={s} className={`chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>{s} ({complaints.filter(c => s === 'All' || c.status === s.toLowerCase()).length})</button>
            ))}
          </div>
        </div>
      </FadeUpItem>

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
                  <span className={`badge ${STATUS_BADGE[c.status]}`} style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>{c.status}</span>
                  <span className={`badge ${SEV_BADGE[c.severity]}`} style={{ fontSize: '0.7rem' }}>{c.severity} severity</span>
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
                <span className={`badge ${STATUS_BADGE[selectedComplaint.status]}`}>{selectedComplaint.status}</span>
                <span className={`badge ${SEV_BADGE[selectedComplaint.severity]}`}>{selectedComplaint.severity}</span>
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
    </div>
  );
}
