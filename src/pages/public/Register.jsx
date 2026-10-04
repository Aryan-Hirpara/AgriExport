import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Upload, CheckCircle, Clock, X } from 'lucide-react';
import { StepProgress, SpinnerBtn } from '../../components/common/AnimatedComponents';

const STEPS = ['Basic Info', 'Location / Company', 'Documents', 'Confirm'];

export default function Register() {
  const { loginAs, addToast } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialRole = params.get('role') || 'farmer';
  const [role, setRole] = useState(initialRole);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '',
    village: '', district: 'Mehsana', state: 'Gujarat', land: '',
    company: '', gst: '', iec: '', address: '',
  });

  const districts = ['Mehsana', 'Rajkot', 'Ahmedabad', 'Junagadh', 'Surat', 'Vadodara', 'Jamnagar', 'Gandhinagar'];

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
      }, 1600);
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
            <button onClick={() => { loginAs(role); navigate(role === 'farmer' ? '/farmer/home' : '/enterprise/home'); }} className="btn btn-primary">
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
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={role === 'farmer' ? 'Ramesh Patel' : 'Ahmed Ali'} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input className="form-input notranslate" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input notranslate" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ramesh@gmail.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 characters" />
                </div>
              </div>
            )}

            {/* Step 1: Location / Company */}
            {step === 1 && role === 'farmer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Village</label>
                  <input className="form-input" value={form.village} onChange={e => setForm({ ...form, village: e.target.value })} placeholder="Unjha" />
                </div>
                <div className="form-group">
                  <label className="form-label">District</label>
                  <select className="form-select" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}>
                    {districts.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Land Size (bigha / acre)</label>
                  <input className="form-input notranslate" value={form.land} onChange={e => setForm({ ...form, land: e.target.value })} placeholder="12 bigha" />
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

            {/* Step 2: Documents */}
            {step === 2 && (
              <div>
                <p style={{ marginBottom: 16, fontSize: '0.875rem' }}>
                  Upload required documents (PDF, JPG, PNG)
                </p>
                <div
                  className={`upload-zone ${dragOver ? 'dragover' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <input id="file-input" type="file" multiple style={{ display: 'none' }} onChange={e => setUploadedFiles(prev => [...prev, ...Array.from(e.target.files).map(f => f.name)])} />
                  <Upload size={36} color="var(--green-primary)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Drag & drop or click to upload</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {role === 'farmer' ? 'Aadhar Card, Land Record (7/12)' : 'GST Certificate, IEC Certificate, MOA'}
                  </p>
                </div>
                {uploadedFiles.length > 0 && (
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {uploadedFiles.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--green-light)', borderRadius: 8 }}>
                        <CheckCircle size={16} color="var(--green-primary)" />
                        <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{f}</span>
                        <button onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                <h4 style={{ marginBottom: 8 }}>Review & Submit</h4>
                <p style={{ fontSize: '0.875rem', marginBottom: 24 }}>
                  By submitting, you agree to our Terms of Service and Privacy Policy. Our team will verify your documents within 48 hours.
                </p>
                <div style={{ background: 'var(--green-light)', borderRadius: 12, padding: '16px 20px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '1.5rem' }}>{role === 'farmer' ? '🧑‍🌾' : '🏢'}</span>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{form.name || (role === 'farmer' ? 'Ramesh Patel' : 'Ahmed Spice Exports')}</p>
                      <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--green-primary)', fontWeight: 600 }}>{role === 'farmer' ? 'Farmer' : 'Enterprise'} • <span className="notranslate">{form.email || 'ramesh@gmail.com'}</span></p>
                    </div>
                  </div>
                  {role === 'farmer' && <p style={{ fontSize: '0.8125rem', margin: 0 }}>📍 {form.village || 'Unjha'}, {form.district}</p>}
                  {role === 'enterprise' && <p style={{ fontSize: '0.8125rem', margin: 0 }}>GST: <span className="notranslate">{form.gst || '24AAACA1234B1Z5'}</span></p>}
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
