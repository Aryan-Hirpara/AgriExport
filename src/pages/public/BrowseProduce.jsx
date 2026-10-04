import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Search, SlidersHorizontal, MapPin, ShieldCheck, Star, TrendingUp } from 'lucide-react';
import { StaggerGrid, FadeUpItem } from '../../components/common/AnimatedComponents';
import { LISTINGS, FARMERS, CROPS } from '../../data/sampleData';
import { translateTerm } from '../../utils/translationUtils';

const DISTRICTS = ['All Districts', 'Mehsana', 'Rajkot', 'Ahmedabad', 'Junagadh', 'Bhavnagar', 'Surendranagar', 'Patan', 'Banaskantha', 'Surat'];
const SORT_OPTIONS = ['Newest First', 'Price: Low to High', 'Price: High to Low', 'Most Offers'];

export default function BrowseProduce() {
  const { t, lang, produceListings } = useApp();
  const [search, setSearch] = useState('');
  const [activeCropId, setActiveCropId] = useState('all');
  const [activeDistrict, setActiveDistrict] = useState('All Districts');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [exportOnly, setExportOnly] = useState(false);
  const [sortBy, setSortBy] = useState('Newest First');

  const sourceListings = produceListings && produceListings.length > 0 ? produceListings : LISTINGS;
  const allListings = sourceListings.filter(l => l.status === 'active');

  const filtered = useMemo(() => {
    let result = allListings.filter(l => {
      const matchSearch = !search || l.cropName.toLowerCase().includes(search.toLowerCase()) || (l.village || '').toLowerCase().includes(search.toLowerCase()) || (l.district || '').toLowerCase().includes(search.toLowerCase());
      const matchCrop = activeCropId === 'all' || l.crop === activeCropId;
      const matchDistrict = activeDistrict === 'All Districts' || l.district === activeDistrict;
      const matchOrganic = !organicOnly || l.organic;
      const matchExport = !exportOnly || l.exportReady;
      return matchSearch && matchCrop && matchDistrict && matchOrganic && matchExport;
    });
    if (sortBy === 'Price: Low to High') result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === 'Price: High to Low') result = [...result].sort((a, b) => b.price - a.price);
    else if (sortBy === 'Most Offers') result = [...result].sort((a, b) => (b.offers || 0) - (a.offers || 0));
    return result;
  }, [allListings, search, activeCropId, activeDistrict, organicOnly, exportOnly, sortBy]);

  const farmers = FARMERS.reduce((acc, f) => { acc[f.id] = f; return acc; }, {});

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{ background: 'var(--green-primary)', padding: '48px 0 60px' }}>
        <div className="container">
          <FadeUpItem>
            <div className="section-label" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>{t('Browse Produce', 'ઉત્પાદ શોધો')}</div>
            <h2 style={{ color: '#fff', marginBottom: 24 }}>{t('Find produce from Gujarat farmers', 'ગુજરાત ખેડૂતો પાસેથી ઉત્પાદ શોધો')}</h2>
            {/* Search Bar */}
            <div style={{ position: 'relative', maxWidth: 560 }}>
              <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 48, fontSize: '1rem', height: 52 }}
                placeholder={t('Search crop, village, district...', 'પાક, ગામ, જિલ્લો શોધો...')}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </FadeUpItem>
        </div>
      </div>

      <div className="container" style={{ marginTop: -24 }}>
        {/* Filter Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ background: '#fff', borderRadius: 20, padding: '20px 24px', boxShadow: 'var(--shadow-md)', marginBottom: 32 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <SlidersHorizontal size={18} color="var(--text-secondary)" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('Filters', 'ફિલ્ટર')}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                <input type="checkbox" checked={organicOnly} onChange={e => setOrganicOnly(e.target.checked)} style={{ accentColor: 'var(--green-primary)', width: 16, height: 16 }} />
                🌱 {t('Organic Only', 'ઓર્ગેનિક')}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                <input type="checkbox" checked={exportOnly} onChange={e => setExportOnly(e.target.checked)} style={{ accentColor: 'var(--green-primary)', width: 16, height: 16 }} />
                ✈️ {t('Export Ready', 'નિકાસ')}
              </label>
            </div>
          </div>
          {/* All 12 Crops as filter chips */}
          <div className="chip-group" style={{ marginBottom: 12, flexWrap: 'wrap' }}>
            <button className={`chip ${activeCropId === 'all' ? 'active' : ''}`} onClick={() => setActiveCropId('all')}>
              {t('All Crops', 'બધા')}
            </button>
            {CROPS.map(c => (
              <button key={c.id} className={`chip ${activeCropId === c.id ? 'active' : ''}`} onClick={() => setActiveCropId(c.id)}>
                {c.emoji} {lang === 'gu' ? c.guj : c.name}
              </button>
            ))}
          </div>
          <div className="chip-group">
            {DISTRICTS.map(d => (
              <button key={d} className={`chip ${activeDistrict === d ? 'active' : ''}`} onClick={() => setActiveDistrict(d)}>
                {d !== 'All Districts' && '📍 '}{d === 'All Districts' ? t('All Districts', 'બધા જિ.') : d}
              </button>
            ))}
          </div>
        </motion.div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
            <span style={{ color: 'var(--green-primary)', fontWeight: 700 }}>{filtered.length}</span> {t('listings found', 'યાદીઓ મળી')}
            {activeCropId !== 'all' && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: 8 }}>({CROPS.find(c => c.id === activeCropId)?.[lang === 'gu' ? 'guj' : 'name']})</span>}
          </p>
          <select className="form-select" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.875rem' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o} value={o}>{t(o, o)}</option>)}
          </select>
        </div>

        {/* Listing Grid */}
        <StaggerGrid className="grid-auto" style={{ marginBottom: 60 }}>
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-state-icon">🌾</div>
              <h3>{t('No produce found', 'ઉત્પાદ મળ્યું નહીં')}</h3>
              <p>{t('Try adjusting your filters', 'ફિલ્ટર બદલો')}</p>
            </div>
          ) : filtered.map((listing, i) => {
            const farmer = farmers[listing.farmerId] || FARMERS[0];
            return (
              <FadeUpItem key={listing.id} delay={i * 0.04} style={{ height: '100%', display: 'flex' }}>
                <Link to={`/produce/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                  <motion.div className="card produce-card" whileHover={{ y: -6, boxShadow: 'var(--shadow-card-hover)' }} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 200, flexShrink: 0, background: 'linear-gradient(135deg, var(--green-light), #C8E6C9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4.5rem', position: 'relative' }}>
                      {listing.photos[0]}
                      <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 6 }}>
                        {listing.organic && <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>🌱 {t('Organic', 'ઓર્ગેનિક')}</span>}
                        {listing.exportReady && <span className="badge badge-blue" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>✈️ {t('Export', 'નિકાસ')}</span>}
                      </div>
                    </div>
                    <div className="card-body" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: 46, marginBottom: 8 }}>
                        <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                          <h5 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{listing.cropName}</h5>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={12} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{listing.village}, {translateTerm(listing.district, lang)}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--green-primary)' }}>₹{listing.price}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('per kg', 'પ્રતિ કિલો')}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 26, marginBottom: 12 }}>
                        <span className="badge badge-gray">{listing.qty} {translateTerm(listing.unit, lang)}</span>
                        <span className="badge badge-amber">{translateTerm(listing.grade, lang)}</span>
                      </div>
                      {/* Farmer Row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="avatar avatar-sm" style={{ background: 'var(--green-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1rem' }}>
                            {farmer.avatar}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0 }}>
                              {farmer.name}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              {farmer.verified && <ShieldCheck size={12} color="var(--green-primary)" />}
                              <Star size={11} fill="var(--amber)" color="var(--amber)" />
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{farmer.rating}</span>
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{listing.offers} {t('offers', 'ઑફર્સ')}</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </FadeUpItem>
            );
          })}
        </StaggerGrid>
      </div>
    </div>
  );
}
