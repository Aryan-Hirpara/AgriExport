import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Globe, TrendingUp, Users, Sprout, Star, CheckCircle, Package, Building2 } from 'lucide-react';
import { CountUp, FadeUpItem, StaggerGrid } from '../../components/common/AnimatedComponents';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

const HOW_IT_WORKS = [
  { step: 1, icon: '📝', title: 'Register & Verify', desc: 'Create your account. Admin verifies your documents within 48 hours.' },
  { step: 2, icon: '📦', title: 'List Your Produce', desc: 'Add crop details, photos, quantity, price and export preferences.' },
  { step: 3, icon: '🤝', title: 'Receive Offers', desc: 'Verified enterprises send you offers. Chat, counter, and agree on terms.' },
  { step: 4, icon: '✅', title: 'Track Your Deal', desc: 'Follow the deal timeline. Rate the enterprise after completion.' },
];

export default function Home() {
  const { produceListings = [], crops = [], buyerRequirements = [] } = useApp();
  const [stats, setStats] = useState({
    farmers: 0,
    enterprises: 0,
    listings: 0,
    deals: 0,
  });
  const [enterprises, setEnterprises] = useState([]);

  const fetchHomeStats = () => {
    api.auth.getPlatformStats()
      .then(res => {
        if (res?.data) {
          setStats(res.data);
        }
      })
      .catch(err => console.warn('Home stats fetch note:', err.message));

    api.enterprises.getAll()
      .then(res => {
        if (res?.data) {
          setEnterprises(res.data.slice(0, 3));
        }
      })
      .catch(err => console.warn('Enterprises list fetch note:', err.message));
  };

  useEffect(() => {
    fetchHomeStats();

    const socket = getSocket();
    if (socket) {
      socket.on('stats_updated', fetchHomeStats);
      socket.on('new_user_registered', fetchHomeStats);
      socket.on('user_status_changed', fetchHomeStats);
      socket.on('new_listing_posted', fetchHomeStats);
      socket.on('deal_created', fetchHomeStats);
    }

    return () => {
      if (socket) {
        socket.off('stats_updated', fetchHomeStats);
        socket.off('new_user_registered', fetchHomeStats);
        socket.off('user_status_changed', fetchHomeStats);
        socket.off('new_listing_posted', fetchHomeStats);
        socket.off('deal_created', fetchHomeStats);
      }
    };
  }, []);

  const liveCounters = [
    { label: 'Farmers Registered', value: stats.farmers || 0, suffix: '+' },
    { label: 'Verified Enterprises', value: stats.enterprises || 0, suffix: '+' },
    { label: 'Active Listings', value: stats.listings || produceListings.length || 0, suffix: '+' },
    { label: 'Deals Completed', value: stats.deals || 0, suffix: '+' },
  ];

  const featuredProduce = produceListings.filter(l => l.status === 'active').slice(0, 4);
  const activeRequirements = (buyerRequirements || []).filter(r => r.status === 'open' || !r.status);

  return (
    <div className="page-wrapper">
      {/* HERO */}
      <section className="hero" style={{ padding: '100px 0 120px' }}>
        <div className="hero-pattern" />
        <div className="container hero-content">
          <StaggerGrid>
            <FadeUpItem>
              <div className="section-label" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(8px)' }}>
                🌿 Gujarat Agri Platform
              </div>
            </FadeUpItem>
            <FadeUpItem>
              <h1 style={{ color: '#fff', marginBottom: 20, maxWidth: 640, lineHeight: 1.15 }}>
                Sell your harvest <span style={{ color: '#FBD959' }}>beyond your village</span>
              </h1>
            </FadeUpItem>
            <FadeUpItem>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.125rem', maxWidth: 520, marginBottom: 40, lineHeight: 1.7 }}>
                Connect directly with verified import/export enterprises across India and abroad. No middlemen. Fair prices. Transparent deals.
              </p>
            </FadeUpItem>
            <FadeUpItem>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Link to="/register?role=farmer" className="btn btn-amber btn-lg">
                  🧑‍🌾 I'm a Farmer
                  <ArrowRight size={18} />
                </Link>
                <Link to="/register?role=enterprise" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(255,255,255,0.3)' }}>
                  🏢 I'm an Enterprise
                </Link>
              </div>
            </FadeUpItem>
          </StaggerGrid>

          {/* Live Counters */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 72, background: 'rgba(255,255,255,0.10)', borderRadius: 20, padding: '28px 32px', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            {liveCounters.map((c, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', color: '#FBD959' }}>
                  <CountUp target={c.value} suffix={c.suffix} />
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                  {c.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">How It Works</div>
            <h2>Four steps to your first deal</h2>
          </div>
          <StaggerGrid className="grid-4">
            {HOW_IT_WORKS.map((step) => (
              <FadeUpItem key={step.step}>
                <motion.div
                  className="card card-body"
                  whileHover={{ y: -6, boxShadow: 'var(--shadow-card-hover)' }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{ width: 64, height: 64, background: 'var(--green-light)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2rem' }}>
                    {step.icon}
                  </div>
                  <div style={{ width: 28, height: 28, background: 'var(--green-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#fff', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'var(--font-heading)' }}>
                    {step.step}
                  </div>
                  <h4 style={{ marginBottom: 8, fontFamily: 'var(--font-heading)' }}>
                    {step.title}
                  </h4>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{step.desc}</p>
                </motion.div>
              </FadeUpItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* FEATURED PRODUCE */}
      <section className="section" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <div className="section-label">Fresh Listings</div>
              <h2>Featured Produce</h2>
            </div>
            <Link to="/browse" className="btn btn-outline">View All <ArrowRight size={16} /></Link>
          </div>

          {featuredProduce.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 20, border: '1.5px dashed var(--border)' }}>
              <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ marginBottom: 8 }}>No Produce Listings Yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Be the first verified farmer to list fresh harvest on the platform.</p>
              <Link to="/register?role=farmer" className="btn btn-primary">List Your Produce</Link>
            </div>
          ) : (
            <StaggerGrid className="grid-4">
              {featuredProduce.map((listing) => (
                <FadeUpItem key={listing.id}>
                  <Link to={`/produce/${listing.id}`} style={{ textDecoration: 'none' }}>
                    <motion.div className="card produce-card" whileHover={{ y: -6, boxShadow: 'var(--shadow-card-hover)' }}>
                      <div style={{ height: 180, background: `linear-gradient(135deg, var(--green-light) 0%, #C8E6C9 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', position: 'relative', overflow: 'hidden' }}>
                        {typeof listing.photos?.[0] === 'string' && (listing.photos[0].startsWith('http') || listing.photos[0].startsWith('/') || listing.photos[0].startsWith('data:')) ? (
                          <img
                            src={listing.photos[0]}
                            alt={listing.cropName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement.innerText = listing.emoji || '🌿';
                            }}
                          />
                        ) : (
                          listing.emoji || listing.photos?.[0] || '🌿'
                        )}
                        {listing.organic && <span className="badge badge-green" style={{ position: 'absolute', top: 12, left: 12 }}>🌱 Organic</span>}
                      </div>
                      <div className="card-body" style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div>
                            <h5 style={{ fontFamily: 'var(--font-heading)' }}>{listing.cropName}</h5>
                            <p style={{ fontSize: '0.8125rem', margin: 0 }}>📍 {listing.village || listing.district}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--green-primary)' }}>
                              <span className="notranslate">₹{listing.price}</span><span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>/<span className="notranslate">{listing.unit === 'ton' ? 'kg' : listing.unit || 'kg'}</span></span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className="badge badge-gray notranslate">{listing.qty} {listing.unit || 'ton'}</span>
                          <span className="badge badge-blue notranslate">{listing.grade}</span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </FadeUpItem>
              ))}
            </StaggerGrid>
          )}
        </div>
      </section>

      {/* ACTIVE BUYER DEMANDS / REQUIREMENTS */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="section-label" style={{ background: 'var(--blue-light)', color: 'var(--blue-primary)' }}>Live Exporter RFQs</div>
              <h2>Active Buyer Demands</h2>
            </div>
            <Link to="/demands" className="btn btn-outline">
              View All Demands ({activeRequirements.length}) <ArrowRight size={16} />
            </Link>
          </div>

          {activeRequirements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-page)', borderRadius: 20, border: '1.5px dashed var(--border)' }}>
              <Building2 size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ marginBottom: 8 }}>No Buyer Requirements Yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Verified enterprises will post procurement requirements here.</p>
              <Link to="/register?role=enterprise" className="btn btn-primary">Post Requirement as Buyer</Link>
            </div>
          ) : (
            <StaggerGrid className="grid-3">
              {activeRequirements.slice(0, 3).map((req) => (
                <FadeUpItem key={req.id}>
                  <Link to={`/requirement/${req.id}`} style={{ textDecoration: 'none' }}>
                    <motion.div className="card produce-card" whileHover={{ y: -6, boxShadow: 'var(--shadow-card-hover)' }} style={{ overflow: 'hidden' }}>
                      <div style={{ height: 160, background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.8rem', position: 'relative', overflow: 'hidden' }}>
                        {req.imageUrl || req.image ? (
                          <img
                            src={req.imageUrl || req.image}
                            alt={req.cropName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement.innerText = req.emoji || '🌾';
                            }}
                          />
                        ) : (
                          <span>{req.emoji || '🌾'}</span>
                        )}
                        <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span className="badge badge-blue notranslate" style={{ fontSize: '0.72rem' }}>
                            {req.qty} {req.unit || 'ton'} Needed
                          </span>
                          {req.flag && (
                            <span style={{ background: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 600 }}>
                              {req.flag} {req.destination?.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="card-body" style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div>
                            <h5 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 4px' }}>{req.cropName || req.title}</h5>
                            <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-muted)' }}>📍 {req.deliveryTerms || 'Direct Pickup'}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--green-primary)' }}>
                              ₹{req.targetPrice}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>target / kg</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)', marginTop: 12 }}>
                          <div className="avatar avatar-sm" style={{ background: '#E3F2FD', color: '#1565C0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1rem', width: 32, height: 32, overflow: 'hidden' }}>
                            {typeof req.logo === 'string' && (req.logo.startsWith('data:') || req.logo.startsWith('http') || req.logo.startsWith('/')) ? (
                              <img src={req.logo} alt="Buyer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              req.logo || '🏢'
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {req.enterpriseName}
                            </p>
                            <span style={{ fontSize: '0.7rem', color: 'var(--green-primary)', fontWeight: 600 }}>Verified Buyer ✓</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--blue-primary)', fontWeight: 600 }}>Quote →</span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </FadeUpItem>
              ))}
            </StaggerGrid>
          )}
        </div>
      </section>

      {/* TRUSTED ENTERPRISES */}
      <section className="section" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label">Trusted Partners</div>
            <h2>Verified Export Enterprises</h2>
          </div>
          {enterprises.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: 16 }}>
              <p style={{ color: 'var(--text-muted)' }}>Verified enterprise exporters will be featured here as they join the platform.</p>
              <Link to="/register?role=enterprise" className="btn btn-outline" style={{ marginTop: 12 }}>Register as Enterprise</Link>
            </div>
          ) : (
            <StaggerGrid className="grid-3">
              {enterprises.map(ent => (
                <FadeUpItem key={ent.id}>
                  <Link to={`/enterprises`} style={{ textDecoration: 'none' }}>
                    <motion.div className="card card-body" whileHover={{ y: -6, boxShadow: 'var(--shadow-card-hover)' }}>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
                        <div className="enterprise-logo" style={{ fontSize: '2rem', width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {typeof ent.avatar === 'string' && (ent.avatar.startsWith('data:') || ent.avatar.startsWith('http') || ent.avatar.startsWith('/')) ? (
                            <img src={ent.avatar} alt={ent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            ent.avatar || '🏢'
                          )}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <h5 style={{ fontFamily: 'var(--font-heading)' }}>{ent.name}</h5>
                            <ShieldCheck size={16} color="var(--green-primary)" />
                          </div>
                          <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>Exporter</span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </FadeUpItem>
              ))}
            </StaggerGrid>
          )}
        </div>
      </section>

      {/* WHY US */}
      <section className="section" style={{ background: 'linear-gradient(135deg, var(--green-light) 0%, #F0FAF0 100%)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2>Why <span className="notranslate">AgriExport Connect</span>?</h2>
          </div>
          <div className="grid-3">
            {[
              { icon: <ShieldCheck size={28} color="var(--green-primary)" />, title: 'Verified Only', desc: 'Every farmer and enterprise is manually verified by our admin team before connecting.' },
              { icon: <Globe size={28} color="var(--green-primary)" />, title: 'Reach Abroad', desc: 'Connect with enterprises that export to UAE, UK, Saudi Arabia, USA and 20+ countries.' },
              { icon: <TrendingUp size={28} color="var(--green-primary)" />, title: 'Fair Prices', desc: 'Live mandi price reference on every listing. No middlemen cutting into your margins.' },
            ].map((item, i) => (
              <FadeUpItem key={i} delay={i * 0.1}>
                <div className="card card-body" style={{ textAlign: 'center' }}>
                  <div style={{ width: 60, height: 60, background: '#fff', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: 'var(--shadow-sm)' }}>
                    {item.icon}
                  </div>
                  <h4 style={{ marginBottom: 8 }}>{item.title}</h4>
                  <p style={{ fontSize: '0.875rem' }}>{item.desc}</p>
                </div>
              </FadeUpItem>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background: 'var(--text-primary)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <FadeUpItem>
            <div style={{ fontSize: '3rem', marginBottom: 20 }}>🌾</div>
            <h2 style={{ color: '#fff', marginBottom: 16 }}>
              Ready to grow beyond your village?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.0625rem', marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
              Directly connect with export enterprises across India and abroad with transparent trade contracts.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register?role=farmer" className="btn btn-primary btn-lg">
                🧑‍🌾 Register as Farmer
              </Link>
              <Link to="/register?role=enterprise" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)' }}>
                🏢 Register as Enterprise
              </Link>
            </div>
          </FadeUpItem>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#111827', color: 'rgba(255,255,255,0.6)', padding: '40px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, background: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
                <img src="/logo.png" alt="AgriExport Connect Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <span className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff', fontSize: '1rem' }}>AgriExport<span style={{ color: 'var(--amber)' }}>Connect</span></span>
            </div>
            <p style={{ fontSize: '0.8125rem', margin: 0 }}>Connecting Gujarat farmers to the world</p>
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: '0.875rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to="/about" style={{ color: 'rgba(255,255,255,0.6)' }}>About</Link>
            <Link to="/mandi-prices" style={{ color: 'rgba(255,255,255,0.6)' }}>Mandi Prices</Link>
            <Link to="/about" style={{ color: 'rgba(255,255,255,0.6)' }}>Contact</Link>
            <Link to="/login?role=admin" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8125rem', textDecoration: 'none' }}>Admin</Link>
          </div>
          <p style={{ fontSize: '0.8125rem', margin: 0 }}>Platform only connects parties. Verify DGFT/APEDA rules independently.</p>
        </div>
      </footer>
    </div>
  );
}
