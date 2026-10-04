import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Edit, ShieldCheck, Camera, Star } from 'lucide-react';
import { FadeUpItem } from '../../components/common/AnimatedComponents';
import { ENTERPRISES } from '../../data/sampleData';

const REVIEWS_RECEIVED = [
  { from: 'Ramesh Patel (Unjha)', rating: 5, text: 'Quick payment and transparent weight slip. Honest enterprise.', date: 'Sep 2026' },
  { from: 'Bhavna Ben Desai (Visnagar)', rating: 5, text: 'Good rates offered according to market quality.', date: 'Aug 2026' },
];
const REVIEWS_GIVEN = [
  { to: 'Ramesh Patel', rating: 5, text: 'Clean and sun-dried jeera quality. Timely supply.', date: 'Sep 2026' },
];

export default function EnterpriseProfile() {
  const { user, buyerRequirements, addToast } = useApp();
  const [editing, setEditing] = useState(null);
  const [reviewTab, setReviewTab] = useState('received');

  const baseEnt = ENTERPRISES.find(e => e.id === user?.id) || ENTERPRISES[0];
  const myDemandsCount = (buyerRequirements || []).filter(r => r.enterpriseId === (user?.id || 'e1')).length || 4;

  const [profileData, setProfileData] = useState({
    name: baseEnt.name || 'Ahmed Spice Exports',
    type: baseEnt.type || 'Exporter',
    city: `${baseEnt.city || 'Ahmedabad'}, Gujarat`,
    contactPerson: 'Sohail Ahmed',
    phone: '+91 98250 11223',
    email: 'contact@ahmedspices.com',
    gst: baseEnt.gst || '24AAACA1234B1Z5',
    iec: baseEnt.iec || 'AAACA1234B',
    crops: 'Jeera, Fennel, Coriander, Sesame',
    minOrder: baseEnt.minOrder || '5 ton',
  });

  const profileFields = [
    { key: 'name', label: 'Company Name', value: profileData.name },
    { key: 'type', label: 'Business Type', value: profileData.type },
    { key: 'city', label: 'Location', value: profileData.city },
    { key: 'contactPerson', label: 'Contact Person', value: profileData.contactPerson },
    { key: 'phone', label: 'Mobile / Phone', value: profileData.phone },
    { key: 'email', label: 'Official Email', value: profileData.email },
    { key: 'gst', label: 'GSTIN', value: profileData.gst },
    { key: 'iec', label: 'IEC Code', value: profileData.iec },
    { key: 'crops', label: 'Procurement Crops', value: profileData.crops },
    { key: 'minOrder', label: 'Minimum Order (MOQ)', value: profileData.minOrder },
  ];

  const handleFieldChange = (key, newVal) => {
    setProfileData(prev => ({ ...prev, [key]: newVal }));
    setEditing(null);
    addToast('Field updated', 'success');
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Green Header (Identical to FarmerProfile) */}
      <div style={{ background: 'var(--green-primary)', padding: '32px 0 80px' }}>
        <div className="container">
          <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Enterprise Profile
          </h2>
        </div>
      </div>

      <div className="container" style={{ marginTop: -56, paddingBottom: 40 }}>
        {/* Avatar & Quick Stats Card (Identical layout to FarmerProfile) */}
        <FadeUpItem>
          <div className="card card-body" style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 16px' }}>
              <div style={{ width: 96, height: 96, background: 'var(--green-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', border: '4px solid #fff', boxShadow: 'var(--shadow-md)' }}>
                {baseEnt.logo || '🏢'}
              </div>
              <button
                onClick={() => addToast('Logo updated', 'info')}
                style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: '50%', background: 'var(--green-primary)', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="Change Logo"
              >
                <Camera size={14} color="#fff" />
              </button>
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 4 }}>
              {profileData.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--green-light)', borderRadius: 20, padding: '4px 12px' }}>
                <ShieldCheck size={14} color="var(--green-primary)" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--green-primary)' }}>
                  Verified Enterprise
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 32, justifyContent: 'center' }}>
              {[
                { value: baseEnt.rating || 4.8, label: 'Rating' },
                { value: baseEnt.reviews || 52, label: 'Reviews' },
                { value: myDemandsCount, label: 'Demands' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeUpItem>

        {/* Profile Fields Card (Identical clean rows to FarmerProfile) */}
        <FadeUpItem>
          <div className="card" style={{ marginBottom: 24, overflow: 'hidden' }}>
            {profileFields.map((field, i) => (
              <div
                key={field.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 24px',
                  borderBottom: i < profileFields.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ flex: 1, paddingRight: 16 }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 2px' }}>
                    {field.label}
                  </p>
                  {editing === field.key ? (
                    <input
                      className="form-input"
                      defaultValue={field.value}
                      autoFocus
                      style={{ padding: '6px 12px', height: 36, fontSize: '0.9rem', maxWidth: 360 }}
                      onBlur={(e) => handleFieldChange(field.key, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleFieldChange(field.key, e.target.value);
                        if (e.key === 'Escape') setEditing(null);
                      }}
                    />
                  ) : (
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {field.value}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setEditing(editing === field.key ? null : field.key)}
                  style={{
                    border: 'none',
                    background: 'var(--green-light)',
                    borderRadius: 8,
                    padding: '6px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--green-primary)',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    flexShrink: 0,
                  }}
                >
                  <Edit size={14} /> Edit
                </button>
              </div>
            ))}
          </div>
        </FadeUpItem>

        {/* Security Card */}
        <FadeUpItem>
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontWeight: 600, margin: 0 }}>Change Password</p>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => addToast('Password reset link sent to your registered email', 'info')}
              >
                Update
              </button>
            </div>
          </div>
        </FadeUpItem>

        {/* Reviews Card (Identical layout to FarmerProfile) */}
        <FadeUpItem>
          <div className="card card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>Farmer Reviews</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={18} fill="var(--amber)" color="var(--amber)" />
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem' }}>{baseEnt.rating || 4.8}</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>avg.</span>
              </div>
            </div>

            {/* Star Distribution */}
            <div style={{ marginBottom: 20 }}>
              {[5, 4, 3, 2, 1].map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, width: 12 }}>{s}</span>
                  <span style={{ color: 'var(--amber)' }}>★</span>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: s === 5 ? '82%' : s === 4 ? '14%' : '4%' }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: 24 }}>
                    {s === 5 ? 43 : s === 4 ? 7 : 2}
                  </span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="tab-bar">
              {['received', 'given'].map(tab => (
                <div
                  key={tab}
                  className={`tab-item ${reviewTab === tab ? 'active' : ''}`}
                  onClick={() => setReviewTab(tab)}
                >
                  {tab === 'received' ? 'Received' : 'Given'} ({tab === 'received' ? REVIEWS_RECEIVED.length : REVIEWS_GIVEN.length})
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
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} style={{ color: s <= rev.rating ? 'var(--amber)' : '#E5E7EB' }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: '0.875rem', margin: 0, color: 'var(--text-primary)' }}>
                  "{rev.text}"
                </p>
              </div>
            ))}
          </div>
        </FadeUpItem>
      </div>
    </div>
  );
}
