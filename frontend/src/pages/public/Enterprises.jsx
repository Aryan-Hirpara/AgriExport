import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Star, Search, MessageSquare } from 'lucide-react';
import { FadeUpItem, StaggerGrid, StarRating } from '../../components/common/AnimatedComponents';
import Avatar from '../../components/common/Avatar';
import api from '../../services/api';

const TYPE_FILTERS = ['All', 'Exporter', 'Importer', 'Trader', 'Processor'];
const COUNTRY_FILTERS = ['All Countries', 'UAE', 'Saudi Arabia', 'India', 'USA', 'UK', 'Vietnam'];

export default function Enterprises() {
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [country, setCountry] = useState('All Countries');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.enterprises.getAll()
      .then(res => {
        if (res.data) setEnterprises(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = enterprises.filter(e => {
    const matchSearch = !search || (e.name || '').toLowerCase().includes(search.toLowerCase()) || (e.city || '').toLowerCase().includes(search.toLowerCase());
    const matchType = type === 'All' || (e.type || '').toLowerCase() === type.toLowerCase();
    const matchCountry = country === 'All Countries' || (e.countries && e.countries.includes(country));
    return matchSearch && matchType && matchCountry;
  });

  const selectedEnt = selected ? enterprises.find(e => e.id === selected) : null;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ background: 'var(--green-primary)', padding: '48px 0 60px' }}>
        <div className="container">
          <FadeUpItem>
            <div className="section-label" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>Enterprise Directory</div>
            <h2 style={{ color: '#fff', marginBottom: 24 }}>Verified Import/Export Enterprises</h2>
            <div style={{ position: 'relative', maxWidth: 480 }}>
              <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input className="form-input" style={{ paddingLeft: 48, height: 52 }} placeholder="Search enterprise name, city..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </FadeUpItem>
        </div>
      </div>

      <div className="container" style={{ marginTop: -24 }}>
        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', borderRadius: 20, padding: '20px 24px', boxShadow: 'var(--shadow-md)', marginBottom: 32 }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)', marginRight: 12 }}>Type:</span>
            <div className="chip-group" style={{ display: 'inline-flex' }}>
              {TYPE_FILTERS.map(f => (
                <button key={f} className={`chip ${type === f ? 'active' : ''}`} onClick={() => setType(f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)', marginRight: 12 }}>Country:</span>
            <div className="chip-group" style={{ display: 'inline-flex' }}>
              {COUNTRY_FILTERS.map(c => (
                <button key={c} className={`chip ${country === c ? 'active' : ''}`} onClick={() => setCountry(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Loading enterprise directory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card card-body" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 16, marginBottom: 60 }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏢</div>
            <h3>No Enterprises Found</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto 20px' }}>
              {search || type !== 'All' || country !== 'All Countries'
                ? 'Try clearing your filters to see more enterprises.'
                : 'No export houses registered yet. Register as an enterprise to be listed in the global directory.'}
            </p>
            <Link to="/register" className="btn btn-primary">
              Register Your Enterprise
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selectedEnt ? '1fr 1fr' : '1fr', gap: 32, marginBottom: 60 }}>
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
                        <Avatar src={ent.logo || ent.avatar} alt={ent.name} size={48} borderRadius={12} fallback="🏢" />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <h5 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '0.95rem' }}>{ent.name}</h5>
                            {ent.verified && <ShieldCheck size={15} color="var(--green-primary)" />}
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{ent.type}</span>
                            <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>📍 {ent.city}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                        {(ent.flags || ['🇮🇳']).map((f, j) => <span key={j} style={{ fontSize: '1.25rem' }}>{f}</span>)}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Star size={14} fill="var(--amber)" color="var(--amber)" />
                          <strong className="notranslate" style={{ fontSize: '0.875rem' }}>{ent.rating}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(<span className="notranslate">{ent.reviews}</span> reviews)</span>
                        </div>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Min: <span className="notranslate">{ent.minOrder}</span></span>
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
                    <Avatar src={selectedEnt.logo || selectedEnt.avatar} alt={selectedEnt.name} size={72} borderRadius={16} fallback="🏢" />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>{selectedEnt.name}</h3>
                        {selectedEnt.verified && <ShieldCheck size={20} color="var(--green-primary)" />}
                      </div>
                      <span className="badge badge-blue">{selectedEnt.type}</span>
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <StarRating rating={selectedEnt.rating} />
                        <strong className="notranslate">{selectedEnt.rating}</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>(<span className="notranslate">{selectedEnt.reviews}</span> reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="divider" style={{ margin: '16px 0', borderTop: '1px solid var(--border)' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                    <div>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Countries Served</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {(selectedEnt.countries || []).map((c, i) => (
                          <div key={i} className="flag-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-page)', padding: '4px 10px', borderRadius: 20, fontSize: '0.85rem' }}>
                            <span>{selectedEnt.flags?.[i] || '🌐'}</span>
                            <span>{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={{ background: 'var(--bg-page)', borderRadius: 10, padding: 14 }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: 600 }}>Min. Order</p>
                        <p className="notranslate" style={{ fontWeight: 700, margin: 0 }}>{selectedEnt.minOrder}</p>
                      </div>
                      <div style={{ background: 'var(--bg-page)', borderRadius: 10, padding: 14 }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: 600 }}>Location</p>
                        <p className="notranslate" style={{ fontWeight: 700, margin: 0 }}>{selectedEnt.city}</p>
                      </div>
                    </div>
                    {selectedEnt.gst && (
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: 600 }}>GST</p>
                        <p className="notranslate" style={{ fontWeight: 600, fontFamily: 'monospace', margin: 0, color: 'var(--text-primary)' }}>{selectedEnt.gst}</p>
                      </div>
                    )}
                  </div>

                  <Link to="/browse" className="btn btn-primary btn-full">
                    <MessageSquare size={18} /> Browse & Send Inquiry
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
