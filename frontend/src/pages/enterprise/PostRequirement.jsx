import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  Check, ArrowRight, ArrowLeft, Info, ChevronDown,
  Upload, X, Camera
} from 'lucide-react';
import { StepProgress, SpinnerBtn } from '../../components/common/AnimatedComponents';
import cropAttributes from '../../data/crop_attributes.json';

const STEPS = ['Crop', 'Specs', 'Qty & Target Price', 'Destination & Terms', 'Preview'];

const DESTINATIONS = [
  { country: 'UAE (Dubai)', flag: '🇦🇪' },
  { country: 'UK (London)', flag: '🇬🇧' },
  { country: 'Vietnam', flag: '🇻🇳' },
  { country: 'USA', flag: '🇺🇸' },
  { country: 'South Korea', flag: '🇰🇷' },
  { country: 'Saudi Arabia', flag: '🇸🇦' },
  { country: 'Germany', flag: '🇩🇪' },
  { country: 'Japan', flag: '🇯🇵' },
  { country: 'Domestic (India)', flag: '🇮🇳' },
];

const DELIVERY_MODES = [
  { id: 'Ex-Farm Pickup', label: 'Ex-Farm Pickup', icon: '🚜' },
  { id: 'Mandi / Yard Delivery', label: 'Mandi / Yard Delivery', icon: '🚚' },
  { id: 'Port CFS / FOB Delivery', label: 'Port CFS / FOB Delivery', icon: '🚢' },
];

const PAYMENT_OPTIONS = [
  'Payment within 48h of quality approval',
  '30% Advance, 70% on weight slip',
  '100% on crate / truck loading',
  'Direct APMC Electronic Transfer (RTGS)',
  'Letter of Credit (LC at sight)',
];

