import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Upload, CheckCircle, Clock, X } from 'lucide-react';
import { StepProgress, SpinnerBtn } from '../../components/common/AnimatedComponents';
import api from '../../services/api';

const STEPS = ['Basic Info', 'Location / Company', 'Profile Photo', 'Confirm'];

export default function Register() {
  const { loginAs, addToast, role: currentAuthRole } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialRole = params.get('role') || 'farmer';
  const [role, setRole] = useState(initialRole);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '',
    village: '', district: '', state: 'Gujarat', land: '',
    company: '', gst: '', iec: '', address: '',
    avatar: '',
  });

  const states = [
    'Gujarat', 'Maharashtra', 'Punjab', 'Haryana', 'Rajasthan', 'Madhya Pradesh',
    'Uttar Pradesh', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Tamil Nadu',
    'Kerala', 'Bihar', 'West Bengal', 'Odisha', 'Assam', 'Himachal Pradesh', 'Uttarakhand'
  ];

  const [registeredUser, setRegisteredUser] = useState(null);

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPG, PNG, or WebP).', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setForm(prev => ({ ...prev, avatar: dataUrl }));
        addToast('Photo uploaded successfully! 📸', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleNext = async () => {
    // Step 0 validation: Name, Phone, Email, Password
    if (step === 0) {
      if (!form.name || form.name.trim().length < 2) {
        addToast('Please enter your full name (minimum 2 characters)', 'warning');
        return;
      }
      const cleanPhone = (form.phone || '').replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length !== 10) {
        addToast('Please enter a valid 10-digit mobile number', 'warning');
        return;
      }
      if (role === 'enterprise') {
        if (!form.email || !form.email.includes('@') || !form.email.includes('.')) {
          addToast('Please enter a valid official email address for enterprise account', 'warning');
          return;
        }
      } else if (form.email && (!form.email.includes('@') || !form.email.includes('.'))) {
        addToast('Please enter a valid email address or leave it blank', 'warning');
        return;
      }
      if (!form.password || form.password.length < 6) {
        addToast('Please enter a password of at least 6 characters', 'warning');
        return;
      }
    }

    // Step 1 validation
    if (step === 1) {
      if (role === 'farmer') {
        if (!form.village || !form.village.trim()) {
          addToast('Please enter your village name', 'warning');
          return;
        }
      } else if (role === 'enterprise') {
        if (!form.company || !form.company.trim()) {
          addToast('Please enter your registered company name', 'warning');
          return;
        }
      }
    }

    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      setLoading(true);
      try {
        const cleanPhone = (form.phone || '').replace(/\D/g, '').slice(-10);
        const res = await api.auth.register({
          name: form.name.trim(),
          phone: cleanPhone,
          email: form.email?.trim() || undefined,
          password: form.password,
          role,
          avatar: form.avatar || (role === 'farmer' ? '🧑‍🌾' : '🏢'),
          village: form.village?.trim() || undefined,
          district: form.district || undefined,
          state: form.state || undefined,
          land_size: form.land?.trim() || undefined,
          company_name: form.company?.trim() || (role === 'enterprise' ? `${form.name.trim()} Enterprises` : undefined),
          gst_number: form.gst?.trim() || undefined,
          iec_number: form.iec?.trim() || undefined,
        });

        if (currentAuthRole === 'admin') {
          // If an Admin is testing registration, preserve the admin session!
          setRegisteredUser(res?.user);
          addToast('Applicant registered successfully! Admin session preserved.', 'info');
        } else {
          if (res?.token) {
            localStorage.setItem('token', res.token);
          }
          if (res?.user) {
            setRegisteredUser(res.user);
            loginAs(res.user.role, res.user);
          }
        }
        setSubmitted(true);
        addToast('Application submitted successfully! Our team will review your profile.', 'success');
      } catch (err) {
        addToast(err.message || 'Registration failed. Please check all fields.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...files.map(f => f.name)]);
  };

  const progress = ((step) / (STEPS.length - 1)) * 100;

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{ background: '#fff', borderRadius: 24, padding: 48, textAlign: 'center', maxWidth: 480, width: '100%', boxShadow: 'var(--shadow-lg)' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
            style={{ width: 96, height: 96, background: 'var(--amber-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '3rem' }}
          >
            ⏳
          </motion.div>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 12 }}>
            Application Submitted!
          </h2>
          <div className="verification-banner banner-pending" style={{ marginBottom: 24, justifyContent: 'center', textAlign: 'left' }}>
            <Clock size={20} color="#B45309" />
            <div>
              <p style={{ color: '#B45309', fontWeight: 600, margin: 0 }}>Verification Pending</p>
              <p style={{ fontSize: '0.8125rem', color: '#92400E', margin: 0 }}>We are checking your details. Usually takes 48 hours.</p>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.7 }}>
            You'll receive an SMS on your registered phone once verified. Meanwhile, you can browse produce.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/browse" className="btn btn-secondary">Browse Produce</Link>
            <button onClick={() => { if (registeredUser) loginAs(registeredUser.role, registeredUser); else loginAs(role); navigate(role === 'farmer' ? '/farmer/home' : '/enterprise/home'); }} className="btn btn-primary">
              Continue to Dashboard →
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ background: '#fff', borderRadius: 24, boxShadow: 'var(--shadow-lg)', padding: '40px', width: '100%', maxWidth: 560 }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <Link to="/" className="notranslate" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, background: '#fff', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
              <img src="/logo.png" alt="AgriExport Connect Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--green-primary)', fontSize: '1.1rem' }}>AgriExport<span style={{ color: 'var(--amber)' }}>Connect</span></span>
          </Link>
        </div>

        <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>Create Account</h3>
        <p style={{ marginBottom: 28, fontSize: '0.875rem' }}>Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>

        {/* Role Toggle */}
        {step === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
            {[{ key: 'farmer', icon: '🧑‍🌾', label: 'Farmer' }, { key: 'enterprise', icon: '🏢', label: 'Enterprise' }].map(r => (
              <motion.button key={r.key} onClick={() => setRole(r.key)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{ padding: '14px', border: `2px solid ${role === r.key ? 'var(--green-primary)' : 'var(--border)'}`, borderRadius: 12, background: role === r.key ? 'var(--green-light)' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{r.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: role === r.key ? 'var(--green-primary)' : 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{r.label}</div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Progress Bar */}
        <div className="progress-bar" style={{ marginBottom: 32 }}>
          <motion.div className="progress-fill" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
        </div>

        {/* Steps */}
        <StepProgress steps={STEPS} current={step} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Step 0: Basic Info */}
            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={role === 'farmer' ? 'Ramesh Patel' : 'Ahmed Ali'} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input className="form-input notranslate" type="tel" maxLength={10} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} placeholder="9876543210" required />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>10-digit mobile number required for SMS verification & account access</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address {role === 'enterprise' ? <span style={{ color: 'var(--red)' }}>*</span> : <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>}</label>
                  <input className="form-input notranslate" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder={role === 'farmer' ? 'ramesh@gmail.com' : 'exports@company.com'} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password <span style={{ color: 'var(--red)' }}>*</span> <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Min. 6 characters)</span></label>
                  <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Create a password (min. 6 characters)" required />
                </div>
              </div>
            )}

            {/* Step 1: Location / Company */}
            {step === 1 && role === 'farmer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">State <span style={{ color: 'var(--red)' }}>*</span></label>
                  <select className="form-select" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">District <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input className="form-input" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} placeholder="e.g. Mehsana, Nashik, Ludhiana, Indore" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Village / Town <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input className="form-input" value={form.village} onChange={e => setForm({ ...form, village: e.target.value })} placeholder="e.g. Unjha, Baramati, Khanna" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Land Size (acre / bigha / hectare)</label>
                  <input className="form-input notranslate" value={form.land} onChange={e => setForm({ ...form, land: e.target.value })} placeholder="e.g. 10 acre" />
                </div>
              </div>
            )}
            {step === 1 && role === 'enterprise' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input className="form-input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Ahmed Spice Exports Pvt Ltd" />
                </div>
                <div className="form-group">
                  <label className="form-label">GST Number</label>
                  <input className="form-input notranslate" value={form.gst} onChange={e => setForm({ ...form, gst: e.target.value })} placeholder="24AAACA1234B1Z5" />
                </div>
                <div className="form-group">
                  <label className="form-label">IEC Code</label>
                  <input className="form-input notranslate" value={form.iec} onChange={e => setForm({ ...form, iec: e.target.value })} placeholder="AAACA1234B" />
                </div>
                <div className="form-group">
                  <label className="form-label">Registered Address</label>
                  <textarea className="form-textarea" rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123, GIDC Estate, Ahmedabad" />
                </div>
              </div>
            )}

            {/* Step 2: Photo / Logo Upload */}
            {step === 2 && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ marginBottom: 16, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {role === 'farmer'
                    ? 'Upload a clear photo of yourself for your verified farmer profile.'
                    : 'Upload your company logo or authorized representative photo.'}
                </p>

                {form.avatar ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, margin: '16px 0 24px' }}>
                    <div
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '3px solid var(--green-primary)',
                        boxShadow: '0 4px 16px rgba(46, 125, 50, 0.2)',
                        background: '#f4fbf4',
                      }}
                    >
                      <img
                        src={form.avatar}
                        alt="Profile Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <label
                        htmlFor="photo-input"
                        className="btn btn-secondary btn-sm"
                        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <Upload size={14} /> Change Photo
                      </label>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--red)' }}
                        onClick={() => setForm(prev => ({ ...prev, avatar: '' }))}
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      id="photo-input"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                    />
                  </div>
                ) : (
                  <div
                    className={`upload-zone ${dragOver ? 'dragover' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setDragOver(false);
                      if (e.dataTransfer.files?.[0]) handleImageFile(e.dataTransfer.files[0]);
                    }}
                    onClick={() => document.getElementById('photo-input').click()}
                    style={{
                      padding: '36px 20px',
                      border: '2px dashed var(--border)',
                      borderRadius: 16,
                      background: '#fafafa',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      id="photo-input"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                    />
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        background: 'var(--green-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 14px',
                        fontSize: '2rem',
                      }}
                    >
                      {role === 'farmer' ? '🧑‍🌾' : '🏢'}
                    </div>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '1rem' }}>
                      Click to upload photo or drag & drop
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                      Supports JPG, PNG, WebP • Max 5MB
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</div>
                <h4 style={{ marginBottom: 6 }}>Review & Submit</h4>
                <p style={{ fontSize: '0.85rem', marginBottom: 20, color: 'var(--text-muted)' }}>
                  Please confirm your registration details. Your profile will be reviewed by admin verification.
                </p>
                <div style={{ background: 'var(--green-light)', borderRadius: 16, padding: '20px', textAlign: 'left', border: '1px solid #d1fae5' }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        border: '2px solid var(--green-primary)',
                        flexShrink: 0,
                      }}
                    >
                      {form.avatar ? (
                        <img src={form.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        role === 'farmer' ? '🧑‍🌾' : '🏢'
                      )}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 2px', fontFamily: 'var(--font-heading)' }}>{form.name || 'Your Name'}</h4>
                      <span className="badge badge-green" style={{ fontSize: '0.72rem', textTransform: 'capitalize' }}>
                        {role}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.8125rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Mobile:</span>
                      <strong>{form.phone || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Email:</span>
                      <strong className="notranslate">{form.email || 'N/A'}</strong>
                    </div>
                    {role === 'farmer' ? (
                      <>
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block' }}>Location:</span>
                          <strong>{form.village ? `${form.village}, ` : ''}{form.district}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block' }}>Land Size:</span>
                          <strong>{form.land || 'N/A'}</strong>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block' }}>Company:</span>
                          <strong>{form.company || 'N/A'}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block' }}>GST / IEC:</span>
                          <strong>{form.gst || form.iec || 'N/A'}</strong>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 32, justifyContent: 'space-between' }}>
          {step > 0 ? (
            <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>
          ) : (
            <Link to="/login" className="btn btn-ghost">Sign In instead</Link>
          )}
          <SpinnerBtn loading={loading && step === STEPS.length - 1} onClick={handleNext} className="btn btn-primary">
            {step < STEPS.length - 1 ? 'Continue →' : 'Submit Application'}
          </SpinnerBtn>
        </div>
      </motion.div>
    </div>
  );
}
