import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSession } from '../../contexts/SessionContext';
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
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, BarChart2, Users, Settings, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = {
    primary: '#0f172a',
    accent: '#1d4ed8',
    accentHover: '#1e40af',
    textLight: '#64748b',
    border: '#e2e8f0',
    glass: 'rgba(255,255,255,0.07)',
};

const adminFeatures = [
    { icon: BarChart2, text: 'Analytics Dashboard', sub: 'Real-time platform metrics' },
    { icon: Users, text: 'Student Management', sub: 'Manage enrollments & profiles' },
    { icon: ShieldCheck, text: 'Bundle & Test Control', sub: 'Create and publish tests' },
    { icon: Settings, text: 'Platform Settings', sub: 'Full system configuration' },
];

const Blob = ({ style }) => (
    <Box sx={{ position: 'absolute', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.22, pointerEvents: 'none', ...style }} />
);

const AdminSignIn = () => {
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
            await login(formData.email, formData.password, 'admin');
            navigate('/admin');
        } catch (err) {
            setError(err.message || 'Failed to sign in. Please check your credentials.');
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
            <Box sx={{
                display: { xs: 'none', md: 'flex' },
                width: '46%',
                flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                background: 'linear-gradient(150deg, #0f172a 0%, #1e3a8a 55%, #1e1b4b 100%)',
                p: 6, position: 'relative', overflow: 'hidden',
            }}>
                <Blob style={{ width: 420, height: 420, bgcolor: '#1d4ed8', top: '-120px', left: '-120px' }} />
                <Blob style={{ width: 300, height: 300, bgcolor: '#6d28d9', bottom: '-80px', right: '-80px' }} />
                <Blob style={{ width: 180, height: 180, bgcolor: '#0ea5e9', top: '50%', left: '60%' }} />
                <Box sx={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }} />

                <motion.div
                    initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, ease: 'easeOut' }}
                    style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 390 }}
                >
                    <Box
                        component="img" src="/logos/new-logo.jpeg" alt="Psy-Q"
                        onClick={() => navigate('/')}
                        sx={{ height: 50, mb: 6, cursor: 'pointer', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                    />

                    {/* Admin badge */}
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.6, borderRadius: '99px', bgcolor: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', mb: 2.5 }}>
                        <ShieldCheck size={13} color="#93c5fd" />
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#93c5fd', letterSpacing: 1 }}>ADMIN ACCESS</Typography>
                    </Box>

                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff', lineHeight: 1.15, mb: 2, letterSpacing: -1.5 }}>
                        Manage Your<br />
                        <Box component="span" sx={{ background: 'linear-gradient(90deg, #93c5fd, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Platform
                        </Box>
                    </Typography>
                    <Typography sx={{ color: alpha('#fff', 0.6), mb: 5, lineHeight: 1.75, fontSize: '0.95rem' }}>
                        Access your administrative controls to manage students, content, and platform analytics.
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {adminFeatures.map(({ icon: Icon, text, sub }, i) => (
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
                                        background: 'linear-gradient(135deg, rgba(29,78,216,0.5), rgba(30,64,175,0.5))',
                                        color: '#93c5fd', display: 'flex', flexShrink: 0,
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
                p: { xs: 3, sm: 5, md: 7 },
                overflowY: 'auto', position: 'relative',
            }}>
                <Box sx={{
                    position: 'absolute', top: 0, right: 0,
                    width: 300, height: 300, borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(COLORS.accent, 0.06)} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                }} />

                <motion.div
                    initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    style={{ width: '100%', maxWidth: 430, position: 'relative' }}
                >
                    {/* Mobile logo */}
                    <Box component="img" src="/logos/new-logo.jpeg" alt="Psy-Q"
                        onClick={() => navigate('/')}
                        sx={{ display: { xs: 'block', md: 'none' }, height: 44, mb: 4, cursor: 'pointer', borderRadius: 1.5 }}
                    />

                    {/* Heading */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 1.5, px: 2, py: 0.6, borderRadius: '99px', bgcolor: alpha(COLORS.accent, 0.08), border: `1px solid ${alpha(COLORS.accent, 0.2)}` }}>
                            <Zap size={13} color={COLORS.accent} />
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.accent, letterSpacing: 0.5 }}>ADMIN PORTAL</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, mb: 0.5, letterSpacing: -0.8, lineHeight: 1.2 }}>
                            Administrator Sign In
                        </Typography>
                        <Typography sx={{ color: COLORS.textLight, fontSize: '0.92rem', fontWeight: 500 }}>
                            Restricted access — authorized personnel only.
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

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <TextField
                                fullWidth label="Admin Email" name="email" type="email"
                                value={formData.email} onChange={handleChange}
                                onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                                required sx={inputSx('email')}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Mail size={18} color={focused === 'email' ? COLORS.accent : COLORS.textLight} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth label="Password" name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password} onChange={handleChange}
                                onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                                required sx={inputSx('password')}
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

                            <Box sx={{ textAlign: 'right', mt: -1 }}>
                                <Link
                                    component={RouterLink} to="/admin/reset-password"
                                    sx={{ color: COLORS.accent, fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem', '&:hover': { textDecoration: 'underline' } }}
                                >
                                    Forgot Password?
                                </Link>
                            </Box>

                            <Button
                                fullWidth type="submit" variant="contained" size="large"
                                disabled={loading}
                                endIcon={loading ? null : <ArrowRight size={18} />}
                                sx={{
                                    py: 1.85, borderRadius: '16px',
                                    background: `linear-gradient(135deg, ${COLORS.accent} 0%, #1e40af 100%)`,
                                    fontWeight: 800, fontSize: '1rem', textTransform: 'none', letterSpacing: 0.3,
                                    boxShadow: `0 8px 24px ${alpha(COLORS.accent, 0.35)}`,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        background: `linear-gradient(135deg, ${COLORS.accentHover} 0%, #1e3a8a 100%)`,
                                        boxShadow: `0 12px 30px ${alpha(COLORS.accent, 0.48)}`,
                                        transform: 'translateY(-2px)',
                                    },
                                    '&:disabled': { opacity: 0.7 }
                                }}
                            >
                                {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In to Dashboard'}
                            </Button>
                        </Box>
                    </form>

                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: COLORS.textLight, mt: 4 }}>
                        This portal is restricted to authorized Psy-Q administrators.{' '}
                        <Link component={RouterLink} to="/" sx={{ color: COLORS.accent, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            Go to Homepage
                        </Link>
                    </Typography>
                </motion.div>
            </Box>
        </Box>
    );
};

export default AdminSignIn;
