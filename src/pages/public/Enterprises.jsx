import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Star, Globe, Search, MessageSquare } from 'lucide-react';
import { ENTERPRISES } from '../../data/sampleData';
import { FadeUpItem, StaggerGrid, StarRating } from '../../components/common/AnimatedComponents';
import { translateTerm } from '../../utils/translationUtils';

const TYPE_FILTERS = ['All', 'Exporter', 'Importer', 'Trader'];
const COUNTRY_FILTERS = ['All Countries', 'UAE', 'UK', 'USA', 'Germany', 'Canada'];

export default function Enterprises() {
  const { t, lang } = useApp();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [country, setCountry] = useState('All Countries');
  const [selected, setSelected] = useState(null);

  const filtered = ENTERPRISES.filter(e => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase());
    const matchType = type === 'All' || e.type === type;
    const matchCountry = country === 'All Countries' || e.countries.includes(country);
    return matchSearch && matchType && matchCountry;
  });

  const selectedEnt = selected ? ENTERPRISES.find(e => e.id === selected) : null;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ background: 'var(--green-primary)', padding: '48px 0 60px' }}>
        <div className="container">
          <FadeUpItem>
            <div className="section-label" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>{t('Enterprise Directory', 'ઉદ્યોગ ડિરેક્ટ્રી')}</div>
            <h2 style={{ color: '#fff', marginBottom: 24 }}>{t('Verified Import/Export Enterprises', 'ચકાસાયેલ આયાત/નિકાસ ઉદ્યોગો')}</h2>
            <div style={{ position: 'relative', maxWidth: 480 }}>
              <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input className="form-input" style={{ paddingLeft: 48, height: 52 }} placeholder={t('Search enterprise name...', 'ઉદ્યોગ નામ શોધો...')} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </FadeUpItem>
        </div>
      </div>

      <div className="container" style={{ marginTop: -24 }}>
        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', borderRadius: 20, padding: '20px 24px', boxShadow: 'var(--shadow-md)', marginBottom: 32 }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)', marginRight: 12 }}>{t('Type:', 'પ્રકાર:')}</span>
            <div className="chip-group" style={{ display: 'inline-flex' }}>
              {TYPE_FILTERS.map(f => (
                <button key={f} className={`chip ${type === f ? 'active' : ''}`} onClick={() => setType(f)}>
                  {translateTerm(f, lang)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)', marginRight: 12 }}>{t('Country:', 'દેશ:')}</span>
            <div className="chip-group" style={{ display: 'inline-flex' }}>
              {COUNTRY_FILTERS.map(c => (
                <button key={c} className={`chip ${country === c ? 'active' : ''}`} onClick={() => setCountry(c)}>
                  {translateTerm(c, lang)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedEnt ? '1fr 1fr' : '1fr', gap: 32 }}>
          {/* Enterprise List */}
          <div>
            <StaggerGrid className="grid-auto">
              {filtered.map((ent, i) => (
                <FadeUpItem key={ent.id} delay={i * 0.06}>
                  <motion.div
                    className="card card-body"
                    whileHover={{ y: -4, boxShadow: 'var(--shadow-card-hover)' }}
                    onClick={() => setSelected(ent.id === selected ? null : ent.id)}
                    style={{ cursor: 'pointer', border: selected === ent.id ? '2px solid var(--green-primary)' : '1px solid var(--border)' }}
                  >
                    <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                      <div className="enterprise-logo">{ent.logo}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <h5 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '0.95rem' }}>{ent.name}</h5>
                          {ent.verified && <ShieldCheck size={15} color="var(--green-primary)" />}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{translateTerm(ent.type, lang)}</span>
                          <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>📍 {translateTerm(ent.city, lang)}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                      {ent.flags.map((f, j) => <span key={j} style={{ fontSize: '1.25rem' }}>{f}</span>)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Star size={14} fill="var(--amber)" color="var(--amber)" />
                        <strong style={{ fontSize: '0.875rem' }}>{ent.rating}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({ent.reviews} {t('reviews', 'સમીક્ષાઓ')})</span>
                      </div>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{t('Min:', 'ન્યૂનતમ:')} {ent.minOrder}</span>
                    </div>
                  </motion.div>
                </FadeUpItem>
              ))}
            </StaggerGrid>
          </div>

          {/* Enterprise Detail Panel */}
          {selectedEnt && (
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{ position: 'sticky', top: 88, height: 'fit-content' }}
            >
              <div className="card card-body">
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
                  <div className="enterprise-logo" style={{ width: 72, height: 72, fontSize: '2.5rem' }}>{selectedEnt.logo}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>{selectedEnt.name}</h3>
                      {selectedEnt.verified && <ShieldCheck size={20} color="var(--green-primary)" />}
                    </div>
                    <span className="badge badge-blue">{translateTerm(selectedEnt.type, lang)}</span>
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <StarRating rating={selectedEnt.rating} />
                      <strong>{selectedEnt.rating}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>({selectedEnt.reviews} {t('reviews', 'સમીક્ષાઓ')})</span>
                    </div>
                  </div>
                </div>

                <div className="divider" />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                  <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{t('Crops Handled', 'સંચાલિત પાક')}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {selectedEnt.crops.map(c => <span key={c} className="badge badge-green">{translateTerm(c, lang)}</span>)}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{t('Countries Served', 'સેવા આપેલ દેશો')}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {selectedEnt.countries.map((c, i) => (
                        <div key={i} className="flag-chip">
                          <span>{selectedEnt.flags[i] || '🌐'}</span>
                          <span>{translateTerm(c, lang)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ background: 'var(--bg-page)', borderRadius: 10, padding: 14 }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: 600 }}>{t('Min. Order', 'ન્યૂનતમ ઓર્ડર')}</p>
                      <p style={{ fontWeight: 700, margin: 0 }}>{selectedEnt.minOrder}</p>
                    </div>
                    <div style={{ background: 'var(--bg-page)', borderRadius: 10, padding: 14 }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: 600 }}>{t('Established', 'સ્થાપના')}</p>
                      <p style={{ fontWeight: 700, margin: 0 }}>{selectedEnt.since}</p>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: 600 }}>GST</p>
                    <p style={{ fontWeight: 600, fontFamily: 'monospace', margin: 0, color: 'var(--text-primary)' }}>{selectedEnt.gst}</p>
                  </div>
                </div>

                <Link to="/browse" className="btn btn-primary btn-full">
                  <MessageSquare size={18} /> {t('Browse & Send Inquiry', 'ઉત્પાદ જોઈ ઇન્ક્વાયરી')}
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
