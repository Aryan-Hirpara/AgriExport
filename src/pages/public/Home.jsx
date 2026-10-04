import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { ArrowRight, ShieldCheck, Globe, TrendingUp, Users, Sprout, Star, CheckCircle } from 'lucide-react';
import { CountUp, FadeUpItem, StaggerGrid } from '../../components/common/AnimatedComponents';
import { LIVE_COUNTERS, LISTINGS, ENTERPRISES, CROPS } from '../../data/sampleData';
import { translateTerm } from '../../utils/translationUtils';

const HOW_IT_WORKS = [
  { step: 1, icon: '📝', title: 'Register & Verify', desc: 'Create your account. Admin verifies your documents within 48 hours.' },
  { step: 2, icon: '📦', title: 'List Your Produce', desc: 'Add crop details, photos, quantity, price and export preferences.' },
  { step: 3, icon: '🤝', title: 'Receive Offers', desc: 'Verified enterprises send you offers. Chat, counter, and agree on terms.' },
  { step: 4, icon: '✅', title: 'Track Your Deal', desc: 'Follow the deal timeline. Rate the enterprise after completion.' },
];

const FEATURED_PRODUCE = LISTINGS.filter(l => l.status === 'active').slice(0, 4);
const FEATURED_ENTERPRISES = ENTERPRISES.slice(0, 3);

