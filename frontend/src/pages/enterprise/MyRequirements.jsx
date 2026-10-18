import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  PlusCircle, Trash2, CheckCircle2, ChevronDown, ChevronUp,
  ShieldCheck, X, Edit, Save, AlertCircle,
  FileText, MessageCircle, Sparkles, Check, RefreshCw
} from 'lucide-react';
import { FadeUpItem, StaggerGrid } from '../../components/common/AnimatedComponents';
import cropAttributes from '../../data/crop_attributes.json';
import { getCropImage } from '../../utils/cropImages';

const DESTINATIONS = [
  'UAE (Dubai)',
  'UK (London)',
  'Vietnam',
  'USA',
  'South Korea',
  'Saudi Arabia',
  'Germany',
  'Japan',
  'Domestic (India)',
];

const DELIVERY_MODES = [
  'Ex-Farm Pickup',
  'Mandi / Yard Delivery',
  'Port CFS / FOB Delivery',
];

const PAYMENT_OPTIONS = [
  'Payment within 48h of quality approval',
  '30% Advance, 70% on weight slip',
  '100% on crate / truck loading',
  'Direct APMC Electronic Transfer (RTGS)',
  'Letter of Credit (LC at sight)',
];

export default function MyRequirements() {
  const { addToast, user,
    buyerRequirements, deleteBuyerRequirement, updateBuyerRequirement, acceptQuoteOnRequirement, counterQuoteOnRequirement
  } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'closed'
  const [expandedQuotes, setExpandedQuotes] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  // Quote detail modal state
  const [selectedQuoteModal, setSelectedQuoteModal] = useState(null);
  const [compareModal, setCompareModal] = useState(null);
  const [counterQuoteModal, setCounterQuoteModal] = useState(null);
  const [enterpriseCounterPrice, setEnterpriseCounterPrice] = useState(315);
  const [enterpriseCounterNote, setEnterpriseCounterNote] = useState('');

  // Edit State
  const [editReq, setEditReq] = useState(null);
  const [editFormData, setEditFormData] = useState({
    targetPrice: '',
    qty: '',
    unit: 'ton',
    destination: 'UAE (Dubai)',
    deliveryTerms: 'Ex-Farm Pickup',
    paymentTerms: 'Payment within 48h of quality approval',
    urgency: 'active',
    status: 'active',
    deadline: '2026-10-31',
    grade: 'Grade A',
    packaging: 'Standard Bags',
    notes: '',
  });

  // Filter requirements for this enterprise
  const myDemands = (buyerRequirements || []).filter(r => {
    const rEnt = String(r.enterpriseId || r.enterpriseDbId || '').replace(/^e/, '');
    const uEnt = String(user?.dbId || user?.id || '').replace(/^e/, '');
    if (rEnt && uEnt && rEnt === uEnt) return true;
    if (r.enterpriseId && user?.id && r.enterpriseId === user.id) return true;
    if (!user && (r.enterpriseId === 'e1' || r.enterpriseId === 'e35')) return true;
    return false;
  });

  const filtered = myDemands.filter(r => {
    if (activeTab === 'active') return r.status !== 'closed';
    if (activeTab === 'closed') return r.status === 'closed';
    return true;
  });

  const handleDelete = (id) => {
    deleteBuyerRequirement(id);
    setDeleteModal(null);
    addToast('Requirement deleted', 'info');
  };

  const toggleStatus = (req) => {
    const nextStatus = req.status === 'closed' ? 'active' : 'closed';
    updateBuyerRequirement(req.id, { status: nextStatus });
    addToast(
      nextStatus === 'closed' ? 'Requirement closed' : 'Requirement re-activated!',
      'success'
    );
  };

  const handleOpenEdit = (req) => {
    setEditReq(req);
    const attr = cropAttributes[req.crop] || {};
    setEditFormData({
      targetPrice: req.targetPrice !== undefined ? req.targetPrice : '',
      qty: req.qty !== undefined ? req.qty : '',
      unit: req.unit || 'ton',
      destination: req.destination || 'UAE (Dubai)',
      deliveryTerms: req.deliveryTerms || 'Ex-Farm Pickup',
      paymentTerms: req.paymentTerms || 'Payment within 48h of quality approval',
      urgency: req.urgency || 'active',
      status: req.status || 'active',
      deadline: req.deadline || '2026-10-31',
      grade: req.specs?.grade || attr.grades?.[0]?.label || 'Grade A',
      packaging: req.specs?.packaging || attr.packaging?.[0] || 'Standard Bags',
      notes: req.notes || '',
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editReq) return;

    const updated = {
      targetPrice: Number(editFormData.targetPrice) || 0,
      priceRange: `Target: ₹${editFormData.targetPrice}/kg`,
      qty: Number(editFormData.qty) || 0,
      unit: editFormData.unit,
      destination: editFormData.destination,
      deliveryTerms: editFormData.deliveryTerms,
      paymentTerms: editFormData.paymentTerms,
      urgency: editFormData.urgency,
      urgencyLabel: editFormData.urgency === 'urgent' ? 'Urgent Requirement' : 'Active Requirement',
      status: editFormData.status,
      deadline: editFormData.deadline,
      notes: editFormData.notes,
      specs: {
        ...(editReq.specs || {}),
        grade: editFormData.grade,
        packaging: editFormData.packaging,
      },
    };

    updateBuyerRequirement(editReq.id, updated);
    addToast('Requirement updated successfully! 🎉', 'success');
    setEditReq(null);
  };

  const handleAcceptQuote = (quote, req) => {
    if (acceptQuoteOnRequirement && req) {
      acceptQuoteOnRequirement(req.id, quote.id);
    }
    addToast(
      `Accepted quote from ${quote.farmerName} at ₹${quote.price}/kg! 🎉`,
      'success'
    );
    if (selectedQuoteModal && selectedQuoteModal.quote.id === quote.id) {
      setSelectedQuoteModal(prev => ({
        ...prev,
        quote: { ...prev.quote, status: 'accepted' },
      }));
    }
  };

  const handleSendEnterpriseCounter = () => {
    if (!counterQuoteModal) return;
    const { quote, req } = counterQuoteModal;
    counterQuoteOnRequirement(req.id, quote.id, enterpriseCounterPrice, enterpriseCounterNote);
    addToast(`Counter offer of ₹${enterpriseCounterPrice}/kg sent to ${quote.farmerName}! 🎉`, 'success');
    if (selectedQuoteModal && selectedQuoteModal.quote.id === quote.id) {
      setSelectedQuoteModal(prev => ({
        ...prev,
        quote: { ...prev.quote, status: 'countered', counterPrice: enterpriseCounterPrice, counterNote: enterpriseCounterNote }
      }));
    }
    setCounterQuoteModal(null);
  };

  // Get active crop attributes for the requirement being edited
  const editCropAttr = editReq ? (cropAttributes[editReq.crop] || {}) : {};

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: 'var(--green-primary)', padding: '32px 0 48px' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)', margin: 0 }}>
              {'My Requirements'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: '4px 0 0' }}>
              {myDemands.length} {'total requirements posted'}
            </p>
          </div>
          <Link to="/enterprise/post-requirement" className="btn btn-amber">
            <PlusCircle size={18} /> {'Post Requirement'}
          </Link>
        </div>
      </div>

      <div className="container" style={{ marginTop: -20, paddingBottom: 40 }}>
        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', borderRadius: 20, padding: '8px', boxShadow: 'var(--shadow-md)', marginBottom: 24, display: 'flex', gap: 6 }}>
          {[
            { id: 'active', label: 'Active Requirements', count: myDemands.filter(r => r.status !== 'closed').length },
            { id: 'closed', label: 'Closed', count: myDemands.filter(r => r.status === 'closed').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab.id ? 'var(--green-primary)' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                fontFamily: 'var(--font-heading)',
                transition: 'all 0.2s',
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </motion.div>

        {/* Requirements List */}
        <StaggerGrid style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>{'No requirements here'}</h3>
              <Link to="/enterprise/post-requirement" className="btn btn-primary" style={{ marginTop: 16 }}>
                + {'Post Requirement'}
              </Link>
            </div>
          ) : filtered.map((req, i) => {
            const quotesList = req.quotes || [];
            const isExpanded = expandedQuotes === req.id;
            const isClosed = req.status === 'closed';

            return (
              <FadeUpItem key={req.id} delay={i * 0.05}>
                <motion.div className="card card-body" whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    {/* Thumbnail */}
                    {(() => {
                      const cropImg = getCropImage(req.crop || req.cropName, req.imageUrl || req.image);
                      return (
                        <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', flexShrink: 0, overflow: 'hidden' }}>
                          {cropImg ? (
                            <img
                              src={cropImg}
                              alt={req.cropName}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.parentElement?.querySelector('.req-fallback-emoji');
                                if (fallback) fallback.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <span className="req-fallback-emoji" style={{ display: cropImg ? 'none' : 'block' }}>
                            {req.emoji || '🌿'}
                          </span>
                        </div>
                      );
                    })()}

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div>
                          <h5 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 4px', fontSize: '1.05rem' }}>
                            {req.cropName}
                          </h5>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span className={`badge badge-${isClosed ? 'gray' : 'green'}`}>
                              {isClosed ? 'Closed' : 'Active Live'}
                            </span>
                            {req.urgency === 'urgent' && (
                              <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>🔥 {'Urgent'}</span>
                            )}
                            {req.flag && (
                              <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                                {req.flag} {req.destination?.split(' ')[0]}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Target */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--green-primary)' }}>
                            ₹{req.targetPrice}/kg
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            {req.qty} {req.unit || 'ton'} {'needed'}
                          </div>
                        </div>
                      </div>

                      {/* Crop Specifications Badges */}
                      {req.specs && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0' }}>
                          {Object.entries(req.specs).filter(([, v]) => v).map(([k, v]) => (
                            <span key={k} className="badge" style={{ fontSize: '0.75rem', background: '#F1F5F9', color: '#334155', border: '1px solid #E2E8F0' }}>
                              {String(v)}
                            </span>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          📍 {req.deliveryTerms}
                        </span>

                        {quotesList.length > 0 && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => setExpandedQuotes(isExpanded ? null : req.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                background: isExpanded ? '#FDE68A' : 'var(--amber-light)',
                                border: '1px solid #FCD34D',
                                borderRadius: 8,
                                padding: '5px 12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                              title={'Click to show received farmer quotes'}
                            >
                              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#B45309' }}>
                                💬 {quotesList.length} {'quotes received'}
                              </span>
                              {isExpanded ? <ChevronUp size={14} color="#B45309" /> : <ChevronDown size={14} color="#B45309" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => setCompareModal({ req, quotes: quotesList })}
                              className="btn btn-secondary btn-sm"
                              style={{
                                fontSize: '0.75rem',
                                padding: '5px 10px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                background: '#FFFBEB',
                                borderColor: '#FDE68A',
                                color: '#92400E',
                                fontWeight: 700,
                              }}
                              title={'View and compare quotes side-by-side'}
                            >
                              <Sparkles size={12} color="#D97706" />
                              {'Compare Quotes'}
                            </button>
                          </div>
                        )}

                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          {req.posted}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer with EDIT Button */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => toggleStatus(req)}>
                      {isClosed ? 'Re-activate' : 'Close'}
                    </button>

                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                      onClick={() => handleOpenEdit(req)}
                    >
                      <Edit size={14} /> {'Edit'}
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                      onClick={() => setDeleteModal(req.id)}
                    >
                      <Trash2 size={14} /> {'Delete'}
                    </button>
                  </div>

                  {/* Expanded Quotes List with interactive clickable details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed var(--border)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <h6 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                              💬 {'Received Farmer Quotes:'} ({quotesList.length})
                            </h6>
                            <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                              ✓ {'Verified Indian Farmers'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {'Click any quote to inspect lot specs & farmer details'}
                            </span>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FFFBEB', borderColor: '#FDE68A', color: '#92400E', fontWeight: 600 }}
                              onClick={() => setCompareModal({ req, quotes: quotesList })}
                            >
                              <Sparkles size={13} color="#D97706" />
                              {'Compare Side-by-Side'}
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {quotesList.map((q, idx) => {
                            const farmer = q.farmer || {
                              name: q.farmerName || 'Farmer',
                              village: q.village || '',
                              district: q.district || '',
                              rating: q.rating || 5.0,
                              reviews: q.reviews || 0,
                              verified: q.verified !== undefined ? q.verified : true,
                              avatar: q.avatar || '🧑‍🌾',
                              phone: q.phone || '',
                              land: q.land || '',
                              since: q.since || '2024',
                            };
                            const isAccepted = q.status === 'accepted';
                            const quoteDealTotal = ((Number(q.qty) || 1) * 1000 * Number(q.price)).toLocaleString('en-IN');
                            const targetDiff = (req.targetPrice || 0) - Number(q.price);
                            const lotSpecs = q.lotSpecs || {};

                            return (
                              <div
                                key={q.id || idx}
                                onClick={() => setSelectedQuoteModal({ quote: q, req, farmer })}
                                style={{
                                  background: isAccepted ? '#F0FDF4' : '#FFFFFF',
                                  border: `1.5px solid ${isAccepted ? '#86EFAC' : 'var(--border)'}`,
                                  borderRadius: 14,
                                  padding: '16px 20px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: 14,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                  boxShadow: 'var(--shadow-xs)',
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.borderColor = 'var(--green-primary)';
                                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(22, 101, 52, 0.12)';
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.borderColor = isAccepted ? '#86EFAC' : 'var(--border)';
                                  e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }}
                              >
                                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1, minWidth: 280 }}>
                                  <div style={{ fontSize: '2.2rem', width: 48, height: 48, borderRadius: '50%', background: '#F1F8E9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-xs)', flexShrink: 0, overflow: 'hidden' }}>
                                    {typeof farmer.avatar === 'string' && (farmer.avatar.startsWith('data:') || farmer.avatar.startsWith('http') || farmer.avatar.startsWith('/')) ? (
                                      <img src={farmer.avatar} alt={q.farmerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                      farmer.avatar || '🧑‍🌾'
                                    )}
                                  </div>

                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                      <span style={{ fontWeight: 700, fontSize: '0.975rem', color: 'var(--text-primary)' }}>
                                        {q.farmerName}
                                      </span>
                                      {farmer.verified && (
                                        <span title="Verified APMC Farmer" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                          <ShieldCheck size={15} color="var(--green-primary)" />
                                        </span>
                                      )}
                                      {isAccepted && (
                                        <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                                          ✓ {'Accepted Deal'}
                                        </span>
                                      )}
                                      {targetDiff > 0 ? (
                                        <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                                          💚 ₹{targetDiff}/kg {'below target'}
                                        </span>
                                      ) : targetDiff === 0 ? (
                                        <span className="badge badge-blue" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                                          🎯 {'Exact Target Price'}
                                        </span>
                                      ) : (
                                        <span className="badge badge-amber" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                                          ⚠️ ₹{Math.abs(targetDiff)}/kg {'above target'}
                                        </span>
                                      )}
                                    </div>

                                    <p style={{ margin: '3px 0 6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                      📍 {q.village || farmer.village}, {q.district || farmer.district} • ⭐ {farmer.rating} ({farmer.reviews} reviews) • 🚜 {farmer.land || '10 bigha'}
                                    </p>

                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
                                      <span className="badge badge-gray" style={{ fontSize: '0.72rem' }}>
                                        📦 {q.qty} {req.unit || 'ton'}
                                      </span>
                                      <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                                        {q.delivery === 'pickup' ? '🚜 Ex-Farm Pickup' : '🚚 Mandi Delivery'}
                                      </span>
                                      {q.date && (
                                        <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                                          📅 {q.date}
                                        </span>
                                      )}
                                      {lotSpecs.purity && (
                                        <span className="badge" style={{ fontSize: '0.7rem', background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}>
                                          ✨ {lotSpecs.purity}
                                        </span>
                                      )}
                                      {lotSpecs.moisture && (
                                        <span className="badge" style={{ fontSize: '0.7rem', background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }}>
                                          💧 {lotSpecs.moisture}
                                        </span>
                                      )}
                                      {lotSpecs.labCertificate && (
                                        <span className="badge" style={{ fontSize: '0.7rem', background: '#FAF5FF', color: '#6B21A8', border: '1px solid #E9D5FF' }}>
                                          🔬 Lab Tested
                                        </span>
                                      )}
                                    </div>

                                    {q.notes && (
                                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic', background: 'rgba(0,0,0,0.02)', padding: '5px 10px', borderRadius: 8, borderLeft: '3px solid var(--green-primary)' }}>
                                        "{q.notes}"
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                                  <div>
                                    {q.status === 'countered' && q.counterPrice ? (
                                      <div>
                                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.35rem', color: '#2563EB' }}>
                                          ₹{q.counterPrice}/kg
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                          Original: <span style={{ textDecoration: 'line-through' }}>₹{q.price}/kg</span>
                                        </div>
                                        <div style={{ marginTop: 2 }}>
                                          <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                                            🔄 Counter: ₹{q.counterPrice}/kg
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.35rem', color: 'var(--green-primary)' }}>
                                          ₹{q.price}/kg
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                          Total: ₹{quoteDealTotal}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <button
                                      type="button"
                                      className="btn btn-secondary btn-sm"
                                      style={{
                                        fontSize: '0.75rem',
                                        padding: '6px 12px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 5,
                                        background: 'var(--green-light)',
                                        color: 'var(--green-primary)',
                                        fontWeight: 700,
                                        border: '1px solid rgba(46, 125, 50, 0.2)',
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedQuoteModal({ quote: q, req, farmer });
                                      }}
                                    >
                                      <FileText size={13} />
                                      {'Details'}
                                    </button>

                                    {isAccepted ? (
                                      <span className="badge badge-green" style={{ padding: '6px 12px' }}>
                                        ✓ Deal Agreed
                                      </span>
                                    ) : (
                                      <>
                                        <button
                                          type="button"
                                          className="btn btn-secondary btn-sm"
                                          style={{ fontSize: '0.75rem', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEnterpriseCounterPrice(q.counterPrice || q.price);
                                            setEnterpriseCounterNote(q.counterNote || '');
                                            setCounterQuoteModal({ quote: q, req, farmer });
                                          }}
                                        >
                                          <RefreshCw size={12} /> Counter
                                        </button>

                                        <button
                                          type="button"
                                          className="btn btn-primary btn-sm"
                                          style={{ fontSize: '0.75rem', padding: '6px 14px' }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAcceptQuote(q, req);
                                          }}
                                        >
                                          ✓ {'Accept'}
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </FadeUpItem>
            );
          })}
        </StaggerGrid>
      </div>

      {/* =================================================================== */}
      {/* FARMER QUOTE DETAIL & LOT INFORMATION MODAL                         */}
      {/* =================================================================== */}
      <AnimatePresence>
        {selectedQuoteModal && (() => {
          const { quote, req, farmer } = selectedQuoteModal;
          const lotSpecs = quote.lotSpecs || {};
          const isAccepted = quote.status === 'accepted';
          const targetDiff = (req.targetPrice || 0) - Number(quote.price);
          const totalDealValue = ((Number(quote.qty) || 1) * 1000 * Number(quote.price)).toLocaleString('en-IN');
          const totalSavings = targetDiff > 0 ? (targetDiff * 1000 * Number(quote.qty)).toLocaleString('en-IN') : 0;

          return (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedQuoteModal(null)}
            >
              <motion.div
                className="modal"
                style={{ maxWidth: 660, maxHeight: '92vh', overflowY: 'auto', padding: '28px' }}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: 14,
                        background: 'linear-gradient(135deg, var(--green-light), #C8E6C9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.4rem',
                        flexShrink: 0,
                      }}
                    >
                      {req.emoji || '🌾'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>
                          {'Farmer Quote & Lot Details'}
                        </h3>
                        {isAccepted && (
                          <span className="badge badge-green" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                            ✓ {'Deal Accepted'}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {req.cropName} • {'Requirement ID:'} {req.id} • {req.destination || 'Export Ready'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedQuoteModal(null)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Farmer Profile Card */}
                <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '16px 18px', marginBottom: 20, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ fontSize: '2.8rem', width: 56, height: 56, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-xs)', flexShrink: 0, overflow: 'hidden' }}>
                      {typeof farmer.avatar === 'string' && (farmer.avatar.startsWith('data:') || farmer.avatar.startsWith('http') || farmer.avatar.startsWith('/')) ? (
                        <img src={farmer.avatar} alt={quote.farmerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        farmer.avatar || '🧑‍🌾'
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                          {quote.farmerName}
                        </span>
                        {farmer.verified && (
                          <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <ShieldCheck size={13} /> {'Verified APMC Farmer'}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '3px 0 0', fontSize: '0.835rem', color: 'var(--text-muted)' }}>
                        📍 {[quote.village || farmer.village, quote.district || farmer.district, quote.state || farmer.state].filter(Boolean).join(', ') || 'India'} • ⭐ {farmer.rating} ({farmer.reviews} verified reviews)
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        🚜 Land: {farmer.land || '12 bigha'} • Member since {farmer.since || '2023'} • 💬 {'Direct Chat Available'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      onClick={() => {
                        setSelectedQuoteModal(null);
                        navigate('/farmer/chat');
                      }}
                    >
                      <MessageCircle size={15} /> {'Chat with Farmer'}
                    </button>
                  </div>
                </div>

                {/* Price & Commercial Comparison Box */}
                <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 16, padding: '18px 20px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#92400E', fontWeight: 600 }}>
                        {'Your Target Buying Price:'}
                      </span>
                      <div style={{ fontWeight: 800, fontSize: '1.35rem', color: '#78350F' }}>
                        ₹{req.targetPrice}/kg
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.78rem', color: '#92400E', fontWeight: 600 }}>
                        {'Farmer Quoted Price:'}
                      </span>
                      <div style={{ fontWeight: 900, fontSize: '1.55rem', color: 'var(--green-primary)' }}>
                        ₹{quote.price}/kg
                      </div>
                    </div>
                  </div>

                  {/* Price Advantage Pill */}
                  {targetDiff > 0 ? (
                    <div style={{ background: '#E8F5E9', color: 'var(--green-primary)', padding: '8px 14px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <Check size={18} />
                      <span>{`Below your target rate by ₹${targetDiff}/kg! Total cost savings of ₹${totalSavings} on this ${quote.qty} Ton lot.`}</span>
                    </div>
                  ) : targetDiff === 0 ? (
                    <div style={{ background: '#E0F2FE', color: '#0369A1', padding: '8px 14px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <Check size={18} />
                      <span>{'Matches your exact target buying price! Ready for transaction.'}</span>
                    </div>
                  ) : (
                    <div style={{ background: '#FEF3C7', color: '#B45309', padding: '8px 14px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <AlertCircle size={18} />
                      <span>{`Quoted rate is ₹${Math.abs(targetDiff)}/kg above target price. You can accept or negotiate.`}</span>
                    </div>
                  )}

                  {/* Deal Financials Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, borderTop: '1px dashed #FDE68A', paddingTop: 14, fontSize: '0.875rem', color: '#78350F' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block' }}>{'Quoted Supply Quantity:'}</span>
                      <strong style={{ fontSize: '1rem' }}>{quote.qty} {req.unit || 'Tons'} ({quote.qty * 1000} kg)</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block' }}>{'Total Lot Deal Value:'}</span>
                      <strong style={{ fontWeight: 900, color: 'var(--green-primary)', fontSize: '1.2rem' }}>
                        ₹{totalDealValue}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block' }}>{'Delivery Mode Offered:'}</span>
                      <strong>
                        {quote.deliveryLabel || (quote.delivery === 'pickup' ? '🚜 Ex-Farm Pickup' : '🚚 Mandi Delivery')}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block' }}>{'Payment Terms:'}</span>
                      <strong>
                        {quote.payment || req.paymentTerms}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Farmer's Lot Notes */}
                {quote.notes && (
                  <div style={{ marginBottom: 20 }}>
                    <h5 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 8px', fontSize: '0.925rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={16} color="var(--green-primary)" />
                      {'Farmer’s Statement on This Lot:'}
                    </h5>
                    <div style={{ background: 'var(--green-light)', borderRadius: 12, padding: '14px 18px', fontSize: '0.925rem', lineHeight: 1.6, borderLeft: '4px solid var(--green-primary)', color: '#1B5E20', fontStyle: 'italic' }}>
                      "{quote.notes}"
                    </div>
                  </div>
                )}

                {/* Quality & Specifications Guaranteed by Farmer */}
                <div style={{ marginBottom: 22 }}>
                  <h5 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 10px', fontSize: '0.925rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={16} color="var(--green-primary)" />
                    {'Guaranteed Quality Standards & Lot Certification:'}
                  </h5>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>{'Grade Offered'}</span>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {lotSpecs.grade || req.specs?.grade || 'Grade A Export'}
                      </strong>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>{'Purity Guarantee'}</span>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--green-primary)' }}>
                        {lotSpecs.purity || req.specs?.purity || '99.5% Machine Cleaned'}
                      </strong>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>{'Moisture Content'}</span>
                      <strong style={{ fontSize: '0.875rem', color: '#1E40AF' }}>
                        {lotSpecs.moisture || req.specs?.moisture || 'Below 8%'}
                      </strong>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>{'Packaging Standard'}</span>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {lotSpecs.packaging || req.specs?.packaging || 'Standard Jute / PP Bags'}
                      </strong>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>{'Warehouse / Lot Location'}</span>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {lotSpecs.warehouseLocation || `${farmer.village} APMC Yard`}
                      </strong>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>{'Dispatch Readiness'}</span>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {lotSpecs.dispatchReadiness || quote.date || 'Immediate (within 48h)'}
                      </strong>
                    </div>

                    {/* Special specifications if present */}
                    {lotSpecs.volatileOil && (
                      <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Volatile Oil</span>
                        <strong style={{ fontSize: '0.875rem' }}>{lotSpecs.volatileOil}</strong>
                      </div>
                    )}
                    {lotSpecs.brix && (
                      <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Brix (Sweetness)</span>
                        <strong style={{ fontSize: '0.875rem' }}>{lotSpecs.brix}</strong>
                      </div>
                    )}
                    {lotSpecs.aflatoxin && (
                      <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Aflatoxin Level</span>
                        <strong style={{ fontSize: '0.875rem' }}>{lotSpecs.aflatoxin}</strong>
                      </div>
                    )}
                    {lotSpecs.count && (
                      <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Kernel Count</span>
                        <strong style={{ fontSize: '0.875rem' }}>{lotSpecs.count}</strong>
                      </div>
                    )}
                  </div>

                  {/* Highlighted Lab Certificate Banner */}
                  <div style={{ marginTop: 12, background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: '1.6rem' }}>🔬</div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {'Lab Inspection & Quality Certificate'}
                      </span>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4C1D95' }}>
                        {lotSpecs.labCertificate || 'Agmarknet / NABL Accredited APMC Quality Certificate Verified'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Counter Offer Banner if Countered */}
                {quote.status === 'countered' && quote.counterPrice && (
                  <div style={{ background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.25rem' }}>🔄</span>
                        <div>
                          <strong style={{ color: '#1E40AF', fontSize: '0.95rem' }}>
                            Counter Offer Sent: ₹{quote.counterPrice}/kg
                          </strong>
                          <p style={{ margin: '2px 0 0', fontSize: '0.825rem', color: '#3B82F6' }}>
                            {quote.counterNote || 'Awaiting farmer response in Offers Inbox.'}
                          </p>
                        </div>
                      </div>
                      <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
                        Under Negotiation
                      </span>
                    </div>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    onClick={() => {
                      setSelectedQuoteModal(null);
                      navigate('/farmer/chat');
                    }}
                  >
                    <MessageCircle size={15} /> {'Chat with Farmer'}
                  </button>

                  {isAccepted ? (
                    <span className="badge badge-green" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                      ✓ {'Deal Accepted & Confirmed'}
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        onClick={() => {
                          setCounterQuoteModal({ quote, req, farmer });
                          setEnterpriseCounterPrice(req.targetPrice || quote.price);
                          setEnterpriseCounterNote('');
                        }}
                      >
                        <RefreshCw size={15} /> {'Send Counter Offer'}
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        onClick={() => handleAcceptQuote(quote, req)}
                      >
                        <CheckCircle2 size={16} />
                        {'Accept Quote & Confirm Deal'}
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedQuoteModal(null)}
                  >
                    {'Close'}
                  </button>
                </div>

              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* COMPARE ALL RECEIVED QUOTES MODAL                                   */}
      {/* =================================================================== */}
      <AnimatePresence>
        {compareModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCompareModal(null)}
          >
            <motion.div
              className="modal"
              style={{ maxWidth: 840, maxHeight: '92vh', overflowY: 'auto', padding: '28px' }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>
                    📊 {'Compare Received Quotes for'} {compareModal.req.cropName}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {'Target Price:'} <strong>₹{compareModal.req.targetPrice}/kg</strong> • {'Required Qty:'} <strong>{compareModal.req.qty} {compareModal.req.unit || 'ton'}</strong> • {compareModal.req.destination}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCompareModal(null)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Grid of quotes side-by-side */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                {compareModal.quotes.map((q, idx) => {
                  const farmer = q.farmer || {
                    name: q.farmerName || 'Farmer',
                    village: q.village || '',
                    district: q.district || '',
                    rating: q.rating || 5.0,
                    reviews: q.reviews || 0,
                    verified: true,
                    avatar: '🧑‍🌾',
                    phone: q.phone || '',
                  };
                  const isAccepted = q.status === 'accepted';
                  const lowestPrice = Math.min(...compareModal.quotes.map(item => Number(item.price)));
                  const isBestPrice = Number(q.price) === lowestPrice;
                  const targetDiff = (compareModal.req.targetPrice || 0) - Number(q.price);
                  const dealTotal = ((Number(q.qty) || 1) * 1000 * Number(q.price)).toLocaleString('en-IN');
                  const lotSpecs = q.lotSpecs || {};

                  return (
                    <div
                      key={q.id || idx}
                      style={{
                        background: isBestPrice ? '#F0FDF4' : '#FFFFFF',
                        border: `2px solid ${isBestPrice ? '#166534' : 'var(--border)'}`,
                        borderRadius: 16,
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      {isBestPrice && (
                        <div style={{ position: 'absolute', top: -12, right: 16, background: '#166534', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          ⭐ {'Best Price Offer'}
                        </div>
                      )}

                      <div>
                        {/* Farmer Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                          <div style={{ fontSize: '2.4rem', width: 48, height: 48, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-xs)', flexShrink: 0, overflow: 'hidden' }}>
                            {typeof farmer.avatar === 'string' && (farmer.avatar.startsWith('data:') || farmer.avatar.startsWith('http') || farmer.avatar.startsWith('/')) ? (
                              <img src={farmer.avatar} alt={q.farmerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              farmer.avatar || '🧑‍🌾'
                            )}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                                {q.farmerName}
                              </strong>
                              {farmer.verified && <ShieldCheck size={15} color="var(--green-primary)" />}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              📍 {q.village || farmer.village}, {q.district || farmer.district} • ⭐ {farmer.rating} ({farmer.reviews})
                            </span>
                          </div>
                        </div>

                        {/* Price Hero */}
                        <div style={{ background: isBestPrice ? '#DCFCE7' : '#F8FAFC', borderRadius: 12, padding: '12px 14px', marginBottom: 14, textAlign: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{'Quoted Rate'}</span>
                          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 900, color: 'var(--green-primary)' }}>
                            ₹{q.price}/kg
                          </div>
                          {targetDiff > 0 ? (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>
                              💚 ₹{targetDiff}/kg {'cheaper than your target'}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {targetDiff === 0 ? '🎯 Matches Target' : `₹${Math.abs(targetDiff)}/kg above target`}
                            </span>
                          )}
                        </div>

                        {/* Specs Table */}
                        <div style={{ fontSize: '0.825rem', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: 4 }}>
                            <span style={{ color: 'var(--text-muted)' }}>{'Lot Quantity:'}</span>
                            <strong>{q.qty} {compareModal.req.unit || 'ton'}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: 4 }}>
                            <span style={{ color: 'var(--text-muted)' }}>{'Total Deal Value:'}</span>
                            <strong style={{ color: 'var(--green-primary)' }}>₹{dealTotal}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: 4 }}>
                            <span style={{ color: 'var(--text-muted)' }}>{'Delivery Mode:'}</span>
                            <strong>{q.delivery === 'pickup' ? '🚜 Farm Pickup' : '🚚 Mandi Delivery'}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: 4 }}>
                            <span style={{ color: 'var(--text-muted)' }}>{'Purity Guarantee:'}</span>
                            <strong>{lotSpecs.purity || '99.5% Cleaned'}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: 4 }}>
                            <span style={{ color: 'var(--text-muted)' }}>{'Moisture:'}</span>
                            <strong>{lotSpecs.moisture || 'Below 8%'}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{'Lab Report:'}</span>
                            <strong style={{ color: '#6B21A8' }}>{lotSpecs.labCertificate ? '✓ NABL Certified' : 'Verified APMC'}</strong>
                          </div>
                        </div>

                        {q.notes && (
                          <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.02)', padding: '6px 10px', borderRadius: 8, marginBottom: 16 }}>
                            "{q.notes}"
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                          onClick={() => {
                            setCompareModal(null);
                            setSelectedQuoteModal({ quote: q, req: compareModal.req, farmer });
                          }}
                        >
                          <FileText size={13} /> {'Full Details'}
                        </button>

                        {isAccepted ? (
                          <span className="badge badge-green" style={{ flex: 1, padding: '6px', textAlign: 'center', fontSize: '0.78rem' }}>
                            ✓ Deal Agreed
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            style={{ flex: 1, fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                            onClick={() => {
                              handleAcceptQuote(q, compareModal.req);
                              setCompareModal(null);
                            }}
                          >
                            <CheckCircle2 size={13} /> {'Accept Deal'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ textAlign: 'right', marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCompareModal(null)}
                >
                  {'Close Comparison'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Requirement Modal */}
      <AnimatePresence>
        {editReq && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditReq(null)}
          >
            <motion.div
              className="modal"
              style={{ maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border)', pb: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '2rem' }}>{editReq.emoji || '🌾'}</span>
                  <div>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>
                      {'Edit Buying Requirement'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {editReq.cropName} • ID: {editReq.id}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditReq(null)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  
                  {/* Price & Quantity Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        {'Target Buying Price (₹/kg)'} *
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        required
                        value={editFormData.targetPrice}
                        onChange={e => setEditFormData(prev => ({ ...prev, targetPrice: e.target.value }))}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        {'Quantity'} *
                      </label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="number"
                          className="form-input"
                          style={{ flex: 1 }}
                          required
                          value={editFormData.qty}
                          onChange={e => setEditFormData(prev => ({ ...prev, qty: e.target.value }))}
                        />
                        <select
                          className="form-select"
                          style={{ width: 100 }}
                          value={editFormData.unit}
                          onChange={e => setEditFormData(prev => ({ ...prev, unit: e.target.value }))}
                        >
                          <option value="ton">ton</option>
                          <option value="quintal">quintal</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Required Grade */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      {'Required Quality Grade'}
                    </label>
                    {editCropAttr.grades && editCropAttr.grades.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {editCropAttr.grades.map(g => (
                          <button
                            key={g.value}
                            type="button"
                            onClick={() => setEditFormData(prev => ({ ...prev, grade: g.label }))}
                            className={`chip ${editFormData.grade === g.label ? 'active' : ''}`}
                            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        className="form-input"
                        value={editFormData.grade}
                        onChange={e => setEditFormData(prev => ({ ...prev, grade: e.target.value }))}
                      />
                    )}
                  </div>

                  {/* Destination & Delivery Terms */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        {'Export Destination'}
                      </label>
                      <select
                        className="form-select"
                        value={editFormData.destination}
                        onChange={e => setEditFormData(prev => ({ ...prev, destination: e.target.value }))}
                      >
                        {DESTINATIONS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        {'Delivery Mode'}
                      </label>
                      <select
                        className="form-select"
                        value={editFormData.deliveryTerms}
                        onChange={e => setEditFormData(prev => ({ ...prev, deliveryTerms: e.target.value }))}
                      >
                        {DELIVERY_MODES.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Packaging & Payment */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        {'Packaging Format'}
                      </label>
                      <input
                        className="form-input"
                        value={editFormData.packaging}
                        onChange={e => setEditFormData(prev => ({ ...prev, packaging: e.target.value }))}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        {'Required By Date'}
                      </label>
                      <input
                        type="date"
                        className="form-input"
                        value={editFormData.deadline}
                        onChange={e => setEditFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Payment Terms */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      {'Payment Terms'}
                    </label>
                    <select
                      className="form-select"
                      value={editFormData.paymentTerms}
                      onChange={e => setEditFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    >
                      {PAYMENT_OPTIONS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Urgency & Status */}
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center', padding: '10px 14px', background: 'var(--bg-page)', borderRadius: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={editFormData.urgency === 'urgent'}
                        onChange={e => setEditFormData(prev => ({ ...prev, urgency: e.target.checked ? 'urgent' : 'active' }))}
                        style={{ accentColor: 'var(--green-primary)', width: 16, height: 16 }}
                      />
                      🔥 {'Urgent Requirement'}
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, marginLeft: 'auto' }}>
                      <span>{'Status:'}</span>
                      <select
                        className="form-select"
                        style={{ padding: '4px 8px', fontSize: '0.85rem', width: 110 }}
                        value={editFormData.status}
                        onChange={e => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="active">{'Active'}</option>
                        <option value="closed">{'Closed'}</option>
                      </select>
                    </label>
                  </div>

                  {/* Notes for Farmers */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      {'Notes for Farmers'}
                    </label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={editFormData.notes}
                      onChange={e => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>

                </div>

                {/* Modal Footer Buttons */}
                <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-full"
                    onClick={() => setEditReq(null)}
                  >
                    {'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <Save size={16} />
                    {'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteModal(null)}>
            <motion.div className="modal" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} onClick={e => e.stopPropagation()}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FFEBEE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Trash2 size={24} color="#E53E3E" />
                </div>
                <h3>{'Delete Requirement?'}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {'This requirement will be removed and no longer show to farmers.'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary btn-full" onClick={() => setDeleteModal(null)}>{'Cancel'}</button>
                <button className="btn btn-danger btn-full" onClick={() => handleDelete(deleteModal)}>{'Delete'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enterprise Counter Quote Modal */}
      <AnimatePresence>
        {counterQuoteModal && (() => {
          const { quote, req } = counterQuoteModal;
          const diff = Number(enterpriseCounterPrice) - Number(quote.price);
          const counterTotal = ((Number(quote.qty) || 1) * 1000 * Number(enterpriseCounterPrice)).toLocaleString('en-IN');

          return (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCounterQuoteModal(null)}
              style={{ zIndex: 1250 }}
            >
              <motion.div
                className="modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: 540, width: '95%', padding: '28px', borderRadius: 20 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>
                      Send Counter Offer to Farmer
                    </h3>
                    <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Farmer: <strong>{quote.farmerName}</strong> • {req.cropName} ({quote.qty} Tons)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCounterQuoteModal(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Requirement & Quote Summary Box */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Farmer Quoted Price:</span>
                    <strong className="notranslate" style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>₹{quote.price}/kg</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Target Requirement Rate:</span>
                    <strong className="notranslate" style={{ fontSize: '1rem', color: 'var(--green-primary)' }}>₹{req.targetPrice}/kg</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Lot Volume:</span>
                    <span className="notranslate" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{quote.qty} Tons ({quote.qty * 1000} kg)</span>
                  </div>
                </div>

                {/* Counter Price Stepper */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                      Proposed Counter Price (₹/kg)
                    </label>
                    <span style={{ fontSize: '0.8rem', color: diff >= 0 ? 'var(--green-primary)' : 'var(--amber)', fontWeight: 600 }}>
                      {diff === 0 ? 'Matches farmer ask' : diff > 0 ? `+₹${diff}/kg above farmer ask` : `₹${Math.abs(diff)}/kg below farmer ask`}
                    </span>
                  </div>

                  <div className="stepper" style={{ maxWidth: 240, margin: '0 auto 10px' }}>
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() => setEnterpriseCounterPrice(p => Math.max(1, p - 1))}
                    >
                      −
                    </button>
                    <input
                      className="stepper-input notranslate"
                      type="number"
                      value={enterpriseCounterPrice}
                      onChange={e => setEnterpriseCounterPrice(Number(e.target.value))}
                    />
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() => setEnterpriseCounterPrice(p => p + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div style={{ textAlign: 'center', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    Total Proposed Deal Value: <strong className="notranslate" style={{ color: 'var(--green-primary)' }}>₹{counterTotal}</strong>
                  </div>
                </div>

                {/* Counter Note */}
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Note / Terms for Farmer (optional)
                  </label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={enterpriseCounterNote}
                    onChange={e => setEnterpriseCounterNote(e.target.value)}
                    placeholder="e.g. We can finalize at ₹312/kg if pickup can be scheduled for Friday morning with lab report."
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-full"
                    onClick={() => setCounterQuoteModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-full"
                    onClick={handleSendEnterpriseCounter}
                  >
                    Send Counter Offer to Farmer →
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
