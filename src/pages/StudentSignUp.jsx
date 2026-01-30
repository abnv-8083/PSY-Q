import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, GraduationCap, ShieldCheck } from 'lucide-react';

const StudentSignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.name });

      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        email: formData.email,
        role: 'student',
        createdAt: new Date().toISOString()
      });

      navigate('/academic/mocktest');
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
      background: 'linear-gradient(135deg, #dbeafe 0%, #fce7f3 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Blobs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '50%',
        height: '50%',
        background: 'rgba(59, 130, 246, 0.15)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'pulse 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-10%',
        width: '50%',
        height: '50%',
        background: 'rgba(233, 30, 99, 0.15)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'pulse 6s ease-in-out infinite 3s'
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '520px',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(24px)',
          borderRadius: '32px',
          padding: '40px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.5)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                width: '64px',
                height: '64px',
                background: 'white',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.06)'
              }}
            >
              <img
                src="/logos/new-logo.jpeg"
                alt="Psy-Q Logo"
                style={{ height: '40px', borderRadius: '8px' }}
              />
            </motion.div>
            <h1 style={{
              fontSize: '30px',
              fontWeight: '800',
              color: '#0f172a',
              marginBottom: '8px',
              letterSpacing: '-0.025em'
            }}>Join the Academy</h1>
            <p style={{
              fontSize: '15px',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <GraduationCap size={18} className="text-blue-500" />
              Unlock your academic potential
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
            <AnimatePresence mode="wait">
              {errors.form && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '6px',
                  display: 'block',
                  marginLeft: '4px'
                }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#94a3b8'
                  }}>
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      paddingLeft: '48px',
                      paddingRight: '16px',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      background: 'rgba(248, 250, 252, 0.7)',
                      border: errors.name ? '1px solid #ef4444' : '1px solid #e2e8f0',
                      borderRadius: '14px',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'all 0.2s',
                    }}
                    placeholder="John Doe"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.background = '#fff';
                    }}
                    onBlur={(e) => {
                      if (!errors.name) {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.background = 'rgba(248, 250, 252, 0.7)';
                      }
                    }}
                  />
                </div>
                {errors.name && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', marginLeft: '4px' }}>{errors.name}</p>}
              </div>

              <div>
                <label style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '6px',
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
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      background: 'rgba(248, 250, 252, 0.7)',
                      border: errors.email ? '1px solid #ef4444' : '1px solid #e2e8f0',
                      borderRadius: '14px',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'all 0.2s',
                    }}
                    placeholder="john@example.com"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.background = '#fff';
                    }}
                    onBlur={(e) => {
                      if (!errors.email) {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.background = 'rgba(248, 250, 252, 0.7)';
                      }
                    }}
                  />
                </div>
                {errors.email && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', marginLeft: '4px' }}>{errors.email}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'navigator.maxTouchPoints > 0 ? "1fr" : "1fr 1fr"', gap: '16px' }}>
                <div>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
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
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        background: 'rgba(248, 250, 252, 0.7)',
                        border: errors.password ? '1px solid #ef4444' : '1px solid #e2e8f0',
                        borderRadius: '14px',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'all 0.2s',
                      }}
                      placeholder="••••••••"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.background = '#fff';
                      }}
                      onBlur={(e) => {
                        if (!errors.password) {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.background = 'rgba(248, 250, 252, 0.7)';
                        }
                      }}
                    />
                  </div>
                  {errors.password && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', marginLeft: '4px' }}>{errors.password}</p>}
                </div>

                <div>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                    display: 'block',
                    marginLeft: '4px'
                  }}>Confirm</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: '#94a3b8'
                    }}>
                      <ShieldCheck size={18} />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        paddingLeft: '48px',
                        paddingRight: '16px',
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        background: 'rgba(248, 250, 252, 0.7)',
                        border: errors.confirmPassword ? '1px solid #ef4444' : '1px solid #e2e8f0',
                        borderRadius: '14px',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'all 0.2s',
                      }}
                      placeholder="••••••••"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.background = '#fff';
                      }}
                      onBlur={(e) => {
                        if (!errors.confirmPassword) {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.background = 'rgba(248, 250, 252, 0.7)';
                        }
                      }}
                    />
                  </div>
                  {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', marginLeft: '4px' }}>{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01, translateY: -1 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                fontWeight: '700',
                padding: '14px',
                borderRadius: '16px',
                border: 'none',
                fontSize: '16px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.3s'
              }}
            >
              {isSubmitting ? 'Creating Profile...' : 'Begin Academic Journey'}
              <ArrowRight size={20} />
            </motion.button>
          </form>



          <p style={{
            marginTop: '28px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#64748b'
          }}>
            Already have an account? <Link to="/student/signin" style={{
              color: '#3b82f6',
              fontWeight: '700',
              textDecoration: 'none'
            }}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            >
              Sign back in
            </Link>
          </p>
        </div>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
          Your data is secured by Psy-Q Advanced Protection
        </p>
      </motion.div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default StudentSignUp;


