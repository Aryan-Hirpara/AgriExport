import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  MessageCircle, X, RefreshCw, ShieldCheck,
  MapPin, CheckCircle2, ChevronRight, FileText, Sparkles,
  Building2, ArrowUpRight, Check, AlertCircle, Info
} from 'lucide-react';
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

export default function MyOffers() {
  const {
    addToast,
    enterpriseOffers = [],
    acceptOffer,
    counterOffer,
    rejectOffer,
    updateEnterpriseOffer,
    withdrawEnterpriseOffer,
    withdrawOffer,
    produceListings = [],
    crops = []
  } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState(null);
  const [counterSheet, setCounterSheet] = useState(null);
  const [counterPrice, setCounterPrice] = useState(100);
  const [counterNote, setCounterNote] = useState('');

  const allListings = produceListings;
  const offersList = enterpriseOffers;

  const matchesTab = (offer, tab) => {
    if (tab === 'pending') return offer.status === 'pending' || offer.status === 'new';
    return offer.status === tab;
  };

  const filtered = offersList.filter(o => matchesTab(o, activeTab));

  const handleWithdraw = async (id) => {
    if (withdrawEnterpriseOffer) {
      await withdrawEnterpriseOffer(id);
    } else if (withdrawOffer) {
      await withdrawOffer(id);
    }
  };

  const openCounterModal = (offer) => {
    setCounterSheet(offer);
    setCounterPrice(offer.counterPrice || offer.offeredPrice || 100);
    setCounterNote(offer.counterNote || '');
  };

  const handleSendCounter = async () => {
    if (!counterSheet) return;
    try {
      await counterOffer(counterSheet.id, Number(counterPrice), counterNote || 'Enterprise proposed counter price.');
      if (selectedOfferForDetail?.offer?.id === counterSheet.id) {
        setSelectedOfferForDetail(prev => ({
          ...prev,
          offer: {
            ...prev.offer,
            status: 'countered',
            counterPrice: Number(counterPrice),
            counterNote: counterNote,
            counteredBy: 'enterprise'
          }
        }));
      }
      setCounterSheet(null);
    } catch (err) {
      console.error('Counter error:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      if (rejectOffer) {
        await rejectOffer(id);
      }
      if (selectedOfferForDetail?.offer?.id === id) {
        setSelectedOfferForDetail(null);
      }
    } catch (err) {
      console.error('Reject error:', err);
    }
  };

  const handleAcceptCounter = async (id) => {
    try {
      if (acceptOffer) {
        await acceptOffer(id);
      } else if (updateEnterpriseOffer) {
        updateEnterpriseOffer(id, { status: 'accepted' });
      }
      if (selectedOfferForDetail?.offer?.id === id) {
        setSelectedOfferForDetail(prev => ({
          ...prev,
          offer: { ...prev.offer, status: 'accepted' }
        }));
      }
    } catch (err) {
      console.error('Accept counter error:', err);
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
    return {
      name: offer.farmerName || listing?.farmer?.name || listing?.farmerName || 'Gujarat Farmer',
      village: offer.village || listing?.village || 'Unjha',
      district: offer.district || listing?.district || 'Mehsana',
      rating: listing?.farmer?.rating || listing?.farmerRating || 4.9,
      reviews: listing?.farmer?.reviews || 38,
      verified: true,
      avatar: listing?.farmer?.avatar || '👨‍🌾',
      phone: offer.farmerPhone || listing?.farmer?.phone || '+91 98250 88771',
    };
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: 'var(--green-primary)', padding: '32px 0 48px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 20, color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
              💼 Outgoing Offers Tracker
            </span>
          </div>
          <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)', margin: 0 }}>
            My Offers
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', margin: '4px 0 0' }}>
            {offersList.length} total offers placed on farmer listings
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
            const count = offersList.filter(o => matchesTab(o, tab)).length;
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
                <span>{TAB_LABELS[tab]}</span>
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
                No {TAB_LABELS[activeTab]} offers
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
                Browse verified produce listings from Gujarat farmers and send direct price offers.
              </p>
              <Link to="/browse" className="btn btn-primary">
                🌾 Browse Produce Listings
              </Link>
            </div>
          ) : filtered.map((offer, i) => {
            const listing = resolveListing(offer);
            const farmer = resolveFarmer(offer, listing);
            const cropObj = crops.find(c => (c.slug || c.id) === (listing.crop || offer.crop)) || { name: offer.cropName || 'Produce', emoji: offer.emoji || '🌾' };
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
                        overflow: 'hidden',
                      }}
                    >
                      {offer.emoji || cropObj.emoji || listing.emoji || '🌿'}
                    </div>

                    {/* Middle Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <h4 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.15rem' }}>
                          {listing.cropName || offer.cropName}
                        </h4>
                        <span className={`badge ${STATUS_BADGE[offer.status]}`} style={{ fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 700 }}>
                          {offer.status}
                        </span>
                        {(offer.grade || listing.grade) && (
                          <span className="badge badge-green notranslate" translate="no" style={{ fontSize: '0.75rem' }}>
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
                            <span key={k} className="badge notranslate" translate="no" style={{ fontSize: '0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#334155' }}>
                              {String(v)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Pricing Box */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {offer.status === 'countered' && offer.counterPrice ? (
                        <>
                          <div className="notranslate" translate="no" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.5rem', color: '#2563EB' }}>
                            ₹{offer.counterPrice}/kg
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            Original: <span className="notranslate" style={{ textDecoration: 'line-through' }}>₹{offer.offeredPrice}/kg</span>
                            {askPrice ? ` • Ask: ₹${askPrice}/kg` : ''}
                          </div>
                          <div style={{ marginTop: 4 }}>
                            <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
                              🔄 Active Counter: ₹{offer.counterPrice}/kg
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="notranslate" translate="no" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.4rem', color: 'var(--green-primary)' }}>
                            ₹{offer.offeredPrice}/kg
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            Farmer ask: <strong className="notranslate" translate="no">₹{askPrice}/kg</strong>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: 4, background: 'var(--green-light)', padding: '2px 8px', borderRadius: 8 }}>
                            Total: <span className="notranslate" translate="no">₹{dealTotal}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Counter alert if present */}
                  {offer.status === 'countered' && offer.counterPrice && (
                    <div style={{
                      background: offer.counteredBy === 'farmer' ? '#FEF3C7' : '#EFF6FF',
                      border: `1px solid ${offer.counteredBy === 'farmer' ? '#FCD34D' : '#BFDBFE'}`,
                      borderRadius: 12,
                      padding: '12px 14px',
                      marginTop: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 8
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
                        <span style={{ fontSize: '1.2rem' }}>{offer.counteredBy === 'farmer' ? '⚡' : '📤'}</span>
                        <div>
                          <p style={{
                            margin: 0,
                            fontSize: '0.85rem',
                            color: offer.counteredBy === 'farmer' ? '#92400E' : '#1E40AF',
                            fontWeight: 700
                          }}>
                            {offer.counteredBy === 'farmer'
                              ? `Farmer proposed a counter offer of ₹${offer.counterPrice}/kg (Original: ₹${offer.offeredPrice}/kg). Review & respond!`
                              : `You countered with ₹${offer.counterPrice}/kg (Original: ₹${offer.offeredPrice}/kg) • Awaiting farmer response.`}
                          </p>
                          {offer.counterNote && (
                            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: offer.counteredBy === 'farmer' ? '#B45309' : '#3B82F6', fontStyle: 'italic' }}>
                              "{offer.counterNote}"
                            </p>
                          )}
                        </div>
                      </div>

                      {offer.counteredBy === 'farmer' ? (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptCounter(offer.id);
                            }}
                          >
                            ✓ Accept Counter (₹{offer.counterPrice}/kg)
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCounterModal(offer);
                            }}
                          >
                            🔄 Counter Back
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(offer.id);
                            }}
                          >
                            <X size={14} /> Decline
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCounterModal(offer);
                          }}
                        >
                          <RefreshCw size={14} /> Modify Counter
                        </button>
                      )}
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
                      View Farmer Item Description & Specs
                    </button>

                    {(offer.status === 'pending' || offer.status === 'new') && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--text-secondary)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWithdraw(offer.id);
                        }}
                      >
                        <X size={14} /> Withdraw
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/farmer/chat');
                      }}
                    >
                      <MessageCircle size={14} /> Chat
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
                      overflow: 'hidden',
                    }}
                  >
                    {selectedOfferForDetail.cropObj?.emoji || selectedOfferForDetail.listing?.emoji || '🌿'}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>
                      {selectedOfferForDetail.listing.cropName}
                    </h3>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className={`badge ${STATUS_BADGE[selectedOfferForDetail.offer.status]}`} style={{ textTransform: 'capitalize' }}>
                        {selectedOfferForDetail.offer.status}
                      </span>
                      <span className="badge badge-green notranslate" translate="no">
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
                  <div className="avatar" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', overflow: 'hidden', flexShrink: 0 }}>
                    {typeof selectedOfferForDetail.farmer.avatar === 'string' &&
                    (selectedOfferForDetail.farmer.avatar.startsWith('data:') || selectedOfferForDetail.farmer.avatar.startsWith('http') || selectedOfferForDetail.farmer.avatar.startsWith('/')) ? (
                      <img src={selectedOfferForDetail.farmer.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      selectedOfferForDetail.farmer.avatar || '👨‍🌾'
                    )}
                  </div>
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
                  <MessageCircle size={14} /> Message Farmer
                </button>
              </div>

              {/* Farmer's Lot Item Description */}
              <div style={{ marginBottom: 20 }}>
                <h5 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 8px', fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={16} color="var(--green-primary)" />
                  Farmer Produce Description & Harvest Notes
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
                    "{selectedOfferForDetail.listing.description || 'Sun-dried, machine cleaned export-quality produce. Laboratory tested lot available for immediate dispatch.'}"
                  </p>
                </div>
              </div>

              {/* Quality Specifications Grid */}
              <div style={{ marginBottom: 20 }}>
                <h5 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 10px', fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} color="var(--green-primary)" />
                  Technical Specifications & Quality Parameters
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Produce Grade</span>
                    <strong className="notranslate" translate="no" style={{ fontSize: '0.85rem' }}>{selectedOfferForDetail.listing.grade || 'Grade A'}</strong>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Lot Available</span>
                    <strong className="notranslate" translate="no" style={{ fontSize: '0.85rem' }}>{selectedOfferForDetail.listing.qty} {selectedOfferForDetail.listing.unit}</strong>
                  </div>

                  {selectedOfferForDetail.listing.specs && Object.entries(selectedOfferForDetail.listing.specs).map(([key, val]) => (
                    <div key={key} style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize', display: 'block' }}>
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <strong className="notranslate" translate="no" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{String(val)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Offer Comparison Box */}
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
                <h5 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 12px', fontSize: '0.925rem', color: '#92400E', display: 'flex', alignItems: 'center', gap: 6 }}>
                  💰 Your Offer Details vs Asking Price
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#92400E' }}>Farmer Asking Price:</span>
                    <div className="notranslate" translate="no" style={{ fontWeight: 800, fontSize: '1.2rem', color: '#78350F' }}>
                      ₹{selectedOfferForDetail.listing.price || selectedOfferForDetail.offer.expectedPrice}/kg
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#92400E' }}>Your Offered Price:</span>
                    <div className="notranslate" translate="no" style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--green-primary)' }}>
                      ₹{selectedOfferForDetail.offer.offeredPrice}/kg
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.825rem', color: '#78350F', display: 'flex', flexDirection: 'column', gap: 4, borderTop: '1px dashed #FDE68A', paddingTop: 10 }}>
                  <div>📦 <strong>Offered Quantity:</strong> <span className="notranslate" translate="no">{selectedOfferForDetail.offer.qty} {selectedOfferForDetail.offer.unit}</span></div>
                  <div>💵 <strong>Total Deal Value:</strong> <span className="notranslate" translate="no">₹{selectedOfferForDetail.dealTotal}</span></div>
                  <div>🚚 <strong>Delivery Mode:</strong> {selectedOfferForDetail.offer.deliveryTerms}</div>
                  <div>💳 <strong>Payment Terms:</strong> {selectedOfferForDetail.offer.paymentTerms}</div>
                  {selectedOfferForDetail.offer.message && (
                    <div style={{ marginTop: 4, fontStyle: 'italic', color: '#92400E' }}>
                      💬 "{selectedOfferForDetail.offer.message}"
                    </div>
                  )}
                </div>
              </div>

              {/* Counter details in modal if present */}
              {selectedOfferForDetail.offer.status === 'countered' && selectedOfferForDetail.offer.counterPrice && (
                <div style={{
                  background: selectedOfferForDetail.offer.counteredBy === 'farmer' ? '#FEF3C7' : '#EFF6FF',
                  border: `1.5px solid ${selectedOfferForDetail.offer.counteredBy === 'farmer' ? '#F59E0B' : '#3B82F6'}`,
                  borderRadius: 14,
                  padding: '16px 18px',
                  marginBottom: 20
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: selectedOfferForDetail.offer.counteredBy === 'farmer' ? '#92400E' : '#1E40AF', fontSize: '0.9rem' }}>
                      {selectedOfferForDetail.offer.counteredBy === 'farmer' ? '⚡ Farmer Counter-Offer' : '📤 Your Counter Offer'}
                    </span>
                    <strong className="notranslate" translate="no" style={{ fontSize: '1.3rem', color: selectedOfferForDetail.offer.counteredBy === 'farmer' ? '#B45309' : '#1D4ED8' }}>
                      ₹{selectedOfferForDetail.offer.counterPrice}/kg
                    </strong>
                  </div>
                  {selectedOfferForDetail.offer.counterNote && (
                    <p style={{ margin: '4px 0 10px', fontSize: '0.825rem', color: selectedOfferForDetail.offer.counteredBy === 'farmer' ? '#92400E' : '#1E40AF', fontStyle: 'italic' }}>
                      Note: "{selectedOfferForDetail.offer.counterNote}"
                    </p>
                  )}

                  {selectedOfferForDetail.offer.counteredBy === 'farmer' ? (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => handleAcceptCounter(selectedOfferForDetail.offer.id)}
                      >
                        ✓ Accept Counter (₹{selectedOfferForDetail.offer.counterPrice}/kg)
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => openCounterModal(selectedOfferForDetail.offer)}
                      >
                        🔄 Counter Back
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary btn-full"
                      onClick={() => openCounterModal(selectedOfferForDetail.offer)}
                    >
                      🔄 Modify Your Counter Price
                    </button>
                  )}
                </div>
              )}

              {/* Modal Action Buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setSelectedOfferForDetail(null)}
                >
                  Close
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Counter Offer Bottom Sheet for Enterprise */}
      <AnimatePresence>
        {counterSheet && (
          <motion.div
            className="bottom-sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCounterSheet(null)}
            style={{ zIndex: 1300 }}
          >
            <motion.div
              className="bottom-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="bottom-sheet-handle" />
              <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 4 }}>
                Send Counter Offer
              </h4>
              <p style={{ fontSize: '0.875rem', marginBottom: 20, color: 'var(--text-muted)' }}>
                Propose your price for the produce lot (Current price: <span className="notranslate">₹{counterSheet.counterPrice || counterSheet.offeredPrice}/kg</span>)
              </p>

              <div style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ marginBottom: 10 }}>
                  Your Counter Price (₹/kg)
                </label>
                <div className="stepper">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setCounterPrice(p => Math.max(1, p - 1))}
                  >
                    −
                  </button>
                  <input
                    className="stepper-input notranslate"
                    type="number"
                    value={counterPrice}
                    onChange={e => setCounterPrice(Number(e.target.value))}
                  />
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setCounterPrice(p => p + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Note for Farmer (optional)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={counterNote}
                  onChange={e => setCounterNote(e.target.value)}
                  placeholder="e.g. Willing to adjust based on quality certification or volume terms."
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-full"
                  onClick={() => setCounterSheet(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-full"
                  onClick={handleSendCounter}
                >
                  Submit Counter (₹{counterPrice}/kg) →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
