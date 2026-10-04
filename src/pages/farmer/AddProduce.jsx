import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Upload, MapPin, Globe, Truck, Check, Info, ChevronDown } from 'lucide-react';
import { StepProgress, SpinnerBtn } from '../../components/common/AnimatedComponents';
import { CROPS, MANDI_PRICES_HISTORY } from '../../data/sampleData';
import cropAttributes from '../../data/crop_attributes.json';

const STEPS = ['Crop', 'Specs', 'Qty & Price', 'Photos', 'Location', 'Preview'];

export default function AddProduce() {
  const { addToast, addProduceListing } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

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
  const [location, setLocation] = useState({ village: 'Unjha', district: 'Mehsana', state: 'Gujarat', detected: false });
  const [exportPrefs, setExportPrefs] = useState({ otherStates: true, otherCountries: false });

  const cropAttr = cropAttributes[selectedCrop] || {};
  const cropObj = CROPS.find(c => c.id === selectedCrop) || CROPS[0];
  const mandiData = MANDI_PRICES_HISTORY.crops.find(c => c.id === selectedCrop);

  // Auto-set grade/price/packaging when crop changes
  const handleCropChange = (id) => {
    setSelectedCrop(id);
    const attr = cropAttributes[id] || {};
    const crop = CROPS.find(c => c.id === id) || CROPS[0];
    setGrade(attr.grades?.[0]?.value || '');
    setPackaging(attr.packaging?.[0] || '');
    setPrice(crop.price || 50);
    setSpecValues({});
  };

  const totalValue = useMemo(() => {
    const multiplier = unit === 'ton' ? 1000 : unit === 'quintal' ? 100 : 1;
    return (qty * multiplier * price).toLocaleString('en-IN');
  }, [qty, unit, price]);

  const handlePublish = () => {
    setLoading(true);
    const selectedGradeLabel = cropAttr.grades?.find(g => g.value === grade)?.label || grade;
    const newListing = {
      crop: cropObj.id,
      cropName: cropObj.name,
      gujCrop: cropObj.guj,
      qty: Number(qty),
      unit,
      price: Number(price),
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
    setTimeout(() => {
      addProduceListing(newListing);
      addToast('Produce listed successfully! 🎉', 'success');
      navigate('/farmer/listings');
    }, 1000);
  };

  const detectLocation = () => {
    setTimeout(() => setLocation({ village: 'Unjha', district: 'Mehsana', state: 'Gujarat', detected: true }), 800);
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

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>

              {/* Step 0: Crop Selection */}
              {step === 0 && (
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>{'What are you selling?'}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
                    {CROPS.map(crop => (
                      <motion.div key={crop.id}
                        className={`crop-tile ${selectedCrop === crop.id ? 'selected' : ''}`}
                        onClick={() => handleCropChange(crop.id)}
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                        <span className="crop-emoji">{crop.emoji}</span>
                        <span className="crop-name">{crop.name}</span>
                        {selectedCrop === crop.id && <Check size={16} color="var(--green-primary)" />}
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
                  <p style={{ marginBottom: 20, fontSize: '0.875rem' }}>{'Clear photos get 3× more offers.'}</p>
                  <div className="upload-zone" onClick={() => setPhotos(prev => [...prev, cropObj.emoji || '🌿'].slice(0, 5))}>
                    <Upload size={32} color="var(--green-primary)" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{'Click to upload or drag photos'}</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>JPG, PNG • Max 5 photos</p>
                  </div>
                  {photos.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginTop: 16 }}>
                      {photos.map((p, i) => (
                        <div key={i} style={{ aspectRatio: 1, background: 'var(--green-light)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', position: 'relative' }}>
                          {p}
                          <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                            style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                        </div>
                      ))}
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
            <SpinnerBtn loading={loading && step === STEPS.length - 1} onClick={step < STEPS.length - 1 ? () => setStep(s => s + 1) : handlePublish}
              className={`btn ${step === STEPS.length - 1 ? 'btn-primary' : 'btn-secondary'}`}>
              {step < STEPS.length - 1 ? 'Continue →' : `🚀 ${'Publish Listing'}`}
            </SpinnerBtn>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
