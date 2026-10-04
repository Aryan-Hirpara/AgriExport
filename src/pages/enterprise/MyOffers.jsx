import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  MessageCircle, X, RefreshCw, ShieldCheck,
  MapPin, CheckCircle2, ChevronRight, FileText, Sparkles,
  Building2, ArrowUpRight, Check, AlertCircle, Info
} from 'lucide-react';
import { LISTINGS, FARMERS, CROPS } from '../../data/sampleData';
import { FadeUpItem, StaggerGrid } from '../../components/common/AnimatedComponents';
import cropAttributes from '../../data/crop_attributes.json';

const ALL_TABS = ['pending', 'countered', 'accepted', 'rejected', 'withdrawn', 'expired'];
const TAB_LABELS = {
  pending: 'Pending',
  countered: 'Countered',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  expired: 'Expired',
};

const TAB_GUJ = {
  pending: 'બાકી',
  countered: 'કાઉન્ટર',
  accepted: 'સ્વીકારેલ',
  rejected: 'અસ્વીકાર',
  withdrawn: 'પાછી ખેંચેલ',
  expired: 'સમાપ્ત',
};

export default function MyOffers() {
  const {
    t, lang, addToast,
    enterpriseOffers, updateEnterpriseOffer, withdrawEnterpriseOffer,
    produceListings
  } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState(null);

  const allListings = produceListings && produceListings.length > 0 ? produceListings : LISTINGS;

  // Use offers from AppContext or fallback to initial sample list
  const offersList = enterpriseOffers && enterpriseOffers.length > 0 ? enterpriseOffers : [
    {
      id: 'oe1',
      listingId: 'l1',
      farmerId: 'f1',
      farmerName: 'Ramesh Patel',
      village: 'Unjha',
      district: 'Mehsana',
      crop: 'jeera',
      cropName: 'Jeera (Cumin)',
      emoji: '🌿',
      grade: 'Premium Bold',
      offeredPrice: 308,
      expectedPrice: 315,
      qty: 5,
      unit: 'ton',
      deliveryTerms: 'Pickup from farm',
      paymentTerms: '50% advance, 50% on delivery',
      validity: '2026-10-12',
      status: 'pending',
      sentAt: '2 hours ago',
      message: 'Interested in Unjha jeera lot. We export to UAE regularly. Prompt loading guaranteed.',
      specs: { purity: '99.5%', moisture: 'Max 7%', volatileOil: '2.8%', packaging: '50 kg PP Bags' },
    },
    {
      id: 'oe2',
      listingId: 'l14',
      farmerId: 'f2',
      farmerName: 'Bhavna Ben Desai',
      village: 'Talala Gir',
      district: 'Junagadh',
      crop: 'kesar-mango',
      cropName: 'Kesar Mango',
      emoji: '🥭',
      grade: 'Export Grade A',
      offeredPrice: 180,
      expectedPrice: 185,
      qty: 2,
      unit: 'ton',
      deliveryTerms: 'Pickup from farm',
      paymentTerms: '100% advance on crate loading',
      validity: '2026-10-08',
      status: 'accepted',
      sentAt: '1 day ago',
      message: 'We have confirmed export orders for London airfreight. Brix 22°+ lot needed.',
      specs: { grade: 'Export A (GI)', brix: '22°+', weight: '250–300g', treatment: 'HWT' },
    },
    {
      id: 'oe3',
      listingId: 'l28',
      farmerId: 'f1',
      farmerName: 'Ramesh Patel',
      village: 'Unjha',
      district: 'Mehsana',
      crop: 'jeera',
      cropName: 'Jeera (Cumin)',
      emoji: '🌿',
      grade: 'Machine Cleaned (99%)',
      offeredPrice: 305,
      expectedPrice: 310,
      counterPrice: 310,
      qty: 8,
      unit: 'ton',
      deliveryTerms: 'Delivered to Unjha warehouse',
      paymentTerms: '100% advance',
      validity: '2026-10-15',
      status: 'countered',
      sentAt: '3 days ago',
      message: 'Need 8 tons of machine-cleaned jeera for Saudi Arabia shipment.',
      specs: { purity: '99%', moisture: 'Max 8%', volatileOil: '2.5%', packaging: '50 kg PP Bags' },
    },
    {
      id: 'oe4',
      listingId: 'l3',
      farmerId: 'f3',
      farmerName: 'Karsan Bhai Solanki',
      village: 'Viramgam',
      district: 'Ahmedabad',
      crop: 'groundnut',
      cropName: 'Groundnut',
      emoji: '🥜',
      grade: 'Bold 40/50',
      offeredPrice: 62,
      expectedPrice: 65,
      qty: 8,
      unit: 'ton',
      deliveryTerms: 'Pickup from farm',
      paymentTerms: '50% advance, 50% on weight slip',
      validity: '2026-10-02',
      status: 'rejected',
      sentAt: '5 days ago',
      message: 'Groundnut Bold 40/50 for Vietnam export order.',
      specs: { count: '40/50', moisture: 'Max 7%', aflatoxin: 'Below 4 ppb', packaging: '25 kg Vacuum Bags' },
    },
  ];

  const filtered = offersList.filter(o => o.status === activeTab);

  const handleWithdraw = (id) => {
    if (withdrawEnterpriseOffer) {
      withdrawEnterpriseOffer(id);
    }
    addToast(t('Offer withdrawn successfully', 'ઑફર સફળતાપૂર્વક પાછી ખેંચાઈ'), 'warning');
  };

  const handleAcceptCounter = (id) => {
    if (updateEnterpriseOffer) {
      updateEnterpriseOffer(id, { status: 'accepted' });
    }
    addToast(t('Counter-offer accepted! Deal created 🎉', 'કાઉન્ટર ઑફર સ્વીકારાઈ! સોદો સફળ 🎉'), 'success');
    if (selectedOfferForDetail?.id === id) {
      setSelectedOfferForDetail(prev => ({ ...prev, status: 'accepted' }));
    }
  };

  const STATUS_BADGE = {
    pending: 'badge-amber',
    countered: 'badge-blue',
    accepted: 'badge-green',
    rejected: 'badge-red',
    withdrawn: 'badge-gray',
    expired: 'badge-gray',
  };

  // Helper to resolve produce listing details for an offer
  const resolveListing = (offer) => {
    return allListings.find(l => l.id === offer.listingId) || {
      id: offer.listingId || 'l1',
      cropName: offer.cropName || 'Jeera (Cumin)',
      crop: offer.crop || 'jeera',
      price: offer.expectedPrice || 315,
      qty: offer.qty || 5,
      unit: offer.unit || 'ton',
      grade: offer.grade || 'Grade A',
      village: offer.village || 'Unjha',
      district: offer.district || 'Mehsana',
      description: offer.description || 'High-quality agricultural lot from Gujarat farmlands. Cleaned, graded, and prepared for commercial dispatch.',
      specs: offer.specs || { grade: offer.grade || 'Grade A' },
      photos: [offer.emoji || '🌿', '📦'],
    };
  };

  const resolveFarmer = (offer, listing) => {
    return FARMERS.find(f => f.id === (listing?.farmerId || offer.farmerId)) || {
      name: offer.farmerName || 'Gujarat Farmer',
      village: offer.village || listing?.village || 'Unjha',
      district: offer.district || listing?.district || 'Mehsana',
      rating: 4.9,
      reviews: 38,
      verified: true,
      avatar: '👨‍🌾',
      phone: '+91 98250 88771',
    };
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: 'var(--green-primary)', padding: '32px 0 48px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 20, color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
              💼 {t('Outgoing Offers Tracker', 'મોકલેલી ઑફર્સ')}
            </span>
          </div>
          <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)', margin: 0 }}>
            {t('My Offers', 'મારી ઑફર્સ')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', margin: '4px 0 0' }}>
            {offersList.length} {t('total offers placed on farmer listings', 'કુલ મોકલેલી ઑફર્સ')}
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: -20, paddingBottom: 40 }}>
        {/* Status Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: '#fff', borderRadius: 20, padding: '8px', boxShadow: 'var(--shadow-md)', marginBottom: 24, display: 'flex', gap: 6, overflowX: 'auto' }}
        >
          {ALL_TABS.map(tab => {
            const count = offersList.filter(o => o.status === tab).length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  minWidth: 100,
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'var(--green-primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-heading)',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span>{lang === 'gu' ? TAB_GUJ[tab] : TAB_LABELS[tab]}</span>
                <span
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--border)',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    padding: '2px 7px',
                    borderRadius: 10,
                    fontSize: '0.75rem',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Offers Grid */}
        <StaggerGrid style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ background: '#fff', borderRadius: 20, padding: '48px 24px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <div className="empty-state-icon" style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 8px' }}>
                {t(`No ${TAB_LABELS[activeTab]} offers`, `કોઈ ${TAB_GUJ[activeTab]} ઑફર નથી`)}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
                {t('Browse verified produce listings from Gujarat farmers and send direct price offers.', 'ગુજરાતના ખેડૂતોના લિસ્ટિંગ જુઓ અને સીધી ઑફર મોકલો.')}
              </p>
              <Link to="/browse" className="btn btn-primary">
                🌾 {t('Browse Produce Listings', 'પાક લિસ્ટિંગ જુઓ')}
              </Link>
            </div>
          ) : filtered.map((offer, i) => {
            const listing = resolveListing(offer);
            const farmer = resolveFarmer(offer, listing);
            const cropObj = CROPS.find(c => c.id === (listing.crop || offer.crop)) || CROPS[0];
            const multiplier = offer.unit === 'ton' ? 1000 : offer.unit === 'quintal' ? 100 : 1;
            const dealTotal = (Number(offer.offeredPrice) * Number(offer.qty) * multiplier).toLocaleString('en-IN');
            const askPrice = listing.price || offer.expectedPrice;

            return (
              <FadeUpItem key={offer.id} delay={i * 0.05}>
                <motion.div
                  className="card card-body"
                  whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
                  style={{ cursor: 'pointer', transition: 'box-shadow 0.2s', border: '1px solid var(--border)' }}
                  onClick={() => setSelectedOfferForDetail({ offer, listing, farmer, cropObj, dealTotal })}
                >
                  {/* Top Row: Crop + Farmer + Price */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    
                    {/* Visual Crop Icon */}
                    <div
                      style={{
                        width: 68,
                        height: 68,
                        borderRadius: 14,
                        background: 'linear-gradient(135deg, var(--green-light), #C8E6C9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        flexShrink: 0,
                      }}
                    >
                      {offer.emoji || listing.photos?.[0] || cropObj.emoji || '🌿'}
                    </div>

                    {/* Middle Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <h4 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.15rem' }}>
                          {lang === 'gu' ? cropObj.guj : listing.cropName || offer.cropName}
                        </h4>
                        <span className={`badge ${STATUS_BADGE[offer.status]}`} style={{ fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 700 }}>
                          {lang === 'gu' ? TAB_GUJ[offer.status] : offer.status}
                        </span>
                        {(offer.grade || listing.grade) && (
                          <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                            🏷️ {offer.grade || listing.grade}
                          </span>
                        )}
                      </div>

                      {/* Farmer Info Line */}
                      <p style={{ margin: '0 0 6px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>🧑‍🌾 {farmer.name}</span>
                        {farmer.verified && <ShieldCheck size={14} color="var(--green-primary)" />}
                        <span>• 📍 {listing.village || offer.village}, {listing.district || offer.district}</span>
                      </p>

                      {/* Offer Terms */}
                      <p style={{ fontSize: '0.8125rem', margin: '0 0 8px', color: 'var(--text-muted)' }}>
                        📦 <strong>{offer.qty} {offer.unit || 'ton'}</strong> • 🚚 {offer.deliveryTerms} • 💳 {offer.paymentTerms}
                      </p>

                      {/* Specifications Badges Row */}
                      {listing.specs && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                          {Object.entries(listing.specs).filter(([, v]) => v).slice(0, 3).map(([k, v]) => (
                            <span key={k} className="badge" style={{ fontSize: '0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#334155' }}>
                              {String(v)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Pricing Box */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.4rem', color: 'var(--green-primary)' }}>
                        ₹{offer.offeredPrice}/kg
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {t('Farmer ask:', 'ખેડૂત ભાવ:')} <strong>₹{askPrice}/kg</strong>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: 4, background: 'var(--green-light)', padding: '2px 8px', borderRadius: 8 }}>
                        {t('Total:', 'કુલ:')} ₹{dealTotal}
                      </div>

                      {offer.status === 'countered' && offer.counterPrice && (
                        <div style={{ fontSize: '0.825rem', color: 'var(--blue)', fontWeight: 700, marginTop: 6, background: '#E3F2FD', padding: '4px 8px', borderRadius: 8 }}>
                          🔄 Counter: ₹{offer.counterPrice}/kg
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Counter alert if present */}
                  {offer.status === 'countered' && (
                    <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '10px 14px', marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.2rem' }}>💬</span>
                        <span style={{ fontSize: '0.85rem', color: '#1E40AF', fontWeight: 600 }}>
                          {offer.counterMessage || t(`Farmer countered your offer at ₹${offer.counterPrice}/kg. Accept to finalize deal.`, `ખેડૂતે ₹${offer.counterPrice}/kg નો કાઉન્ટર આપ્યો છે.`)}
                        </span>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptCounter(offer.id);
                        }}
                      >
                        ✓ {t('Accept Counter', 'કાઉન્ટર સ્વીકારો')}
                      </button>
                    </div>
                  )}

                  {/* Actions & Click Guidance Footer */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      paddingTop: 12,
                      marginTop: 12,
                      borderTop: '1px solid var(--border)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      🕐 {offer.sentAt}
                    </span>

                    {/* View Details Button */}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 'auto', background: 'var(--green-light)', color: 'var(--green-primary)', fontWeight: 700 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOfferForDetail({ offer, listing, farmer, cropObj, dealTotal });
                      }}
                    >
                      <FileText size={14} />
                      {t('View Farmer Item Description & Specs', 'ખેડૂત માલ વિગત અને ગુણવત્તા')}
                    </button>

                    {offer.status === 'countered' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptCounter(offer.id);
                        }}
                      >
                        ✓ {t('Accept Counter', 'સ્વીકારો')}
                      </button>
                    )}

                    {(offer.status === 'pending' || offer.status === 'countered') && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--text-secondary)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWithdraw(offer.id);
                        }}
                      >
                        <X size={14} /> {t('Withdraw', 'પાછી ખેંચો')}
                      </button>
                    )}

                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/farmer/chat');
                      }}
                    >
                      <MessageCircle size={14} /> {t('Chat', 'ચેટ')}
                    </button>
                  </div>
                </motion.div>
              </FadeUpItem>
            );
          })}
        </StaggerGrid>
      </div>

      {/* =================================================================== */}
      {/* FARMER ITEM DESCRIPTION & OFFER DETAIL MODAL                        */}
      {/* Solves user request: "when buyer click on that particular offer that */}
      {/* time it show the page like show the farmer item discription"        */}
      {/* =================================================================== */}
      <AnimatePresence>
        {selectedOfferForDetail && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOfferForDetail(null)}
          >
            <motion.div
              className="modal"
              style={{ maxWidth: 640, maxHeight: '92vh', overflowY: 'auto', padding: '28px' }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, pb: 14, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 14,
                      background: 'linear-gradient(135deg, var(--green-light), #C8E6C9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                    }}
                  >
                    {selectedOfferForDetail.listing.photos?.[0] || selectedOfferForDetail.cropObj.emoji}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>
                      {lang === 'gu' ? selectedOfferForDetail.cropObj.guj : selectedOfferForDetail.listing.cropName}
                    </h3>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className={`badge ${STATUS_BADGE[selectedOfferForDetail.offer.status]}`} style={{ textTransform: 'capitalize' }}>
                        {selectedOfferForDetail.offer.status}
                      </span>
                      <span className="badge badge-green">
                        {selectedOfferForDetail.listing.grade || selectedOfferForDetail.offer.grade}
                      </span>
                      {selectedOfferForDetail.listing.exportReady && (
                        <span className="badge badge-blue">✈️ Export Ready</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOfferForDetail(null)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Farmer Profile Banner */}
              <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '14px 18px', marginBottom: 20, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: '2.2rem' }}>{selectedOfferForDetail.farmer.avatar}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedOfferForDetail.farmer.name}</span>
                      {selectedOfferForDetail.farmer.verified && <ShieldCheck size={16} color="var(--green-primary)" />}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      📍 {selectedOfferForDetail.listing.village}, {selectedOfferForDetail.listing.district || 'Gujarat'} • ⭐ {selectedOfferForDetail.farmer.rating} ({selectedOfferForDetail.farmer.reviews} reviews)
                    </p>
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onClick={() => {
                    navigate('/farmer/chat');
                  }}
                >
                  <MessageCircle size={14} /> {t('Message Farmer', 'સંદેશ મોકલો')}
                </button>
              </div>

              {/* Farmer's Lot Item Description */}
              <div style={{ marginBottom: 20 }}>
                <h5 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 8px', fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={16} color="var(--green-primary)" />
                  {t('Farmer Produce Description & Harvest Notes', 'ખેડૂત માલ વિગત અને હાર્વેસ્ટ નોંધ')}
                </h5>
                <div
                  style={{
                    background: 'var(--green-light)',
                    borderRadius: 14,
                    padding: '16px 18px',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: 'var(--text-primary)',
                    borderLeft: '4px solid var(--green-primary)',
                  }}
                >
                  <p style={{ margin: 0 }}>
                    "{selectedOfferForDetail.listing.description || t('Sun-dried, machine cleaned export-quality produce. Laboratory tested lot available for immediate dispatch.', 'સૂકવેલો, મશીન ક્લીન કરેલ નિકાસ ગુણવત્તાવાળો પાક.')}"
                  </p>
                  {selectedOfferForDetail.listing.gujDesc && lang === 'gu' && (
                    <p style={{ margin: '8px 0 0', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                      "{selectedOfferForDetail.listing.gujDesc}"
                    </p>
                  )}
                </div>
              </div>

              {/* Quality Specifications Grid */}
              <div style={{ marginBottom: 20 }}>
                <h5 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 10px', fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} color="var(--green-primary)" />
                  {t('Technical Specifications & Quality Parameters', 'ટેકનિકલ ગુણવત્તા વિશિષ્ટતાઓ')}
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{t('Produce Grade', 'ગ્રેડ')}</span>
                    <strong style={{ fontSize: '0.85rem' }}>{selectedOfferForDetail.listing.grade || 'Grade A'}</strong>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{t('Total Lot Available', 'કુલ ઉપલબ્ધ જથ્થો')}</span>
                    <strong style={{ fontSize: '0.85rem' }}>{selectedOfferForDetail.listing.qty} {selectedOfferForDetail.listing.unit}</strong>
                  </div>

                  {selectedOfferForDetail.listing.specs && Object.entries(selectedOfferForDetail.listing.specs).map(([key, val]) => (
                    <div key={key} style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize', display: 'block' }}>
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{String(val)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Offer Comparison Box */}
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
                <h5 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 12px', fontSize: '0.925rem', color: '#92400E', display: 'flex', alignItems: 'center', gap: 6 }}>
                  💰 {t('Your Offer Details vs Asking Price', 'તમારી ઑફર અને ખેડૂત ભાવ')}
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#92400E' }}>{t('Farmer Asking Price:', 'ખેડૂત માંગ:')}</span>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#78350F' }}>
                      ₹{selectedOfferForDetail.listing.price || selectedOfferForDetail.offer.expectedPrice}/kg
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#92400E' }}>{t('Your Offered Price:', 'તમારી ઑફર:')}</span>
                    <div style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--green-primary)' }}>
                      ₹{selectedOfferForDetail.offer.offeredPrice}/kg
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.825rem', color: '#78350F', display: 'flex', flexDirection: 'column', gap: 4, borderTop: '1px dashed #FDE68A', paddingTop: 10 }}>
                  <div>📦 <strong>{t('Offered Quantity:', 'ઓફર કરેલ જથ્થો:')}</strong> {selectedOfferForDetail.offer.qty} {selectedOfferForDetail.offer.unit}</div>
                  <div>💵 <strong>{t('Total Deal Value:', 'કુલ સોદા મૂલ્ય:')}</strong> ₹{selectedOfferForDetail.dealTotal}</div>
                  <div>🚚 <strong>{t('Delivery Mode:', 'ડિલિવરી:')}</strong> {selectedOfferForDetail.offer.deliveryTerms}</div>
                  <div>💳 <strong>{t('Payment Terms:', 'ચુકવણી શરતો:')}</strong> {selectedOfferForDetail.offer.paymentTerms}</div>
                  {selectedOfferForDetail.offer.message && (
                    <div style={{ marginTop: 4, fontStyle: 'italic', color: '#92400E' }}>
                      💬 "{selectedOfferForDetail.offer.message}"
                    </div>
                  )}
                </div>
              </div>

              {/* Counter details in modal if present */}
              {selectedOfferForDetail.offer.status === 'countered' && (
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 14, padding: '14px 18px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: '#1E40AF', fontSize: '0.9rem' }}>
                      🔄 {t('Farmer Counter-Offer:', 'ખેડૂતનો કાઉન્ટર ભાવ:')}
                    </span>
                    <strong style={{ fontSize: '1.2rem', color: '#1E40AF' }}>
                      ₹{selectedOfferForDetail.offer.counterPrice}/kg
                    </strong>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: '#3B82F6' }}>
                    {t('Accepting this counter will confirm the deal and connect you directly for fulfillment.', 'આ કાઉન્ટર સ્વીકારવાથી સોદો નક્કી થશે.')}
                  </p>
                  <button
                    className="btn btn-primary btn-full"
                    onClick={() => handleAcceptCounter(selectedOfferForDetail.offer.id)}
                  >
                    ✓ {t('Accept Counter-Offer Now', 'હમણાં કાઉન્ટર સ્વીકારો')}
                  </button>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setSelectedOfferForDetail(null)}
                >
                  {t('Close', 'બંધ કરો')}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
