import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { KeyRound, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { FadeUpItem, SpinnerBtn } from '../../components/common/AnimatedComponents';

export default function ForgotPassword() {
  const { addToast } = useApp();
  const navigate = useNavigate();

  // 1: Request OTP, 2: Enter OTP, 3: New Password, 4: Success
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [maskedTarget, setMaskedTarget] = useState('');
  const [userName, setUserName] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // STEP 1: Request OTP
  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    const clean = identifier.trim();
    if (!clean) {
      addToast('Please enter your registered email address or mobile number.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.forgotPassword(clean);
      setMaskedTarget(res.maskedEmail || res.maskedPhone || clean);
      setUserName(res.userName || '');
      setDemoOtp(res.otp || '');
      setOtp(res.otp || ''); // Pre-fill for instant seamless testing
      setStep(2);
      addToast(res.message || 'Verification code sent successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Account not found. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      addToast('Please enter the complete 6-digit verification code.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await api.auth.verifyResetOtp(identifier.trim(), cleanOtp);
      setStep(3);
      addToast('Verification code confirmed! Now enter your new password.', 'success');
    } catch (err) {
      addToast(err.message || 'Invalid or expired verification code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (e) => {
    e?.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      addToast('New password must be at least 6 characters long.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match. Please re-enter.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.resetPassword(identifier.trim(), otp.trim(), newPassword);
      setSuccess(true);
      setStep(4);
      addToast(res.message || 'Password reset successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to reset password. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Card */}
        <div className="card card-body" style={{ padding: '36px 32px', borderRadius: 20, boxShadow: 'var(--shadow-card-hover)', border: '1px solid var(--border)' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: step === 4 ? '#ecfdf5' : 'var(--green-light)',
                color: step === 4 ? 'var(--green-primary)' : 'var(--green-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              {step === 4 ? <CheckCircle2 size={32} color="var(--green-primary)" /> : <KeyRound size={28} />}
            </div>

            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.65rem', margin: '0 0 6px', color: 'var(--text-primary)' }}>
              {step === 1 && 'Reset Password'}
              {step === 2 && 'Enter Verification Code'}
              {step === 3 && 'Create New Password'}
              {step === 4 && 'Password Reset Complete!'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>
              {step === 1 && 'Enter your registered email or phone to receive a 6-digit recovery OTP.'}
              {step === 2 && `We sent a 6-digit code to ${maskedTarget || 'your registered account'}.`}
              {step === 3 && `Enter a secure new password for ${userName || 'your account'}.`}
              {step === 4 && 'Your password has been securely updated. You can now log in.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Identifier Input */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleRequestOtp}
                style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
              >
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Registered Email or Mobile Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <Mail size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-input notranslate"
                      style={{ paddingLeft: 42 }}
                      placeholder="e.g. denil@gmail.com or 9879879876"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Quick Hint */}
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                    💡 Quick Test Accounts:
                  </span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => setIdentifier('denil@gmail.com')}
                      style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--green-primary)', fontWeight: 600 }}
                    >
                      denil@gmail.com
                    </button>
                    <button
                      type="button"
                      onClick={() => setIdentifier('ramesh@agriexport.in')}
                      style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--green-primary)', fontWeight: 600 }}
                    >
                      ramesh@agriexport.in
                    </button>
                  </div>
                </div>

                <SpinnerBtn
                  type="submit"
                  loading={loading}
                  className="btn btn-primary btn-full btn-lg"
                  style={{ marginTop: 4 }}
                >
                  Send Verification Code →
                </SpinnerBtn>
              </motion.form>
            )}

            {/* STEP 2: OTP Verification */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleVerifyOtp}
                style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
              >
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    6-Digit Verification Code (OTP)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <KeyRound size={18} />
                    </span>
                    <input
                      type="text"
                      maxLength={6}
                      className="form-input notranslate"
                      style={{ paddingLeft: 42, letterSpacing: '0.3em', fontSize: '1.25rem', fontWeight: 800, textAlign: 'center' }}
                      placeholder="••••••"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      autoFocus
                    />
                  </div>
                </div>

                {demoOtp && (
                  <div style={{ background: '#ecfdf5', borderRadius: 12, padding: '12px 14px', border: '1px solid #a7f3d0', fontSize: '0.8rem', color: '#065f46' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span><strong>Recovery OTP:</strong> <span style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 800 }}>{demoOtp}</span></span>
                      <button
                        type="button"
                        onClick={() => setOtp(demoOtp)}
                        style={{ background: 'var(--green-primary)', color: '#fff', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Auto-Fill
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                  >
                    ← Change ID
                  </button>
                  <SpinnerBtn
                    type="submit"
                    loading={loading}
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                  >
                    Verify Code →
                  </SpinnerBtn>
                </div>
              </motion.form>
            )}

            {/* STEP 3: Enter New Password */}
            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleResetPassword}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Minimum 6 characters"
                      style={{ paddingRight: 44 }}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--red)', marginTop: 4, display: 'block' }}>
                      Passwords do not match
                    </span>
                  )}
                </div>

                <SpinnerBtn
                  type="submit"
                  loading={loading}
                  success={success}
                  className="btn btn-primary btn-full btn-lg"
                  style={{ marginTop: 8 }}
                >
                  <Lock size={18} /> Update Password
                </SpinnerBtn>
              </motion.form>
            )}

            {/* STEP 4: Success View */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 20 }}
              >
                <div style={{ background: '#ecfdf5', borderRadius: 14, padding: '16px 20px', border: '1px solid #a7f3d0' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#065f46', fontWeight: 600 }}>
                    Your password has been successfully reset!
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: '0.8125rem', color: '#047857' }}>
                    You can now sign in with your email/phone and your new password.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="btn btn-primary btn-full btn-lg"
                >
                  Proceed to Sign In →
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Back link */}
          {step !== 4 && (
            <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
              <Link
                to="/login"
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--green-primary)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ArrowLeft size={15} /> Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
