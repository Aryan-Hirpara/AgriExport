import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Edit, ShieldCheck, Camera, Star } from 'lucide-react';
import { FadeUpItem } from '../../components/common/AnimatedComponents';

const REVIEWS_RECEIVED = [
  { from: 'Ahmed Spice Exports', rating: 5, text: 'Excellent quality jeera. Farmer is honest and reliable.', date: 'Sep 2026', type: 'received' },
  { from: 'Kesar Mango World', rating: 5, text: 'Best jeera supplier in Mehsana. Highly recommended.', date: 'Aug 2026', type: 'received' },
];
const REVIEWS_GIVEN = [
  { to: 'Patel Agro Traders', rating: 4, text: 'Good enterprise, slight payment delay but resolved.', date: 'Sep 2026', type: 'given' },
];

export default function FarmerProfile() {
  const { t } = useApp();
  const [editing, setEditing] = useState(null);
  const [reviewTab, setReviewTab] = useState('received');

  const [profileFields, setProfileFields] = useState([
    { key: 'name', label: t('Full Name', 'પૂ. નામ'), value: 'Ramesh Patel' },
    { key: 'phone', label: t('Mobile', 'મોબ.'), value: '9876543210' },
    { key: 'village', label: t('Village', 'ગામ'), value: 'Unjha, Mehsana' },
    { key: 'land', label: t('Land Size', 'જમીન'), value: '12 bigha' },
    { key: 'crops', label: t('Main Crops', 'મુખ્ય પાક'), value: 'Jeera, Fennel, Coriander' },
  ]);

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ background: 'var(--green-primary)', padding: '32px 0 80px' }}>
        <div className="container">
          <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>{t('My Profile', 'મારી પ્રોફાઈલ')}</h2>
        </div>
      </div>

      <div className="container" style={{ marginTop: -56, paddingBottom: 40 }}>
        {/* Avatar Card */}
        <FadeUpItem>
          <div className="card card-body" style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 16px' }}>
              <div style={{ width: 96, height: 96, background: 'var(--green-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', border: '4px solid #fff', boxShadow: 'var(--shadow-md)' }}>
                🧑‍🌾
              </div>
              <button style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: '50%', background: 'var(--green-primary)', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={14} color="#fff" />
              </button>
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 4 }}>
              Ramesh Patel
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--green-light)', borderRadius: 20, padding: '4px 12px' }}>
                <ShieldCheck size={14} color="var(--green-primary)" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--green-primary)' }}>{t('Verified Farmer', 'ચ. ખેડૂત')}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 32, justifyContent: 'center' }}>
              {[
                { value: 4.8, label: t('Rating', 'રેટ') },
                { value: 34, label: t('Reviews', 'સ.') },
                { value: 3, label: t('Listings', 'ય.') },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)' }}>{s.value}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeUpItem>

        {/* Profile Fields */}
        <FadeUpItem>
          <div className="card" style={{ marginBottom: 24, overflow: 'hidden' }}>
            {profileFields.map((field, i) => (
              <div key={field.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: i < profileFields.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 2px' }}>{field.label}</p>
                  {editing === field.key ? (
                    <input className="form-input" defaultValue={field.value} autoFocus style={{ padding: '6px 12px', height: 36, fontSize: '0.9rem' }} onBlur={(e) => {
                      setProfileFields(prev => prev.map(f => f.key === field.key ? { ...f, value: e.target.value } : f));
                      setEditing(null);
                    }} />
                  ) : (
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{field.value}</p>
                  )}
                </div>
                <button onClick={() => setEditing(editing === field.key ? null : field.key)} style={{ border: 'none', background: 'var(--green-light)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green-primary)', fontWeight: 600, fontSize: '0.8125rem' }}>
                  <Edit size={14} /> {t('Edit', 'ફ.')}
                </button>
              </div>
            ))}
          </div>
        </FadeUpItem>

        {/* Security */}
        <FadeUpItem>
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontWeight: 600, margin: 0 }}>{t('Change Password', 'પ. બ.')}</p>
              <button className="btn btn-outline btn-sm">{t('Update', 'અ.')}</button>
            </div>
          </div>
        </FadeUpItem>

        {/* Reviews */}
        <FadeUpItem>
          <div className="card card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>{t('My Reviews', 'સ. સ.')}</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={18} fill="var(--amber)" color="var(--amber)" />
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem' }}>4.8</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>avg.</span>
              </div>
            </div>
            {/* Star distribution */}
            <div style={{ marginBottom: 20 }}>
              {[5, 4, 3, 2, 1].map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, width: 12 }}>{s}</span>
                  <span style={{ color: 'var(--amber)' }}>★</span>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: s === 5 ? '80%' : s === 4 ? '15%' : '5%' }} transition={{ duration: 0.8, delay: 0.2 }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: 20 }}>{s === 5 ? 27 : s === 4 ? 5 : 2}</span>
                </div>
              ))}
            </div>
            {/* Tabs */}
            <div className="tab-bar">
              {['received', 'given'].map(tab => (
                <div key={tab} className={`tab-item ${reviewTab === tab ? 'active' : ''}`} onClick={() => setReviewTab(tab)}>
                  {tab === 'received' ? t('Received', 'મ.') : t('Given', 'આ.')} ({tab === 'received' ? REVIEWS_RECEIVED.length : REVIEWS_GIVEN.length})
                </div>
              ))}
            </div>
            {(reviewTab === 'received' ? REVIEWS_RECEIVED : REVIEWS_GIVEN).map((rev, i) => (
              <div key={i} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: i < 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontSize: '0.9rem' }}>{rev.from || rev.to}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rev.date}</span>
                </div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= rev.rating ? 'var(--amber)' : '#E5E7EB' }}>★</span>)}
                </div>
                <p style={{ fontSize: '0.875rem', margin: 0 }}>"{rev.text}"</p>
              </div>
            ))}
          </div>
        </FadeUpItem>
      </div>
    </div>
  );
}
