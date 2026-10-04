import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { MapPin, ShieldCheck, Star, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { LISTINGS, FARMERS } from '../../data/sampleData';
import { FadeUpItem, StaggerGrid, StarRating } from '../../components/common/AnimatedComponents';
import { translateTerm } from '../../utils/translationUtils';

const REVIEWS = [
  { name: 'Ahmed Spice Exports', rating: 5, comment: 'Excellent quality jeera. Delivered as promised. Will buy again.', date: 'Sep 2026', verified: true },
  { name: 'Patel Agro Traders', rating: 4, comment: 'Good quality and honest farmer. Slight delay in pickup coordination.', date: 'Aug 2026', verified: true },
  { name: 'Kesar Mango World', rating: 5, comment: 'Best jeera supplier in Unjha area. Premium grade.', date: 'Jul 2026', verified: true },
];

export default function ProduceDetail() {
  const { id } = useParams();
  const { t, lang, role, addToast, produceListings } = useApp();
  const navigate = useNavigate();
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showOffer, setShowOffer] = useState(false);

  // Find listing by id from shared produceListings or fallback
  const listing = (produceListings || []).find(l => l.id === id) || LISTINGS.find(l => l.id === id) || LISTINGS[0];
  const farmer = FARMERS.find(f => f.id === listing.farmerId) || FARMERS[0];

  const photos = [listing.photos?.[0] || '🌿', listing.photos?.[1] || listing.photos?.[0] || '📦', listing.photos?.[0] || '🌱'];

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else if (role === 'farmer') {
      navigate('/farmer/listings');
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-secondary)',
            fontWeight: 500,
            marginBottom: 24,
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--green-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <ChevronLeft size={20} /> {t('Back', 'પાછળ')}
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'flex-start' }}>
          {/* Left Column */}
          <div>
            {/* Photo Gallery */}
            <FadeUpItem>
              <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 24, position: 'relative' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={photoIdx}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ height: 360, background: 'linear-gradient(135deg, var(--green-light), #C8E6C9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8rem' }}
                  >
                    {photos[photoIdx]}
                  </motion.div>
                </AnimatePresence>
                {photos.length > 1 && (
                  <>
                    <button onClick={() => setPhotoIdx(p => (p - 1 + photos.length) % photos.length)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setPhotoIdx(p => (p + 1) % photos.length)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
                <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                  {photos.map((_, i) => (
                    <div key={i} style={{ width: i === photoIdx ? 20 : 8, height: 8, borderRadius: 4, background: i === photoIdx ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'all 0.3s', cursor: 'pointer' }} onClick={() => setPhotoIdx(i)} />
                  ))}
                </div>
              </div>
            </FadeUpItem>

            {/* Description */}
            <FadeUpItem>
              <div className="card card-body" style={{ marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>{t('About This Produce', 'આ ઉત્પાદ વિશે')}</h3>
                <p style={{ lineHeight: 1.7 }}>{listing.description || (lang === 'gu' ? listing.gujDesc : listing.description)}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                  {listing.organic && <span className="badge badge-green">🌱 {t('Organic Certified', 'ઓર્ગેનિક પ્રમાણિત')}</span>}
                  {listing.exportReady && <span className="badge badge-blue">✈️ {t('Export Ready', 'નિકાસ રેડી')}</span>}
                  <span className="badge badge-amber">⭐ {translateTerm(listing.grade, lang)}</span>
                  {listing.expires && <span className="badge badge-gray">📅 {t('Expires', 'સ.')} {listing.expires}</span>}
                </div>
              </div>
            </FadeUpItem>

            {/* Specifications Table */}
            {listing.specs && Object.keys(listing.specs).length > 0 && (
              <FadeUpItem>
                <div className="card card-body" style={{ marginBottom: 24 }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 16 }}>
                    🔬 {t('Specifications', 'વ. ​​મ.')}
                  </h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <tbody>
                        {Object.entries(listing.specs).map(([key, val], i) => (
                          <tr key={key} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg-page)' : '#fff' }}>
                            <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'capitalize', width: '38%' }}>
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </td>
                            <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: 500 }}>{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </FadeUpItem>
            )}

            {/* Farmer Card */}
            <FadeUpItem>
              <div className="card card-body" style={{ marginBottom: 24 }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 16 }}>{t('About the Farmer', 'ખેડૂત વિશે')}</h4>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div className="avatar avatar-xl" style={{ background: 'var(--green-light)', fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: 72, height: 72, flexShrink: 0 }}>
                    {farmer.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h4 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>{farmer.name}</h4>
                      {farmer.verified && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--green-light)', borderRadius: 20, padding: '2px 8px' }}>
                          <ShieldCheck size={12} color="var(--green-primary)" />
                          <span style={{ fontSize: '0.75rem', color: 'var(--green-primary)', fontWeight: 600 }}>Verified</span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                      <MapPin size={14} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{farmer.village}, {farmer.district}, {farmer.state}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StarRating rating={farmer.rating} />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{farmer.rating}</span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>({farmer.reviews} reviews)</span>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>🌱 Land: {farmer.land}</span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>📅 Since {farmer.since}</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeUpItem>

            {/* Reviews */}
            <FadeUpItem>
              <div className="card card-body">
                <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>{t('Reviews', 'સમીક્ષા')} ({REVIEWS.length})</h4>
                {REVIEWS.map((rev, i) => (
                  <div key={i} style={{ paddingBottom: 20, marginBottom: 20, borderBottom: i < REVIEWS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{rev.name}</span>
                          {rev.verified && <ShieldCheck size={14} color="var(--green-primary)" />}
                        </div>
                        <StarRating rating={rev.rating} size={14} />
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rev.date}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            </FadeUpItem>
          </div>

          {/* Right Sticky Column */}
          <div style={{ position: 'sticky', top: 88 }}>
            <FadeUpItem>
              <div className="card card-body" style={{ marginBottom: 16 }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: 4, fontSize: '1.75rem' }}>
                  {listing.cropName}
                </h2>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2.5rem', color: 'var(--green-primary)' }}>₹{listing.price}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>/{t('kg', 'કિલો')}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: t('Quantity', 'જથ્થો'), value: `${listing.qty} ${translateTerm(listing.unit, lang)}` },
                    { label: t('Grade', 'ગ્રેડ'), value: translateTerm(listing.grade, lang) },
                    { label: t('Location', 'સ્થળ'), value: `${listing.village}, ${translateTerm(listing.district, lang)}` },
                    { label: t('Offers Received', 'ઑફર'), value: `${listing.offers} ${t('offers', 'ઑફર્સ')}` },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'var(--bg-page)', borderRadius: 10, padding: '12px 14px' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', margin: '0 0 4px' }}>{item.label}</p>
                      <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontSize: '0.9375rem' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                {role === 'enterprise' ? (
                  <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate(`/enterprise/send-offer/${listing.id}`)}>
                    <MessageSquare size={18} /> {t('Send Offer', 'ઑફર મોકલો')}
                  </button>
                ) : role === 'farmer' ? (
                  <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                    <p style={{ color: 'var(--green-primary)', fontWeight: 600, margin: 0, fontSize: '0.875rem' }}>🌾 {t('This is your listing', 'આ તમારી યાદી છે')}</p>
                  </div>
                ) : (
                  <Link to="/login" className="btn btn-outline btn-full btn-lg">
                    {t('Login to Send Offer', 'ઑફર માટે લૉગ ઇન')}
                  </Link>
                )}
              </div>
            </FadeUpItem>

            <FadeUpItem>
              <div style={{ background: 'var(--amber-light)', borderRadius: 16, padding: '16px 20px', border: '1px solid #FCD34D' }}>
                <p style={{ fontSize: '0.8125rem', color: '#92400E', margin: 0, lineHeight: 1.6 }}>
                  ⚠️ {t('Platform only connects buyers & sellers. Shipping, customs, and payments are arranged directly between parties.', 'પ્લૅટફોર્મ ફક્ત જોડે છે. શિપિંગ, કસ્ટમ, ચુકવણી સીધી ગોઠવો.')}
                </p>
              </div>
            </FadeUpItem>
          </div>
        </div>
      </div>
    </div>
  );
}
