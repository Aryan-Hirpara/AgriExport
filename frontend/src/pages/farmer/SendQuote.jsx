import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Send, ShieldCheck, ChevronLeft, Building2, MapPin, CheckCircle2 } from 'lucide-react';
import { FadeUpItem, SpinnerBtn } from '../../components/common/AnimatedComponents';
import api from '../../services/api';

export default function SendQuote() {
  const { id } = useParams();
  const { addToast, buyerRequirements = [], submitQuoteToRequirement } = useApp();
  const navigate = useNavigate();

  const [dbReq, setDbReq] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const cleanId = String(id).replace('br', '');
    api.requirements.getById(cleanId)
      .then(res => {
        if (res.data) setDbReq(res.data);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [id]);

  const req = buyerRequirements.find(r => r.id === id || r.dbId === id || String(r.dbId) === String(id)) || dbReq;

  const [price, setPrice] = useState(65);
  const [qty, setQty] = useState(5);
  const [delivery, setDelivery] = useState('Ex-Farm Pickup');
  const [payment, setPayment] = useState('30% Advance, 70% on weight slip');
  const [validDays, setValidDays] = useState(7);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (req) {
      if (req.targetPrice) setPrice(req.targetPrice);
      if (req.qty) setQty(Math.min(5, req.qty));
      if (req.deliveryTerms) setDelivery(req.deliveryTerms);
      if (req.paymentTerms) setPayment(req.paymentTerms);
    }
  }, [req]);

  const total = (Number(price) * Number(qty) * 1000).toLocaleString('en-IN');

  const handleSend = () => {
    if (!price || !qty) {
      addToast('Please provide both quantity and price', 'warning');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      if (submitQuoteToRequirement && req) {
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
          `Quote submitted to ${req?.enterpriseName || 'Buyer'}! (₹${price}/kg for ${qty} tons)`,
          'success'
        );
        navigate(`/farmer/requirement/${req?.id || id}`);
      }, 1400);
    }, 1200);
  };

  if (!req) {
    if (fetching) {
      return (
        <div className="page-wrapper" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading requirement details...</p>
        </div>
      );
    }

    return (
      <div className="page-wrapper" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 500 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🌾</div>
          <h2 style={{ marginBottom: 12 }}>Requirement Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            The requested requirement does not exist.
          </p>
          <Link to="/farmer/find-buyers" className="btn btn-primary">
            Back to Buyer Demands
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card card-body"
          style={{ maxWidth: 440, textAlign: 'center', padding: 48 }}
        >
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-light)', color: 'var(--green-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={36} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>
            Quote Submitted Successfully!
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            {`Your quote of ₹${price}/kg for ${qty} ton has been sent to ${req.enterpriseName}. They will review and notify you.`}
          </p>
          <div className="notranslate" style={{ background: 'var(--bg-page)', borderRadius: 12, padding: 16, marginBottom: 24, fontSize: '0.9rem' }}>
            <div>Offered Price: <strong>₹{price}/kg</strong></div>
            <div>Quantity: <strong>{qty} ton</strong></div>
            <div>Estimated Value: <strong>₹{total}</strong></div>
          </div>
          <Link to="/farmer/find-buyers" className="btn btn-primary btn-full">
            Browse More Demands
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        {/* Back Button */}
        <Link
          to={`/farmer/requirement/${req.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-secondary)',
            fontWeight: 500,
            marginBottom: 24,
            textDecoration: 'none',
          }}
        >
          <ChevronLeft size={20} /> Back to Requirement
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'flex-start' }}>
          {/* Main Form */}
          <FadeUpItem>
            <div className="card card-body">
              <div style={{ marginBottom: 28 }}>
                <span className="badge badge-amber" style={{ marginBottom: 8, display: 'inline-block' }}>
                  ⚡ Submit Price Quote
                </span>
                <h2 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 6px' }}>
                  Send Quote for {req.cropName || req.title}
                </h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                  Buyer: <strong>{req.enterpriseName}</strong> • Target Price: <span className="notranslate" style={{ color: 'var(--green-primary)', fontWeight: 700 }}>₹{req.targetPrice}/kg</span>
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Price and Quantity */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">
                      Your Offered Price (₹/kg) <span style={{ color: 'var(--red)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>₹</span>
                      <input
                        type="number"
                        className="form-input"
                        style={{ paddingLeft: 32 }}
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="315"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Quantity to Supply (Tons) <span style={{ color: 'var(--red)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      value={qty}
                      onChange={e => setQty(e.target.value)}
                      placeholder="5"
                    />
                  </div>
                </div>

                {/* Delivery Mode */}
                <div className="form-group">
                  <label className="form-label">Delivery Arrangement</label>
                  <select
                    className="form-select"
                    value={delivery}
                    onChange={e => setDelivery(e.target.value)}
                  >
                    <option value="Ex-Farm Pickup">🚜 Ex-Farm Pickup (Buyer arranges transport from your farm)</option>
                    <option value="Mandi / Yard Delivery">🚚 Mandi / APMC Yard Delivery</option>
                    <option value="Port CFS / FOB Delivery">🚢 Port CFS Delivery (Mundra / Kandla)</option>
                  </select>
                </div>

                {/* Payment Terms */}
                <div className="form-group">
                  <label className="form-label">Requested Payment Terms</label>
                  <select
                    className="form-select"
                    value={payment}
                    onChange={e => setPayment(e.target.value)}
                  >
                    <option value="30% Advance, 70% on weight slip">30% Advance, 70% on weight slip</option>
                    <option value="100% on crate / truck loading">100% on crate / truck loading</option>
                    <option value="Payment within 48h of quality approval">Payment within 48h of quality approval</option>
                    <option value="Direct RTGS on delivery">Direct RTGS on delivery</option>
                  </select>
                </div>

                {/* Validity */}
                <div className="form-group">
                  <label className="form-label">Quote Validity</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[3, 7, 14, 30].map(d => (
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

                {/* Notes */}
                <div className="form-group">
                  <label className="form-label">Short Note (Optional)</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Ready stock available. Sun-dried, machine cleaned, 50kg bag packing ready."
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
                  Quote Summary
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
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Total Deal Value</p>
                  <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--green-primary)' }}>₹{total}</p>
                </div>

                <SpinnerBtn
                  loading={loading}
                  success={success}
                  onClick={handleSend}
                  className="btn btn-primary btn-full btn-lg"
                >
                  <Send size={18} /> Submit Quote Now
                </SpinnerBtn>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
                  Enterprise will receive your quote and contact you directly.
                </p>
              </div>
            </FadeUpItem>
          </div>
        </div>
      </div>
    </div>
  );
}
