import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Edit, Trash2, Eye, PlusCircle, X, Check, Save, AlertCircle } from 'lucide-react';
import { CROPS } from '../../data/sampleData';
import { FadeUpItem, StaggerGrid } from '../../components/common/AnimatedComponents';

export default function MyListings() {
  const { t, lang, produceListings, updateProduceListing, deleteProduceListing, addToast } = useApp();
  const [activeTab, setActiveTab] = useState('active');
  const [deleteModal, setDeleteModal] = useState(null);
  const [editListing, setEditListing] = useState(null);
  const [editFormData, setEditFormData] = useState({
    cropName: '',
    price: '',
    qty: '',
    unit: 'ton',
    grade: 'Grade A',
    status: 'active',
    organic: false,
    exportReady: false,
    village: '',
    district: '',
    description: '',
  });

  const listings = produceListings || [];

  const filtered = listings.filter(l => {
    if (activeTab === 'active') return l.status === 'active';
    if (activeTab === 'sold') return l.status === 'sold';
    if (activeTab === 'draft') return l.status === 'draft';
    return true;
  });

  const handleDelete = (id) => {
    deleteProduceListing(id);
    addToast(t('Listing deleted successfully.', 'યાદી સફળતાપૂર્વક ડિલીટ થઈ.'), 'info');
    setDeleteModal(null);
  };

  const handleOpenEdit = (listing) => {
    setEditListing(listing);
    setEditFormData({
      cropName: listing.cropName || '',
      price: listing.price !== undefined ? listing.price : '',
      qty: listing.qty !== undefined ? listing.qty : '',
      unit: listing.unit || 'ton',
      grade: listing.grade || 'Grade A',
      status: listing.status || 'active',
      organic: !!listing.organic,
      exportReady: !!listing.exportReady,
      village: listing.village || 'Unjha',
      district: listing.district || 'Mehsana',
      description: listing.description || '',
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editListing) return;

    const updated = {
      ...editListing,
      cropName: editFormData.cropName,
      price: Number(editFormData.price) || 0,
      qty: Number(editFormData.qty) || 0,
      unit: editFormData.unit,
      grade: editFormData.grade,
      status: editFormData.status,
      organic: editFormData.organic,
      exportReady: editFormData.exportReady,
      village: editFormData.village,
      district: editFormData.district,
      description: editFormData.description,
    };

    updateProduceListing(editListing.id, updated);
    addToast(t('Listing updated successfully! 🎉', 'યાદી સફળતાપૂર્વક અપડેટ થઈ! 🎉'), 'success');
    setEditListing(null);
  };

  const STATUS_COLORS = { active: 'green', sold: 'gray', draft: 'amber' };
  const STATUS_LABELS = { active: t('Active', 'સક્રિય'), sold: t('Sold', 'વેચાયું'), draft: t('Draft', 'ડ્રાફ્ટ') };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: 'var(--green-primary)', padding: '32px 0 48px' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)', margin: 0 }}>{t('My Listings', 'મારી યાદીઓ')}</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: '4px 0 0' }}>{listings.length} {t('total listings', 'કુલ યાદીઓ')}</p>
          </div>
          <Link to="/farmer/add-produce" className="btn btn-amber">
            <PlusCircle size={18} /> {t('Add New', 'નવી ઉમેરો')}
          </Link>
        </div>
      </div>

      <div className="container" style={{ marginTop: -20, paddingBottom: 40 }}>
        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', borderRadius: 20, padding: '8px', boxShadow: 'var(--shadow-md)', marginBottom: 24, display: 'flex', gap: 6 }}>
          {['active', 'sold', 'draft'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', background: activeTab === tab ? 'var(--green-primary)' : 'transparent', color: activeTab === tab ? '#fff' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'var(--font-heading)', transition: 'all 0.2s' }}>
              {STATUS_LABELS[tab]} ({listings.filter(l => l.status === tab).length})
            </button>
          ))}
        </motion.div>

        {/* Listings List */}
        <StaggerGrid style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.length === 0 ? (
            <div className="empty-state card card-body" style={{ background: '#fff' }}>
              <div className="empty-state-icon">🌾</div>
              <h3 style={{ fontFamily: 'var(--font-heading)' }}>{t('No listings here', 'કોઈ યાદી નથી')}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>{t('List your produce to start receiving quotes and export offers from verified buyers.', 'ખરીદદારો પાસેથી ઑફર મેળવવા માટે તમારા ઉત્પાદની યાદી બનાવો.')}</p>
              <Link to="/farmer/add-produce" className="btn btn-primary">+ {t('Add Produce', 'ઉત્પાદ ઉમેરો')}</Link>
            </div>
          ) : filtered.map((listing, i) => (
            <FadeUpItem key={listing.id} delay={i * 0.05}>
              <motion.div className="card card-body" whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }} style={{ border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, var(--green-light), #C8E6C9)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', flexShrink: 0 }}>
                    {listing.photos?.[0] || '🌿'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <h5 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 4px', fontSize: '1.1rem' }}>{listing.cropName}</h5>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className={`badge badge-${STATUS_COLORS[listing.status]}`}>{STATUS_LABELS[listing.status]}</span>
                          {listing.organic && <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>🌱 Organic</span>}
                          {listing.exportReady && <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>✈️ Export Ready</span>}
                          <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>{listing.grade || 'Grade A'}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--green-primary)' }}>₹{listing.price}/kg</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{listing.qty} {listing.unit}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>📍 {listing.village}, {listing.district}</span>
                      {listing.offers > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--amber-light)', borderRadius: 8, padding: '3px 10px' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#B45309' }}>{listing.offers} {t('offers', 'ઑફર')}</span>
                        </div>
                      )}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{listing.posted}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', alignItems: 'center' }}>
                  <Link to={`/produce/${listing.id}`} className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Eye size={15} /> {t('View', 'જુઓ')}
                  </Link>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(listing)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Edit size={15} /> {t('Edit', 'સંપાદન')}
                  </button>
                  <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => setDeleteModal(listing.id)}>
                    <Trash2 size={15} /> {t('Delete', 'ડિલીટ')}
                  </button>
                </div>
              </motion.div>
            </FadeUpItem>
          ))}
        </StaggerGrid>
      </div>

      {/* Edit Listing Modal */}
      <AnimatePresence>
        {editListing && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ zIndex: 1000, overflowY: 'auto', padding: '24px 16px' }}>
            <motion.div
              className="modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              style={{ maxWidth: 580, width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--green-light)', color: 'var(--green-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Edit size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.2rem' }}>{t('Edit Produce Listing', 'ઉત્પાદ યાદી સંપાદિત કરો')}</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: #{editListing.id}</p>
                  </div>
                </div>
                <button onClick={() => setEditListing(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Crop Name */}
                <div className="form-group">
                  <label className="form-label">{t('Crop / Produce Name', 'પાક / ઉત્પાદ નામ')}</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editFormData.cropName}
                    onChange={e => setEditFormData(prev => ({ ...prev, cropName: e.target.value }))}
                    placeholder="e.g. Jeera (Cumin), Kesar Mango..."
                  />
                </div>

                {/* Price & Quantity Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">{t('Price (₹/kg)', 'ભાવ (₹/કિલો)')}</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-input"
                      value={editFormData.price}
                      onChange={e => setEditFormData(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('Quantity', 'જથ્થો')}</label>
                    <input
                      type="number"
                      required
                      min="0.1"
                      step="any"
                      className="form-input"
                      value={editFormData.qty}
                      onChange={e => setEditFormData(prev => ({ ...prev, qty: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('Unit', 'એકમ')}</label>
                    <select
                      className="form-select"
                      value={editFormData.unit}
                      onChange={e => setEditFormData(prev => ({ ...prev, unit: e.target.value }))}
                    >
                      <option value="ton">Ton</option>
                      <option value="quintal">Quintal</option>
                      <option value="kg">kg</option>
                      <option value="bigha">Bigha harvest</option>
                    </select>
                  </div>
                </div>

                {/* Grade & Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">{t('Quality Grade', 'ગુણવત્તા ગ્રેડ')}</label>
                    <select
                      className="form-select"
                      value={editFormData.grade}
                      onChange={e => setEditFormData(prev => ({ ...prev, grade: e.target.value }))}
                    >
                      <option value="Premium">Premium</option>
                      <option value="Grade A">Grade A</option>
                      <option value="Standard">Standard</option>
                      <option value="Medium">Medium</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('Listing Status', 'સ્થિતિ')}</label>
                    <select
                      className="form-select"
                      value={editFormData.status}
                      onChange={e => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="active">Active (Live for Buyers)</option>
                      <option value="draft">Draft (Private)</option>
                      <option value="sold">Sold / Completed</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">{t('Village / Town', 'ગામ / શહેર')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editFormData.village}
                      onChange={e => setEditFormData(prev => ({ ...prev, village: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('District', 'જિલ્લો')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editFormData.district}
                      onChange={e => setEditFormData(prev => ({ ...prev, district: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Badges Toggles */}
                <div style={{ display: 'flex', gap: 20, padding: '12px 14px', background: 'var(--bg-page)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={editFormData.organic}
                      onChange={e => setEditFormData(prev => ({ ...prev, organic: e.target.checked }))}
                      style={{ accentColor: 'var(--green-primary)', width: 18, height: 18 }}
                    />
                    🌱 {t('Organic Certified', 'ઓર્ગેનિક')}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={editFormData.exportReady}
                      onChange={e => setEditFormData(prev => ({ ...prev, exportReady: e.target.checked }))}
                      style={{ accentColor: 'var(--green-primary)', width: 18, height: 18 }}
                    />
                    ✈️ {t('Export Ready', 'નિકાસ રેડી')}
                  </label>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">{t('Description / Notes', 'વર્ણન / વિગત')}</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    value={editFormData.description}
                    onChange={e => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe batch quality, harvest date, packaging..."
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12, marginTop: 8, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditListing(null)}>
                    {t('Cancel', 'રદ')}
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1.5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Save size={16} /> {t('Save Changes', 'ફેરફારો સાચવો')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🗑️</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>{t('Delete Listing?', 'યાદી ડિલીટ?')}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('This action cannot be undone. Any pending offers will be cancelled.', 'આ undo ન થઈ શકે. ઑફર રદ થશે.')}</p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost btn-full" onClick={() => setDeleteModal(null)}>{t('Cancel', 'રદ')}</button>
                <button className="btn btn-danger btn-full" onClick={() => handleDelete(deleteModal)}>{t('Yes, Delete', 'હા, ડિલીટ')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
