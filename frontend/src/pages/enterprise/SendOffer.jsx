import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Send, ShieldCheck, ChevronLeft, Info, Check, Package, Sparkles } from 'lucide-react';
import { FadeUpItem, SpinnerBtn } from '../../components/common/AnimatedComponents';
import cropAttributes from '../../data/crop_attributes.json';
import api from '../../services/api';
import { getCropImage } from '../../utils/cropImages';

export default function SendOffer() {
  const { listingId } = useParams();
  const { addToast, produceListings = [], crops = [], mandiPrices = [], addEnterpriseOffer } = useApp();
  const navigate = useNavigate();

  const [dbListing, setDbListing] = useState(null);
  const [loadingListing, setLoadingListing] = useState(true);

  useEffect(() => {
    const cleanId = String(listingId).replace('l', '');
    api.listings.getById(cleanId)
      .then(res => {
        if (res.data) setDbListing(res.data);
      })
      .catch(() => {})
      .finally(() => setLoadingListing(false));
  }, [listingId]);

  const listing = dbListing || produceListings.find(l => l.id === listingId || l.dbId === listingId || String(l.dbId) === String(listingId) || String(l.id) === String(listingId));

  const farmer = listing?.farmer || {
    name: 'Farmer',
    village: listing?.village || '',
    district: listing?.district || '',
    rating: 5.0,
    verified: true,
  };

  const cropKey = listing?.crop || 'jeera';
  const cropAttr = cropAttributes[cropKey] || {};
  const cropObj = crops.find(c => (c.slug || c.id) === cropKey) || { name: listing?.cropName || 'Crop', emoji: '🌾' };
  const mandiData = mandiPrices.find(c => c.cropSlug === cropKey);

  // Form State
  const [price, setPrice] = useState(300);
  const [qty, setQty] = useState(5);
  const [selectedGrade, setSelectedGrade] = useState('Standard');
  const [selectedPackaging, setSelectedPackaging] = useState('Standard Packing');
  const [qualityChecks, setQualityChecks] = useState(['moistureVerified', 'weightSlipRequired']);
  const [delivery, setDelivery] = useState('Pickup from farm');
  const [payment, setPayment] = useState('50% advance, 50% on delivery');
  const [validDays, setValidDays] = useState(7);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (listing) {
      setPrice(listing.price != null ? Number(listing.price) : 0);
      setQty(listing.qty != null ? Number(listing.qty) : (listing.quantity != null ? Number(listing.quantity) : 1));
      setSelectedGrade(listing.grade || cropAttr.grades?.[0]?.label || 'Standard');
      setSelectedPackaging(listing.specs?.packaging || cropAttr.packaging?.[0] || 'Standard Packing');
    }
  }, [listing]);

  const total = useMemo(() => {
    if (!listing) return '0';
    const mult = listing.unit === 'ton' ? 1000 : listing.unit === 'quintal' ? 100 : 1;
    return (Number(price) * Number(qty) * mult).toLocaleString('en-IN');
  }, [price, qty, listing]);

  const toggleCheck = (id) => {
    setQualityChecks(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    setLoading(true);

    if (addEnterpriseOffer && listing) {
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
        validity: `${validDays} days`,
        message,
        specs: { grade: selectedGrade, packaging: selectedPackaging },
      });
    }

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        addToast(`Offer sent to ${farmer.name}!`, 'success');
        navigate('/enterprise/offers');
      }, 1500);
    }, 1200);
  };

  if (!listing) {
    if (loadingListing) {
      return (
        <div className="page-wrapper" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading produce listing details...</p>
        </div>
      );
    }

    return (
      <div className="page-wrapper" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 500 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🌾</div>
          <h2 style={{ marginBottom: 12 }}>Produce Listing Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            The requested produce listing does not exist or has been removed.
          </p>
          <Link to="/browse" className="btn btn-primary">
            Browse All Produce
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ paddingBottom: 80 }}>
      {/* Header Banner */}
      <div style={{ background: 'var(--green-primary)', padding: '32px 0 48px', color: '#fff' }}>
        <div className="container">
          <FadeUpItem>
            {/* Back to details link on its own top row */}
            <div style={{ marginBottom: 16 }}>
              <Link
                to={`/produce/${listing.id}`}
                style={{
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  padding: '6px 14px',
                  borderRadius: 99,
                  backdropFilter: 'blur(8px)',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
              >
                <ChevronLeft size={16} /> Back to Produce Details
              </Link>
            </div>

            {/* Section Badge on separate line */}
            <div
              className="section-label"
              style={{
                background: 'rgba(255, 255, 255, 0.18)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                marginBottom: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Sparkles size={13} /> Make Purchase Offer
            </div>

            <h2 style={{ color: '#fff', marginBottom: 6, fontFamily: 'var(--font-heading)', fontSize: '1.85rem' }}>
              Send Purchase Offer to Farmer
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0, fontSize: '0.95rem', maxWidth: 640 }}>
              Propose your procurement terms, quantity, target price, and delivery method directly to the farmer.
            </p>
          </FadeUpItem>
        </div>
      </div>

      <div className="container" style={{ marginTop: -24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'flex-start' }}>

          {/* Form */}
          <FadeUpItem>
            <div className="card card-body" style={{ padding: 28 }}>
              {/* Farmer and Produce info card from database */}
              <div style={{ background: '#f8fafc', borderRadius: 16, padding: '18px 20px', marginBottom: 24, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 260 }}>
                  {(() => {
                    const produceImg = getCropImage(listing.crop || listing.cropName, listing.photos?.[0]);
                    return (
                      <div style={{ width: 60, height: 60, borderRadius: 12, background: 'linear-gradient(135deg, var(--green-light), #C8E6C9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', flexShrink: 0, overflow: 'hidden' }}>
                        {produceImg ? (
                          <img
                            src={produceImg}
                            alt={listing.cropName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.parentElement?.querySelector('.offer-produce-fallback');
                              if (fallback) fallback.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <span className="offer-produce-fallback" style={{ display: produceImg ? 'none' : 'block' }}>
                          {cropObj.emoji || listing.emoji || '🌾'}
                        </span>
                      </div>
                    );
                  })()}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                      <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>{listing.cropName}</h4>
                      {listing.variety && (
                        <span className="badge badge-gray" style={{ fontSize: '0.72rem' }}>
                          {listing.variety}
                        </span>
                      )}
                      {listing.grade && (
                        <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                          {listing.grade}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Seller: <strong style={{ color: 'var(--text-primary)' }}>{farmer.name}</strong> {farmer.verified && <ShieldCheck size={14} color="var(--green-primary)" style={{ display: 'inline', verticalAlign: 'middle' }} />} • 📍 {[listing.village, listing.district, listing.state].filter(Boolean).join(', ') || 'India'}
                    </p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                      {listing.organic && <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>🌿 Organic Certified</span>}
                      {listing.labTested && <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>🔬 Lab Tested</span>}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', minWidth: 160 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Asking Price</div>
                  <div className="notranslate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.35rem', color: 'var(--green-primary)' }}>
                    ₹{listing.price}/kg
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Available: <strong style={{ color: 'var(--text-primary)' }}>{listing.qty?.toLocaleString('en-IN') || listing.qty} {listing.unit || 'kg'}</strong>
                  </div>
                  {listing.minOrder && Number(listing.minOrder) > 0 && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Min Order: {listing.minOrder} {listing.unit || 'kg'}
                    </div>
                  )}
                </div>
              </div>

              {/* Form fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Price and Quantity */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="form-label" style={{ margin: 0 }}>
                        Your Offered Price (₹/kg) <span style={{ color: 'var(--red)' }}>*</span>
                      </label>
                      {Number(price) !== Number(listing.price) && (
                        <button
                          type="button"
                          onClick={() => setPrice(Number(listing.price))}
                          style={{ background: 'none', border: 'none', color: 'var(--green-primary)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                          Reset to asking (₹{listing.price})
                        </button>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>₹</span>
                      <input
                        type="number"
                        className="form-input"
                        style={{ paddingLeft: 32 }}
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder={String(listing.price || 308)}
                      />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                      Original database asking price: <strong>₹{listing.price}/kg</strong>
                    </span>
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="form-label" style={{ margin: 0 }}>
                        Order Quantity ({listing.unit || 'kg'}) <span style={{ color: 'var(--red)' }}>*</span>
                      </label>
                      {Number(qty) !== Number(listing.qty) && (
                        <button
                          type="button"
                          onClick={() => setQty(Number(listing.qty))}
                          style={{ background: 'none', border: 'none', color: 'var(--green-primary)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                          Max available ({listing.qty} {listing.unit || 'kg'})
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      className="form-input"
                      value={qty}
                      onChange={e => setQty(e.target.value)}
                      placeholder={String(listing.qty || 10)}
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                      Available lot in database: <strong>{listing.qty?.toLocaleString('en-IN') || listing.qty} {listing.unit || 'kg'}</strong>
                    </span>
                  </div>
                </div>

                {/* Delivery and Payment */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Delivery Arrangement</label>
                    <select className="form-select" value={delivery} onChange={e => setDelivery(e.target.value)}>
                      <option value="Pickup from farm">🚜 Pickup from farm (Ex-Farm)</option>
                      <option value="Delivery to Mandi / Yard">🚚 Delivery to Mandi Yard</option>
                      <option value="Delivery to Warehouse">🏭 Delivery to Warehouse</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Terms</label>
                    <select className="form-select" value={payment} onChange={e => setPayment(e.target.value)}>
                      <option value="50% advance, 50% on delivery">50% advance, 50% on delivery</option>
                      <option value="100% on crate / truck loading">100% on crate / truck loading</option>
                      <option value="Direct RTGS within 24h">Direct RTGS within 24h</option>
                      <option value="30% advance, 70% on weight slip">30% advance, 70% on weight slip</option>
                    </select>
                  </div>
                </div>

                {/* Validity */}
                <div className="form-group">
                  <label className="form-label">Offer Validity</label>
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

                {/* Message */}
                <div className="form-group">
                  <label className="form-label">Message for Farmer (Optional)</label>
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
                  { label: 'Crop', value: listing.cropName },
                  { label: 'Farmer Asking Price', value: `₹${listing.price}/kg`, highlight: false },
                  { label: 'Offered Price', value: `₹${price}/kg`, highlight: true },
                  { label: 'Quantity', value: `${Number(qty || 0).toLocaleString('en-IN')} ${listing.unit || 'kg'}` },
                  { label: 'Delivery Terms', value: delivery },
                  { label: 'Payment Terms', value: payment },
                  { label: 'Offer Validity', value: `${validDays} days` },
                ].map(item => (
                  <div
                    key={item.label}
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}
                  >
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.label}</span>
                    <strong style={{ fontSize: '0.85rem', color: item.highlight ? 'var(--green-primary)' : 'var(--text-primary)', textAlign: 'right', maxWidth: 180 }}>
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
