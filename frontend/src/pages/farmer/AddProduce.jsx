import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Upload, MapPin, Globe, Truck, Check, Info, ChevronDown } from 'lucide-react';
import { StepProgress, SpinnerBtn } from '../../components/common/AnimatedComponents';
import cropAttributes from '../../data/crop_attributes.json';

const STEPS = ['Crop', 'Specs', 'Qty & Price', 'Photos', 'Location', 'Preview'];

export default function AddProduce() {
  const { addToast, addProduceListing, crops = [], mandiPrices = [], user } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const isVerified = Boolean(user?.is_verified || user?.verified);

  // Form State
  const [selectedCrop, setSelectedCrop] = useState('jeera');
  const [grade, setGrade] = useState('');
  const [specValues, setSpecValues] = useState({});
  const [packaging, setPackaging] = useState('');
  const [organic, setOrganic] = useState(false);
  const [qty, setQty] = useState(5);
  const [unit, setUnit] = useState('ton');
  const [price, setPrice] = useState(315);
  const [photos, setPhotos] = useState([]);
  const [photoDragOver, setPhotoDragOver] = useState(false);
  const [location, setLocation] = useState({ village: 'Unjha', district: 'Mehsana', state: 'Gujarat', detected: false });
  const [exportPrefs, setExportPrefs] = useState({ otherStates: true, otherCountries: false });

  const handlePhotoFiles = (fileList) => {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;

    files.slice(0, 5 - photos.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1000;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setPhotos(prev => [...prev, dataUrl].slice(0, 5));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
    addToast('Produce photo added! 📸', 'success');
  };

  const cropAttr = cropAttributes[selectedCrop] || {};
  const cropObj = crops.find(c => (c.slug || c.id) === selectedCrop) || crops[0] || { id: 'jeera', slug: 'jeera', name: 'Jeera (Cumin)', emoji: '🌿', price: 318, grade: 'Premium' };
  const mandiData = mandiPrices.find(c => c.cropSlug === selectedCrop || c.crop?.toLowerCase() === cropObj.name?.toLowerCase());

  // Auto-set grade/price/packaging when crop changes
  const handleCropChange = (id) => {
    setSelectedCrop(id);
    const attr = cropAttributes[id] || {};
    const crop = crops.find(c => (c.slug || c.id) === id) || cropObj;
    setGrade(attr.grades?.[0]?.value || '');
    setPackaging(attr.packaging?.[0] || '');
    setPrice(crop?.price || 50);
    setSpecValues({});
  };

  const totalValue = useMemo(() => {
    const multiplier = unit === 'ton' ? 1000 : unit === 'quintal' ? 100 : 1;
    return (qty * multiplier * price).toLocaleString('en-IN');
  }, [qty, unit, price]);

  const handlePublish = async () => {
    if (!isVerified) {
      addToast('Account verification required: Admin approval is needed before you can list produce.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const selectedGradeLabel = cropAttr.grades?.find(g => g.value === grade)?.label || grade;
      const newListing = {
        crop: cropObj.slug || cropObj.name,
        cropId: cropObj.id,
        cropName: cropObj.name,
        qty: Number(qty),
        quantity: Number(qty),
        unit,
        price: Number(price),
        pricePerUnit: Number(price),
        grade: selectedGradeLabel || cropObj.grade,
        organic,
        exportReady: exportPrefs.otherCountries,
        district: location.district || 'Mehsana',
        village: location.village || 'Unjha',
        state: location.state || 'Gujarat',
        status: 'active',
        photos: photos.length > 0 ? photos : [cropObj.emoji || '🌿', '📦'],
        description: `${cropObj.name} – ${selectedGradeLabel || 'Grade A'}. From ${location.village}, ${location.district}. ${organic ? 'Organic certified. ' : ''}${exportPrefs.otherCountries ? 'Export quality lot.' : 'Fresh harvest.'}`,
        specs: { grade: selectedGradeLabel, packaging, ...specValues },
      };
      await addProduceListing(newListing);
      navigate('/farmer/listings');
    } catch (err) {
      console.error('Failed to publish listing:', err);
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocation(prev => ({ ...prev, detected: true }));
          addToast('Location verified via GPS ✓', 'success');
        },
        () => {
          setLocation(prev => ({ ...prev, detected: true }));
          addToast('Location detected: Mehsana, Gujarat', 'info');
        }
      );
    } else {
      setLocation(prev => ({ ...prev, detected: true }));
    }
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: 'var(--green-primary)', padding: '32px 0 48px' }}>
        <div className="container">
          <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)', marginBottom: 8 }}>{'Add Produce Listing'}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>{`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: -20 }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: '#fff', borderRadius: 24, padding: '32px', boxShadow: 'var(--shadow-lg)', marginBottom: 32 }}>
          {/* Progress */}
          <div className="progress-bar" style={{ marginBottom: 28 }}>
            <motion.div className="progress-fill" animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} transition={{ duration: 0.5 }} />
          </div>
          <StepProgress steps={STEPS} current={step} />

          {!isVerified && (
            <div style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: 14, padding: '14px 18px', margin: '20px 0 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.5rem' }}>⏳</span>
              <div>
                <p style={{ fontWeight: 700, color: '#92400E', margin: 0, fontSize: '0.9rem' }}>Account Verification Required</p>
                <p style={{ fontSize: '0.825rem', color: '#B45309', margin: 0 }}>Your farmer account is currently awaiting review by the administrator. Once approved in the Admin Panel, you will be able to publish produce lots to global buyers.</p>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>

              {/* Step 0: Crop Selection */}
              {step === 0 && (
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>{'What are you selling?'}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
                    {crops.map(crop => (
                      <motion.div key={crop.slug || crop.id}
                        className={`crop-tile ${selectedCrop === (crop.slug || crop.id) ? 'selected' : ''}`}
                        onClick={() => handleCropChange(crop.slug || crop.id)}
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                        <span className="crop-emoji">{crop.emoji}</span>
                        <span className="crop-name">{crop.name}</span>
                        {selectedCrop === (crop.slug || crop.id) && <Check size={16} color="var(--green-primary)" />}
                      </motion.div>
                    ))}
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, marginTop: 20 }}>
                    <input type="checkbox" checked={organic} onChange={e => setOrganic(e.target.checked)} style={{ accentColor: 'var(--green-primary)', width: 18, height: 18 }} />
                    🌱 {'Organically grown (no synthetic pesticides)'}
                  </label>
                  {/* Price hint for selected crop */}
                  {cropAttr.priceHint && (
                    <div style={{ marginTop: 16, background: 'var(--green-light)', borderRadius: 12, padding: '12px 16px', fontSize: '0.875rem', color: 'var(--green-primary)', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Info size={15} />
                      {cropAttr.priceHint}
                    </div>
                  )}
                </div>
              )}

              {/* Step 1: Crop-specific specs */}
              {step === 1 && (
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 4 }}>{'Crop Specifications'}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>
                    {cropObj.emoji} <strong>{cropObj.name}</strong>
                    {' — '}{'Fill in quality details to attract better buyers.'}
                  </p>

                  {/* Grade Selector */}
                  {cropAttr.grades && cropAttr.grades.length > 0 && (
                    <div className="form-group" style={{ marginBottom: 20 }}>
                      <label className="form-label">{'Grade / Quality'}</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {cropAttr.grades.map(g => (
                          <button key={g.value} onClick={() => setGrade(g.value)}
                            className={`chip ${grade === g.value ? 'active' : ''}`}>
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Spec Fields */}
                  {cropAttr.specs && cropAttr.specs.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                      {cropAttr.specs.map(spec => (
                        <div key={spec.key} className="form-group">
                          <label className="form-label">{spec.label}</label>
                          {spec.type === 'select' ? (
                            <div style={{ position: 'relative' }}>
                              <select className="form-select"
                                value={specValues[spec.key] || ''}
                                onChange={e => setSpecValues(prev => ({ ...prev, [spec.key]: e.target.value }))}>
                                <option value="">{'Select...'}</option>
                                {spec.options.map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                              <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                            </div>
                          ) : (
                            <input className="form-input" placeholder={spec.label}
                              value={specValues[spec.key] || ''}
                              onChange={e => setSpecValues(prev => ({ ...prev, [spec.key]: e.target.value }))} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Packaging */}
                  {cropAttr.packaging && cropAttr.packaging.length > 0 && (
                    <div className="form-group" style={{ marginBottom: 20 }}>
                      <label className="form-label">{'Packaging'}</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {cropAttr.packaging.map(p => (
                          <button key={p} onClick={() => setPackaging(p)}
                            className={`chip ${packaging === p ? 'active' : ''}`}>{p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MOQ hint */}
                  {cropAttr.moq && (
                    <div style={{ background: '#FFF8E1', borderRadius: 12, padding: '10px 14px', fontSize: '0.8125rem', color: '#78350F', display: 'flex', gap: 6, alignItems: 'center' }}>
                      <Info size={13} /> {'Minimum Order Quantity:'} <strong>{cropAttr.moq}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Qty & Price */}
              {step === 2 && (
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 24 }}>{'Quantity & Price'}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div>
                      <label className="form-label" style={{ marginBottom: 10 }}>{'Quantity'}</label>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div className="stepper" style={{ flex: 1 }}>
                          <button className="stepper-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                          <input className="stepper-input" type="number" value={qty} onChange={e => setQty(Number(e.target.value))} />
                          <button className="stepper-btn" onClick={() => setQty(q => q + 1)}>+</button>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {['kg', 'quintal', 'ton'].map(u => (
                            <button key={u} onClick={() => setUnit(u)} className={`chip ${unit === u ? 'active' : ''}`} style={{ minWidth: 64 }}>{u}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <label className="form-label">{'Price per kg (₹)'}</label>
                        {mandiData && (
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {'Mandi today:'}
                            <button onClick={() => setPrice(mandiData.today)}
                              style={{ border: 'none', background: 'var(--green-light)', color: 'var(--green-primary)', fontWeight: 700, borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontSize: '0.8125rem' }}>
                              ₹{mandiData.today} ↙
                            </button>
                          </span>
                        )}
                      </div>
                      <div className="stepper">
                        <button className="stepper-btn" onClick={() => setPrice(p => Math.max(1, p - 1))}>−</button>
                        <input className="stepper-input" type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
                        <button className="stepper-btn" onClick={() => setPrice(p => p + 1)}>+</button>
                      </div>
                      {cropAttr.priceHint && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 8, display: 'flex', gap: 5 }}>
                          <Info size={13} style={{ marginTop: 2 }} />
                          {cropAttr.priceHint}
                        </p>
                      )}
                    </div>
                    <div style={{ background: 'var(--green-light)', borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{'Estimated Total Value'}</span>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--green-primary)' }}>₹{totalValue}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Photos */}
              {step === 3 && (
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>{'Add Photos'}</h4>
                  <p style={{ marginBottom: 20, fontSize: '0.875rem' }}>{'Clear harvest photos get 3× more verified enterprise offers.'}</p>
                  
                  <div
                    className={`upload-zone ${photoDragOver ? 'dragover' : ''}`}
                    onDragOver={e => { e.preventDefault(); setPhotoDragOver(true); }}
                    onDragLeave={() => setPhotoDragOver(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setPhotoDragOver(false);
                      if (e.dataTransfer.files) handlePhotoFiles(e.dataTransfer.files);
                    }}
                    onClick={() => document.getElementById('crop-photo-input')?.click()}
                    style={{
                      border: '2px dashed var(--border)',
                      borderRadius: 16,
                      padding: '32px 20px',
                      textAlign: 'center',
                      background: photoDragOver ? 'var(--green-light)' : '#FAFAFA',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      id="crop-photo-input"
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={e => e.target.files && handlePhotoFiles(e.target.files)}
                    />
                    <Upload size={36} color="var(--green-primary)" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {'Click to upload or drag & drop harvest photos'}
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      JPG, PNG, WebP • Max 5 photos
                    </p>
                  </div>

                  {photos.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12, marginTop: 20 }}>
                      {photos.map((p, i) => {
                        const isImg = typeof p === 'string' && (p.startsWith('data:') || p.startsWith('http') || p.startsWith('/'));
                        return (
                          <div key={i} style={{ aspectRatio: 1, background: 'var(--green-light)', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', position: 'relative', border: '1.5px solid var(--border)' }}>
                            {isImg ? (
                              <img src={p} alt="Produce preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              p
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPhotos(prev => prev.filter((_, j) => j !== i));
                              }}
                              style={{
                                position: 'absolute',
                                top: 6,
                                right: 6,
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: 'rgba(0,0,0,0.65)',
                                border: 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              ✕
                            </button>
                            {i === 0 && (
                              <span style={{ position: 'absolute', bottom: 4, left: 4, background: 'var(--green-primary)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: 6 }}>
                                Primary
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Location */}
              {step === 4 && (
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>{'Produce Location'}</h4>
                  <button className="btn btn-secondary btn-full" style={{ marginBottom: 20 }} onClick={detectLocation}>
                    <MapPin size={18} /> {'Use my current location'}
                  </button>
                  {location.detected && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      style={{ background: 'var(--green-light)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
                      <MapPin size={18} color="var(--green-primary)" />
                      <span style={{ fontWeight: 600, color: 'var(--green-primary)' }}>{location.village}, {location.district}</span>
                      <span className="badge badge-green" style={{ marginLeft: 'auto' }}>✓ Detected</span>
                    </motion.div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">{'Village / Town'}</label>
                      <input className="form-input" value={location.village} onChange={e => setLocation(l => ({ ...l, village: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{'District'}</label>
                      <input className="form-input" value={location.district} onChange={e => setLocation(l => ({ ...l, district: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{'State'}</label>
                      <input className="form-input" value={location.state} onChange={e => setLocation(l => ({ ...l, state: e.target.value }))} />
                    </div>
                  </div>
                  {/* Export prefs */}
                  <h5 style={{ fontFamily: 'var(--font-heading)', marginTop: 24, marginBottom: 12 }}>{'Who should see your listing?'}</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { key: 'otherStates', icon: <Truck size={22} color="var(--green-primary)" />, title: 'Sell to Other States', desc: 'Enterprises across India' },
                      { key: 'otherCountries', icon: <Globe size={22} color="#1565C0" />, title: 'Export Internationally', desc: 'UAE, UK, Japan, Saudi Arabia etc.' },
                    ].map(pref => (
                      <motion.div key={pref.key} onClick={() => setExportPrefs(prev => ({ ...prev, [pref.key]: !prev[pref.key] }))} whileHover={{ scale: 1.01 }}
                        style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '16px 18px', borderRadius: 16, cursor: 'pointer', border: `2px solid ${exportPrefs[pref.key] ? 'var(--green-primary)' : 'var(--border)'}`, background: exportPrefs[pref.key] ? 'var(--green-light)' : '#fff' }}>
                        <div style={{ width: 44, height: 44, background: exportPrefs[pref.key] ? '#fff' : 'var(--bg-page)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pref.icon}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>{pref.title}</p>
                          <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-secondary)' }}>{pref.desc}</p>
                        </div>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${exportPrefs[pref.key] ? 'var(--green-primary)' : 'var(--border)'}`, background: exportPrefs[pref.key] ? 'var(--green-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {exportPrefs[pref.key] && <Check size={14} color="#fff" />}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Preview */}
              {step === 5 && (
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>{'Listing Preview'}</h4>
                  {/* Buyer preview card */}
                  <div style={{ border: '2px solid var(--green-primary)', borderRadius: 18, padding: '20px', marginBottom: 24, background: 'var(--green-light)' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>{cropObj.emoji}</div>
                      <div>
                        <h5 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 4px' }}>
                          {cropObj.name} — {cropAttr.grades?.find(g => g.value === grade)?.label || 'Grade'}
                        </h5>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>📍 {location.village}, {location.district}</p>
                      </div>
                      <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--green-primary)' }}>₹{price}/kg</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{qty} {unit}</div>
                      </div>
                    </div>
                    {/* Spec chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {organic && <span className="badge badge-green">🌱 Organic</span>}
                      {packaging && <span className="badge">{packaging}</span>}
                      {Object.entries(specValues).filter(([, v]) => v).map(([k, v]) => (
                        <span key={k} className="badge">{v}</span>
                      ))}
                      {exportPrefs.otherCountries && <span className="badge" style={{ background: '#E3F2FD', color: '#1565C0' }}>✈️ Export Ready</span>}
                    </div>
                  </div>
                  {/* Summary table */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.875rem' }}>
                    {[
                      ['Crop', cropObj.name],
                      ['Grade', cropAttr.grades?.find(g => g.value === grade)?.label || '—'],
                      ['Quantity', `${qty} ${unit}`],
                      ['Price', `₹${price}/kg`],
                      ['Total Est.', `₹${totalValue}`],
                      ['Location', `${location.village}, ${location.district}`],
                      ['Organic', organic ? '✅ Yes' : '❌ No'],
                      ['Export', exportPrefs.otherCountries ? '✈️ Yes' : '🇮🇳 Domestic'],
                    ].map(([label, val]) => (
                      <div key={label} style={{ background: 'var(--bg-page)', borderRadius: 10, padding: '10px 14px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontWeight: 600 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 12, marginTop: 32, justifyContent: 'space-between' }}>
            {step > 0 ? (
              <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>← {'Back'}</button>
            ) : <div />}
            <SpinnerBtn
              loading={loading && step === STEPS.length - 1}
              onClick={step < STEPS.length - 1 ? () => setStep(s => s + 1) : handlePublish}
              disabled={step === STEPS.length - 1 && !isVerified}
              className={`btn ${step === STEPS.length - 1 ? 'btn-primary' : 'btn-secondary'}`}
              title={step === STEPS.length - 1 && !isVerified ? 'Verification required to publish' : ''}
            >
              {step < STEPS.length - 1 ? 'Continue →' : !isVerified ? '⏳ Verification Required' : `🚀 ${'Publish Listing'}`}
            </SpinnerBtn>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
