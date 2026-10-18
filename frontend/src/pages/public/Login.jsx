import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Eye, EyeOff } from 'lucide-react';
import { FadeUpItem, StaggerGrid, SpinnerBtn } from '../../components/common/AnimatedComponents';
import api from '../../services/api';

export default function Login() {
  const { loginAs, addToast } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialRole = params.get('role') === 'admin' ? 'admin' 
    : params.get('role') === 'enterprise' ? 'enterprise' 
    : 'farmer';
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      addToast('Please enter your registered email or phone number.', 'warning');
      return;
    }
    if (!password) {
      addToast('Please enter your password.', 'warning');
      return;
    }

    setLoading(true);
    try {
      // Authenticate with backend API
      const res = await api.auth.login({ email: email.trim(), password, role });
      if (res.token) {
        localStorage.setItem('token', res.token);
      }
      setLoading(false);
      setSuccess(true);
      loginAs(role, res.user);
      const roleLabel = role === 'farmer' ? 'Farmer'
        : role === 'enterprise' ? 'Enterprise'
        : 'Admin';
      addToast(`Welcome back, ${res.user?.name || roleLabel}!`, 'success');
      setTimeout(() => {
        if (role === 'farmer') navigate('/farmer/home');
        else if (role === 'enterprise') navigate('/enterprise/home');
        else navigate('/admin/overview');
      }, 500);
    } catch (err) {
      setLoading(false);
      addToast(err.message || 'Invalid credentials or server unavailable. Please try again.', 'error');
    }
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
              <Link to="/" className="notranslate" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
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
              <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>Sign In</h3>
            </div>
          </FadeUpItem>

          {/* Role Cards */}
          <FadeUpItem>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 12 }}>Login as</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
              {[
                { key: 'farmer', icon: '🧑‍🌾', label: 'Farmer' },
                { key: 'enterprise', icon: '🏢', label: 'Enterprise' },
                { key: 'admin', icon: '🛡️', label: 'Admin' },
              ].map(r => {
                const isSelected = role === r.key;
                const activeColor = r.key === 'admin' ? '#1e3a8a' : 'var(--green-primary)';
                const activeBg = r.key === 'admin' ? '#eff6ff' : 'var(--green-light)';
                return (
                  <motion.button
                    key={r.key}
                    type="button"
                    onClick={() => setRole(r.key)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '14px 6px',
                      border: `2px solid ${isSelected ? activeColor : 'var(--border)'}`,
                      borderRadius: 14,
                      background: isSelected ? activeBg : '#fff',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{r.icon}</div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        color: isSelected ? activeColor : 'var(--text-primary)',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      {r.label}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </FadeUpItem>

          {/* Form */}
          <FadeUpItem>
            <div className="flex-col gap-16" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">{role === 'admin' ? 'Admin Email' : 'Email or Phone'} <span style={{ color: 'var(--red)' }}>*</span></label>
                <input className="form-input notranslate" type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder={role === 'admin' ? 'admin@agriexport.in' : 'Enter your email or phone number'} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input" type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" style={{ paddingRight: 48 }} />
                  <button onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div style={{ textAlign: 'right', marginTop: 4 }}>
                  <Link
                    to="/forgot-password"
                    style={{
                      fontSize: '0.8125rem',
                      color: role === 'admin' ? '#1e3a8a' : 'var(--green-primary)',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <SpinnerBtn
                loading={loading}
                success={success}
                onClick={handleLogin}
                className="btn btn-primary btn-full"
                style={{
                  marginTop: 8,
                  background: role === 'admin' ? '#1e3a8a' : undefined,
                  borderColor: role === 'admin' ? '#1e3a8a' : undefined,
                }}
              >
                {role === 'admin' ? 'Sign In as Admin' : 'Sign In'}
              </SpinnerBtn>
            </div>
          </FadeUpItem>

          {/* Register Link */}
          <FadeUpItem>
            <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--green-primary)', fontWeight: 600 }}>Register</Link>
            </p>
          </FadeUpItem>
        </motion.div>
      </StaggerGrid>
    </div>
  );
}
