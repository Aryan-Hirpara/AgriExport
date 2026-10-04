import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Send, ShieldCheck, ChevronLeft, Building2, MapPin, CheckCircle2 } from 'lucide-react';
import { BUYER_REQUIREMENTS, ENTERPRISES } from '../../data/sampleData';
import { FadeUpItem, SpinnerBtn } from '../../components/common/AnimatedComponents';

export default function SendQuote() {
  const { id } = useParams();
  const { addToast, buyerRequirements, submitQuoteToRequirement } = useApp();
  const navigate = useNavigate();

  const reqList = buyerRequirements && buyerRequirements.length > 0 ? buyerRequirements : BUYER_REQUIREMENTS;
  const req = reqList.find(r => r.id === id) || reqList[0];
  const enterprise = ENTERPRISES.find(e => e.id === req.enterpriseId || e.name === req.enterpriseName) || ENTERPRISES[0];

  const [price, setPrice] = useState(req.targetPrice || 65);
  const [qty, setQty] = useState(Math.min(5, req.qty || 10));
  const [delivery, setDelivery] = useState('Ex-Farm Pickup');
  const [payment, setPayment] = useState('30% Advance, 70% on weight slip');
  const [validDays, setValidDays] = useState(7);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const total = (price * qty * 1000).toLocaleString('en-IN');

  const handleSend = () => {
    if (!price || !qty) {
      addToast('Please provide both quantity and price', 'warning');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      if (submitQuoteToRequirement) {
        submitQuoteToRequirement(req.id, {
          qty: Number(qty),
          price: Number(price),
          delivery,
          payment,
          validDays,
          notes,
        });
      }

      setTimeout(() => {
        addToast(
          `Quote submitted to ${req.enterpriseName}! (₹${price}/kg for ${qty} tons)`,
          'success'
        );
        navigate(`/farmer/requirement/${req.id}`);
      }, 1400);
    }, 1200);
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
            🌾
          </motion.div>
          <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8, color: 'var(--green-primary)' }}>
            {'Quote Submitted!'}
          </h3>
          <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>
            {`Your quote of ₹${price}/kg for ${qty} ton has been sent to ${req.enterpriseName}. They will review and contact you directly.`}
          </p>
          <div style={{ background: 'var(--green-light)', borderRadius: 12, padding: 16, textAlign: 'left' }}>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--green-primary)' }}>
              {req.cropName} • {qty} ton ({delivery})
            </p>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              ₹{price}/kg → Total ₹{total}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Top Banner */}
      <div style={{ background: 'var(--green-primary)', padding: '32px 0 48px', color: '#fff' }}>
        <div className="container">
          <Link
            to={`/farmer/requirement/${req.id}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginBottom: 14, textDecoration: 'none' }}
          >
            <ChevronLeft size={18} /> {'Back to Requirement'}
          </Link>
          <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)', margin: '0 0 6px' }}>
            {'Send Quote for Produce'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0 }}>
            {'to'} {req.enterpriseName} • {req.cropName}
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: -20, paddingBottom: 40 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'flex-start' }}>
          
          {/* Main Form Column */}
          <FadeUpItem>
            <div className="card card-body">
              {/* Requirement Summary Card */}
              <div style={{ background: 'var(--green-light)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ fontSize: '3rem' }}>{req.emoji || '🌾'}</div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 4px' }}>
                    {req.cropName}
                  </h4>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className="badge badge-blue">
                      📦 {req.qty} {req.unit || 'ton'} {'Demanded'}
                    </span>
                    {req.destination && (
                      <span className="badge badge-amber">
                        {req.flag || '✈️'} {req.destination}
                      </span>
                    )}
                    {req.urgency === 'urgent' && (
                      <span className="badge badge-red">
                        🔥 {'Urgent'}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    📍 {req.deliveryTerms} • {'Buyer Target Price:'} <strong>₹{req.targetPrice}/kg</strong>
                  </p>
                </div>
              </div>

              {/* Enterprise Info */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24, padding: '14px', background: 'var(--bg-page)', borderRadius: 12 }}>
                <div style={{ fontSize: '2rem' }}>{req.logo || enterprise.logo || '🏢'}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {req.enterpriseName}
                    </span>
                    {req.verified && <ShieldCheck size={15} color="var(--green-primary)" />}
                  </div>
                  <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-muted)' }}>
                    📍 {req.city || enterprise.city || 'Gujarat'} • ⭐ {enterprise.rating || 4.8} ({enterprise.reviews || 42} reviews)
                  </p>
                </div>
              </div>

              {/* Buyer Demanded Specifications */}
              {req.specs && Object.keys(req.specs).length > 0 && (
                <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '14px 18px', marginBottom: 24, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h5 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      📋 {'Required Quality Specifications'}
                    </h5>
                    <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>Buyer Demand</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {Object.entries(req.specs).filter(([, v]) => v).map(([key, val]) => (
                      <span key={key} className="badge" style={{ background: '#fff', border: '1px solid var(--border)', fontSize: '0.8rem', color: '#1E293B' }}>
                        <strong>{key}:</strong> {String(val)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quote Form Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Quoted Price */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <label className="form-label">
                      {'Your Quoted Price (₹/kg)'} *
                    </label>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {'Buyer Target:'} <strong>₹{req.targetPrice}</strong>
                    </span>
                  </div>
                  <div className="stepper">
                    <button className="stepper-btn" onClick={() => setPrice(p => Math.max(1, p - 1))}>−</button>
                    <input className="stepper-input" type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
                    <button className="stepper-btn" onClick={() => setPrice(p => p + 1)}>+</button>
                  </div>
                  {price > req.targetPrice && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--amber)', marginTop: 6 }}>
                      ⚡ ₹{price - req.targetPrice}/kg above buyer target — buyer may counter or negotiate
                    </p>
                  )}
                  {price <= req.targetPrice && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--green-primary)', marginTop: 6 }}>
                      ✓ Matches or beats buyer target price! High chance of immediate acceptance.
                    </p>
                  )}
                </div>

                {/* Offered Quantity */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <label className="form-label">{'Quantity You Can Supply (Tons)'} *</label>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Total needed: <strong>{req.qty} ton</strong>
                    </span>
                  </div>
                  <div className="stepper">
                    <button className="stepper-btn" onClick={() => setQty(q => Math.max(0.5, q - 0.5))}>−</button>
                    <input className="stepper-input" type="number" step="0.5" value={qty} onChange={e => setQty(Number(e.target.value))} />
                    <button className="stepper-btn" onClick={() => setQty(q => q + 0.5)}>+</button>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {'You can supply partial or full required lot'}
                  </p>
                </div>

                {/* Delivery Terms */}
                <div className="form-group">
                  <label className="form-label">{'Delivery Mode'}</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['Ex-Farm Pickup', 'Farmer Delivery to APMC/Yard'].map(d => (
                      <button
                        key={d}
                        type="button"
                        className={`chip ${delivery === d ? 'active' : ''}`}
                        onClick={() => setDelivery(d)}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        {d === 'Ex-Farm Pickup' ? '🚜 ' : '🚚 '}
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="form-group">
                  <label className="form-label">{'Payment Preference'}</label>
                  <select className="form-select" value={payment} onChange={e => setPayment(e.target.value)}>
                    {[
                      '30% Advance, 70% on weight slip',
                      '100% immediate on delivery & inspection',
                      '50% Advance, 50% on dispatch',
                      'Direct APMC Electronic Transfer',
                    ].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Quote Validity */}
                <div className="form-group">
                  <label className="form-label">{'Quote Valid For'}</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[3, 7, 14].map(d => (
                      <button
                        key={d}
                        type="button"
                        className={`chip ${validDays === d ? 'active' : ''}`}
                        onClick={() => setValidDays(d)}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        {d} {'days'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="form-group">
                  <label className="form-label">{'Short Note (Optional)'}</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder={'e.g. Ready stock in Unjha warehouse. Sun-dried, machine cleaned, 50kg bag packing ready.'}
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
                  {'Quote Summary'}
                </h4>
                {[
                  { label: 'Offered Price', value: `₹${price}/kg` },
                  { label: 'Quantity', value: `${qty} ton` },
                  { label: 'Delivery', value: delivery },
                  { label: 'Payment', value: payment },
                  { label: 'Validity', value: `${validDays} days` },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{item.label}</span>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', textAlign: 'right', maxWidth: 180 }}>{item.value}</strong>
                  </div>
                ))}

                {/* Total Value */}
                <div style={{ background: 'var(--green-light)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{'Estimated Total Deal Value'}</p>
                  <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--green-primary)' }}>₹{total}</p>
                </div>

                <SpinnerBtn
                  loading={loading}
                  success={success}
                  onClick={handleSend}
                  className="btn btn-primary btn-full btn-lg"
                >
                  <Send size={18} /> {'Submit Quote Now'}
                </SpinnerBtn>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
                  {'Enterprise will receive your quote and contact you directly.'}
                </p>
              </div>
            </FadeUpItem>
          </div>

        </div>
      </div>
    </div>
  );
}
