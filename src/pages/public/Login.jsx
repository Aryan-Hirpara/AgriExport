import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Sprout, Eye, EyeOff } from 'lucide-react';
import { FadeUpItem, StaggerGrid, SpinnerBtn } from '../../components/common/AnimatedComponents';

export default function Login() {
  const { t, lang, setLang, loginAs, addToast } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialRole = params.get('role') === 'admin' ? 'admin' 
    : params.get('role') === 'enterprise' ? 'enterprise' 
    : 'farmer';
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState(
    initialRole === 'admin' ? 'admin@agriexport.in'
      : initialRole === 'enterprise' ? 'ahmed@spiceexports.in'
      : 'ramesh@unjha.com'
  );
  const [password, setPassword] = useState('demo1234');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      loginAs(role);
      const roleLabel = role === 'farmer' ? t('Farmer', 'ખેડૂત')
        : role === 'enterprise' ? t('Enterprise', 'ઉદ્યોગ')
        : t('Admin', 'એડમિન');
      addToast(t(`Welcome back! Logged in as ${roleLabel}`, `સ્વાગત છે! ${roleLabel} તરીકે લૉગ ઇન`), 'success');
      setTimeout(() => {
        if (role === 'farmer') navigate('/farmer/home');
        else if (role === 'enterprise') navigate('/enterprise/home');
        else navigate('/admin/overview');
      }, 600);
    }, 1000);
  };

  const demoLogin = (r) => {
    setRole(r);
    setEmail(r === 'admin' ? 'admin@agriexport.in' : r === 'farmer' ? 'ramesh@unjha.com' : 'ahmed@spiceexports.in');
    setPassword('demo1234');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <StaggerGrid>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{ background: '#fff', borderRadius: 24, boxShadow: 'var(--shadow-lg)', padding: '48px 40px', width: '100%', maxWidth: 490 }}
        >
          {/* Logo */}
          <FadeUpItem>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                <div style={{ width: 48, height: 48, background: '#fff', border: '1.5px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, boxShadow: 'var(--shadow-sm)' }}>
                  <img src="/logo.png" alt="AgriExport Connect Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--green-primary)' }}>
                  AgriExport<span style={{ color: 'var(--amber)' }}>Connect</span>
                </span>
              </Link>
            </div>
          </FadeUpItem>

          {/* Heading */}
          <FadeUpItem>
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>{t('Sign In', 'સાઇન ઇન')}</h3>
            </div>
          </FadeUpItem>

          {/* Role Cards */}
          <FadeUpItem>
            {role === 'admin' ? (
              <div style={{ marginBottom: 24, padding: '14px 16px', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.1rem' }}>
                    🛡️
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e3a8a' }}>{t('Admin Portal Login', 'એડમિન પોર્ટલ લૉગ ઇન')}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>admin@agriexport.in</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => demoLogin('farmer')}
                  style={{ border: 'none', background: 'none', color: '#2563eb', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {t('Switch to User', 'યૂઝર પર સ્વિચ કરો')}
                </button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 12 }}>{t('Login as', 'આ તરીકે લૉગ ઇન')}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  {[
                    { key: 'farmer', icon: '🧑‍🌾', label: t('Farmer', 'ખેડૂત') },
                    { key: 'enterprise', icon: '🏢', label: t('Enterprise', 'ઉદ્યોગ') },
                  ].map(r => (
                    <motion.button
                      key={r.key}
                      type="button"
                      onClick={() => { setRole(r.key); demoLogin(r.key); }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        padding: '16px', border: `2px solid ${role === r.key ? 'var(--green-primary)' : 'var(--border)'}`,
                        borderRadius: 14, background: role === r.key ? 'var(--green-light)' : '#fff',
                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontSize: '1.75rem', marginBottom: 6 }}>{r.icon}</div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: role === r.key ? 'var(--green-primary)' : 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{r.label}</div>
                    </motion.button>
                  ))}
                </div>
              </>
            )}
          </FadeUpItem>

          {/* Form */}
          <FadeUpItem>
            <div className="flex-col gap-16" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">{t('Email or Phone', 'ઈ-મેઇલ અથવા ફોન')}</label>
                <input className="form-input" type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('ramesh@example.com', 'ramesh@example.com')} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('Password', 'પાસવર્ડ')}</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input" type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ paddingRight: 48 }} />
                  <button onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div style={{ textAlign: 'right', marginTop: 4 }}>
                  <a href="#" style={{ fontSize: '0.8125rem', color: 'var(--green-primary)', fontWeight: 500 }}>{t('Forgot password?', 'પાસવર્ડ ભૂલ્યા?')}</a>
                </div>
              </div>
              <SpinnerBtn loading={loading} success={success} onClick={handleLogin} className="btn btn-primary btn-full" style={{ marginTop: 8 }}>
                {t('Sign In', 'સાઇન ઇન')}
              </SpinnerBtn>
            </div>
          </FadeUpItem>

          {/* Demo Accounts */}
          <FadeUpItem>
            <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.8125rem', textAlign: 'center', marginBottom: 12, color: 'var(--text-muted)' }}>{t('Try demo accounts', 'ડેમો એકાઉન્ટ અજમાવો')}</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {['admin', 'farmer', 'enterprise'].map(r => (
                  <button key={r} onClick={() => demoLogin(r)} className="chip" style={{ fontSize: '0.8125rem' }}>
                    {r === 'admin' ? '👤' : r === 'farmer' ? '🧑‍🌾' : '🏢'} {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </FadeUpItem>

          {/* Register Link */}
          <FadeUpItem>
            <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {t("Don't have an account? ", 'ખાતું નથી? ')}
              <Link to="/register" style={{ color: 'var(--green-primary)', fontWeight: 600 }}>{t('Register', 'નોંધો')}</Link>
            </p>
          </FadeUpItem>
        </motion.div>
      </StaggerGrid>
    </div>
  );
}
