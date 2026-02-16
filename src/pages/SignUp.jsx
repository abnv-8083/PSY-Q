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
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Constants ---
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

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
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

    const handleSubmit = async (e) => {
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
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                        role: 'admin'
                    }
                }
            });

            if (signUpError) throw signUpError;

            if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: data.user.id,
                            full_name: formData.name,
                            email: formData.email,
                            role: 'admin'
                        }
                    ]);

                if (profileError) throw profileError;
            }

            navigate('/signin');
        } catch (error) {
            setError(error.message || 'Failed to create account');
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
                                    width: 70,
                                    height: 70,
                                    margin: '0 auto 20px',
                                    background: `linear-gradient(135deg, ${alpha(COLORS.primary, 0.9)} 0%, ${COLORS.primary} 100%)`,
                                    boxShadow: `0 8px 16px ${alpha(COLORS.primary, 0.2)}`
                                }}
                            >
                                <ShieldCheck size={35} color="white" />
                            </Avatar>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1 }}>
                                Admin Registration
                            </Typography>
                            <Typography variant="body1" sx={{ color: COLORS.textLight, fontWeight: 500 }}>
                                Set up your administrative access.
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2.5}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                                bgcolor: '#f8fafc',
                                                '& fieldset': { border: `1px solid ${COLORS.border}` },
                                                '&:hover fieldset': { borderColor: COLORS.primary },
                                                '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': { color: COLORS.primary }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <User size={20} color={COLORS.textLight} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                                bgcolor: '#f8fafc',
                                                '& fieldset': { border: `1px solid ${COLORS.border}` },
                                                '&:hover fieldset': { borderColor: COLORS.primary },
                                                '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': { color: COLORS.primary }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Mail size={20} color={COLORS.textLight} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                                bgcolor: '#f8fafc',
                                                '& fieldset': { border: `1px solid ${COLORS.border}` },
                                                '&:hover fieldset': { borderColor: COLORS.primary },
                                                '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': { color: COLORS.primary }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock size={20} color={COLORS.textLight} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                                bgcolor: '#f8fafc',
                                                '& fieldset': { border: `1px solid ${COLORS.border}` },
                                                '&:hover fieldset': { borderColor: COLORS.primary },
                                                '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': { color: COLORS.primary }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock size={20} color={COLORS.textLight} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
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
                                            bgcolor: COLORS.primary,
                                            fontWeight: 800,
                                            fontSize: '1rem',
                                            textTransform: 'none',
                                            boxShadow: `0 10px 20px ${alpha(COLORS.primary, 0.2)}`,
                                            '&:hover': {
                                                bgcolor: '#0f172a',
                                                boxShadow: `0 12px 24px ${alpha(COLORS.primary, 0.3)}`,
                                                transform: 'translateY(-2px)'
                                            },
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        {loading ? 'Creating Account...' : 'Sign Up As Admin'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>

                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 500 }}>
                                Already have an account?{' '}
                                <Link
                                    component={RouterLink}
                                    to="/signin"
                                    sx={{
                                        color: COLORS.primary,
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

export default SignUp;
