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
    Divider
} from '@mui/material';
import { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, Target, Award, Brain, Zap, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = {
    primary: '#0f172a',
    accent: '#ca0056',
    accentHover: '#a8003f',
    accentLight: '#fdf2f8',
    textLight: '#64748b',
    border: '#e2e8f0',
    glass: 'rgba(255,255,255,0.07)',
};

const features = [
    { icon: Target, text: 'Curated UGC NET Mock Tests', sub: '5000+ topic-wise questions' },
    { icon: Brain, text: 'Practice tests visibility (selected, completed)', sub: 'Adaptive difficulty engine' },
    { icon: Award, text: 'Performance analytics', sub: 'Track your growth daily' },
    { icon: BookOpen, text: 'Expert Explanation', sub: 'Step-by-step explanations' },
];

const stats = [
    { value: '12+', label: 'PYQ' },
    { value: '97.5%', label: 'success rate' },
    { value: '100+', label: 'Mock Tests' },
];

/* ─── Floating Blob ─── */
const Blob = ({ style }) => (
    <Box
        sx={{
            position: 'absolute',
            borderRadius: '50%',
            filter: 'blur(60px)',
            opacity: 0.25,
            pointerEvents: 'none',
            ...style,
        }}
    />
);

const StudentSignIn = () => {
    const navigate = useNavigate();
    const { login } = useSession();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(formData.email, formData.password, 'student');
            const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/academic/mocktest/dashboard';
            sessionStorage.removeItem('redirectAfterLogin');
            navigate(redirectTo);
        } catch (error) {
            setError(error.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    const inputSx = (name) => ({
        '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            bgcolor: focused === name ? '#fff' : '#f8fafc',
            transition: 'all 0.25s ease',
            '& fieldset': { borderColor: focused === name ? COLORS.accent : COLORS.border, borderWidth: focused === name ? '2px' : '1.5px' },
            '&:hover fieldset': { borderColor: '#cbd5e1' },
            '&.Mui-focused fieldset': { borderColor: COLORS.accent, borderWidth: '2px' },
            '&.Mui-focused': { bgcolor: 'white', boxShadow: `0 0 0 4px ${alpha(COLORS.accent, 0.08)}` },
        },
        '& .MuiInputLabel-root.Mui-focused': { color: COLORS.accent },
        '& .MuiInputBase-input': { py: 1.6 },
    });

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif", bgcolor: '#fff' }}>

            {/* ─── Left Branded Panel ─── */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    width: '46%',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(150deg, #0f172a 0%, #1e1b4b 45%, #4c0519 100%)',
                    p: 6,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background blobs */}
                <Blob style={{ width: 400, height: 400, bgcolor: '#ca0056', top: '-100px', left: '-100px' }} />
                <Blob style={{ width: 320, height: 320, bgcolor: '#6d28d9', bottom: '-80px', right: '-80px' }} />
                <Blob style={{ width: 200, height: 200, bgcolor: '#0ea5e9', top: '45%', left: '55%' }} />

                {/* Subtle grid overlay */}
                <Box sx={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }} />

                <motion.div
                    initial={{ opacity: 0, y: 36 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, ease: 'easeOut' }}
                    style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 390 }}
                >
                    {/* Logo */}
                    <Box
                        component="img"
                        src="/logos/new-logo.jpeg"
                        alt="Psy-Q"
                        onClick={() => navigate('/')}
                        sx={{ height: 50, mb: 6, cursor: 'pointer', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                    />

                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff', lineHeight: 1.15, mb: 2, letterSpacing: -1.5 }}>
                        Ace Your<br />
                        <Box component="span" sx={{
                            background: 'linear-gradient(90deg, #f9a8d4, #fb7185)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>UGC NET</Box> Exam
                    </Typography>
                    <Typography sx={{ color: alpha('#fff', 0.6), mb: 5, lineHeight: 1.75, fontSize: '0.95rem' }}>
                        join with thousands of students
                    </Typography>

                    {/* Feature list */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 6 }}>
                        {features.map(({ icon: Icon, text, sub }, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -24 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 + i * 0.1, duration: 0.5 }}
                            >
                                <Box sx={{
                                    display: 'flex', alignItems: 'center', gap: 2,
                                    p: 1.5, borderRadius: '14px',
                                    bgcolor: COLORS.glass,
                                    backdropFilter: 'blur(6px)',
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

                    {/* Stats row */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {stats.map(({ value, label }, i) => (
                            <Box key={i} sx={{
                                flex: 1, textAlign: 'center', py: 1.5, px: 1,
                                borderRadius: '14px',
                                bgcolor: COLORS.glass,
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}>
                                <Typography sx={{ color: '#f9a8d4', fontWeight: 900, fontSize: '1.3rem', letterSpacing: -0.5 }}>{value}</Typography>
                                <Typography sx={{ color: alpha('#fff', 0.5), fontSize: '0.725rem', fontWeight: 600, mt: 0.3 }}>{label}</Typography>
                            </Box>
                        ))}
                    </Box>
                </motion.div>
            </Box>

            {/* ─── Right Form Panel ─── */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: '#ffffff',
                    p: { xs: 3, sm: 5, md: 7 },
                    overflowY: 'auto',
                    position: 'relative',
                }}
            >
                {/* Subtle background accent */}
                <Box sx={{
                    position: 'absolute', top: 0, right: 0,
                    width: 300, height: 300,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(COLORS.accent, 0.06)} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                }} />

                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    style={{ width: '100%', maxWidth: 430, position: 'relative' }}
                >
                    {/* Mobile logo */}
                    <Box
                        component="img"
                        src="/logos/new-logo.jpeg"
                        alt="Psy-Q"
                        onClick={() => navigate('/')}
                        sx={{ display: { xs: 'block', md: 'none' }, height: 44, mb: 4, cursor: 'pointer', borderRadius: 1.5 }}
                    />

                    {/* Heading */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 1.5, px: 2, py: 0.6, borderRadius: '99px', bgcolor: alpha(COLORS.accent, 0.08), border: `1px solid ${alpha(COLORS.accent, 0.2)}` }}>
                            <Zap size={13} color={COLORS.accent} />
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.accent, letterSpacing: 0.5 }}>STUDENT PORTAL</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, mb: 0.5, letterSpacing: -0.8, lineHeight: 1.2 }}>
                            Welcome back 👋
                        </Typography>
                        <Typography sx={{ color: COLORS.textLight, fontSize: '0.92rem', fontWeight: 500 }}>
                            Sign in to continue your preparation journey.
                        </Typography>
                    </Box>

                    {/* Error alert */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -8, height: 0 }}
                            >
                                <Alert severity="error" sx={{ mb: 3, borderRadius: '14px', fontSize: '0.875rem', alignItems: 'center' }}>
                                    {error}
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                onFocus={() => setFocused('email')}
                                onBlur={() => setFocused('')}
                                required
                                sx={inputSx('email')}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Mail size={18} color={focused === 'email' ? COLORS.accent : COLORS.textLight} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => setFocused('password')}
                                onBlur={() => setFocused('')}
                                required
                                sx={inputSx('password')}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock size={18} color={focused === 'password' ? COLORS.accent : COLORS.textLight} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: COLORS.textLight }}>
                                                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
                                <Link
                                    component={RouterLink}
                                    to="/student/forgot-password"
                                    sx={{ color: COLORS.accent, fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem', '&:hover': { textDecoration: 'underline' } }}
                                >
                                    Forgot Password?
                                </Link>
                            </Box>

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                endIcon={loading ? null : <ArrowRight size={18} />}
                                sx={{
                                    py: 1.85,
                                    borderRadius: '16px',
                                    background: `linear-gradient(135deg, ${COLORS.accent} 0%, #9d174d 100%)`,
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    letterSpacing: 0.3,
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
                                {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
                            </Button>
                        </Box>
                    </form>

                    <Divider sx={{ my: 3 }}>
                        <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700, px: 1.5, letterSpacing: 1 }}>
                            NEW HERE?
                        </Typography>
                    </Divider>

                    <Button
                        fullWidth
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/student/signup')}
                        startIcon={<TrendingUp size={18} />}
                        sx={{
                            py: 1.7,
                            borderRadius: '16px',
                            borderColor: COLORS.border,
                            borderWidth: '1.5px',
                            color: COLORS.primary,
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            textTransform: 'none',
                            transition: 'all 0.25s',
                            '&:hover': {
                                borderColor: COLORS.accent,
                                color: COLORS.accent,
                                bgcolor: alpha(COLORS.accent, 0.05),
                                borderWidth: '1.5px',
                                transform: 'translateY(-1px)',
                            }
                        }}
                    >
                        Create a Free Account
                    </Button>

                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: COLORS.textLight, mt: 3 }}>
                        By signing in, you agree to our{' '}
                        <Link component={RouterLink} to="/policies" sx={{ color: COLORS.accent, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            Terms & Privacy Policy
                        </Link>
                    </Typography>
                </motion.div>
            </Box>
        </Box>
    );
};

export default StudentSignIn;
