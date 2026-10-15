import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, ShieldCheck } from 'lucide-react';
import { FadeUpItem, SpinnerBtn } from '../../components/common/AnimatedComponents';

export default function About() {
  const [form, setForm] = useState({ name: '', email: '', type: 'Farmer', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1500);
  };

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section style={{ background: 'var(--green-primary)', padding: '80px 0 100px' }}>
        <div className="container">
          <FadeUpItem>
            <div className="section-label" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>Our Mission</div>
            <h1 style={{ color: '#fff', marginBottom: 20, maxWidth: 620 }}>
              Empowering Gujarat farmers with fair market access
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.125rem', maxWidth: 560 }}>
              We built <span className="notranslate">AgriExport Connect</span> because we saw Gujarat farmers getting 30–40% less than market price due to middlemen. We believe technology can fix that.
            </p>
          </FadeUpItem>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <FadeUpItem>
              <div className="section-label">The Problem</div>
              <h2 style={{ marginBottom: 20 }}>Middlemen eat your profits</h2>
              {[
                'Farmers sell to local traders at 30-40% below export prices',
                'Exporters struggle to find quality-certified farms directly',
                'No transparent pricing or trust layer between parties',
                'Small farmers have no access to international market info',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
                  <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>❌</span>
                  <p style={{ margin: 0, lineHeight: 1.6 }}>{item}</p>
                </div>
              ))}
            </FadeUpItem>
            <FadeUpItem>
              <div style={{ background: 'var(--green-light)', borderRadius: 24, padding: '40px' }}>
                <div className="section-label">Our Solution</div>
                <h3 style={{ marginBottom: 20, fontFamily: 'var(--font-heading)' }}>Direct connections, verified trust</h3>
                {[
                  'Admin-verified farmers and enterprises only',
                  'Live mandi prices as reference for fair negotiation',
                  'Full deal transparency with timeline tracking',
                  'Multilingual support powered by Google Translate',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
                    <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>✅</span>
                    <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text-primary)' }}>{item}</p>
                  </div>
                ))}
              </div>
            </FadeUpItem>
          </div>
        </div>
      </section>

      {/* How Verification Works */}
      <section className="section" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label"><ShieldCheck size={14} /> Verification Process</div>
            <h2>How we verify users</h2>
          </div>
          <div className="grid-3">
            {[
              { icon: '📋', title: 'Document Submission', desc: 'Farmers upload Aadhar + Land Record (7/12). Enterprises upload GST + IEC certificate.' },
              { icon: '🔍', title: 'Admin Review', desc: 'Our verification team manually reviews each document within 48 hours of submission.' },
              { icon: '✅', title: 'Approved & Active', desc: 'Once verified, you can list produce, send offers, and start deals. Badge shown on your profile.' },
            ].map((item, i) => (
              <motion.div key={i} className="card card-body" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{item.icon}</div>
                <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>{item.title}</h4>
                <p style={{ fontSize: '0.875rem' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Scope Note */}
          <div style={{ background: 'var(--amber-light)', borderRadius: 20, padding: '24px 32px', marginTop: 40, display: 'flex', gap: 16, alignItems: 'flex-start', border: '1px solid #FCD34D' }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>📋</span>
            <div>
              <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8, color: '#92400E' }}>Scope Note</h4>
              <p style={{ color: '#92400E', margin: 0, lineHeight: 1.7, fontSize: '0.9375rem' }}>
                <span className="notranslate">AgriExport Connect</span> is a marketplace platform only. We do not handle shipping, customs clearance, payments, or quality guarantees. All logistics and financial arrangements are made directly between the farmer and the enterprise. We strongly recommend verifying export regulations with DGFT and APEDA before executing any deal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container-sm">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label">📩 Get in Touch</div>
            <h2>Contact Us</h2>
            <p>Questions? Feedback? We read every message.</p>
          </div>

          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: 48, background: 'var(--green-light)', borderRadius: 24 }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>Message Sent!</h3>
              <p>We'll respond within 24–48 hours.</p>
            </motion.div>
          ) : (
            <motion.div className="card card-body" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ padding: 40 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="grid-2" style={{ gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ramesh Patel" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input notranslate" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ramesh@gmail.com" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">I am a</label>
                  <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {['Farmer', 'Enterprise', 'Other'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-textarea" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us how we can help..." />
                </div>
                <SpinnerBtn loading={loading} onClick={handleSend} className="btn btn-primary btn-full">
                  <Send size={18} /> Send Message
                </SpinnerBtn>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
