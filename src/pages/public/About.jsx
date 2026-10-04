import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Send, ShieldCheck, MapPin, Globe, Users } from 'lucide-react';
import { FadeUpItem, StaggerGrid, SpinnerBtn } from '../../components/common/AnimatedComponents';

export default function About() {
  const { t, lang } = useApp();
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
            <div className="section-label" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>{t('Our Mission', 'અમારો ઉદ્દેશ')}</div>
            <h1 style={{ color: '#fff', marginBottom: 20, maxWidth: 620 }}>
              {t('Empowering Gujarat farmers with fair market access', 'ગુજરાત ખેડૂતોને ઉચિત બજાર સુધી પ્રવેશ')}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.125rem', maxWidth: 560 }}>
              {t('We built AgriExport Connect because we saw Gujarat farmers getting 30–40% less than market price due to middlemen. We believe technology can fix that.', 'અમે AgriExport Connect બનાવ્યું કારણ કે ખેડૂતો 30-40% ઓછો ભાવ મળતો. ટેક્નૉલૉજી આ ઠીક કરી શકે.')}
            </p>
          </FadeUpItem>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <FadeUpItem>
              <div className="section-label">{t('The Problem', 'સમસ્યા')}</div>
              <h2 style={{ marginBottom: 20 }}>{t('Middlemen eat your profits', 'દલાલો તમારો નફો ખાય છે')}</h2>
              {[
                t('Farmers sell to local traders at 30-40% below export prices', 'ખેડૂત સ્થાનિક ટ્રેડર્સ પર 30-40% ઓછા'),
                t('Exporters struggle to find quality-certified farms directly', 'નિકાસ ઉદ્યોગ ગુણવત્તા ફાર્મ શોધવા મૂકો'),
                t('No transparent pricing or trust layer between parties', 'ભાવ/વિશ્વાસ ન હોય'),
                t('Small farmers have no access to international market info', 'નાના ખેડૂતોને આંતરરાષ્ટ્રીય બજાર ખ્યાલ ન હોય'),
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
                  <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>❌</span>
                  <p style={{ margin: 0, lineHeight: 1.6 }}>{item}</p>
                </div>
              ))}
            </FadeUpItem>
            <FadeUpItem>
              <div style={{ background: 'var(--green-light)', borderRadius: 24, padding: '40px' }}>
                <div className="section-label">{t('Our Solution', 'અમારો ઉકેલ')}</div>
                <h3 style={{ marginBottom: 20, fontFamily: 'var(--font-heading)' }}>{t('Direct connections, verified trust', 'સીધા સંબંધ, ચકાસાયેલ વિશ્વાસ')}</h3>
                {[
                  t('Admin-verified farmers and enterprises only', 'ફક્ત ચકાસાયેલ ખેડૂત/ઉદ્યોગ'),
                  t('Live mandi prices as reference for fair negotiation', 'વાજબી ભાવ માટે લાઇવ મંડી ભાવ'),
                  t('Full deal transparency with timeline tracking', 'સોદો ટ્રૅકિંગ'),
                  t('Bilingual (English + Gujarati) for all users', 'English + ગુજરાતી'),
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
            <div className="section-label"><ShieldCheck size={14} /> {t('Verification Process', 'ચકાસણી પ્રક્રિયા')}</div>
            <h2>{t('How we verify users', 'અમે ઉપયોગ-કર્તાઓ કેવી રીતે ચકાસીએ છીએ')}</h2>
          </div>
          <div className="grid-3">
            {[
              { icon: '📋', title: t('Document Submission', 'દસ્તાવેજ'), desc: t('Farmers upload Aadhar + Land Record (7/12). Enterprises upload GST + IEC certificate.', 'ખેડૂત: આધાર + 7/12. ઉદ્યોગ: GST + IEC.') },
              { icon: '🔍', title: t('Admin Review', 'ઍડ્મિન સમીક્ષા'), desc: t('Our verification team manually reviews each document within 48 hours of submission.', 'ટીમ 48 કલાકમાં ચકાસે.') },
              { icon: '✅', title: t('Approved & Active', 'ચકાસાયેલ & સક્રિય'), desc: t('Once verified, you can list produce, send offers, and start deals. Badge shown on your profile.', 'ચકાસણી પછી, ઉત્પાદ, ઑફર, સોદો.') },
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
              <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8, color: '#92400E' }}>{t('Scope Note', 'અવકાશ નૉંધ')}</h4>
              <p style={{ color: '#92400E', margin: 0, lineHeight: 1.7, fontSize: '0.9375rem' }}>
                {t('AgriExport Connect is a marketplace platform only. We do not handle shipping, customs clearance, payments, or quality guarantees. All logistics and financial arrangements are made directly between the farmer and the enterprise. We strongly recommend verifying export regulations with DGFT and APEDA before executing any deal.', 'AgriExport Connect ફક્ત બજારમંચ છે. અમે શિપિંગ, કસ્ટમ, ચુકવણી, ગુણવત્તા ગૅરેન્ટી સંભાળતા નથી. DGFT/APEDA સાથે ચૅક કરો.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container-sm">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label">📩 {t('Get in Touch', 'સંપર્ક')}</div>
            <h2>{t('Contact Us', 'અમને સંપર્ક કરો')}</h2>
            <p>{t('Questions? Feedback? We read every message.', 'સવાલ? અભિપ્રાય? અમે દરેક સંદેશ વાંચીએ.')}</p>
          </div>

          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: 48, background: 'var(--green-light)', borderRadius: 24 }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>{t('Message Sent!', 'સંદેશ મોકલ્યો!')}</h3>
              <p>{t("We'll respond within 24–48 hours.", 'અમે 24-48 કલાકમાં જવાબ આપીશું.')}</p>
            </motion.div>
          ) : (
            <motion.div className="card card-body" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ padding: 40 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="grid-2" style={{ gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">{t('Your Name', 'તમારું નામ')}</label>
                    <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ramesh Patel" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('Email', 'ઈ-મેઇલ')}</label>
                    <input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ramesh@gmail.com" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('I am a', 'હું છું')}</label>
                  <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {[t('Farmer', 'ખેડૂત'), t('Enterprise', 'ઉદ્યોગ'), t('Other', 'અન્ય')].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('Message', 'સંદેશ')}</label>
                  <textarea className="form-textarea" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder={t('Tell us how we can help...', 'અમને જણાવો...')} />
                </div>
                <SpinnerBtn loading={loading} onClick={handleSend} className="btn btn-primary btn-full">
                  <Send size={18} /> {t('Send Message', 'સંદેશ મોકલો')}
                </SpinnerBtn>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
