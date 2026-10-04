import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  Check, ArrowRight, ArrowLeft, PlusCircle, Info, ChevronDown,
  Globe, Truck, ShieldCheck, Sparkles, Building2, Calendar
} from 'lucide-react';
import { StepProgress, SpinnerBtn } from '../../components/common/AnimatedComponents';
import { CROPS, MANDI_PRICES_HISTORY } from '../../data/sampleData';
import cropAttributes from '../../data/crop_attributes.json';

const STEPS = ['Crop', 'Specs', 'Qty & Target Price', 'Destination & Terms', 'Preview'];

const DESTINATIONS = [
  { country: 'UAE (Dubai)', flag: '🇦🇪', guj: 'યુ.એ.ઇ. (દુબઈ)' },
  { country: 'UK (London)', flag: '🇬🇧', guj: 'યુકે (લંડન)' },
  { country: 'Vietnam', flag: '🇻🇳', guj: 'વિયેટનામ' },
  { country: 'USA', flag: '🇺🇸', guj: 'યુ.એસ.એ.' },
  { country: 'South Korea', flag: '🇰🇷', guj: 'દક્ષિણ કોરિયા' },
  { country: 'Saudi Arabia', flag: '🇸🇦', guj: 'સાઉદી અરેબિયા' },
  { country: 'Germany', flag: '🇩🇪', guj: 'જર્મની' },
  { country: 'Japan', flag: '🇯🇵', guj: 'જાપાન' },
  { country: 'Domestic (India)', flag: '🇮🇳', guj: 'ભારત (ઘરેલુ)' },
];

const DELIVERY_MODES = [
  { id: 'Ex-Farm Pickup', label: 'Ex-Farm Pickup', guj: 'ખેતરેથી પિકઅપ', icon: '🚜' },
  { id: 'Mandi / Yard Delivery', label: 'Mandi / Yard Delivery', guj: 'મંડી / યાર્ડ ડિલિવરી', icon: '🚚' },
  { id: 'Port CFS / FOB Delivery', label: 'Port CFS / FOB Delivery', guj: 'પોર્ટ CFS ડિલિવરી', icon: '🚢' },
];

const PAYMENT_OPTIONS = [
  'Payment within 48h of quality approval',
  '30% Advance, 70% on weight slip',
  '100% on crate / truck loading',
  'Direct APMC Electronic Transfer (RTGS)',
  'Letter of Credit (LC at sight)',
];