export default function PostRequirement() {
  const { addToast, user, addBuyerRequirement, crops = [], mandiPrices = [] } = useApp();
  const navigate = useNavigate();
  const isVerified = Boolean(user?.is_verified || user?.verified);

  const [step, setStep] = useState(0);
  const [selectedCrop, setSelectedCrop] = useState('jeera');
  const [grade, setGrade] = useState('');
  const [specValues, setSpecValues] = useState({});
  const [packaging, setPackaging] = useState('');
  const [certifications, setCertifications] = useState([]);
  const [organic, setOrganic] = useState(false);
  const [exportReady, setExportReady] = useState(true);
  const [urgency, setUrgency] = useState('active');

  const [qty, setQty] = useState(10);
  const [unit, setUnit] = useState('ton');
  const [price, setPrice] = useState(315);
  const [dest, setDest] = useState(DESTINATIONS[0]);
  const [delivery, setDelivery] = useState('Ex-Farm Pickup');
  const [payment, setPayment] = useState('Payment within 48h of quality approval');
  const [deadline, setDeadline] = useState('2026-10-31');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhotoUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1000;
        let { width, height } = img;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setPhoto(dataUrl);
        addToast('Reference photo uploaded! 📸', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const cropAttr = cropAttributes[selectedCrop] || {};
  const cropObj = crops.find(c => (c.slug || c.id) === selectedCrop) || crops[0] || { id: 'jeera', slug: 'jeera', name: 'Jeera (Cumin)', emoji: '🌿', price: 318, grade: 'Premium Bold' };
  const mandiData = mandiPrices.find(c => c.cropSlug === selectedCrop);

  const POPULAR_SLUGS = ['groundnut', 'jeera', 'cotton', 'sesame', 'kesar-mango', 'isabgol'];
  const popularCrops = useMemo(() => crops.filter(c => POPULAR_SLUGS.includes(c.slug)), [crops]);
  const otherCrops = useMemo(() => crops.filter(c => !POPULAR_SLUGS.includes(c.slug)), [crops]);

  // Initialize defaults on mount if needed
  useState(() => {
    const attr = cropAttributes['jeera'] || {};
    setGrade(attr.grades?.[0]?.value || '');
    setPackaging(attr.packaging?.[0] || '');
    setCertifications(attr.certifications?.slice(0, 2) || []);
  });

  const handleCropChange = (id) => {
    setSelectedCrop(id);
    const attr = cropAttributes[id] || {};
    const crop = crops.find(c => (c.slug || c.id) === id) || cropObj;
    const mData = mandiPrices.find(c => c.cropSlug === id);
    setGrade(attr.grades?.[0]?.value || '');
    setPackaging(attr.packaging?.[0] || '');
    setPrice(mData?.today || crop?.price || 50);
    setSpecValues({});
    setCertifications(attr.certifications?.slice(0, 2) || []);
  };

  const toggleCert = (cert) => {
    setCertifications(prev =>
      prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]
    );
  };

  const totalValue = useMemo(() => {
    const mult = unit === 'ton' ? 1000 : unit === 'quintal' ? 100 : 1;
    return (Number(qty) * mult * Number(price)).toLocaleString('en-IN');
  }, [qty, unit, price]);

  const handlePublish = async () => {
    if (!isVerified) {
      addToast('Enterprise verification required: Admin approval is needed before you can post procurement requirements.', 'warning');
      return;
    }
    setLoading(true);
    const selectedGradeLabel = cropAttr.grades?.find(g => g.value === grade)?.label || grade || cropObj.grade || 'Grade A';

    const newReq = {
      enterpriseId: user?.id,
      enterpriseName: user?.enterpriseProfile?.companyName || user?.name || 'Verified Enterprise',
      buyerType: user?.enterpriseProfile?.businessType || user?.businessType || 'Exporter',
      verified: Boolean(user?.is_verified),
      crop: cropObj.slug || cropObj.id,
      cropId: cropObj.id,
      cropName: cropObj.name,
      emoji: cropObj.emoji,
      title: `Need ${qty} ${unit === 'ton' ? 'Tons' : unit} ${cropObj.name} for ${dest.country.split(' ')[0]}`,
      qty: Number(qty),
      quantity: Number(qty),
      unit,
      targetPrice: Number(price),
      priceRange: `Target: ₹${price}/kg`,
      destination: dest.country,
      flag: dest.flag,
      urgency,
      urgencyLabel: urgency === 'urgent' ? 'Urgent Requirement' : 'Active Requirement',
      deliveryTerms: delivery,
      paymentTerms: payment,
      deadline: deadline || '2026-10-31',
      notes: notes || `Looking for ${selectedGradeLabel} quality clean lots. Prompt payment guaranteed.`,
      specs: {
        grade: selectedGradeLabel,
        packaging,
        ...specValues,
        ...(certifications.length > 0 ? { certifications: certifications.join(', ') } : {}),
        ...(organic ? { organic: 'Certified Organic' } : {}),
        ...(exportReady ? { exportQuality: 'Export Standard' } : {}),
      },
      image: photo || null,
      imageUrl: photo || null,
      status: 'active',
    };

    try {
      await addBuyerRequirement(newReq);
      navigate('/enterprise/requirements');
    } catch (err) {
      console.error('Failed to publish requirement:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header Banner */}
      <div style={{ background: 'var(--green-primary)', padding: '32px 0 48px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 20, color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
              🏢 Enterprise Buying Portal
            </span>
          </div>
          <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)', marginBottom: 8 }}>
            Post Buying Requirement
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0 }}>
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: -20 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#fff',
            borderRadius: 24,
            padding: '32px',
            boxShadow: 'var(--shadow-lg)',
            marginBottom: 32,
            maxWidth: 720,
            margin: '0 auto',
          }}
        >
          {/* Progress Bar */}
          <div className="progress-bar" style={{ marginBottom: 28 }}>
            <motion.div
              className="progress-fill"
              animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <StepProgress steps={STEPS} current={step} />

          {!isVerified && (
            <div style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: 14, padding: '14px 18px', margin: '20px 0 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.5rem' }}>⏳</span>
              <div>
                <p style={{ fontWeight: 700, color: '#92400E', margin: 0, fontSize: '0.9rem' }}>Enterprise Verification Required</p>
                <p style={{ fontSize: '0.825rem', color: '#B45309', margin: 0 }}>Your enterprise account is currently pending review by the platform administrator. Once approved in the Admin Panel, you will be able to post buying requirements and contract RFQs.</p>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
            >
              {/* ============================================================ */}
              {/* Step 0: Crop Selection                                       */}
              {/* ============================================================ */}
              {step === 0 && (
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 6 }}>
                    What crop do you want to purchase?
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
                    Select the agricultural commodity or crop for your procurement requirement.
                  </p>

                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>Select Crop / Commodity</label>
                    <div style={{ position: 'relative' }}>
                      <select
                        className="form-select"
                        value={selectedCrop}
                        onChange={e => handleCropChange(e.target.value)}
                        style={{
                          height: 52,
                          fontSize: '1rem',
                          fontWeight: 500,
                          paddingRight: 40,
                          background: '#FAFAFA',
                          cursor: 'pointer',
                        }}
                      >
                        {popularCrops.length > 0 && (
                          <optgroup label="⭐ Popular Benchmark Crops">
                            {popularCrops.map(crop => (
                              <option key={crop.slug || crop.id} value={crop.slug || crop.id}>
                                {crop.emoji || '🌱'} {crop.name}{crop.gujarati_name ? ` (${crop.gujarati_name})` : ''}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label={popularCrops.length > 0 ? "🌾 All Other Crops" : "🌾 All Agricultural Crops"}>
                          {otherCrops.map(crop => (
                            <option key={crop.slug || crop.id} value={crop.slug || crop.id}>
                              {crop.emoji || '🌱'} {crop.name}{crop.gujarati_name ? ` (${crop.gujarati_name})` : ''}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      <ChevronDown
                        size={18}
                        style={{
                          position: 'absolute',
                          right: 14,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none',
                          color: 'var(--text-muted)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Selected Crop Card Preview */}
                  {cropObj && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        background: 'linear-gradient(135deg, rgba(21,101,192,0.06) 0%, rgba(21,101,192,0.02) 100%)',
                        border: '1.5px solid rgba(21,101,192,0.2)',
                        borderRadius: 16,
                        marginBottom: 20,
                        gap: 16,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 12,
                            background: '#fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.8rem',
                            flexShrink: 0,
                          }}
                        >
                          {cropObj.emoji || '🌱'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h5 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {cropObj.name}
                            </h5>
                            {cropObj.gujarati_name && (
                              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', background: '#fff', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border)' }}>
                                {cropObj.gujarati_name}
                              </span>
                            )}
                          </div>
                          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Targeting: {cropObj.export_grade || cropObj.grade || 'Export Quality Grade'} • Default lot in {cropObj.default_unit || 'MT'}
                          </p>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Market Benchmark
                        </span>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1565C0' }}>
                          ₹{cropObj.indicative_price || cropObj.price || 50} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/ {cropObj.default_unit || 'kg'}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Crop Benchmark Hint */}
                  {cropAttr.priceHint && (
                    <div style={{ marginTop: 16, background: 'var(--green-light)', borderRadius: 12, padding: '12px 16px', fontSize: '0.875rem', color: 'var(--green-primary)', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Info size={16} />
                      <span>{cropAttr.priceHint}</span>
                    </div>
                  )}

                  {/* Requirements Options Toggles */}
                  <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 18 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={urgency === 'urgent'}
                        onChange={e => setUrgency(e.target.checked ? 'urgent' : 'active')}
                        style={{ accentColor: 'var(--green-primary)', width: 18, height: 18 }}
                      />
                      <span>🔥 Mark as Urgent Requirement (needed within 7–10 days)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={organic}
                        onChange={e => setOrganic(e.target.checked)}
                        style={{ accentColor: 'var(--green-primary)', width: 18, height: 18 }}
                      />
                      <span>🌱 Require Organically Grown Produce (NPOP / EU Organic Certified)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={exportReady}
                        onChange={e => setExportReady(e.target.checked)}
                        style={{ accentColor: 'var(--green-primary)', width: 18, height: 18 }}
                      />
                      <span>✈️ Export Grade Quality Required (with lab analysis & phytosanitary certificate)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* Step 1: Crop Specifications & Attributes (MATCHES AddProduce)  */}
              {/* ============================================================ */}
              {step === 1 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: '1.8rem' }}>{cropObj.emoji}</span>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>
                        Crop Specifications & Quality Parameters
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                        <strong>{cropObj.name}</strong> • Specify exact standards for farmers to match.
                      </p>
                    </div>
                  </div>

                  {/* Required Grade Selector */}
                  {cropAttr.grades && cropAttr.grades.length > 0 && (
                    <div className="form-group" style={{ marginTop: 22, marginBottom: 20 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        Required Grade / Quality *
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {cropAttr.grades.map(g => (
                          <button
                            key={g.value}
                            type="button"
                            onClick={() => setGrade(g.value)}
                            className={`chip notranslate ${grade === g.value ? 'active' : ''}`}
                            style={{ padding: '8px 14px', fontSize: '0.875rem' }}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Spec Fields from crop_attributes.json */}
                  {cropAttr.specs && cropAttr.specs.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <label className="form-label" style={{ fontWeight: 600, marginBottom: 12 }}>
                        Specific Parameters & Limits
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {cropAttr.specs.map(spec => (
                          <div key={spec.key} className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.8125rem' }}>
                              {spec.label}
                            </label>
                            {spec.type === 'select' ? (
                              <div style={{ position: 'relative' }}>
                                <select
                                  className="form-select notranslate"
                                  value={specValues[spec.key] || ''}
                                  onChange={e => setSpecValues(prev => ({ ...prev, [spec.key]: e.target.value }))}
                                  style={{ paddingRight: 32 }}
                                >
                                  <option value="">Any / Standard</option>
                                  {spec.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                                <ChevronDown
                                  size={15}
                                  style={{
                                    position: 'absolute',
                                    right: 10,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none',
                                    color: 'var(--text-muted)'
                                  }}
                                />
                              </div>
                            ) : (
                              <input
                                className="form-input notranslate"
                                placeholder={spec.label}
                                value={specValues[spec.key] || ''}
                                onChange={e => setSpecValues(prev => ({ ...prev, [spec.key]: e.target.value }))}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Packaging Preference */}
                  {cropAttr.packaging && cropAttr.packaging.length > 0 && (
                    <div className="form-group" style={{ marginBottom: 20 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        Required Packaging Format
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {cropAttr.packaging.map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPackaging(p)}
                            className={`chip notranslate ${packaging === p ? 'active' : ''}`}
                            style={{ padding: '8px 14px' }}
                          >
                            📦 {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required Certifications */}
                  {cropAttr.certifications && cropAttr.certifications.length > 0 && (
                    <div className="form-group" style={{ marginBottom: 20 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        Required Documents & Certifications
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {cropAttr.certifications.map(c => {
                          const isSelected = certifications.includes(c);
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => toggleCert(c)}
                              className={`chip notranslate ${isSelected ? 'active' : ''}`}
                              style={{ padding: '7px 12px', fontSize: '0.8125rem' }}
                            >
                              {isSelected ? '✓ ' : '+ '} {c}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* MOQ callout */}
                  {cropAttr.moq && (
                    <div style={{ background: '#FFF8E1', borderRadius: 12, padding: '12px 16px', fontSize: '0.8125rem', color: '#78350F', display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
                      <Info size={15} />
                      <span>Standard Commercial MOQ: <strong className="notranslate">{cropAttr.moq}</strong></span>
                    </div>
                  )}

                  {/* Reference Photo / Quality Sample Upload */}
                  <div className="form-group" style={{ marginTop: 22, marginBottom: 10 }}>
                    <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Camera size={16} color="var(--green-primary)" />
                      Reference Photo / Quality Sample (Optional)
                    </label>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 12px' }}>
                      Upload a sample crop image or visual quality standard for farmers to match.
                    </p>
                    {photo ? (
                      <div style={{ position: 'relative', width: 140, height: 140, borderRadius: 14, overflow: 'hidden', border: '2px solid var(--green-primary)', boxShadow: 'var(--shadow-sm)' }}>
                        <img src={photo} alt="Crop Sample" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => setPhoto('')}
                          style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => document.getElementById('req-photo-input').click()}
                        style={{
                          border: '2px dashed var(--border)',
                          borderRadius: 14,
                          padding: '28px 16px',
                          textAlign: 'center',
                          background: '#FAFDF9',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <input
                          id="req-photo-input"
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={e => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                        />
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: 'var(--green-primary)' }}>
                          <Upload size={20} />
                        </div>
                        <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          Click to upload sample image
                        </p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPG, PNG or WebP • Max 5MB</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* Step 2: Quantity & Target Price                              */}
              {/* ============================================================ */}
              {step === 2 && (
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>
                    Quantity & Target Buying Price
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Quantity Field */}
                    <div>
                      <label className="form-label" style={{ marginBottom: 10, fontWeight: 600 }}>
                        Required Total Quantity *
                      </label>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div className="stepper" style={{ flex: 1 }}>
                          <button
                            type="button"
                            className="stepper-btn"
                            onClick={() => setQty(q => Math.max(1, Number(q) - 1))}
                          >
                            −
                          </button>
                          <input
                            className="stepper-input notranslate"
                            type="number"
                            value={qty}
                            onChange={e => setQty(Math.max(1, Number(e.target.value)))}
                          />
                          <button
                            type="button"
                            className="stepper-btn"
                            onClick={() => setQty(q => Number(q) + 1)}
                          >
                            +
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {['ton', 'quintal'].map(u => (
                            <button
                              key={u}
                              type="button"
                              onClick={() => setUnit(u)}
                              className={`chip notranslate ${unit === u ? 'active' : ''}`}
                              style={{ minWidth: 70, textTransform: 'capitalize' }}
                            >
                              {u}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Price Field */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <label className="form-label" style={{ fontWeight: 600, margin: 0 }}>
                          Target Buying Price (₹/kg) *
                        </label>
                        {mandiData && (
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            Mandi today:
                            <button
                              type="button"
                              onClick={() => setPrice(mandiData.today)}
                              style={{
                                border: 'none',
                                background: 'var(--green-light)',
                                color: 'var(--green-primary)',
                                fontWeight: 700,
                                borderRadius: 6,
                                padding: '2px 8px',
                                cursor: 'pointer',
                                fontSize: '0.8125rem',
                              }}
                            >
                              <span className="notranslate">₹{mandiData.today}</span> (Use)
                            </button>
                          </span>
                        )}
                      </div>

                      <div className="stepper">
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => setPrice(p => Math.max(1, Number(p) - 1))}
                        >
                          −
                        </button>
                        <input
                          className="stepper-input notranslate"
                          type="number"
                          value={price}
                          onChange={e => setPrice(Math.max(1, Number(e.target.value)))}
                        />
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => setPrice(p => Number(p) + 1)}
                        >
                          +
                        </button>
                      </div>

                      {cropAttr.priceHint && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                          <Info size={14} />
                          <span>{cropAttr.priceHint}</span>
                        </p>
                      )}
                    </div>

                    {/* Estimated Total Budget */}
                    <div style={{ background: 'var(--green-light)', borderRadius: 16, padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          Estimated Total Budget
                        </span>
                        <span className="notranslate" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {qty} {unit} × ₹{price}/kg
                        </span>
                      </div>
                      <span className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.6rem', color: 'var(--green-primary)' }}>
                        ₹{totalValue}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* Step 3: Destination & Delivery Terms                         */}
              {/* ============================================================ */}
              {step === 3 && (
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>
                    Destination & Delivery Terms
                  </h4>

                  {/* Destination */}
                  <div style={{ marginBottom: 20 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Target Export Destination
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {DESTINATIONS.map(d => (
                        <button
                          key={d.country}
                          type="button"
                          onClick={() => setDest(d)}
                          className={`chip notranslate ${dest.country === d.country ? 'active' : ''}`}
                          style={{ padding: '9px 10px', fontSize: '0.85rem', textAlign: 'center', justifyContent: 'center' }}
                        >
                          {d.flag} {d.country.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Mode */}
                  <div style={{ marginBottom: 20 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Delivery Mode Preference
                    </label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {DELIVERY_MODES.map(mode => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setDelivery(mode.id)}
                          className={`chip ${delivery === mode.id ? 'active' : ''}`}
                          style={{ flex: 1, padding: '12px 10px', textAlign: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem' }}
                        >
                          <span style={{ marginRight: 6 }}>{mode.icon}</span>
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Terms */}
                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Payment Terms Offered to Farmers
                    </label>
                    <select
                      className="form-select"
                      value={payment}
                      onChange={e => setPayment(e.target.value)}
                    >
                      {PAYMENT_OPTIONS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Deadline */}
                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Required By / Deadline Date
                    </label>
                    <input
                      type="date"
                      className="form-input notranslate"
                      value={deadline}
                      onChange={e => setDeadline(e.target.value)}
                    />
                  </div>

                  {/* Notes */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Special Instructions / Notes for Farmers
                    </label>
                    <textarea
                      rows={3}
                      className="form-input"
                      placeholder="e.g. Ready stock preferred. Farm inspection available. Clean sortex lots get fast payment."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* Step 4: Requirement Preview (MATCHES AddProduce Step 5)       */}
              {/* ============================================================ */}
              {step === 4 && (
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 6 }}>
                    Requirement Preview
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                    Review all crop attributes and terms before publishing to Indian farmers.
                  </p>

                  {/* Buyer Requirement Card Preview */}
                  <div
                    style={{
                      border: '2px solid var(--green-primary)',
                      borderRadius: 18,
                      padding: '22px',
                      marginBottom: 24,
                      background: 'var(--green-light)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                      <div
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 14,
                          background: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2.4rem',
                          boxShadow: 'var(--shadow-sm)',
                          overflow: 'hidden',
                        }}
                      >
                        {photo ? (
                          <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          cropObj.emoji
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <h4 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>
                            {cropObj.name}
                          </h4>
                          {urgency === 'urgent' && (
                            <span className="badge badge-red" style={{ fontSize: '0.75rem' }}>
                              🔥 Urgent
                            </span>
                          )}
                          <span className="badge badge-blue notranslate">
                            {dest.flag} {dest.country}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          📍 {delivery} • {payment}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 900, color: 'var(--green-primary)' }}>
                          ₹{price}/kg
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          <span className="notranslate">{qty} {unit}</span> demanded
                        </div>
                      </div>
                    </div>

                    {/* Spec Chips Row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      {grade && (
                        <span className="badge badge-green notranslate">
                          🏷️ {cropAttr.grades?.find(g => g.value === grade)?.label || grade}
                        </span>
                      )}
                      {packaging && (
                        <span className="badge notranslate">
                          📦 {packaging}
                        </span>
                      )}
                      {organic && (
                        <span className="badge badge-green">
                          🌱 Organic Certified
                        </span>
                      )}
                      {exportReady && (
                        <span className="badge" style={{ background: '#E3F2FD', color: '#1565C0' }}>
                          ✈️ Export Grade
                        </span>
                      )}
                      {Object.entries(specValues).filter(([, v]) => v).map(([k, v]) => (
                        <span key={k} className="badge notranslate">
                          {v}
                        </span>
                      ))}
                      {certifications.map(c => (
                        <span key={c} className="badge badge-amber notranslate" style={{ fontSize: '0.75rem' }}>
                          📜 {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.875rem' }}>
                    {[
                      ['Crop', cropObj.name, false],
                      ['Required Grade', cropAttr.grades?.find(g => g.value === grade)?.label || grade || '—', true],
                      ['Target Quantity', `${qty} ${unit}`, true],
                      ['Target Buying Price', `₹${price}/kg`, true],
                      ['Total Estimated Budget', `₹${totalValue}`, true],
                      ['Destination', `${dest.flag} ${dest.country}`, true],
                      ['Delivery Mode', delivery, false],
                      ['Payment Terms', payment, false],
                      ['Packaging', packaging || 'Standard', true],
                      ['Required Date', deadline || 'Within 30 days', true],
                    ].map(([label, val, notranslate]) => (
                      <div key={label} style={{ background: 'var(--bg-page)', borderRadius: 10, padding: '10px 14px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                        <div className={notranslate ? 'notranslate' : ''} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Stepper Navigation Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 32,
              paddingTop: 20,
              borderTop: '1px solid var(--border)',
            }}
          >
            {step > 0 ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(s => s - 1)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep(s => s + 1)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <span>Next Step</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <SpinnerBtn
                loading={loading}
                onClick={handlePublish}
                disabled={!isVerified}
                className="btn btn-primary"
                title={!isVerified ? 'Verification required to publish' : ''}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Check size={16} />
                <span>{!isVerified ? '⏳ Verification Required' : 'Publish Buying Requirement'}</span>
              </SpinnerBtn>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
