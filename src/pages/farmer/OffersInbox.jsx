import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck, MessageCircle, Check, X, RefreshCw,
  FileText, ExternalLink, Globe, Truck, CreditCard,
  Building2, Calendar, Star, Info, AlertCircle, CheckCircle2
} from 'lucide-react';
import { BUYER_REQUIREMENTS, ENTERPRISES } from '../../data/sampleData';
import { FadeUpItem, StaggerGrid } from '../../components/common/AnimatedComponents';

export default function OffersInbox() {
  const navigate = useNavigate();
  const {
    farmerOffers = [],
    setFarmerOffers,
    updateFarmerOffer,
    deleteFarmerOffer,
    buyerRequirements = [],
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('new');
  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState(null);
  const [counterSheet, setCounterSheet] = useState(null);
  const [counterPrice, setCounterPrice] = useState(312);
  const [counterNote, setCounterNote] = useState('');

  const tabs = [
    { key: 'new', label: 'New' },
    { key: 'countered', label: 'Countered' },
    { key: 'accepted', label: 'Accepted' },
  ];

  const filtered = farmerOffers.filter(o => o.status === activeTab);

  const handleAccept = (id) => {
    updateFarmerOffer(id, { status: 'accepted' });
    if (selectedOfferForDetail && selectedOfferForDetail.id === id) {
      setSelectedOfferForDetail(prev => ({ ...prev, status: 'accepted' }));
    }
    addToast('Offer accepted! Deal created 🎉', 'success');
  };

  const handleDecline = (id) => {
    deleteFarmerOffer(id);
    if (selectedOfferForDetail && selectedOfferForDetail.id === id) {
      setSelectedOfferForDetail(null);
    }
    addToast('Offer declined', 'warning');
  };

  const openCounterModal = (offer) => {
    setCounterSheet(offer);
    const suggestedPrice = offer.counterPrice || (offer.offeredPrice < offer.expectedPrice ? Math.round((offer.offeredPrice + offer.expectedPrice) / 2) : offer.expectedPrice);
    setCounterPrice(suggestedPrice);
    setCounterNote('');
  };

  const handleSendCounter = () => {
    if (!counterSheet) return;
    updateFarmerOffer(counterSheet.id, {
      status: 'countered',
      counterPrice: Number(counterPrice),
      counterNote: counterNote || 'Farmer proposed adjusted price for premium quality lot.',
    });
    if (selectedOfferForDetail && selectedOfferForDetail.id === counterSheet.id) {
      setSelectedOfferForDetail(prev => ({
        ...prev,
        status: 'countered',
        counterPrice: Number(counterPrice),
        counterNote: counterNote,
      }));
    }
    addToast(`Counter offer of ₹${counterPrice}/kg sent to ${counterSheet.enterpriseName}! 🎉`, 'success');
    setCounterSheet(null);
  };

  // Resolve associated buyer requirement & enterprise
  const getOfferRequirement = (offer) => {
    if (!offer) return null;
    return (
      buyerRequirements.find(r => r.id === offer.requirementId) ||
      BUYER_REQUIREMENTS.find(r => r.id === offer.requirementId) ||
      buyerRequirements.find(r => r.enterpriseId === offer.enterpriseId && r.crop === offer.crop) ||
      BUYER_REQUIREMENTS.find(r => r.enterpriseId === offer.enterpriseId && r.crop === offer.crop) ||
      {
        id: offer.requirementId || 'br_default',
        title: offer.requirementTitle || `Requirement for ${offer.cropName}`,
        targetPrice: offer.requirementTargetPrice || offer.offeredPrice,
        destination: offer.destination || 'Export Markets',
        flag: offer.flag || '🌐',
        specs: offer.specs || {},
        notes: offer.requirementNotes || offer.message,
        deliveryTerms: offer.deliveryTerms,
        paymentTerms: offer.paymentTerms,
      }
    );
  };

  const getOfferEnterprise = (offer) => {
    if (!offer) return null;
    return (
      ENTERPRISES.find(e => e.id === offer.enterpriseId) ||
      ENTERPRISES.find(e => e.name === offer.enterpriseName) ||
      {
        id: offer.enterpriseId || 'e1',
        name: offer.enterpriseName || 'Export Enterprise',
        type: offer.buyerType || 'Export House',
        city: offer.city || 'Ahmedabad, Gujarat',
        phone: offer.phone || '+91 98250 11223',
        rating: offer.rating || 4.7,
        reviews: offer.reviews || 36,
        verified: true,
        logo: '🏢',
      }
    );
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header Banner */}
      <div style={{ background: 'var(--green-primary)', padding: '32px 0 48px' }}>
        <div className="container">
          <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)', margin: '0 0 6px' }}>Offers Inbox</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '0.95rem' }}>
            Review incoming purchase offers, buyer requirement specifications, and negotiate terms.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: -24, paddingBottom: 40 }}>
        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: '8px',
            boxShadow: 'var(--shadow-md)',
            marginBottom: 24,
            display: 'flex',
            gap: 6
          }}
        >
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab.key ? 'var(--green-primary)' : 'transparent',
                color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                fontFamily: 'var(--font-heading)',
                transition: 'all 0.2s'
              }}
            >
              {tab.label} (<span className="notranslate">{farmerOffers.filter(o => o.status === tab.key).length}</span>)
            </button>
          ))}
        </motion.div>

        {/* Offers List */}
        <StaggerGrid style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ background: '#fff', borderRadius: 16, padding: '48px 24px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <div className="empty-state-icon" style={{ fontSize: '3.5rem', marginBottom: 16 }}>📭</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>No offers in this section</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 400, margin: '0 auto' }}>
                When buyers and exporters send purchase offers or counter-proposals on your produce listings, they will appear here.
              </p>
            </div>
          ) : filtered.map((offer, i) => {
            const req = getOfferRequirement(offer);
            const enterprise = getOfferEnterprise(offer);
            const totalOfferValue = ((Number(offer.qty) || 1) * 1000 * Number(offer.offeredPrice)).toLocaleString('en-IN');
            const totalCounterValue = offer.counterPrice ? ((Number(offer.qty) || 1) * 1000 * Number(offer.counterPrice)).toLocaleString('en-IN') : null;
            const priceDiff = (Number(offer.expectedPrice) || 0) - Number(offer.offeredPrice);

            return (
              <FadeUpItem key={offer.id} delay={i * 0.08}>
                <div
                  className={`offer-card ${offer.status === 'new' ? 'new' : ''}`}
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: '24px',
                    boxShadow: 'var(--shadow-sm)',
                    border: offer.status === 'new' ? '1.5px solid var(--green-primary)' : '1px solid var(--border)',
                    position: 'relative'
                  }}
                >
                  {/* Top Header: Crop Name & Buyer Requirement Link */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: '2rem', lineHeight: 1 }}>{offer.emoji || '🌿'}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                            {offer.cropName}
                          </h4>
                          <span className="badge badge-gray notranslate" style={{ fontSize: '0.72rem' }}>
                            {offer.grade || 'Export Lot'}
                          </span>
                          {(offer.flag || req?.flag) && (
                            <span className="badge badge-blue" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <span>{offer.flag || req?.flag}</span>
                              <span>{offer.destination || req?.destination || 'Export'}</span>
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Listing: <span className="notranslate">#{offer.listingId || 'Lot'}</span> • Requested Volume: <strong className="notranslate" style={{ color: 'var(--text-primary)' }}>{offer.qty} {offer.unit} ({offer.qty * 1000} kg)</strong>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        padding: '8px 14px',
                        borderRadius: 10,
                        borderColor: 'var(--green-primary)',
                        color: 'var(--green-primary)'
                      }}
                      onClick={() => setSelectedOfferForDetail(offer)}
                    >
                      <FileText size={15} />
                      View Buyer Requirement
                    </button>
                  </div>

                  {/* Highlighted Buyer Requirement Box */}
                  {req && (
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
                        border: '1px solid #BBF7D0',
                        borderRadius: 12,
                        padding: '12px 16px',
                        marginBottom: 16
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: '0.85rem' }}>📋</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Linked Buyer Requirement
                          </span>
                        </div>
                        {req.targetPrice && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            Buyer Target Rate: <strong className="notranslate" style={{ color: 'var(--green-primary)' }}>₹{req.targetPrice}/kg</strong>
                          </span>
                        )}
                      </div>

                      <p style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {req.title}
                      </p>

                      {/* Specs Chips Row */}
                      {req.specs && Object.keys(req.specs).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {Object.entries(req.specs).slice(0, 4).map(([k, v]) => (
                            <span
                              key={k}
                              className="badge badge-gray"
                              style={{
                                fontSize: '0.72rem',
                                background: '#fff',
                                border: '1px solid #E2E8F0',
                                padding: '3px 8px'
                              }}
                            >
                              <strong style={{ textTransform: 'capitalize' }}>{k}:</strong> <span className="notranslate">{v}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Commercial Offer Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
                    {/* Left: Enterprise & Delivery Information */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, background: 'var(--green-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                          🏢
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                              {offer.enterpriseName}
                            </span>
                            <ShieldCheck size={15} color="var(--green-primary)" />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {enterprise.type || 'Export House'} • 📍 {enterprise.city || 'Gujarat'}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Truck size={14} color="var(--green-primary)" />
                          <span>Delivery: <strong style={{ color: 'var(--text-primary)' }}>{offer.deliveryTerms || 'Farm Pickup'}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CreditCard size={14} color="var(--green-primary)" />
                          <span>Payment: <strong style={{ color: 'var(--text-primary)' }}>{offer.paymentTerms || '50% advance, 50% on weight slip'}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Price & Valuation Comparison Box */}
                    <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 16px', border: '1px solid #E2E8F0', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Buyer Offered Price:</span>
                        <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.6rem', color: 'var(--green-primary)' }}>
                          ₹{offer.offeredPrice}<span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>/kg</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                        <span>Your Original Ask:</span>
                        <span className="notranslate" style={{ fontWeight: 600 }}>₹{offer.expectedPrice}/kg</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Total Lot Value: <strong className="notranslate" style={{ color: 'var(--text-primary)' }}>₹{totalOfferValue}</strong>
                        </span>
                        <span className={priceDiff <= 0 ? 'badge badge-green' : 'badge badge-amber'} style={{ fontSize: '0.75rem' }}>
                          {priceDiff <= 0 ? '✓ At/Above ask' : `₹${priceDiff}/kg below ask`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Buyer Note / Message */}
                  {offer.message && (
                    <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '10px 14px', marginBottom: 16, borderLeft: '3px solid var(--green-primary)' }}>
                      <p style={{ fontSize: '0.825rem', margin: 0, fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                        "{offer.message}"
                      </p>
                    </div>
                  )}

                  {/* Countered Status Callout */}
                  {offer.status === 'countered' && offer.counterPrice && (
                    <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '1rem' }}>🔄</span>
                          <div>
                            <p style={{ fontSize: '0.875rem', margin: 0, fontWeight: 700, color: '#1E40AF' }}>
                              Counter Price: <span className="notranslate">₹{offer.counterPrice}/kg</span>
                              {totalCounterValue && (
                                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#3B82F6', marginLeft: 8 }}>
                                  (Total Value: ₹{totalCounterValue})
                                </span>
                              )}
                            </p>
                            <p style={{ fontSize: '0.75rem', margin: '2px 0 0', color: '#60A5FA' }}>
                              {offer.counterNote ? `Note: "${offer.counterNote}"` : 'Awaiting enterprise review and confirmation'}
                            </p>
                          </div>
                        </div>
                        <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                          Negotiation In Progress
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Accepted Status Callout */}
                  {offer.status === 'accepted' && (
                    <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, border: '1px solid #86EFAC' }}>
                      <p style={{ fontSize: '0.85rem', margin: 0, fontWeight: 700, color: 'var(--green-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={16} />
                        Offer Accepted & Deal Confirmed! Enterprise logistics will contact you for farmgate pickup and payment.
                      </p>
                    </div>
                  )}

                  {/* Bottom Action Row */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', paddingTop: 8 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flex: 1 }}>
                      🕐 Received {offer.sentAt} • Valid until: <span className="notranslate">{offer.validity || '2026-10-25'}</span>
                    </span>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.825rem' }}
                      onClick={() => setSelectedOfferForDetail(offer)}
                    >
                      <FileText size={14} /> View Details
                    </button>

                    {offer.status === 'new' && (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.825rem' }}
                          onClick={() => handleAccept(offer.id)}
                        >
                          <Check size={14} /> Accept Offer
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.825rem' }}
                          onClick={() => openCounterModal(offer)}
                        >
                          <RefreshCw size={14} /> Counter
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.825rem', color: 'var(--red)' }}
                          onClick={() => handleDecline(offer.id)}
                        >
                          <X size={14} /> Decline
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.825rem' }}
                      onClick={() => navigate('/farmer/chat')}
                    >
                      <MessageCircle size={14} /> Chat
                    </button>
                  </div>
                </div>
              </FadeUpItem>
            );
          })}
        </StaggerGrid>
      </div>

      {/* =================================================================== */}
      {/* BUYER REQUIREMENT & OFFER DETAIL MODAL                              */}
      {/* =================================================================== */}
      <AnimatePresence>
        {selectedOfferForDetail && (() => {
          const offer = selectedOfferForDetail;
          const req = getOfferRequirement(offer);
          const enterprise = getOfferEnterprise(offer);
          const totalVal = ((Number(offer.qty) || 1) * 1000 * Number(offer.offeredPrice)).toLocaleString('en-IN');
          const isAccepted = offer.status === 'accepted';

          return (
            <motion.div
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOfferForDetail(null)}
              style={{ zIndex: 1200 }}
            >
              <motion.div
                className="modal"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                onClick={e => e.stopPropagation()}
                style={{
                  maxWidth: 720,
                  width: '95%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  borderRadius: 20,
                  padding: '28px'
                }}
              >
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 50, height: 50, background: 'var(--green-light)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
                      {enterprise.logo || '🏢'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>
                          {enterprise.name}
                        </h3>
                        <ShieldCheck size={18} color="var(--green-primary)" />
                      </div>
                      <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {enterprise.type || 'Export House'} • 📍 {enterprise.city || 'Gujarat'} • ⭐ {enterprise.rating || 4.7} ({enterprise.reviews || 36} reviews)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOfferForDetail(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                  >
                    <X size={22} />
                  </button>
                </div>

                {/* Requirement Banner */}
                <div style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, border: '1px solid #86EFAC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                    <span className="badge badge-green" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                      📋 BUYER EXPORT REQUIREMENT
                    </span>
                    {(offer.flag || req?.flag) && (
                      <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
                        <span>{offer.flag || req?.flag}</span> Destination: {offer.destination || req?.destination}
                      </span>
                    )}
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    {req?.title || offer.requirementTitle}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {req?.notes || offer.requirementNotes || offer.message}
                  </p>
                </div>

                {/* Pricing & Volume Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
                  <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 14px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Buyer Offer</span>
                    <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--green-primary)', marginTop: 2 }}>
                      ₹{offer.offeredPrice}/kg
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 14px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your Asking Rate</span>
                    <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', marginTop: 2 }}>
                      ₹{offer.expectedPrice}/kg
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 14px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Buyer Target Rate</span>
                    <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--amber)', marginTop: 2 }}>
                      ₹{req?.targetPrice || offer.requirementTargetPrice || offer.offeredPrice}/kg
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 14px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Lot Value</span>
                    <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', marginTop: 2 }}>
                      ₹{totalVal}
                    </div>
                  </div>
                </div>

                {/* Quality Specifications */}
                <div style={{ marginBottom: 20 }}>
                  <h5 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={16} color="var(--green-primary)" />
                    Buyer's Quality & Grade Specifications
                  </h5>

                  <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '14px 16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Crop & Grade</span>
                        <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.875rem' }}>
                          {offer.cropName} ({offer.grade || req?.specs?.grade || 'Export Quality'})
                        </p>
                      </div>

                      {req?.specs && Object.entries(req.specs).map(([specKey, specVal]) => (
                        <div key={specKey}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                            {specKey.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <p className="notranslate" style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.875rem' }}>
                            {specVal}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Commercial Terms */}
                <div style={{ marginBottom: 24 }}>
                  <h5 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Truck size={16} color="var(--green-primary)" />
                    Logistics & Payment Terms
                  </h5>

                  <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '14px 16px', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delivery Terms</span>
                      <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.875rem' }}>
                        {offer.deliveryTerms || req?.deliveryTerms || 'Ex-Farm Pickup'}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payment Terms</span>
                      <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.875rem' }}>
                        {offer.paymentTerms || req?.paymentTerms || '50% advance, 50% on delivery'}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Offer Validity</span>
                      <p className="notranslate" style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.875rem' }}>
                        {offer.validity || '2026-10-25'}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enterprise Phone</span>
                      <p className="notranslate" style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.875rem' }}>
                        {enterprise.phone || '+91 98250 11223'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Counter Details if Countered */}
                {offer.status === 'countered' && offer.counterPrice && (
                  <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '14px 18px', marginBottom: 24 }}>
                    <h5 style={{ margin: '0 0 6px', color: '#1E40AF', fontFamily: 'var(--font-heading)', fontSize: '0.95rem' }}>
                      🔄 Active Counter Offer: ₹{offer.counterPrice}/kg
                    </h5>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#2563EB' }}>
                      {offer.counterNote || 'Proposed adjusted price for lot quality and delivery terms.'}
                    </p>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    onClick={() => {
                      setSelectedOfferForDetail(null);
                      navigate('/farmer/chat');
                    }}
                  >
                    <MessageCircle size={15} /> Chat with Buyer
                  </button>

                  {isAccepted ? (
                    <span className="badge badge-green" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                      ✓ Deal Confirmed
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        onClick={() => {
                          setSelectedOfferForDetail(null);
                          openCounterModal(offer);
                        }}
                      >
                        <RefreshCw size={15} /> Counter Offer
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        onClick={() => handleAccept(offer.id)}
                      >
                        <Check size={16} /> Accept Offer & Confirm Deal
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setSelectedOfferForDetail(null)}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* SEND COUNTER OFFER BOTTOM SHEET / MODAL WITH BUYER REQ DETAILS     */}
      {/* =================================================================== */}
      <AnimatePresence>
        {counterSheet && (() => {
          const req = getOfferRequirement(counterSheet);
          const enterprise = getOfferEnterprise(counterSheet);
          const priceDiffFromOffer = counterPrice - counterSheet.offeredPrice;
          const proposedTotalValue = ((Number(counterPrice) * 1000 * (Number(counterSheet.qty) || 1))).toLocaleString('en-IN');

          return (
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
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: 640, margin: '0 auto', borderRadius: '24px 24px 0 0', padding: '28px' }}
              >
                <div className="bottom-sheet-handle" />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.2rem' }}>
                      Send Counter Offer to Buyer
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      Propose an adjusted rate with full visibility into the buyer's requirement specs.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCounterSheet(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Buyer Requirement Context Summary Box */}
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1.5px solid #BBF7D0',
                    borderRadius: 14,
                    padding: '14px 18px',
                    marginBottom: 20
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.4rem' }}>{counterSheet.emoji || '🌿'}</span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {counterSheet.cropName} ({counterSheet.qty} {counterSheet.unit})
                      </strong>
                    </div>
                    <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                      {counterSheet.flag || req?.flag} {counterSheet.destination || req?.destination || 'Export'}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Requirement: "{req?.title || counterSheet.requirementTitle}"
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem', color: 'var(--text-secondary)', flexWrap: 'wrap', gap: 8 }}>
                    <span>Buyer: <strong>{enterprise.name}</strong></span>
                    <span>
                      Buyer Offered: <strong className="notranslate" style={{ color: 'var(--green-primary)' }}>₹{counterSheet.offeredPrice}/kg</strong>
                    </span>
                    <span>
                      Your Asking: <strong className="notranslate">₹{counterSheet.expectedPrice}/kg</strong>
                    </span>
                  </div>
                </div>

                {/* Counter Price Stepper */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                      Your Proposed Counter Price (₹/kg)
                    </label>
                    <span style={{ fontSize: '0.8rem', color: priceDiffFromOffer >= 0 ? 'var(--green-primary)' : 'var(--red)', fontWeight: 600 }}>
                      {priceDiffFromOffer >= 0 ? `+₹${priceDiffFromOffer}/kg over buyer offer` : `₹${Math.abs(priceDiffFromOffer)}/kg below buyer offer`}
                    </span>
                  </div>

                  <div className="stepper" style={{ maxWidth: 260, margin: '0 auto 12px' }}>
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

                  <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    New Total Lot Deal Value: <strong className="notranslate" style={{ color: 'var(--green-primary)' }}>₹{proposedTotalValue}</strong> ({counterSheet.qty} {counterSheet.unit})
                  </div>
                </div>

                {/* Counter Note */}
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Note to Buyer (optional)
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={counterNote}
                    onChange={e => setCounterNote(e.target.value)}
                    placeholder="e.g. Produce is 99.5% machine cleaned, moisture below 7.5%, ready for immediate dispatch from Unjha warehouse."
                  />
                </div>

                {/* Buttons */}
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
                    Send Counter Offer →
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
