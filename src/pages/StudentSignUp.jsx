import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
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
    alpha
} from '@mui/material';
import { Mail, Lock, School, Eye, EyeOff, User, Phone, CheckCircle, ArrowRight, KeyRound, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';

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
    const { signup, verifyOtp } = useSession();

    const [step, setStep] = useState('register'); // 'register' | 'verify'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [otp, setOtp] = useState('');


    const [error, setError] = useState('');
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
            // Generate 6-digit OTP
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(newOtp);

            // Send OTP via EmailJS
            const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
            const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_OTP_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
            const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;


            try {
                const toEmail = formData.email?.trim();
                if (!toEmail) throw new Error('Recipient email is empty');

                const templateParams = {
                    to_name: formData.name,
                    to_email: toEmail,
                    email: toEmail, // Alias for template compatibility
                    otp_code: newOtp,
                    app_name: 'PSY-Q'
                };

                if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
                    console.error('EmailJS Config Missing:', { SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY });
                    throw new Error('Email verification service is not configured.');
                }

                console.log('Sending email with params:', templateParams);

                await emailjs.send(
                    SERVICE_ID,
                    TEMPLATE_ID,
                    templateParams,
                    PUBLIC_KEY
                );

            } catch (emailErr) {
                console.error('EmailJS error:', emailErr);
                const detail = emailErr?.text || emailErr?.message || 'Check your EmailJS configuration.';
                throw new Error(`Failed to send verification email: ${detail}`);
            }


            await signup({
                email: formData.email,
                password: formData.password,
                full_name: formData.name,
                phone: formData.phone,
                otp: newOtp
            });


            // On success, show verification step
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
            console.log('Verifying OTP for:', formData.email, 'with code:', otp);
            await verifyOtp(formData.email, otp);

            // On success, redirect
            navigate('/academic/mocktest');

        } catch (error) {
            setError(error.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'verify') {
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
                                    width: 80,
                                    height: 80,
                                    margin: '0 auto 24px',
                                    bgcolor: alpha(COLORS.accent, 0.1),
                                    color: COLORS.accent,
                                }}
                            >
                                <KeyRound size={40} />
                            </Avatar>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, mb: 2 }}>
                                Verify Email
                            </Typography>
                            <Typography variant="body1" sx={{ color: COLORS.textLight, mb: 4 }}>
                                We've sent a 6-digit OTP to <b>{formData.email}</b>. Please enter it below.
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <form onSubmit={handleVerify}>
                                <TextField
                                    fullWidth
                                    label="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    variant="outlined"
                                    sx={{ mb: 3 }}
                                    inputProps={{ style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.5em' } }}
                                />
                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    sx={{
                                        py: 1.5,
                                        borderRadius: 3,
                                        bgcolor: COLORS.accent,
                                        fontWeight: 800,
                                        '&:hover': { bgcolor: COLORS.accentHover }
                                    }}
                                >
                                    {loading ? 'Verifying...' : 'Verify & Login'}
                                </Button>
                            </form>
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
            {/* Mobile Back Button */}
            <IconButton
                onClick={() => navigate(-1)}
                sx={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    display: { xs: 'flex', md: 'none' },
                    color: COLORS.primary,
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(4px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    '&:hover': { bgcolor: 'white' }
                }}
            >
                <ChevronLeft size={24} />
            </IconButton>

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
                            boxShadow: '0 25px 50px rgba(0,0,0,0.08)'
                        }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
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
                            <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1 }}>
                                Create Account
                            </Typography>
                            <Typography variant="body1" sx={{ color: COLORS.textLight, fontWeight: 500 }}>
                                Join our community and start excelling today.
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleRegister}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
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
                                    sx={{
                                        py: 1.8,
                                        borderRadius: 3,
                                        background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentHover} 100%)`,
                                        fontWeight: 800,
                                        fontSize: '1rem',
                                        textTransform: 'none',
                                        boxShadow: `0 10px 20px ${alpha(COLORS.accent, 0.25)}`,
                                        '&:hover': {
                                            background: `linear-gradient(135deg, ${COLORS.accentHover} 0%, #9f0035 100%)`
                                        }
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
                                        ml: 0.5
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
