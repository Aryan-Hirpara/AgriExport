import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, MessageCircle, Check, X, RefreshCw } from 'lucide-react';
import { OFFERS } from '../../data/sampleData';
import { FadeUpItem, StaggerGrid } from '../../components/common/AnimatedComponents';

export default function OffersInbox() {
  const { t, addToast } = useApp();
  const [activeTab, setActiveTab] = useState('new');
  const [offers, setOffers] = useState(OFFERS);
  const [counterSheet, setCounterSheet] = useState(null);
  const [counterPrice, setCounterPrice] = useState(312);
  const [counterNote, setCounterNote] = useState('');

  const tabs = [
    { key: 'new', label: t('New', 'નવી') },
    { key: 'countered', label: t('Countered', 'કાઉન્ટર') },
    { key: 'accepted', label: t('Accepted', 'સ્વીકૃત') },
  ];

  const filtered = offers.filter(o => o.status === activeTab);

  const handleAccept = (id) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, status: 'accepted' } : o));
    addToast(t('Offer accepted! Deal created 🎉', 'ઑફર સ્વીકૃત! સોદો 🎉'), 'success');
  };
  const handleDecline = (id) => {
    setOffers(prev => prev.filter(o => o.id !== id));
    addToast(t('Offer declined', 'ઑફર નકારી'), 'warning');
  };
  const handleCounter = () => {
    setOffers(prev => prev.map(o => o.id === counterSheet ? { ...o, status: 'countered', counterPrice } : o));
    setCounterSheet(null);
    addToast(t('Counter offer sent!', 'કાઉન્ટર ઑફર મોકલ્યો!'), 'success');
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ background: 'var(--green-primary)', padding: '32px 0 48px' }}>
        <div className="container">
          <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>{t('Offers Inbox', 'ઑફર ઇન્બૉક્સ')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>{offers.filter(o => o.status === 'new').length} {t('new offers', 'નવી ઑફર')}</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: -20, paddingBottom: 40 }}>
        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', borderRadius: 20, padding: '8px', boxShadow: 'var(--shadow-md)', marginBottom: 24, display: 'flex', gap: 6 }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', background: activeTab === tab.key ? 'var(--green-primary)' : 'transparent', color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'var(--font-heading)', transition: 'all 0.2s' }}>
              {tab.label} ({offers.filter(o => o.status === tab.key).length})
            </button>
          ))}
        </motion.div>

        <StaggerGrid style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>{t('No offers here', 'ઑફર નથી')}</h3>
            </div>
          ) : filtered.map((offer, i) => (
            <FadeUpItem key={offer.id} delay={i * 0.08}>
              <div className={`offer-card ${offer.status === 'new' ? 'new' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{offer.enterpriseName}</span>
                      <ShieldCheck size={15} color="var(--green-primary)" />
                    </div>
                    <p style={{ fontSize: '0.8125rem', margin: '0 0 4px', color: 'var(--text-secondary)' }}>
                      📦 {offer.qty} {offer.unit} • 🚚 {offer.deliveryTerms}
                    </p>
                    <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-secondary)' }}>
                      💳 {offer.paymentTerms}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--green-primary)' }}>₹{offer.offeredPrice}<span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>/kg</span></div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {t('Your ask:', 'તમારી ઑક:')} ₹{offer.expectedPrice}/kg
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <span className={offer.offeredPrice >= offer.expectedPrice ? 'badge badge-green' : 'badge badge-amber'}>
                        {offer.offeredPrice >= offer.expectedPrice ? '✓ At your price' : `₹${offer.expectedPrice - offer.offeredPrice} below ask`}
                      </span>
                    </div>
                  </div>
                </div>

                {offer.message && (
                  <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                    <p style={{ fontSize: '0.8125rem', margin: 0, fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{offer.message}"</p>
                  </div>
                )}

                {offer.status === 'countered' && offer.counterPrice && (
                  <div style={{ background: 'var(--blue-light)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                    <p style={{ fontSize: '0.8125rem', margin: 0, fontWeight: 600, color: 'var(--blue)' }}>
                      {t('Your counter:', 'તમારો કાઉન્ટર:')} ₹{offer.counterPrice}/kg → {t('Awaiting enterprise response', 'ઉદ્યોગ જવાબ રાહ')}
                    </p>
                  </div>
                )}

                {offer.status === 'accepted' && (
                  <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                    <p style={{ fontSize: '0.8125rem', margin: 0, fontWeight: 600, color: 'var(--green-primary)' }}>
                      ✅ {t('Offer accepted! Enterprise will contact you directly to arrange pickup and payment.', 'ઑફર સ્વીકૃત! કંપની સીધો સંપર્ક કરશે.')}
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flex: 1 }}>🕐 {offer.sentAt}</span>
                  {offer.status === 'new' && (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => handleAccept(offer.id)}>
                        <Check size={14} /> {t('Accept', 'સ્વીકારો')}
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setCounterSheet(offer.id)}>
                        <RefreshCw size={14} /> {t('Counter', 'કાઉન્ટર')}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDecline(offer.id)}>
                        <X size={14} /> {t('Decline', 'નકારો')}
                      </button>
                    </>
                  )}
                  <button className="btn btn-ghost btn-sm">
                    <MessageCircle size={14} /> {t('Chat', 'ચૅટ')}
                  </button>
                </div>
              </div>
            </FadeUpItem>
          ))}
        </StaggerGrid>
      </div>

      {/* Counter Offer Bottom Sheet */}
      <AnimatePresence>
        {counterSheet && (
          <motion.div className="bottom-sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bottom-sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 400, damping: 35 }}>
              <div className="bottom-sheet-handle" />
              <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>{t('Send Counter Offer', 'કાઉન્ટર ઑફર')}</h4>
              <p style={{ fontSize: '0.875rem', marginBottom: 24 }}>{t('Propose a price you are comfortable with.', 'તમને ઠીક ભાવ સૂચવો.')}</p>
              <div style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ marginBottom: 10 }}>{t('Your counter price (₹/kg)', 'કાઉન્ટર ભાવ (₹/kg)')}</label>
                <div className="stepper">
                  <button className="stepper-btn" onClick={() => setCounterPrice(p => Math.max(1, p - 1))}>−</button>
                  <input className="stepper-input" type="number" value={counterPrice} onChange={e => setCounterPrice(Number(e.target.value))} />
                  <button className="stepper-btn" onClick={() => setCounterPrice(p => p + 1)}>+</button>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">{t('Note (optional)', 'નૉંધ (ઐચ્છિક)')}</label>
                <textarea className="form-textarea" rows={2} value={counterNote} onChange={e => setCounterNote(e.target.value)} placeholder={t('e.g. This is premium jeera, quality justifies price.', 'ઉ.દ. આ પ્રીમિયમ છે.')} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost btn-full" onClick={() => setCounterSheet(null)}>{t('Cancel', 'રદ')}</button>
                <button className="btn btn-primary btn-full" onClick={handleCounter}>{t('Send Counter →', 'કાઉન્ટર →')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
