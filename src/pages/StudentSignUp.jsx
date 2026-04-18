import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import {
    Box,
    TextField,
    Button,
    Typography,
    InputAdornment,
    IconButton,
    Alert,
    Link,
    alpha,
    CircularProgress,
} from '@mui/material';
import {
    Mail, Lock, Eye, EyeOff, User, Phone,
    ArrowRight, KeyRound, ChevronLeft, Sparkles,
    ShieldCheck, BookOpen, Target, Award, Brain, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const COLORS = {
    primary: '#0f172a',
    accent: '#ca0056',
    accentHover: '#a8003f',
    textLight: '#64748b',
    border: '#e2e8f0',
    glass: 'rgba(255,255,255,0.07)',
};

const perks = [
    { icon: Target, text: 'Curated UGC NET Mock Tests', sub: '500+ topic-wise questions' },
    { icon: Brain, text: 'Practice tests visibility (selected, completed)', sub: 'Adaptive difficulty engine' },
    { icon: Award, text: 'Performance analytics', sub: 'Track your growth daily' },
    { icon: BookOpen, text: 'Expert Video Solutions', sub: 'Step-by-step explanations' },
];

/* ─── Floating Blob ─── */
const Blob = ({ style }) => (
    <Box sx={{ position: 'absolute', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.25, pointerEvents: 'none', ...style }} />
);

/* ─── Shared input style ─── */
const buildInputSx = (focused, name, accent, border) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '16px',
        bgcolor: focused === name ? '#fff' : '#f8fafc',
        transition: 'all 0.25s ease',
        '& fieldset': { borderColor: focused === name ? accent : border, borderWidth: focused === name ? '2px' : '1.5px' },
        '&:hover fieldset': { borderColor: '#cbd5e1' },
        '&.Mui-focused fieldset': { borderColor: accent, borderWidth: '2px' },
        '&.Mui-focused': { bgcolor: 'white', boxShadow: `0 0 0 4px ${alpha(accent, 0.08)}` },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: accent },
    '& .MuiInputBase-input': { py: 1.5 },
});

