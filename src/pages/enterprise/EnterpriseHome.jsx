import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Package, TrendingUp, Star, BarChart2, ShieldCheck, PlusCircle, FileText, Send, MessageSquare, ChevronRight, Building2 } from 'lucide-react';
import { CountUp, FadeUpItem, StaggerGrid } from '../../components/common/AnimatedComponents';
import { LISTINGS } from '../../data/sampleData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MINI_CHART = [
  { month: 'Jun', vol: 18 }, { month: 'Jul', vol: 24 }, { month: 'Aug', vol: 30 },
  { month: 'Sep', vol: 22 }, { month: 'Oct', vol: 38 },
];

export default function EnterpriseHome() {
  const { user, buyerRequirements } = useApp();

  const currentEntId = user?.id || 'e1';
  const myDemands = (buyerRequirements || []).filter(r => r.enterpriseId === currentEntId);
  const totalQuotesReceived = myDemands.reduce((acc, r) => acc + (r.quotes?.length || r.quotesCount || 0), 0);

  const stats = [
    { icon: <FileText size={22} color="#1565C0" />, value: myDemands.length, label: 'My Demands (RFQs)', bg: 'var(--blue-light)', trend: `${myDemands.length} active`, link: '/enterprise/requirements' },
    { icon: <MessageSquare size={22} color="var(--green-primary)" />, value: totalQuotesReceived, label: 'Farmer Quotes', bg: 'var(--green-light)', trend: `${totalQuotesReceived} received`, link: '/enterprise/requirements' },
    { icon: <TrendingUp size={22} color="#9333EA" />, value: 142, label: 'Volume Sourced (ton)', bg: '#F3E8FF', trend: '+28t this month' },
    { icon: <Star size={22} color="#B45309" />, value: 4.8, label: 'Farmer Rating', bg: 'var(--amber-light)', trend: '87 reviews' },
  ];

  const newMatches = LISTINGS.filter(l => l.status === 'active').slice(0, 3);

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
                Welcome, {user?.name || 'Ahmed Spice Exports'} 🌶️
              </h2>
            </div>
            <Link to="/enterprise/profile" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Building2 size={16} /> Company Profile
            </Link>
          </div>
        </FadeUpItem>

        {/* Verification Banner */}
        <FadeUpItem>
          <div className="verification-banner banner-verified" style={{ marginBottom: 28 }}>
            <ShieldCheck size={22} color="var(--green-primary)" />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: 'var(--green-primary)', margin: 0 }}>Enterprise Verified ✓</p>
              <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-secondary)' }}>
                You can post buying requirements and receive direct quotes from Gujarat farmers.
              </p>
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
                  <div className="stat-value"><CountUp target={s.value} duration={1.2} /></div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-trend trend-up">↑ {s.trend}</div>
                </motion.div>
              </Link>
            </FadeUpItem>
          ))}
        </StaggerGrid>

        {/* POST BUYING REQUIREMENT PROMINENT ACTION BANNER */}
        <FadeUpItem>
          <Link to="/enterprise/post-requirement" style={{ textDecoration: 'none', display: 'block', marginBottom: 32 }}>
            <motion.div
              whileHover={{ scale: 1.01, boxShadow: 'var(--shadow-card-hover)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                borderRadius: 20,
                padding: '24px 32px',
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                color: '#fff',
              }}
            >
              <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.18)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlusCircle size={28} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: '#fff', fontFamily: 'var(--font-heading)', margin: '0 0 4px', fontSize: '1.25rem' }}>
                  + Post Buying Requirement / RFQ
                </h4>
                <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '0.875rem' }}>
                  Post crops, volume, and target prices to receive quotes from farmers across Gujarat
                </p>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.6rem' }}>→</span>
            </motion.div>
          </Link>
        </FadeUpItem>

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
                          <span style={{ fontSize: '1.5rem' }}>{req.emoji}</span>
                          <div>
                            <strong style={{ fontSize: '0.95rem' }}>{req.cropName}</strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{req.qty} Tons Needed</div>
                          </div>
                        </div>
                        <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '3px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700 }}>
                          {req.flag} {req.destination.split(' ')[0]}
                        </span>
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
          </div>
        </FadeUpItem>

        {/* Mini Volume Chart */}
        <FadeUpItem>
          <div className="card card-body" style={{ marginBottom: 32 }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>Volume Traded (Tons)</h4>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MINI_CHART}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} formatter={(v) => [`${v} ton`, 'Volume']} />
                  <Line type="monotone" dataKey="vol" stroke="#1565C0" strokeWidth={3} dot={{ r: 5, fill: '#1565C0', stroke: '#fff', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </FadeUpItem>

        {/* New Matching Produce */}
        <FadeUpItem>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>New Matching Produce from Farmers</h3>
            <Link to="/browse" style={{ color: 'var(--green-primary)', fontWeight: 600, fontSize: '0.875rem' }}>Browse All Produce →</Link>
          </div>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
            {newMatches.map((listing, i) => (
              <motion.div key={listing.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -3 }} style={{ minWidth: 240, background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ height: 120, background: 'linear-gradient(135deg, var(--green-light), #C8E6C9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem' }}>
                  {listing.photos[0]}
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <h5 style={{ fontFamily: 'var(--font-heading)', marginBottom: 4, fontSize: '0.9rem' }}>{listing.cropName}</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 8px' }}>📍 {listing.village} • {listing.qty} {listing.unit}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="notranslate" translate="no" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--green-primary)', fontSize: '1.1rem' }}>₹{listing.price}/kg</span>
                    <Link to={`/enterprise/send-offer/${listing.id}`} className="btn btn-primary btn-sm">Send Offer</Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </FadeUpItem>
      </div>
    </div>
  );
}

