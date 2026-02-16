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
    alpha
} from '@mui/material';
import { Mail, Lock, ShieldCheck, Eye, EyeOff, ArrowRight } from 'lucide-react';
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

const SignIn = () => {
    const navigate = useNavigate();
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
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });

            if (error) throw error;

            // Check if user exists in admins table
            const { data: admin } = await supabase
                .from('admins')
                .select('id')
                .eq('id', data.user.id)
                .single();

            if (admin) {
                navigate('/admin');
            } else {
                setError('Access denied. Admin credentials required.');
                await supabase.auth.signOut();
            }
        } catch (error) {
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
                                        background: `linear-gradient(135deg, ${alpha(COLORS.primary, 0.9)} 0%, ${COLORS.primary} 100%)`,
                                        boxShadow: `0 8px 16px ${alpha(COLORS.primary, 0.2)}`
                                    }}
                                >
                                    <ShieldCheck size={40} color="white" />
                                </Avatar>
                            </motion.div>

                            <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1 }}>
                                Admin Portal
                            </Typography>
                            <Typography variant="body1" sx={{ color: COLORS.textLight, fontWeight: 500 }}>
                                Unauthorized access is strictly prohibited.
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
                                    {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default SignIn;
