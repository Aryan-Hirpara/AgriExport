import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck, MessageCircle, Check, X, RefreshCw,
  Building2, Globe, Truck, CreditCard, Star, CheckCircle2, Phone,
  ArrowUpRight, ArrowDownLeft, Tag, Layers, Info
} from 'lucide-react';
import { FadeUpItem, StaggerGrid } from '../../components/common/AnimatedComponents';

export default function OffersInbox() {
  const navigate = useNavigate();
  const {
    farmerOffers = [],
    acceptOffer,
    counterOffer,
    rejectOffer,
    withdrawOffer,
    updateFarmerOffer,
    deleteFarmerOffer,
    buyerRequirements = [],
    addToast
  } = useApp();

  // Direction filter: 'all' | 'received' | 'sent'
  const [filterType, setFilterType] = useState('all');
  // Status tab: 'all' | 'new' | 'countered' | 'accepted'
  const [activeTab, setActiveTab] = useState('all');

  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState(null);
  const [counterSheet, setCounterSheet] = useState(null);
  const [counterPrice, setCounterPrice] = useState(312);
  const [counterNote, setCounterNote] = useState('');

  // Helper to determine if the offer is an outgoing quote sent by the farmer
  const isSentQuote = (o) => Boolean(o.senderRole === 'farmer' || (o.requirementId && !o.listingId));

  const receivedOffers = farmerOffers.filter(o => !isSentQuote(o));
  const sentQuotes = farmerOffers.filter(isSentQuote);

  const typeFiltered = farmerOffers.filter(o => {
    if (filterType === 'received') return !isSentQuote(o);
    if (filterType === 'sent') return isSentQuote(o);
    return true;
  });

  const tabs = [
    { key: 'all', label: 'All', count: typeFiltered.length },
    { key: 'new', label: 'New / Pending', count: typeFiltered.filter(o => o.status === 'new').length },
    { key: 'countered', label: 'Countered', count: typeFiltered.filter(o => o.status === 'countered').length },
    { key: 'accepted', label: 'Accepted', count: typeFiltered.filter(o => o.status === 'accepted').length },
  ];

  const filtered = typeFiltered.filter(o => {
    if (activeTab === 'all') return true;
    return o.status === activeTab;
  });

  const handleAccept = async (id) => {
    try {
      await acceptOffer(id);
      if (selectedOfferForDetail && selectedOfferForDetail.id === id) {
        setSelectedOfferForDetail(prev => ({ ...prev, status: 'accepted' }));
      }
    } catch (err) {
      console.error('Accept offer error:', err);
    }
  };

  const handleDecline = async (id) => {
    try {
      await rejectOffer(id);
      if (selectedOfferForDetail && selectedOfferForDetail.id === id) {
        setSelectedOfferForDetail(null);
      }
    } catch (err) {
      console.error('Decline offer error:', err);
    }
  };

  const handleWithdraw = async (id) => {
    try {
      if (withdrawOffer) {
        await withdrawOffer(id);
      }
      if (selectedOfferForDetail && selectedOfferForDetail.id === id) {
        setSelectedOfferForDetail(null);
      }
    } catch (err) {
      console.error('Withdraw offer error:', err);
    }
  };

  const openCounterModal = (offer) => {
    setCounterSheet(offer);
    const suggestedPrice = offer.counterPrice || (offer.offeredPrice < offer.expectedPrice ? Math.round((offer.offeredPrice + offer.expectedPrice) / 2) : offer.offeredPrice);
    setCounterPrice(suggestedPrice);
    setCounterNote(offer.counterNote || '');
  };

  const handleSendCounter = async () => {
    if (!counterSheet) return;
    try {
      await counterOffer(counterSheet.id, Number(counterPrice), counterNote || 'Farmer proposed adjusted price.');
      if (selectedOfferForDetail && selectedOfferForDetail.id === counterSheet.id) {
        setSelectedOfferForDetail(prev => ({
          ...prev,
          status: 'countered',
          counterPrice: Number(counterPrice),
          counterNote: counterNote,
          counteredBy: 'farmer',
        }));
      }
      setCounterSheet(null);
    } catch (err) {
      console.error('Counter offer error:', err);
    }
  };

  // Helper to resolve associated buyer requirement & enterprise details for the modal
  const getOfferRequirement = (offer) => {
    if (!offer) return null;
    return (
      buyerRequirements.find(r => r.id === offer.requirementId || r.dbId === offer.requirementId) ||
      buyerRequirements.find(r => r.enterpriseId === offer.enterpriseId && r.crop === offer.crop) ||
      {
        id: offer.requirementId || '',
        title: offer.requirementTitle || `Requirement for ${offer.cropName || 'Produce'}`,
        targetPrice: offer.requirementTargetPrice || offer.offeredPrice,
        destination: offer.destination || 'India / Export',
        flag: offer.flag || '🇮🇳',
        specs: offer.specs || {
          grade: offer.grade || 'Standard Export Grade',
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
      offer.enterprise || {
        id: offer.enterpriseId || '',
        name: offer.enterpriseName || 'Export Enterprise',
        type: offer.buyerType || 'Export House',
        city: offer.city || 'Gujarat, India',
        phone: offer.phone || '',
        rating: offer.rating || 4.8,
        reviews: 0,
        logo: '🏢',
      }
    );
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: 'var(--green-primary)', padding: '32px 0 48px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 20, color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
              🤝 Commercial Negotiations & Inbox
            </span>
          </div>
          <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)', margin: 0 }}>
            Offers & Quotes Inbox
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', margin: '6px 0 0' }}>
            <span className="notranslate">{farmerOffers.filter(o => o.status === 'new').length}</span> pending actions • <span className="notranslate">{farmerOffers.filter(o => o.status === 'countered').length}</span> active negotiations
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: -20, paddingBottom: 40 }}>
        {/* Top Direction Switcher: All vs Received Offers vs Sent Quotes */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            style={{
              padding: '8px 16px',
              borderRadius: 30,
              border: 'none',
              cursor: 'pointer',
              background: filterType === 'all' ? 'var(--text-primary)' : '#fff',
              color: filterType === 'all' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.825rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s'
            }}
          >
            <Layers size={14} />
            All Negotiations (<span className="notranslate">{farmerOffers.length}</span>)
          </button>

          <button
            type="button"
            onClick={() => setFilterType('received')}
            style={{
              padding: '8px 16px',
              borderRadius: 30,
              border: 'none',
              cursor: 'pointer',
              background: filterType === 'received' ? 'var(--green-primary)' : '#fff',
              color: filterType === 'received' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.825rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s'
            }}
          >
            <ArrowDownLeft size={14} />
            📥 Received Offers (<span className="notranslate">{receivedOffers.length}</span>)
          </button>

          <button
            type="button"
            onClick={() => setFilterType('sent')}
            style={{
              padding: '8px 16px',
              borderRadius: 30,
              border: 'none',
              cursor: 'pointer',
              background: filterType === 'sent' ? '#2563EB' : '#fff',
              color: filterType === 'sent' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.825rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s'
            }}
          >
            <ArrowUpRight size={14} />
            📤 Sent Quotes (<span className="notranslate">{sentQuotes.length}</span>)
          </button>
        </div>

        {/* Status Tabs */}
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
            gap: 6,
            overflowX: 'auto'
          }}
        >
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                minWidth: 100,
                padding: '10px 14px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab.key ? 'var(--green-primary)' : 'transparent',
                color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                fontFamily: 'var(--font-heading)',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label} (<span className="notranslate">{tab.count}</span>)
            </button>
          ))}
        </motion.div>

        {/* Offers List */}
        <StaggerGrid style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ background: '#fff', borderRadius: 20, padding: '48px 24px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <div className="empty-state-icon" style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 8px' }}>
                No offers or quotes found
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
                {filterType === 'sent'
                  ? 'You have not submitted quotes to buyer demands yet. Browse Buyer Demands to quote.'
                  : filterType === 'received'
                  ? 'No incoming offers from buyers on your produce listings right now.'
                  : 'No negotiations match the selected filter.'}
              </p>
              {filterType === 'sent' && (
                <button type="button" className="btn btn-primary" onClick={() => navigate('/farmer/buyers')}>
                  🔍 Browse Buyer Demands
                </button>
              )}
            </div>
          ) : filtered.map((offer, i) => {
            const isSent = isSentQuote(offer);
            const isCountered = offer.status === 'countered';
            const isAccepted = offer.status === 'accepted';
            const activePrice = isCountered && offer.counterPrice ? offer.counterPrice : offer.offeredPrice;
            const diffFromAsk = offer.expectedPrice ? activePrice - offer.expectedPrice : 0;

            return (
              <FadeUpItem key={offer.id} delay={i * 0.06}>
                <div
                  className={`offer-card ${offer.status === 'new' ? 'new' : ''}`}
                  onClick={() => setSelectedOfferForDetail(offer)}
                  style={{
                    cursor: 'pointer',
                    border: isCountered ? '1.5px solid #93C5FD' : isAccepted ? '1.5px solid #86EFAC' : '1px solid var(--border)',
                    boxShadow: isCountered ? '0 4px 14px rgba(37, 99, 235, 0.08)' : undefined
                  }}
                  title="Click to view full buyer information and requirement details"
                >
                  {/* Top Origin Tag Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {isSent ? (
                        <span className="badge badge-blue" style={{ fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <ArrowUpRight size={13} /> 📤 QUOTE SENT BY YOU
                        </span>
                      ) : (
                        <span className="badge badge-green" style={{ fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <ArrowDownLeft size={13} /> 📥 OFFER RECEIVED FROM BUYER
                        </span>
                      )}

                      {offer.cropName && (
                        <span className="badge notranslate" style={{ fontSize: '0.75rem', background: '#F3F4F6', color: '#374151' }}>
                          {offer.emoji || '🌿'} {offer.cropName}
                        </span>
                      )}
                    </div>

                    <div>
                      {isCountered ? (
                        <span className="badge badge-blue" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                          🔄 COUNTER OFFER ACTIVE
                        </span>
                      ) : isAccepted ? (
                        <span className="badge badge-green" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                          ✓ DEAL CONFIRMED
                        </span>
                      ) : (
                        <span className="badge badge-amber" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                          ⏳ PENDING REVIEW
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Main Details Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                          {offer.enterpriseName}
                        </span>
                        <ShieldCheck size={16} color="var(--green-primary)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          • {offer.buyerType || 'Export House'}
                        </span>
                      </div>

                      {offer.requirementTitle && (
                        <p style={{ fontSize: '0.825rem', margin: '0 0 4px', fontWeight: 600, color: '#1E40AF' }}>
                          📋 Demand: {offer.requirementTitle}
                        </p>
                      )}

                      <p style={{ fontSize: '0.8125rem', margin: '0 0 4px', color: 'var(--text-secondary)' }}>
                        📦 <span className="notranslate">{offer.qty} {offer.unit}</span> • 🚚 {offer.deliveryTerms}
                      </p>
                      <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-secondary)' }}>
                        💳 {offer.paymentTerms}
                      </p>
                    </div>

                    {/* Right Pricing Column */}
                    <div style={{ textAlign: 'right' }}>
                      {isCountered && offer.counterPrice ? (
                        <>
                          <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.6rem', color: '#2563EB' }}>
                            ₹{offer.counterPrice}<span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>/kg</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            Original: <span className="notranslate" style={{ textDecoration: 'line-through' }}>₹{offer.offeredPrice}/kg</span>
                            {offer.expectedPrice ? ` • Ask: ₹${offer.expectedPrice}/kg` : ''}
                          </div>
                          <div style={{ marginTop: 4 }}>
                            <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
                              🔄 Active Counter: ₹{offer.counterPrice}/kg
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.5rem', color: isAccepted ? 'var(--green-primary)' : 'var(--text-primary)' }}>
                            ₹{offer.offeredPrice}<span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>/kg</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {isSent
                              ? `Buyer target: ₹${offer.requirementTargetPrice || offer.expectedPrice}/kg`
                              : `Your ask: ₹${offer.expectedPrice}/kg`}
                          </div>
                          <div style={{ marginTop: 4 }}>
                            {diffFromAsk >= 0 ? (
                              <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                                ✓ At or above ask
                              </span>
                            ) : (
                              <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
                                ₹{Math.abs(diffFromAsk)} below ask
                              </span>
                            )}
                          </div>
                        </>
                      )}
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
                  {isCountered && offer.counterPrice && (
                    <div style={{
                      background: offer.counteredBy === 'enterprise' ? '#FEF3C7' : '#EFF6FF',
                      border: `1px solid ${offer.counteredBy === 'enterprise' ? '#FCD34D' : '#BFDBFE'}`,
                      borderRadius: 10,
                      padding: '12px 14px',
                      marginBottom: 14
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                        <p style={{
                          fontSize: '0.85rem',
                          margin: 0,
                          fontWeight: 700,
                          color: offer.counteredBy === 'enterprise' ? '#92400E' : '#1E40AF'
                        }}>
                          {offer.counteredBy === 'enterprise'
                            ? `⚡ Enterprise countered with ₹${offer.counterPrice}/kg (Original was ₹${offer.offeredPrice}/kg) — Action Required!`
                            : `📤 You countered with ₹${offer.counterPrice}/kg (Original was ₹${offer.offeredPrice}/kg) — Awaiting enterprise response.`}
                        </p>
                        <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
                          Current: ₹{offer.counterPrice}/kg
                        </span>
                      </div>
                      {offer.counterNote && (
                        <p style={{ fontSize: '0.78rem', margin: '4px 0 0', color: offer.counteredBy === 'enterprise' ? '#B45309' : '#3B82F6', fontStyle: 'italic' }}>
                          Note: "{offer.counterNote}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Sent Quote Pending Banner */}
                  {isSent && offer.status === 'new' && (
                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                      <p style={{ fontSize: '0.8125rem', margin: 0, fontWeight: 600, color: '#166534' }}>
                        📤 You submitted this quote of <span className="notranslate">₹{offer.offeredPrice}/kg</span> on the buyer requirement • Awaiting enterprise review.
                      </p>
                    </div>
                  )}

                  {/* Accepted status banner */}
                  {isAccepted && (
                    <div style={{ background: 'var(--green-light)', border: '1px solid #86EFAC', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                      <p style={{ fontSize: '0.8125rem', margin: 0, fontWeight: 700, color: 'var(--green-primary)' }}>
                        ✅ Offer accepted at <span className="notranslate">₹{activePrice}/kg</span>! Deal agreement and contract created.
                      </p>
                    </div>
                  )}

                  {/* Action buttons row */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flex: 1, minWidth: 100 }}>
                      🕐 {offer.sentAt}
                    </span>

                    {/* Case 1: Received Offer in 'new' status -> Farmer can Accept, Counter, Decline */}
                    {!isSent && offer.status === 'new' && (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccept(offer.id);
                          }}
                        >
                          <Check size={14} /> Accept ₹{offer.offeredPrice}/kg
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

                    {/* Case 2: Countered by ENTERPRISE -> Farmer can Accept counter, Counter back, or Decline */}
                    {isCountered && offer.counteredBy === 'enterprise' && (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccept(offer.id);
                          }}
                        >
                          <Check size={14} /> Accept Counter ₹{offer.counterPrice}/kg
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCounterModal(offer);
                          }}
                        >
                          <RefreshCw size={14} /> Counter Back
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

                    {/* Case 3: Countered by FARMER -> Farmer can modify/re-counter */}
                    {isCountered && offer.counteredBy === 'farmer' && (
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

                    {/* Case 4: Farmer sent quote in 'new' status -> Farmer can Withdraw */}
                    {isSent && offer.status === 'new' && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#DC2626' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWithdraw(offer.id);
                        }}
                      >
                        <X size={14} /> Withdraw Quote
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
                </div>
              </FadeUpItem>
            );
          })}
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
          const isSent = isSentQuote(offer);
          const isCountered = offer.status === 'countered';
          const isAccepted = offer.status === 'accepted';
          const finalActivePrice = isCountered && offer.counterPrice ? offer.counterPrice : offer.offeredPrice;
          const multiplier = offer.unit === 'ton' ? 1000 : offer.unit === 'quintal' ? 100 : 1;
          const totalVal = ((Number(offer.qty) || 1) * multiplier * Number(finalActivePrice)).toLocaleString('en-IN');

          return (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOfferForDetail(null)}
              style={{ zIndex: 1200 }}
            >
              <motion.div
                className="modal"
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                onClick={e => e.stopPropagation()}
                style={{
                  maxWidth: 680,
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  borderRadius: 20,
                  padding: '28px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
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
                        {isSent ? (
                          <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                            📤 Outgoing Quote
                          </span>
                        ) : (
                          <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                            📥 Incoming Offer
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {enterprise.type || 'Export House'} • 📍 {enterprise.city || 'Gujarat'} • ⭐ {enterprise.rating || 4.7} ({enterprise.reviews || 10} reviews)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOfferForDetail(null)}
                    style={{
                      background: '#F3F4F6',
                      border: 'none',
                      borderRadius: '50%',
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      transition: 'all 0.2s'
                    }}
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Counter Offer Callout in Modal if Countered */}
                {isCountered && offer.counterPrice && (
                  <div style={{
                    background: offer.counteredBy === 'enterprise' ? '#FEF3C7' : '#EFF6FF',
                    border: `1.5px solid ${offer.counteredBy === 'enterprise' ? '#F59E0B' : '#3B82F6'}`,
                    borderRadius: 14,
                    padding: '16px 18px',
                    marginBottom: 20
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span className="badge badge-blue" style={{ fontWeight: 800 }}>
                        🔄 ACTIVE COUNTER OFFER
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: offer.counteredBy === 'enterprise' ? '#92400E' : '#1D4ED8' }}>
                        Proposed By: {offer.counteredBy === 'farmer' ? 'You (Farmer)' : 'Enterprise Buyer'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '8px 0' }}>
                      <span className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.8rem', color: offer.counteredBy === 'enterprise' ? '#B45309' : '#1D4ED8' }}>
                        ₹{offer.counterPrice}/kg
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        (Countered from original: <span className="notranslate" style={{ textDecoration: 'line-through' }}>₹{offer.offeredPrice}/kg</span>)
                      </span>
                    </div>
                    {offer.counterNote && (
                      <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: offer.counteredBy === 'enterprise' ? '#92400E' : '#1E40AF', fontStyle: 'italic' }}>
                        "{offer.counterNote}"
                      </p>
                    )}
                  </div>
                )}

                {/* Linked Buyer Requirement Banner */}
                {req && (
                  <div style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, border: '1px solid #86EFAC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                      <span className="badge badge-green" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                        📋 BUYER DEMAND / REQUIREMENT
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
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {isCountered ? 'Counter Price' : isSent ? 'Your Quote Price' : 'Offered Price'}
                    </span>
                    <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: isCountered ? '#2563EB' : 'var(--green-primary)', marginTop: 2 }}>
                      ₹{finalActivePrice}/kg
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 14px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {isSent ? 'Buyer Target Price' : 'Your Ask Price'}
                    </span>
                    <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', marginTop: 2 }}>
                      ₹{offer.expectedPrice || offer.requirementTargetPrice}/kg
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

                  {!isAccepted && (
                    isCountered ? (
                      offer.counteredBy === 'enterprise' ? (
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
                            <RefreshCw size={15} /> Counter Back
                          </button>

                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            onClick={() => handleAccept(offer.id)}
                          >
                            <Check size={16} /> Accept Counter ₹{offer.counterPrice}/kg
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          onClick={() => {
                            setSelectedOfferForDetail(null);
                            openCounterModal(offer);
                          }}
                        >
                          <RefreshCw size={15} /> Modify Counter
                        </button>
                      )
                    ) : isSent ? (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ color: '#DC2626' }}
                        onClick={() => handleWithdraw(offer.id)}
                      >
                        <X size={15} /> Withdraw Quote
                      </button>
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
                          <Check size={16} /> Accept Offer ₹{offer.offeredPrice}/kg
                        </button>
                      </>
                    )
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
                Propose your price for <strong>{counterSheet.enterpriseName}</strong> (Current: <span className="notranslate">₹{counterSheet.counterPrice || counterSheet.offeredPrice}/kg</span>)
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
                <label className="form-label">Note for Buyer (optional)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={counterNote}
                  onChange={e => setCounterNote(e.target.value)}
                  placeholder="e.g. Premium export quality lot with full moisture testing certificates."
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
