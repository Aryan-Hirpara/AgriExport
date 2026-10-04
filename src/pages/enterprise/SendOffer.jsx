import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Send, ShieldCheck, ChevronLeft, Info, Check, Package, Sparkles } from 'lucide-react';
import { LISTINGS, FARMERS, MANDI_PRICES_HISTORY, CROPS } from '../../data/sampleData';
import { FadeUpItem, SpinnerBtn } from '../../components/common/AnimatedComponents';
import cropAttributes from '../../data/crop_attributes.json';

export default function SendOffer() {
  const { listingId } = useParams();
  const { addToast, produceListings, addEnterpriseOffer } = useApp();
  const navigate = useNavigate();

  const allListings = produceListings && produceListings.length > 0 ? produceListings : LISTINGS;
  const listing = allListings.find(l => l.id === listingId) || allListings[0];
  const farmer = FARMERS.find(f => f.id === listing.farmerId) || FARMERS[0];

  const cropKey = listing.crop || 'jeera';
  const cropAttr = cropAttributes[cropKey] || {};
  const cropObj = CROPS.find(c => c.id === cropKey) || CROPS[0];
  const mandiData = MANDI_PRICES_HISTORY.crops.find(c => c.id === cropKey);

  // Form State
  const [price, setPrice] = useState(Math.max(1, listing.price - 5));
  const [qty, setQty] = useState(Math.min(5, listing.qty));
  const [selectedGrade, setSelectedGrade] = useState(listing.grade || cropAttr.grades?.[0]?.label || 'Standard');
  const [selectedPackaging, setSelectedPackaging] = useState(listing.specs?.packaging || cropAttr.packaging?.[0] || 'Standard Packing');
  const [qualityChecks, setQualityChecks] = useState(['moistureVerified', 'weightSlipRequired']);
  const [delivery, setDelivery] = useState('Pickup from farm');
  const [payment, setPayment] = useState('50% advance, 50% on delivery');
  const [validDays, setValidDays] = useState(7);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const total = useMemo(() => {
    const mult = listing.unit === 'ton' ? 1000 : listing.unit === 'quintal' ? 100 : 1;
    return (Number(price) * Number(qty) * mult).toLocaleString('en-IN');
  }, [price, qty, listing.unit]);

  const toggleCheck = (id) => {
    setQualityChecks(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    setLoading(true);

    if (addEnterpriseOffer) {
      addEnterpriseOffer({
        listingId: listing.id,
        farmerId: listing.farmerId,
        farmerName: farmer.name,
        village: listing.village,
        district: listing.district,
        crop: listing.crop,
        cropName: listing.cropName,
        emoji: listing.photos?.[0] || cropObj.emoji,
        grade: selectedGrade,
        offeredPrice: Number(price),
        expectedPrice: Number(listing.price),
        qty: Number(qty),
        unit: listing.unit || 'ton',
        deliveryTerms: delivery,
        paymentTerms: payment,
        validDays,
        message,
        specs: listing.specs || {},
      });
    }

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        addToast(
          `Offer of ₹${price}/kg sent to ${farmer.name}! 🎉`,
          'success'
        );
        navigate('/enterprise/offers');
      }, 1200);
    }, 1400);
  };

  if (success) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{ textAlign: 'center', padding: 48, background: '#fff', borderRadius: 24, boxShadow: 'var(--shadow-lg)', maxWidth: 460, width: '100%' }}
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 400 }} style={{ fontSize: '5rem', marginBottom: 16 }}>
            ✈️
          </motion.div>
          <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8, color: 'var(--green-primary)' }}>
            Offer Sent Successfully!
          </h3>
          <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>
            Your offer of ₹{price}/kg for {qty} {listing.unit} to {farmer.name} is on its way. You'll be notified when they respond.
          </p>
          <div style={{ background: 'var(--green-light)', borderRadius: 14, padding: 16, textAlign: 'left' }}>
            <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--green-primary)' }}>
              {listing.cropName} • <span className="notranslate">{qty} {listing.unit}</span> ({selectedGrade})
            </p>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              <span className="notranslate">₹{price}/kg</span> → Total: <span className="notranslate">₹{total}</span>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header Banner */}
      <div style={{ background: 'var(--green-primary)', padding: '32px 0 48px', color: '#fff' }}>
        <div className="container">
          <Link
            to={`/produce/${listing.id}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginBottom: 12, textDecoration: 'none' }}
          >
            <ChevronLeft size={18} /> Back to Listing
          </Link>
          <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)', margin: '0 0 6px' }}>
            Send Buying Offer
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0 }}>
            to {farmer.name} • {listing.cropName}
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: -20, paddingBottom: 40 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'flex-start' }}>
          
          <FadeUpItem>
            <div className="card card-body">
              {/* Listing Overview Card */}
              <div style={{ background: 'var(--green-light)', borderRadius: 16, padding: '18px 20px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ fontSize: '3rem', width: 64, height: 64, background: '#fff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {listing.photos?.[0] || cropObj.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 4px' }}>
                    {listing.cropName}
                  </h4>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span className="badge badge-green notranslate">{listing.grade}</span>
                    {listing.organic && <span className="badge badge-green">🌱 Organic</span>}
                    {listing.exportReady && <span className="badge badge-blue">✈️ Export Ready</span>}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    📍 {listing.village}, {listing.district} • <span className="notranslate">{listing.qty} {listing.unit}</span> available • Asking: <strong className="notranslate">₹{listing.price}/kg</strong>
                  </p>
                </div>
              </div>

              {/* Farmer Info */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24, padding: '14px', background: '#F8FAFC', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '2rem' }}>{farmer.avatar || '👨‍🌾'}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{farmer.name}</span>
                    {farmer.verified && <ShieldCheck size={16} color="var(--green-primary)" />}
                  </div>
                  <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-muted)' }}>
                    📍 {farmer.village}, {farmer.district || 'Gujarat'} • ⭐ {farmer.rating} ({farmer.reviews} reviews)
                  </p>
                </div>
              </div>

              {/* Listing's Existing Specifications (from AddProduce) */}
              {listing.specs && Object.keys(listing.specs).length > 0 && (
                <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '14px 18px', marginBottom: 24, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <h5 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      📋 Farmer’s Listed Specifications
                    </h5>
                    <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>✓ Verified</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {Object.entries(listing.specs).map(([key, val]) => (
                      <span key={key} className="badge" style={{ background: '#fff', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
                        <strong>{key}:</strong> <span className="notranslate">{String(val)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Offer Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                
                {/* 1. Price */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label className="form-label" style={{ fontWeight: 600, margin: 0 }}>
                      Your Offer Price (₹/kg) *
                    </label>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Farmer ask: <strong className="notranslate">₹{listing.price}</strong>
                      {mandiData && (
                        <button
                          type="button"
                          onClick={() => setPrice(mandiData.today)}
                          style={{ marginLeft: 8, border: 'none', background: 'var(--green-light)', color: 'var(--green-primary)', fontWeight: 700, borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          Mandi <span className="notranslate">₹{mandiData.today}</span>
                        </button>
                      )}
                    </span>
                  </div>
                  <div className="stepper">
                    <button type="button" className="stepper-btn" onClick={() => setPrice(p => Math.max(1, p - 1))}>−</button>
                    <input className="stepper-input notranslate" type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
                    <button type="button" className="stepper-btn" onClick={() => setPrice(p => p + 1)}>+</button>
                  </div>
                  {price < listing.price && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--amber)', marginTop: 6, margin: '6px 0 0' }}>
                      ⚡ <span className="notranslate">₹{listing.price - price}/kg</span> below asking price — farmer may counter-offer.
                    </p>
                  )}
                  {price >= listing.price && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--green-primary)', marginTop: 6, margin: '6px 0 0' }}>
                      ✓ Matches or exceeds asking price — high probability of quick deal!
                    </p>
                  )}
                </div>

                {/* 2. Quantity */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label className="form-label" style={{ fontWeight: 600, margin: 0 }}>
                      Quantity ({listing.unit}) *
                    </label>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Available: <strong className="notranslate">{listing.qty} {listing.unit}</strong>
                    </span>
                  </div>
                  <div className="stepper">
                    <button type="button" className="stepper-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                    <input className="stepper-input notranslate" type="number" value={qty} onChange={e => setQty(Math.min(listing.qty, Math.max(1, Number(e.target.value))))} />
                    <button type="button" className="stepper-btn" onClick={() => setQty(q => Math.min(listing.qty, q + 1))}>+</button>
                  </div>
                </div>

                {/* 3. Crop-Specific Quality & Spec Confirmation (Driven by crop_attributes.json) */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Sparkles size={16} color="var(--green-primary)" />
                    <label className="form-label" style={{ fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      Offer Specifications & Grade Requirements
                    </label>
                  </div>

                  {/* Grade Chips */}
                  {cropAttr.grades && cropAttr.grades.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Required Quality Grade:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {cropAttr.grades.map(g => (
                          <button
                            key={g.value}
                            type="button"
                            onClick={() => setSelectedGrade(g.label)}
                            className={`chip notranslate ${selectedGrade === g.label ? 'active' : ''}`}
                            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Packaging Preference Chips */}
                  {cropAttr.packaging && cropAttr.packaging.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Required Packaging:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {cropAttr.packaging.map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setSelectedPackaging(p)}
                            className={`chip notranslate ${selectedPackaging === p ? 'active' : ''}`}
                            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                          >
                            📦 {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quality Assurance Conditions */}
                  <div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                      Quality Checks & Inspection Terms:
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        { id: 'moistureVerified', label: 'Moisture meter test at loading' },
                        { id: 'weightSlipRequired', label: 'APMC computerised weight slip' },
                        { id: 'cleanLot', label: 'Machine cleaned / Sortex lot' },
                        { id: 'farmgateInspection', label: 'Pre-dispatch farmgate sampling' },
                      ].map(item => {
                        const checked = qualityChecks.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleCheck(item.id)}
                            className={`chip ${checked ? 'active' : ''}`}
                            style={{ fontSize: '0.78rem', padding: '8px 10px', justifyContent: 'flex-start', textAlign: 'left' }}
                          >
                            <span style={{ marginRight: 4 }}>{checked ? '✓' : '+'}</span>
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. Delivery Terms */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Delivery Mode
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['Pickup from farm', 'Delivered to Warehouse/APMC'].map(d => (
                      <button
                        key={d}
                        type="button"
                        className={`chip ${delivery === d ? 'active' : ''}`}
                        onClick={() => setDelivery(d)}
                        style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                      >
                        {d === 'Pickup from farm' ? '🚜 ' : '🚚 '}
                        {d === 'Pickup from farm' ? 'Pickup from farm' : 'Delivered to Yard'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Payment Terms */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Payment Terms
                  </label>
                  <select
                    className="form-select"
                    value={payment}
                    onChange={e => setPayment(e.target.value)}
                  >
                    {[
                      '100% advance on inspection',
                      '50% advance, 50% on delivery',
                      'Payment within 48h of weight slip',
                      'Direct APMC Electronic Transfer',
                    ].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* 6. Validity */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Offer Valid For
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[3, 7, 14].map(d => (
                      <button
                        key={d}
                        type="button"
                        className={`chip ${validDays === d ? 'active' : ''}`}
                        onClick={() => setValidDays(d)}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        {d} days
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7. Message */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Message to Farmer (Optional)
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={`Hi ${farmer.name}, we are interested in your ${listing.cropName} lot. Looking for prompt delivery.`}
                  />
                </div>
              </div>
            </div>
          </FadeUpItem>

          {/* Sticky Summary Sidebar */}
          <div style={{ position: 'sticky', top: 88 }}>
            <FadeUpItem>
              <div className="card card-body">
                <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>
                  Offer Summary
                </h4>
                {[
                  { label: 'Crop', value: listing.cropName, notranslate: false },
                  { label: 'Target Grade', value: selectedGrade, notranslate: true },
                  { label: 'Offered Price', value: `₹${price}/kg`, notranslate: true },
                  { label: 'Quantity', value: `${qty} ${listing.unit}`, notranslate: true },
                  { label: 'Packaging', value: selectedPackaging, notranslate: true },
                  { label: 'Delivery', value: delivery, notranslate: false },
                  { label: 'Payment', value: payment, notranslate: false },
                  { label: 'Validity', value: `${validDays} days`, notranslate: false },
                ].map(item => (
                  <div
                    key={item.label}
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}
                  >
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.label}</span>
                    <strong className={item.notranslate ? 'notranslate' : ''} style={{ fontSize: '0.85rem', color: 'var(--text-primary)', textAlign: 'right', maxWidth: 180 }}>
                      {item.value}
                    </strong>
                  </div>
                ))}

                {/* Total Value */}
                <div style={{ background: 'var(--green-light)', borderRadius: 14, padding: '16px 18px', margin: '16px 0 20px' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Estimated Total Deal Value
                  </p>
                  <p className="notranslate" style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.6rem', color: 'var(--green-primary)' }}>
                    ₹{total}
                  </p>
                </div>

                <SpinnerBtn
                  loading={loading}
                  success={success}
                  onClick={handleSend}
                  className="btn btn-primary btn-full btn-lg"
                >
                  <Send size={18} /> Send Offer Now
                </SpinnerBtn>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
                  Farmer can accept, counter-offer, or decline. Direct chat opens upon acceptance.
                </p>
              </div>
            </FadeUpItem>
          </div>

        </div>
      </div>
    </div>
  );
}
