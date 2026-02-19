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
import { Mail, Lock, School, Eye, EyeOff, ArrowRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

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

const StudentSignIn = () => {
    const navigate = useNavigate();
    const { login } = useSession();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

        try {
            // Use custom login function from context
            await login(formData.email, formData.password, 'student');

            // Redirect to dashboard
            const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/academic/mocktest/tests';
            sessionStorage.removeItem('redirectAfterLogin');
            navigate(redirectTo);

        } catch (error) {
            // Display exact error message from Edge Function
            // e.g. "Create Account", "Invalid Password", "Email not verified"
            setError(error.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${COLORS.background} 0%, #FFFFFF 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONTS.primary,
                py: 4
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
                            boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
                        }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    margin: '0 auto 20px',
                                    background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentHover} 100%)`,
                                    boxShadow: `0 8px 16px ${alpha(COLORS.accent, 0.3)}`
                                }}
                            >
                                <School size={40} color="white" />
                            </Avatar>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1 }}>
                                User Login
                            </Typography>
                            <Typography variant="body1" sx={{ color: COLORS.textLight, fontWeight: 500 }}>
                                Welcome back! Continue your preparation.
                            </Typography>
                        </Box>

                        {error && (
                            <Alert
                                severity="error"
                                sx={{ mb: 3, borderRadius: 2 }}
                            >
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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

                                <Box sx={{ textAlign: 'right', mt: -1 }}>
                                    <Link
                                        component={RouterLink}
                                        to="/student/forgot-password"
                                        sx={{
                                            color: COLORS.accent,
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            '&:hover': { textDecoration: 'underline' }
                                        }}
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
                                    sx={{
                                        py: 1.8,
                                        borderRadius: 3,
                                        bgcolor: COLORS.accent,
                                        fontWeight: 800,
                                        fontSize: '1rem',
                                        textTransform: 'none',
                                        boxShadow: `0 10px 20px ${alpha(COLORS.accent, 0.2)}`,
                                        '&:hover': {
                                            bgcolor: COLORS.accentHover,
                                            boxShadow: `0 12px 24px ${alpha(COLORS.accent, 0.3)}`
                                        }
                                    }}
                                >
                                    {loading ? 'Logging in...' : 'Sign In Now'}
                                </Button>
                            </Box>
                        </form>

                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 500 }}>
                                Don't have an account?{' '}
                                <Link
                                    component={RouterLink}
                                    to="/student/signup"
                                    sx={{
                                        color: COLORS.accent,
                                        fontWeight: 800,
                                        textDecoration: 'none',
                                        ml: 0.5
                                    }}
                                >
                                    Create User Account
                                </Link>
                            </Typography>
                        </Box>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default StudentSignIn;
