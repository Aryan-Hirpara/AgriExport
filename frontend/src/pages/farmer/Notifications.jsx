import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Check, AlertTriangle, Upload } from 'lucide-react';
import { FadeUpItem, SpinnerBtn } from '../../components/common/AnimatedComponents';
import api from '../../services/api';

const REPORT_REASONS = ['Did not pay', 'Fake buyer/seller', 'Rude behaviour', 'Low quality product', 'Fraudulent listing', 'Other'];

export default function Notifications() {
  const { notifications, markAllRead, unreadCount, addToast } = useApp();
  const [activeTab, setActiveTab] = useState('notifs');
  const [reportedUser, setReportedUser] = useState('');
  const [reason, setReason] = useState('Did not pay');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReport = async () => {
    if (!desc.trim()) {
      addToast('Please provide a description of the issue', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.complaints.create({
        subject: reason,
        description: `${reportedUser ? `Against: ${reportedUser}\n` : ''}${desc}`,
      });
      setSent(true);
      addToast('Complaint submitted for admin review', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to submit complaint', 'error');
    } finally {
      setLoading(false);
    }
  };

  const NOTIF_TYPE_STYLES = {
    offer: { bg: 'var(--amber-light)', border: '#FBBF24' },
    deal: { bg: 'var(--green-light)', border: '#86EFAC' },
    verify: { bg: 'var(--green-light)', border: '#86EFAC' },
    price: { bg: 'var(--blue-light)', border: '#93C5FD' },
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ background: 'var(--green-primary)', padding: '32px 0 48px' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>Notifications</h2>
            {unreadCount > 0 && <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}><span className="notranslate">{unreadCount}</span> unread</p>}
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }} onClick={markAllRead}>
              <Check size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="container" style={{ marginTop: -20, paddingBottom: 40 }}>
        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', borderRadius: 20, padding: '8px', boxShadow: 'var(--shadow-md)', marginBottom: 24, display: 'flex', gap: 6 }}>
          {[{ key: 'notifs', label: 'Notifications' }, { key: 'report', label: '⚠️ Report Problem' }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', background: activeTab === tab.key ? 'var(--green-primary)' : 'transparent', color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'var(--font-heading)', transition: 'all 0.2s' }}>
              {tab.label}
            </button>
          ))}
        </motion.div>

        {activeTab === 'notifs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(!notifications || notifications.length === 0) ? (
              <div className="card card-body" style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔔</div>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: 4 }}>No notifications yet</h4>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>You'll receive live alerts here when enterprises send offers or updates.</p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <FadeUpItem key={n.id} delay={i * 0.05}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    style={{
                      display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 20px',
                      background: n.read ? '#fff' : NOTIF_TYPE_STYLES[n.type]?.bg || 'var(--green-light)',
                      borderRadius: 14,
                      border: `1.5px solid ${n.read ? 'var(--border)' : NOTIF_TYPE_STYLES[n.type]?.border || '#86EFAC'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{n.icon || '🔔'}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: n.read ? 400 : 600, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.5, fontSize: '0.9rem' }}>{n.text}</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.time}</span>
                    </div>
                    {!n.read && <div className="notif-dot" style={{ marginTop: 6 }} />}
                  </motion.div>
                </FadeUpItem>
              ))
            )}
          </div>
        )}

        {activeTab === 'report' && (
          <FadeUpItem>
            {sent ? (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ textAlign: 'center', padding: 48, background: 'var(--green-light)', borderRadius: 24 }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                <h3 style={{ fontFamily: 'var(--font-heading)' }}>Report Submitted</h3>
                <p>Our administrative team has recorded your complaint and will review it within 48 hours.</p>
                <button className="btn btn-outline" onClick={() => { setSent(false); setDesc(''); setReportedUser(''); }} style={{ marginTop: 16 }}>
                  Submit Another Report
                </button>
              </motion.div>
            ) : (
              <div className="card card-body">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24, background: 'var(--red-light)', borderRadius: 12, padding: '16px 20px' }}>
                  <AlertTriangle size={22} color="var(--red)" />
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--red)', margin: 0 }}>Report a Problem</p>
                    <p style={{ fontSize: '0.8125rem', margin: 0, color: '#991B1B' }}>Only submit genuine complaints. False reports may result in account suspension.</p>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Reported User / Enterprise</label>
                  <input className="form-input" placeholder="e.g. Enterprise or Trader Name" value={reportedUser} onChange={e => setReportedUser(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Reason</label>
                  <div className="chip-group">
                    {REPORT_REASONS.map(r => (
                      <button key={r} className={`chip ${reason === r ? 'active' : ''}`} onClick={() => setReason(r)} style={{ fontSize: '0.8125rem' }}>{r}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" rows={4} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe what happened in detail..." />
                </div>
                <button className="btn btn-primary btn-full btn-lg" onClick={handleReport} disabled={loading || !desc.trim()}>
                  <SpinnerBtn loading={loading}>Submit Complaint</SpinnerBtn>
                </button>
              </div>
            )}
          </FadeUpItem>
        )}
      </div>
    </div>
  );
}
