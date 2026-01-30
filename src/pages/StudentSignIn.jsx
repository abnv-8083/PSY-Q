import { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, GraduationCap, X } from 'lucide-react';

const StudentSignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState({ type: '', message: '' });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : { role: 'student' };

      const from = location.state?.from?.pathname ||
        (userData.role === 'admin' || userData.role === 'sub-admin'
          ? '/admin'
          : '/academic/mocktest');

      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      setErrors({ form: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetStatus({ type: 'error', message: 'Please enter your email address' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      setResetStatus({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetStatus({
        type: 'success',
        message: 'Password reset email sent! Please check your inbox.'
      });
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetStatus({ type: '', message: '' });
      }, 3000);
    } catch (error) {
      console.error(error);
      setResetStatus({
        type: 'error',
        message: error.code === 'auth/user-not-found'
          ? 'No account found with this email address'
          : 'Failed to send reset email. Please try again.'
      });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, #fce7f3 0%, #dbeafe 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Blobs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '50%',
        height: '50%',
        background: 'rgba(233, 30, 99, 0.15)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'pulse 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '50%',
        height: '50%',
        background: 'rgba(59, 130, 246, 0.15)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'pulse 6s ease-in-out infinite 3s'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '460px',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '28px',
          padding: '40px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.4)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                width: '64px',
                height: '64px',
                background: 'white',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.05)'
              }}
            >
              <img
                src="/logos/new-logo.jpeg"
                alt="Psy-Q Logo"
                style={{ height: '40px', borderRadius: '8px' }}
              />
            </motion.div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#1e293b',
              marginBottom: '8px',
              letterSpacing: '-0.025em'
            }}>Student Login</h1>
            <p style={{
              fontSize: '15px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <GraduationCap size={18} className="text-pink-500" />
              Access your mock test portal
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
            <AnimatePresence mode="wait">
              {errors.form && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    padding: '12px',
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    borderRadius: '12px',
                    color: '#dc2626',
                    fontSize: '14px',
                    fontWeight: '500',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}
                >
                  {errors.form}
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
                display: 'block',
                marginLeft: '4px'
              }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: '#94a3b8'
                }}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    paddingLeft: '48px',
                    paddingRight: '16px',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    background: 'rgba(248, 250, 252, 0.8)',
                    border: errors.email ? '1px solid #ef4444' : '1px solid #e2e8f0',
                    borderRadius: '14px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    color: '#1e293b'
                  }}
                  placeholder="name@example.com"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ec4899';
                    e.target.style.background = '#fff';
                    e.target.style.boxShadow = '0 0 0 4px rgba(236, 72, 153, 0.1)';
                  }}
                  onBlur={(e) => {
                    if (!errors.email) {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.background = 'rgba(248, 250, 252, 0.8)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
              </div>
              {errors.email && <p style={{
                color: '#ef4444',
                fontSize: '12px',
                marginTop: '6px',
                marginLeft: '4px',
                fontWeight: '500'
              }}>{errors.email}</p>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
                display: 'block',
                marginLeft: '4px'
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: '#94a3b8'
                }}>
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    paddingLeft: '48px',
                    paddingRight: '16px',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    background: 'rgba(248, 250, 252, 0.8)',
                    border: errors.password ? '1px solid #ef4444' : '1px solid #e2e8f0',
                    borderRadius: '14px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    color: '#1e293b'
                  }}
                  placeholder="••••••••"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ec4899';
                    e.target.style.background = '#fff';
                    e.target.style.boxShadow = '0 0 0 4px rgba(236, 72, 153, 0.1)';
                  }}
                  onBlur={(e) => {
                    if (!errors.password) {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.background = 'rgba(248, 250, 252, 0.8)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
              </div>
              {errors.password && <p style={{
                color: '#ef4444',
                fontSize: '12px',
                marginTop: '6px',
                marginLeft: '4px',
                fontWeight: '500'
              }}>{errors.password}</p>}
            </div>

            <div style={{ textAlign: 'right', marginBottom: '28px' }}>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                style={{
                  fontSize: '13px',
                  color: '#64748b',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.2s',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
                onMouseOver={(e) => e.target.style.color = '#ec4899'}
                onMouseOut={(e) => e.target.style.color = '#64748b'}
              >
                Forgot password?
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.01, translateY: -1 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                color: 'white',
                fontWeight: '700',
                padding: '14px',
                borderRadius: '14px',
                border: 'none',
                fontSize: '16px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 10px 25px -5px rgba(236, 72, 153, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
              <ArrowRight size={20} />
            </motion.button>
          </form>

          <p style={{
            marginTop: '32px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#64748b'
          }}>
            New to Psy-Q? <Link to="/student/signup" style={{
              color: '#ec4899',
              fontWeight: '700',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            >
              Start Free Trial
            </Link>
          </p>
        </div>

        {/* Footer Info */}
        <p style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#64748b',
          fontWeight: '500'
        }}>
          Protected by Psy-Q Secure Student Gateway
        </p>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '24px'
            }}
            onClick={() => {
              setShowForgotPassword(false);
              setResetEmail('');
              setResetStatus({ type: '', message: '' });
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '32px',
                maxWidth: '450px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Reset Password</h2>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                    setResetStatus({ type: '', message: '' });
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#f1f5f9'}
                  onMouseOut={(e) => e.target.style.background = 'none'}
                >
                  <X size={20} color="#64748b" />
                </button>
              </div>

              <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleForgotPassword}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none'
                    }}>
                      <Mail size={20} color="#94a3b8" />
                    </div>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        setResetStatus({ type: '', message: '' });
                      }}
                      placeholder="Enter your email"
                      style={{
                        width: '100%',
                        paddingLeft: '48px',
                        paddingRight: '16px',
                        paddingTop: '14px',
                        paddingBottom: '14px',
                        background: 'rgba(248, 250, 252, 0.8)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '14px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#ec4899';
                        e.target.style.background = '#fff';
                        e.target.style.boxShadow = '0 0 0 4px rgba(236, 72, 153, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.background = 'rgba(248, 250, 252, 0.8)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                {resetStatus.message && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    background: resetStatus.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${resetStatus.type === 'success' ? '#86efac' : '#fecaca'}`,
                    color: resetStatus.type === 'success' ? '#166534' : '#991b1b',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {resetStatus.message}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                    color: 'white',
                    fontWeight: '700',
                    padding: '14px',
                    borderRadius: '14px',
                    fontSize: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                  }}
                >
                  Send Reset Link
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default StudentSignIn;


