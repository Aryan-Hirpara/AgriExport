import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  MapPin, ShieldCheck, ChevronLeft, ChevronRight,
  Send, MessageSquare, Building2, Calendar, Package,
  CheckCircle2, Phone, Truck, Clock, Sparkles
} from 'lucide-react';
import { FadeUpItem, StarRating } from '../../components/common/AnimatedComponents';
import api from '../../services/api';
import { getCropImage } from '../../utils/cropImages';

export default function RequirementDetail() {
  const { id } = useParams();
  const { role, buyerRequirements, farmerOffers = [] } = useApp();
  const navigate = useNavigate();
  const [photoIdx, setPhotoIdx] = useState(0);
  const [dbReq, setDbReq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cleanId = String(id).replace('br', '');
    api.requirements.getById(cleanId)
      .then(res => {
        if (res.data) setDbReq(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const req = (buyerRequirements || []).find(r => r.id === id || r.dbId === id || String(r.dbId) === String(id)) || dbReq;
  const existingOffer = (farmerOffers || []).find(o =>
    o.requirementId === req?.id ||
    o.requirementDbId === req?.dbId ||
    (req?.dbId && String(o.requirementDbId) === String(req.dbId)) ||
    (req?.id && String(o.requirementId) === String(req.id))
  );

  if (!req) {
    if (loading) {
      return (
        <div className="page-wrapper" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading requirement details...</p>
        </div>
      );
    }

    return (
      <div className="page-wrapper" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 500 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🌾</div>
          <h2 style={{ marginBottom: 12 }}>Requirement Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            The requested buyer requirement does not exist or has already been fulfilled.
          </p>
          <Link to="/farmer/find-buyers" className="btn btn-primary">
            Back to Buyer Demands
          </Link>
        </div>
      </div>
    );
  }

  const enterprise = req.enterprise || {
    name: req.enterpriseName || 'Export Enterprise',
    type: req.buyerType || 'Exporter',
    city: req.city || 'Gujarat',
    rating: 4.8,
    reviews: 0,
    logo: req.logo || '🏢',
    since: '2024',
    gst: req.gst || '',
  };

  const cropImg = getCropImage(req.crop || req.cropName, req.imageUrl || req.image);
  const photos = [];
  if (cropImg) {
    photos.push({ url: cropImg, label: `${req.cropName || 'Crop'} Reference Sample` });
  }
  photos.push({ emoji: req.emoji || '🌿', label: req.cropName || req.title });
  photos.push({ emoji: req.logo || enterprise.logo || '🏢', label: req.enterpriseName });
  if (req.destination) {
    photos.push({ emoji: req.flag || '🚢', label: req.destination });
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        {/* Back Button */}
        <Link
          to="/farmer/find-buyers"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-secondary)',
            fontWeight: 500,
            marginBottom: 24,
            textDecoration: 'none',
          }}
        >
          <ChevronLeft size={20} /> Back to Buyer Demands
        </Link>

        {/* 2-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'flex-start' }}>
          {/* LEFT COLUMN */}
          <div>
            {/* Visual Carousel */}
            <FadeUpItem>
              <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 24, position: 'relative' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={photoIdx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      height: 340,
                      background: 'linear-gradient(135deg, var(--green-light), #C8E6C9)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {photos[photoIdx]?.url ? (
                      <img src={photos[photoIdx].url} alt={photos[photoIdx].label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : typeof photos[photoIdx]?.emoji === 'string' && (photos[photoIdx].emoji.startsWith('data:') || photos[photoIdx].emoji.startsWith('http') || photos[photoIdx].emoji.startsWith('/')) ? (
                      <div style={{ width: 140, height: 140, borderRadius: '50%', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '4px solid #fff' }}>
                        <img src={photos[photoIdx].emoji} alt={photos[photoIdx].label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <span style={{ fontSize: '7rem', lineHeight: 1 }}>{photos[photoIdx]?.emoji || '🌿'}</span>
                    )}
                    <span
                      style={{
                        marginTop: 12,
                        background: 'rgba(255,255,255,0.92)',
                        padding: '6px 16px',
                        borderRadius: 20,
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: 'var(--green-primary)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      {photos[photoIdx].label}
                    </span>
                  </motion.div>
                </AnimatePresence>

                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setPhotoIdx(p => (p - 1 + photos.length) % photos.length)}
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.9)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setPhotoIdx(p => (p + 1) % photos.length)}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.9)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                  {photos.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: i === photoIdx ? 20 : 8,
                        height: 8,
                        borderRadius: 4,
                        background: i === photoIdx ? 'var(--green-primary)' : 'rgba(255,255,255,0.7)',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                      }}
                      onClick={() => setPhotoIdx(i)}
                    />
                  ))}
                </div>
              </div>
            </FadeUpItem>

            {/* Requirement Details */}
            <FadeUpItem>
              <div className="card card-body" style={{ marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 12 }}>
                  About This Buyer Demand
                </h3>
                <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 20 }}>
                  {req.notes || req.description || 'Verified enterprise seeking direct farm supplies for domestic processing or export fulfillment.'}
                </p>

                {/* Key Tags */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {req.urgency === 'urgent' && <span className="badge badge-amber">⚡ Urgent Demand</span>}
                  <span className="badge badge-green">🌾 {req.cropName || req.title}</span>
                  {req.destination && <span className="badge badge-blue">📍 {req.destination}</span>}
                  {req.deadline && (
                    <span className="badge badge-gray">
                      <Clock size={12} style={{ marginRight: 4 }} /> Valid until {req.deadline}
                    </span>
                  )}
                </div>
              </div>
            </FadeUpItem>

            {/* Specifications Table */}
            {req.specs && Object.keys(req.specs).length > 0 && (
              <FadeUpItem>
                <div className="card card-body" style={{ marginBottom: 24 }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 16 }}>
                    🔬 Required Quality Specifications
                  </h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <tbody>
                        {Object.entries(req.specs).map(([key, val], i) => (
                          <tr key={key} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg-page)' : '#fff' }}>
                            <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'capitalize', width: '38%' }}>
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </td>
                            <td className="notranslate" style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                              {String(val)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </FadeUpItem>
            )}

            {/* Delivery & Payment Terms */}
            <FadeUpItem>
              <div className="card card-body" style={{ marginBottom: 24 }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 16 }}>
                  🚚 Delivery & Commercial Terms
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Delivery Terms:</span>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{req.deliveryTerms || 'Ex-Farm Pickup / APMC Yard'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Payment Terms:</span>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{req.paymentTerms || '30% Advance, 70% on weight slip'}</strong>
                  </div>
                  {req.minLot && (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Minimum Lot:</span>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{req.minLot}</strong>
                    </div>
                  )}
                </div>
              </div>
            </FadeUpItem>

            {/* About the Buyer */}
            <FadeUpItem>
              <div className="card card-body">
                <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 16 }}>About the Buyer</h4>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div
                    className="avatar avatar-xl"
                    style={{
                      background: 'var(--green-light)',
                      fontSize: '2.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      width: 72,
                      height: 72,
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}
                  >
                    {typeof (req.logo || enterprise.logo) === 'string' &&
                    ((req.logo || enterprise.logo).startsWith('data:') || (req.logo || enterprise.logo).startsWith('http') || (req.logo || enterprise.logo).startsWith('/')) ? (
                      <img src={req.logo || enterprise.logo} alt="Company Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      req.logo || enterprise.logo || '🏢'
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h4 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>
                        {req.enterpriseName || enterprise.name}
                      </h4>
                      {req.verified && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--green-light)', borderRadius: 20, padding: '2px 8px' }}>
                          <ShieldCheck size={12} color="var(--green-primary)" />
                          <span style={{ fontSize: '0.75rem', color: 'var(--green-primary)', fontWeight: 600 }}>Verified Buyer</span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                      <MapPin size={14} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {req.city || enterprise.city || 'Gujarat'}, India
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <StarRating rating={enterprise.rating || 4.8} />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{enterprise.rating || 4.8}</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeUpItem>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ position: 'sticky', top: 88 }}>
            <FadeUpItem>
              <div className="card card-body" style={{ marginBottom: 16 }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: 4, fontSize: '1.75rem' }}>
                  {req.cropName || req.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                  <span className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2.5rem', color: 'var(--green-primary)' }}>
                    ₹{req.targetPrice}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>/kg</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div style={{ background: 'var(--bg-page)', borderRadius: 10, padding: '12px 14px' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', margin: '0 0 4px' }}>Total Demand</p>
                    <p className="notranslate" style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontSize: '0.9375rem' }}>{req.qty} {req.unit || 'ton'}</p>
                  </div>
                  <div style={{ background: 'var(--bg-page)', borderRadius: 10, padding: '12px 14px' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', margin: '0 0 4px' }}>Target Destination</p>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontSize: '0.9375rem' }}>{req.destination || 'India'}</p>
                  </div>
                </div>

                {role === 'farmer' ? (
                  existingOffer ? (
                    <div style={{
                      background: existingOffer.status === 'countered' ? '#EFF6FF' : existingOffer.status === 'accepted' ? '#F0FDF4' : '#F8FAFC',
                      border: `1.5px solid ${existingOffer.status === 'countered' ? '#93C5FD' : existingOffer.status === 'accepted' ? '#86EFAC' : '#CBD5E1'}`,
                      borderRadius: 12,
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: existingOffer.status === 'countered' ? '#DBEAFE' : existingOffer.status === 'accepted' ? '#DCFCE7' : '#E0E7FF',
                          color: existingOffer.status === 'countered' ? '#1D4ED8' : existingOffer.status === 'accepted' ? '#15803D' : '#4338CA'
                        }}>
                          {existingOffer.status === 'countered'
                            ? '🔄 Counter Offer Active'
                            : existingOffer.status === 'accepted'
                            ? '✓ Deal Confirmed'
                            : '📤 Quote Submitted'}
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {existingOffer.status === 'countered'
                            ? `₹${existingOffer.counterPrice}/kg`
                            : `₹${existingOffer.offeredPrice}/kg`}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {existingOffer.status === 'countered'
                          ? `Enterprise countered at ₹${existingOffer.counterPrice}/kg. Review, accept, or counter back in your Offers Inbox.`
                          : existingOffer.status === 'accepted'
                          ? `Congratulations! Your quote of ₹${existingOffer.offeredPrice}/kg was accepted. Deal is confirmed.`
                          : `You submitted a quote of ₹${existingOffer.offeredPrice}/kg for this requirement. Awaiting enterprise review.`}
                      </p>
                      <button
                        className="btn btn-primary btn-full btn-md"
                        onClick={() => navigate('/farmer/offers')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700 }}
                      >
                        View in Offers Inbox <ChevronRight size={16} />
                      </button>
                    </div>
                  ) : req.status === 'fulfilled' || req.status === 'closed' ? (
                    <div style={{ background: '#FEF3C7', border: '1.5px solid #FCD34D', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                      <p style={{ color: '#92400E', fontWeight: 800, margin: 0, fontSize: '0.9375rem' }}>
                        🤝 Requirement Fulfilled / Closed
                      </p>
                      <p style={{ color: '#B45309', margin: '4px 0 0', fontSize: '0.8125rem' }}>
                        An offer was accepted and this procurement requirement has been fulfilled.
                      </p>
                    </div>
                  ) : (
                    <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate(`/farmer/send-quote/${req.id}`)}>
                      <Send size={18} /> Submit Price Quote
                    </button>
                  )
                ) : (
                  <Link to="/login" className="btn btn-outline btn-full btn-lg">
                    Login as Farmer to Quote
                  </Link>
                )}
              </div>
            </FadeUpItem>

            <FadeUpItem>
              <div style={{ background: 'var(--amber-light)', borderRadius: 16, padding: '16px 20px', border: '1px solid #FCD34D' }}>
                <p style={{ fontSize: '0.8125rem', color: '#92400E', margin: 0, lineHeight: 1.6 }}>
                  ⚠️ Always inspect buyer credentials and agree upon clear quality inspection terms before loading trucks.
                </p>
              </div>
            </FadeUpItem>
          </div>
        </div>
      </div>
    </div>
  );
}
