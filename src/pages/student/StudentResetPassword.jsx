import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
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
    Avatar,
    alpha,
    CircularProgress
} from '@mui/material';
import { Lock, Eye, EyeOff, CheckCircle2, KeyRound, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from '../../contexts/SessionContext';

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

const StudentResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { resetPassword } = useSession();

    const token = searchParams.get('token');
    let emailParam = searchParams.get('email');

    // Fallback: decode email from JWT payload if missing in URL query parameters
    if (!emailParam && token) {
        try {
            const base64Url = token.split('.')[1];
            if (base64Url) {
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );
                const payload = JSON.parse(jsonPayload);
                if (payload && payload.email) {
                    emailParam = payload.email;
                }
            }
        } catch (err) {
            console.warn('Failed to parse token payload for email fallback:', err);
        }
    }

    const email = emailParam;

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing password reset link. Please request a new link.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!token) {
            setError('Missing reset token. Please request a new reset link.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email, token, formData.password);
            setSuccess(true);
            setTimeout(() => {
                navigate('/student/signin');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${COLORS.background} 0%, #FFFFFF 100%)`,
                    fontFamily: FONTS.primary,
                    py: 4
                }}
            >
                <Container maxWidth="sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 4, md: 6 },
                                textAlign: 'center',
                                borderRadius: 6,
                                bgcolor: 'white',
                                border: `1px solid ${COLORS.border}`,
                                boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    margin: '0 auto 24px',
                                    bgcolor: alpha(COLORS.success, 0.1),
                                    color: COLORS.success
                                }}
                            >
                                <CheckCircle2 size={44} />
                            </Avatar>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1.5 }}>
                                Password Reset Successfully!
                            </Typography>
                            <Typography variant="body1" sx={{ color: COLORS.textLight, fontWeight: 500, mb: 4 }}>
                                Your password has been updated. Redirecting you to login in a few seconds...
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                <CircularProgress size={28} sx={{ color: COLORS.accent }} />
                            </Box>
                            <Button
                                component={RouterLink}
                                to="/student/signin"
                                variant="contained"
                                endIcon={<ArrowRight size={18} />}
                                sx={{
                                    py: 1.5,
                                    px: 4,
                                    borderRadius: 3,
                                    bgcolor: COLORS.accent,
                                    fontWeight: 700,
                                    textTransform: 'none',
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
                py: 4
            }}
        >
            <Container maxWidth="sm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
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
                                <KeyRound size={40} color="white" />
                            </Avatar>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1 }}>
                                Reset Your Password
                            </Typography>
                            <Typography variant="body1" sx={{ color: COLORS.textLight, fontWeight: 500 }}>
                                Enter a new secure password for your student account.
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
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    fullWidth
                                    label="New Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label="Confirm New Password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                                                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading || !token}
                                    sx={{
                                        py: 1.8,
                                        borderRadius: 3,
                                        bgcolor: COLORS.accent,
                                        fontWeight: 800,
                                        fontSize: '1rem',
                                        textTransform: 'none',
                                        boxShadow: `0 8px 20px ${alpha(COLORS.accent, 0.3)}`,
                                        '&:hover': {
                                            bgcolor: COLORS.accentHover,
                                            boxShadow: `0 12px 24px ${alpha(COLORS.accent, 0.4)}`
                                        }
                                    }}
                                >
                                    {loading ? 'Updating Password...' : 'Reset Password'}
                                </Button>

                                <Box sx={{ textAlign: 'center', mt: 1 }}>
                                    <Typography variant="body2" sx={{ color: COLORS.textLight }}>
                                        Need a new link?{' '}
                                        <RouterLink
                                            to="/student/forgot-password"
                                            style={{ color: COLORS.accent, fontWeight: 600, textDecoration: 'none' }}
                                        >
                                            Request Forgot Password
                                        </RouterLink>
                                    </Typography>
                                </Box>
                            </Box>
                        </form>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default StudentResetPassword;