/* ═══════════════════════════════════════════════════════════ */
/*  OTP Verification Screen                                    */
/* ═══════════════════════════════════════════════════════════ */
const VerifyStep = ({ email, otp, setOtp, error, loading, onVerify, onBack }) => {
    const digits = 6;
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff', fontFamily: "'Inter', sans-serif" }}>
            {/* Left panel same branding */}
            <Box sx={{
                display: { xs: 'none', md: 'flex' },
                width: '46%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                background: 'linear-gradient(150deg, #0f172a 0%, #1e1b4b 45%, #4c0519 100%)',
                minHeight: '100vh', p: 6, position: 'relative', overflow: 'hidden',
            }}>
                <Blob style={{ width: 400, height: 400, bgcolor: '#ca0056', top: '-100px', left: '-100px' }} />
                <Blob style={{ width: 280, height: 280, bgcolor: '#6d28d9', bottom: '-60px', right: '-60px' }} />
                <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                    style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 340 }}>
                    <Box sx={{
                        width: 88, height: 88, borderRadius: '50%', margin: '0 auto 28px',
                        background: 'linear-gradient(135deg, rgba(202,0,86,0.3), rgba(109,40,217,0.3))',
                        border: '2px solid rgba(255,255,255,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(202,0,86,0.3)',
                    }}>
                        <ShieldCheck size={40} color="#f9a8d4" strokeWidth={1.8} />
                    </Box>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.9rem', color: '#fff', letterSpacing: -1, mb: 1.5 }}>
                        Almost there!
                    </Typography>
                    <Typography sx={{ color: alpha('#fff', 0.55), lineHeight: 1.75, fontSize: '0.92rem' }}>
                        We sent a 6-digit verification code to your inbox. Enter it to activate your account and start your UGC NET journey.
                    </Typography>
                </motion.div>
            </Box>

            {/* Right verify form */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: { xs: 3, sm: 5, md: 7 }, position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: 0, right: 0, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(COLORS.accent, 0.06)} 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} style={{ width: '100%', maxWidth: 430 }}>
                    <IconButton onClick={onBack} sx={{ mb: 3, color: COLORS.textLight, bgcolor: '#f8fafc', border: `1.5px solid ${COLORS.border}`, borderRadius: '12px', '&:hover': { bgcolor: '#f1f5f9', color: COLORS.primary } }}>
                        <ChevronLeft size={20} />
                    </IconButton>

                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2, px: 2, py: 0.6, borderRadius: '99px', bgcolor: alpha(COLORS.accent, 0.08), border: `1px solid ${alpha(COLORS.accent, 0.2)}` }}>
                        <ShieldCheck size={13} color={COLORS.accent} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.accent, letterSpacing: 0.5 }}>EMAIL VERIFICATION</Typography>
                    </Box>

                    <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, mb: 0.5, letterSpacing: -0.8 }}>
                        Verify Your Email
                    </Typography>
                    <Typography sx={{ color: COLORS.textLight, fontSize: '0.92rem', mb: 4, lineHeight: 1.6 }}>
                        We've sent a 6-digit OTP to <Box component="span" sx={{ color: COLORS.primary, fontWeight: 700 }}>{email}</Box>.
                    </Typography>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <Alert severity="error" sx={{ mb: 3, borderRadius: '14px', fontSize: '0.875rem' }}>{error}</Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={onVerify}>
                        <TextField
                            fullWidth
                            label={`Enter ${digits}-digit OTP`}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            required
                            inputProps={{ style: { textAlign: 'center', letterSpacing: '0.6em', fontSize: '1.6rem', fontWeight: 800, padding: '20px 16px' } }}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '16px',
                                    '& fieldset': { borderColor: COLORS.border, borderWidth: '1.5px' },
                                    '&.Mui-focused fieldset': { borderColor: COLORS.accent, borderWidth: '2px' },
                                    '&.Mui-focused': { boxShadow: `0 0 0 4px ${alpha(COLORS.accent, 0.08)}` },
                                },
                                '& .MuiInputLabel-root.Mui-focused': { color: COLORS.accent },
                            }}
                        />

                        {/* OTP dot indicators */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
                            {[...Array(digits)].map((_, i) => (
                                <Box key={i} sx={{
                                    width: 10, height: 10, borderRadius: '50%',
                                    bgcolor: i < otp.length ? COLORS.accent : COLORS.border,
                                    transition: 'background-color 0.2s',
                                }} />
                            ))}
                        </Box>

                        <Button
                            fullWidth type="submit" variant="contained" size="large"
                            disabled={loading || otp.length < 6}
                            endIcon={loading ? null : <ArrowRight size={18} />}
                            sx={{
                                py: 1.85, borderRadius: '16px',
                                background: `linear-gradient(135deg, ${COLORS.accent} 0%, #9d174d 100%)`,
                                fontWeight: 800, fontSize: '1rem', textTransform: 'none',
                                boxShadow: `0 8px 24px ${alpha(COLORS.accent, 0.38)}`,
                                transition: 'all 0.3s',
                                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 12px 30px ${alpha(COLORS.accent, 0.5)}` },
                                '&:disabled': { opacity: 0.6 }
                            }}
                        >
                            {loading ? <CircularProgress size={22} color="inherit" /> : 'Verify & Activate Account'}
                        </Button>
                    </form>
                </motion.div>
            </Box>
        </Box>
    );
};

/* ═══════════════════════════════════════════════════════════ */
/*  Main Sign-Up Component                                     */
/* ═══════════════════════════════════════════════════════════ */
const StudentSignUp = () => {
    const navigate = useNavigate();
    const { signup, verifyOtp } = useSession();

    const [step, setStep] = useState('register');
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [signupDataBlob, setSignupDataBlob] = useState(null);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focused, setFocused] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(newOtp);

            const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            await axios.post(`${backendUrl}/send-otp`, {
                email: formData.email?.trim(),
                name: formData.name,
                otp: newOtp
            });

            const res = await signup({
                email: formData.email,
                password: formData.password,
                full_name: formData.name,
                phone: formData.phone,
                otp: newOtp
            });

            if (res.signupData) setSignupDataBlob(res.signupData);
            setStep('verify');
        } catch (error) {
            setError(error.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await verifyOtp(formData.email, otp, signupDataBlob);
            navigate('/academic/mocktest');
        } catch (error) {
            setError(error.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'verify') {
        return (
            <VerifyStep
                email={formData.email}
                otp={otp}
                setOtp={setOtp}
                error={error}
                loading={loading}
                onVerify={handleVerify}
                onBack={() => { setStep('register'); setError(''); }}
            />
        );
    }

    const iSx = (name) => buildInputSx(focused, name, COLORS.accent, COLORS.border);

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif", bgcolor: '#fff' }}>

            {/* ─── Left Branded Panel ─── */}
            <Box sx={{
                display: { xs: 'none', md: 'flex' },
                width: '46%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                background: 'linear-gradient(150deg, #0f172a 0%, #1e1b4b 45%, #4c0519 100%)',
                p: 6, position: 'relative', overflow: 'hidden',
            }}>
                <Blob style={{ width: 400, height: 400, bgcolor: '#ca0056', top: '-100px', left: '-100px' }} />
                <Blob style={{ width: 320, height: 320, bgcolor: '#6d28d9', bottom: '-80px', right: '-80px' }} />
                <Blob style={{ width: 200, height: 200, bgcolor: '#0ea5e9', top: '45%', left: '55%' }} />
                <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

                <motion.div
                    initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, ease: 'easeOut' }}
                    style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 390 }}
                >
                    <Box component="img" src="/logos/new-logo.jpeg" alt="Psy-Q"
                        onClick={() => navigate('/')}
                        sx={{ height: 50, mb: 5, cursor: 'pointer', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                    />

                    <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.5, borderRadius: '99px', bgcolor: 'rgba(249,168,212,0.12)', border: '1px solid rgba(249,168,212,0.25)', mb: 2 }}>
                            <Sparkles size={13} color="#f9a8d4" />
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#f9a8d4', letterSpacing: 1 }}>JOIN FOR FREE</Typography>
                        </Box>
                    </Box>

                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff', lineHeight: 1.15, mb: 2, letterSpacing: -1.5 }}>
                        Start Your<br />
                        <Box component="span" sx={{ background: 'linear-gradient(90deg, #f9a8d4, #fb7185)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Success Story
                        </Box>
                    </Typography>
                    <Typography sx={{ color: alpha('#fff', 0.6), mb: 5, lineHeight: 1.75, fontSize: '0.95rem' }}>
                        join with thousands of students
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {perks.map(({ icon: Icon, text, sub }, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 + i * 0.1, duration: 0.5 }}
                            >
                                <Box sx={{
                                    display: 'flex', alignItems: 'center', gap: 2,
                                    p: 1.5, borderRadius: '14px',
                                    bgcolor: COLORS.glass, backdropFilter: 'blur(6px)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    transition: 'all 0.25s',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', transform: 'translateX(4px)' }
                                }}>
                                    <Box sx={{
                                        p: 1.2, borderRadius: '10px',
                                        background: 'linear-gradient(135deg, rgba(202,0,86,0.5), rgba(168,0,63,0.5))',
                                        color: '#fda4af', display: 'flex', flexShrink: 0,
                                    }}>
                                        <Icon size={17} strokeWidth={2.5} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.2 }}>{text}</Typography>
                                        <Typography sx={{ color: alpha('#fff', 0.45), fontSize: '0.75rem', mt: 0.2 }}>{sub}</Typography>
                                    </Box>
                                </Box>
                            </motion.div>
                        ))}
                    </Box>
                </motion.div>
            </Box>

            {/* ─── Right Form Panel ─── */}
            <Box sx={{
                flex: 1, display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                bgcolor: '#ffffff',
                p: { xs: 3, sm: 4, md: 6 },
                overflowY: 'auto', position: 'relative',
            }}>
                <Box sx={{ position: 'absolute', top: 0, right: 0, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(COLORS.accent, 0.06)} 0%, transparent 70%)`, pointerEvents: 'none' }} />

                <motion.div
                    initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    style={{ width: '100%', maxWidth: 440, position: 'relative' }}
                >
                    {/* Mobile logo */}
                    <Box component="img" src="/logos/new-logo.jpeg" alt="Psy-Q"
                        onClick={() => navigate('/')}
                        sx={{ display: { xs: 'block', md: 'none' }, height: 44, mb: 3, cursor: 'pointer', borderRadius: 1.5 }}
                    />

                    {/* Heading */}
                    <Box sx={{ mb: 3.5 }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 1.5, px: 2, py: 0.6, borderRadius: '99px', bgcolor: alpha(COLORS.accent, 0.08), border: `1px solid ${alpha(COLORS.accent, 0.2)}` }}>
                            <Zap size={13} color={COLORS.accent} />
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.accent, letterSpacing: 0.5 }}>CREATE ACCOUNT</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, mb: 0.5, letterSpacing: -0.8, lineHeight: 1.2 }}>
                            Join Psy-Q Today 🎓
                        </Typography>
                        <Typography sx={{ color: COLORS.textLight, fontSize: '0.92rem', fontWeight: 500 }}>
                            Your UGC NET success journey starts here.
                        </Typography>
                    </Box>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0 }}>
                                <Alert severity="error" sx={{ mb: 3, borderRadius: '14px', fontSize: '0.875rem' }}>{error}</Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleRegister}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>

                            <TextField fullWidth label="Full Name" name="name" value={formData.name}
                                onChange={handleChange} onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                                required sx={iSx('name')}
                                InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} color={focused === 'name' ? COLORS.accent : COLORS.textLight} /></InputAdornment> }}
                            />

                            <TextField fullWidth label="Email Address" name="email" type="email" value={formData.email}
                                onChange={handleChange} onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                                required sx={iSx('email')}
                                InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} color={focused === 'email' ? COLORS.accent : COLORS.textLight} /></InputAdornment> }}
                            />

                            <TextField fullWidth label="Phone Number" name="phone" value={formData.phone}
                                onChange={handleChange} onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
                                required sx={iSx('phone')}
                                InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={18} color={focused === 'phone' ? COLORS.accent : COLORS.textLight} /></InputAdornment> }}
                            />

                            {/* Password inputs side by side on wider screens */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.2 }}>
                                <TextField fullWidth label="Password" name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password} onChange={handleChange}
                                    onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                                    required sx={iSx('password')}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><Lock size={18} color={focused === 'password' ? COLORS.accent : COLORS.textLight} /></InputAdornment>,
                                        endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: COLORS.textLight }}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</IconButton></InputAdornment>
                                    }}
                                />
                                <TextField fullWidth label="Confirm Password" name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword} onChange={handleChange}
                                    onFocus={() => setFocused('confirm')} onBlur={() => setFocused('')}
                                    required sx={iSx('confirm')}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><Lock size={18} color={focused === 'confirm' ? COLORS.accent : COLORS.textLight} /></InputAdornment>,
                                        endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small" sx={{ color: COLORS.textLight }}>{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</IconButton></InputAdornment>
                                    }}
                                />
                            </Box>

                            {/* Password strength bar */}
                            {formData.password && (
                                <Box sx={{ mt: -1 }}>
                                    <Box sx={{ display: 'flex', gap: 0.75 }}>
                                        {[1, 2, 3, 4].map((level) => {
                                            const strength = formData.password.length >= 10 ? 4 : formData.password.length >= 8 ? 3 : formData.password.length >= 6 ? 2 : 1;
                                            return (
                                                <Box key={level} sx={{
                                                    flex: 1, height: 4, borderRadius: '99px',
                                                    bgcolor: level <= strength
                                                        ? strength <= 1 ? '#ef4444' : strength === 2 ? '#f97316' : strength === 3 ? '#eab308' : '#22c55e'
                                                        : '#e2e8f0',
                                                    transition: 'background-color 0.3s'
                                                }} />
                                            );
                                        })}
                                    </Box>
                                    <Typography sx={{ fontSize: '0.72rem', color: COLORS.textLight, mt: 0.5 }}>
                                        {formData.password.length < 6 ? 'Too short' : formData.password.length < 8 ? 'Weak' : formData.password.length < 10 ? 'Good' : 'Strong'} password
                                    </Typography>
                                </Box>
                            )}

                            <Button
                                fullWidth type="submit" variant="contained" size="large"
                                disabled={loading}
                                endIcon={loading ? null : <ArrowRight size={18} />}
                                sx={{
                                    py: 1.85, borderRadius: '16px',
                                    background: `linear-gradient(135deg, ${COLORS.accent} 0%, #9d174d 100%)`,
                                    fontWeight: 800, fontSize: '1rem', textTransform: 'none', letterSpacing: 0.3,
                                    boxShadow: `0 8px 24px ${alpha(COLORS.accent, 0.38)}`,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        background: `linear-gradient(135deg, ${COLORS.accentHover} 0%, #7c1342 100%)`,
                                        boxShadow: `0 12px 30px ${alpha(COLORS.accent, 0.5)}`,
                                        transform: 'translateY(-2px)',
                                    },
                                    '&:disabled': { opacity: 0.7 }
                                }}
                            >
                                {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Free Account'}
                            </Button>
                        </Box>
                    </form>

                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography sx={{ color: COLORS.textLight, fontSize: '0.88rem' }}>
                            Already have an account?{' '}
                            <Link component={RouterLink} to="/student/signin"
                                sx={{ color: COLORS.accent, fontWeight: 800, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                Sign In
                            </Link>
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: alpha(COLORS.textLight, 0.7), mt: 1.5 }}>
                            By creating an account, you agree to our{' '}
                            <Link component={RouterLink} to="/policies" sx={{ color: COLORS.accent, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                Terms & Privacy Policy
                            </Link>
                        </Typography>
                    </Box>
                </motion.div>
            </Box>
        </Box>
    );
};

export default StudentSignUp;
