import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck, MessageCircle, Check, X, RefreshCw,
  Building2, Globe, Truck, CreditCard, Star, CheckCircle2, Phone
} from 'lucide-react';
import { BUYER_REQUIREMENTS, ENTERPRISES } from '../../data/sampleData';
import { FadeUpItem, StaggerGrid } from '../../components/common/AnimatedComponents';

export default function OffersInbox() {
  const navigate = useNavigate();
  const {
    farmerOffers = [],
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

  // Helper to resolve associated buyer requirement & enterprise details for the modal
  const getOfferRequirement = (offer) => {
    if (!offer) return null;
    return (
      buyerRequirements.find(r => r.id === offer.requirementId) ||
      BUYER_REQUIREMENTS.find(r => r.id === offer.requirementId) ||
      buyerRequirements.find(r => r.enterpriseId === offer.enterpriseId && r.crop === offer.crop) ||
      BUYER_REQUIREMENTS.find(r => r.enterpriseId === offer.enterpriseId && r.crop === offer.crop) ||
      {
        id: offer.requirementId || 'br1',
        title: offer.requirementTitle || `Requirement for ${offer.cropName || 'Produce'}`,
        targetPrice: offer.requirementTargetPrice || offer.offeredPrice,
        destination: offer.destination || 'UAE (Dubai)',
        flag: offer.flag || '🇦🇪',
        specs: offer.specs || {
          purity: '99.5% Machine Cleaned',
          moisture: 'Below 8%',
          grade: 'Premium Export Bold',
          packaging: '50 kg PP bags',
        },
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
      {/* Header */}
      <div style={{ background: 'var(--green-primary)', padding: '32px 0 48px' }}>
        <div className="container">
          <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>Offers Inbox</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            <span className="notranslate">{farmerOffers.filter(o => o.status === 'new').length}</span> new offers
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: -20, paddingBottom: 40 }}>
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
        <StaggerGrid style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>No offers here</h3>
            </div>
          ) : filtered.map((offer, i) => (
            <FadeUpItem key={offer.id} delay={i * 0.08}>
              <div
                className={`offer-card ${offer.status === 'new' ? 'new' : ''}`}
                onClick={() => setSelectedOfferForDetail(offer)}
                style={{ cursor: 'pointer' }}
                title="Click to view full buyer information and requirement details"
              >
                {/* Main Offer Details Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {offer.enterpriseName}
                      </span>
                      <ShieldCheck size={15} color="var(--green-primary)" />
                    </div>
                    <p style={{ fontSize: '0.8125rem', margin: '0 0 4px', color: 'var(--text-secondary)' }}>
                      📦 <span className="notranslate">{offer.qty} {offer.unit}</span> • 🚚 {offer.deliveryTerms}
                    </p>
                    <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-secondary)' }}>
                      💳 {offer.paymentTerms}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--green-primary)' }}>
                      ₹{offer.offeredPrice}<span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>/kg</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Your ask: <span className="notranslate">₹{offer.expectedPrice}/kg</span>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <span className={offer.offeredPrice >= offer.expectedPrice ? 'badge badge-green' : 'badge badge-amber'}>
                        {offer.offeredPrice >= offer.expectedPrice ? '✓ At your price' : `₹${offer.expectedPrice - offer.offeredPrice} below ask`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message if present */}
                {offer.message && (
                  <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                    <p style={{ fontSize: '0.8125rem', margin: 0, fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                      "{offer.message}"
                    </p>
                  </div>
                )}

                {/* Counter status banner */}
                {offer.status === 'countered' && offer.counterPrice && (
                  <div style={{ background: 'var(--blue-light)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                    <p style={{ fontSize: '0.8125rem', margin: 0, fontWeight: 600, color: 'var(--blue)' }}>
                      Your counter: <span className="notranslate">₹{offer.counterPrice}/kg</span> → Awaiting enterprise response
                    </p>
                  </div>
                )}

                {/* Accepted status banner */}
                {offer.status === 'accepted' && (
                  <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                    <p style={{ fontSize: '0.8125rem', margin: 0, fontWeight: 600, color: 'var(--green-primary)' }}>
                      ✅ Offer accepted! Enterprise will contact you directly to arrange pickup and payment.
                    </p>
                  </div>
                )}

                {/* Action buttons row */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flex: 1 }}>
                    🕐 {offer.sentAt}
                  </span>

                  {offer.status === 'new' && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAccept(offer.id);
                        }}
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCounterModal(offer);
                        }}
                      >
                        <RefreshCw size={14} /> Counter
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDecline(offer.id);
                        }}
                      >
                        <X size={14} /> Decline
                      </button>
                    </>
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
              </div>
            </FadeUpItem>
          ))}
        </StaggerGrid>
      </div>

      {/* =================================================================== */}
      {/* BUYER INFORMATION & REQUIREMENT DETAIL MODAL (ON CLICK)            */}
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
                  maxWidth: 680,
                  width: '95%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  borderRadius: 20,
                  padding: '28px'
                }}
              >
                {/* Modal Header: Enterprise Profile */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 52, height: 52, background: 'var(--green-light)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
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

                {/* Linked Buyer Requirement Banner */}
                {req && (
                  <div style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, border: '1px solid #86EFAC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                      <span className="badge badge-green" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                        📋 BUYER REQUIREMENT
                      </span>
                      {(offer.flag || req.flag) && (
                        <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
                          <span>{offer.flag || req.flag}</span> Destination: {offer.destination || req.destination}
                        </span>
                      )}
                    </div>
                    <h4 style={{ margin: '0 0 6px', fontFamily: 'var(--font-heading)', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {req.title}
                    </h4>
                    {req.notes && (
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {req.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Pricing & Commercial Offer Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
                  <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 14px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Buyer Offered Price</span>
                    <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--green-primary)', marginTop: 2 }}>
                      ₹{offer.offeredPrice}/kg
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 14px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your Ask Price</span>
                    <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', marginTop: 2 }}>
                      ₹{offer.expectedPrice}/kg
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 14px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Volume Requested</span>
                    <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', marginTop: 2 }}>
                      {offer.qty} {offer.unit}
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 14px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Deal Value</span>
                    <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--green-primary)', marginTop: 2 }}>
                      ₹{totalVal}
                    </div>
                  </div>
                </div>

                {/* Quality Specifications */}
                {req?.specs && Object.keys(req.specs).length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <h5 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={16} color="var(--green-primary)" />
                      Buyer Quality Specifications
                    </h5>

                    <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 16px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                        {Object.entries(req.specs).map(([specKey, specVal]) => (
                          <div key={specKey}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                              {specKey.replace(/([A-Z])/g, ' $1')}
                            </span>
                            <p className="notranslate" style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.85rem' }}>
                              {specVal}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Logistics & Payment */}
                <div style={{ marginBottom: 24 }}>
                  <h5 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Truck size={16} color="var(--green-primary)" />
                    Logistics & Contact Information
                  </h5>

                  <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 16px', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delivery Mode</span>
                      <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.85rem' }}>
                        {offer.deliveryTerms || 'Farm Pickup'}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payment Terms</span>
                      <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.85rem' }}>
                        {offer.paymentTerms || '50% advance, 50% on delivery'}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Validity</span>
                      <p className="notranslate" style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.85rem' }}>
                        {offer.validity || '2026-10-25'}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Buyer Phone</span>
                      <p className="notranslate" style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.85rem' }}>
                        {enterprise.phone || '+91 98250 11223'}
                      </p>
                    </div>
                  </div>
                </div>

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
                        <RefreshCw size={15} /> Counter
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        onClick={() => handleAccept(offer.id)}
                      >
                        <Check size={16} /> Accept Offer
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
      {/* COUNTER OFFER BOTTOM SHEET                                         */}
      {/* =================================================================== */}
      <AnimatePresence>
        {counterSheet && (
          <motion.div
            className="bottom-sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCounterSheet(null)}
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
                Propose a price for <strong>{counterSheet.enterpriseName}</strong> (Current offer: <span className="notranslate">₹{counterSheet.offeredPrice}/kg</span>)
              </p>

              <div style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ marginBottom: 10 }}>
                  Your counter price (₹/kg)
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
                <label className="form-label">Note (optional)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={counterNote}
                  onChange={e => setCounterNote(e.target.value)}
                  placeholder="e.g. This is premium quality lot, quality justifies price."
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
                  Send Counter →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
