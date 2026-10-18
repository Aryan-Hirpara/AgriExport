import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Package, TrendingUp, Star, ShieldCheck, ShieldAlert, PlusCircle, FileText, MessageSquare, Building2 } from 'lucide-react';
import { CountUp, FadeUpItem, StaggerGrid } from '../../components/common/AnimatedComponents';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MINI_CHART = [
  { month: 'Jun', vol: 0 }, { month: 'Jul', vol: 0 }, { month: 'Aug', vol: 0 },
  { month: 'Sep', vol: 0 }, { month: 'Oct', vol: 0 },
];

export default function EnterpriseHome() {
  const { user, buyerRequirements = [], produceListings = [], enterpriseOffers = [] } = useApp();

  const myDemands = (buyerRequirements || []).filter(r => {
    const rEnt = String(r.enterpriseId || r.enterpriseDbId || '').replace(/^e/, '');
    const uEnt = String(user?.dbId || user?.id || '').replace(/^e/, '');
    if (rEnt && uEnt && rEnt === uEnt) return true;
    if (r.enterpriseId && user?.id && r.enterpriseId === user.id) return true;
    if (!user && (r.enterpriseId === 'e1' || r.enterpriseId === 'e35')) return true;
    return false;
  });
  const totalQuotesReceived = myDemands.reduce((acc, r) => acc + (r.quotes?.length || r.quotesCount || 0), 0);
  const activeOffersCount = enterpriseOffers.filter(o => o.status === 'pending' || o.status === 'countered').length;

  const stats = [
    { icon: <FileText size={22} color="#1565C0" />, value: myDemands.length, label: 'My Requirements', bg: 'var(--blue-light)', trend: `${myDemands.length} active`, link: '/enterprise/requirements' },
    { icon: <MessageSquare size={22} color="var(--green-primary)" />, value: totalQuotesReceived, label: 'Farmer Quotes', bg: 'var(--green-light)', trend: `${totalQuotesReceived} received`, link: '/enterprise/requirements' },
    { icon: <Package size={22} color="#9333EA" />, value: activeOffersCount, label: 'Active Offers', bg: '#F3E8FF', trend: `${activeOffersCount} sent`, link: '/enterprise/offers' },
    { icon: <Star size={22} color="#B45309" />, value: user?.rating ? Number(user.rating).toFixed(1) : '5.0', label: 'Enterprise Rating', bg: 'var(--amber-light)', trend: `${user?.reviews || 0} reviews` },
  ];

  const newMatches = produceListings.filter(l => l.status === 'active').slice(0, 4);

  return (
    <div style={{ padding: '28px 0 60px' }}>
      <div className="container">
        <FadeUpItem>
          <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h2 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>
                Welcome, {user?.name || 'Enterprise'} 🏢
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/enterprise/post-requirement" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <PlusCircle size={16} /> Post Requirement
              </Link>
              <Link to="/enterprise/profile" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={16} /> Company Profile
              </Link>
            </div>
          </div>
        </FadeUpItem>

        {/* Verification Banner */}
        <FadeUpItem>
          {user?.verified || user?.is_verified ? (
            <div className="verification-banner banner-verified" style={{ marginBottom: 28 }}>
              <ShieldCheck size={22} color="var(--green-primary)" />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: 'var(--green-primary)', margin: 0 }}>Enterprise Verified ✓</p>
                <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-secondary)' }}>
                  You can post buying requirements, receive direct quotes from Indian farmers, and make purchase offers.
                </p>
              </div>
            </div>
          ) : (
            <div className="verification-banner" style={{ marginBottom: 28, background: 'var(--amber-light)', border: '1px solid #FCD34D', padding: '14px 18px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <ShieldAlert size={22} color="#B45309" />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: '#92400E', margin: 0 }}>Verification in Progress</p>
                <p style={{ fontSize: '0.8125rem', margin: 0, color: '#92400E' }}>Your company documents (GST, IEC) are being reviewed by the admin team.</p>
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

        {/* MY ACTIVE REQUIREMENTS PREVIEW SECTION */}
        <FadeUpItem>
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 2px' }}>
                  My Posted Buying Requirements
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Active requirements visible in Farmer panel
                </span>
              </div>
              <Link to="/enterprise/requirements" style={{ color: '#1565C0', fontWeight: 700, fontSize: '0.875rem' }}>
                Manage all requirements →
              </Link>
            </div>

            {myDemands.length === 0 ? (
              <div className="card card-body" style={{ textAlign: 'center', padding: '36px 20px', borderRadius: 16 }}>
                <p style={{ color: 'var(--text-muted)', margin: '0 0 16px' }}>
                  You have not posted any buying requirements yet.
                </p>
                <Link to="/enterprise/post-requirement" className="btn btn-primary btn-sm">
                  + Post First Requirement
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
                {myDemands.slice(0, 3).map(req => {
                  const quotesList = req.quotes || [];
                  return (
                    <motion.div
                      key={req.id}
                      whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
                      style={{
                        background: '#fff',
                        borderRadius: 16,
                        border: '1px solid var(--border)',
                        padding: '16px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '1.5rem' }}>{req.emoji || '🌾'}</span>
                            <div>
                              <strong style={{ fontSize: '0.95rem' }}>{req.cropName || req.title}</strong>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{req.qty} Tons Needed</div>
                            </div>
                          </div>
                          {req.destination && (
                            <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '3px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700 }}>
                              {req.flag || '📍'} {req.destination.split(' ')[0]}
                            </span>
                          )}
                        </div>

                        <div style={{ background: 'var(--sand-light)', borderRadius: 10, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0 12px' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Target Price</span>
                            <strong className="notranslate" translate="no" style={{ color: 'var(--green-primary)', fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>₹{req.targetPrice}/kg</strong>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Quotes Received</span>
                            <strong style={{ color: '#1565C0', fontSize: '0.95rem' }}>💬 {quotesList.length || req.quotesCount || 0}</strong>
                          </div>
                        </div>
                      </div>

                      <Link to="/enterprise/requirements" style={{ textDecoration: 'none' }}>
                        <button className="btn btn-outline btn-sm btn-full" style={{ fontSize: '0.78rem' }}>
                          View Received Farmer Quotes
                        </button>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </FadeUpItem>

        {/* New Matching Produce */}
        <FadeUpItem>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>Available Produce from Indian Farmers</h3>
            <Link to="/browse" style={{ color: 'var(--green-primary)', fontWeight: 600, fontSize: '0.875rem' }}>Browse All Produce →</Link>
          </div>
          {newMatches.length === 0 ? (
            <div className="card card-body" style={{ textAlign: 'center', padding: '36px 20px', borderRadius: 16 }}>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                No farmer produce listings currently available in the marketplace.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
              {newMatches.map((listing, i) => (
                <motion.div key={listing.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -3 }} style={{ minWidth: 240, background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ height: 120, background: 'linear-gradient(135deg, var(--green-light), #C8E6C9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', overflow: 'hidden' }}>
                    {typeof listing.photos?.[0] === 'string' && (listing.photos[0].startsWith('http') || listing.photos[0].startsWith('/') || listing.photos[0].startsWith('data:')) ? (
                      <img
                        src={listing.photos[0]}
                        alt={listing.cropName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement.innerText = listing.emoji || '🌾';
                        }}
                      />
                    ) : (
                      listing.emoji || listing.photos?.[0] || '🌾'
                    )}
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <h5 style={{ fontFamily: 'var(--font-heading)', marginBottom: 4, fontSize: '0.9rem' }}>{listing.cropName}</h5>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 8px' }}>📍 {listing.village || listing.district} • {listing.qty} {listing.unit}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="notranslate" translate="no" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--green-primary)', fontSize: '1.1rem' }}>₹{listing.price}/kg</span>
                      <Link to={`/enterprise/send-offer/${listing.id}`} className="btn btn-primary btn-sm">Send Offer</Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </FadeUpItem>
      </div>
    </div>
  );
}
