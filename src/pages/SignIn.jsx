import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // If we came here from a protected page (like MockTest),
      // go back there after login. Otherwise:
      // - admins go to admin mocktest dashboard
      // - students go to student mocktest dashboard
      const from =
        location.state?.from?.pathname ||
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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Blobs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '40%',
        height: '40%',
        background: 'rgba(233, 30, 99, 0.3)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'pulse 4s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '40%',
        height: '40%',
        background: 'rgba(99, 102, 241, 0.3)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'pulse 4s ease-in-out infinite 2s'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '480px',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              src="/logos/new-logo.jpeg"
              alt="Psy-Q Logo"
              style={{
                height: '64px',
                margin: '0 auto 24px',
                borderRadius: '16px'
              }}
            />
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#1a1a1a',
              marginBottom: '8px',
              letterSpacing: '-0.5px'
            }}>Welcome Back</h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280'
            }}>Access your professional dashboard</p>
          </div>

          <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
            <AnimatePresence mode="wait">
              {errors.form && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    padding: '16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
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
                color: '#6b7280',
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
                  pointerEvents: 'none'
                }}>
                  <Mail size={18} color="#9ca3af" />
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
                    paddingTop: '16px',
                    paddingBottom: '16px',
                    background: '#f9fafb',
                    border: errors.email ? '2px solid #ef4444' : '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  placeholder="admin@psyq.com"
                  onFocus={(e) => e.target.style.borderColor = '#E91E63'}
                  onBlur={(e) => !errors.email && (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>
              {errors.email && <p style={{
                color: '#ef4444',
                fontSize: '11px',
                marginTop: '6px',
                marginLeft: '4px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>{errors.email}</p>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#6b7280',
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
                  pointerEvents: 'none'
                }}>
                  <Lock size={18} color="#9ca3af" />
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
                    paddingTop: '16px',
                    paddingBottom: '16px',
                    background: '#f9fafb',
                    border: errors.password ? '2px solid #ef4444' : '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  placeholder="••••••••••••••••"
                  onFocus={(e) => e.target.style.borderColor = '#E91E63'}
                  onBlur={(e) => !errors.password && (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>
              {errors.password && <p style={{
                color: '#ef4444',
                fontSize: '11px',
                marginTop: '6px',
                marginLeft: '4px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>{errors.password}</p>}
            </div>

            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <Link to="/soon" style={{
                fontSize: '12px',
                color: '#6b7280',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}></Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
                color: 'white',
                fontWeight: '700',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '16px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 10px 30px rgba(233, 30, 99, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              {isSubmitting ? 'Verifying Identity...' : 'Sign In to Dashboard'}
              <ArrowRight size={20} />
            </motion.button>
          </form>



          <p style={{
            marginTop: '32px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Internal use only. <Link to="/signup" style={{
              color: '#1a1a1a',
              fontWeight: '700',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}></Link>
          </p>
        </div>

        {/* Footer Info */}
        <div style={{
          marginTop: '32px',
          textAlign: 'center',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontWeight: '500',
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}>
          Psy-Q Admin Gateway | 256-bit Encrypted
        </div>
      </motion.div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default SignIn;