export default function PostRequirement() {
  const { t, lang, addToast, user, addBuyerRequirement } = useApp();
  const navigate = useNavigate();

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
  const [loading, setLoading] = useState(false);

  const cropAttr = cropAttributes[selectedCrop] || {};
  const cropObj = CROPS.find(c => c.id === selectedCrop) || CROPS[0];
  const mandiData = MANDI_PRICES_HISTORY.crops.find(c => c.id === selectedCrop);

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
    const crop = CROPS.find(c => c.id === id) || CROPS[0];
    const mData = MANDI_PRICES_HISTORY.crops.find(c => c.id === id);
    setGrade(attr.grades?.[0]?.value || '');
    setPackaging(attr.packaging?.[0] || '');
    setPrice(mData?.today || crop.price || 50);
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

  const handlePublish = () => {
    setLoading(true);
    const selectedGradeLabel = cropAttr.grades?.find(g => g.value === grade)?.label || grade || cropObj.grade || 'Grade A';

    const newReq = {
      id: `br_${Date.now()}`,
      enterpriseId: user?.id || 'e1',
      enterpriseName: user?.name || 'Ahmed Spice Exports',
      gujEnterpriseName: user?.gujName || 'અહેમદ સ્પાઈસ એક્સ્પોર્ટ',
      buyerType: 'Export House',
      verified: true,
      crop: cropObj.id,
      cropName: cropObj.name,
      gujCrop: cropObj.guj,
      emoji: cropObj.emoji,
      title: `Need ${qty} ${unit === 'ton' ? 'Tons' : unit} ${cropObj.name} for ${dest.country.split(' ')[0]}`,
      gujTitle: `${dest.country.split(' ')[0]} માટે ${qty} ${unit === 'ton' ? 'ટન' : unit} ${cropObj.guj} ની જરૂર`,
      qty: Number(qty),
      unit,
      targetPrice: Number(price),
      priceRange: `Target: ₹${price}/kg`,
      destination: dest.country,
      flag: dest.flag,
      urgency,
      urgencyLabel: urgency === 'urgent' ? 'Urgent Requirement' : 'Active Requirement',
      gujUrgencyLabel: urgency === 'urgent' ? 'તાત્કાલિક જરૂર' : 'સક્રિય જરૂર',
      deliveryTerms: delivery,
      gujDeliveryTerms: delivery === 'Ex-Farm Pickup' ? 'ખેતરેથી પિકઅપ' : 'મંડી ડિલિવરી',
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
      posted: 'Just now',
      gujPosted: 'હમણાં જ',
      quotesCount: 0,
      quotes: [],
      status: 'active',
    };

    setTimeout(() => {
      addBuyerRequirement(newReq);
      setLoading(false);
      addToast(
        t('Buying requirement posted successfully! Visible to Gujarat farmers. 🎉', 'ખરીદી માંગણી સફળતાપૂર્વક ઉમેરાઈ! હવે તમામ ખેડૂતોને દેખાશે. 🎉'),
        'success'
      );
      navigate('/enterprise/requirements');
    }, 700);
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header Banner */}
      <div style={{ background: 'var(--green-primary)', padding: '32px 0 48px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 20, color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
              🏢 {t('Enterprise Buying Portal', 'એન્ટરપ્રાઇઝ ખરીદી પોર્ટલ')}
            </span>
          </div>
          <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)', marginBottom: 8 }}>
            {t('Post Buying Requirement', 'ખરીદી માંગણી ઉમેરો')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0 }}>
            {t(`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`, `પગલું ${step + 1}/${STEPS.length}: ${STEPS[step]}`)}
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

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
            >
              {/* ============================================================ */}
              {/* Step 0: Crop Selection (All 12 Crops)                         */}
              {/* ============================================================ */}
              {step === 0 && (
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 6 }}>
                    {t('What crop do you want to purchase?', 'તમે કયો પાક ખરીદવા માંગો છો?')}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
                    {t('Select from Gujarat’s 12 major export crops to configure attributes & specifications.', 'ગુજરાતના ૧૨ મુખ્ય પાકોમાંથી પસંદ કરો.')}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
                    {CROPS.map(crop => (
                      <motion.div
                        key={crop.id}
                        className={`crop-tile ${selectedCrop === crop.id ? 'selected' : ''}`}
                        onClick={() => handleCropChange(crop.id)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span className="crop-emoji">{crop.emoji}</span>
                        <span className="crop-name">
                          {lang === 'gu' ? crop.guj : crop.name}
                        </span>
                        {selectedCrop === crop.id && <Check size={16} color="var(--green-primary)" />}
                      </motion.div>
                    ))}
                  </div>

                  {/* Crop Benchmark Hint */}
                  {cropAttr.priceHint && (
                    <div style={{ marginTop: 20, background: 'var(--green-light)', borderRadius: 12, padding: '12px 16px', fontSize: '0.875rem', color: 'var(--green-primary)', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Info size={16} />
                      <span>{lang === 'gu' ? cropAttr.priceHintGuj : cropAttr.priceHint}</span>
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
                      <span>🔥 {t('Mark as Urgent Requirement (needed within 7–10 days)', 'તાત્કાલિક જરૂરિયાત તરીકે દર્શાવો (૭-૧૦ દિવસમાં)')}</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={organic}
                        onChange={e => setOrganic(e.target.checked)}
                        style={{ accentColor: 'var(--green-primary)', width: 18, height: 18 }}
                      />
                      <span>🌱 {t('Require Organically Grown Produce (NPOP / EU Organic Certified)', 'ઓર્ગેનિક પ્રમાણિત પાક જરૂરી (NPOP / EU પ્રમાણપત્ર)')}</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={exportReady}
                        onChange={e => setExportReady(e.target.checked)}
                        style={{ accentColor: 'var(--green-primary)', width: 18, height: 18 }}
                      />
                      <span>✈️ {t('Export Grade Quality Required (with lab analysis & phytosanitary certificate)', 'નિકાસ ગુણવત્તાવાળો પાક (લેબ ટેસ્ટિંગ અને ફાયટોસેનિટરી જરૂરી)')}</span>
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
                        {t('Crop Specifications & Quality Parameters', 'પાક ગુણવત્તા અને વિશિષ્ટતાઓ')}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                        <strong>{lang === 'gu' ? cropObj.guj : cropObj.name}</strong> • {t('Specify exact standards for farmers to match.', 'ખેડૂતો સાથે સ્પષ્ટતા માટે ગુણવત્તા પસંદ કરો.')}
                      </p>
                    </div>
                  </div>

                  {/* Required Grade Selector */}
                  {cropAttr.grades && cropAttr.grades.length > 0 && (
                    <div className="form-group" style={{ marginTop: 22, marginBottom: 20 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        {t('Required Grade / Quality', 'જરૂરી ગ્રેડ / ક્વોલિટી')} *
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {cropAttr.grades.map(g => (
                          <button
                            key={g.value}
                            type="button"
                            onClick={() => setGrade(g.value)}
                            className={`chip ${grade === g.value ? 'active' : ''}`}
                            style={{ padding: '8px 14px', fontSize: '0.875rem' }}
                          >
                            {lang === 'gu' ? g.guj : g.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Spec Fields from crop_attributes.json */}
                  {cropAttr.specs && cropAttr.specs.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <label className="form-label" style={{ fontWeight: 600, marginBottom: 12 }}>
                        {t('Specific Parameters & Limits', 'ચોક્કસ ગુણવત્તા માપદંડ')}
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {cropAttr.specs.map(spec => (
                          <div key={spec.key} className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.8125rem' }}>
                              {lang === 'gu' ? spec.guj : spec.label}
                            </label>
                            {spec.type === 'select' ? (
                              <div style={{ position: 'relative' }}>
                                <select
                                  className="form-select"
                                  value={specValues[spec.key] || ''}
                                  onChange={e => setSpecValues(prev => ({ ...prev, [spec.key]: e.target.value }))}
                                  style={{ paddingRight: 32 }}
                                >
                                  <option value="">{t('Any / Standard', 'સામાન્ય / ગમે તે')}</option>
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
                                className="form-input"
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
                        {t('Required Packaging Format', 'જરૂરી પેકિંગ')}
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {cropAttr.packaging.map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPackaging(p)}
                            className={`chip ${packaging === p ? 'active' : ''}`}
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
                        {t('Required Documents & Certifications', 'જરૂરી પ્રમાણપત્રો')}
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {cropAttr.certifications.map(c => {
                          const isSelected = certifications.includes(c);
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => toggleCert(c)}
                              className={`chip ${isSelected ? 'active' : ''}`}
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
                    <div style={{ background: '#FFF8E1', borderRadius: 12, padding: '12px 16px', fontSize: '0.8125rem', color: '#78350F', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Info size={15} />
                      <span>{t('Standard Commercial MOQ:', 'ન્યૂનતમ લોટ સાઈઝ (MOQ):')} <strong>{cropAttr.moq}</strong></span>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================ */}
              {/* Step 2: Quantity & Target Price                              */}
              {/* ============================================================ */}
              {step === 2 && (
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>
                    {t('Quantity & Target Buying Price', 'જથ્થો અને લક્ષ્ય ભાવ')}
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Quantity Field */}
                    <div>
                      <label className="form-label" style={{ marginBottom: 10, fontWeight: 600 }}>
                        {t('Required Total Quantity', 'જરૂરી કુલ જથ્થો')} *
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
                            className="stepper-input"
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
                              className={`chip ${unit === u ? 'active' : ''}`}
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
                          {t('Target Buying Price (₹/kg)', 'લક્ષ્ય ખરીદ ભાવ પ્રતિ કિ.ગ્રા. (₹)')} *
                        </label>
                        {mandiData && (
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {t('Mandi today:', 'મંડી આજે:')}
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
                              ₹{mandiData.today} (Use)
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
                          className="stepper-input"
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
                          <span>{lang === 'gu' ? cropAttr.priceHintGuj : cropAttr.priceHint}</span>
                        </p>
                      )}
                    </div>

                    {/* Estimated Total Budget */}
                    <div style={{ background: 'var(--green-light)', borderRadius: 16, padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {t('Estimated Total Budget', 'અંદાજિત કુલ બજેટ')}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {qty} {unit} × ₹{price}/kg
                        </span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.6rem', color: 'var(--green-primary)' }}>
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
                    {t('Destination & Delivery Terms', 'ડિલિવરી અને નિકાસ વિગતો')}
                  </h4>

                  {/* Destination */}
                  <div style={{ marginBottom: 20 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      {t('Target Export Destination', 'લક્ષ્ય નિકાસ દેશ')}
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {DESTINATIONS.map(d => (
                        <button
                          key={d.country}
                          type="button"
                          onClick={() => setDest(d)}
                          className={`chip ${dest.country === d.country ? 'active' : ''}`}
                          style={{ padding: '9px 10px', fontSize: '0.85rem', textAlign: 'center', justifyContent: 'center' }}
                        >
                          {d.flag} {lang === 'gu' ? d.guj : d.country.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Mode */}
                  <div style={{ marginBottom: 20 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      {t('Delivery Mode Preference', 'ડિલિવરી શરતો')}
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
                          {lang === 'gu' ? mode.guj : mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Terms */}
                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      {t('Payment Terms Offered to Farmers', 'ચુકવણી શરતો')}
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
                      {t('Required By / Deadline Date', 'જરૂરી તારીખ')}
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={deadline}
                      onChange={e => setDeadline(e.target.value)}
                    />
                  </div>

                  {/* Notes */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      {t('Special Instructions / Notes for Farmers', 'ખેડૂતો માટે વિશેષ સૂચના / નોંધ')}
                    </label>
                    <textarea
                      rows={3}
                      className="form-input"
                      placeholder={t('e.g. Ready stock preferred. Farm inspection available. Clean sortex lots get fast payment.', 'દા.ત. તૈયાર માલ જોઈએ છે. ખેતરેથી તપાસણી ઉપલબ્ધ. સૉર્ટેક્સ માલ માટે ઝડપી ચુકવણી.')}
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
                    {t('Requirement Preview', 'માંગણી પૂર્વાવલોકન')}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                    {t('Review all crop attributes and terms before publishing to Gujarat farmers.', 'પ્રકાશિત કરતા પહેલા તમામ વિગતો ચકાસી લો.')}
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
                        }}
                      >
                        {cropObj.emoji}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <h4 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>
                            {lang === 'gu' ? cropObj.guj : cropObj.name}
                          </h4>
                          {urgency === 'urgent' && (
                            <span className="badge badge-red" style={{ fontSize: '0.75rem' }}>
                              🔥 {t('Urgent', 'તાત્કાલિક')}
                            </span>
                          )}
                          <span className="badge badge-blue">
                            {dest.flag} {dest.country}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          📍 {delivery} • {payment}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 900, color: 'var(--green-primary)' }}>
                          ₹{price}/kg
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          {qty} {unit} {t('demanded', 'માંગ')}
                        </div>
                      </div>
                    </div>

                    {/* Spec Chips Row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      {grade && (
                        <span className="badge badge-green">
                          🏷️ {cropAttr.grades?.find(g => g.value === grade)?.label || grade}
                        </span>
                      )}
                      {packaging && (
                        <span className="badge">
                          📦 {packaging}
                        </span>
                      )}
                      {organic && (
                        <span className="badge badge-green">
                          🌱 {t('Organic Certified', 'ઓર્ગેનિક')}
                        </span>
                      )}
                      {exportReady && (
                        <span className="badge" style={{ background: '#E3F2FD', color: '#1565C0' }}>
                          ✈️ {t('Export Grade', 'નિકાસ ગ્રેડ')}
                        </span>
                      )}
                      {Object.entries(specValues).filter(([, v]) => v).map(([k, v]) => (
                        <span key={k} className="badge">
                          {v}
                        </span>
                      ))}
                      {certifications.map(c => (
                        <span key={c} className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
                          📜 {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.875rem' }}>
                    {[
                      [t('Crop', 'પાક'), lang === 'gu' ? cropObj.guj : cropObj.name],
                      [t('Required Grade', 'ગ્રેડ'), cropAttr.grades?.find(g => g.value === grade)?.label || grade || '—'],
                      [t('Target Quantity', 'જથ્થો'), `${qty} ${unit}`],
                      [t('Target Buying Price', 'ખરીદ ભાવ'), `₹${price}/kg`],
                      [t('Total Estimated Budget', 'કુલ બજેટ'), `₹${totalValue}`],
                      [t('Destination', 'દેશ'), `${dest.flag} ${dest.country}`],
                      [t('Delivery Mode', 'ડિલિવરી'), delivery],
                      [t('Payment Terms', 'ચુકવણી શરત'), payment],
                      [t('Packaging', 'પેકિંગ'), packaging || 'Standard'],
                      [t('Required Date', 'તારીખ'), deadline || 'Within 30 days'],
                    ].map(([label, val]) => (
                      <div key={label} style={{ background: 'var(--bg-page)', borderRadius: 10, padding: '10px 14px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
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
                <span>{t('Back', 'પાછળ')}</span>
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
                <span>{t('Next Step', 'આગળ')}</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <SpinnerBtn
                loading={loading}
                onClick={handlePublish}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Check size={16} />
                <span>{t('Publish Buying Requirement', 'ખરીદી માંગણી પ્રકાશિત કરો')}</span>
              </SpinnerBtn>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
