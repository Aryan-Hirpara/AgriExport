import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import { SpinnerBtn } from '../../components/common/AnimatedComponents';

export default function ForgotPassword() {
  const { addToast } = useApp();
  const navigate = useNavigate();

  // Step 1: Check Database for Account
  // Step 2: Set New Password & Confirm
  // Step 3: Success Screen
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [resetToken, setResetToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // STEP 1: Verify Account in Database
  const handleCheckAccount = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    const clean = identifier.trim();

    if (!clean) {
      setErrorMessage('Please enter your registered email address or mobile number.');
      addToast('Please enter your registered email address or mobile number.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.forgotPassword(clean);
      if (res && res.success) {
        setVerifiedUser(res.user || { name: res.userName, identifier: clean });
        setResetToken(res.resetToken || '');
        setStep(2);
        addToast(res.message || 'Account verified! Please set your new password.', 'success');
      } else {
        const msg = res.message || 'No registered account found with that email or mobile number.';
        setErrorMessage(msg);
        addToast(msg, 'error');
      }
    } catch (err) {
      const msg = err.message || 'No registered account found with that email or mobile number.';
      setErrorMessage(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Update Password in Database
  const handleResetPassword = async (e) => {
    e?.preventDefault();
    setErrorMessage('');

    if (!newPassword || newPassword.length < 6) {
      const msg = 'New password must be at least 6 characters long.';
      setErrorMessage(msg);
      addToast(msg, 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = 'Passwords do not match. Please re-enter matching passwords.';
      setErrorMessage(msg);
      addToast(msg, 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.resetPassword({
        identifier: identifier.trim(),
        resetToken,
        newPassword,
      });

      setSuccess(true);
      setStep(3);
      addToast(res.message || 'Password updated successfully in database!', 'success');
    } catch (err) {
      const msg = err.message || 'Failed to update password. Please try again.';
      setErrorMessage(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="page-wrapper"
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Card */}
        <div
          className="card card-body"
          style={{
            padding: '36px 32px',
            borderRadius: 20,
            boxShadow: 'var(--shadow-card-hover)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: step === 3 ? '#ecfdf5' : 'var(--green-light)',
                color: step === 3 ? 'var(--green-primary)' : 'var(--green-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              {step === 3 ? (
                <CheckCircle2 size={32} color="var(--green-primary)" />
              ) : step === 2 ? (
                <Lock size={28} />
              ) : (
                <KeyRound size={28} />
              )}
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.65rem',
                margin: '0 0 6px',
                color: 'var(--text-primary)',
              }}
            >
              {step === 1 && 'Reset Password'}
              {step === 2 && 'Create New Password'}
              {step === 3 && 'Password Reset Complete!'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>
              {step === 1 &&
                'Enter your registered email address or mobile number to check the database.'}
              {step === 2 &&
                `Account found! Enter a new password for ${
                  verifiedUser?.name || 'your registered account'
                }.`}
              {step === 3 &&
                'Your password has been securely updated in the database. You can now log in.'}
            </p>
          </div>

          {/* Inline Error Alert */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 12,
                padding: '12px 14px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                color: '#b91c1c',
                fontSize: '0.84rem',
                lineHeight: 1.45,
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong>Error: </strong>
                {errorMessage}
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: Enter email or phone & verify presence in database */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleCheckAccount}
                style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
              >
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Registered Email or Phone Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <Mail size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-input notranslate"
                      style={{ paddingLeft: 42 }}
                      placeholder=""
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      autoFocus
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    We will look up your registered account in the system database.
                  </span>
                </div>

                <SpinnerBtn
                  type="submit"
                  loading={loading}
                  className="btn btn-primary btn-full btn-lg"
                  style={{ marginTop: 4 }}
                >
                  <ShieldCheck size={18} /> Verify Account in Database →
                </SpinnerBtn>
              </motion.form>
            )}

            {/* STEP 2: Account Verified -> Enter New Password and Confirm */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleResetPassword}
                style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
              >
                {/* Verified Account Badge */}
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 12,
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: '#dcfce7',
                        color: '#15803d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}
                    >
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#166534' }}>
                        {verifiedUser?.name || 'Verified User'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#15803d' }}>
                        {verifiedUser?.email || verifiedUser?.phone || identifier}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrorMessage('');
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid #86efac',
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      color: '#15803d',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Change
                  </button>
                </div>

                {/* New Password */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Minimum 6 characters"
                      style={{ paddingRight: 44 }}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Re-enter your new password"
                      style={{ paddingRight: 44 }}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--red)', marginTop: 4, display: 'block' }}>
                      Passwords do not match
                    </span>
                  )}
                  {confirmPassword && newPassword === confirmPassword && (
                    <span style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: 4, display: 'block', fontWeight: 600 }}>
                      ✓ Passwords match
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrorMessage('');
                    }}
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                  >
                    ← Back
                  </button>
                  <SpinnerBtn
                    type="submit"
                    loading={loading}
                    success={success}
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                  >
                    <Lock size={17} /> Update Password
                  </SpinnerBtn>
                </div>
              </motion.form>
            )}

            {/* STEP 3: Success View */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 20 }}
              >
                <div
                  style={{
                    background: '#ecfdf5',
                    borderRadius: 14,
                    padding: '20px',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#065f46', fontWeight: 700 }}>
                    Password Updated Successfully!
                  </p>
                  <p style={{ margin: '8px 0 0', fontSize: '0.84rem', color: '#047857', lineHeight: 1.5 }}>
                    Your password has been changed in the database for <strong>{verifiedUser?.name || 'your account'}</strong>. You can now log in using your new password.
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
          {step !== 3 && (
            <div
              style={{
                marginTop: 24,
                paddingTop: 18,
                borderTop: '1px solid var(--border)',
                textAlign: 'center',
              }}
            >
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
