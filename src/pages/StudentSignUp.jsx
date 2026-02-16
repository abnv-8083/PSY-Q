import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
    Box,
    Container,
    TextField,
    Button,
    Typography,
    Paper,
    InputAdornment,
    IconButton,
    Alert,
    Link,
    Avatar,
    alpha,
    Grid
} from '@mui/material';
import { Mail, Lock, School, Eye, EyeOff, User, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Constants (Matching MockTestHome) ---
const COLORS = {
    primary: '#1e293b',
    secondary: '#4b5563',
    accent: '#ca0056',
    accentHover: '#b8003f',
    background: '#fdf2f8',
    cardBg: '#FFFFFF',
    textLight: '#64748b',
    border: '#e2e8f0',
    success: '#10b981'
};

const FONTS = {
    primary: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
};

const StudentSignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

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
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                        phone: formData.phone,
                        role: 'student'
                    },
                    emailRedirectTo: `${window.location.origin}/student/signin`
                }
            });

            if (signUpError) throw signUpError;

            if (data.user) {
                const { error: studentError } = await supabase
                    .from('students')
                    .insert([
                        {
                            id: data.user.id,
                            full_name: formData.name,
                            email: formData.email,
                            phone: formData.phone
                        }
                    ]);

                if (studentError && !studentError.message.includes('duplicate')) {
                    throw studentError;
                }
            }

            setSuccess(true);
            setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
        } catch (error) {
            setError(error.message || 'Failed to create student account');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    background: `linear-gradient(135deg, ${COLORS.background} 0%, #FFFFFF 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4
                }}
            >
                <Container maxWidth="sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                p: 5,
                                borderRadius: 6,
                                textAlign: 'center',
                                border: `1px solid ${COLORS.border}`,
                                boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 100,
                                    height: 100,
                                    margin: '0 auto 24px',
                                    bgcolor: alpha(COLORS.success, 0.1),
                                    color: COLORS.success,
                                    boxShadow: `0 12px 24px ${alpha(COLORS.success, 0.2)}`
                                }}
                            >
                                <CheckCircle size={50} />
                            </Avatar>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, mb: 2, letterSpacing: '-0.02em' }}>
                                Registration Successful!
                            </Typography>
                            <Typography variant="body1" sx={{ color: COLORS.textLight, mb: 4, fontWeight: 500, lineHeight: 1.6 }}>
                                We've sent a verification email to your address. Please confirm your email to start practicing.
                            </Typography>
                            <Button
                                component={RouterLink}
                                to="/student/signin"
                                variant="contained"
                                size="large"
                                fullWidth
                                sx={{
                                    py: 1.5,
                                    borderRadius: 3,
                                    bgcolor: COLORS.accent,
                                    fontWeight: 800,
                                    '&:hover': { bgcolor: COLORS.accentHover }
                                }}
                            >
                                Go to Sign In
                            </Button>
                        </Paper>
                    </motion.div>
                </Container>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${COLORS.background} 0%, #FFFFFF 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONTS.primary,
                py: { xs: 4, md: 8 }
            }}
        >
            <Container maxWidth="sm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 5 },
                            borderRadius: 6,
                            bgcolor: 'white',
                            border: `1px solid ${COLORS.border}`,
                            boxShadow: '0 25px 50px rgba(0,0,0,0.08)' // Enhanced shadow
                        }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                            >
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        margin: '0 auto 20px',
                                        background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentHover} 100%)`,
                                        boxShadow: `0 8px 24px ${alpha(COLORS.accent, 0.4)}`
                                    }}
                                >
                                    <School size={40} color="white" />
                                </Avatar>
                            </motion.div>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1, letterSpacing: '-0.02em' }}>
                                Create Account
                            </Typography>
                            <Typography variant="body1" sx={{ color: COLORS.textLight, fontWeight: 500, fontSize: '1.05rem' }}>
                                Join our community and start excelling today.
                            </Typography>
                        </Box>

                        {error && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 3,
                                        borderRadius: 2,
                                        '& .MuiAlert-message': { fontWeight: 500 }
                                    }}
                                >
                                    {error}
                                </Alert>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    placeholder="John Doe"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            bgcolor: '#f8fafc',
                                            '& fieldset': { border: `1px solid ${COLORS.border}` },
                                            '&:hover fieldset': { borderColor: COLORS.accent },
                                            '&.Mui-focused fieldset': { borderColor: COLORS.accent },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': { color: COLORS.accent }
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <User size={20} color={COLORS.textLight} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    placeholder="you@example.com"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            bgcolor: '#f8fafc',
                                            '& fieldset': { border: `1px solid ${COLORS.border}` },
                                            '&:hover fieldset': { borderColor: COLORS.accent },
                                            '&.Mui-focused fieldset': { borderColor: COLORS.accent },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': { color: COLORS.accent }
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Mail size={20} color={COLORS.textLight} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    placeholder="+1 (555) 000-0000"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            bgcolor: '#f8fafc',
                                            '& fieldset': { border: `1px solid ${COLORS.border}` },
                                            '&:hover fieldset': { borderColor: COLORS.accent },
                                            '&.Mui-focused fieldset': { borderColor: COLORS.accent },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': { color: COLORS.accent }
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Phone size={20} color={COLORS.textLight} />
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
                                    required
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            bgcolor: '#f8fafc',
                                            '& fieldset': { border: `1px solid ${COLORS.border}` },
                                            '&:hover fieldset': { borderColor: COLORS.accent },
                                            '&.Mui-focused fieldset': { borderColor: COLORS.accent },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': { color: COLORS.accent }
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock size={20} color={COLORS.textLight} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            bgcolor: '#f8fafc',
                                            '& fieldset': { border: `1px solid ${COLORS.border}` },
                                            '&:hover fieldset': { borderColor: COLORS.accent },
                                            '&.Mui-focused fieldset': { borderColor: COLORS.accent },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': { color: COLORS.accent }
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock size={20} color={COLORS.textLight} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    endIcon={!loading && <ArrowRight size={20} />}
                                    sx={{
                                        mt: 1,
                                        py: 1.8,
                                        borderRadius: 3,
                                        background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentHover} 100%)`,
                                        fontWeight: 800,
                                        fontSize: '1rem',
                                        textTransform: 'none',
                                        boxShadow: `0 10px 20px ${alpha(COLORS.accent, 0.25)}`,
                                        '&:hover': {
                                            background: `linear-gradient(135deg, ${COLORS.accentHover} 0%, #9f0035 100%)`,
                                            boxShadow: `0 15px 30px ${alpha(COLORS.accent, 0.35)}`,
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    {loading ? 'Creating Account...' : 'Sign Up Now'}
                                </Button>
                            </Box>
                        </form>

                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 500 }}>
                                Already have an account?{' '}
                                <Link
                                    component={RouterLink}
                                    to="/student/signin"
                                    sx={{
                                        color: COLORS.accent,
                                        fontWeight: 800,
                                        textDecoration: 'none',
                                        ml: 0.5,
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    Sign In
                                </Link>
                            </Typography>
                        </Box>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default StudentSignUp;
