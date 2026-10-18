import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Edit, ShieldCheck, Camera, Star } from 'lucide-react';
import { FadeUpItem } from '../../components/common/AnimatedComponents';
import api from '../../services/api';

export default function EnterpriseProfile() {
  const { user, buyerRequirements, addToast } = useApp();
  const [editing, setEditing] = useState(null);
  const [reviewTab, setReviewTab] = useState('received');
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (user?.id) {
      api.reviews.getByUser(user.id)
        .then(res => {
          if (res?.data) setReviews(res.data);
        })
        .catch(() => {});
    }
  }, [user]);

  const ep = user?.enterpriseProfile || {};
  const myDemandsCount = (buyerRequirements || []).filter(r => 
    String(r.enterpriseId) === String(user?.id) || 
    String(r.enterprise_id) === String(user?.id) ||
    String(r.buyerId) === String(user?.id)
  ).length;

  const [profileData, setProfileData] = useState({
    name: ep.companyName || user?.name || 'My Enterprise',
    type: ep.companyType || user?.businessType || 'Exporter',
    city: [ep.city || user?.city, ep.state || user?.state].filter(Boolean).join(', ') || 'India',
    contactPerson: user?.name || 'Owner',
    phone: user?.phone || 'Not provided',
    email: user?.email || '',
    gst: ep.gstin || 'Not provided',
    iec: ep.iecCode || 'Not provided',
    crops: Array.isArray(ep.targetCrops) ? ep.targetCrops.join(', ') : (ep.targetCrops || 'All Agri Commodities'),
    minOrder: ep.minOrderQuantity ? `${ep.minOrderQuantity} ${ep.minOrderUnit || 'ton'}` : '1 ton',
  });

  // Sync if user profile updates
  useEffect(() => {
    if (user) {
      const p = user.enterpriseProfile || {};
      setProfileData({
        name: p.companyName || user.name || 'My Enterprise',
        type: p.companyType || user.businessType || 'Exporter',
        city: [p.city || user.city, p.state || user.state].filter(Boolean).join(', ') || 'India',
        contactPerson: user.name || 'Owner',
        phone: user.phone || 'Not provided',
        email: user.email || '',
        gst: p.gstin || 'Not provided',
        iec: p.iecCode || 'Not provided',
        crops: Array.isArray(p.targetCrops) ? p.targetCrops.join(', ') : (p.targetCrops || 'All Agri Commodities'),
        minOrder: p.minOrderQuantity ? `${p.minOrderQuantity} ${p.minOrderUnit || 'ton'}` : '1 ton',
      });
    }
  }, [user]);

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

  const avgRating = user?.rating ? Number(user.rating).toFixed(1) : (reviews.length > 0 ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1) : '5.0');
  const totalReviews = reviews.length;

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Green Header */}
      <div style={{ background: 'var(--green-primary)', padding: '32px 0 80px' }}>
        <div className="container">
          <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Enterprise Profile
          </h2>
        </div>
      </div>

      <div className="container" style={{ marginTop: -56, paddingBottom: 40 }}>
        {/* Avatar & Quick Stats Card */}
        <FadeUpItem>
          <div className="card card-body" style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 16px' }}>
              <div style={{ width: 96, height: 96, background: 'var(--green-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', border: '4px solid #fff', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
                {typeof user?.avatar === 'string' && (user.avatar.startsWith('data:') || user.avatar.startsWith('http') || user.avatar.startsWith('/')) ? (
                  <img src={user.avatar} alt={profileData.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.avatar || '🏢'
                )}
              </div>
              <button
                onClick={() => addToast('Logo update requested', 'info')}
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
                  {user?.is_verified || user?.isVerified ? 'Verified Enterprise' : 'Registered Enterprise'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 32, justifyContent: 'center' }}>
              {[
                { value: avgRating, label: 'Rating' },
                { value: totalReviews, label: 'Reviews' },
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

        {/* Profile Fields Card */}
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

        {/* Reviews Card */}
        <FadeUpItem>
          <div className="card card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>Farmer Reviews</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={18} fill="var(--amber)" color="var(--amber)" />
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem' }}>{avgRating}</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>avg.</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>⭐</div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>No reviews yet</p>
                <p style={{ fontSize: '0.875rem', margin: 0 }}>
                  Reviews will appear here once farmers complete deals and submit ratings for your company.
                </p>
              </div>
            ) : (
              <div>
                <div className="tab-bar" style={{ marginBottom: 16 }}>
                  <div className={`tab-item ${reviewTab === 'received' ? 'active' : ''}`} onClick={() => setReviewTab('received')}>
                    Received ({reviews.length})
                  </div>
                </div>

                {reviews.map((rev, i) => (
                  <div key={i} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: i < reviews.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong style={{ fontSize: '0.9rem' }}>{rev.reviewer_name || 'Farmer'}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} style={{ color: s <= (rev.rating || 5) ? 'var(--amber)' : '#E5E7EB' }}>★</span>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.875rem', margin: 0, color: 'var(--text-primary)' }}>
                      "{rev.comment || 'Verified transaction completed.'}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeUpItem>
      </div>
    </div>
  );
}
