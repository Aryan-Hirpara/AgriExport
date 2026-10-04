import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { PlusCircle, ShieldCheck, Clock, TrendingUp, Package, Star, MessageSquare, FileText, Send, Sparkles } from 'lucide-react';
import { CountUp, FadeUpItem, StaggerGrid, AnimCard } from '../../components/common/AnimatedComponents';
import { OFFERS, LISTINGS, BUYER_REQUIREMENTS } from '../../data/sampleData';

export default function FarmerHome() {
  const { t, lang, buyerRequirements, produceListings } = useApp();

  const demandsSource = buyerRequirements && buyerRequirements.length > 0 ? buyerRequirements : BUYER_REQUIREMENTS;
  const activeListingsCount = (produceListings || []).filter(l => l.status === 'active').length;

  const stats = [
    { icon: <Package size={22} color="var(--green-primary)" />, value: activeListingsCount, label: t('Active Listings', 'સક્રિય યાદી'), bg: 'var(--green-light)', trend: '+1 this week', link: '/farmer/listings' },
    { icon: <FileText size={22} color="#7B1FA2" />, value: demandsSource.length, label: t('Buyer Demands', 'ખરીદદાર માંગ'), bg: '#F3E5F5', trend: `${demandsSource.length} live RFQs`, link: '/farmer/find-buyers' },
    { icon: <MessageSquare size={22} color="#1565C0" />, value: 4, label: t('New Offers', 'નવી ઑફર'), bg: 'var(--blue-light)', trend: '2 unread', link: '/farmer/offers' },
    { icon: <TrendingUp size={22} color="#E65100" />, value: '₹322', label: t('Mandi Rate (Jeera)', 'મંડી ભાવ (જીરું)'), bg: 'var(--amber-light)', trend: '+₹7/kg today', link: '/mandi-prices' },
  ];

  const latestOffers = OFFERS.slice(0, 3);
  const urgentRequirements = demandsSource.slice(0, 3);


  return (
    <div style={{ padding: '28px 0 60px' }}>
      <div className="container">
        {/* Greeting */}
        <FadeUpItem>
          <div style={{ marginBottom: 28 }}>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Namaste, Ramesh Bhai 🙏
            </h2>
          </div>
        </FadeUpItem>

        {/* Verification Banner */}
        <FadeUpItem>
          <div className="verification-banner banner-verified" style={{ marginBottom: 28 }}>
            <ShieldCheck size={22} color="var(--green-primary)" />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: 'var(--green-primary)', margin: 0 }}>{t('Account Verified ✓', 'ખાતું ચકાસાયેલ ✓')}</p>
              <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-secondary)' }}>{t('You can list produce, view all buyer requirements, and submit quotes.', 'ઉત્પાદ યાદી કરો, ખરીદદારોની માંગ જુઓ અને સીધા ભાવ મોકલો.')}</p>
            </div>
          </div>
        </FadeUpItem>

        {/* Stat Cards */}
        <StaggerGrid className="grid-4" style={{ marginBottom: 32 }}>
          {stats.map((s, i) => (
            <FadeUpItem key={i}>
              <Link to={s.link || '#'} style={{ textDecoration: 'none' }}>
                <motion.div className="stat-card" whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}>
                  <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                  <div className="stat-value">
                    {typeof s.value === 'number' ? <CountUp target={s.value} duration={1.2} /> : s.value}
                  </div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-trend trend-up">↑ {s.trend}</div>
                </motion.div>
              </Link>
            </FadeUpItem>
          ))}
        </StaggerGrid>

        {/* ACTIVE BUYER DEMANDS / REQUIREMENTS SHOWCASE */}
        <FadeUpItem>
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🔥 {t('Active Buyer Requirements', 'તાજી ખરીદદાર માંગણીઓ')}</span>
                </h3>
                <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                  {demandsSource.length} {t('Active RFQs', 'સક્રિય')}
                </span>
              </div>
              <Link to="/farmer/find-buyers" style={{ color: 'var(--green-primary)', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                {t(`View all requirements (${demandsSource.length}) →`, `બધી માંગણીઓ જુઓ (${demandsSource.length}) →`)}
              </Link>
            </div>


            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {urgentRequirements.map((req, i) => (
                <FadeUpItem key={req.id} delay={i * 0.05}>
                  <Link to={`/farmer/requirement/${req.id}`} style={{ textDecoration: 'none' }}>
                    <motion.div className="card produce-card" whileHover={{ y: -5, boxShadow: 'var(--shadow-card-hover)' }} style={{ overflow: 'hidden' }}>
                      <div style={{ height: 140, background: 'linear-gradient(135deg, var(--green-light), #C8E6C9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', position: 'relative' }}>
                        <span>{req.emoji || '🌿'}</span>
                        <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: 6 }}>
                          <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{req.qty} {req.unit || 'ton'}</span>
                          {req.flag && <span style={{ background: '#fff', padding: '2px 6px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 600 }}>{req.flag}</span>}
                        </div>
                      </div>

                      <div className="card-body" style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <div>
                            <h5 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 2px', fontSize: '0.95rem' }}>
                              {req.cropName}
                            </h5>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              📍 {req.deliveryTerms}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--green-primary)' }}>
                              ₹{req.targetPrice}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/kg</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border)', marginTop: 8 }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {req.enterpriseName}
                          </span>
                          <span className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                            {t('Quote', 'ઑફર')} →
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </FadeUpItem>
              ))}
            </div>

          </div>
        </FadeUpItem>

        {/* Add Produce Button */}
        <FadeUpItem>
          <Link to="/farmer/add-produce" style={{ textDecoration: 'none', display: 'block', marginBottom: 32 }}>
            <motion.div
              whileHover={{ scale: 1.01, boxShadow: 'var(--shadow-card-hover)' }}
              whileTap={{ scale: 0.98 }}
              style={{ background: 'linear-gradient(135deg, var(--green-primary) 0%, #388E3C 100%)', borderRadius: 20, padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 16 }}
            >
              <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlusCircle size={28} color="#fff" />
              </div>
              <div>
                <h4 style={{ color: '#fff', fontFamily: 'var(--font-heading)', margin: '0 0 4px' }}>{t('+ Add New Produce', '+ ઉત્પાદ ઉમેરો')}</h4>
                <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: '0.875rem' }}>{t('List jeera, mango, groundnut and more', 'જીરું, કેરી, મગફળી અને વધુ')}</p>
              </div>
              <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.6)', fontSize: '1.5rem' }}>→</span>
            </motion.div>
          </Link>
        </FadeUpItem>

        {/* Latest Offers */}
        <FadeUpItem>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>{t('Latest Offers', 'તાજી ઑફર')}</h3>
            <Link to="/farmer/offers" style={{ color: 'var(--green-primary)', fontWeight: 600, fontSize: '0.875rem' }}>{t('View all →', 'બધી →')}</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {latestOffers.map((offer, i) => (
              <motion.div key={offer.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                <Link to="/farmer/offers" style={{ textDecoration: 'none' }}>
                  <div className={`offer-card ${offer.status === 'new' ? 'new' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{offer.enterpriseName}</span>
                          <ShieldCheck size={14} color="var(--green-primary)" />
                          {offer.status === 'new' && <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>NEW</span>}
                          {offer.status === 'accepted' && <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>✓ ACCEPTED</span>}
                          {offer.status === 'countered' && <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>COUNTERED</span>}
                        </div>
                        <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-secondary)' }}>{offer.qty} {offer.unit} • {offer.deliveryTerms}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--green-primary)' }}>₹{offer.offeredPrice}/kg</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expected ₹{offer.expectedPrice}/kg</div>
                      </div>
                    </div>
                    {offer.status === 'new' && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                        <button className="btn btn-primary btn-sm" onClick={e => e.preventDefault()}>✓ {t('Accept', 'સ્વીકારો')}</button>
                        <button className="btn btn-secondary btn-sm" onClick={e => e.preventDefault()}>{t('Counter', 'કાઉન્ટર')}</button>
                        <button className="btn btn-ghost btn-sm" onClick={e => e.preventDefault()}>{t('Decline', 'નકારો')}</button>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </FadeUpItem>
      </div>
    </div>
  );
}

