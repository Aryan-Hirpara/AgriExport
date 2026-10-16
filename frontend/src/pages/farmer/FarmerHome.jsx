import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { PlusCircle, ShieldCheck, ShieldAlert, Clock, TrendingUp, Package, MessageSquare, FileText } from 'lucide-react';
import { CountUp, FadeUpItem, StaggerGrid } from '../../components/common/AnimatedComponents';
import { getCropImage } from '../../utils/cropImages';

export default function FarmerHome() {
  const { user, buyerRequirements = [], produceListings = [], farmerOffers = [], mandiPrices = [] } = useApp();

  const myListings = produceListings.filter(l => {
    if (!user) return false;
    const uid = String(user.id || '').replace(/^f/, '');
    const uDbId = String(user.dbId || '');
    const lFarmerDbId = String(l.farmerDbId || l.farmer_id || '');
    const lFarmerId = String(l.farmerId || '').replace(/^f/, '');
    return (uDbId && lFarmerDbId === uDbId) || (uid && lFarmerId === uid);
  });
  const activeListingsCount = myListings.filter(l => l.status === 'active').length;
  const newOffersCount = farmerOffers.filter(o => o.status === 'new' || o.status === 'pending').length;
  const topMandi = mandiPrices[0] || { crop: 'Jeera', today: 318, change: 6 };

  const openRequirements = (buyerRequirements || []).filter(r => r.status === 'open' || !r.status);

  const stats = [
    { icon: <Package size={22} color="var(--green-primary)" />, value: activeListingsCount, label: 'Active Listings', bg: 'var(--green-light)', trend: `${activeListingsCount} listed`, link: '/farmer/listings' },
    { icon: <FileText size={22} color="#7B1FA2" />, value: openRequirements.length, label: 'Buyer Demands', bg: '#F3E5F5', trend: `${openRequirements.length} live RFQs`, link: '/farmer/find-buyers' },
    { icon: <MessageSquare size={22} color="#1565C0" />, value: newOffersCount, label: 'New Offers', bg: 'var(--blue-light)', trend: `${newOffersCount} pending`, link: '/farmer/offers' },
    { icon: <TrendingUp size={22} color="#E65100" />, value: `₹${topMandi.today}`, label: `Mandi (${topMandi.crop})`, bg: 'var(--amber-light)', trend: `${topMandi.change >= 0 ? '+' : ''}${topMandi.change} today`, link: '/mandi-prices' },
  ];

  const latestOffers = farmerOffers.slice(0, 3);
  const urgentRequirements = openRequirements.slice(0, 3);

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
              Namaste, {user?.name || 'Farmer'} 🙏
            </h2>
          </div>
        </FadeUpItem>

        {/* Verification Banner */}
        <FadeUpItem>
          {user?.verified ? (
            <div className="verification-banner banner-verified" style={{ marginBottom: 28 }}>
              <ShieldCheck size={22} color="var(--green-primary)" />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: 'var(--green-primary)', margin: 0 }}>Account Verified ✓</p>
                <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-secondary)' }}>You can list produce, view all buyer requirements, and submit quotes.</p>
              </div>
            </div>
          ) : (
            <div className="verification-banner" style={{ marginBottom: 28, background: 'var(--amber-light)', border: '1px solid #FCD34D', padding: '14px 18px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <ShieldAlert size={22} color="#B45309" />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: '#92400E', margin: 0 }}>Verification in Progress</p>
                <p style={{ fontSize: '0.8125rem', margin: 0, color: '#92400E' }}>Your farm credentials are being reviewed by the admin team.</p>
              </div>
            </div>
          )}
        </FadeUpItem>

        {/* Stat Cards */}
        <StaggerGrid className="grid-4" style={{ marginBottom: 32 }}>
          {stats.map((s, i) => (
            <FadeUpItem key={i}>
              <Link to={s.link || '#'} style={{ textDecoration: 'none' }}>
                <motion.div className="stat-card" whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}>
                  <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                  <div className="stat-value notranslate">
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
                  <span>🔥 Active Buyer Requirements</span>
                </h3>
                <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                  <span className="notranslate">{openRequirements.length}</span> Active RFQs
                </span>
              </div>
              <Link to="/farmer/find-buyers" style={{ color: 'var(--green-primary)', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                View all requirements ({openRequirements.length}) →
              </Link>
            </div>

            {urgentRequirements.length === 0 ? (
              <div className="card card-body" style={{ textAlign: 'center', padding: '36px 20px', borderRadius: 16 }}>
                <p style={{ color: 'var(--text-muted)', margin: '0 0 12px' }}>No active buyer requirements right now.</p>
                <Link to="/farmer/add-produce" className="btn btn-outline btn-sm">
                  Post produce so buyers can find you
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                {urgentRequirements.map((req, i) => {
                  const reqImg = getCropImage(req.crop || req.cropName, req.imageUrl || req.image);

                  return (
                    <FadeUpItem key={req.id} delay={i * 0.05}>
                      <Link to={`/farmer/requirement/${req.id}`} style={{ textDecoration: 'none' }}>
                        <motion.div className="card produce-card" whileHover={{ y: -5, boxShadow: 'var(--shadow-card-hover)' }} style={{ overflow: 'hidden' }}>
                          <div style={{ height: 140, background: 'linear-gradient(135deg, var(--green-light), #C8E6C9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', position: 'relative', overflow: 'hidden' }}>
                            {reqImg ? (
                              <img
                                src={reqImg}
                                alt={req.cropName}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.parentElement?.querySelector('.farmer-req-fallback');
                                  if (fallback) fallback.style.display = 'block';
                                }}
                              />
                            ) : null}
                            <span className="farmer-req-fallback" style={{ display: reqImg ? 'none' : 'block' }}>
                              {req.emoji || '🌿'}
                            </span>
                          <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: 6 }}>
                            <span className="badge badge-blue notranslate" style={{ fontSize: '0.7rem' }}>{req.qty} {req.unit || 'ton'}</span>
                            {req.flag && <span className="notranslate" style={{ background: '#fff', padding: '2px 6px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 600 }}>{req.flag}</span>}
                          </div>
                        </div>

                        <div className="card-body" style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <div>
                              <h5 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 2px', fontSize: '0.95rem' }}>
                                {req.cropName || req.title}
                              </h5>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                📍 {req.deliveryTerms || req.destination || 'Gujarat'}
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--green-primary)' }}>
                                ₹{req.targetPrice > 1000 && (req.unit === 'ton' || req.unit === 'MT') ? Math.round(req.targetPrice / 1000) : req.targetPrice}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/kg</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border)', marginTop: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1, marginRight: 8 }}>
                              <div className="avatar avatar-sm" style={{ width: 24, height: 24, borderRadius: '50%', background: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', overflow: 'hidden', flexShrink: 0 }}>
                                {typeof req.logo === 'string' && (req.logo.startsWith('data:') || req.logo.startsWith('http') || req.logo.startsWith('/')) ? (
                                  <img src={req.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  req.logo || '🏢'
                                )}
                              </div>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {req.enterpriseName}
                              </span>
                            </div>
                            <span className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem', padding: '4px 10px', flexShrink: 0 }}>
                              Quote →
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </FadeUpItem>
                );
              })}
            </div>
            )}
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
                <h4 style={{ color: '#fff', fontFamily: 'var(--font-heading)', margin: '0 0 4px' }}>+ Add New Produce</h4>
                <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: '0.875rem' }}>List jeera, mango, groundnut, cotton and more</p>
              </div>
              <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.6)', fontSize: '1.5rem' }}>→</span>
            </motion.div>
          </Link>
        </FadeUpItem>

        {/* Latest Offers */}
        <FadeUpItem>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>Latest Offers Received</h3>
            <Link to="/farmer/offers" style={{ color: 'var(--green-primary)', fontWeight: 600, fontSize: '0.875rem' }}>View all →</Link>
          </div>
          {latestOffers.length === 0 ? (
            <div className="card card-body" style={{ textAlign: 'center', padding: '36px 20px', borderRadius: 16 }}>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No offers received yet. Make sure your produce is listed with active status.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {latestOffers.map((offer, i) => (
                <motion.div key={offer.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                  <Link to="/farmer/offers" style={{ textDecoration: 'none' }}>
                    <div className={`offer-card ${offer.status === 'new' || offer.status === 'pending' ? 'new' : ''}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{offer.enterpriseName}</span>
                            <ShieldCheck size={14} color="var(--green-primary)" />
                            {(offer.status === 'new' || offer.status === 'pending') && <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>NEW</span>}
                            {offer.status === 'accepted' && <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>✓ ACCEPTED</span>}
                            {offer.status === 'countered' && <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>COUNTERED</span>}
                          </div>
                          <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-secondary)' }}>
                            <span className="notranslate">{offer.qty} {offer.unit}</span> • {offer.deliveryTerms || 'Direct Pickup'}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--green-primary)' }}>
                            ₹{offer.offeredPrice}/kg
                          </div>
                          {offer.expectedPrice && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Expected <span className="notranslate">₹{offer.expectedPrice}/kg</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </FadeUpItem>
      </div>
    </div>
  );
}