export default function Home() {
  const { t, lang } = useApp();

  return (
    <div className="page-wrapper">
      {/* HERO */}
      <section className="hero" style={{ padding: '100px 0 120px' }}>
        <div className="hero-pattern" />
        <div className="container hero-content">
          <StaggerGrid>
            <FadeUpItem>
              <div className="section-label" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(8px)' }}>
                🌿 {t('Gujarat Agri Platform', 'ગુજરાત એગ્રી પ્લૅટફોર્મ')}
              </div>
            </FadeUpItem>
            <FadeUpItem>
              <h1 style={{ color: '#fff', marginBottom: 20, maxWidth: 640, lineHeight: 1.15 }}>
                Sell your harvest <span style={{ color: '#FBD959' }}>beyond your village</span>
              </h1>
            </FadeUpItem>
            <FadeUpItem>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.125rem', maxWidth: 520, marginBottom: 40, lineHeight: 1.7 }}>
                {t(
                  'Connect directly with verified import/export enterprises across India and abroad. No middlemen. Fair prices. Transparent deals.',
                  'ભારત અને વિદેશના ચકાસાયેલ ઉદ્યોગો સાથે સીધા જોડાઓ. કોઈ દલાલ નહીં. ઉચિત ભાવ. પારદર્શક સોદા.'
                )}
              </p>
            </FadeUpItem>
            <FadeUpItem>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Link to="/register?role=farmer" className="btn btn-amber btn-lg">
                  🧑‍🌾 {t("I'm a Farmer", 'હું ખેડૂત છું')}
                  <ArrowRight size={18} />
                </Link>
                <Link to="/register?role=enterprise" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(255,255,255,0.3)' }}>
                  🏢 {t("I'm an Enterprise", 'હું ઉદ્યોગ છું')}
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
            {LIVE_COUNTERS.map((c, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', color: '#FBD959' }}>
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
            <div className="section-label">{t('How It Works', 'કેવી રીતે કામ કરે છે')}</div>
            <h2>{t('Four steps to your first deal', 'પ્રથમ સોદા સુધી ચાર પગલાં')}</h2>
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
              <div className="section-label">{t('Fresh Listings', 'તાજી યાદીઓ')}</div>
              <h2>{t('Featured Produce', 'ફીચર્ડ ઉત્પાદ')}</h2>
            </div>
            <Link to="/browse" className="btn btn-outline">{t('View All', 'બધું જુઓ')} <ArrowRight size={16} /></Link>
          </div>
          <StaggerGrid className="grid-4">
            {FEATURED_PRODUCE.map((listing) => (
              <FadeUpItem key={listing.id}>
                <Link to={`/produce/${listing.id}`} style={{ textDecoration: 'none' }}>
                  <motion.div className="card produce-card" whileHover={{ y: -6, boxShadow: 'var(--shadow-card-hover)' }}>
                    <div style={{ height: 180, background: `linear-gradient(135deg, var(--green-light) 0%, #C8E6C9 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', position: 'relative' }}>
                      {listing.photos[0]}
                      <button className="heart-btn" onClick={e => e.preventDefault()}>❤️</button>
                      {listing.organic && <span className="badge badge-green" style={{ position: 'absolute', top: 12, left: 12 }}>🌱 {t('Organic', 'ઓર્ગેનિક')}</span>}
                    </div>
                    <div className="card-body" style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <h5 style={{ fontFamily: 'var(--font-heading)' }}>{listing.cropName}</h5>
                          <p style={{ fontSize: '0.8125rem', margin: 0 }}>📍 {listing.village}, {translateTerm(listing.district, lang)}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--green-primary)' }}>
                            ₹{listing.price}<span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>/{t('kg', 'કિલો')}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className="badge badge-gray">{listing.qty} {translateTerm(listing.unit, lang)}</span>
                        <span className="badge badge-blue">{translateTerm(listing.grade, lang)}</span>
                        {listing.exportReady && <span className="badge badge-green">✈️ {t('Export Ready', 'નિકાસ રેડી')}</span>}
                      </div>
                      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ShieldCheck size={14} color="var(--green-primary)" />
                          <span style={{ fontSize: '0.75rem', color: 'var(--green-primary)', fontWeight: 600 }}>{t('Verified Farmer', 'ચકાસાયેલ ખેડૂત')}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{listing.offers} {t('offers', 'ઑફર્સ')}</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </FadeUpItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* TRUSTED ENTERPRISES */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label">{t('Trusted Partners', 'વિશ્વસ્ત ભાગીદારો')}</div>
            <h2>{t('Verified Export Enterprises', 'ચકાસાયેલ નિકાસ ઉદ્યોગો')}</h2>
          </div>
          <StaggerGrid className="grid-3">
            {FEATURED_ENTERPRISES.map(ent => (
              <FadeUpItem key={ent.id}>
                <Link to={`/enterprises`} style={{ textDecoration: 'none' }}>
                  <motion.div className="card card-body" whileHover={{ y: -6, boxShadow: 'var(--shadow-card-hover)' }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
                      <div className="enterprise-logo" style={{ fontSize: '2rem' }}>{ent.logo}</div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <h5 style={{ fontFamily: 'var(--font-heading)' }}>{ent.name}</h5>
                          <ShieldCheck size={16} color="var(--green-primary)" />
                        </div>
                        <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{ent.type}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                      {ent.flags.map((f, i) => <span key={i} style={{ fontSize: '1.25rem' }}>{f}</span>)}
                    </div>
                    <p style={{ fontSize: '0.8125rem', marginBottom: 12 }}>Min. Order: <strong style={{ color: 'var(--text-primary)' }}>{ent.minOrder}</strong></p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Star size={14} fill="var(--amber)" color="var(--amber)" />
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{ent.rating}</strong>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>({ent.reviews} reviews)</span>
                    </div>
                  </motion.div>
                </Link>
              </FadeUpItem>
            ))}
          </StaggerGrid>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/enterprises" className="btn btn-outline btn-lg">{t('View All Enterprises', 'બધા ઉદ્યોગો જુઓ')} <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="section" style={{ background: 'linear-gradient(135deg, var(--green-light) 0%, #F0FAF0 100%)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2>{t('Why AgriExport Connect?', 'AgriExport Connect કેમ?')}</h2>
          </div>
          <div className="grid-3">
            {[
              { icon: <ShieldCheck size={28} color="var(--green-primary)" />, title: t('Verified Only', 'માત્ર ચકાસાયેલ'), desc: t('Every farmer and enterprise is manually verified by our admin team before connecting.', 'દરેક ખેડૂત અને ઉદ્યોગ અમારી ટીમ દ્વારા ચકાસવામાં આવે છે.') },
              { icon: <Globe size={28} color="var(--green-primary)" />, title: t('Reach Abroad', 'વિદેશ સુધી પહોંચો'), desc: t('Connect with enterprises that export to UAE, UK, Saudi Arabia, USA and 20+ countries.', 'UAE, UK, સઉદી અરેબિયા, USA અને 20+ દેશોમાં નિકાસ કરતા ઉદ્યોગો સાથે જોડાઓ.') },
              { icon: <TrendingUp size={28} color="var(--green-primary)" />, title: t('Fair Prices', 'ઉચિત ભાવ'), desc: t('Live mandi price reference on every listing. No middlemen cutting into your margins.', 'દરેક યાદી પર લાઇવ મંડી ભાવ. કોઈ દલાલ તમારો નફો ઓછો કરતો નથી.') },
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
              {t('Ready to grow beyond your village?', 'ગામ ઉપરાંત વધવા તૈયાર?')}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.0625rem', marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
              {t('Join 1,284 farmers already selling their produce to enterprises across India and abroad.', '1,284 ખેડૂતો સાથે જોડાઓ જે ભારત અને વિદેશમાં ઉત્પાદ વેચી રહ્યા છે.')}
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register?role=farmer" className="btn btn-primary btn-lg">
                🧑‍🌾 {t('Register as Farmer', 'ખેડૂત તરીકે નોંધો')}
              </Link>
              <Link to="/register?role=enterprise" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)' }}>
                🏢 {t('Register as Enterprise', 'ઉદ્યોગ તરીકે નોંધો')}
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
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff', fontSize: '1rem' }}>AgriExport<span style={{ color: 'var(--amber)' }}>Connect</span></span>
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
