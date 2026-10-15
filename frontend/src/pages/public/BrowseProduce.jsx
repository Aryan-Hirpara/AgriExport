import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Search, SlidersHorizontal, MapPin, ShieldCheck, Star } from 'lucide-react';
import { StaggerGrid, FadeUpItem } from '../../components/common/AnimatedComponents';

const DISTRICTS = ['All Districts', 'Mehsana', 'Rajkot', 'Ahmedabad', 'Junagadh', 'Bhavnagar', 'Surendranagar', 'Patan', 'Banaskantha', 'Surat'];
const SORT_OPTIONS = ['Newest First', 'Price: Low to High', 'Price: High to Low', 'Most Offers'];

const POPULAR_CROPS = [
  { slug: 'groundnut', name: 'Groundnut', emoji: '🥜' },
  { slug: 'jeera', name: 'Jeera (Cumin)', emoji: '🌿' },
  { slug: 'cotton', name: 'Cotton', emoji: '🌸' },
  { slug: 'sesame', name: 'Sesame (Til)', emoji: '🌱' },
  { slug: 'kesar-mango', name: 'Kesar Mango', emoji: '🥭' },
  { slug: 'isabgol', name: 'Isabgol (Psyllium)', emoji: '🌾' },
];

export default function BrowseProduce() {
  const { produceListings, crops = [] } = useApp();
  const [search, setSearch] = useState('');
  const [activeCropId, setActiveCropId] = useState('all');
  const [activeDistrict, setActiveDistrict] = useState('All Districts');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [exportOnly, setExportOnly] = useState(false);
  const [sortBy, setSortBy] = useState('Newest First');

  const allListings = (produceListings || []).filter(l => l.status === 'active');

  const filtered = useMemo(() => {
    let result = allListings.filter(l => {
      const cropName = l.cropName || l.title || '';
      const village = l.village || l.location_village || '';
      const district = l.district || l.location_district || '';
      const matchSearch = !search ||
        cropName.toLowerCase().includes(search.toLowerCase()) ||
        village.toLowerCase().includes(search.toLowerCase()) ||
        district.toLowerCase().includes(search.toLowerCase());
      const matchCrop = activeCropId === 'all' || 
        l.crop === activeCropId || 
        cropName.toLowerCase().includes(activeCropId.toLowerCase()) ||
        (activeCropId === 'jeera' && cropName.toLowerCase().includes('cumin')) ||
        (activeCropId === 'sesame' && cropName.toLowerCase().includes('til')) ||
        (activeCropId === 'isabgol' && cropName.toLowerCase().includes('psyllium'));
      const matchDistrict = activeDistrict === 'All Districts' || district === activeDistrict;
      const matchOrganic = !organicOnly || l.organic;
      const matchExport = !exportOnly || l.exportReady;
      return matchSearch && matchCrop && matchDistrict && matchOrganic && matchExport;
    });
    if (sortBy === 'Price: Low to High') result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === 'Price: High to Low') result = [...result].sort((a, b) => b.price - a.price);
    else if (sortBy === 'Most Offers') result = [...result].sort((a, b) => (b.offers || 0) - (a.offers || 0));
    return result;
  }, [allListings, search, activeCropId, activeDistrict, organicOnly, exportOnly, sortBy]);

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{ background: 'var(--green-primary)', padding: '48px 0 60px' }}>
        <div className="container">
          <FadeUpItem>
            <div className="section-label" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>Browse Produce</div>
            <h2 style={{ color: '#fff', marginBottom: 24 }}>Find produce from Gujarat farmers</h2>
            {/* Search Bar */}
            <div style={{ position: 'relative', maxWidth: 560 }}>
              <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 48, fontSize: '1rem', height: 52 }}
                placeholder="Search crop, village, district..."
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
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Popular Crops & Filters</span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                <input type="checkbox" checked={organicOnly} onChange={e => setOrganicOnly(e.target.checked)} style={{ accentColor: 'var(--green-primary)', width: 16, height: 16 }} />
                🌱 Organic Only
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                <input type="checkbox" checked={exportOnly} onChange={e => setExportOnly(e.target.checked)} style={{ accentColor: 'var(--green-primary)', width: 16, height: 16 }} />
                ✈️ Export Ready
              </label>
            </div>
          </div>
          {/* Popular 6 Crops as filter chips */}
          <div className="chip-group" style={{ marginBottom: 12, flexWrap: 'wrap' }}>
            <button className={`chip ${activeCropId === 'all' ? 'active' : ''}`} onClick={() => setActiveCropId('all')}>
              All Crops
            </button>
            {POPULAR_CROPS.map(c => (
              <button key={c.slug} className={`chip ${activeCropId === c.slug ? 'active' : ''}`} onClick={() => setActiveCropId(c.slug)}>
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
          <div className="chip-group">
            {DISTRICTS.map(d => (
              <button key={d} className={`chip ${activeDistrict === d ? 'active' : ''}`} onClick={() => setActiveDistrict(d)}>
                {d !== 'All Districts' && '📍 '}{d}
              </button>
            ))}
          </div>
        </motion.div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
            <span className="notranslate" style={{ color: 'var(--green-primary)', fontWeight: 700 }}>{filtered.length}</span> listings found
            {activeCropId !== 'all' && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: 8 }}>
                ({POPULAR_CROPS.find(c => c.slug === activeCropId)?.name || activeCropId})
              </span>
            )}
          </p>
          <select className="form-select" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.875rem' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {/* Listing Grid */}
        <StaggerGrid className="grid-auto" style={{ marginBottom: 60 }}>
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 16, border: '1px solid var(--border)' }}>
              <div className="empty-state-icon" style={{ fontSize: '3rem', marginBottom: 12 }}>🌾</div>
              <h3 style={{ marginBottom: 8 }}>No produce listings currently available</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto 20px' }}>
                {search || activeCropId !== 'all' || activeDistrict !== 'All Districts'
                  ? 'Try clearing or changing your filters to see more listings.'
                  : 'Start fresh by listing your farm harvest. Register as a farmer to post real produce listings.'}
              </p>
              <Link to="/register" className="btn btn-primary">
                Post Your Produce
              </Link>
            </div>
          ) : filtered.map((listing, i) => {
            const farmer = listing.farmer || {
              name: 'Gujarat Farmer',
              avatar: '🧑‍🌾',
              rating: 5.0,
              verified: true,
            };
            const firstPhoto = listing.photos?.[0] || '🌾';
            const isPhotoUrl = typeof firstPhoto === 'string' && (firstPhoto.startsWith('http') || firstPhoto.startsWith('/') || firstPhoto.startsWith('data:'));

            return (
              <FadeUpItem key={listing.id} delay={i * 0.04} style={{ height: '100%', display: 'flex' }}>
                <Link to={`/produce/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                  <motion.div className="card produce-card" whileHover={{ y: -6, boxShadow: 'var(--shadow-card-hover)' }} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 200, flexShrink: 0, background: 'linear-gradient(135deg, var(--green-light), #C8E6C9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4.5rem', position: 'relative', overflow: 'hidden' }}>
                      {isPhotoUrl ? (
                        <img
                          src={firstPhoto}
                          alt={listing.cropName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement.innerText = listing.emoji || '🌾';
                          }}
                        />
                      ) : (
                        listing.emoji || firstPhoto
                      )}
                      <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 6 }}>
                        {listing.organic && <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>🌱 Organic</span>}
                        {listing.exportReady && <span className="badge badge-blue" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>✈️ Export</span>}
                      </div>
                    </div>
                    <div className="card-body" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: 46, marginBottom: 8 }}>
                        <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                          <h5 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{listing.cropName}</h5>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={12} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{listing.village}, {listing.district}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--green-primary)' }}>₹{listing.price}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>per {listing.unit === 'ton' ? 'kg' : listing.unit || 'kg'}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 26, marginBottom: 12 }}>
                        <span className="badge badge-gray notranslate">{listing.qty} {listing.unit}</span>
                        {listing.grade && <span className="badge badge-amber notranslate">{listing.grade}</span>}
                      </div>
                      {/* Farmer Row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="avatar avatar-sm" style={{ background: 'var(--green-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1rem', width: 32, height: 32, overflow: 'hidden' }}>
                            {typeof farmer.avatar === 'string' && (farmer.avatar.startsWith('data:') || farmer.avatar.startsWith('http') || farmer.avatar.startsWith('/')) ? (
                              <img src={farmer.avatar} alt={farmer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              farmer.avatar || '🧑‍🌾'
                            )}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0 }}>
                              {farmer.name}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              {farmer.verified && <ShieldCheck size={12} color="var(--green-primary)" />}
                              <Star size={11} fill="var(--amber)" color="var(--amber)" />
                              <span className="notranslate" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{farmer.rating || 5.0}</span>
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}><span className="notranslate">{listing.offers || 0}</span> offers</span>
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
