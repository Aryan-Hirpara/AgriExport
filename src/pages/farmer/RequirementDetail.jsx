import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  MapPin, ShieldCheck, Star, ChevronLeft, ChevronRight,
  Send, MessageSquare, Building2, Calendar, Package,
  CheckCircle2, Phone, Truck, Clock, Sparkles
} from 'lucide-react';
import { BUYER_REQUIREMENTS, ENTERPRISES } from '../../data/sampleData';
import { FadeUpItem, StarRating } from '../../components/common/AnimatedComponents';
import { translateTerm } from '../../utils/translationUtils';

const FARMER_REVIEWS = [
  { name: 'Ramesh Patel', rating: 5, comment: 'Prompt payment and direct pickup from our Unjha farm. Transparent grading and honest weighing.', date: 'Sep 2026', verified: true, village: 'Unjha' },
  { name: 'Bharat Bhai Desai', rating: 5, comment: 'Honest weighing at Unjha APMC yard and competitive rate paid as quoted. Regular buyer.', date: 'Aug 2026', verified: true, village: 'Patan' },
  { name: 'Jayesh Patel', rating: 4, comment: 'Fair terms and clear communication on export specs. Will definitely quote again next season.', date: 'Jul 2026', verified: true, village: 'Mehsana' },
];

export default function RequirementDetail() {
  const { id } = useParams();
  const { t, lang, role, buyerRequirements } = useApp();
  const navigate = useNavigate();
  const [photoIdx, setPhotoIdx] = useState(0);

  // Find requirement from context or sample data
  const reqList = buyerRequirements && buyerRequirements.length > 0 ? buyerRequirements : BUYER_REQUIREMENTS;
  const req = reqList.find(r => r.id === id) || reqList[0];

  // Find enterprise info
  const enterprise = ENTERPRISES.find(e => e.id === req.enterpriseId || e.name === req.enterpriseName) || ENTERPRISES[0];

  // Visual carousel items
  const photos = [
    { emoji: req.emoji || '🌿', label: req.cropName },
    { emoji: req.logo || enterprise.logo || '🏢', label: req.enterpriseName },
    { emoji: req.flag ? '🚢' : '📦', label: req.destination || 'Export Ready' },
  ];

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
          <ChevronLeft size={20} /> {t('Back to Buyer Demands', 'પાછળ ખરીદદાર માંગણીઓ')}
        </Link>

        {/* 2-Column Layout identical to ProduceDetail */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'flex-start' }}>
          
          {/* ============================================================== */}
          {/* LEFT COLUMN: VISUAL CAROUSEL + DETAILS + ENTERPRISE + REVIEWS  */}
          {/* ============================================================== */}
          <div>
            {/* Visual Carousel Banner */}
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
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '8rem', lineHeight: 1 }}>{photos[photoIdx].emoji}</span>
                    <span style={{ marginTop: 12, fontSize: '0.9rem', fontWeight: 600, color: 'var(--green-primary)', background: 'rgba(255,255,255,0.85)', padding: '4px 14px', borderRadius: 20 }}>
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
                        boxShadow: 'var(--shadow-sm)',
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
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Carousel Pagination Dots */}
                <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                  {photos.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: i === photoIdx ? 20 : 8,
                        height: 8,
                        borderRadius: 4,
                        background: i === photoIdx ? '#fff' : 'rgba(255,255,255,0.5)',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                      }}
                      onClick={() => setPhotoIdx(i)}
                    />
                  ))}
                </div>
              </div>
            </FadeUpItem>

            {/* About This Requirement Card */}
            <FadeUpItem>
              <div className="card card-body" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>
                    {t('About This Requirement', 'આ માંગણી વિશે')}
                  </h3>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {t('Posted', 'મુકાયેલ')}: {req.posted}
                  </span>
                </div>

                <p style={{ lineHeight: 1.7, fontSize: '0.975rem', color: 'var(--text-primary)', marginBottom: 16 }}>
                  {req.notes || req.title}
                </p>

                {/* Key Highlight Badges */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                  <span className="badge badge-blue">
                    📦 {req.qty} {translateTerm(req.unit || 'ton', lang)} {t('Needed', 'જરૂર')}
                  </span>
                  {req.urgency === 'urgent' ? (
                    <span className="badge badge-red">
                      🔥 {t('Urgent Requirement', 'તાત્કાલિક જરૂરિયાત')}
                    </span>
                  ) : (
                    <span className="badge badge-green">
                      📋 {t('Verified Order', 'ચકાસાયેલ ઓર્ડર')}
                    </span>
                  )}
                  {req.destination && (
                    <span className="badge badge-amber">
                      {req.flag || '✈️'} {req.destination}
                    </span>
                  )}
                  {req.deadline && (
                    <span className="badge badge-gray">
                      📅 {t('Required By', 'જરૂર તારીખ')}: {req.deadline}
                    </span>
                  )}
                </div>

                {/* Technical Specifications & Terms */}
                <div style={{ background: 'var(--bg-page)', borderRadius: 14, padding: '16px 20px', marginTop: 12 }}>
                  <h5 style={{ fontFamily: 'var(--font-heading)', marginBottom: 12, fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('Quality Specifications & Terms', 'ગુણવત્તા અને શરતો')}
                  </h5>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                    {req.specs && Object.entries(req.specs).map(([key, val]) => (
                      <div key={key}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize', display: 'block' }}>
                          {key}:
                        </span>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {val}
                        </strong>
                      </div>
                    ))}
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                        {t('Delivery Terms', 'ડિલિવરી સ્થળ')}:
                      </span>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {req.deliveryTerms}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                        {t('Payment Terms', 'ચુકવણી શરતો')}:
                      </span>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {req.paymentTerms || '30% Advance, 70% immediate on weight slip'}
                      </strong>
                    </div>
                    {req.minLot && (
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                          {t('Minimum Lot Size', 'ઓછામાં ઓછો જથ્થો')}:
                        </span>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {req.minLot}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </FadeUpItem>

            {/* About the Buyer / Enterprise Card (Mirroring 'About the Farmer' in ProduceDetail) */}
            <FadeUpItem>
              <div className="card card-body" style={{ marginBottom: 24 }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 16 }}>
                  {t('About the Buyer', 'ખરીદદાર વિશે')}
                </h4>
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
                    }}
                  >
                    {req.logo || enterprise.logo || '🏢'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h4 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>
                        {req.enterpriseName || enterprise.name}
                      </h4>
                      {req.verified && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--green-light)', borderRadius: 20, padding: '2px 8px' }}>
                          <ShieldCheck size={12} color="var(--green-primary)" />
                          <span style={{ fontSize: '0.75rem', color: 'var(--green-primary)', fontWeight: 600 }}>
                            {t('Verified Buyer', 'ચકાસાયેલ ખરીદદાર')}
                          </span>
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
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        ({enterprise.reviews || 42} {t('farmer reviews', 'ખેડૂત સમીક્ષાઓ')})
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        🏢 {t('Type', 'પ્રકાર')}: {enterprise.type || req.buyerType || 'Export House'}
                      </span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        🌍 {t('Exports to', 'નિકાસ દેશો')}: {enterprise.countries ? enterprise.countries.join(', ') : req.destination}
                      </span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        📅 {t('Member Since', 'જોડાયા')}: {enterprise.since || '2019'}
                      </span>
                      {enterprise.gst && (
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          📜 GST: {enterprise.gst}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </FadeUpItem>

            {/* Farmer Reviews Card */}
            <FadeUpItem>
              <div className="card card-body">
                <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>
                  {t('Farmer Reviews for this Buyer', 'આ ખરીદદાર માટે ખેડૂત સમીક્ષાઓ')} ({FARMER_REVIEWS.length})
                </h4>
                {FARMER_REVIEWS.map((rev, i) => (
                  <div
                    key={i}
                    style={{
                      paddingBottom: 20,
                      marginBottom: 20,
                      borderBottom: i < FARMER_REVIEWS.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            {rev.name}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {rev.village}</span>
                          {rev.verified && <ShieldCheck size={14} color="var(--green-primary)" />}
                        </div>
                        <StarRating rating={rev.rating} size={14} />
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rev.date}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', margin: 0, color: 'var(--text-secondary)' }}>
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            </FadeUpItem>
          </div>

          {/* ============================================================== */}
          {/* RIGHT COLUMN: STICKY REQUIREMENT ACTION CARD                   */}
          {/* ============================================================== */}
          <div style={{ position: 'sticky', top: 88 }}>
            <FadeUpItem>
              <div className="card card-body" style={{ marginBottom: 16 }}>
                {/* Crop Name */}
                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: 4, fontSize: '1.75rem' }}>
                  {req.cropName}
                </h2>

                {/* Target Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2.5rem', color: 'var(--green-primary)' }}>
                    ₹{req.targetPrice}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>/{t('kg', 'કિલો')}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 20px' }}>
                  {t('Target buying price by enterprise', 'કંપની દ્વારા લક્ષ્ય ખરીદ ભાવ')}
                </p>

                {/* 2x2 Grid Summary (Identical layout to ProduceDetail) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {[
                    {
                      label: t('Quantity Needed', 'જરૂરી જથ્થો'),
                      value: `${req.qty} ${translateTerm(req.unit || 'ton', lang)}`,
                    },
                    {
                      label: t('Urgency', 'પ્રાથમિકતા'),
                      value: req.urgency === 'urgent' ? `🔥 ${t('Urgent', 'તાત્કાલિક')}` : t('Regular', 'સામાન્ય'),
                    },
                    {
                      label: t('Destination', 'ગંતવ્ય'),
                      value: req.destination || 'Export',
                    },
                    {
                      label: t('Quotes Received', 'ઑફર્સ મળી'),
                      value: `${req.quotesCount || req.quotes?.length || 0} ${t('quotes', 'ઑફર્સ')}`,
                    },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'var(--bg-page)', borderRadius: 10, padding: '12px 14px' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', margin: '0 0 4px' }}>
                        {item.label}
                      </p>
                      <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontSize: '0.9375rem' }}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Action Button: Send Quote */}
                {role === 'farmer' || !role ? (
                  <button
                    className="btn btn-primary btn-full btn-lg"
                    style={{ fontSize: '1.05rem', fontWeight: 700 }}
                    onClick={() => navigate(`/farmer/send-quote/${req.id}`)}
                  >
                    <Send size={18} /> {t('Send Quote', 'ઑફર મોકલો')}
                  </button>
                ) : role === 'enterprise' ? (
                  <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                    <p style={{ color: 'var(--green-primary)', fontWeight: 600, margin: 0, fontSize: '0.875rem' }}>
                      🏢 {t('Viewing as Enterprise', 'કંપની તરીકે જોઈ રહ્યાં છો')}
                    </p>
                  </div>
                ) : (
                  <Link to="/login" className="btn btn-outline btn-full btn-lg">
                    {t('Login to Send Quote', 'ઑફર માટે લૉગ ઇન')}
                  </Link>
                )}
              </div>
            </FadeUpItem>

            {/* Platform Guarantee & Warning Banner */}
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
