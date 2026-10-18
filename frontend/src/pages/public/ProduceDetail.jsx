import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { MapPin, ShieldCheck, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { FadeUpItem, StarRating } from '../../components/common/AnimatedComponents';
import api from '../../services/api';
import { getCropImage } from '../../utils/cropImages';

export default function ProduceDetail() {
  const { id } = useParams();
  const { role, user, produceListings, enterpriseOffers = [] } = useApp();
  const navigate = useNavigate();
  const [photoIdx, setPhotoIdx] = useState(0);
  const [dbListing, setDbListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cleanId = String(id).replace('l', '');
    api.listings.getById(cleanId)
      .then(res => {
        if (res.data) setDbListing(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Find listing from state or fetched API
  const listing = (produceListings || []).find(l => l.id === id || l.dbId === id || String(l.dbId) === String(id)) || dbListing;

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else if (role === 'farmer') {
      navigate('/farmer/listings');
    } else {
      navigate('/browse');
    }
  };

  if (!listing) {
    if (loading) {
      return (
        <div className="page-wrapper" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading produce details...</p>
        </div>
      );
    }

    return (
      <div className="page-wrapper" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 500 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🌾</div>
          <h2 style={{ marginBottom: 12 }}>Listing Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            The requested produce listing does not exist or has been removed.
          </p>
          <button onClick={handleGoBack} className="btn btn-primary">
            Back to Browse Produce
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user && (
    user.id === listing.farmerId ||
    user.dbId === listing.farmerDbId ||
    (listing.farmer_id && user.dbId === listing.farmer_id)
  );

  const isBuyer = user && (enterpriseOffers || []).some(o => 
    ((o.listingId && (o.listingId === listing.id || o.listingId === `l${listing.dbId}`)) ||
     (o.listingDbId && String(o.listingDbId) === String(listing.dbId))) &&
    o.status === 'accepted'
  );

  // If listing is sold, only the seller farmer or the buyer enterprise (or admin) can view it!
  if (listing.status === 'sold' && !isOwner && !isBuyer && role !== 'admin') {
    return (
      <div className="page-wrapper" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 500 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🤝</div>
          <h2 style={{ marginBottom: 12 }}>Produce Listing Sold</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            An offer on this produce listing was accepted and finalized. This lot is no longer available on the marketplace.
          </p>
          <button onClick={handleGoBack} className="btn btn-primary">
            Back to Browse Produce
          </button>
        </div>
      </div>
    );
  }

  const farmer = listing.farmer || {
    name: 'Farmer',
    village: listing.village || '',
    district: listing.district || '',
    state: listing.state || 'India',
    rating: 5.0,
    reviews: 0,
    verified: true,
    avatar: '🧑‍🌾',
  };

  const defaultCropImage = getCropImage(listing.crop || listing.cropName);
  const rawPhotos = listing.photos && listing.photos.length > 0 ? listing.photos : (defaultCropImage ? [defaultCropImage] : ['🌿']);
  const photos = rawPhotos.map(p => getCropImage(listing.crop || listing.cropName, p) || p);

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
          <ChevronLeft size={20} /> Back
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      height: 360,
                      background: 'linear-gradient(135deg, var(--green-light), #C8E6C9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8rem',
                      overflow: 'hidden',
                    }}
                  >
                    {typeof photos[photoIdx] === 'string' && (photos[photoIdx].startsWith('http') || photos[photoIdx].startsWith('/') || photos[photoIdx].startsWith('data:')) ? (
                      <img
                        src={photos[photoIdx]}
                        alt={listing.cropName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement.innerText = listing.emoji || '🌿';
                        }}
                      />
                    ) : (
                      listing.emoji || photos[photoIdx] || '🌿'
                    )}
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
                <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>About This Produce</h3>
                <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)' }}>{listing.description || 'Fresh harvest ready for direct pickup or export trade.'}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                  {listing.organic && <span className="badge badge-green">🌱 Organic Certified</span>}
                  {listing.exportReady && <span className="badge badge-blue">✈️ Export Ready</span>}
                  {listing.grade && <span className="badge badge-amber notranslate">⭐ {listing.grade}</span>}
                  {listing.packaging && <span className="badge badge-gray">📦 {listing.packaging}</span>}
                </div>
              </div>
            </FadeUpItem>

            {/* Specifications Table */}
            {listing.specs && Object.keys(listing.specs).length > 0 && (
              <FadeUpItem>
                <div className="card card-body" style={{ marginBottom: 24 }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 16 }}>
                    🔬 Specifications
                  </h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <tbody>
                        {Object.entries(listing.specs).map(([key, val], i) => (
                          <tr key={key} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg-page)' : '#fff' }}>
                            <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'capitalize', width: '38%' }}>
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </td>
                            <td className="notranslate" style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: 500 }}>{String(val)}</td>
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
                <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 16 }}>About the Farmer</h4>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div className="avatar avatar-xl" style={{ background: 'var(--green-light)', fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: 72, height: 72, flexShrink: 0, overflow: 'hidden' }}>
                    {typeof farmer.avatar === 'string' && (farmer.avatar.startsWith('data:') || farmer.avatar.startsWith('http') || farmer.avatar.startsWith('/')) ? (
                      <img src={farmer.avatar} alt={farmer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      farmer.avatar || '🧑‍🌾'
                    )}
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
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {[listing.village || farmer.village, listing.district || farmer.district, listing.state || farmer.state].filter(Boolean).join(', ') || 'India'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StarRating rating={farmer.rating || 5} />
                      <span className="notranslate" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{farmer.rating || 5.0}</span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        (<span className="notranslate">{farmer.reviews || 0}</span> reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeUpItem>
          </div>

          {/* Right Sticky Column */}
          <div style={{ position: 'sticky', top: 88 }}>
            <FadeUpItem>
              <div className="card card-body" style={{ marginBottom: 16 }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: 4, fontSize: '1.75rem' }}>
                  {listing.cropName || listing.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                  <span className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2.5rem', color: 'var(--green-primary)' }}>₹{listing.price}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>/{listing.unit === 'ton' ? 'kg' : listing.unit || 'kg'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: 'Quantity', value: `${listing.qty} ${listing.unit}`, notranslate: true },
                    { label: 'Grade', value: listing.grade || 'Standard FAQ', notranslate: true },
                    { label: 'Location', value: `${listing.village || ''}, ${listing.district || ''}`, notranslate: false },
                    { label: 'Offers Received', value: `${listing.offers || 0} offers`, notranslate: true },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'var(--bg-page)', borderRadius: 10, padding: '12px 14px' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', margin: '0 0 4px' }}>{item.label}</p>
                      <p className={item.notranslate ? 'notranslate' : ''} style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontSize: '0.9375rem' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                {listing.status === 'sold' ? (
                  <div style={{ background: '#ECFDF5', border: '1.5px solid #86EFAC', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                    <p style={{ color: '#166534', fontWeight: 800, margin: 0, fontSize: '0.9375rem' }}>
                      ✓ Deal Confirmed • Produce Sold
                    </p>
                    <p style={{ color: '#15803D', margin: '4px 0 0', fontSize: '0.8125rem' }}>
                      {isOwner ? 'Your produce lot was sold. Check terms in your Offers Inbox.' : 'You purchased this produce lot. Check terms in your Offers Inbox.'}
                    </p>
                  </div>
                ) : role === 'enterprise' ? (
                  <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate(`/enterprise/send-offer/${listing.id}`)}>
                    <MessageSquare size={18} /> Send Offer
                  </button>
                ) : isOwner ? (
                  <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                    <p style={{ color: 'var(--green-primary)', fontWeight: 600, margin: 0, fontSize: '0.875rem' }}>🌾 This is your produce listing</p>
                  </div>
                ) : role === 'farmer' ? (
                  <div style={{ background: 'var(--bg-page)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>Listed by another farmer</p>
                  </div>
                ) : (
                  <Link to="/login" className="btn btn-outline btn-full btn-lg">
                    Login to Send Offer
                  </Link>
                )}
              </div>
            </FadeUpItem>

            <FadeUpItem>
              <div style={{ background: 'var(--amber-light)', borderRadius: 16, padding: '16px 20px', border: '1px solid #FCD34D' }}>
                <p style={{ fontSize: '0.8125rem', color: '#92400E', margin: 0, lineHeight: 1.6 }}>
                  ⚠️ Platform connects verified buyers & sellers. Shipping, customs, and payment settlements are executed directly between parties.
                </p>
              </div>
            </FadeUpItem>
          </div>
        </div>
      </div>
    </div>
  );
}
