import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Check, AlertTriangle, Upload } from 'lucide-react';
import { FadeUpItem, SpinnerBtn } from '../../components/common/AnimatedComponents';

const REPORT_REASONS = ['Did not pay', 'Fake buyer/seller', 'Rude behaviour', 'Low quality product', 'Fraudulent listing', 'Other'];

export default function Notifications() {
  const { notifications, markAllRead, unreadCount } = useApp();
  const [activeTab, setActiveTab] = useState('notifs');
  const [reason, setReason] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReport = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1500);
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
            {notifications.map((n, i) => (
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
                  <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{n.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: n.read ? 400 : 600, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.5, fontSize: '0.9rem' }}>{n.text}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.time}</span>
                  </div>
                  {!n.read && <div className="notif-dot" style={{ marginTop: 6 }} />}
                </motion.div>
              </FadeUpItem>
            ))}
          </div>
        )}

        {activeTab === 'report' && (
          <FadeUpItem>
            {sent ? (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ textAlign: 'center', padding: 48, background: 'var(--green-light)', borderRadius: 24 }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                <h3 style={{ fontFamily: 'var(--font-heading)' }}>Report Submitted</h3>
                <p>Our team will review within 48 hours.</p>
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
                  <input className="form-input" placeholder="Ahmed Spice Exports" />
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
                  <textarea className="form-textarea" rows={4} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe what happened..." />
                </div>
                <div className="upload-zone" style={{ marginBottom: 20 }}>
                  <Upload size={24} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '0.875rem', margin: 0, color: 'var(--text-secondary)' }}>Upload evidence (screenshots)</p>
                </div>
                <SpinnerBtn loading={loading} onClick={handleReport} className="btn btn-danger btn-full">
                  <AlertTriangle size={16} /> Submit Report
                </SpinnerBtn>
              </div>
            )}
          </FadeUpItem>
        )}
      </div>
    </div>
  );
}
