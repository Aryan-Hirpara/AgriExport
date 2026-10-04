import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  Search, ShieldCheck, Star, MessageSquare, MapPin,
  Clock, Calendar, Send, X, FileText, Sparkles, TrendingUp,
  Truck, CheckCircle2, ChevronRight, Building2, SlidersHorizontal
} from 'lucide-react';
import { BUYER_REQUIREMENTS, ENTERPRISES, LISTINGS, CROPS } from '../../data/sampleData';
import { FadeUpItem, StaggerGrid } from '../../components/common/AnimatedComponents';
import { translateTerm } from '../../utils/translationUtils';

export default function FindBuyers() {
  const navigate = useNavigate();
  const { t, lang, addToast, buyerRequirements, submitQuoteToRequirement } = useApp();
  const [activeTab, setActiveTab] = useState('demands'); // 'demands' | 'directory'
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [search, setSearch] = useState('');
  const [urgentOnly, setUrgentOnly] = useState(false);

  const demandsSource = buyerRequirements && buyerRequirements.length > 0 ? buyerRequirements : BUYER_REQUIREMENTS;

  // Quote Modal state
  const [quoteModalReq, setQuoteModalReq] = useState(null);
  const [contactModalReq, setContactModalReq] = useState(null);
  const [quoteQty, setQuoteQty] = useState('');
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteDelivery, setQuoteDelivery] = useState('pickup');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuotes, setSubmittedQuotes] = useState({});

  // Filter demands
  const filteredDemands = demandsSource.filter(req => {
    const matchSearch = !search ||
      req.title.toLowerCase().includes(search.toLowerCase()) ||
      req.cropName.toLowerCase().includes(search.toLowerCase()) ||
      req.enterpriseName.toLowerCase().includes(search.toLowerCase()) ||
      (req.destination && req.destination.toLowerCase().includes(search.toLowerCase()));

    const matchCrop = selectedCrop === 'All' || req.crop === selectedCrop || req.cropName?.toLowerCase().includes(selectedCrop.toLowerCase());
    const matchUrgent = !urgentOnly || req.urgency === 'urgent';

    return matchSearch && matchCrop && matchUrgent;
  });

  // Filter enterprises directory
  const filteredEnterprises = ENTERPRISES.filter(e => {
    const matchSearch = !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const openQuoteModal = (req, e) => {
    e?.stopPropagation();
    e?.preventDefault();
    setQuoteModalReq(req);
    setQuotePrice(req.targetPrice);
    setQuoteQty(Math.min(5, req.qty));
    setQuoteNotes('');
  };

  const handleSendQuote = (e) => {
    e.preventDefault();
    if (!quoteQty || !quotePrice) {
      addToast(t('Please enter quantity and price', 'કૃપા કરીને જથ્થો અને ભાવ દાખલ કરો'), 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedQuotes(prev => ({ ...prev, [quoteModalReq.id]: { qty: quoteQty, price: quotePrice } }));
      if (submitQuoteToRequirement) {
        submitQuoteToRequirement(quoteModalReq.id, {
          qty: Number(quoteQty),
          price: Number(quotePrice),
          delivery: quoteDelivery,
          notes: quoteNotes,
        });
      }
      addToast(
        `Quote submitted to ${quoteModalReq.enterpriseName}! (₹${quotePrice}/kg for ${quoteQty} tons)`,
        'success'
      );
      setQuoteModalReq(null);
    }, 500);
  };

  const cropChips = [
    { id: 'All', name: 'All Crops', guj: 'તમામ પાક', emoji: '🌾' },
    ...CROPS.map(c => ({ id: c.id, name: c.name, guj: c.guj, emoji: c.emoji }))
  ];

  return (
    <div className="page-wrapper" style={{ paddingBottom: 80 }}>
      {/* Page Header Banner */}
      <div style={{ background: 'var(--green-primary)', padding: '36px 0 52px', color: '#fff' }}>
        <div className="container">
          <FadeUpItem>
            <div className="section-label" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
              {t('Buyer Demands & Orders', 'ખરીદદાર માંગણીઓ')}
            </div>
            <h2 style={{ color: '#fff', marginBottom: 6 }}>
              {t('Browse Buyer Demands & Orders', 'ખરીદદારોની માંગણીઓ અને જરૂરિયાતો')}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', margin: '0 0 20px', fontSize: '0.95rem' }}>
              {t('See what verified enterprises are demanding and send direct quotes for your produce.', 'નિકાસકારો અને વેપારીઓની માંગ જુઓ અને તમારા પાક માટે સીધા ભાવ મોકલો.')}
            </p>

            {/* Search Bar */}
            <div style={{ position: 'relative', maxWidth: 560 }}>
              <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 48, fontSize: '1rem', height: 50 }}
                placeholder={t('Search crop, enterprise, destination (e.g. Jeera, Dubai)...', 'પાક, કંપની કે નિકાસ દેશ શોધો...')}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </FadeUpItem>
        </div>
      </div>

      <div className="container" style={{ marginTop: -22 }}>
        {/* Navigation View Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: '#fff', borderRadius: 18, padding: 6, boxShadow: 'var(--shadow-md)', marginBottom: 20, display: 'flex', gap: 6, width: 'fit-content' }}
        >
          <button
            onClick={() => setActiveTab('demands')}
            style={{
              padding: '8px 18px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'demands' ? 'var(--green-primary)' : 'transparent',
              color: activeTab === 'demands' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>📋 {t('All Demands', 'બધી માંગણીઓ')}</span>
            <span style={{ background: activeTab === 'demands' ? 'rgba(255,255,255,0.25)' : 'var(--green-light)', color: activeTab === 'demands' ? '#fff' : 'var(--green-primary)', padding: '2px 8px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700 }}>
              {demandsSource.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            style={{
              padding: '8px 18px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'directory' ? 'var(--green-primary)' : 'transparent',
              color: activeTab === 'directory' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Building2 size={15} />
            <span>{t('Buyers Directory', 'ખરીદદારો')}</span>
            <span style={{ background: activeTab === 'directory' ? 'rgba(255,255,255,0.25)' : 'var(--border)', color: activeTab === 'directory' ? '#fff' : 'var(--text-secondary)', padding: '2px 8px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700 }}>
              {ENTERPRISES.length}
            </span>
          </button>
        </motion.div>

        {/* Filter Card (Identical simple layout to BrowseProduce.jsx) */}
        {activeTab !== 'directory' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: '#fff', borderRadius: 20, padding: '16px 20px', boxShadow: 'var(--shadow-sm)', marginBottom: 24 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <SlidersHorizontal size={16} color="var(--text-secondary)" />
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t('Filter by Crop', 'પાક ફિલ્ટર')}</span>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: urgentOnly ? '#E53E3E' : 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={urgentOnly}
                    onChange={e => setUrgentOnly(e.target.checked)}
                    style={{ accentColor: '#E53E3E', width: 16, height: 16 }}
                  />
                  🔥 {t('Urgent Demands Only', 'માત્ર તાત્કાલિક માંગ')}
                </label>
              </div>
            </div>

            <div className="chip-group" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {cropChips.map(c => (
                <button
                  key={c.id}
                  className={`chip ${selectedCrop === c.id ? 'active' : ''}`}
                  onClick={() => setSelectedCrop(c.id)}
                  style={{ fontSize: '0.825rem', padding: '6px 12px' }}
                >
                  <span style={{ marginRight: 4 }}>{c.emoji}</span>
                  {lang === 'gu' ? c.guj : c.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* VIEW 1: REQUIREMENTS GRID (IDENTICAL TO PRODUCE-CARD FORMAT)   */}
        {/* ============================================================== */}
        {(activeTab === 'demands' || activeTab === 'saved') && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <p style={{ fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                <span style={{ color: 'var(--green-primary)', fontWeight: 700 }}>{filteredDemands.length}</span> {t('buyer requirements found', 'ખરીદદાર માંગણીઓ મળી')}
              </p>
            </div>

            {filteredDemands.length === 0 ? (
              <div className="empty-state" style={{ background: '#fff', borderRadius: 20, padding: 48, boxShadow: 'var(--shadow-sm)' }}>
                <div className="empty-state-icon">🌾</div>
                <h3>{t('No buyer requirements found', 'કોઈ માંગણી મળી નથી')}</h3>
                <p style={{ color: 'var(--text-muted)' }}>{t('Try adjusting your crop filter or search query', 'ફિલ્ટર અથવા સર્ચ બદલો')}</p>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => { setSelectedCrop('All'); setUrgentOnly(false); setSearch(''); }}>
                  {t('Reset Filters', 'રીસેટ')}
                </button>
              </div>
            ) : (
              /* GRID IDENTICAL TO BROWSE PRODUCE LISTINGS WITH EQUAL HEIGHT CARDS */
              <StaggerGrid className="grid-auto" style={{ marginBottom: 60, alignItems: 'stretch' }}>
                {filteredDemands.map((req, i) => {
                  const hasSubmittedQuote = !!submittedQuotes[req.id];

                  return (
                    <FadeUpItem key={req.id} delay={i * 0.04} style={{ height: '100%', display: 'flex' }}>
                      <Link to={`/farmer/requirement/${req.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                        <motion.div
                          className="card produce-card"
                          whileHover={{ y: -6, boxShadow: 'var(--shadow-card-hover)' }}
                          style={{ overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}
                        >
                          {/* Visual Top Container (Same as produce card) */}
                          <div
                            style={{
                              height: 180,
                              flexShrink: 0,
                              background: 'linear-gradient(135deg, var(--green-light), #C8E6C9)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '4.5rem',
                              position: 'relative',
                            }}
                          >
                            <span>{req.emoji || '🌿'}</span>

                            {/* Bottom-Left Badges */}
                            <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              <span className="badge badge-blue" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                                {req.qty} {req.unit || 'ton'} {t('Needed', 'જરૂર')}
                              </span>
                              {req.urgency === 'urgent' && (
                                <span className="badge badge-red" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                                  🔥 {t('Urgent', 'તાત્કાલિક')}
                                </span>
                              )}
                              {req.flag && (
                                <span style={{ background: '#fff', padding: '3px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                  {req.flag} {req.destination?.split(' ')[0]}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Card Body with strict flex sizing */}
                          <div className="card-body" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            {/* Uniform Title & Delivery Terms Row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: 48, marginBottom: 8 }}>
                              <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                                <h5 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.cropName}>
                                  {req.cropName}
                                </h5>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <MapPin size={12} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }} title={req.deliveryTerms}>
                                    {req.deliveryTerms}
                                  </span>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--green-primary)', lineHeight: 1.1 }}>
                                  ₹{req.targetPrice}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginTop: 2 }}>
                                  {t('target price / kg', 'લક્ષ્ય ભાવ / kg')}
                                </div>
                              </div>
                            </div>

                            {/* Tags Row */}
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', minHeight: 26, marginBottom: 8, flexWrap: 'wrap' }}>
                              <span className="badge badge-gray" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                                {req.qty} {translateTerm(req.unit || 'ton', lang)}
                              </span>
                              <span className="badge badge-amber" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.destination}>
                                {req.destination || 'Export'}
                              </span>
                            </div>

                            {/* Spec Badges Row */}
                            {req.specs && (
                              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                                {Object.entries(req.specs).filter(([, v]) => v).slice(0, 3).map(([k, v]) => (
                                  <span key={k} className="badge" style={{ fontSize: '0.7rem', padding: '2px 7px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569' }}>
                                    {String(v)}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Enterprise Buyer Row (Locked to bottom with marginTop: auto) */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1, marginRight: 8 }}>
                                <div className="avatar avatar-sm" style={{ background: '#E3F2FD', color: '#1565C0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1.1rem', width: 34, height: 34, flexShrink: 0 }}>
                                  {req.logo || '🏢'}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {req.enterpriseName}
                                  </p>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {req.verified && <ShieldCheck size={12} color="var(--green-primary)" />}
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {req.city || 'Gujarat'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Action Button */}
                              {hasSubmittedQuote ? (
                                <button
                                  className="btn btn-sm"
                                  style={{ background: '#E8F5E9', color: 'var(--green-primary)', border: '1px solid #A5D6A7', fontSize: '0.8rem', padding: '6px 12px', fontWeight: 700, flexShrink: 0 }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(`/farmer/requirement/${req.id}`);
                                  }}
                                >
                                  ✓ {t('Quoted', 'મોકલાઈ')}
                                </button>
                              ) : (
                                <button
                                  className="btn btn-primary btn-sm"
                                  style={{ fontSize: '0.8rem', padding: '6px 14px', flexShrink: 0 }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(`/farmer/requirement/${req.id}`);
                                  }}
                                >
                                  {t('Send Quote', 'ઑફર મોકલો')}
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </FadeUpItem>
                  );
                })}
              </StaggerGrid>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: REGISTERED BUYERS DIRECTORY                            */}
        {/* ============================================================== */}
        {activeTab === 'directory' && (
          <div>
            <div style={{ marginBottom: 18, fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {t('Showing', 'દર્શાવે છે')} <strong>{filteredEnterprises.length}</strong> {t('registered buyers', 'નોંધાયેલ ખરીદદારો')}
            </div>

            <StaggerGrid className="grid-auto" style={{ marginBottom: 60, alignItems: 'stretch' }}>
              {filteredEnterprises.map((ent, i) => {
                return (
                  <FadeUpItem key={ent.id} delay={i * 0.04} style={{ height: '100%', display: 'flex' }}>
                    <motion.div className="card produce-card" whileHover={{ y: -4, boxShadow: 'var(--shadow-card-hover)' }} style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: 140, flexShrink: 0, background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', position: 'relative' }}>
                        <span>{ent.logo}</span>
                        <div style={{ position: 'absolute', bottom: 10, left: 12 }}>
                          <span className="badge badge-blue">{ent.type}</span>
                        </div>
                      </div>

                      <div className="card-body" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <h5 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ent.name}
                          </h5>
                          {ent.verified && <ShieldCheck size={14} color="var(--green-primary)" style={{ flexShrink: 0 }} />}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          📍 {ent.city} • Min: {ent.minOrder}
                        </p>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 14 }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: 4 }}>{t('Exports:', 'નિકાસ:')}</span>
                          {ent.flags.map((f, j) => <span key={j} style={{ fontSize: '1.1rem' }}>{f}</span>)}
                        </div>

                        <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                          <button
                            className="btn btn-primary btn-sm btn-full"
                            onClick={() => {
                              setActiveTab('demands');
                              setSearch(ent.name);
                            }}
                          >
                            {t('View Demands', 'માંગ જુઓ')}
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            onClick={() => navigate('/farmer/chat')}
                            title={t('Chat with Buyer', 'ખરીદદાર સાથે ચેટ કરો')}
                          >
                            <MessageSquare size={14} /> {t('Chat', 'ચેટ')}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </FadeUpItem>
                );
              })}
            </StaggerGrid>
          </div>
        )}
      </div>

      {/* Simple Contact / Chat Modal */}
      <AnimatePresence>
        {contactModalReq && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: 16,
            }}
            onClick={() => setContactModalReq(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 380, width: '100%', textAlign: 'center' }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🏢</div>
              <h4 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 4px' }}>{contactModalReq.enterpriseName}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>📍 {contactModalReq.city || 'Gujarat'}</p>
              <div style={{ background: 'var(--green-light)', padding: 12, borderRadius: 12, marginBottom: 20, color: 'var(--green-primary)', fontWeight: 600 }}>
                💬 {t('Platform Chat Enabled for Fast Deals', 'ઝડપી સોદા માટે પ્લેટફોર્મ ચેટ')}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary btn-full" onClick={() => setContactModalReq(null)}>{t('Close', 'બંધ')}</button>
                <button
                  className="btn btn-primary btn-full"
                  onClick={() => {
                    setContactModalReq(null);
                    navigate('/farmer/chat');
                  }}
                >
                  <MessageSquare size={15} /> {t('Start Chat', 'ચેટ શરૂ કરો')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
